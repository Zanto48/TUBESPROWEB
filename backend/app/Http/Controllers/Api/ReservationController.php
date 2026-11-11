<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationItem;
use App\Models\StoreProduct;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public static function expireOverdue(): void
    {
        DB::transaction(function () {
            $expiredList = Reservation::whereIn('status', ['pending', 'accepted'])
                ->where('expires_at', '<', now())
                ->lockForUpdate()
                ->get();

            foreach ($expiredList as $res) {
                $items = ReservationItem::where('reservation_id', $res->id)->get();
                foreach ($items as $item) {
                    DB::table('store_products')
                        ->where('id', $item->store_product_id)
                        ->update([
                            'stock'        => DB::raw('stock + ' . (int) $item->qty),
                            'is_available' => 1,
                        ]);
                }
                $res->status = 'expired';
                $res->save();
            }
        });
    }

    public static function getAllFormatted(): array
    {
        self::expireOverdue();

        $rows = DB::table('reservations as r')
            ->leftJoin('users as u', 'r.customer_id', '=', 'u.id')
            ->leftJoin('stores as s', 'r.store_id', '=', 's.id')
            ->select('r.*', 'u.name as customer_name', 'u.phone as customer_phone', 's.name as store_name')
            ->orderByDesc('r.created_at')
            ->get();

        $allItems = ReservationItem::all();
        $itemsByRes = [];
        foreach ($allItems as $item) {
            $itemsByRes[$item->reservation_id][] = $item->toArray();
        }

        $result = [];
        foreach ($rows as $row) {
            $arr = (array) $row;
            $arr['total_amount'] = (int) $arr['total_amount'];
            $arr['customer_name'] = $arr['customer_name'] ?: 'Mahasiswa WarLok';
            $arr['customer_phone'] = $arr['customer_phone'] ?: '0812-9876-5432';
            $arr['store_name'] = $arr['store_name'] ?: 'Warung Lokal';
            $arr['items'] = $itemsByRes[$row->id] ?? [];
            $result[] = $arr;
        }
        return $result;
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::getAllFormatted(),
            'message' => 'Daftar reservasi berhasil diambil (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $payload = $request->all();
        $customerId = $payload['customer_id'] ?? 'usr_customer_1';
        if (!DB::table('users')->where('id', $customerId)->exists()) {
            $customerId = 'usr_customer_1';
        }

        $storeId = $payload['store_id'] ?? null;
        $items = $payload['items'] ?? [];
        $note = $payload['note'] ?? null;
        $pickupEst = $payload['pickup_estimated_time'] ?? 'Dalam 1 jam';

        if (!$storeId || empty($items)) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'message' => 'Toko atau daftar barang tidak boleh kosong',
                'errors'  => null,
            ], 422);
        }

        try {
            $result = DB::transaction(function () use ($payload, $customerId, $storeId, $items, $note, $pickupEst) {
                $totalAmount = 0;
                $validatedItems = [];

                foreach ($items as $item) {
                    $prodId = $item['store_product_id'];
                    $qty = (int) ($item['qty'] ?? 1);

                    // SELECT ... FOR UPDATE via Eloquent lockForUpdate()
                    $product = StoreProduct::where('id', $prodId)
                        ->where('store_id', $storeId)
                        ->lockForUpdate()
                        ->first();

                    if (!$product) {
                        throw new Exception("Produk ID {$prodId} tidak ditemukan di warung ini.");
                    }

                    if (!$product->is_available || $product->stock < $qty) {
                        throw new Exception("Stok produk {$product->name} tidak mencukupi (Tersisa: {$product->stock}).");
                    }

                    $nextStock = $product->stock - $qty;
                    $product->stock = $nextStock;
                    $product->is_available = $nextStock > 0;
                    $product->save();

                    $subtotal = $product->price * $qty;
                    $totalAmount += $subtotal;

                    $validatedItems[] = [
                        'store_product_id' => $prodId,
                        'product_name'     => $product->name,
                        'variant'          => $product->variant,
                        'unit'             => $product->unit ?: 'Pcs',
                        'qty'              => $qty,
                        'price_snapshot'   => $product->price,
                    ];
                }

                $resId = $payload['id'] ?? ('res_' . bin2hex(random_bytes(6)));
                $code = $payload['code'] ?? ('WL-' . rand(1000, 9999));
                $expiresAt = now()->addMinutes(90)->format('Y-m-d H:i:s');

                Reservation::create([
                    'id'                    => $resId,
                    'code'                  => $code,
                    'customer_id'           => $customerId,
                    'store_id'              => $storeId,
                    'status'                => 'pending',
                    'total_amount'          => $totalAmount,
                    'note'                  => $note,
                    'pickup_estimated_time' => $pickupEst,
                    'expires_at'            => $expiresAt,
                ]);

                $savedItems = [];
                foreach ($validatedItems as $vItem) {
                    $itemId = 'ri_' . bin2hex(random_bytes(6));
                    $createdItem = ReservationItem::create([
                        'id'               => $itemId,
                        'reservation_id'   => $resId,
                        'store_product_id' => $vItem['store_product_id'],
                        'product_name'     => $vItem['product_name'],
                        'variant'          => $vItem['variant'],
                        'unit'             => $vItem['unit'],
                        'qty'              => $vItem['qty'],
                        'price_snapshot'   => $vItem['price_snapshot'],
                    ]);
                    $savedItems[] = $createdItem->toArray();
                }

                return [
                    'reservation_id' => $resId,
                    'code'           => $code,
                    'total_amount'   => $totalAmount,
                    'expires_at'     => $expiresAt,
                    'items'          => $savedItems,
                ];
            });

            return response()->json([
                'success' => true,
                'data'    => $result,
                'message' => 'Reservasi berhasil dibuat dan stok barang telah dikunci (Laravel 11)',
                'errors'  => null,
            ], 201);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'message' => $e->getMessage(),
                'errors'  => null,
            ], 400);
        }
    }

    public function accept(string $id): JsonResponse
    {
        $updated = Reservation::where('id', $id)->where('status', 'pending')->update(['status' => 'accepted']);
        if (!$updated) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'message' => 'Reservasi tidak dapat diterima atau status sudah berubah',
                'errors'  => null,
            ], 400);
        }

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => 'accepted'],
            'message' => 'Reservasi diterima oleh penjual',
            'errors'  => null,
        ]);
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        return $this->cancelOrReject($id, 'rejected', $request->input('reason'));
    }

    public function cancel(Request $request, string $id): JsonResponse
    {
        return $this->cancelOrReject($id, 'cancelled', $request->input('reason'));
    }

    private function cancelOrReject(string $id, string $targetStatus, ?string $reason = null): JsonResponse
    {
        try {
            DB::transaction(function () use ($id, $targetStatus, $reason) {
                $res = Reservation::where('id', $id)->lockForUpdate()->first();
                if (!$res || !in_array($res->status, ['pending', 'accepted'])) {
                    throw new Exception('Pesanan tidak dapat dibatalkan atau sudah selesai');
                }

                $items = ReservationItem::where('reservation_id', $id)->get();
                foreach ($items as $item) {
                    DB::table('store_products')
                        ->where('id', $item->store_product_id)
                        ->update([
                            'stock'        => DB::raw('stock + ' . (int) $item->qty),
                            'is_available' => 1,
                        ]);
                }

                $note = $res->note;
                if ($reason) {
                    $note = ($note ? $note . ' | ' : '') . 'Alasan ditolak: ' . $reason;
                }

                $res->status = $targetStatus;
                $res->note = $note;
                $res->save();
            });

            return response()->json([
                'success' => true,
                'data'    => ['id' => $id, 'status' => $targetStatus],
                'message' => "Pesanan berhasil di-{$targetStatus} dan stok telah dikembalikan",
                'errors'  => null,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'message' => $e->getMessage(),
                'errors'  => null,
            ], 400);
        }
    }

    public function complete(string $id): JsonResponse
    {
        Reservation::where('id', $id)->update(['status' => 'picked_up']);
        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => 'picked_up'],
            'message' => 'Pesanan telah selesai diambil dan lunas',
            'errors'  => null,
        ]);
    }
}
