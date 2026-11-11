<?php
/**
 * WarLok - Store Controller (PHP PDO for XAMPP)
 * Mengimplementasikan Section 5.1: Pencarian Radius dengan Haversine Formula
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../core/Response.php';

class StoreController {
    public static function formatStoreRow(array $row, array $documents = []): array {
        $row['lat'] = (float)$row['lat'];
        $row['lng'] = (float)$row['lng'];
        $row['rating'] = (float)$row['rating'];
        $row['total_reviews'] = (int)$row['total_reviews'];
        if (isset($row['distance_km'])) {
            $row['distance_km'] = (float)$row['distance_km'];
        }
        if (!empty($documents)) {
            $row['documents'] = $documents;
        }
        return $row;
    }

    /**
     * GET /stores/nearby?lat=-7.0505&lng=110.4372&radius=3
     * Haversine formula di SQL persis seperti Section 5.1
     */
    public static function getNearby(float $lat, float $lng, float $radiusKm = 5.0): void {
        $pdo = Database::getConnection();

        $sql = "SELECT s.*, u.name AS owner_name,
                  ROUND((6371 * ACOS(
                    LEAST(1.0, GREATEST(-1.0,
                      COS(RADIANS(:lat1)) * COS(RADIANS(s.lat)) *
                      COS(RADIANS(s.lng) - RADIANS(:lng)) +
                      SIN(RADIANS(:lat2)) * SIN(RADIANS(s.lat))
                    ))
                  )), 2) AS distance_km
                FROM stores s
                LEFT JOIN users u ON s.owner_id = u.id
                WHERE s.status = 'active'
                HAVING distance_km <= :radius
                ORDER BY distance_km ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->bindValue(':lat1', $lat);
        $stmt->bindValue(':lat2', $lat);
        $stmt->bindValue(':lng', $lng);
        $stmt->bindValue(':radius', $radiusKm);
        $stmt->execute();

        $stores = array_map([self::class, 'formatStoreRow'], $stmt->fetchAll());
        Response::success($stores, 'Daftar warung terdekat berhasil diambil');
    }

    /**
     * GET /stores
     */
    public static function getAll(): array {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT s.*, u.name AS owner_name FROM stores s LEFT JOIN users u ON s.owner_id = u.id ORDER BY s.created_at ASC");
        $rows = $stmt->fetchAll();

        $stmtDocs = $pdo->query("SELECT * FROM store_documents");
        $docsByStore = [];
        foreach ($stmtDocs->fetchAll() as $doc) {
            $docsByStore[$doc['store_id']][] = [
                'id'          => $doc['id'],
                'store_id'    => $doc['store_id'],
                'file_name'   => basename($doc['file_path']),
                'file_url'    => str_starts_with($doc['file_path'], 'http') ? $doc['file_path'] : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
                'type'        => $doc['type'],
                'review_note' => $doc['review_note']
            ];
        }

        return array_map(function ($row) use ($docsByStore) {
            return self::formatStoreRow($row, $docsByStore[$row['id']] ?? []);
        }, $rows);
    }

    /**
     * GET /stores/{id}
     */
    public static function getById(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT s.*, u.name AS owner_name FROM stores s LEFT JOIN users u ON s.owner_id = u.id WHERE s.id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $store = $stmt->fetch();

        if (!$store) {
            Response::error('Warung tidak ditemukan', null, 404);
            return;
        }

        $store = self::formatStoreRow($store);

        // Ambil produk warung
        $stmtProd = $pdo->prepare("SELECT * FROM store_products WHERE store_id = :store_id");
        $stmtProd->execute([':store_id' => $id]);
        $store['products'] = array_map([ProductController::class, 'formatStoreProductRow'], $stmtProd->fetchAll());

        // Ambil ulasan
        $stmtRev = $pdo->prepare("SELECT r.*, u.name as customer_name FROM reviews r JOIN users u ON r.customer_id = u.id WHERE r.store_id = :store_id ORDER BY r.created_at DESC");
        $stmtRev->execute([':store_id' => $id]);
        $store['reviews'] = $stmtRev->fetchAll();

        Response::success($store, 'Detail warung berhasil diambil');
    }

    /**
     * POST /stores (Pengajuan pendaftaran warung baru - status: pending)
     */
    public static function register(array $data): void {
        $pdo = Database::getConnection();

        $ownerId = $data['owner_id'] ?? 'usr_merchant_1';
        // Pastikan owner_id ada di tabel users agar tidak gagal FK
        $stmtUser = $pdo->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
        $stmtUser->execute([':id' => $ownerId]);
        if (!$stmtUser->fetch()) {
            $ownerId = 'usr_merchant_1';
        }

        $id = $data['id'] ?? ('str_' . bin2hex(random_bytes(6)));
        $sql = "INSERT INTO stores (id, owner_id, name, description, address, lat, lng, phone, opening_hours, status)
                VALUES (:id, :owner_id, :name, :description, :address, :lat, :lng, :phone, :opening_hours, 'pending')";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':id'            => $id,
            ':owner_id'      => $ownerId,
            ':name'          => $data['name'] ?? 'Warung Baru',
            ':description'   => $data['description'] ?? '',
            ':address'       => $data['address'] ?? '',
            ':lat'           => $data['lat'] ?? -7.0505,
            ':lng'           => $data['lng'] ?? 110.4372,
            ':phone'         => $data['phone'] ?? '0812-3456-7890',
            ':opening_hours' => $data['opening_hours'] ?? '07.00 - 22.00 WIB'
        ]);

        // Simpan dokumen jika ada
        $documents = $data['documents'] ?? [];
        $savedDocs = [];
        if (!empty($documents) && is_array($documents)) {
            $stmtDoc = $pdo->prepare("INSERT INTO store_documents (id, store_id, file_path, type, review_note)
                                      VALUES (:id, :store_id, :file_path, :type, :review_note)");
            foreach ($documents as $idx => $doc) {
                $docId = 'doc_' . bin2hex(random_bytes(5));
                $fileUrl = $doc['file_url'] ?? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400';
                $docType = in_array($doc['type'] ?? '', ['ktp', 'foto_toko', 'surat_usaha']) ? $doc['type'] : 'ktp';
                $stmtDoc->execute([
                    ':id'          => $docId,
                    ':store_id'    => $id,
                    ':file_path'   => $fileUrl,
                    ':type'        => $docType,
                    ':review_note' => 'Dokumen diunggah oleh pemilik warung'
                ]);
                $savedDocs[] = [
                    'id'          => $docId,
                    'store_id'    => $id,
                    'file_name'   => $doc['file_name'] ?? 'dokumen.jpg',
                    'file_url'    => $fileUrl,
                    'type'        => $docType,
                    'review_note' => 'Dokumen diunggah oleh pemilik warung'
                ];
            }
        }

        Response::success([
            'id'        => $id,
            'status'    => 'pending',
            'documents' => $savedDocs
        ], 'Pengajuan toko berhasil diajukan, menunggu verifikasi admin', 201);
    }

    /**
     * PATCH /admin/stores/{id}/verify (Verifikasi oleh Super Admin)
     */
    public static function verify(string $id, string $status, ?string $note = null): void {
        $pdo = Database::getConnection();
        $verifiedAt = ($status === 'active') ? date('Y-m-d H:i:s') : null;

        $stmt = $pdo->prepare("UPDATE stores SET status = :status, verified_at = :verified_at WHERE id = :id");
        $stmt->execute([
            ':status'      => $status,
            ':verified_at' => $verifiedAt,
            ':id'          => $id
        ]);

        if ($note !== null && $note !== '') {
            $stmtDoc = $pdo->prepare("UPDATE store_documents SET review_note = :note WHERE store_id = :store_id");
            $stmtDoc->execute([':note' => $note, ':store_id' => $id]);
        }

        Response::success(['id' => $id, 'status' => $status, 'verified_at' => $verifiedAt], 'Status verifikasi warung berhasil diperbarui');
    }

    /**
     * POST /stores/relocate
     * Memindahkan koordinat seluruh warung di database agar berada di sekitar titik GPS pengguna
     */
    public static function relocateToGps(float $lat, float $lng): void {
        $pdo = Database::getConnection();

        $offsets = [
            ['dlat' =>  0.0008, 'dlng' =>  0.0007], // ~115m NE
            ['dlat' => -0.0008, 'dlng' => -0.0008], // ~125m SW
            ['dlat' =>  0.0014, 'dlng' => -0.0012], // ~205m NW
            ['dlat' => -0.0014, 'dlng' =>  0.0014], // ~220m SE
            ['dlat' =>  0.0022, 'dlng' =>  0.0019], // ~320m NE
            ['dlat' => -0.0022, 'dlng' => -0.0019], // ~320m SW
        ];

        $stmt = $pdo->query("SELECT id FROM stores ORDER BY created_at ASC, id ASC");
        $storeIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $stmtUpdate = $pdo->prepare("UPDATE stores SET lat = :lat, lng = :lng WHERE id = :id");
        foreach ($storeIds as $idx => $storeId) {
            $offset = $offsets[$idx % count($offsets)];
            $mul = (int)floor($idx / count($offsets)) + 1;
            $newLat = round($lat + ($offset['dlat'] * $mul), 6);
            $newLng = round($lng + ($offset['dlng'] * $mul), 6);
            $stmtUpdate->execute([
                ':lat' => $newLat,
                ':lng' => $newLng,
                ':id'  => $storeId
            ]);
        }

        Response::success(self::getAll(), 'Koordinat seluruh warung di database berhasil dipindahkan ke sekitar titik GPS Anda');
    }
}
