import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  FileCode, 
  Check, 
  Copy, 
  X, 
  ExternalLink, 
  Layers, 
  Terminal, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface XamppGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XamppGuideModal: React.FC<XamppGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'schema_sql' | 'seed_sql' | 'router_php' | 'reservation_php'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600/90 text-white flex items-center justify-center font-bold font-mono text-sm shadow-inner">
              X
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Panduan & Struktur Backend XAMPP (Apache + PHP 8 + MySQL)
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Sesuai Rencana Teknis
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Semua berkas backend PHP dan SQL sudah terbuat di dalam repositori ini dan siap disalin ke <code className="text-amber-300 font-mono">htdocs/warlok</code>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup panduan"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-5 pt-3 overflow-x-auto text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Langkah Menjalankan di XAMPP</span>
          </button>

          <button
            onClick={() => setActiveTab('schema_sql')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'schema_sql'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>database/schema.sql</span>
          </button>

          <button
            onClick={() => setActiveTab('seed_sql')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'seed_sql'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>database/seed.sql</span>
          </button>

          <button
            onClick={() => setActiveTab('router_php')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'router_php'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>api/index.php (Router)</span>
          </button>

          <button
            onClick={() => setActiveTab('reservation_php')}
            className={`pb-2.5 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reservation_php'
                ? 'border-emerald-700 text-emerald-900 font-bold'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>ReservationController.php</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-xs text-stone-800 bg-white">
          
          {/* TAB 1: Step-by-Step Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  1. Penempatan Folder di Komputer / Laptop Anda
                </h4>
                <p className="text-stone-600 mb-3 leading-relaxed">
                  Jika Anda menjalankan XAMPP di Windows, salin berkas proyek ini ke direktori:
                </p>
                <div className="bg-stone-900 text-stone-100 p-3 rounded-xl font-mono text-xs flex items-center justify-between">
                  <code>C:\xampp\htdocs\warlok\</code>
                  <button
                    onClick={() => handleCopy('C:\\xampp\\htdocs\\warlok\\', 'path')}
                    className="text-stone-400 hover:text-white transition-colors"
                  >
                    {copiedKey === 'path' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  2. Konfigurasi MySQL & Import Database di phpMyAdmin
                </h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-stone-600 leading-relaxed">
                  <li>Buka <strong>XAMPP Control Panel</strong>, nyalakan modul <strong>Apache</strong> dan <strong>MySQL</strong>.</li>
                  <li>Buka browser dan buka <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-900 font-mono">http://localhost/phpmyadmin/</code>.</li>
                  <li>Klik tombol <strong>New</strong> di panel kiri untuk membuat database baru dengan nama: <code className="bg-stone-100 px-1 py-0.5 rounded font-mono font-bold text-emerald-900">warlok_db</code>.</li>
                  <li>Klik tab <strong>Import</strong>, pilih file <code className="font-mono text-stone-900">warlok/database/schema.sql</code>, lalu klik tombol <strong>Go</strong> (Kirim).</li>
                  <li>Ulangi langkah Import untuk file <code className="font-mono text-stone-900">warlok/database/seed.sql</code> agar data demo warung & inventaris langsung terisi.</li>
                </ol>
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-900 mb-1">
                  3. Uji Endpoint Backend API di XAMPP
                </h4>
                <p className="text-stone-600 mb-3">
                  Setelah Apache berjalan, Anda dapat memanggil endpoint REST API berikut di browser atau Postman:
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 mr-2">GET</span>
                      <code className="font-mono text-stone-800">http://localhost/warlok/api/</code>
                      <span className="text-stone-500 block text-[11px] mt-0.5">Tes koneksi & status API Apache</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 mr-2">GET</span>
                      <code className="font-mono text-stone-800">http://localhost/warlok/api/stores/nearby?lat=-7.0505&lng=110.4372&radius=3</code>
                      <span className="text-stone-500 block text-[11px] mt-0.5">Pencarian warung terdekat rumus Haversine</span>
                    </div>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-emerald-800 mr-2">GET</span>
                      <code className="font-mono text-stone-800">http://localhost/warlok/api/compare?master_product_id=mp_indomie_goreng</code>
                      <span className="text-stone-500 block text-[11px] mt-0.5">Bandingkan harga antar-warung</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
                <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Kelebihan Menggunakan Skrip Backend Ini:
                </span>
                <p className="text-[11px] text-emerald-900/90 leading-relaxed">
                  Semua berkas PHP menggunakan PHP 8 Native dengan PDO prepared statements (anti-SQL Injection), transaksi database InnoDB (<code className="font-mono font-bold">SELECT ... FOR UPDATE</code>) untuk mencegah *race condition* stok saat banyak pembeli mereservasi bersamaan, dan format respon seragam sesuai standar industri.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: schema.sql */}
          {activeTab === 'schema_sql' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-600 mb-1">
                <span>Skema Database MySQL (14 Tabel Lengkap InnoDB)</span>
                <button
                  onClick={() => handleCopy(`-- Buka file /database/schema.sql di repositori proyek`, 'schema')}
                  className="flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>File tersimpan di /database/schema.sql</span>
                </button>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
{`-- Cuplikan Skema /database/schema.sql
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'merchant', 'admin') DEFAULT 'customer',
  phone VARCHAR(25) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(50) PRIMARY KEY,
  owner_id VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  status ENUM('pending', 'active', 'rejected', 'suspended') DEFAULT 'pending',
  INDEX idx_store_geo (lat, lng),
  FOREIGN KEY (owner_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reservations (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  customer_id VARCHAR(50) NOT NULL,
  store_id VARCHAR(50) NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'expired', 'picked_up', 'cancelled') DEFAULT 'pending',
  total_amount INT UNSIGNED NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_reservation_status_exp (status, expires_at)
) ENGINE=InnoDB;`}
              </pre>
            </div>
          )}

          {/* TAB 3: seed.sql */}
          {activeTab === 'seed_sql' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-600 mb-1">
                <span>Data Seed Awal Mahasiswa, Warung & Bahan Pokok (/database/seed.sql)</span>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
{`-- Data Awal Warung Sekitar Tembalang
INSERT INTO stores (id, owner_id, name, address, lat, lng, status) VALUES
('str_madura_berkah', 'usr_merchant_1', 'Warung Madura Berkah 24 Jam', 'Jl. Banjarsari Raya No. 42', -7.0518, 110.4385, 'active'),
('str_kelontong_bu_sri', 'usr_merchant_1', 'Toko Kelontong Barokah Bu Sri', 'Jl. Jatisari Gang 3 No. 8', -7.0492, 110.4361, 'active'),
('str_sembako_makmur', 'usr_merchant_1', 'Warung Sembako Kos Makmur', 'Jl. Sirojudin No. 19B', -7.0531, 110.4354, 'active');

-- Master Produk: Indomie, Telur, Beras, Aqua, Tolak Angin
INSERT INTO master_products (id, category_id, name, brand, suggested_price) VALUES
('mp_indomie_goreng', 'cat_instant', 'Indomie Goreng Spesial', 'Indofood', 3500),
('mp_telur_kg', 'cat_sembako', 'Telur Ayam Negeri Segar (1 Kg)', 'Lokal', 28000),
('mp_beras_1kg', 'cat_sembako', 'Beras Ramos Setra Pulen (1 Kg)', 'Ramos', 15000),
('mp_tolak_angin', 'cat_obat', 'Tolak Angin Cair Herbal', 'Sido Muncul', 4500);`}
              </pre>
            </div>
          )}

          {/* TAB 4: Router */}
          {activeTab === 'router_php' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-600 mb-1">
                <span>Entry Point & REST API Router (/api/index.php)</span>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
{`<?php
// /api/index.php - Routing sesuai kontrak API Section 4
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/core/Response.php';
require_once __DIR__ . '/controllers/StoreController.php';
require_once __DIR__ . '/controllers/ReservationController.php';

// Route: Cari warung terdekat dengan rumus Haversine
if ($method === 'GET' && $uri === '/stores/nearby') {
    StoreController::getNearby($_GET['lat'], $_GET['lng'], $_GET['radius']);
}

// Route: Buat Reservasi & Kunci Stok
if ($method === 'POST' && $uri === '/reservations') {
    ReservationController::create($body);
}

// Route: Bandingkan harga antar warung
if ($method === 'GET' && $uri === '/compare') {
    ProductController::comparePrices($_GET['master_product_id'], $_GET['lat'], $_GET['lng']);
}`}
              </pre>
            </div>
          )}

          {/* TAB 5: Reservation Controller */}
          {activeTab === 'reservation_php' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-600 mb-1">
                <span>Logika Kunci Stok & SELECT FOR UPDATE (/api/controllers/ReservationController.php)</span>
              </div>
              <pre className="p-4 bg-stone-900 text-stone-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed max-h-[500px]">
{`<?php
// Bagian krusial Section 5.2 Technical Implementation Plan:
$pdo->beginTransaction();

// Kunci baris dengan SELECT ... FOR UPDATE
$stmtLock = $pdo->prepare("SELECT id, name, stock, is_available 
                           FROM store_products 
                           WHERE id = :id FOR UPDATE");

// Cek ketersediaan
if ($product['stock'] < $qty) {
    throw new Exception("Stok tidak mencukupi");
}

// Kurangi stok (Stock Holding) dan set waktu kedaluwarsa 90 menit
$stmtDeduct->execute([':qty' => $qty, ':id' => $prodId]);

$pdo->commit();`}
              </pre>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 px-6 shrink-0">
          <span>Semua file telah dibuat di direktori: <strong className="text-stone-800">/api/</strong> dan <strong className="text-stone-800">/database/</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
