# WarLok — Digitalisasi Ekosistem Toko Kelontong

WarLok adalah platform web yang dirancang untuk menghubungkan mahasiswa dengan toko kelontong di sekitar tempat tinggal melalui informasi lokasi, ketersediaan barang, dan harga. Dengan WarLok, pengguna dapat mencari kebutuhan sehari-hari tanpa harus mendatangi toko satu per satu hanya untuk mengecek stok.

Proyek ini dikembangkan sebagai Tugas Besar (Tubes) mata kuliah **Pemrograman Web**, Program Studi S1 Teknologi Informasi, Fakultas Informatika, Telkom University, tahun 2026.

## Latar Belakang

Pengecekan ketersediaan barang secara langsung dari satu toko ke toko lain dapat menghabiskan waktu. Informasi stok dan harga yang belum terpusat juga menyulitkan konsumen untuk membandingkan pilihan toko.

WarLok menawarkan pendekatan digital yang mengintegrasikan pencarian barang, informasi toko, inventaris, reservasi, dan validasi informasi oleh komunitas.

## Tujuan

- Memudahkan konsumen menemukan barang dan toko kelontong di sekitar lokasi.
- Menyediakan informasi harga dan ketersediaan barang untuk membantu perbandingan.
- Membantu pemilik toko mengelola inventaris dan informasi produk.
- Mendorong keakuratan data melalui laporan dan validasi komunitas.
- Mendukung pengelolaan serta pemantauan ekosistem melalui fitur administrasi dan analitik.

## Aktor Sistem

### Konsumen
Konsumen dapat mencari barang dan toko berdasarkan lokasi, membandingkan harga, melakukan reservasi stok untuk pengambilan fisik, serta memberikan ulasan atau laporan terkait keakuratan stok.

Lihat dokumentasi: [`konsumen/README.md`](konsumen/README.md)

### Merchant (Pemilik Toko)
Merchant dapat mengelola data toko dan inventaris, termasuk varian, harga, serta status ketersediaan barang. Merchant juga dapat menerima reservasi dan menyiapkan barang untuk diambil konsumen.

Lihat dokumentasi: [`merchant/README.md`](merchant/README.md)

### Admin
Admin berperan dalam pengelolaan ekosistem, termasuk verifikasi toko, moderasi laporan atau sengketa, pengelolaan hak akses, serta pemantauan analitik sistem.

Lihat dokumentasi: [`admin/README.md`](admin/README.md)

## Gambaran Fitur

- **Pencarian barang dan toko berbasis lokasi** — membantu menemukan toko berdasarkan radius terdekat.
- **Perbandingan harga** — memudahkan konsumen membandingkan harga barang antar toko.
- **Manajemen inventaris** — pengelolaan data barang, varian, harga, dan status stok.
- **Reservasi stok** — konsumen dapat menahan stok sementara sebelum mengambil barang di toko.
- **Ulasan dan validasi komunitas** — laporan serta voting untuk membantu memvalidasi keakuratan informasi stok.
- **Autentikasi dan verifikasi** — registrasi multi-peran, manajemen profil, serta proses pengajuan dan persetujuan toko.
- **Dashboard analitik** — ringkasan data yang relevan bagi pengelolaan sistem, toko, dan aktivitas pencarian.

## Alur Reservasi Singkat

1. Konsumen mencari barang dan memilih toko.
2. Konsumen melakukan reservasi untuk menahan kuota stok sementara.
3. Merchant menerima reservasi dan menyiapkan barang.
4. Konsumen mengambil barang dan melakukan pembayaran langsung di toko.

WarLok menggunakan konsep **lock-and-pickup**: reservasi dilakukan secara digital, sedangkan pengambilan dan pembayaran dilakukan secara fisik di toko.

## Struktur Repository

```text
.
├── README.md
├── konsumen/
│   └── README.md
├── merchant/
│   └── README.md
└── admin/
    └── README.md
```

Struktur di atas merupakan contoh dokumentasi. Sesuaikan nama folder dengan struktur repository yang digunakan oleh tim.

## Status Proyek

Proyek ini merupakan tugas besar pengembangan web. Detail implementasi, teknologi, cara instalasi, konfigurasi database, dan cara menjalankan aplikasi dapat ditambahkan setelah struktur serta implementasi proyek ditetapkan.

## Tim

Kelompok 6 — Kelas IT-48-01  
Mata Kuliah Pemrograman Web  
Program Studi S1 Teknologi Informasi, Fakultas Informatika  
Telkom University — 2026
