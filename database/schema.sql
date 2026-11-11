-- ====================================================================
-- WarLok (Warung Lokal) - Database Schema (MySQL / MariaDB / InnoDB)
-- Sesuai Dokumen Technical Implementation Plan Section 3
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `warlok_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `warlok_db`;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'merchant', 'admin') NOT NULL DEFAULT 'customer',
  `phone` VARCHAR(25) NOT NULL,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 2. Tabel Addresses (Alamat Pengguna / Kos Mahasiswa)
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `label` VARCHAR(50) NOT NULL DEFAULT 'Kos',
  `address` TEXT NOT NULL,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tabel Stores (Warung / Toko Kelontong)
CREATE TABLE IF NOT EXISTS `stores` (
  `id` VARCHAR(50) NOT NULL,
  `owner_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `address` TEXT NOT NULL,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `phone` VARCHAR(25) NOT NULL,
  `opening_hours` VARCHAR(100) NOT NULL DEFAULT '07.00 - 22.00 WIB',
  `status` ENUM('pending', 'active', 'rejected', 'suspended') NOT NULL DEFAULT 'pending',
  `verified_at` TIMESTAMP NULL DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  `total_reviews` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_store_geo` (`lat`, `lng`),
  INDEX `idx_store_status` (`status`),
  FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Tabel Store Documents (KTP, Foto Toko, NIB untuk Verifikasi Admin)
CREATE TABLE IF NOT EXISTS `store_documents` (
  `id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `type` ENUM('ktp', 'foto_toko', 'surat_usaha') NOT NULL,
  `review_note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabel Categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `icon` VARCHAR(50) NULL,
  `parent_id` VARCHAR(50) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 6. Tabel Master Products (Master data global, dimoderasi admin)
CREATE TABLE IF NOT EXISTS `master_products` (
  `id` VARCHAR(50) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) NOT NULL DEFAULT 'Umum',
  `unit` VARCHAR(50) NOT NULL,
  `description` TEXT NULL,
  `suggested_price` INT UNSIGNED NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 7. Tabel Store Products (Inventaris per Warung)
CREATE TABLE IF NOT EXISTS `store_products` (
  `id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `master_product_id` VARCHAR(50) NULL,
  `name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) NOT NULL DEFAULT 'Umum',
  `category_id` VARCHAR(50) NOT NULL,
  `unit` VARCHAR(50) NOT NULL,
  `variant` VARCHAR(100) NULL,
  `price` INT UNSIGNED NOT NULL,
  `stock` INT NOT NULL DEFAULT 0,
  `low_stock_threshold` INT UNSIGNED NOT NULL DEFAULT 5,
  `is_available` BOOLEAN NOT NULL DEFAULT TRUE,
  `votes_available` INT UNSIGNED NOT NULL DEFAULT 0,
  `votes_empty` INT UNSIGNED NOT NULL DEFAULT 0,
  `confidence_score` TINYINT UNSIGNED NOT NULL DEFAULT 100,
  `is_doubtful` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_store_product` (`store_id`, `master_product_id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`master_product_id`) REFERENCES `master_products`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Tabel Reservations (Reservasi Barang - Ambil di Tempat)
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` VARCHAR(50) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `customer_id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `status` ENUM('pending', 'accepted', 'rejected', 'expired', 'picked_up', 'cancelled') NOT NULL DEFAULT 'pending',
  `total_amount` INT UNSIGNED NOT NULL DEFAULT 0,
  `note` TEXT NULL,
  `pickup_estimated_time` VARCHAR(100) NULL,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_reservation_status_exp` (`status`, `expires_at`),
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. Tabel Reservation Items (Item per Reservasi dengan Snapshot Harga)
CREATE TABLE IF NOT EXISTS `reservation_items` (
  `id` VARCHAR(50) NOT NULL,
  `reservation_id` VARCHAR(50) NOT NULL,
  `store_product_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(150) NOT NULL,
  `variant` VARCHAR(100) NULL,
  `unit` VARCHAR(50) NOT NULL,
  `qty` INT UNSIGNED NOT NULL,
  `price_snapshot` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`store_product_id`) REFERENCES `store_products`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. Tabel Reviews (Ulasan & Rating Warung)
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL,
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Tabel Stock Votes (Voting Akurasi Stok Komunitas)
CREATE TABLE IF NOT EXISTS `stock_votes` (
  `id` VARCHAR(50) NOT NULL,
  `store_product_id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `vote` ENUM('available', 'empty') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_product_id`) REFERENCES `store_products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 12. Tabel Reports (Laporan Ketidaksesuaian Stok / Masalah Toko)
CREATE TABLE IF NOT EXISTS `reports` (
  `id` VARCHAR(50) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `reporter_id` VARCHAR(50) NOT NULL,
  `type` ENUM('stock_inaccurate', 'wrong_price', 'store_closed', 'other') NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('open', 'resolved', 'dismissed') NOT NULL DEFAULT 'open',
  `admin_note` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Tabel Search Logs (Analitik Kata Kunci Pencarian Mahasiswa)
CREATE TABLE IF NOT EXISTS `search_logs` (
  `id` VARCHAR(50) NOT NULL,
  `keyword` VARCHAR(150) NOT NULL,
  `user_id` VARCHAR(50) NULL,
  `lat` DECIMAL(10, 8) NOT NULL,
  `lng` DECIMAL(11, 8) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_search_kw` (`keyword`),
  INDEX `idx_search_geo` (`lat`, `lng`)
) ENGINE=InnoDB;

-- 14. Tabel Activity Logs (Audit Trail Sistem)
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `meta` JSON NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
