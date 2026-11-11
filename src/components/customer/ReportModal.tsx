import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { Report } from '../../types';
import { X, Flag, AlertCircle } from 'lucide-react';

interface ReportModalProps {
  storeId: string | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ storeId, onClose }) => {
  const { stores, addReport } = useWarLok();
  const [reportType, setReportType] = useState<Report['type']>('stock_inaccurate');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!storeId) return null;
  const store = stores.find(s => s.id === storeId);
  if (!store) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    addReport(store.id, reportType, description.trim());
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-stone-900 text-base">
              Laporkan Warung / Ketidaksesuaian Stok
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-500">Toko yang Dilaporkan:</span>
            <h4 className="font-bold text-stone-900 text-sm">{store.name}</h4>
            <p className="text-stone-500">{store.address}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              Jenis Ketidaksesuaian:
            </label>
            <div className="space-y-2">
              {[
                { type: 'stock_inaccurate' as const, label: 'Stok Habis tapi di Sistem Masih Ada' },
                { type: 'wrong_price' as const, label: 'Harga di Warung Berbeda dengan Aplikasi' },
                { type: 'store_closed' as const, label: 'Warung Tutup Saat Jam Buka Tertera' },
                { type: 'other' as const, label: 'Masalah Lainnya' }
              ].map(opt => (
                <label 
                  key={opt.type} 
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reportType === opt.type 
                      ? 'border-rose-400 bg-rose-50/50 text-rose-950 font-medium' 
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    checked={reportType === opt.type}
                    onChange={() => setReportType(opt.type)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Jelaskan Rincian Masalah:
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Barang Indomie Kari Ayam tertulis stok 20, tapi saat saya ke toko penjual bilang sudah habis sejak siang..."
              className="w-full p-2.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-600"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Laporan Anda akan ditinjau langsung oleh Admin WarLok untuk sinkronisasi data toko dan menjaga akurasi platform bersama.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim()}
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:bg-stone-300 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Kirim Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
