# Technical Implementation Plan: WarLok (Warung Lokal)

Platform web yang menghubungkan mahasiswa dan masyarakat sekitar kos dengan jaringan warung/toko kelontong terdekat: katalog inventaris berbasis geolokasi, reservasi barang (ambil di tempat), dan pelaporan akurasi stok berbasis komunitas.

Rencana ini mengikuti setup: XAMPP, Vue + Tailwind di halaman `.html`, tiga frontend terpisah (customer, merchant, admin), satu backend API, dan satu database.

---

## 1. Tech Stack

| Layer | Pilihan | Catatan |
|---|---|---|
| Server | XAMPP (Apache + MySQL) | Satu virtual host atau folder `htdocs/warlok` |
| Backend | PHP 8 native (PDO) dengan router sederhana | Tanpa framework supaya ringan, tapi tetap terstruktur (routes, controllers, models) |
| Database | MySQL/MariaDB | Pakai InnoDB agar transaksi untuk reservasi berjalan |
| Frontend | Vue 3 via CDN + Tailwind (CDN untuk dev) | Tanpa build step, cocok dengan `.html` |
| Peta | Leaflet + OpenStreetMap | Gratis, tanpa API key |
| Geolokasi | Browser Geolocation API + rumus Haversine di SQL | Urutan toko berdasarkan radius |
| Auth | Token (JWT) atau PHP session + cookie | Role di token: `customer`, `merchant`, `admin` |
| Upload | Simpan di `/uploads`, path di DB | Berkas verifikasi toko dan foto produk |

## 2. Struktur Folder

```
warlok/
├── api/                      # backend tunggal
│   ├── index.php             # entry point + router
│   ├── config/               # db.php, app.php
│   ├── core/                 # Router, Request, Response, Auth, Validator
│   ├── middleware/           # auth.php, role.php
│   ├── controllers/          # AuthController, StoreController, ProductController, ...
│   ├── models/               # akses DB per entitas
│   └── cron/                 # expire_reservations.php
├── shared/                   # dipakai semua frontend
│   ├── js/                   # api.js (fetch wrapper), auth.js, utils.js
│   ├── components/           # navbar, toast, modal, map-picker, dll.
│   └── css/                  # tailwind config / custom
├── customer/                 # frontend customer
├── merchant/                 # frontend store owner
├── admin/                    # frontend admin
├── uploads/
├── database/                 # schema.sql, seed.sql
└── docs/                     # API contract, ERD
```

`shared/` adalah kunci konsistensi UI dan logika antarhalaman. Semua panggilan API lewat satu `api.js`, dan semua komponen UI dasar dibuat sekali lalu dipakai ulang.

## 3. Desain Database (inti)

| Tabel | Kolom utama |
|---|---|
| `users` | id, name, email, password_hash, role (`customer\|merchant\|admin`), phone, status |
| `addresses` | id, user_id, label, address, lat, lng |
| `stores` | id, owner_id, name, description, address, lat, lng, status (`pending\|active\|rejected\|suspended`), verified_at |
| `store_documents` | id, store_id, file_path, type, review_note |
| `categories` | id, name, parent_id |
| `master_products` | id, category_id, name, brand, unit, image (master data global, dimoderasi admin) |
| `store_products` | id, store_id, master_product_id, variant, price, stock, low_stock_threshold, is_available (quick-toggle) |
| `reservations` | id, customer_id, store_id, status (`pending\|accepted\|rejected\|expired\|picked_up\|cancelled`), expires_at, note |
| `reservation_items` | id, reservation_id, store_product_id, qty, price_snapshot |
| `reviews` | id, store_id, customer_id, rating, comment |
| `stock_votes` | id, store_product_id, user_id, vote (`available\|empty`), created_at |
| `reports` | id, store_id, reporter_id, type (`stock_inaccurate\|other`), description, status, admin_note |
| `search_logs` | id, keyword, user_id (nullable), lat, lng, created_at (sumber analitik pencarian merchant) |
| `activity_logs` | id, user_id, action, meta, created_at |

Index yang disarankan: `stores(lat, lng)`, `store_products(store_id, master_product_id)`, `reservations(status, expires_at)`.

## 4. Daftar API (ringkas)

**Auth & profil**
- `POST /auth/register`, `POST /auth/login`
- `GET/PUT /me`, `CRUD /me/addresses`

**Toko & verifikasi**
- `POST /stores` (ajukan toko), `GET/PUT /stores/{id}`
- `POST /stores/{id}/documents`
- `GET /admin/stores?status=pending`, `PATCH /admin/stores/{id}/verify`

**Inventaris**
- `GET /master-products`
- `CRUD /stores/{id}/products`
- `PATCH /store-products/{id}/toggle`
- `GET /stores/{id}/low-stock`

**Showcase**
- `GET /search?q=&lat=&lng=&radius=` (urut jarak)
- `GET /compare?master_product_id=&lat=&lng=` (bandingkan harga antar toko)
- `GET /stores/nearby`

**Reservasi**
- `POST /reservations`, `GET /reservations/mine`
- `PATCH /reservations/{id}/accept|reject|cancel|complete`
- `GET /merchant/reservations`

**Ulasan & laporan**
- `POST /stores/{id}/reviews`
- `POST /store-products/{id}/votes`
- `POST /reports`, `PATCH /admin/reports/{id}`

**Dashboard**
- `GET /dashboard/customer`, `GET /dashboard/merchant`, `GET /dashboard/admin`

Format response seragam:

```json
{ "success": true, "data": {}, "message": "", "errors": null }
```

## 5. Logika Teknis Kritis

### 5.1 Pencarian berdasarkan radius
Haversine di SQL, dengan bounding box lebih dulu agar index terpakai:

```sql
SELECT s.*,
  (6371 * ACOS(COS(RADIANS(:lat)) * COS(RADIANS(lat)) *
   COS(RADIANS(lng) - RADIANS(:lng)) +
   SIN(RADIANS(:lat)) * SIN(RADIANS(lat)))) AS distance_km
FROM stores s
WHERE status = 'active'
HAVING distance_km <= :radius
ORDER BY distance_km;
```

### 5.2 Reservasi dan penguncian stok
Bagian paling rawan bug:
1. Saat `POST /reservations`, jalankan dalam transaksi dengan `SELECT ... FOR UPDATE` pada `store_products`.
2. Cek `stock >= qty`, lalu kurangi stok (atau pakai kolom `stock_held`) dan set `expires_at` (misal 1–2 jam).
3. Jika merchant menolak, reservasi dibatalkan, atau `expires_at` lewat, stok dikembalikan.
4. Expiry dijalankan lewat `cron/expire_reservations.php` (Windows Task Scheduler di XAMPP), atau dicek lazy setiap ada request ke endpoint reservasi.

### 5.3 Login customer
- Browsing, pencarian, dan peta bisa diakses tanpa login.
- Login wajib hanya untuk reservasi, ulasan, vote, dan laporan.
- Pembayaran dilakukan langsung di toko (sesuai dokumen), sehingga tidak perlu menyimpan kredensial pembayaran.
- Keranjang disimpan di `localStorage` sampai customer checkout reservasi.

### 5.4 Verifikasi toko
Toko baru berstatus `pending` dan tidak muncul di pencarian sampai admin mengubahnya menjadi `active`.

### 5.5 Akurasi stok berbasis komunitas
- Hitung skor kepercayaan dari vote terbaru (misal 24 jam terakhir).
- Jika vote "kosong" melewati ambang (misal ≥3 dan >50%), tandai barang "diragukan" dan beri notifikasi ke merchant.
- Laporan yang berulang masuk ke antrean admin.

### 5.6 Keamanan dasar
- `password_hash()` / `password_verify()`
- Prepared statement (PDO) di semua query
- Validasi tipe dan ukuran file upload
- Middleware role di setiap endpoint
- CORS dibatasi

## 6. Pembagian Kerja (6 orang)

| Orang | Tanggung jawab | Modul yang tercakup |
|---|---|---|
| 1. Frontend/UI System | `shared/` (komponen, tema Tailwind, `api.js`, guideline UI) | Semua (fondasi) |
| 2. Backend | `core/`, auth, middleware, router, semua controller, aturan reservasi | Autentikasi, Reservasi, API semua modul |
| 3. Database | ERD, `schema.sql`, `seed.sql`, query Haversine, index, view analitik | Inventaris, Showcase, Dashboard (query) |
| 4. Customer app owner | `customer/`: pencarian, peta, bandingkan harga, reservasi, ulasan | Showcase, Reservasi, Ulasan |
| 5. Merchant app owner | `merchant/`: inventaris, quick-toggle, reservasi masuk, analitik pencarian | Inventaris, Reservasi, Dashboard merchant |
| 6. Admin app owner | `admin/`: verifikasi toko, moderasi master data, laporan, manajemen user | Verifikasi, Moderasi ulasan, Dashboard admin |

Aturan agar tidak bentrok:
- **API contract ditulis dulu** (`docs/api.md`) sebelum frontend dikerjakan.
- Frontend owner hanya memanggil fungsi di `shared/api.js`, bukan menulis `fetch` sendiri.
- Satu branch per fitur, merge lewat pull request.

## 7. Tahapan Implementasi

| Fase | Isi | Output |
|---|---|---|
| 0. Setup | Folder structure, repo Git, virtual host XAMPP, ERD, API contract, tema Tailwind | Skeleton berjalan, DB terbuat |
| 1. Fondasi | Auth multi-role, middleware, komponen `shared/`, layout tiap app | Login/register tiga role |
| 2. Toko & inventaris | Pengajuan toko, verifikasi admin, master produk, CRUD stok, toggle, low-stock | Merchant bisa mengelola produk |
| 3. Showcase | Pencarian radius, peta Leaflet, bandingkan harga | Customer bisa mencari dan membandingkan |
| 4. Reservasi | Transaksi stok, accept/reject, expiry | Alur reservasi lengkap |
| 5. Ulasan & laporan | Rating, vote stok, laporan, antrean admin | Komunitas dan moderasi berjalan |
| 6. Dashboard | Statistik per role, search log analitik | Tiga dashboard |
| 7. Finalisasi | Testing end-to-end, perbaikan bug, data demo, dokumentasi | Siap demo |

Fase 0–1 sebaiknya selesai lebih dulu (kira-kira minggu pertama) karena semua anggota bergantung padanya. Fase 2–5 bisa paralel setelah API contract disepakati.

## 8. Testing

- **API:** koleksi Postman/Thunder Client per endpoint.
- **Skenario kritis:**
  - Dua customer mereservasi stok terakhir bersamaan
  - Reservasi kedaluwarsa dan stok kembali
  - Merchant menolak reservasi
  - Toko `pending` tidak muncul di pencarian
- **Lintas role:** customer tidak bisa mengakses endpoint merchant/admin.

## 9. Definition of Done (per fitur)

- Endpoint backend sesuai API contract dan lolos uji Postman
- UI memakai komponen `shared/`, responsif di mobile
- Ada state loading, kosong, dan error
- Data seed tersedia untuk demo
- Sudah di-merge ke branch utama tanpa konflik
