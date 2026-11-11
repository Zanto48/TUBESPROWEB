import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { formatRupiah } from '../../utils/geo';
import { 
  X, 
  Wallet, 
  PlusCircle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Building2, 
  ShieldCheck,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TopUpModal: React.FC<TopUpModalProps> = ({ isOpen, onClose }) => {
  const { walletBalance, topUpWallet } = useWarLok();

  // Pilihan nominal preset
  const presetAmounts = [10000, 20000, 50000, 100000, 200000, 500000];

  const [selectedAmount, setSelectedAmount] = useState<number>(50000);
  const [customInput, setCustomInput] = useState<string>('50000');
  const [paymentChannel, setPaymentChannel] = useState<'qris' | 'va_bca' | 'gopay' | 'alfamart'>('qris');
  
  // Status simulasi sukses
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastTopUpAmount, setLastTopUpAmount] = useState<number>(0);

  if (!isOpen) return null;

  const handleSelectPreset = (amount: number) => {
    setSelectedAmount(amount);
    setCustomInput(amount.toString());
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedAmount(parsed);
    }
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(customInput, 10);
    if (isNaN(amount) || amount <= 0) return;

    topUpWallet(amount);
    setLastTopUpAmount(amount);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleCloseAndReset = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">WarLok Pay</h3>
                <span className="text-[10px] font-semibold bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Presentasi
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Dompet Digital & Saldo Komunitas Kos
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            aria-label="Tutup"
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 bg-stone-50 overflow-y-auto max-h-[80vh]">
          {isSuccess ? (
            /* Tampilan Sukses Top-Up */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                  Top-Up Berhasil!
                </span>
                <h4 className="text-3xl font-extrabold text-stone-900 font-mono">
                  +{formatRupiah(lastTopUpAmount)}
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Saldo simulasi WarLok Pay Anda telah ditambahkan.
                </p>
              </div>

              {/* Box Saldo Terkini */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-left space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-stone-500">Saldo WarLok Pay Sekarang:</span>
                  <span className="font-bold text-base text-emerald-800 font-mono">
                    {formatRupiah(walletBalance)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-stone-400 border-t border-stone-100 pt-2">
                  <span>Metode:</span>
                  <span className="font-semibold uppercase text-stone-700">{paymentChannel}</span>
                </div>
              </div>

              <button
                onClick={handleCloseAndReset}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Selesai & Gunakan Belanja
              </button>
            </div>
          ) : (
            /* Form Pengisian Top-Up */
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              
              {/* Card Saldo Saat Ini */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 block mb-0.5">Saldo Anda Saat Ini:</span>
                  <span className="text-xl font-extrabold text-stone-900 font-mono">
                    {formatRupiah(walletBalance)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              {/* Input Nominal Kustom */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800">
                    Pilih Nominal Top-Up:
                  </label>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    (Bisa Anda ketik bebas)
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 font-mono">
                    Rp
                  </span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={customInput}
                    onChange={handleCustomInputChange}
                    placeholder="Contoh: 50000"
                    className="w-full pl-11 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-base font-extrabold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                  />
                </div>

                {/* Preset Tombol Nominal */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {presetAmounts.map((amt) => {
                    const isSelected = selectedAmount === amt && customInput === amt.toString();
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectPreset(amt)}
                        className={`py-2 px-1 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                        }`}
                      >
                        {formatRupiah(amt)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mockup Pilihan Channel Pembayaran */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2.5">
                <label className="text-xs font-bold text-stone-800 block">
                  Metode Pembayaran (Mockup Simulasi):
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'qris', label: 'QRIS Realtime', icon: QrCode, badge: 'Bebas Admin' },
                    { id: 'va_bca', label: 'BCA / Mandiri VA', icon: Building2, badge: 'Otomatis' },
                    { id: 'gopay', label: 'GoPay / OVO', icon: Wallet, badge: 'Instan' },
                    { id: 'alfamart', label: 'Mitra Warung / Kasir', icon: CreditCard, badge: 'Tunai' },
                  ].map((ch) => {
                    const Icon = ch.icon;
                    const isSelected = paymentChannel === ch.id;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setPaymentChannel(ch.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold leading-tight ${isSelected ? 'text-emerald-900' : 'text-stone-800'}`}>
                            {ch.label}
                          </p>
                          <span className="text-[10px] text-emerald-700 font-medium">{ch.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Catatan Simulasi */}
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Informasi Demo:</strong> Transaksi top-up ini murni presentasi antarmuka dan tidak memotong saldo rekening nyata Anda. Saldo dapat dipakai untuk demo pembelian barang.
                </span>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Simulasikan Top-Up {formatRupiah(parseInt(customInput, 10) || selectedAmount)}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
