# Panduan Menjalankan WarLok di XAMPP (Apache + PHP 8 + MySQL)

Dokumen ini adalah panduan langkah-demi-langkah untuk menjalankan platform **WarLok (Warung Lokal)** di lingkungan lokal menggunakan **XAMPP**, sesuai dengan *Technical Implementation Plan*.

---

## 1. Persiapan Lingkungan

Pastikan laptop/komputer Anda sudah terinstal:
- **XAMPP** dengan PHP versi 8.1 atau yang lebih baru dan MySQL/MariaDB.
- Web browser modern (Chrome, Edge, Firefox).

---

## 2. Struktur Berkas di XAMPP

Salin seluruh isi folder proyek ini ke dalam folder `htdocs` XAMPP Anda:

```text
C:\xampp\htdocs\warlok\
├── api/
│   ├── config/
│   │   └── db.php                  # Koneksi PDO ke MySQL localhost
│   ├── controllers/
│   │   ├── StoreController.php      # Haversine radius search & verifikasi
│   │   ├── ProductController.php    # Quick-toggle & compare prices
│   │   ├── ReservationController.php# Transaksi SELECT FOR UPDATE & lock stok
│   │   └── VoteReportController.php # Voting komunitas & antrean aduan
│   ├── core/
│   │   └── Response.php            # Format JSON seragam Section 4
│   ├── cron/
│   │   └── expire_reservations.php # Pemulihan stok otomatis
│   └── index.php                   # Entry point + Router utama
├── database/
│   ├── schema.sql                  # Struktur 14 tabel InnoDB + relasi FK
│   └── seed.sql                    # Data demo warung, inventaris & reservasi
└── docs/
    └── XAMPP_SETUP_GUIDE.md
```

---

## 3. Langkah Instalasi Database

1. Buka **XAMPP Control Panel**, lalu klik tombol **Start** pada modul **Apache** dan **MySQL**.
2. Buka browser dan akses phpMyAdmin di:  
   `http://localhost/phpmyadmin/`
3. Klik tab **SQL** atau buat database baru bernama `warlok_db`.
4. Import berkas skema secara berurutan:
   - Klik tab **Import** -> Pilih berkas `warlok/database/schema.sql` -> Klik **Go / Kirim**.
   - Klik tab **Import** -> Pilih berkas `warlok/database/seed.sql` -> Klik **Go / Kirim**.
5. Database `warlok_db` Anda sekarang berisi 14 tabel lengkap dengan relasi *foreign key* dan data awal siap uji.

---

## 4. Pengujian Backend API di XAMPP

Setelah Apache menyala dan database di-import, Anda bisa langsung mengetes endpoint REST API berikut di browser atau Postman:

| Fitur | Method | URL di Browser / Postman |
|---|---|---|
| **Healthcheck** | `GET` | `http://localhost/warlok/api/` |
| **Cari Warung Terdekat** | `GET` | `http://localhost/warlok/api/stores/nearby?lat=-7.0505&lng=110.4372&radius=3` |
| **Bandingkan Harga** | `GET` | `http://localhost/warlok/api/compare?master_product_id=mp_indomie_goreng&lat=-7.0505&lng=110.4372` |
| **Detail Warung** | `GET` | `http://localhost/warlok/api/stores/str_madura_berkah` |
| **Master Produk** | `GET` | `http://localhost/warlok/api/master-products` |
| **Quick-Toggle Ketersediaan** | `PATCH` | `http://localhost/warlok/api/store-products/sp_mb_1/toggle` |
| **Simulasi Cron Expiry** | `GET` | `http://localhost/warlok/api/cron/expire_reservations.php?run=1` |

Format respon yang dikembalikan seragam sesuai kontrak:
```json
{
  "success": true,
  "data": { ... },
  "message": "Daftar warung terdekat berhasil diambil",
  "errors": null
}
```

---

## 5. Logika Kunci yang Dijalankan di XAMPP

1. **Pencarian Radius (Haversine di MySQL):**
   Dijalankan langsung di SQL engine MySQL tanpa library tambahan, menghitung jarak dalam kilometer secara akurat dari koordinat latitude & longitude pengguna.
2. **Transaksi Kunci Stok (*ACID & Lock*):**
   `ReservationController.php` mengeksekusi `SELECT ... FOR UPDATE` dalam transaksi InnoDB. Stok langsung dipotong saat reservasi dibuat.
3. **Pengembalian Stok Otomatis:**
   Jika pesanan ditolak penjual, dibatalkan pembeli, atau melewati batas waktu 90 menit (via `expire_reservations.php`), stok produk otomatis dikembalikan ke inventaris toko.
