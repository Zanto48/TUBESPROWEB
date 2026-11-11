import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { MasterProduct, Store, StoreProduct } from '../../types';
import { formatRupiah, formatDistance } from '../../utils/geo';
import { ArrowUpDown, Check, Plus, AlertTriangle, ExternalLink, Sparkles, CreditCard } from 'lucide-react';
import { PurchaseModal } from './PurchaseModal';

interface PriceCompareModalProps {
  onOpenStoreModal: (store: Store) => void;
  onClose?: () => void;
}

export const PriceCompareModal: React.FC<PriceCompareModalProps> = ({ onOpenStoreModal }) => {
  const { masterProducts, compareProductPrices, addToCart, selectedRadiusKm } = useWarLok();
  const [selectedMasterId, setSelectedMasterId] = useState<string>(
    masterProducts[0]?.id || 'mp_indomie_goreng'
  );

  const selectedMaster = masterProducts.find(m => m.id === selectedMasterId);
  const comparisonResults = compareProductPrices(selectedMasterId);

  // State pembelian (UI Only)
  const [purchaseTarget, setPurchaseTarget] = useState<{ product: StoreProduct; store: Store } | null>(null);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1">
            <ArrowUpDown className="w-4 h-4" />
            <span>Radar Banding Harga Warung</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Bandingkan Harga Bahan Pokok Sekitar Kos
          </h2>
          <p className="text-xs text-stone-500">
            Temukan warung dengan harga termurah dan stok tersedia dalam radius {selectedRadiusKm > 0 ? `${selectedRadiusKm}km` : 'semua jarak'}.
          </p>
        </div>
      </div>

      {/* Commodity Selector Buttons */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-stone-600 block mb-2">
          Pilih Komoditas Pokok:
        </label>
        <div className="flex flex-wrap gap-2">
          {masterProducts.slice(0, 8).map(prod => (
            <button
              key={prod.id}
              onClick={() => setSelectedMasterId(prod.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedMasterId === prod.id
                  ? 'bg-stone-900 text-white shadow-xs font-semibold'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {prod.name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Product Overview */}
      {selectedMaster && (
        <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">
              {selectedMaster.brand} · {selectedMaster.unit}
            </span>
            <h3 className="text-base font-bold text-stone-900">{selectedMaster.name}</h3>
            <p className="text-xs text-stone-500">{selectedMaster.description}</p>
          </div>
          <div className="text-right sm:border-l sm:border-stone-200 sm:pl-4">
            <span className="text-[11px] text-stone-400 block">Patokan HET Nasional</span>
            <span className="text-sm font-bold text-stone-700 font-mono">
              {formatRupiah(selectedMaster.suggested_price)}
            </span>
          </div>
        </div>
      )}

      {/* Comparison Table / List */}
      <div className="overflow-x-auto">
        {comparisonResults.length === 0 ? (
          <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-200">
            <p className="text-sm font-medium text-stone-700 mb-1">
              Belum ada warung dalam radius Anda yang mencatat produk ini
            </p>
            <p className="text-xs text-stone-500">
              Coba perbesar radius pencarian di bilah atas atau pilih komoditas lain.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {comparisonResults.map((item, idx) => {
              const isCheapest = idx === 0;
              const isLow = item.stock <= item.product.low_stock_threshold;
              
              return (
                <div
                  key={item.store.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCheapest
                      ? 'border-emerald-300 bg-emerald-50/30 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCheapest ? 'bg-emerald-700 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <button
                          onClick={() => onOpenStoreModal(item.store)}
                          className="font-bold text-sm text-stone-900 hover:text-emerald-800 transition-colors cursor-pointer text-left flex items-center gap-1 group"
                        >
                          <span>{item.store.name}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-emerald-700 inline" />
                        </button>
                        
                        {isCheapest && (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                            Paling Hemat
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                        <span>{formatDistance(item.distance_km)}</span>
                        <span>·</span>
                        <span>{item.store.opening_hours}</span>
                        <span>·</span>
                        <span className="text-stone-700 font-medium">
                          Stok: {item.stock} {item.product.unit} {isLow ? '(Sisa sedikit)' : ''}
                        </span>
                        {item.product.is_doubtful && (
                          <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Stok Diragukan
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-lg font-bold text-stone-900 font-mono tabular-nums block">
                        {formatRupiah(item.price)}
                      </span>
                      {selectedMaster && item.price < selectedMaster.suggested_price && (
                        <span className="text-[10px] text-emerald-700 font-medium">
                          Hemat {formatRupiah(selectedMaster.suggested_price - item.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPurchaseTarget({ product: item.product, store: item.store })}
                        className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                        title="Simulasi Beli Langsung (Tampilan Saja)"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Beli</span>
                      </button>

                      <button
                        onClick={() => addToCart(item.product, 1)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Reservasi</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Simulasi Pembelian (Hanya Tampilan UI) */}
      <PurchaseModal
        isOpen={Boolean(purchaseTarget)}
        onClose={() => setPurchaseTarget(null)}
        product={purchaseTarget?.product || null}
        store={purchaseTarget?.store || null}
      />
    </div>
  );
};
