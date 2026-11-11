<?php
/**
 * WarLok - Expiration Cron Job
 * Sesuai Dokumen Technical Implementation Plan Section 5.2:
 * Memulihkan stok reservasi yang melewati expires_at (otomatis dijalankan berkala di XAMPP)
 */

require_once __DIR__ . '/../config/db.php';

function expireReservations(): int {
    $pdo = Database::getConnection();
    $now = date('Y-m-d H:i:s');

    try {
        $pdo->beginTransaction();

        // 1. Ambil semua reservasi yang kedaluwarsa
        $stmtFind = $pdo->prepare("SELECT id FROM reservations WHERE status IN ('pending', 'accepted') AND expires_at < :now FOR UPDATE");
        $stmtFind->execute([':now' => $now]);
        $expiredList = $stmtFind->fetchAll();

        if (empty($expiredList)) {
            $pdo->commit();
            return 0;
        }

        $stmtItems = $pdo->prepare("SELECT store_product_id, qty FROM reservation_items WHERE reservation_id = :id");
        $stmtRestore = $pdo->prepare("UPDATE store_products SET stock = stock + :qty, is_available = 1 WHERE id = :id");
        $stmtExpire = $pdo->prepare("UPDATE reservations SET status = 'expired' WHERE id = :id");

        foreach ($expiredList as $res) {
            $stmtItems->execute([':id' => $res['id']]);
            $items = $stmtItems->fetchAll();

            foreach ($items as $item) {
                $stmtRestore->execute([
                    ':qty' => $item['qty'],
                    ':id'  => $item['store_product_id']
                ]);
            }

            $stmtExpire->execute([':id' => $res['id']]);
        }

        $pdo->commit();
        return count($expiredList);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log("Error expiring reservations: " . $e->getMessage());
        return 0;
    }
}

// Jika dijalankan langsung via CLI atau web browser
if (php_sapi_name() === 'cli' || isset($_GET['run'])) {
    $count = expireReservations();
    echo json_encode([
        'success' => true,
        'message' => "Cron selesai: {$count} reservasi kedaluwarsa diproses dan stok dikembalikan.",
        'processed_count' => $count
    ]);
}
