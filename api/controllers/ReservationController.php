<?php
/**
 * WarLok - Reservation Controller (PHP PDO for XAMPP)
 * Mengimplementasikan Section 5.2: Transaksi Database & Penguncian Stok (SELECT ... FOR UPDATE)
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../core/Response.php';

class ReservationController {
    public static function getAll(): array {
        $pdo = Database::getConnection();
        $sql = "SELECT r.*, u.name AS customer_name, u.phone AS customer_phone, s.name AS store_name
                FROM reservations r
                LEFT JOIN users u ON r.customer_id = u.id
                LEFT JOIN stores s ON r.store_id = s.id
                ORDER BY r.created_at DESC";
        $reservations = $pdo->query($sql)->fetchAll();

        $stmtItems = $pdo->query("SELECT * FROM reservation_items");
        $itemsByRes = [];
        foreach ($stmtItems->fetchAll() as $item) {
            $item['qty'] = (int)$item['qty'];
            $item['price_snapshot'] = (int)$item['price_snapshot'];
            $itemsByRes[$item['reservation_id']][] = $item;
        }

        return array_map(function ($res) use ($itemsByRes) {
            $res['total_amount'] = (int)$res['total_amount'];
            $res['customer_name'] = $res['customer_name'] ?: 'Mahasiswa WarLok';
            $res['customer_phone'] = $res['customer_phone'] ?: '0812-9876-5432';
            $res['store_name'] = $res['store_name'] ?: 'Warung Lokal';
            $res['items'] = $itemsByRes[$res['id']] ?? [];
            return $res;
        }, $reservations);
    }

    /**
     * POST /reservations
     * Transaksi ACID dengan SELECT ... FOR UPDATE untuk mengunci stok
     */
    public static function create(array $payload): void {
        $pdo = Database::getConnection();

        $customerId = $payload['customer_id'] ?? 'usr_customer_1';
        $stmtUser = $pdo->prepare("SELECT id FROM users WHERE id = :id LIMIT 1");
        $stmtUser->execute([':id' => $customerId]);
        if (!$stmtUser->fetch()) {
            $customerId = 'usr_customer_1';
        }

        $storeId    = $payload['store_id'] ?? null;
        $items      = $payload['items'] ?? [];
        $note       = $payload['note'] ?? null;
        $pickupEst  = $payload['pickup_estimated_time'] ?? 'Dalam 1 jam';

        if (!$storeId || empty($items)) {
            Response::error('Toko atau daftar barang tidak boleh kosong', null, 422);
            return;
        }

        try {
            // 1. MULAI TRANSAKSI
            $pdo->beginTransaction();

            $totalAmount = 0;
            $validatedItems = [];

            // 2. Kunci baris produk dengan SELECT ... FOR UPDATE dan validasi stok
            $stmtLock = $pdo->prepare("SELECT id, name, unit, variant, price, stock, is_available FROM store_products WHERE id = :id AND store_id = :store_id FOR UPDATE");
            $stmtDeduct = $pdo->prepare("UPDATE store_products SET stock = stock - :qty1, is_available = IF(stock - :qty2 > 0, 1, 0) WHERE id = :id");

            foreach ($items as $item) {
                $prodId = $item['store_product_id'];
                $qty    = (int)($item['qty'] ?? 1);

                $stmtLock->execute([':id' => $prodId, ':store_id' => $storeId]);
                $product = $stmtLock->fetch();

                if (!$product) {
                    throw new Exception("Produk ID {$prodId} tidak ditemukan di warung ini.");
                }

                if (!$product['is_available'] || $product['stock'] < $qty) {
                    throw new Exception("Stok produk {$product['name']} tidak mencukupi (Tersisa: {$product['stock']}).");
                }

                // Potong stok langsung (Stock Holding)
                $stmtDeduct->execute([':qty1' => $qty, ':qty2' => $qty, ':id' => $prodId]);

                $subtotal = (int)$product['price'] * $qty;
                $totalAmount += $subtotal;

                $validatedItems[] = [
                    'store_product_id' => $prodId,
                    'product_name'     => $product['name'],
                    'variant'          => $product['variant'],
                    'unit'             => $product['unit'] ?: 'Pcs',
                    'qty'              => $qty,
                    'price_snapshot'   => (int)$product['price']
                ];
            }

            // 3. Buat Kode Reservasi & Expiration (+90 menit)
            $resId = $payload['id'] ?? ('res_' . bin2hex(random_bytes(6)));
            $code  = $payload['code'] ?? ('WL-' . rand(1000, 9999));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+90 minutes'));

            $stmtInsertRes = $pdo->prepare("INSERT INTO reservations (id, code, customer_id, store_id, status, total_amount, note, pickup_estimated_time, expires_at)
                                           VALUES (:id, :code, :customer_id, :store_id, 'pending', :total_amount, :note, :pickup_estimated_time, :expires_at)");
            $stmtInsertRes->execute([
                ':id'                    => $resId,
                ':code'                  => $code,
                ':customer_id'           => $customerId,
                ':store_id'              => $storeId,
                ':total_amount'          => $totalAmount,
                ':note'                  => $note,
                ':pickup_estimated_time' => $pickupEst,
                ':expires_at'            => $expiresAt
            ]);

            // 4. Masukkan item reservasi
            $stmtInsertItem = $pdo->prepare("INSERT INTO reservation_items (id, reservation_id, store_product_id, product_name, variant, unit, qty, price_snapshot)
                                            VALUES (:id, :res_id, :prod_id, :name, :variant, :unit, :qty, :price)");
            $savedItems = [];
            foreach ($validatedItems as $vItem) {
                $itemId = 'ri_' . bin2hex(random_bytes(6));
                $stmtInsertItem->execute([
                    ':id'      => $itemId,
                    ':res_id'  => $resId,
                    ':prod_id' => $vItem['store_product_id'],
                    ':name'    => $vItem['product_name'],
                    ':variant' => $vItem['variant'],
                    ':unit'    => $vItem['unit'],
                    ':qty'     => $vItem['qty'],
                    ':price'   => $vItem['price_snapshot']
                ]);
                $savedItems[] = array_merge(['id' => $itemId, 'reservation_id' => $resId], $vItem);
            }

            // 5. COMMIT TRANSAKSI
            $pdo->commit();

            Response::success([
                'reservation_id' => $resId,
                'code'           => $code,
                'total_amount'   => $totalAmount,
                'expires_at'     => $expiresAt,
                'items'          => $savedItems
            ], 'Reservasi berhasil dibuat dan stok barang telah dikunci', 201);

        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::error($e->getMessage(), null, 400);
        }
    }

    /**
     * PATCH /reservations/{id}/accept (Merchant menerima pesanan)
     */
    public static function accept(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE reservations SET status = 'accepted' WHERE id = :id AND status = 'pending'");
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            Response::error('Reservasi tidak dapat diterima atau status sudah berubah', null, 400);
            return;
        }

        Response::success(['id' => $id, 'status' => 'accepted'], 'Reservasi diterima oleh penjual');
    }

    /**
     * PATCH /reservations/{id}/reject ATAU /cancel (Mengembalikan stok!)
     */
    public static function cancelOrReject(string $id, string $targetStatus = 'rejected', ?string $reason = null): void {
        $pdo = Database::getConnection();

        try {
            $pdo->beginTransaction();

            $stmtCheck = $pdo->prepare("SELECT * FROM reservations WHERE id = :id FOR UPDATE");
            $stmtCheck->execute([':id' => $id]);
            $res = $stmtCheck->fetch();

            if (!$res || !in_array($res['status'], ['pending', 'accepted'])) {
                throw new Exception('Pesanan tidak dapat dibatalkan atau sudah selesai');
            }

            // Ambil item untuk dikembalikan stoknya
            $stmtItems = $pdo->prepare("SELECT store_product_id, qty FROM reservation_items WHERE reservation_id = :id");
            $stmtItems->execute([':id' => $id]);
            $items = $stmtItems->fetchAll();

            $stmtRestore = $pdo->prepare("UPDATE store_products SET stock = stock + :qty, is_available = 1 WHERE id = :id");
            foreach ($items as $item) {
                $stmtRestore->execute([':qty' => $item['qty'], ':id' => $item['store_product_id']]);
            }

            // Update status
            $note = $res['note'];
            if ($reason) {
                $note = ($note ? $note . ' | ' : '') . 'Alasan ditolak: ' . $reason;
            }

            $stmtUpdate = $pdo->prepare("UPDATE reservations SET status = :status, note = :note WHERE id = :id");
            $stmtUpdate->execute([':status' => $targetStatus, ':note' => $note, ':id' => $id]);

            $pdo->commit();
            Response::success(['id' => $id, 'status' => $targetStatus], "Pesanan berhasil di-{$targetStatus} dan stok telah dikembalikan");

        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            Response::error($e->getMessage(), null, 400);
        }
    }

    /**
     * PATCH /reservations/{id}/complete (Barang sudah diambil & dibayar)
     */
    public static function complete(string $id): void {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE reservations SET status = 'picked_up' WHERE id = :id");
        $stmt->execute([':id' => $id]);
        Response::success(['id' => $id, 'status' => 'picked_up'], 'Pesanan telah selesai diambil dan lunas');
    }
}
