import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  CampusLocation,
  Store,
  StoreProduct,
  MasterProduct,
  Category,
  Reservation,
  Review,
  Report,
  SearchLog,
  ActivityLog,
  ReservationItem
} from '../types';
import {
  CAMPUS_LOCATIONS,
  CATEGORIES,
  MASTER_PRODUCTS,
  STORES,
  STORE_PRODUCTS,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  INITIAL_REPORTS,
  INITIAL_SEARCH_LOGS,
  INITIAL_ACTIVITY_LOGS,
  USERS
} from '../data/seedData';
import { calculateHaversineDistance } from '../utils/geo';

export interface CartItem {
  storeProduct: StoreProduct;
  qty: number;
}

interface WarLokContextType {
  // Backend connection state
  isBackendConnected: boolean;
  refreshFromBackend: () => Promise<void>;

  // Current user & role
  currentUser: User;
  switchRole: (role: UserRole) => void;
  
  // Geolocation & Campus
  currentLocation: CampusLocation;
  campusList: CampusLocation[];
  setCustomLocation: (location: CampusLocation) => void;
  detectDeviceLocation: () => Promise<boolean>;
  selectedRadiusKm: number;
  setSelectedRadiusKm: (radius: number) => void;
  
  // Stores
  stores: Store[];
  nearbyStores: Store[];
  activeStoresCount: number;
  pendingStoresCount: number;
  verifyStore: (storeId: string, status: 'active' | 'rejected', note?: string) => void;
  registerNewStore: (storeData: Partial<Store>, documents?: { file_name: string; type: 'ktp' | 'foto_toko' | 'surat_usaha' }[]) => void;
  
  // Master Products & Categories
  categories: Category[];
  masterProducts: MasterProduct[];
  addMasterProduct: (product: Omit<MasterProduct, 'id'>) => void;
  updateMasterProduct: (id: string, updates: Partial<MasterProduct>) => void;
  
  // Store Products
  storeProducts: StoreProduct[];
  getProductsByStore: (storeId: string) => StoreProduct[];
  toggleProductAvailability: (productId: string) => void;
  updateStoreProductStock: (productId: string, newStock: number, price?: number) => void;
  addStoreProduct: (newProduct: Omit<StoreProduct, 'id' | 'votes_available' | 'votes_empty' | 'confidence_score' | 'is_doubtful'>) => void;
  voteStockAccuracy: (productId: string, vote: 'available' | 'empty') => void;
  getLowStockProducts: (storeId: string) => StoreProduct[];
  
  // Price Comparison
  compareProductPrices: (masterProductId: string) => {
    store: Store;
    product: StoreProduct;
    price: number;
    stock: number;
    distance_km: number;
  }[];
  
  // Cart & Reservations
  cartStoreId: string | null;
  cart: CartItem[];
  addToCart: (product: StoreProduct, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  
  // Reservations workflow
  reservations: Reservation[];
  createReservation: (note?: string, pickupEstimatedTime?: string) => { success: boolean; message: string; reservationCode?: string };
  acceptReservation: (reservationId: string) => void;
  rejectReservation: (reservationId: string, reason?: string) => void;
  completeReservation: (reservationId: string) => void;
  cancelReservation: (reservationId: string) => void;
  
  // Reviews & Reports
  reviews: Review[];
  addReview: (storeId: string, rating: number, comment: string) => void;
  reports: Report[];
  addReport: (storeId: string, type: Report['type'], description: string) => void;
  resolveReport: (reportId: string, adminNote: string) => void;
  
  // Analytics & Logs
  searchLogs: SearchLog[];
  logSearch: (keyword: string) => void;
  activityLogs: ActivityLog[];
  
  // Active selected store for modal
  selectedStoreId: string | null;
  setSelectedStoreId: (storeId: string | null) => void;
  
  // WarLok Pay / Saldo Koin Komunitas (Presentasi Mockup)
  walletBalance: number;
  topUpWallet: (amount: number) => void;
  deductWallet: (amount: number) => boolean;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

const WarLokContext = createContext<WarLokContextType | null>(null);

const STORAGE_KEY_PREFIX = 'warlok_app_state_v2_';
const API_BASE_URL =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/warlok')
    ? '/warlok/api'
    : 'http://localhost/warlok/api';

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

async function apiRequest<T = unknown>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown
): Promise<{ success: boolean; data: T | null; message?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const json = await response.json();
    return {
      success: Boolean(json?.success),
      data: json?.data ?? null,
      message: json?.message
    };
  } catch (err) {
    console.warn(`API call ${method} ${endpoint} failed (fallback to local state):`, err);
    return { success: false, data: null };
  }
}

export const WarLokProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Current user role
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredItem('currentUser', USERS[0]));
  
  // Campus & Location
  const [currentLocation, setCurrentLocation] = useState<CampusLocation>(() => 
    getStoredItem('currentLocation', CAMPUS_LOCATIONS[0])
  );
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(3); // default 3km
  
  // Core Entities with persistent storage fallback
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [stores, setStores] = useState<Store[]>(() => getStoredItem('stores', STORES));
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>(() => 
    getStoredItem('storeProducts', STORE_PRODUCTS)
  );
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>(() => 
    getStoredItem('masterProducts', MASTER_PRODUCTS)
  );
  const [reservations, setReservations] = useState<Reservation[]>(() => 
    getStoredItem('reservations', INITIAL_RESERVATIONS)
  );
  const [reviews, setReviews] = useState<Review[]>(() => getStoredItem('reviews', INITIAL_REVIEWS));
  const [reports, setReports] = useState<Report[]>(() => getStoredItem('reports', INITIAL_REPORTS));
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>(() => getStoredItem('searchLogs', INITIAL_SEARCH_LOGS));
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => 
    getStoredItem('activityLogs', INITIAL_ACTIVITY_LOGS)
  );

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => getStoredItem('cart', []));
  const [cartStoreId, setCartStoreId] = useState<string | null>(() => getStoredItem('cartStoreId', null));

  // WarLok Pay Currency Balance (Presentasi UI / Mockup)
  const [walletBalance, setWalletBalance] = useState<number>(() => getStoredItem('walletBalance', 50000));
  
  // Selected Store view modal
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  
  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Hydrate state from PHP + MySQL backend (/bootstrap)
  const refreshFromBackend = useCallback(async () => {
    const res = await apiRequest<{
      stores: Store[];
      store_products: StoreProduct[];
      master_products: MasterProduct[];
      categories: Category[];
      reservations: Reservation[];
      reviews: Review[];
      reports: Report[];
      search_logs: SearchLog[];
      activity_logs: ActivityLog[];
    }>('/bootstrap', 'GET');

    if (res.success && res.data) {
      setIsBackendConnected(true);
      if (Array.isArray(res.data.stores)) setStores(res.data.stores);
      if (Array.isArray(res.data.store_products)) setStoreProducts(res.data.store_products);
      if (Array.isArray(res.data.master_products)) setMasterProducts(res.data.master_products);
      if (Array.isArray(res.data.categories) && res.data.categories.length > 0) setCategories(res.data.categories);
      if (Array.isArray(res.data.reservations)) setReservations(res.data.reservations);
      if (Array.isArray(res.data.reviews)) setReviews(res.data.reviews);
      if (Array.isArray(res.data.reports)) setReports(res.data.reports);
      if (Array.isArray(res.data.search_logs)) setSearchLogs(res.data.search_logs);
      if (Array.isArray(res.data.activity_logs)) setActivityLogs(res.data.activity_logs);
    } else {
      setIsBackendConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  // Save changes to localStorage as cache
  useEffect(() => { setStoredItem('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { setStoredItem('currentLocation', currentLocation); }, [currentLocation]);
  useEffect(() => { setStoredItem('stores', stores); }, [stores]);
  useEffect(() => { setStoredItem('storeProducts', storeProducts); }, [storeProducts]);
  useEffect(() => { setStoredItem('masterProducts', masterProducts); }, [masterProducts]);
  useEffect(() => { setStoredItem('reservations', reservations); }, [reservations]);
  useEffect(() => { setStoredItem('reviews', reviews); }, [reviews]);
  useEffect(() => { setStoredItem('reports', reports); }, [reports]);
  useEffect(() => { setStoredItem('searchLogs', searchLogs); }, [searchLogs]);
  useEffect(() => { setStoredItem('activityLogs', activityLogs); }, [activityLogs]);
  useEffect(() => { setStoredItem('cart', cart); }, [cart]);
  useEffect(() => { setStoredItem('cartStoreId', cartStoreId); }, [cartStoreId]);
  useEffect(() => { setStoredItem('walletBalance', walletBalance); }, [walletBalance]);

  // Log activity helper
  const logActivity = useCallback((action: string, meta?: Record<string, unknown>) => {
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      action,
      meta,
      created_at: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 49)]);
    void apiRequest('/activity-logs', 'POST', {
      id: newLog.id,
      user_id: currentUser.id,
      action,
      meta
    });
  }, [currentUser]);

  // Role Switcher
  const switchRole = useCallback((role: UserRole) => {
    const targetUser = USERS.find(u => u.role === role) || {
      id: `usr_${role}_custom`,
      name: role === 'customer' ? 'Dimas Wicaksono (Mahasiswa)' : role === 'merchant' ? 'Pak Slamet (Pemilik Warung)' : 'Admin WarLok',
      email: `${role}@warlok.id`,
      role,
      phone: '0812-3456-7890'
    };
    setCurrentUser(targetUser);
    showToast(`Beralih ke mode: ${role.toUpperCase()}`);
  }, [showToast]);

  // Campus location setter
  const setCustomLocation = useCallback((loc: CampusLocation) => {
    setCurrentLocation(loc);
    showToast(`Lokasi diatur ke: ${loc.name}`);
  }, [showToast]);

  // Browser Geolocation + Auto Relocate Stores in Database to User's GPS
  const detectDeviceLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      showToast('Browser tidak mendukung geolokasi');
      return false;
    }
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lng = Number(pos.coords.longitude.toFixed(6));
          const detected: CampusLocation = {
            id: 'device_gps',
            name: 'Lokasi GPS Saya Saat Ini (Akurat)',
            campus: 'Geolokasi Akurat',
            city: 'Sekitar Anda',
            lat,
            lng,
            description: 'Terdeteksi otomatis via sensor perangkat'
          };
          setCurrentLocation(detected);

          // Pindahkan koordinat warung di database MySQL agar berada di sekitar titik GPS pengguna
          const reloc = await apiRequest<Store[]>('/stores/relocate', 'POST', { lat, lng });
          if (reloc.success && Array.isArray(reloc.data)) {
            setStores(reloc.data);
          }

          showToast(`GPS aktif (${lat}, ${lng}) — Lokasi warung telah disinkronkan ke sekitar Anda!`);
          resolve(true);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          showToast('Izin geolokasi browser ditolak. Menggunakan titik GPS perangkat (-6.9110, 107.6177).');
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }, [showToast]);

  // Calculate Haversine distance for active stores and filter by radius
  const nearbyStores = useMemo(() => {
    return stores
      .filter(s => s.status === 'active')
      .map(store => {
        const dist = calculateHaversineDistance(
          currentLocation.lat,
          currentLocation.lng,
          store.lat,
          store.lng
        );
        return {
          ...store,
          distance_km: dist
        };
      })
      .filter(store => selectedRadiusKm === 0 || (store.distance_km ?? 0) <= selectedRadiusKm)
      .sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0));
  }, [stores, currentLocation, selectedRadiusKm]);

  const activeStoresCount = useMemo(() => stores.filter(s => s.status === 'active').length, [stores]);
  const pendingStoresCount = useMemo(() => stores.filter(s => s.status === 'pending').length, [stores]);

  // Automatic Reservation Expiry Check (Plan Section 5.2)
  useEffect(() => {
    const checkExpiryInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      setReservations(prevReservations => {
        let hasChanges = false;
        const updated = prevReservations.map(res => {
          if ((res.status === 'pending' || res.status === 'accepted') && new Date(res.expires_at).getTime() < currentTime) {
            hasChanges = true;
            setStoreProducts(prevProducts => {
              return prevProducts.map(p => {
                const item = res.items.find(i => i.store_product_id === p.id);
                if (item) {
                  return { ...p, stock: p.stock + item.qty };
                }
                return p;
              });
            });
            return { ...res, status: 'expired' as const };
          }
          return res;
        });

        if (hasChanges) {
          logActivity('Sistem mengembalikan stok dari reservasi yang kedaluwarsa');
          return updated;
        }
        return prevReservations;
      });
    }, 15000);

    return () => clearInterval(checkExpiryInterval);
  }, [logActivity]);

  // Store verification by Admin
  const verifyStore = useCallback((storeId: string, status: 'active' | 'rejected', note?: string) => {
    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          status,
          verified_at: status === 'active' ? new Date().toISOString() : undefined,
          documents: s.documents?.map(doc => ({ ...doc, review_note: note || doc.review_note }))
        };
      }
      return s;
    }));
    void apiRequest(`/admin/stores/${storeId}/verify`, 'PATCH', { status, note });
    logActivity(`Admin mengubah status toko ${storeId} menjadi ${status}`, { note });
    showToast(`Toko berhasil di-${status === 'active' ? 'verifikasi (Aktif)' : 'tolak'}`);
  }, [logActivity, showToast]);

  // Merchant register new store
  const registerNewStore = useCallback((storeData: Partial<Store>, documents: { file_name: string; type: 'ktp' | 'foto_toko' | 'surat_usaha' }[] = []) => {
    const newStoreId = `str_${Date.now()}`;
    const newStore: Store = {
      id: newStoreId,
      owner_id: currentUser.id,
      owner_name: currentUser.name,
      name: storeData.name || 'Warung Baru',
      description: storeData.description || 'Warung kelontong terpercaya sekitar kos.',
      address: storeData.address || currentLocation.name,
      lat: storeData.lat || Number((currentLocation.lat + (Math.random() - 0.5) * 0.004).toFixed(6)),
      lng: storeData.lng || Number((currentLocation.lng + (Math.random() - 0.5) * 0.004).toFixed(6)),
      status: 'pending',
      phone: storeData.phone || currentUser.phone,
      opening_hours: storeData.opening_hours || '07.00 - 22.00 WIB',
      rating: 0,
      total_reviews: 0,
      documents: documents.map((doc, idx) => ({
        id: `doc_${Date.now()}_${idx}`,
        store_id: newStoreId,
        file_name: doc.file_name,
        file_url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
        type: doc.type,
        review_note: 'Dokumen diunggah oleh pemilik warung'
      }))
    };
    setStores(prev => [newStore, ...prev]);
    void apiRequest('/stores', 'POST', {
      ...newStore,
      documents: newStore.documents
    });
    logActivity(`Pemilik warung mendaftarkan toko baru: ${newStore.name}`);
    showToast('Toko berhasil diajukan! Menunggu verifikasi admin.');
  }, [currentUser, currentLocation, logActivity, showToast]);

  // Products helpers
  const getProductsByStore = useCallback((storeId: string) => {
    return storeProducts.filter(p => p.store_id === storeId);
  }, [storeProducts]);

  const toggleProductAvailability = useCallback((productId: string) => {
    setStoreProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.is_available;
        showToast(`${p.name} ditandai ${nextState ? 'Tersedia' : 'Kosong'}`);
        return { ...p, is_available: nextState };
      }
      return p;
    }));
    void apiRequest(`/store-products/${productId}/toggle`, 'PATCH');
  }, [showToast]);

  const updateStoreProductStock = useCallback((productId: string, newStock: number, price?: number) => {
    const safeStock = Math.max(0, newStock);
    setStoreProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: safeStock,
          price: price !== undefined ? price : p.price,
          is_available: safeStock > 0
        };
      }
      return p;
    }));
    void apiRequest(`/store-products/${productId}`, 'PUT', { stock: safeStock, price });
    showToast('Stok & harga berhasil diperbarui');
  }, [showToast]);

  const addStoreProduct = useCallback((newProduct: Omit<StoreProduct, 'id' | 'votes_available' | 'votes_empty' | 'confidence_score' | 'is_doubtful'>) => {
    const product: StoreProduct = {
      ...newProduct,
      id: `sp_${Date.now()}`,
      votes_available: 1,
      votes_empty: 0,
      confidence_score: 100,
      is_doubtful: false,
      last_voted_at: new Date().toISOString()
    };
    setStoreProducts(prev => [product, ...prev]);
    void apiRequest('/store-products', 'POST', product);
    showToast(`Produk ${product.name} berhasil ditambahkan ke inventaris`);
  }, [showToast]);

  const addMasterProduct = useCallback((prod: Omit<MasterProduct, 'id'>) => {
    const newMaster: MasterProduct = {
      ...prod,
      id: `mp_${Date.now()}`
    };
    setMasterProducts(prev => [...prev, newMaster]);
    void apiRequest('/master-products', 'POST', newMaster);
    showToast(`Master produk "${prod.name}" berhasil dibuat`);
  }, [showToast]);

  const updateMasterProduct = useCallback((id: string, updates: Partial<MasterProduct>) => {
    setMasterProducts(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    void apiRequest(`/master-products/${id}`, 'PUT', updates);
    showToast('Master produk diperbarui');
  }, [showToast]);

  // Community Stock Accuracy Voting (Section 5.5)
  const voteStockAccuracy = useCallback((productId: string, vote: 'available' | 'empty') => {
    setStoreProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newAvail = p.votes_available + (vote === 'available' ? 1 : 0);
        const newEmpty = p.votes_empty + (vote === 'empty' ? 1 : 0);
        const totalVotes = newAvail + newEmpty;
        const confidence = totalVotes > 0 ? Math.round((newAvail / totalVotes) * 100) : 100;
        const isDoubtful = newEmpty >= 3 && confidence < 50;

        return {
          ...p,
          votes_available: newAvail,
          votes_empty: newEmpty,
          confidence_score: confidence,
          is_doubtful: isDoubtful,
          last_voted_at: new Date().toISOString()
        };
      }
      return p;
    }));
    void apiRequest(`/store-products/${productId}/votes`, 'POST', {
      user_id: currentUser.id,
      vote
    });
    logActivity(`Pengguna memberikan voting stok: ${vote === 'available' ? 'Tersedia' : 'Habis/Kosong'}`, { productId });
    showToast(vote === 'available' ? 'Terima kasih telah mengonfirmasi stok ada!' : 'Terima kasih, laporan stok kosong dicatat untuk komunitas!');
  }, [currentUser.id, logActivity, showToast]);

  const getLowStockProducts = useCallback((storeId: string) => {
    return storeProducts.filter(p => p.store_id === storeId && p.stock <= p.low_stock_threshold);
  }, [storeProducts]);

  // Price Comparison Across Nearby Stores
  const compareProductPrices = useCallback((masterProductId: string) => {
    const results: {
      store: Store;
      product: StoreProduct;
      price: number;
      stock: number;
      distance_km: number;
    }[] = [];

    nearbyStores.forEach(store => {
      const product = storeProducts.find(
        p => p.store_id === store.id && p.master_product_id === masterProductId && p.is_available
      );
      if (product) {
        results.push({
          store,
          product,
          price: product.price,
          stock: product.stock,
          distance_km: store.distance_km ?? 0
        });
      }
    });

    return results.sort((a, b) => a.price - b.price);
  }, [nearbyStores, storeProducts]);

  // Cart Operations
  const addToCart = useCallback((product: StoreProduct, qty = 1) => {
    if (product.stock < qty || !product.is_available) {
      showToast('Stok tidak mencukupi atau barang sedang tidak tersedia');
      return;
    }

    if (cartStoreId && cartStoreId !== product.store_id) {
      if (!window.confirm('Keranjang Anda berisi produk dari toko lain. Kosongkan keranjang untuk memilih toko ini?')) {
        return;
      }
      setCart([{ storeProduct: product, qty }]);
      setCartStoreId(product.store_id);
      showToast(`1 ${product.name} dimasukkan ke keranjang`);
      return;
    }

    setCartStoreId(product.store_id);
    setCart(prev => {
      const existing = prev.find(item => item.storeProduct.id === product.id);
      if (existing) {
        const nextQty = existing.qty + qty;
        if (nextQty > product.stock) {
          showToast(`Stok maksimal tersedia: ${product.stock} ${product.unit}`);
          return prev;
        }
        return prev.map(item => item.storeProduct.id === product.id ? { ...item, qty: nextQty } : item);
      }
      return [...prev, { storeProduct: product, qty }];
    });
    showToast(`${product.name} ditambahkan ke keranjang`);
  }, [cartStoreId, showToast]);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const next = prev.filter(i => i.storeProduct.id !== productId);
      if (next.length === 0) setCartStoreId(null);
      return next;
    });
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.storeProduct.id === productId) {
        if (qty > item.storeProduct.stock) {
          showToast(`Stok hanya tersedia ${item.storeProduct.stock}`);
          return { ...item, qty: item.storeProduct.stock };
        }
        return { ...item, qty };
      }
      return item;
    }));
  }, [removeFromCart, showToast]);

  const clearCart = useCallback(() => {
    setCart([]);
    setCartStoreId(null);
  }, []);

  // Reservation Creation with Stock Holding (Section 5.2)
  const createReservation = useCallback((note?: string, pickupEstimatedTime = 'Dalam 1 jam'): { success: boolean; message: string; reservationCode?: string } => {
    if (cart.length === 0 || !cartStoreId) {
      return { success: false, message: 'Keranjang belanja kosong' };
    }

    const targetStore = stores.find(s => s.id === cartStoreId);
    if (!targetStore) {
      return { success: false, message: 'Toko tidak ditemukan' };
    }

    // Check stock availability in real-time
    for (const item of cart) {
      const currentProd = storeProducts.find(p => p.id === item.storeProduct.id);
      if (!currentProd || currentProd.stock < item.qty || !currentProd.is_available) {
        return {
          success: false,
          message: `Stok ${item.storeProduct.name} tidak mencukupi (Tersisa: ${currentProd?.stock ?? 0})`
        };
      }
    }

    const resId = `res_${Date.now()}`;
    const code = `WL-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = cart.reduce((sum, item) => sum + (item.storeProduct.price * item.qty), 0);
    const expiresAt = new Date(Date.now() + 90 * 60 * 1000).toISOString();

    const reservationItems: ReservationItem[] = cart.map(item => ({
      id: `ri_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reservation_id: resId,
      store_product_id: item.storeProduct.id,
      product_name: item.storeProduct.name,
      variant: item.storeProduct.variant,
      unit: item.storeProduct.unit,
      qty: item.qty,
      price_snapshot: item.storeProduct.price
    }));

    const newReservation: Reservation = {
      id: resId,
      code,
      customer_id: currentUser.id,
      customer_name: currentUser.name,
      customer_phone: currentUser.phone,
      store_id: targetStore.id,
      store_name: targetStore.name,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      note,
      total_amount: totalAmount,
      items: reservationItems,
      pickup_estimated_time: pickupEstimatedTime
    };

    // LOCK & DEDUCT STOCK IMMEDIATELY
    setStoreProducts(prev => prev.map(p => {
      const item = cart.find(ci => ci.storeProduct.id === p.id);
      if (item) {
        const nextStock = Math.max(0, p.stock - item.qty);
        return {
          ...p,
          stock: nextStock,
          is_available: nextStock > 0
        };
      }
      return p;
    }));

    setReservations(prev => [newReservation, ...prev]);

    // Persist transaction to PHP + MySQL backend (SELECT ... FOR UPDATE)
    void apiRequest('/reservations', 'POST', {
      id: resId,
      code,
      customer_id: currentUser.id,
      store_id: targetStore.id,
      note,
      pickup_estimated_time: pickupEstimatedTime,
      items: cart.map(item => ({
        store_product_id: item.storeProduct.id,
        qty: item.qty
      }))
    });

    clearCart();
    logActivity(`Customer membuat reservasi #${code} di ${targetStore.name}`, { code, totalAmount });
    showToast(`Reservasi #${code} berhasil dibuat! Stok barang telah dikunci.`);
    return { success: true, message: 'Reservasi berhasil dibuat', reservationCode: code };
  }, [cart, cartStoreId, stores, storeProducts, currentUser, clearCart, logActivity, showToast]);

  // Merchant Acceptance
  const acceptReservation = useCallback((reservationId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'accepted' };
      }
      return r;
    }));
    void apiRequest(`/reservations/${reservationId}/accept`, 'PATCH');
    logActivity(`Merchant menerima reservasi ${reservationId}`);
    showToast('Reservasi diterima! Silakan siapkan pesanan untuk diambil.');
  }, [logActivity, showToast]);

  // Merchant Rejection -> Restore Stock!
  const rejectReservation = useCallback((reservationId: string, reason?: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    setStoreProducts(prev => prev.map(p => {
      const item = res.items.find(i => i.store_product_id === p.id);
      if (item) {
        return { ...p, stock: p.stock + item.qty, is_available: true };
      }
      return p;
    }));

    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'rejected', note: reason ? `${r.note ? r.note + ' | ' : ''}Alasan ditolak: ${reason}` : r.note };
      }
      return r;
    }));

    void apiRequest(`/reservations/${reservationId}/reject`, 'PATCH', { reason });
    logActivity(`Merchant menolak reservasi #${res.code}`, { reason });
    showToast(`Reservasi #${res.code} ditolak. Stok telah dikembalikan ke inventaris toko.`);
  }, [reservations, logActivity, showToast]);

  // Complete / Picked up
  const completeReservation = useCallback((reservationId: string) => {
    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'picked_up' };
      }
      return r;
    }));
    void apiRequest(`/reservations/${reservationId}/complete`, 'PATCH');
    logActivity(`Reservasi ${reservationId} selesai diambil & dibayar`);
    showToast('Pesanan telah berhasil diambil & dibayar oleh pelanggan!');
  }, [logActivity, showToast]);

  // Customer Cancel -> Restore Stock!
  const cancelReservation = useCallback((reservationId: string) => {
    const res = reservations.find(r => r.id === reservationId);
    if (!res) return;

    if (res.status !== 'pending' && res.status !== 'accepted') {
      showToast('Pesanan tidak dapat dibatalkan');
      return;
    }

    setStoreProducts(prev => prev.map(p => {
      const item = res.items.find(i => i.store_product_id === p.id);
      if (item) {
        return { ...p, stock: p.stock + item.qty, is_available: true };
      }
      return p;
    }));

    setReservations(prev => prev.map(r => {
      if (r.id === reservationId) {
        return { ...r, status: 'cancelled' };
      }
      return r;
    }));

    void apiRequest(`/reservations/${reservationId}/cancel`, 'PATCH');
    logActivity(`Customer membatalkan reservasi #${res.code}`);
    showToast(`Reservasi #${res.code} dibatalkan. Stok barang telah dikembalikan.`);
  }, [reservations, logActivity, showToast]);

  // Reviews
  const addReview = useCallback((storeId: string, rating: number, comment: string) => {
    const newRev: Review = {
      id: `rev_${Date.now()}`,
      store_id: storeId,
      customer_id: currentUser.id,
      customer_name: currentUser.name,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    setReviews(prev => [newRev, ...prev]);

    setStores(prev => prev.map(s => {
      if (s.id === storeId) {
        const storeRevs = [...reviews.filter(r => r.store_id === storeId), newRev];
        const avg = storeRevs.reduce((acc, curr) => acc + curr.rating, 0) / storeRevs.length;
        return {
          ...s,
          rating: Number(avg.toFixed(1)),
          total_reviews: storeRevs.length
        };
      }
      return s;
    }));

    void apiRequest('/reviews', 'POST', {
      id: newRev.id,
      store_id: storeId,
      customer_id: currentUser.id,
      rating,
      comment
    });
    logActivity(`Customer memberikan review bintang ${rating} ke toko ${storeId}`);
    showToast('Terima kasih atas ulasan Anda!');
  }, [currentUser, reviews, logActivity, showToast]);

  // Reports
  const addReport = useCallback((storeId: string, type: Report['type'], description: string) => {
    const targetStore = stores.find(s => s.id === storeId);
    const newReport: Report = {
      id: `rep_${Date.now()}`,
      store_id: storeId,
      store_name: targetStore?.name || 'Toko',
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      type,
      description,
      status: 'open',
      created_at: new Date().toISOString()
    };
    setReports(prev => [newReport, ...prev]);
    void apiRequest('/reports', 'POST', {
      id: newReport.id,
      store_id: storeId,
      reporter_id: currentUser.id,
      type,
      description
    });
    logActivity(`Laporan baru diajukan untuk ${targetStore?.name}: ${type}`, { description });
    showToast('Laporan berhasil dikirim ke tim admin WarLok');
  }, [currentUser, stores, logActivity, showToast]);

  const resolveReport = useCallback((reportId: string, adminNote: string) => {
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        return { ...r, status: 'resolved', admin_note: adminNote };
      }
      return r;
    }));
    void apiRequest(`/admin/reports/${reportId}`, 'PATCH', { admin_note: adminNote });
    logActivity(`Admin menyelesaikan laporan ${reportId}`, { adminNote });
    showToast('Laporan ditandai selesai');
  }, [logActivity, showToast]);

  // Search logging
  const logSearch = useCallback((keyword: string) => {
    if (!keyword.trim()) return;
    const newLog: SearchLog = {
      id: `sl_${Date.now()}`,
      keyword: keyword.trim(),
      user_id: currentUser.id,
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      created_at: new Date().toISOString()
    };
    setSearchLogs(prev => [newLog, ...prev.slice(0, 99)]);
    void apiRequest('/search-logs', 'POST', {
      id: newLog.id,
      keyword: newLog.keyword,
      user_id: currentUser.id,
      lat: currentLocation.lat,
      lng: currentLocation.lng
    });
  }, [currentUser, currentLocation]);

  // WarLok Pay Currency Functions (Presentasi UI / Top-up Mockup)
  const topUpWallet = useCallback((amount: number) => {
    if (amount <= 0) return;
    setWalletBalance(prev => prev + amount);
    showToast(`Top-up berhasil! Saldo WarLok Pay bertambah ${amount.toLocaleString('id-ID')}`);
  }, [showToast]);

  const deductWallet = useCallback((amount: number): boolean => {
    if (amount <= 0) return true;
    if (walletBalance < amount) {
      showToast('Saldo WarLok Pay Anda tidak mencukupi');
      return false;
    }
    setWalletBalance(prev => prev - amount);
    return true;
  }, [walletBalance, showToast]);

  return (
    <WarLokContext.Provider
      value={{
        isBackendConnected,
        refreshFromBackend,
        walletBalance,
        topUpWallet,
        deductWallet,
        currentUser,
        switchRole,
        currentLocation,
        campusList: CAMPUS_LOCATIONS,
        setCustomLocation,
        detectDeviceLocation,
        selectedRadiusKm,
        setSelectedRadiusKm,
        stores,
        nearbyStores,
        activeStoresCount,
        pendingStoresCount,
        verifyStore,
        registerNewStore,
        categories,
        masterProducts,
        addMasterProduct,
        updateMasterProduct,
        storeProducts,
        getProductsByStore,
        toggleProductAvailability,
        updateStoreProductStock,
        addStoreProduct,
        voteStockAccuracy,
        getLowStockProducts,
        compareProductPrices,
        cartStoreId,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        reservations,
        createReservation,
        acceptReservation,
        rejectReservation,
        completeReservation,
        cancelReservation,
        reviews,
        addReview,
        reports,
        addReport,
        resolveReport,
        searchLogs,
        logSearch,
        activityLogs,
        selectedStoreId,
        setSelectedStoreId,
        toastMessage,
        showToast,
        clearToast
      }}
    >
      {children}
    </WarLokContext.Provider>
  );
};

export const useWarLok = () => {
  const context = useContext(WarLokContext);
  if (!context) {
    throw new Error('useWarLok must be used within a WarLokProvider');
  }
  return context;
};
