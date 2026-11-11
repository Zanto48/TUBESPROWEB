import React, { useState } from 'react';
import { useWarLok } from '../../context/WarLokContext';
import { Store, MasterProduct, Report } from '../../types';
import { formatRupiah } from '../../utils/geo';
import { 
  ShieldCheck, 
  Store as StoreIcon, 
  FileCheck, 
  CheckCircle2, 
  XCircle, 
  Flag, 
  Package, 
  Plus, 
  Activity, 
  Search,
  Eye,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    stores, 
    verifyStore, 
    reports, 
    resolveReport, 
    masterProducts, 
    addMasterProduct, 
    categories, 
    activityLogs,
    reservations
  } = useWarLok();

  const [activeTab, setActiveTab] = useState<'verifications' | 'reports' | 'master_products' | 'activity'>('verifications');

  // Master product modal
  const [isAddingMaster, setIsAddingMaster] = useState<boolean>(false);
  const [newMasterName, setNewMasterName] = useState<string>('');
  const [newMasterBrand, setNewMasterBrand] = useState<string>('');
  const [newMasterCat, setNewMasterCat] = useState<string>(categories[0]?.id || 'cat_instant');
  const [newMasterUnit, setNewMasterUnit] = useState<string>('Bungkus');
  const [newMasterPrice, setNewMasterPrice] = useState<number>(3500);
  const [newMasterDesc, setNewMasterDesc] = useState<string>('');

  // Selected store document view
  const [previewStore, setPreviewStore] = useState<Store | null>(null);
  const [reviewNote, setReviewNote] = useState<string>('');

  // Filtering
  const pendingStores = stores.filter(s => s.status === 'pending');
  const activeStores = stores.filter(s => s.status === 'active');
  const openReports = reports.filter(r => r.status === 'open');

  // Metrics
  const totalVolume = reservations.reduce((sum, r) => sum + r.total_amount, 0);

  const handleCreateMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) return;

    addMasterProduct({
      name: newMasterName.trim(),
      brand: newMasterBrand.trim() || 'Umum',
      category_id: newMasterCat,
      unit: newMasterUnit.trim(),
      suggested_price: newMasterPrice,
      description: newMasterDesc.trim() || 'Barang kebutuhan harian mahasiswa kos'
    });

    setNewMasterName('');
    setNewMasterBrand('');
    setIsAddingMaster(false);
  };

  const handleResolveReport = (reportId: string) => {
    const note = prompt('Masukkan catatan penyelesaian admin (contoh: Toko telah dihubungi dan stok disinkronkan):');
    if (note) {
      resolveReport(reportId, note);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI metrics */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Super Admin Konsol
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              WarLok Monitoring & Verifikasi Warung
            </h2>
            <p className="text-xs text-stone-400">
              Moderasi master data, validasi kelayakan berkas warung, dan tanggapi aduan komunitas kos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-stone-200 border border-white/10">
              Sistem Aktif · Regional Indonesia
            </span>
          </div>
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] text-stone-400 block mb-0.5">Warung Aktif</span>
            <span className="text-2xl font-bold text-white font-mono">{activeStores.length}</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">Tersebar di kampus</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] text-stone-400 block mb-0.5">Antrean Verifikasi</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{pendingStores.length}</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">Butuh persetujuan</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] text-stone-400 block mb-0.5">Total Reservasi</span>
            <span className="text-2xl font-bold text-white font-mono">{reservations.length}</span>
            <span className="text-[10px] text-stone-300 block mt-0.5">Transaksi tercatat</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/5">
            <span className="text-[11px] text-stone-400 block mb-0.5">Volume Transaksi</span>
            <span className="text-xl font-bold text-emerald-400 font-mono truncate block">
              {formatRupiah(totalVolume)}
            </span>
            <span className="text-[10px] text-stone-300 block mt-0.5">Nilai perputaran warung</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('verifications')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'verifications'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Verifikasi Warung ({pendingStores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Aduan Komunitas ({openReports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('master_products')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'master_products'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Master Katalog Produk ({masterProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-stone-900 text-white font-bold'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Log Audit Sistem</span>
        </button>
      </div>

      {/* Tab 1: Store Verifications Queue */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Warung berstatus <strong>pending</strong> tidak akan ditampilkan kepada pembeli sebelum diverifikasi oleh Admin.
            </span>
          </div>

          {pendingStores.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-stone-800">Semua warung telah diverifikasi</p>
              <p className="text-xs text-stone-500">
                Tidak ada pengajuan warung baru yang menunggu saat ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingStores.map(store => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-amber-300 p-5 shadow-2xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Menunggu Verifikasi
                        </span>
                        <span className="text-xs text-stone-400 font-mono">ID: {store.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">{store.name}</h3>
                      <p className="text-xs text-stone-600">
                        Pemilik: <strong className="text-stone-800">{store.owner_name}</strong> · Telp/WA: {store.phone}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">Alamat: {store.address}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => verifyStore(store.id, 'rejected', 'Dokumen tidak lengkap')}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => verifyStore(store.id, 'active', 'Dokumen terverifikasi lengkap')}
                        className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verifikasi & Aktifkan Toko</span>
                      </button>
                    </div>
                  </div>

                  {/* Document preview block */}
                  <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 text-xs">
                    <span className="font-semibold text-stone-700 block mb-2">
                      Dokumen Verifikasi Pemilik Warung:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {store.documents && store.documents.length > 0 ? (
                        store.documents.map(doc => (
                          <div key={doc.id} className="p-2.5 bg-white rounded-lg border border-stone-200 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span className="font-medium truncate">{doc.file_name}</span>
                              <span className="text-[10px] text-stone-400 uppercase">({doc.type})</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-semibold shrink-0">Valid</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-400 italic">Tidak ada dokumen terlampir.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Community Stock Inaccuracy Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Laporan stok tidak akurat dan keluhan langsung dari pengguna sekitar kos.
            </span>
          </div>

          <div className="space-y-3">
            {reports.map(rep => {
              const isOpen = rep.status === 'open';

              return (
                <div
                  key={rep.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
                    isOpen ? 'border-rose-300 bg-rose-50/15' : 'border-stone-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isOpen ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {isOpen ? 'Perlu Tindakan' : 'Sudah Ditindaklanjuti'}
                        </span>
                        <span className="text-xs font-bold text-stone-900">{rep.store_name}</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Pelapor: <strong className="text-stone-700">{rep.reporter_name}</strong> · Jenis: <span className="capitalize">{rep.type.replace('_', ' ')}</span>
                      </p>
                    </div>

                    {isOpen && (
                      <button
                        onClick={() => handleResolveReport(rep.id)}
                        className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                      >
                        Tandai Selesai & Beri Catatan
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-stone-700 mt-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    "{rep.description}"
                  </p>

                  {rep.admin_note && (
                    <p className="text-xs text-emerald-800 mt-2 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      <strong>Tindakan Admin:</strong> {rep.admin_note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Global Master Products */}
      {activeTab === 'master_products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Master Data Produk Global
              </h3>
              <p className="text-xs text-stone-500">
                Katalog master yang dapat langsung dipilih oleh pemilik warung tanpa mengetik manual.
              </p>
            </div>

            <button
              onClick={() => setIsAddingMaster(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Produk</span>
            </button>
          </div>

          {/* Add Master Product Drawer */}
          {isAddingMaster && (
            <form onSubmit={handleCreateMaster} className="bg-stone-100 border border-stone-300 rounded-2xl p-4 sm:p-5 text-xs space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-stone-900">
                  Buat Master Produk Baru
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingMaster(false)}
                  className="text-stone-400 hover:text-stone-700 text-xs cursor-pointer"
                >
                  Batal ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Nama Produk:</label>
                  <input
                    required
                    type="text"
                    value={newMasterName}
                    onChange={(e) => setNewMasterName(e.target.value)}
                    placeholder="Contoh: Indomie Goreng Rendang..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Merek / Produsen:</label>
                  <input
                    type="text"
                    value={newMasterBrand}
                    onChange={(e) => setNewMasterBrand(e.target.value)}
                    placeholder="Contoh: Indofood, Wings..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kategori:</label>
                  <select
                    value={newMasterCat}
                    onChange={(e) => setNewMasterCat(e.target.value)}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Satuan Standar:</label>
                  <input
                    type="text"
                    value={newMasterUnit}
                    onChange={(e) => setNewMasterUnit(e.target.value)}
                    placeholder="Contoh: Bungkus (85g), Botol 600ml..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Saran Harga HET (Rp):</label>
                  <input
                    type="number"
                    value={newMasterPrice}
                    onChange={(e) => setNewMasterPrice(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Deskripsi Produk:</label>
                  <input
                    type="text"
                    value={newMasterDesc}
                    onChange={(e) => setNewMasterDesc(e.target.value)}
                    placeholder="Keterangan singkat..."
                    className="w-full p-2 bg-white border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg cursor-pointer"
                >
                  Simpan Master Produk
                </button>
              </div>
            </form>
          )}

          {/* Master Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Brand</th>
                    <th className="py-3 px-4">Satuan</th>
                    <th className="py-3 px-4">Harga Acuan HET</th>
                    <th className="py-3 px-4">Deskripsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {masterProducts.map(mp => (
                    <tr key={mp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-900">{mp.name}</td>
                      <td className="py-3 px-4 font-medium text-stone-600">{mp.brand}</td>
                      <td className="py-3 px-4 font-mono text-stone-500">{mp.unit}</td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-800">
                        {formatRupiah(mp.suggested_price)}
                      </td>
                      <td className="py-3 px-4 text-stone-500 max-w-xs truncate">{mp.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Activity Audit Logs */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm mb-2">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Audit Trail & Riwayat Aktivitas Sistem</span>
          </div>

          <div className="space-y-2">
            {activityLogs.map(log => (
              <div key={log.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900 mr-2">{log.user_name}</span>
                  <span className="text-stone-700">{log.action}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-4">
                  {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
