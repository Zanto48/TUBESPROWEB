import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { StoreProduct, Reservation } from '../../types';
import { formatRupiah, formatDistance } from '../../utils/geo';
import { 
  Store as StoreIcon, 
  Package, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Check, 
  X, 
  Plus, 
  Edit2, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  Phone, 
  User, 
  Search,
  FileText
} from 'lucide-react';

export const MerchantDashboard: React.FC = () => {
  const { 
    stores, 
    storeProducts, 
    reservations, 
    acceptReservation, 
    rejectReservation, 
    completeReservation,
    toggleProductAvailability,
    updateStoreProductStock,
    addStoreProduct,
    masterProducts,
    searchLogs,
    currentLocation,
    registerNewStore
  } = useWarLok();

  // Pick first active store as current merchant's managed store (Warung Madura Berkah)
  const [activeMerchantStoreId, setActiveMerchantStoreId] = useState<string>(
    stores[0]?.id || 'str_madura_berkah'
  );

  const [activeTab, setActiveTab] = useState<'reservations' | 'inventory' | 'demand' | 'register'>('reservations');
  
  // Inventory editing modal state
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [editStockVal, setEditStockVal] = useState<number>(0);
  const [editPriceVal, setEditPriceVal] = useState<number>(0);

  // Add new product from master catalog
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [selectedMasterId, setSelectedMasterId] = useState<string>(masterProducts[0]?.id || '');
  const [newProdStock, setNewProdStock] = useState<number>(20);
  const [newProdPrice, setNewProdPrice] = useState<number>(3500);

  // Register new store form state
  const [newStoreName, setNewStoreName] = useState<string>('');
  const [newStoreDesc, setNewStoreDesc] = useState<string>('');
  const [newStoreHours, setNewStoreHours] = useState<string>('24 Jam Nonstop');
  const [newStorePhone, setNewStorePhone] = useState<string>('0812-3344-5566');

  const currentStore = stores.find(s => s.id === activeMerchantStoreId) || stores[0];
  const currentStoreProducts = storeProducts.filter(p => p.store_id === currentStore?.id);

  // Reservations for this store
  const storeReservations = reservations.filter(r => r.store_id === currentStore?.id);
  const pendingReservations = storeReservations.filter(r => r.status === 'pending');
  const acceptedReservations = storeReservations.filter(r => r.status === 'accepted');

  // Low stock products alert
  const lowStockItems = currentStoreProducts.filter(p => p.stock <= p.low_stock_threshold);
  const doubtfulItems = currentStoreProducts.filter(p => p.is_doubtful);

  // Search Demand Analytics: aggregate keywords in local search logs
  const keywordFrequency: Record<string, number> = {};
  searchLogs.forEach(log => {
    const kw = log.keyword.toLowerCase().trim();
    keywordFrequency[kw] = (keywordFrequency[kw] || 0) + 1;
  });
  const topDemandKeywords = Object.entries(keywordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const handleSaveProductEdit = () => {
    if (!editingProduct) return;
    updateStoreProductStock(editingProduct.id, editStockVal, editPriceVal);
    setEditingProduct(null);
  };

  const handleAddFromMaster = () => {
    const master = masterProducts.find(m => m.id === selectedMasterId);
    if (!master || !currentStore) return;

    addStoreProduct({
      store_id: currentStore.id,
      master_product_id: master.id,
      name: master.name,
      brand: master.brand,
      category_id: master.category_id,
      unit: master.unit,
      price: newProdPrice,
      stock: newProdStock,
      low_stock_threshold: 5,
      is_available: newProdStock > 0
    });

    setIsAddingProduct(false);
  };

  const handleRegisterStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    registerNewStore(
      {
        name: newStoreName.trim(),
        description: newStoreDesc.trim(),
        opening_hours: newStoreHours.trim(),
        phone: newStorePhone.trim(),
        lat: currentLocation.lat + (Math.random() - 0.5) * 0.003,
        lng: currentLocation.lng + (Math.random() - 0.5) * 0.003,
        address: `${currentLocation.name}, Sekitar Kampus`
      },
      [
        { file_name: 'KTP_Pemilik_Warung.jpg', type: 'ktp' },
        { file_name: 'Foto_Tampak_Depan_Warung.jpg', type: 'foto_toko' }
      ]
    );

    setNewStoreName('');
    setNewStoreDesc('');
    setActiveTab('inventory');
  };

  return (
    <div className="space-y-6">
      
      {/* Merchant Header & Store Selector */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              Portal Pemilik Warung
            </span>
            {currentStore?.status === 'active' ? (
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Terverifikasi Aktif
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Menunggu Verifikasi Admin
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            {currentStore?.name || 'Kelola Warung'}
          </h2>
          <p className="text-xs text-stone-500">
            {currentStore?.address} · Jam Buka: {currentStore?.opening_hours}
          </p>
        </div>

        {/* Switch Store if user owns or demos multiple */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-stone-500 font-medium">Ganti Warung:</span>
          <select
            value={activeMerchantStoreId}
            onChange={(e) => setActiveMerchantStoreId(e.target.value)}
            className="bg-stone-50 border border-stone-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
          >
            {stores.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status === 'active' ? 'Aktif' : 'Pending'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Critical Alerts Banner (Doubtful stock & Low stock) */}
      {(doubtfulItems.length > 0 || lowStockItems.length > 0) && (
        <div className="space-y-2">
          {doubtfulItems.map(item => (
            <div 
              key={item.id} 
              className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <strong>Peringatan Komunitas:</strong> Stok barang <strong>{item.name}</strong> dilaporkan kosong oleh mahasiswa (Skor keyakinan: {item.confidence_score}%).
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(item);
                  setEditStockVal(item.stock);
                  setEditPriceVal(item.price);
                }}
                className="px-3 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] shrink-0 cursor-pointer"
              >
                Perbarui Stok Sekarang
              </button>
            </div>
          ))}

          {lowStockItems.length > 0 && (
            <div className="bg-stone-100 border border-stone-300 rounded-xl p-3 text-xs text-stone-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-stone-600 shrink-0" />
                <span>
                  <strong>{lowStockItems.length} barang</strong> mendekati batas habis (stok ≤ ambang batas).
                </span>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-emerald-800 font-semibold hover:underline cursor-pointer"
              >
                Buka Inventaris →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Merchant Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('reservations')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reservations'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pesanan Masuk</span>
          {pendingReservations.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[11px] flex items-center justify-center font-bold">
              {pendingReservations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Kelola Stok & Inventaris ({currentStoreProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('demand')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'demand'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Analitik Permintaan Kos</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'register'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>Daftar Warung Baru</span>
        </button>
      </div>

      {/* Tab 1: Incoming Reservations */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Reservasi membutuhkan tindakan Anda: <strong>{pendingReservations.length}</strong> menunggu persetujuan, <strong>{acceptedReservations.length}</strong> siap diambil.
            </span>
          </div>

          {storeReservations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300 p-6">
              <Clock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-700">Belum ada pesanan masuk</p>
              <p className="text-xs text-stone-500">
                Saat mahasiswa melakukan reservasi barang, pesanan akan muncul di sini untuk Anda siapkan.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {storeReservations.map(res => {
                const isPending = res.status === 'pending';
                const isAccepted = res.status === 'accepted';
                
                return (
                  <div
                    key={res.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                      isPending
                        ? 'border-amber-400 bg-amber-50/15 shadow-sm ring-1 ring-amber-300'
                        : isAccepted
                        ? 'border-emerald-300 bg-emerald-50/10'
                        : 'border-stone-200 opacity-75'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-stone-900 font-mono">
                            #{res.code}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {res.status === 'pending'
                              ? 'Menunggu Anda Terima'
                              : res.status === 'accepted'
                              ? 'Sudah Diterima (Menunggu Pelanggan Datang)'
                              : res.status === 'picked_up'
                              ? 'Selesai / Lunas'
                              : 'Dibatalkan/Ditolak'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <strong className="text-stone-800">{res.customer_name}</strong>
                          <span>({res.customer_phone})</span>
                          <span>· Estimasi: {res.pickup_estimated_time || 'Dalam 1 jam'}</span>
                        </p>
                      </div>

                      {/* Total Amount */}
                      <div className="text-right">
                        <span className="text-[11px] text-stone-400 block">Total Tagihan Kasir</span>
                        <span className="text-base font-bold text-emerald-800 font-mono">
                          {formatRupiah(res.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="py-2.5 space-y-1.5 text-xs text-stone-700">
                      <div className="text-[11px] font-semibold text-stone-400 uppercase">
                        Rincian Barang yang Harus Disiapkan:
                      </div>
                      {res.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-stone-50 px-2.5 py-1.5 rounded-lg">
                          <span className="font-medium">
                            <strong className="font-mono text-stone-900 mr-1.5">{item.qty}x</strong>
                            {item.product_name} ({item.unit})
                          </span>
                          <span className="font-mono text-stone-600">
                            {formatRupiah(item.price_snapshot * item.qty)}
                          </span>
                        </div>
                      ))}

                      {res.note && (
                        <p className="text-xs text-stone-600 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                          Catatan Pembeli: "{res.note}"
                        </p>
                      )}
                    </div>

                    {/* Merchant Action Buttons */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                      {isPending && (
                        <>
                          <button
                            onClick={() => {
                              const reason = prompt('Masukkan alasan penolakan (opsional):') || undefined;
                              rejectReservation(res.id, reason);
                            }}
                            className="px-3.5 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Tolak Pesanan (Stok Balik)
                          </button>
                          <button
                            onClick={() => acceptReservation(res.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            <span>Terima & Siapkan Pesanan</span>
                          </button>
                        </>
                      )}

                      {isAccepted && (
                        <button
                          onClick={() => completeReservation(res.id)}
                          className="px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Pelanggan Sudah Ambil & Bayar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Inventory & Quick-Toggle */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Inventaris & Stok Warung
              </h3>
              <p className="text-xs text-stone-500">
                Gunakan tombol switch untuk sembunyikan barang yang habis dalam 1 klik.
              </p>
            </div>

            <button
              onClick={() => setIsAddingProduct(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah dari Master Produk</span>
            </button>
          </div>

          {/* Add Product Modal Drawer */}
          {isAddingProduct && (
            <div className="bg-stone-100 border border-stone-300 rounded-2xl p-4 sm:p-5 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-stone-900">
                  Tambah Produk Baru ke Etalase Warung
                </h4>
                <button 
                  onClick={() => setIsAddingProduct(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                >
                  Batal ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Pilih Master Produk:
                  </label>
                  <select
                    value={selectedMasterId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedMasterId(id);
                      const m = masterProducts.find(mp => mp.id === id);
                      if (m) setNewProdPrice(m.suggested_price);
                    }}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {masterProducts.map(mp => (
                      <option key={mp.id} value={mp.id}>
                        {mp.name} ({mp.brand} · {mp.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Harga Jual Warung (Rp):
                  </label>
                  <input
                    type="number"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Jumlah Stok Awal:
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={handleAddFromMaster}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Simpan ke Inventaris
                </button>
              </div>
            </div>
          )}

          {/* Products List with Quick-Toggle */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Stok Saat Ini</th>
                    <th className="py-3 px-4">Akurasi Komunitas</th>
                    <th className="py-3 px-4">Quick Toggle (Tersedia)</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {currentStoreProducts.map(p => {
                    const isLow = p.stock <= p.low_stock_threshold;
                    
                    return (
                      <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-stone-900 block">{p.name}</span>
                          <span className="text-[11px] text-stone-400 font-mono">{p.brand} · {p.unit}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-stone-800">
                          {formatRupiah(p.price)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                            isLow ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-800'
                          }`}>
                            {p.stock} {p.unit}
                          </span>
                          {isLow && (
                            <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                              Mendekati habis!
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold ${
                              p.is_doubtful ? 'text-amber-700' : 'text-emerald-700'
                            }`}>
                              {p.confidence_score}%
                            </span>
                            <span className="text-stone-400 text-[10px]">
                              (+{p.votes_available} / -{p.votes_empty})
                            </span>
                          </div>
                          {p.is_doubtful && (
                            <span className="text-[10px] text-amber-800 font-semibold block">
                              Diragukan komunitas
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {/* Quick Toggle availability (Plan Section 4 & 5.5) */}
                          <button
                            onClick={() => toggleProductAvailability(p.id)}
                            className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold focus:outline-none"
                            title="Klik untuk ubah ketersediaan cepat"
                          >
                            {p.is_available ? (
                              <div className="flex items-center gap-1 text-emerald-800">
                                <ToggleRight className="w-6 h-6 text-emerald-600" />
                                <span>Tersedia</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-stone-400">
                                <ToggleLeft className="w-6 h-6 text-stone-400" />
                                <span>Habis</span>
                              </div>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setEditStockVal(p.stock);
                              setEditPriceVal(p.price);
                            }}
                            className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors cursor-pointer"
                            title="Edit Stok & Harga"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Stock/Price Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <h4 className="font-bold text-stone-900 text-sm">
              Update Stok & Harga: {editingProduct.name}
            </h4>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Jumlah Stok Baru:
              </label>
              <input
                type="number"
                value={editStockVal}
                onChange={(e) => setEditStockVal(Number(e.target.value))}
                className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Harga Jual (Rp):
              </label>
              <input
                type="number"
                value={editPriceVal}
                onChange={(e) => setEditPriceVal(Number(e.target.value))}
                className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProductEdit}
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Local Student Search Demand Analytics */}
      {activeTab === 'demand' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Radar Kebutuhan Mahasiswa Sekitar</span>
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Kata Kunci Paling Sering Dicari Mahasiswa Kos
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Data pencarian real-time dari aplikasi WarLok di radius sekitar warung Anda. Jadikan acuan untuk menambah stok barang cepat laku!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {topDemandKeywords.map(([kw, count], idx) => (
                <div key={kw} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 font-mono block">
                    TOP #{idx + 1}
                  </span>
                  <h4 className="font-bold text-stone-900 capitalize text-sm">{kw}</h4>
                  <span className="text-xs text-emerald-800 font-semibold font-mono">
                    {count} kali dicari
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Register New Store */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-2xs max-w-xl mx-auto space-y-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Ekspansi Jaringan WarLok
            </span>
            <h3 className="text-lg font-bold text-stone-900">
              Daftarkan Cabang Warung / Toko Kelontong Baru
            </h3>
            <p className="text-xs text-stone-500">
              Warung baru akan masuk ke antrean verifikasi Admin WarLok sebelum tampil di peta pencarian mahasiswa.
            </p>
          </div>

          <form onSubmit={handleRegisterStore} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Nama Toko / Warung:</label>
              <input
                required
                type="text"
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Contoh: Warung Madura Berkah 2, Toko Bu Joko..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Deskripsi Singkat & Keunggulan:</label>
              <textarea
                rows={2}
                value={newStoreDesc}
                onChange={(e) => setNewStoreDesc(e.target.value)}
                placeholder="Contoh: Sedia es kristal, galon aqua, rokok, mie instan, buka 24 jam..."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Jam Operasional:</label>
                <input
                  type="text"
                  value={newStoreHours}
                  onChange={(e) => setNewStoreHours(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">No. WhatsApp Warung:</label>
                <input
                  type="text"
                  value={newStorePhone}
                  onChange={(e) => setNewStorePhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
              <span className="font-semibold text-stone-800 block">Berkas Verifikasi (Demo):</span>
              <p className="text-[11px] text-stone-500">
                Dokumen KTP dan Foto Plang Toko akan otomatis dilampirkan untuk proses validasi Super Admin.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Ajukan Pendaftaran Toko
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
