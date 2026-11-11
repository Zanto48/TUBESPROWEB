<?php
/**
 * WarLok - Community Stock Voting, Reviews, Reports & Logs Controller (PHP PDO for XAMPP)
 * Mengimplementasikan Section 5.5: Akurasi Stok Berbasis Komunitas
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../core/Response.php';

class VoteReportController {
    private static function resolveValidUserId(PDO $pdo, string $userId, string $fallback = 'usr_customer_1'): string {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $userId]);
        return $stmt->fetch() ? $userId : $fallback;
    }

    /**
     * POST /store-products/{id}/votes
     * Hitung skor kepercayaan dari vote. Jika vote kosong >=3 dan <50%, tandai barang 'diragukan'.
     */
    public static function vote(string $productId, string $userId, string $voteType): void {
        $pdo = Database::getConnection();
        $validUserId = self::resolveValidUserId($pdo, $userId);
        $voteType = ($voteType === 'empty') ? 'empty' : 'available';

        // 1. Catat vote pengguna di tabel stock_votes
        $voteId = 'v_' . bin2hex(random_bytes(6));
        $stmtInsert = $pdo->prepare("INSERT INTO stock_votes (id, store_product_id, user_id, vote) VALUES (:id, :prod_id, :user_id, :vote)");
        $stmtInsert->execute([
            ':id'      => $voteId,
            ':prod_id' => $productId,
            ':user_id' => $validUserId,
            ':vote'    => $voteType
        ]);

        // 2. Ambil vote saat ini di store_products dan tambahkan 1
        $stmtProd = $pdo->prepare("SELECT votes_available, votes_empty FROM store_products WHERE id = :id LIMIT 1");
        $stmtProd->execute([':id' => $productId]);
        $prod = $stmtProd->fetch();

        $avail = (int)($prod['votes_available'] ?? 0) + ($voteType === 'available' ? 1 : 0);
        $empty = (int)($prod['votes_empty'] ?? 0) + ($voteType === 'empty' ? 1 : 0);
        $total = $avail + $empty;

        $confidence = $total > 0 ? (int)round(($avail / $total) * 100) : 100;
        $isDoubtful = ($empty >= 3 && $confidence < 50) ? 1 : 0;

        // 3. Update store_product
        $stmtUp = $pdo->prepare("UPDATE store_products SET votes_available = :avail, votes_empty = :empty, confidence_score = :conf, is_doubtful = :doubt WHERE id = :id");
        $stmtUp->execute([
            ':avail' => $avail,
            ':empty' => $empty,
            ':conf'  => $confidence,
            ':doubt' => $isDoubtful,
            ':id'    => $productId
        ]);

        Response::success([
            'store_product_id' => $productId,
            'votes_available'  => $avail,
            'votes_empty'      => $empty,
            'confidence_score' => $confidence,
            'is_doubtful'      => (bool)$isDoubtful
        ], 'Voting akurasi stok berhasil dicatat');
    }

    /**
     * POST /reports (Customer melaporkan ketidaksesuaian stok)
     */
    public static function createReport(array $payload): void {
        $pdo = Database::getConnection();
        $id = $payload['id'] ?? ('rep_' . bin2hex(random_bytes(6)));
        $reporterId = self::resolveValidUserId($pdo, $payload['reporter_id'] ?? 'usr_customer_1');

        $stmt = $pdo->prepare("INSERT INTO reports (id, store_id, reporter_id, type, description, status) 
                                VALUES (:id, :store_id, :reporter_id, :type, :desc, 'open')");
        $stmt->execute([
            ':id'          => $id,
            ':store_id'    => $payload['store_id'],
            ':reporter_id' => $reporterId,
            ':type'        => $payload['type'] ?? 'stock_inaccurate',
            ':desc'        => $payload['description'] ?? ''
        ]);

        Response::success(['id' => $id, 'status' => 'open'], 'Laporan berhasil diajukan ke antrean admin', 201);
    }

    /**
     * PATCH /admin/reports/{id} (Admin menindaklanjuti laporan)
     */
    public static function resolveReport(string $reportId, string $adminNote): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE reports SET status = 'resolved', admin_note = :note WHERE id = :id");
        $stmt->execute([':note' => $adminNote, ':id' => $reportId]);

        Response::success(['id' => $reportId, 'status' => 'resolved', 'admin_note' => $adminNote], 'Laporan telah diselesaikan oleh admin');
    }

    /**
     * POST /reviews (Customer memberikan ulasan ke warung)
     */
    public static function createReview(array $payload): void {
        $pdo = Database::getConnection();
        $id = $payload['id'] ?? ('rev_' . bin2hex(random_bytes(6)));
        $storeId = $payload['store_id'];
        $customerId = self::resolveValidUserId($pdo, $payload['customer_id'] ?? 'usr_customer_1');
        $rating = max(1, min(5, (int)($payload['rating'] ?? 5)));
        $comment = $payload['comment'] ?? '';

        $stmt = $pdo->prepare("INSERT INTO reviews (id, store_id, customer_id, rating, comment)
                               VALUES (:id, :store_id, :customer_id, :rating, :comment)");
        $stmt->execute([
            ':id'          => $id,
            ':store_id'    => $storeId,
            ':customer_id' => $customerId,
            ':rating'      => $rating,
            ':comment'     => $comment
        ]);

        // Hitung ulang rata-rata rating toko
        $stmtAvg = $pdo->prepare("SELECT ROUND(AVG(rating), 2) AS avg_rating, COUNT(*) AS total FROM reviews WHERE store_id = :store_id");
        $stmtAvg->execute([':store_id' => $storeId]);
        $stats = $stmtAvg->fetch();

        if ($stats) {
            $stmtUpStore = $pdo->prepare("UPDATE stores SET rating = :rating, total_reviews = total_reviews + 1 WHERE id = :id");
            $stmtUpStore->execute([
                ':rating' => (float)$stats['avg_rating'],
                ':id'     => $storeId
            ]);
        }

        Response::success(['id' => $id, 'rating' => $rating], 'Ulasan berhasil disimpan', 201);
    }

    /**
     * POST /search-logs
     */
    public static function logSearch(array $payload): void {
        $pdo = Database::getConnection();
        $id = $payload['id'] ?? ('sl_' . bin2hex(random_bytes(5)));
        $keyword = trim($payload['keyword'] ?? '');
        if ($keyword === '') {
            Response::error('Keyword kosong', null, 400);
            return;
        }

        $stmt = $pdo->prepare("INSERT INTO search_logs (id, keyword, user_id, lat, lng)
                               VALUES (:id, :keyword, :user_id, :lat, :lng)");
        $stmt->execute([
            ':id'      => $id,
            ':keyword' => $keyword,
            ':user_id' => $payload['user_id'] ?? 'usr_customer_1',
            ':lat'     => (float)($payload['lat'] ?? -7.0505),
            ':lng'     => (float)($payload['lng'] ?? 110.4372)
        ]);

        Response::success(['id' => $id], 'Log pencarian tercatat', 201);
    }

    /**
     * POST /activity-logs
     */
    public static function logActivity(array $payload): void {
        $pdo = Database::getConnection();
        $id = $payload['id'] ?? ('act_' . bin2hex(random_bytes(5)));
        $action = trim($payload['action'] ?? '');
        if ($action === '') {
            Response::error('Action kosong', null, 400);
            return;
        }

        $meta = isset($payload['meta']) ? json_encode($payload['meta'], JSON_UNESCAPED_UNICODE) : null;
        $stmt = $pdo->prepare("INSERT INTO activity_logs (id, user_id, action, meta)
                               VALUES (:id, :user_id, :action, :meta)");
        $stmt->execute([
            ':id'      => $id,
            ':user_id' => $payload['user_id'] ?? 'usr_customer_1',
            ':action'  => $action,
            ':meta'    => $meta
        ]);

        Response::success(['id' => $id], 'Log aktivitas tercatat', 201);
    }
}
