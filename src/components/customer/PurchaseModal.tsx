import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { StoreProduct, Store } from '../../types';
import { formatRupiah } from '../../utils/geo';
import { 
  X, 
  CreditCard, 
  Wallet, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  ShieldCheck, 
  Plus, 
  Minus, 
  ArrowRight,
  Store as StoreIcon,
  ShoppingBag,
  Percent,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: StoreProduct | null;
  store: Store | null;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  isOpen,
  onClose,
  product,
  store
}) => {
  const { walletBalance, deductWallet } = useWarLok();

  if (!isOpen || !product || !store) return null;

  // State kuantitas dan nominal kustom
  const [qty, setQty] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<number>(product.price);
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [tempCustomPriceInput, setTempCustomPriceInput] = useState<string>(product.price.toString());

  // Nominal kustom tambahan / diskon / biaya admin (UI-only)
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedPresetNominal, setSelectedPresetNominal] = useState<number | null>(null);

  // Pilihan metode pembayaran (hanya tampilan UI)
  const [paymentMethod, setPaymentMethod] = useState<'warlok_pay' | 'qris' | 'cash' | 'gopay'>('warlok_pay');
  const [customerName, setCustomerName] = useState<string>('Mahasiswa Kos (Anda)');
  const [customerPhone, setCustomerPhone] = useState<string>('0812-3456-7890');
  const [notes, setNotes] = useState<string>('');

  // Status sukses UI
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');

  // Perhitungan nominal total
  const subtotal = customPrice * qty;
  const grandTotal = Math.max(0, subtotal + additionalFee - discountAmount);

  // Preset nominal cepat yang bisa dipilih
  const presetNominals = [5000, 10000, 20000, 50000, 100000];

  const handleApplyPreset = (nominal: number) => {
    setSelectedPresetNominal(nominal);
    setCustomPrice(nominal);
    setTempCustomPriceInput(nominal.toString());
    setIsEditingPrice(false);
  };

  const handleSaveCustomPrice = () => {
    const parsed = parseInt(tempCustomPriceInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      setCustomPrice(parsed);
      setSelectedPresetNominal(null);
    } else {
      setTempCustomPriceInput(customPrice.toString());
    }
    setIsEditingPrice(false);
  };

  const handleSimulatePayment = () => {
    if (paymentMethod === 'warlok_pay') {
      const ok = deductWallet(grandTotal);
      if (!ok) return;
    }

    const randomCode = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
    setTransactionId(randomCode);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // Fallback jika confetti tidak berjalan
    }
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setQty(1);
    setCustomPrice(product.price);
    setAdditionalFee(0);
    setDiscountAmount(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-stone-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Simulasi Pembelian Barang</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Hanya Tampilan UI
                </span>
              </div>
              <p className="text-xs text-stone-300 flex items-center gap-1 mt-0.5">
                <StoreIcon className="w-3 h-3 text-stone-400" />
                <span>{store.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            aria-label="Tutup"
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50 space-y-4">
          {isSuccess ? (
            /* Tampilan Sukses Pembelian (Simulasi) */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                  Pembelian Berhasil Disimulasikan!
                </span>
                <h4 className="text-2xl font-bold text-stone-900 font-mono">
                  {transactionId}
                </h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Fitur ini hanya tampilan mockup antarmuka tanpa memanggil API ke server.
                </p>
              </div>

              {/* Rincian Nota Struk Pembelian */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-left text-xs space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-stone-800">
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Ringkasan Transaksi</span>
                  </div>
                  <span className="text-stone-400 font-mono text-[11px]">{new Date().toLocaleTimeString('id-ID')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-stone-500">Nama Barang:</span>
                  <span className="font-semibold text-stone-800 text-right">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Harga Satuan (Kustom):</span>
                  <span className="font-mono text-stone-800">{formatRupiah(customPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Jumlah Beli:</span>
                  <span className="font-mono text-stone-800">{qty} {product.unit}</span>
                </div>
                {additionalFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Biaya Tambahan / Tip:</span>
                    <span className="font-mono">+{formatRupiah(additionalFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon / Potongan:</span>
                    <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Metode Bayar:</span>
                  <span className="font-semibold uppercase text-stone-700">{paymentMethod}</span>
                </div>

                <div className="border-t border-dashed border-stone-200 pt-2 flex justify-between items-center text-sm">
                  <span className="font-bold text-stone-900">Total Nominal:</span>
                  <span className="font-extrabold text-emerald-700 font-mono text-base">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Selesai & Tutup Tampilan
                </button>
              </div>
            </div>
          ) : (
            /* Formulir Simulasi Pembelian */
            <div className="space-y-4">
              
              {/* Card Produk yang Dipilih */}
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {product.brand} · {product.unit}
                    </span>
                    <h4 className="font-bold text-stone-900 text-sm leading-snug">
                      {product.name}
                    </h4>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Warung: <strong className="text-stone-700">{store.name}</strong>
                    </p>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-lg border border-stone-200 shrink-0">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded text-stone-700 hover:bg-stone-200 font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-xs font-mono">{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded text-stone-700 hover:bg-stone-200 font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Box Kustomisasi Nominal Harga (Bisa diganti atau ditambah sendiri) */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs font-bold text-stone-800">
                      Nominal Harga Barang
                    </label>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    (Bisa Anda ubah bebas)
                  </span>
                </div>

                {/* Input Nominal Kustom */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 font-mono">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={tempCustomPriceInput}
                      onChange={(e) => {
                        setTempCustomPriceInput(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 0) {
                          setCustomPrice(val);
                          setSelectedPresetNominal(null);
                        }
                      }}
                      placeholder="Masukkan nominal harga..."
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-bold font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setCustomPrice(product.price);
                      setTempCustomPriceInput(product.price.toString());
                      setSelectedPresetNominal(null);
                    }}
                    title="Kembalikan ke harga asli warung"
                    className="px-2.5 py-2 text-[11px] font-medium border border-stone-300 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-600 transition-colors cursor-pointer"
                  >
                    Reset Asli
                  </button>
                </div>

                {/* Preset Nominal Cepat */}
                <div>
                  <span className="text-[11px] text-stone-500 block mb-1.5 font-medium">
                    Pilihan Cepat Nominal:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {presetNominals.map((nom) => (
                      <button
                        key={nom}
                        type="button"
                        onClick={() => handleApplyPreset(nom)}
                        className={`px-2.5 py-1 text-xs rounded-md font-mono transition-all cursor-pointer ${
                          customPrice === nom
                            ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {formatRupiah(nom)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tambahan Biaya / Diskon Tambahan (Opsi Fleksibel Pengguna) */}
                <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1 font-medium">
                      + Tambahan Biaya / Tip:
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 font-mono">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={additionalFee || ''}
                        onChange={(e) => setAdditionalFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-1 font-medium">
                      - Diskon / Potongan:
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 font-mono">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={discountAmount || ''}
                        onChange={(e) => setDiscountAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        placeholder="0"
                        className="w-full pl-7 pr-2 py-1.5 bg-stone-50 border border-stone-200 rounded-md font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pilihan Metode Pembayaran (Mockup UI) */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 block">
                    Metode Pembayaran (Mockup Tampilan)
                  </label>
                  <span className="text-[11px] text-stone-500 font-mono">
                    Saldo: <strong className="text-emerald-800">{formatRupiah(walletBalance)}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { 
                      id: 'warlok_pay', 
                      label: 'WarLok Pay', 
                      icon: Wallet, 
                      desc: `Saldo: ${formatRupiah(walletBalance)}`,
                      badge: 'Koin Web'
                    },
                    { id: 'qris', label: 'QRIS Instan', icon: QrCode, desc: 'Scan barcode di warung' },
                    { id: 'cash', label: 'Tunai di Kasir', icon: Banknote, desc: 'Bayar langsung uang pas' },
                    { id: 'gopay', label: 'E-Wallet', icon: CreditCard, desc: 'GoPay / OVO / Dana' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-2xs'
                            : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold ${isSelected ? 'text-emerald-900' : 'text-stone-800'}`}>
                            {m.label}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">{m.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rincian Ringkas Total */}
              <div className="bg-stone-100/70 p-3.5 rounded-xl border border-stone-200 text-xs space-y-1.5">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal ({qty} {product.unit} × {formatRupiah(customPrice)}):</span>
                  <span className="font-mono font-medium">{formatRupiah(subtotal)}</span>
                </div>
                {additionalFee > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>Biaya Tambahan / Tip:</span>
                    <span className="font-mono">+{formatRupiah(additionalFee)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon:</span>
                    <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-stone-200 text-stone-900">
                  <span className="font-bold">Total Pembayaran:</span>
                  <span className="font-extrabold text-base text-emerald-800 font-mono">
                    {formatRupiah(grandTotal)}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!isSuccess && (
          <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
            <div>
              <span className="text-[11px] text-stone-400 block -mb-0.5">Total Nominal:</span>
              <span className="text-lg font-extrabold text-stone-900 font-mono">
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSimulatePayment}
                className="px-5 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>Bayar Sekarang (Tampilan)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
