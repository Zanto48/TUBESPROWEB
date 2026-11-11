import React, { useState, useEffect } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { Reservation, ReservationStatus } from '../../types';
import { formatRupiah } from '../../utils/geo';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Store, 
  ChevronRight, 
  Ban, 
  Star,
  Phone
} from 'lucide-react';

interface CustomerReservationsViewProps {
  onOpenReviewModal?: (storeId: string) => void;
}

export const CustomerReservationsView: React.FC<CustomerReservationsViewProps> = ({ onOpenReviewModal }) => {
  const { reservations, cancelReservation, currentUser, stores } = useWarLok();
  
  // Real-time ticking for countdowns
  const [nowMs, setNowMs] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter reservations for current user
  const myReservations = reservations.filter(r => r.customer_id === currentUser.id);

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
            <span>Menunggu Konfirmasi Warung</span>
          </span>
        );
      case 'accepted':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Disiapkan! Silakan Diambil</span>
          </span>
        );
      case 'picked_up':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-200 text-stone-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-stone-600" />
            <span>Selesai (Sudah Diambil)</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Ditolak Warung</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 flex items-center gap-1">
            <Ban className="w-3.5 h-3.5 text-stone-400" />
            <span>Dibatalkan</span>
          </span>
        );
      case 'expired':
        return (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-stone-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Waktu Habis (Kedaluwarsa)</span>
          </span>
        );
    }
  };

  const calculateRemainingTime = (expiresAtIso: string, status: ReservationStatus) => {
    if (status !== 'pending' && status !== 'accepted') return null;
    const expiryMs = new Date(expiresAtIso).getTime();
    const diff = expiryMs - nowMs;

    if (diff <= 0) return '00:00 (Kedaluwarsa)';
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes} menit ${seconds.toString().padStart(2, '0')} detik`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">
            Daftar Reservasi & Ambil Barang
          </h2>
          <p className="text-xs text-stone-500">
            Pantau status pesanan, waktu batas pengambilan, dan riwayat belanja Anda.
          </p>
        </div>
        <div className="text-xs text-stone-500">
          Total: <strong className="text-stone-900">{myReservations.length}</strong> pesanan
        </div>
      </div>

      {myReservations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300 p-8 space-y-3">
          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-700">Belum ada reservasi aktif</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Pilih barang di katalog warung terdekat, lalu klik "Reservasi" untuk mengunci stok tanpa antre.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myReservations.map(res => {
            const countdown = calculateRemainingTime(res.expires_at, res.status);
            const targetStore = stores.find(s => s.id === res.store_id);

            return (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs transition-all hover:border-stone-300 space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 font-mono font-bold text-sm">
                      #{res.code.split('-')[1] || res.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-900">{res.store_name}</h4>
                        <span className="text-xs text-stone-400 font-mono">Kode: #{res.code}</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Dipesan: {new Date(res.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB · Estimasi: {res.pickup_estimated_time || 'Dalam 1 jam'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    {getStatusBadge(res.status)}
                  </div>
                </div>

                {/* Countdown banner for active reservations */}
                {countdown && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-medium">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Batas Waktu Penguncian Stok:</span>
                      <strong className="font-mono font-bold text-amber-950">{countdown}</strong>
                    </div>
                    <span className="text-stone-500 text-[11px]">
                      Jika lewat batas waktu, stok otomatis dikembalikan ke etalase warung.
                    </span>
                  </div>
                )}

                {/* Item List */}
                <div className="space-y-2 bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Daftar Barang yang Dipesan:
                  </div>
                  {res.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-800 font-mono">{item.qty}x</span>
                        <span className="text-stone-700">{item.product_name} ({item.unit})</span>
                      </div>
                      <span className="font-mono text-stone-800 font-semibold">
                        {formatRupiah(item.price_snapshot * item.qty)}
                      </span>
                    </div>
                  ))}
                  
                  {res.note && (
                    <div className="pt-2 mt-2 border-t border-stone-200/60 text-xs text-stone-600 italic">
                      Catatan: "{res.note}"
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 text-xs text-stone-600">
                    {targetStore && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>Telp: <strong className="text-stone-800">{targetStore.phone}</strong></span>
                      </span>
                    )}
                    <span>·</span>
                    <span className="font-medium">Total Bayar di Kasir:</span>
                    <strong className="text-base font-bold text-emerald-800 font-mono">
                      {formatRupiah(res.total_amount)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Cancel button if pending */}
                    {res.status === 'pending' && (
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 hover:bg-rose-50 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Batalkan Reservasi
                      </button>
                    )}

                    {/* Review button if picked up */}
                    {res.status === 'picked_up' && onOpenReviewModal && (
                      <button
                        onClick={() => onOpenReviewModal(res.store_id)}
                        className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>Beri Nilai & Ulasan</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
