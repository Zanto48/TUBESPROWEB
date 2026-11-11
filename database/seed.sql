-- ====================================================================
-- WarLok (Warung Lokal) - Seed Data (MySQL)
-- Sesuai Dokumen Technical Implementation Plan Section 3 & 7
-- ====================================================================

USE `warlok_db`;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `activity_logs`;
TRUNCATE TABLE `search_logs`;
TRUNCATE TABLE `reports`;
TRUNCATE TABLE `stock_votes`;
TRUNCATE TABLE `reviews`;
TRUNCATE TABLE `reservation_items`;
TRUNCATE TABLE `reservations`;
TRUNCATE TABLE `store_products`;
TRUNCATE TABLE `store_documents`;
TRUNCATE TABLE `stores`;
TRUNCATE TABLE `master_products`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `addresses`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed Users (password default: 'password123' di-hash dengan password_hash BCRYPT)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `status`) VALUES
('usr_customer_1', 'Dimas Wicaksono', 'dimas@student.ac.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'customer', '0812-9876-5432', 'active'),
('usr_customer_2', 'Siti Nurhaliza', 'siti@student.ac.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'customer', '0852-7711-2299', 'active'),
('usr_customer_3', 'Fajar Nugraha', 'fajar@student.ac.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'customer', '0813-4455-6677', 'active'),
('usr_customer_4', 'Bima Sakti', 'bima@student.ac.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'customer', '0819-9988-7766', 'active'),
('usr_merchant_1', 'Pak Slamet Riyadi', 'slamet@warungmadura.com', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0857-1122-3344', 'active'),
('usr_sri_wati', 'Ibu Sri Watiningsih', 'sri@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0813-8877-6655', 'active'),
('usr_makmur_adi', 'H. Makmur Subagyo', 'makmur@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0819-2233-4455', 'active'),
('usr_anton_wijaya', 'Mas Anton', 'anton@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0878-3344-9900', 'active'),
('usr_hasan_bisri', 'Cak Hasan', 'hasan@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0822-4455-6677', 'active'),
('usr_joko_santoso', 'Pak Joko Santoso', 'joko@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'merchant', '0812-7788-9900', 'active'),
('usr_admin_1', 'Admin WarLok Pusat', 'admin@warlok.id', '$2y$10$e7V7x6c7Q0xL6t5m3G1lPeZ4O/1N5FpE5uG0jM.g7Zl4g5m3G1lPe', 'admin', '0800-1-WARLOK', 'active');

-- 2. Seed Categories
INSERT INTO `categories` (`id`, `name`, `icon`) VALUES
('cat_instant', 'Mie & Makanan Cepat', 'Soup'),
('cat_sembako', 'Beras, Telur & Minyak', 'Egg'),
('cat_minuman', 'Minuman Dingin & Kopi', 'Coffee'),
('cat_snack', 'Snack & Camilan Begadang', 'Cookie'),
('cat_mandi', 'Sabun & Kebersihan Kos', 'Sparkles'),
('cat_obat', 'Obat Ringan & P3K', 'HeartPulse');

-- 3. Seed Master Products
INSERT INTO `master_products` (`id`, `category_id`, `name`, `brand`, `unit`, `description`, `suggested_price`) VALUES
('mp_indomie_goreng', 'cat_instant', 'Indomie Goreng Spesial', 'Indofood', 'Bungkus (85g)', 'Mie instan goreng legendaris nomor satu anak kos.', 3500),
('mp_indomie_kari', 'cat_instant', 'Indomie Kuah Kari Ayam', 'Indofood', 'Bungkus (72g)', 'Kuah kari kental gurih, cocok saat hujan atau lapar malam.', 3500),
('mp_sedaap_goreng', 'cat_instant', 'Mie Sedaap Goreng Kriuk', 'Wings Food', 'Bungkus (90g)', 'Dilengkapi kriuk-kriuk bawang goreng gurih renyah.', 3300),
('mp_popmie_pedas', 'cat_instant', 'Pop Mie Pedas Dower', 'Indofood', 'Cup (75g)', 'Tinggal seduh air panas di kos, pedas nampol.', 6000),
('mp_telur_kg', 'cat_sembako', 'Telur Ayam Negeri Segar', 'Lokal Peternak', '1 Kilogram (isi 16 butir)', 'Telur segar pilihan, kaya protein untuk stok harian.', 28000),
('mp_telur_setengah', 'cat_sembako', 'Telur Ayam Negeri', 'Lokal Peternak', '1/2 Kilogram (isi 8 butir)', 'Porsi hemat pas buat persediaan 3-4 hari di kos.', 14500),
('mp_beras_1kg', 'cat_sembako', 'Beras Ramos Setra Pulen', 'Ramos Super', '1 Kilogram', 'Beras putih bersih pulen tanpa pemutih & pengawet.', 15000),
('mp_minyak_goreng_1l', 'cat_sembako', 'Minyak Goreng Minyakita Pouch', 'Minyakita', 'Pouch 1 Liter', 'Minyak goreng kelapa sawit higienis subsidi pemerintah.', 16500),
('mp_le_minerale_600', 'cat_minuman', 'Le Minerale Botol Dingin', 'Mayora', 'Botol 600ml', 'Air mineral alami dengan rasa manis khas pegunungan.', 3500),
('mp_aqua_600', 'cat_minuman', 'AQUA Air Mineral Dingin', 'Danone AQUA', 'Botol 600ml', 'Air mineral murni pegunungan sejuk dari kulkas warung.', 4000),
('mp_teh_pucuk', 'cat_minuman', 'Teh Pucuk Harum Dingin', 'Mayora', 'Botol 350ml', 'Teh melati manis segar dingin peneman makan siang.', 4000),
('mp_kopi_kapal_api', 'cat_minuman', 'Kopi Kapal Api Special Mix', 'Kapal Api', 'Renceng (10 Sachet)', 'Kopi hitam plus gula mantap untuk begadang nugas.', 15000),
('mp_chitato_lite', 'cat_snack', 'Chitato Lite Rumput Laut', 'Indofood', 'Bungkus (68g)', 'Keripik kentang tipis renyah rasa nori.', 11000),
('mp_nabati_wafer', 'cat_snack', 'Nabati Wafer Keju Richeese', 'Nabati', 'Bungkus (132g)', 'Wafer renyah dengan krim keju gurih melimpah.', 8500),
('mp_sabun_lifebuoy', 'cat_mandi', 'Sabun Batang Lifebuoy Total 10', 'Unilever', 'Batang (110g)', 'Perlindungan kuman antibakteri harian.', 5000),
('mp_daia_deterjen', 'cat_mandi', 'Daia Deterjen Bubuk Bunga', 'Wings', 'Bungkus (250g)', 'Deterjen wangi semerbak, cuci baju manual di kosan.', 6500),
('mp_tolak_angin', 'cat_obat', 'Tolak Angin Cair Herbal', 'Sido Muncul', 'Sachet (15ml)', 'Penyelamat anak kos saat masuk angin, meriang & capek.', 4500),
('mp_panadol_extra', 'cat_obat', 'Panadol Extra Merah', 'GSK', 'Strip (10 Kaplet)', 'Meredakan sakit kepala tegang saat skripsi atau ujian.', 14000);

-- 4. Seed Stores (Sekitar Titik GPS Pengguna: -6.9110, 107.6177)
INSERT INTO `stores` (`id`, `owner_id`, `name`, `description`, `address`, `lat`, `lng`, `phone`, `opening_hours`, `status`, `verified_at`, `rating`, `total_reviews`) VALUES
('str_madura_berkah', 'usr_merchant_1', 'Warung Madura Berkah 24 Jam', 'Buka nonstop 24 jam! Sedia sembako lengkap, rokok, minuman dingin, es batu kristal, gas 3kg, dan bensin eceran.', 'Jl. Sekitar Lokasi GPS No. 42 (115m dari titik Anda)', -6.91020000, 107.61840000, '0857-1122-3344', '24 Jam Nonstop', 'active', '2026-01-15 10:00:00', 4.80, 42),
('str_kelontong_bu_sri', 'usr_sri_wati', 'Toko Kelontong Barokah Bu Sri', 'Spesialis telur segar langsung peternak, beras pulen Delanggu, minyak curah & kemasan, bumbu dapur dan sabun murah.', 'Gang Melati No. 8 (125m dari titik Anda)', -6.91180000, 107.61690000, '0813-8877-6655', '06.00 - 22.00 WIB', 'active', '2026-01-20 14:30:00', 4.70, 29),
('str_sembako_makmur', 'usr_makmur_adi', 'Warung Sembako Kos Makmur', 'Pusat belanja sembako hemat mahasiswa. Ada mie instan lengkap semua varian, biskuit, tolak angin, dan air galon AQUA.', 'Jl. Raya Kosan No. 19B (205m dari titik Anda)', -6.90960000, 107.61650000, '0819-2233-4455', '06.30 - 23.30 WIB', 'active', '2026-02-01 09:15:00', 4.60, 35),
('str_pojok_mahasiswa', 'usr_anton_wijaya', 'Toko Pojok Mahasiswa', 'Warung serba ada dekat gerbang kos putri. Tersedia ATK ringan, cemilan impor, minuman boba sachet, deterjen, dan pembalut.', 'Jl. Pojok Asri I No. 12 (220m dari titik Anda)', -6.91240000, 107.61910000, '0878-3344-9900', '07.00 - 23.00 WIB', 'active', '2026-02-10 11:00:00', 4.50, 18),
('str_alfalah_24', 'usr_hasan_bisri', 'Warung Madura Al-Falah', 'Warung Madura dekat persimpangan jalan. Es kristal siap banyak, token listrik, pulsa, Indomie, sabun cuci.', 'Jl. Raya Utama No. 101 (320m dari titik Anda)', -6.90880000, 107.61960000, '0822-4455-6677', '24 Jam Nonstop', 'active', '2026-02-18 16:20:00', 4.90, 51),
('str_berkah_mandiri_pending', 'usr_joko_santoso', 'Toko Berkah Mandiri (Menunggu Verifikasi)', 'Baru buka dekat lokasi Anda! Sedia gas LPG 3kg, aqua galon, galon Le Minerale, dan frozen food ringan.', 'Jl. Seberang Kos No. 88 (325m dari titik Anda)', -6.91320000, 107.61580000, '0812-7788-9900', '07.00 - 22.00 WIB', 'pending', NULL, 0.00, 0);

-- 5. Seed Store Documents (untuk verifikasi admin)
INSERT INTO `store_documents` (`id`, `store_id`, `file_path`, `type`, `review_note`) VALUES
('doc_1', 'str_berkah_mandiri_pending', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400', 'ktp', 'Foto KTP sesuai identitas pemilik'),
('doc_2', 'str_berkah_mandiri_pending', 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400', 'foto_toko', 'Plang toko terlihat jelas di pinggir jalan raya');

-- 6. Seed Store Products
INSERT INTO `store_products` (`id`, `store_id`, `master_product_id`, `name`, `brand`, `category_id`, `unit`, `variant`, `price`, `stock`, `low_stock_threshold`, `is_available`, `votes_available`, `votes_empty`, `confidence_score`, `is_doubtful`) VALUES
('sp_mb_1', 'str_madura_berkah', 'mp_indomie_goreng', 'Indomie Goreng Spesial', 'Indofood', 'cat_instant', 'Bungkus', 'Original', 3500, 48, 10, 1, 14, 1, 93, 0),
('sp_mb_2', 'str_madura_berkah', 'mp_indomie_kari', 'Indomie Kuah Kari Ayam', 'Indofood', 'cat_instant', 'Bungkus', 'Kari Ayam', 3500, 30, 10, 1, 8, 0, 100, 0),
('sp_mb_3', 'str_madura_berkah', 'mp_telur_kg', 'Telur Ayam Negeri Segar', 'Lokal Peternak', 'cat_sembako', '1 Kg (isi 16)', 'Segar', 27500, 12, 5, 1, 12, 2, 86, 0),
('sp_mb_4', 'str_madura_berkah', 'mp_le_minerale_600', 'Le Minerale Botol Dingin', 'Mayora', 'cat_minuman', 'Botol 600ml', 'Dingin', 3500, 24, 8, 1, 19, 0, 100, 0),
('sp_mb_5', 'str_madura_berkah', 'mp_tolak_angin', 'Tolak Angin Cair Herbal', 'Sido Muncul', 'cat_obat', 'Sachet', 'Herbal', 4500, 3, 5, 1, 5, 1, 83, 0),
('sp_mb_6', 'str_madura_berkah', 'mp_kopi_kapal_api', 'Kopi Kapal Api Special Mix', 'Kapal Api', 'cat_minuman', 'Renceng (10 sachet)', 'Special Mix', 15000, 7, 3, 1, 6, 0, 100, 0),

('sp_bs_1', 'str_kelontong_bu_sri', 'mp_indomie_goreng', 'Indomie Goreng Spesial', 'Indofood', 'cat_instant', 'Bungkus', 'Original', 3400, 65, 15, 1, 18, 1, 95, 0),
('sp_bs_2', 'str_kelontong_bu_sri', 'mp_telur_kg', 'Telur Ayam Negeri Segar', 'Lokal Peternak', 'cat_sembako', '1 Kg', 'Segar', 27000, 35, 10, 1, 22, 1, 96, 0),
('sp_bs_3', 'str_kelontong_bu_sri', 'mp_beras_1kg', 'Beras Ramos Setra Pulen', 'Ramos Super', 'cat_sembako', '1 Kg', 'Pulen', 14800, 50, 15, 1, 10, 0, 100, 0),
('sp_bs_4', 'str_kelontong_bu_sri', 'mp_minyak_goreng_1l', 'Minyak Goreng Minyakita Pouch', 'Minyakita', 'cat_sembako', 'Pouch 1L', 'Minyak Goreng', 16500, 2, 5, 1, 3, 4, 42, 1),
('sp_bs_5', 'str_kelontong_bu_sri', 'mp_sabun_lifebuoy', 'Sabun Batang Lifebuoy Total 10', 'Unilever', 'cat_mandi', 'Batang', 'Total 10', 4800, 20, 5, 1, 6, 0, 100, 0),

('sp_sm_1', 'str_sembako_makmur', 'mp_indomie_goreng', 'Indomie Goreng Spesial', 'Indofood', 'cat_instant', 'Bungkus', 'Original', 3500, 40, 10, 1, 11, 0, 100, 0),
('sp_sm_2', 'str_sembako_makmur', 'mp_sedaap_goreng', 'Mie Sedaap Goreng Kriuk', 'Wings Food', 'cat_instant', 'Bungkus', 'Kriuk', 3300, 35, 8, 1, 9, 0, 100, 0),
('sp_sm_3', 'str_sembako_makmur', 'mp_le_minerale_600', 'Le Minerale Botol Dingin', 'Mayora', 'cat_minuman', 'Botol 600ml', 'Dingin', 3300, 30, 6, 1, 14, 1, 93, 0),
('sp_sm_4', 'str_sembako_makmur', 'mp_tolak_angin', 'Tolak Angin Cair Herbal', 'Sido Muncul', 'cat_obat', 'Sachet', 'Herbal', 4300, 18, 5, 1, 8, 0, 100, 0),
('sp_sm_5', 'str_sembako_makmur', 'mp_panadol_extra', 'Panadol Extra Merah', 'GSK', 'cat_obat', 'Strip (10 kaplet)', 'Extra', 13500, 8, 3, 1, 7, 0, 100, 0),

('sp_pm_1', 'str_pojok_mahasiswa', 'mp_popmie_pedas', 'Pop Mie Pedas Dower', 'Indofood', 'cat_instant', 'Cup', 'Pedas Dower', 6000, 15, 4, 1, 12, 0, 100, 0),
('sp_pm_2', 'str_pojok_mahasiswa', 'mp_teh_pucuk', 'Teh Pucuk Harum Dingin', 'Mayora', 'cat_minuman', 'Botol 350ml', 'Melati', 4000, 25, 6, 1, 10, 0, 100, 0),
('sp_pm_3', 'str_pojok_mahasiswa', 'mp_chitato_lite', 'Chitato Lite Rumput Laut', 'Indofood', 'cat_snack', 'Bungkus', 'Rumput Laut', 11000, 12, 4, 1, 5, 0, 100, 0),
('sp_pm_4', 'str_pojok_mahasiswa', 'mp_daia_deterjen', 'Daia Deterjen Bubuk Bunga', 'Wings', 'cat_mandi', 'Bungkus 250g', 'Bunga', 6500, 14, 4, 1, 6, 0, 100, 0),

('sp_af_1', 'str_alfalah_24', 'mp_indomie_goreng', 'Indomie Goreng Spesial', 'Indofood', 'cat_instant', 'Bungkus', 'Original', 3500, 60, 15, 1, 25, 0, 100, 0),
('sp_af_2', 'str_alfalah_24', 'mp_aqua_600', 'AQUA Air Mineral Dingin', 'Danone AQUA', 'cat_minuman', 'Botol 600ml', 'Dingin', 4000, 35, 8, 1, 15, 0, 100, 0),
('sp_af_3', 'str_alfalah_24', 'mp_telur_kg', 'Telur Ayam Negeri Segar', 'Lokal Peternak', 'cat_sembako', '1 Kg', 'Segar', 28500, 18, 5, 1, 14, 1, 93, 0);

-- 7. Seed Reservations
INSERT INTO `reservations` (`id`, `code`, `customer_id`, `store_id`, `status`, `total_amount`, `note`, `pickup_estimated_time`, `expires_at`, `created_at`) VALUES
('res_001', 'WL-8821', 'usr_customer_1', 'str_madura_berkah', 'accepted', 38000, 'Tolong plastikin rapi ya Pak, nanti saya mampir habis ashar sekitar jam 15.30.', '15:30 WIB', DATE_ADD(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
('res_002', 'WL-9104', 'usr_customer_2', 'str_madura_berkah', 'pending', 21500, 'Ambil sehabis kuliah jam 17.00. Tolong disiapkan ya Pak.', '17.00 WIB', DATE_ADD(NOW(), INTERVAL 120 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('res_003', 'WL-7612', 'usr_customer_1', 'str_kelontong_bu_sri', 'picked_up', 41800, 'Terima kasih Bu Sri sudah disiapkan pas jam pulang kuliah!', 'Sudah Diambil', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR));

-- 8. Seed Reservation Items
INSERT INTO `reservation_items` (`id`, `reservation_id`, `store_product_id`, `product_name`, `variant`, `unit`, `qty`, `price_snapshot`) VALUES
('ri_1', 'res_001', 'sp_mb_3', 'Telur Ayam Negeri Segar', 'Segar', '1 Kg (isi 16)', 1, 27500),
('ri_2', 'res_001', 'sp_mb_1', 'Indomie Goreng Spesial', 'Original', 'Bungkus', 3, 3500),
('ri_3', 'res_002', 'sp_mb_4', 'Le Minerale Botol Dingin', 'Dingin', 'Botol 600ml', 2, 3500),
('ri_4', 'res_002', 'sp_mb_5', 'Tolak Angin Cair Herbal', 'Herbal', 'Sachet', 2, 4500),
('ri_5', 'res_002', 'sp_mb_2', 'Indomie Kuah Kari Ayam', 'Kari Ayam', 'Bungkus', 1, 3500),
('ri_6', 'res_003', 'sp_bs_2', 'Telur Ayam Negeri Segar', 'Segar', '1 Kg', 1, 27000),
('ri_7', 'res_003', 'sp_bs_3', 'Beras Ramos Setra Pulen', 'Pulen', '1 Kg', 1, 14800);

-- 9. Seed Reviews
INSERT INTO `reviews` (`id`, `store_id`, `customer_id`, `rating`, `comment`) VALUES
('rev_1', 'str_madura_berkah', 'usr_customer_1', 5, 'Penyelamat pas lapar jam 2 dini hari! Stok Indomie dan es batu selalu siap, Pak Slamet ramah banget.'),
('rev_2', 'str_kelontong_bu_sri', 'usr_customer_2', 5, 'Telur di Bu Sri selalu fresh, jarang sekali yang retak/busuk. Harga paling murah se-Banjarsari.'),
('rev_3', 'str_sembako_makmur', 'usr_customer_3', 4, 'Bagus bisa reservasi dulu jadi nggak perlu antre atau kecele stok abis pas buru-buru berangkat praktikum.');

-- 10. Seed Reports
INSERT INTO `reports` (`id`, `store_id`, `reporter_id`, `type`, `description`, `status`, `admin_note`) VALUES
('rep_1', 'str_kelontong_bu_sri', 'usr_customer_3', 'stock_inaccurate', 'Di katalog tertera Minyakita Pouch masih ada, tapi tadi pas mampir ke toko katanya sudah habis dari kemarin sore.', 'open', NULL),
('rep_2', 'str_madura_berkah', 'usr_customer_4', 'wrong_price', 'Harga Telur di etalase toko Rp 28.000, di sistem tertera Rp 27.500. Selisih 500 rupiah.', 'resolved', 'Sudah dikonfirmasi ke Pak Slamet, penyesuaian harga promo mingguan telah disinkronkan.');

-- 11. Seed Search Logs
INSERT INTO `search_logs` (`id`, `keyword`, `user_id`, `lat`, `lng`) VALUES
('sl_1', 'Indomie Goreng', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_2', 'Es Batu', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_3', 'Aqua Galon', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_4', 'Telur 1kg', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_5', 'Tolak Angin', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_6', 'Indomie Kari', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_7', 'Beras Pulen', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_8', 'Es Batu', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_9', 'Pembalut Charm', 'usr_customer_1', -7.05050000, 110.43720000),
('sl_10', 'Kopi Kapal Api', 'usr_customer_1', -7.05050000, 110.43720000);

-- 12. Seed Activity Logs
INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `meta`) VALUES
('act_1', 'usr_admin_1', 'Memverifikasi Toko Warung Madura Berkah 24 Jam', NULL),
('act_2', 'usr_merchant_1', 'Menerima Reservasi #WL-8821 (Dimas Wicaksono)', NULL),
('act_3', 'usr_customer_1', 'Melakukan voting stok: Indomie Goreng Tersedia', NULL),
('act_4', 'usr_customer_3', 'Melaporkan ketidaksesuaian stok di Toko Bu Sri', NULL);
