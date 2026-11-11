<?php
/**
 * WarLok - Product Controller (PHP PDO for XAMPP)
 * Mengimplementasikan Section 4: Inventaris, Quick-Toggle & Radar Banding Harga (/compare)
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../core/Response.php';

class ProductController {
    public static function formatStoreProductRow(array $row): array {
        $row['price'] = (int)$row['price'];
        $row['stock'] = (int)$row['stock'];
        $row['low_stock_threshold'] = (int)$row['low_stock_threshold'];
        $row['is_available'] = (bool)$row['is_available'];
        $row['votes_available'] = (int)$row['votes_available'];
        $row['votes_empty'] = (int)$row['votes_empty'];
        $row['confidence_score'] = (int)$row['confidence_score'];
        $row['is_doubtful'] = (bool)$row['is_doubtful'];
        if (isset($row['distance_km'])) {
            $row['distance_km'] = (float)$row['distance_km'];
        }
        return $row;
    }

    public static function formatMasterProductRow(array $row): array {
        $row['suggested_price'] = (int)$row['suggested_price'];
        return $row;
    }

    /**
     * GET /compare?master_product_id=mp_indomie_goreng&lat=-7.0505&lng=110.4372
     */
    public static function comparePrices(string $masterProductId, float $lat, float $lng): void {
        $pdo = Database::getConnection();

        $sql = "SELECT sp.*, s.name as store_name, s.address as store_address, s.opening_hours,
                  ROUND((6371 * ACOS(
                    LEAST(1.0, GREATEST(-1.0,
                      COS(RADIANS(:lat1)) * COS(RADIANS(s.lat)) *
                      COS(RADIANS(s.lng) - RADIANS(:lng)) +
                      SIN(RADIANS(:lat2)) * SIN(RADIANS(s.lat))
                    ))
                  )), 2) AS distance_km
                FROM store_products sp
                JOIN stores s ON sp.store_id = s.id
                WHERE sp.master_product_id = :mp_id
                  AND s.status = 'active'
                  AND sp.is_available = 1
                ORDER BY sp.price ASC, distance_km ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':mp_id' => $masterProductId,
            ':lat1'  => $lat,
            ':lat2'  => $lat,
            ':lng'   => $lng
        ]);

        $results = array_map([self::class, 'formatStoreProductRow'], $stmt->fetchAll());
        Response::success($results, 'Perbandingan harga berhasil diambil');
    }

    /**
     * PATCH /store-products/{id}/toggle (Quick-toggle ketersediaan toko dalam 1 klik)
     */
    public static function toggle(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE store_products SET is_available = NOT is_available WHERE id = :id");
        $stmt->execute([':id' => $id]);

        $stmtGet = $pdo->prepare("SELECT * FROM store_products WHERE id = :id");
        $stmtGet->execute([':id' => $id]);
        $prod = $stmtGet->fetch();

        Response::success($prod ? self::formatStoreProductRow($prod) : null, 'Status ketersediaan produk berhasil diubah');
    }

    /**
     * PUT /store-products/{id} (Update harga & stok)
     */
    public static function updateStockAndPrice(string $id, int $stock, ?int $price = null): void {
        $pdo = Database::getConnection();
        $stock = max(0, $stock);

        $sql = "UPDATE store_products SET stock = :stock1, is_available = IF(:stock2 > 0, 1, 0)";
        $params = [':id' => $id, ':stock1' => $stock, ':stock2' => $stock];

        if ($price !== null) {
            $sql .= ", price = :price";
            $params[':price'] = $price;
        }
        $sql .= " WHERE id = :id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        Response::success(['id' => $id, 'stock' => $stock, 'price' => $price], 'Stok dan harga berhasil diperbarui');
    }

    /**
     * POST /store-products (Tambah produk baru ke inventaris warung)
     */
    public static function createStoreProduct(array $data): void {
        $pdo = Database::getConnection();
        $id = $data['id'] ?? ('sp_' . bin2hex(random_bytes(5)));
        $stock = (int)($data['stock'] ?? 10);
        $isAvailable = isset($data['is_available']) ? (int)(bool)$data['is_available'] : ($stock > 0 ? 1 : 0);

        $sql = "INSERT INTO store_products (id, store_id, master_product_id, name, brand, category_id, unit, variant, price, stock, low_stock_threshold, is_available, votes_available, votes_empty, confidence_score, is_doubtful)
                VALUES (:id, :store_id, :master_product_id, :name, :brand, :category_id, :unit, :variant, :price, :stock, :low_stock_threshold, :is_available, 1, 0, 100, 0)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'                  => $id,
            ':store_id'            => $data['store_id'],
            ':master_product_id'   => $data['master_product_id'] ?? null,
            ':name'                => $data['name'],
            ':brand'               => $data['brand'] ?? 'Umum',
            ':category_id'         => $data['category_id'] ?? 'cat_instant',
            ':unit'                => $data['unit'] ?? 'Pcs',
            ':variant'             => $data['variant'] ?? null,
            ':price'               => (int)($data['price'] ?? 0),
            ':stock'               => $stock,
            ':low_stock_threshold' => (int)($data['low_stock_threshold'] ?? 5),
            ':is_available'        => $isAvailable
        ]);

        $stmtGet = $pdo->prepare("SELECT * FROM store_products WHERE id = :id");
        $stmtGet->execute([':id' => $id]);
        $prod = $stmtGet->fetch();

        Response::success($prod ? self::formatStoreProductRow($prod) : ['id' => $id], 'Produk berhasil ditambahkan ke inventaris warung', 201);
    }

    /**
     * GET /master-products
     */
    public static function getMasterProducts(): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM master_products ORDER BY category_id, name ASC");
        $rows = array_map([self::class, 'formatMasterProductRow'], $stmt->fetchAll());
        Response::success($rows, 'Daftar master produk');
    }

    /**
     * POST /master-products
     */
    public static function createMasterProduct(array $data): void {
        $pdo = Database::getConnection();
        $id = $data['id'] ?? ('mp_' . bin2hex(random_bytes(5)));

        $stmt = $pdo->prepare("INSERT INTO master_products (id, category_id, name, brand, unit, description, suggested_price)
                               VALUES (:id, :category_id, :name, :brand, :unit, :description, :suggested_price)");
        $stmt->execute([
            ':id'              => $id,
            ':category_id'     => $data['category_id'] ?? 'cat_instant',
            ':name'            => $data['name'],
            ':brand'           => $data['brand'] ?? 'Umum',
            ':unit'            => $data['unit'] ?? 'Pcs',
            ':description'     => $data['description'] ?? '',
            ':suggested_price' => (int)($data['suggested_price'] ?? 0)
        ]);

        Response::success(['id' => $id], 'Master produk berhasil ditambahkan', 201);
    }

    /**
     * PUT /master-products/{id}
     */
    public static function updateMasterProduct(string $id, array $data): void {
        $pdo = Database::getConnection();
        $fields = [];
        $params = [':id' => $id];

        foreach (['category_id', 'name', 'brand', 'unit', 'description', 'suggested_price'] as $col) {
            if (array_key_exists($col, $data)) {
                $fields[] = "{$col} = :{$col}";
                $params[":{$col}"] = $col === 'suggested_price' ? (int)$data[$col] : $data[$col];
            }
        }

        if (!empty($fields)) {
            $sql = "UPDATE master_products SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }

        Response::success(['id' => $id], 'Master produk berhasil diperbarui');
    }
}
