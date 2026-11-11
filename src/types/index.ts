export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  address?: string;
  avatar?: string;
}

export type StoreStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export interface StoreDocument {
  id: string;
  store_id: string;
  file_name: string;
  file_url: string;
  type: 'ktp' | 'foto_toko' | 'surat_usaha';
  review_note?: string;
}

export interface Store {
  id: string;
  owner_id: string;
  owner_name: string;
  name: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  status: StoreStatus;
  verified_at?: string;
  phone: string;
  opening_hours: string;
  image_url?: string;
  rating: number;
  total_reviews: number;
  documents?: StoreDocument[];
  distance_km?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface MasterProduct {
  id: string;
  category_id: string;
  name: string;
  brand: string;
  unit: string; // e.g. "Bungkus", "Botol 600ml", "1 Kg", "Sachet"
  description: string;
  suggested_price: number;
  image_url?: string;
}

export interface StoreProduct {
  id: string;
  store_id: string;
  master_product_id?: string;
  name: string;
  brand: string;
  category_id: string;
  unit: string;
  variant?: string;
  price: number;
  stock: number;
  low_stock_threshold: number;
  is_available: boolean; // quick toggle
  votes_available: number;
  votes_empty: number;
  confidence_score: number; // 0 to 100%
  last_voted_at?: string;
  is_doubtful?: boolean; // if >= 3 votes and > 50% empty in last 24h
}

export type ReservationStatus = 
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'picked_up'
  | 'cancelled';

export interface ReservationItem {
  id: string;
  reservation_id: string;
  store_product_id: string;
  product_name: string;
  variant?: string;
  unit: string;
  qty: number;
  price_snapshot: number;
}

export interface Reservation {
  id: string;
  code: string; // e.g. WL-2401
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  store_id: string;
  store_name: string;
  status: ReservationStatus;
  created_at: string;
  expires_at: string; // ISO string
  note?: string;
  total_amount: number;
  items: ReservationItem[];
  pickup_estimated_time?: string;
}

export interface Review {
  id: string;
  store_id: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface StockVote {
  id: string;
  store_product_id: string;
  user_id: string;
  vote: 'available' | 'empty';
  created_at: string;
}

export interface Report {
  id: string;
  store_id: string;
  store_name: string;
  reporter_id: string;
  reporter_name: string;
  type: 'stock_inaccurate' | 'wrong_price' | 'store_closed' | 'other';
  description: string;
  status: 'open' | 'resolved' | 'dismissed';
  admin_note?: string;
  created_at: string;
}

export interface SearchLog {
  id: string;
  keyword: string;
  user_id?: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  meta?: Record<string, unknown>;
  created_at: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  campus: string;
  city: string;
  lat: number;
  lng: number;
  description: string;
}
