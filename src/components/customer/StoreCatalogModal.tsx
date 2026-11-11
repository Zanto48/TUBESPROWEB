import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { Store, StoreProduct } from '../../types';
import { formatRupiah, formatDistance } from '../../utils/geo';
import { 
  X, 
  MapPin, 
  Clock, 
  Phone, 
  Star, 
  Search, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Flag, 
  Check, 
  MessageSquare,
  CreditCard
} from 'lucide-react';
import { PurchaseModal } from './PurchaseModal';

interface StoreCatalogModalProps {
  store: Store | null;
  onClose: () => void;
  onOpenReport: (storeId: string) => void;
}

export const StoreCatalogModal: React.FC<StoreCatalogModalProps> = ({ store, onClose, onOpenReport }) => {
  const { 
    categories, 
    getProductsByStore, 
    addToCart, 
    voteStockAccuracy, 
    reviews, 
    addReview,
    logSearch
  } = useWarLok();

  const [activeTab, setActiveTab] = useState<'products' | 'reviews'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Review form state
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // State untuk modal pembelian (UI only)
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<StoreProduct | null>(null);

  if (!store) return null;

  const storeProducts = getProductsByStore(store.id);
  const storeReviews = reviews.filter(r => r.store_id === store.id);

  // Filter products by category and search
  const filteredProducts = storeProducts.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 2) {
      logSearch(val.trim());
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingReview(true);
    addReview(store.id, newRating, newComment.trim());
    setNewComment('');
    setIsSubmittingReview(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Store Banner */}
        <div className="relative bg-stone-900 text-white p-6 shrink-0">
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pr-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-600/90 text-white">
                  {store.opening_hours}
                </span>
                {store.distance_km !== undefined && (
                  <span className="text-xs text-stone-300 font-mono">
                    · {formatDistance(store.distance_km)} dari lokasi Anda
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
                {store.name}
              </h2>
              <p className="text-xs text-stone-300 flex items-center gap-1.5 mb-2">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                <span>{store.address}</span>
              </p>
              <p className="text-xs text-stone-300 line-clamp-2 max-w-xl">
                {store.description}
              </p>
            </div>

            {/* Quick stats & report */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
              <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-white text-sm">{store.rating > 0 ? store.rating : 'Baru'}</span>
                <span className="text-stone-300 font-normal">({store.total_reviews} ulasan)</span>
              </div>

              <button
                onClick={() => onOpenReport(store.id)}
                className="text-xs text-rose-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Lapor Toko / Stok</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6 border-t border-white/10 pt-3 text-sm">
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-1 transition-colors cursor-pointer font-medium ${
                activeTab === 'products'
                  ? 'text-white border-b-2 border-emerald-400 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              Katalog Inventaris ({storeProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-1 transition-colors cursor-pointer font-medium flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-white border-b-2 border-emerald-400 font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ulasan & Pengalaman ({storeReviews.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50">
          
          {activeTab === 'products' ? (
            <div>
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Cari mie, telur, minuman, sabun..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                    }`}
                  >
                    Semua ({storeProducts.length})
                  </button>
                  {categories.map(cat => {
                    const count = storeProducts.filter(p => p.category_id === cat.id).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-stone-900 text-white'
                            : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Products Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-stone-300 p-6">
                  <p className="text-sm font-semibold text-stone-700 mb-1">
                    Barang tidak ditemukan di warung ini
                  </p>
                  <p className="text-xs text-stone-500">
                    Coba ganti kata kunci pencarian atau ubah kategori filter.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  {filteredProducts.map(product => {
                    const isOutOfStock = product.stock === 0 || !product.is_available;
                    const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
                    
                    return (
                      <div
                        key={product.id}
                        className={`bg-white rounded-xl p-4 border transition-all flex flex-col justify-between ${
                          product.is_doubtful
                            ? 'border-amber-300 bg-amber-50/20'
                            : isOutOfStock
                            ? 'border-stone-200 opacity-60 bg-stone-100/50'
                            : 'border-stone-200 hover:border-emerald-500/50 hover:shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Top Row: Brand & Status indicators */}
                          <div className="flex items-center justify-between gap-2 mb-1 text-xs">
                            <span className="text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
                              {product.brand}
                            </span>
                            
                            {/* Stock badge */}
                            {product.is_doubtful ? (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Stok Diragukan ({product.confidence_score}%)
                              </span>
                            ) : isOutOfStock ? (
                              <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                                Stok Habis
                              </span>
                            ) : isLowStock ? (
                              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                                Sisa Sedikit ({product.stock} {product.unit})
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                                Tersedia ({product.stock} {product.unit})
                              </span>
                            )}
                          </div>

                          {/* Product Title */}
                          <h4 className="text-sm font-bold text-stone-900 leading-snug mb-0.5">
                            {product.name}
                          </h4>
                          <p className="text-xs text-stone-500 mb-3">
                            Satuan: {product.unit} {product.variant ? `· Varian: ${product.variant}` : ''}
                          </p>
                        </div>

                        {/* Price & Action Row */}
                        <div className="pt-2 border-t border-stone-100 mt-2 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[11px] text-stone-400 block -mb-0.5">Harga Warung</span>
                            <span className="text-base font-bold text-stone-900 font-mono tabular-nums">
                              {formatRupiah(product.price)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Community Stock Vote Micro Buttons */}
                            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-stone-600">
                              <button
                                onClick={() => voteStockAccuracy(product.id, 'available')}
                                title="Konfirmasi barang ini ada"
                                className="p-1 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer text-[10px] flex items-center gap-0.5"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span className="tabular-nums font-mono">{product.votes_available}</span>
                              </button>
                              <span className="text-stone-300 text-[10px]">|</span>
                              <button
                                onClick={() => voteStockAccuracy(product.id, 'empty')}
                                title="Laporkan barang ini kosong / habis"
                                className="p-1 hover:text-rose-700 hover:bg-white rounded transition-colors cursor-pointer text-[10px] flex items-center gap-0.5"
                              >
                                <ThumbsDown className="w-3 h-3" />
                                <span className="tabular-nums font-mono">{product.votes_empty}</span>
                              </button>
                            </div>

                            {/* Beli Langsung (Simulasi UI) */}
                            <button
                              disabled={isOutOfStock}
                              onClick={() => setSelectedProductForPurchase(product)}
                              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs active:scale-95'
                              }`}
                              title="Simulasi Beli Langsung (Tampilan Saja)"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Beli</span>
                            </button>

                            {/* Add to Reservation Cart Button */}
                            <button
                              disabled={isOutOfStock}
                              onClick={() => addToCart(product, 1)}
                              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                                isOutOfStock
                                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ambil</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Reviews Tab */
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Submit Review Card */}
              <form onSubmit={handleSubmitReview} className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
                <h4 className="text-sm font-bold text-stone-900 mb-2">
                  Tulis Ulasan untuk {store.name}
                </h4>
                
                {/* Rating Stars Selection */}
                <div className="flex items-center gap-1 mb-3">
                  <span className="text-xs text-stone-500 mr-2">Beri Rating:</span>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className="p-1 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`} 
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-stone-700 ml-2 font-mono">
                    {newRating}.0 / 5.0
                  </span>
                </div>

                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ceritakan pengalaman Anda belanja di warung ini (ketersediaan stok, keramahan penjual, kecepatan reservasi)..."
                  className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600 mb-2"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>

              {/* Review List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Semua Ulasan Pelanggan ({storeReviews.length})
                </h4>
                {storeReviews.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">Belum ada ulasan untuk warung ini.</p>
                ) : (
                  storeReviews.map(rev => (
                    <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-stone-200 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-stone-900">{rev.customer_name}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-stone-700 font-mono">{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-stone-600 leading-relaxed mb-1">
                        "{rev.comment}"
                      </p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(rev.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 px-6">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-stone-400" />
            <span>Kontak Warung: <strong className="text-stone-800">{store.phone}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 font-medium text-stone-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* Modal Simulasi Pembelian (Hanya Tampilan UI) */}
      <PurchaseModal
        isOpen={Boolean(selectedProductForPurchase)}
        onClose={() => setSelectedProductForPurchase(null)}
        product={selectedProductForPurchase}
        store={store}
      />
    </div>
  );
};
