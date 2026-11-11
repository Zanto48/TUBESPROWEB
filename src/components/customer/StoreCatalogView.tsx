import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { LeafletMap } from '../map/LeafletMap';
import { Store, StoreProduct } from '../../types';
import { formatDistance, formatRupiah } from '../../utils/geo';
import { 
  Search, 
  MapPin, 
  Clock, 
  Star, 
  ChevronRight, 
  Package, 
  Sparkles, 
  ArrowUpDown,
  ShoppingBag,
  AlertTriangle
} from 'lucide-react';

interface StoreCatalogViewProps {
  onSelectStore: (store: Store) => void;
  onGoToCompare: () => void;
}

export const StoreCatalogView: React.FC<StoreCatalogViewProps> = ({ onSelectStore, onGoToCompare }) => {
  const { 
    nearbyStores, 
    currentLocation, 
    storeProducts, 
    categories, 
    logSearch,
    selectedRadiusKm
  } = useWarLok();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'map_and_list' | 'list_only'>('map_and_list');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 2) {
      logSearch(val.trim());
    }
  };

  // Filter stores based on search query (store name or product name inside store)
  const filteredStores = nearbyStores.filter(store => {
    if (!searchQuery.trim() && selectedCategory === 'all') return true;

    const matchesStoreName = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase());

    const storeItems = storeProducts.filter(p => p.store_id === store.id);
    const matchesProduct = storeItems.some(item => {
      const matchName = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || item.category_id === selectedCategory;
      return (searchQuery.trim() ? matchName : true) && matchCat;
    });

    return matchesStoreName || matchesProduct;
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Section */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Penyelamat Mahasiswa & Anak Kos</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight mb-2">
            Warung Terdekat, Stok Pasti, Siap Ambil.
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            Cek ketersediaan Indomie, telur, galon, beras, dan obat di warung sekitar kos {currentLocation.campus} tanpa takut kecele stok habis.
          </p>

          {/* Search bar & Compare Quick Button */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Cari kebutuhan: 'Indomie Goreng', 'Telur 1kg', 'Es Batu', 'Tolak Angin'..."
                className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={onGoToCompare}
              className="px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <ArrowUpDown className="w-4 h-4 text-emerald-400" />
              <span>Bandingkan Harga</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
            }`}
          >
            Semua Kebutuhan
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map & Toggle View */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-stone-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>Peta Interaktif Warung ({nearbyStores.length} warung aktif dalam radius {selectedRadiusKm > 0 ? `${selectedRadiusKm}km` : 'semua'})</span>
          </div>

          <button
            onClick={() => setViewMode(prev => prev === 'map_and_list' ? 'list_only' : 'map_and_list')}
            className="text-emerald-800 hover:underline cursor-pointer font-semibold"
          >
            {viewMode === 'map_and_list' ? 'Sembunyikan Peta' : 'Tampilkan Peta'}
          </button>
        </div>

        {viewMode === 'map_and_list' && (
          <LeafletMap onSelectStore={onSelectStore} />
        )}
      </div>

      {/* Stores Grid / Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Daftar Warung Terdekat
          </h2>
          <span className="text-xs text-stone-500 font-mono">
            {filteredStores.length} warung ditemukan
          </span>
        </div>

        {filteredStores.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 p-8 space-y-3">
            <Package className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-700">Tidak ada warung yang cocok</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Coba perluas radius pencarian atau cari dengan kata kunci lain.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStores.map(store => {
              const storeItems = storeProducts.filter(p => p.store_id === store.id && p.is_available);
              const previewItems = storeItems.slice(0, 3);
              const is24Hours = store.opening_hours.toLowerCase().includes('24');

              return (
                <div
                  key={store.id}
                  onClick={() => onSelectStore(store)}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all duration-150 flex flex-col justify-between cursor-pointer group"
                >
                  <div>
                    {/* Header: Distance & Hours */}
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {store.distance_km !== undefined ? formatDistance(store.distance_km) : 'Dekat'}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        is24Hours ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {store.opening_hours}
                      </span>
                    </div>

                    {/* Store Title */}
                    <h3 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug mb-1">
                      {store.name}
                    </h3>
                    
                    <p className="text-xs text-stone-500 line-clamp-1 mb-2">
                      {store.address}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-stone-600 mb-3">
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-stone-800">{store.rating > 0 ? store.rating : 'Baru'}</span>
                      </span>
                      <span>·</span>
                      <span className="text-stone-400 font-mono">({store.total_reviews} ulasan)</span>
                    </div>

                    {/* Preview Available Products */}
                    <div className="space-y-1.5 py-2.5 border-t border-stone-100">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                        Stok Unggulan:
                      </div>
                      {previewItems.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-xs">
                          <span className="text-stone-700 truncate max-w-[170px]">{p.name}</span>
                          <span className="font-mono font-bold text-stone-800 tabular-nums">
                            {formatRupiah(p.price)}
                          </span>
                        </div>
                      ))}
                      {storeItems.length > 3 && (
                        <span className="text-[10px] text-stone-400 block pt-0.5">
                          +{storeItems.length - 3} produk lainnya
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Inventaris & Pesan</span>
                    <ChevronRight className="w-4 h-4 text-emerald-700" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
