import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { formatRupiah } from '../../utils/geo';
import { 
  X, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  ShoppingBag,
  Store,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReservationCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToReservations: () => void;
}

export const ReservationCartDrawer: React.FC<ReservationCartDrawerProps> = ({ 
  isOpen, 
  onClose,
  onGoToReservations
}) => {
  const { 
    cart, 
    cartStoreId, 
    stores, 
    updateCartQty, 
    removeFromCart, 
    clearCart, 
    createReservation,
    currentUser
  } = useWarLok();

  const [pickupNote, setPickupNote] = useState<string>('');
  const [estimatedPickupTime, setEstimatedPickupTime] = useState<string>('30-60 menit lagi');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentStore = stores.find(s => s.id === cartStoreId);
  const totalAmount = cart.reduce((sum, item) => sum + (item.storeProduct.price * item.qty), 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = () => {
    setIsSubmitting(true);
    const result = createReservation(pickupNote, estimatedPickupTime);
    setIsSubmitting(false);

    if (result.success && result.reservationCode) {
      setConfirmedCode(result.reservationCode);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }
    }
  };

  const handleCloseAndReset = () => {
    setConfirmedCode(null);
    setPickupNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Drawer */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-800" />
            <h3 className="font-bold text-stone-900 text-base">
              Keranjang Reservasi
            </h3>
            {totalItemsCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
                {totalItemsCount} barang
              </span>
            )}
          </div>
          <button
            onClick={handleCloseAndReset}
            aria-label="Tutup keranjang"
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {confirmedCode ? (
            /* Success confirmation screen */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                  Reservasi Terkunci Berhasil
                </span>
                <h4 className="text-2xl font-bold text-stone-900 font-mono">
                  #{confirmedCode}
                </h4>
                <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto leading-relaxed">
                  Stok telah dikunci di sistem selama 90 menit. Pemilik warung telah diberitahu untuk menyiapkan barang Anda.
                </p>
              </div>

              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-500">Toko Ambil:</span>
                  <span className="font-semibold text-stone-900">{currentStore?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="font-semibold text-emerald-800">Bayar di Tempat (Tunai / QRIS)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Estimasi Ambil:</span>
                  <span className="font-semibold text-stone-900">{estimatedPickupTime}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleCloseAndReset();
                    onGoToReservations();
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Lihat Status di Reservasi Saya →
                </button>
                <button
                  onClick={handleCloseAndReset}
                  className="w-full py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Lanjut Belanja
                </button>
              </div>
            </div>
          ) : cart.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-stone-700">Keranjang masih kosong</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Cari warung terdekat atau bandingkan harga produk, lalu klik "Ambil" untuk memesan barang.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {/* Store banner notice */}
              {currentStore && (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-3 py-2 rounded-xl text-xs text-emerald-900">
                  <div className="flex items-center gap-1.5 font-medium truncate">
                    <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="truncate">{currentStore.name}</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-rose-700 hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    Kosongkan
                  </button>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2.5">
                {cart.map(item => (
                  <div
                    key={item.storeProduct.id}
                    className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-stone-900 truncate">
                        {item.storeProduct.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {formatRupiah(item.storeProduct.price)} / {item.storeProduct.unit}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQty(item.storeProduct.id, item.qty - 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded cursor-pointer font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-stone-800 font-mono">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.storeProduct.id, item.qty + 1)}
                        className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-100 rounded cursor-pointer font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right shrink-0">
                      <span className="font-bold text-stone-900 font-mono">
                        {formatRupiah(item.storeProduct.price * item.qty)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.storeProduct.id)}
                        className="block text-stone-400 hover:text-rose-600 ml-auto mt-0.5 cursor-pointer"
                        title="Hapus barang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pickup timing & note inputs */}
              <div className="pt-2 space-y-3 border-t border-stone-200">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Estimasi Waktu Pengambilan:
                  </label>
                  <select
                    value={estimatedPickupTime}
                    onChange={(e) => setEstimatedPickupTime(e.target.value)}
                    className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="15-30 menit lagi">15 - 30 menit lagi (Segera)</option>
                    <option value="30-60 menit lagi">30 - 60 menit lagi (Jam Istirahat)</option>
                    <option value="Sore sehabis kuliah (16.00-18.00)">Sore sehabis kuliah (16.00 - 18.00)</option>
                    <option value="Malam ini (19.00-21.00)">Malam ini (19.00 - 21.00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Catatan untuk Penjual (Opsional):
                  </label>
                  <input
                    type="text"
                    value={pickupNote}
                    onChange={(e) => setPickupNote(e.target.value)}
                    placeholder="Contoh: Plastikin pisah ya Bu, saya ambil naik motor..."
                    className="w-full p-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Stok langsung dikunci (stock held) selama 90 menit agar tidak dibeli orang lain. Pembayaran tunai/QRIS langsung di warung saat ambil barang.
                  </span>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Checkout Button */}
        {!confirmedCode && cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50 shrink-0 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500 font-medium">Total Tagihan (Bayar di Warung):</span>
              <span className="text-lg font-bold text-stone-900 font-mono tabular-nums">
                {formatRupiah(totalAmount)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Kunci Stok & Buat Reservasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
