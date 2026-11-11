<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MasterProduct;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function compare(Request $request): JsonResponse
    {
        $mpId = $request->query('master_product_id', 'mp_indomie_goreng');
        $lat = (float) $request->query('lat', -6.9110);
        $lng = (float) $request->query('lng', 107.6177);

        $rows = DB::select(
            "SELECT sp.*, s.name as store_name, s.address as store_address, s.opening_hours,
               ROUND((6371 * ACOS(
                 LEAST(1.0, GREATEST(-1.0,
                   COS(RADIANS(?)) * COS(RADIANS(s.lat)) *
                   COS(RADIANS(s.lng) - RADIANS(?)) +
                   SIN(RADIANS(?)) * SIN(RADIANS(s.lat))
                 ))
               )), 2) AS distance_km
             FROM store_products sp
             JOIN stores s ON sp.store_id = s.id
             WHERE sp.master_product_id = ?
               AND s.status = 'active'
               AND sp.is_available = 1
             ORDER BY sp.price ASC, distance_km ASC",
            [$lat, $lng, $lat, $mpId]
        );

        $formatted = array_map(function ($r) {
            $arr = (array) $r;
            $arr['price'] = (int) $arr['price'];
            $arr['stock'] = (int) $arr['stock'];
            $arr['low_stock_threshold'] = (int) $arr['low_stock_threshold'];
            $arr['is_available'] = (bool) $arr['is_available'];
            $arr['votes_available'] = (int) $arr['votes_available'];
            $arr['votes_empty'] = (int) $arr['votes_empty'];
            $arr['confidence_score'] = (int) $arr['confidence_score'];
            $arr['is_doubtful'] = (bool) $arr['is_doubtful'];
            $arr['distance_km'] = (float) $arr['distance_km'];
            return $arr;
        }, $rows);

        return response()->json([
            'success' => true,
            'data'    => $formatted,
            'message' => 'Perbandingan harga berhasil diambil (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function toggle(string $id): JsonResponse
    {
        $product = StoreProduct::findOrFail($id);
        $product->is_available = !$product->is_available;
        $product->save();

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Status ketersediaan produk berhasil diubah',
            'errors'  => null,
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $stock = max(0, (int) $request->input('stock', 0));
        $updates = [
            'stock'        => $stock,
            'is_available' => $stock > 0,
        ];
        if ($request->has('price') && $request->input('price') !== null) {
            $updates['price'] = (int) $request->input('price');
        }

        StoreProduct::where('id', $id)->update($updates);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id] + $updates,
            'message' => 'Stok dan harga berhasil diperbarui',
            'errors'  => null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->all();
        $id = $data['id'] ?? ('sp_' . bin2hex(random_bytes(5)));
        $stock = (int) ($data['stock'] ?? 10);

        $product = StoreProduct::create([
            'id'                  => $id,
            'store_id'            => $data['store_id'],
            'master_product_id'   => $data['master_product_id'] ?? null,
            'name'                => $data['name'],
            'brand'               => $data['brand'] ?? 'Umum',
            'category_id'         => $data['category_id'] ?? 'cat_instant',
            'unit'                => $data['unit'] ?? 'Pcs',
            'variant'             => $data['variant'] ?? null,
            'price'               => (int) ($data['price'] ?? 0),
            'stock'               => $stock,
            'low_stock_threshold' => (int) ($data['low_stock_threshold'] ?? 5),
            'is_available'        => isset($data['is_available']) ? (bool) $data['is_available'] : ($stock > 0),
            'votes_available'     => 1,
            'votes_empty'         => 0,
            'confidence_score'    => 100,
            'is_doubtful'         => false,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $product,
            'message' => 'Produk berhasil ditambahkan ke inventaris warung',
            'errors'  => null,
        ], 201);
    }

    public function masterProducts(): JsonResponse
    {
        $rows = MasterProduct::orderBy('category_id')->orderBy('name')->get();
        return response()->json([
            'success' => true,
            'data'    => $rows,
            'message' => 'Daftar master produk (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function storeMasterProduct(Request $request): JsonResponse
    {
        $data = $request->all();
        $id = $data['id'] ?? ('mp_' . bin2hex(random_bytes(5)));

        $mp = MasterProduct::create([
            'id'              => $id,
            'category_id'     => $data['category_id'] ?? 'cat_instant',
            'name'            => $data['name'],
            'brand'           => $data['brand'] ?? 'Umum',
            'unit'            => $data['unit'] ?? 'Pcs',
            'description'     => $data['description'] ?? '',
            'suggested_price' => (int) ($data['suggested_price'] ?? 0),
        ]);

        return response()->json([
            'success' => true,
            'data'    => $mp,
            'message' => 'Master produk berhasil ditambahkan',
            'errors'  => null,
        ], 201);
    }

    public function updateMasterProduct(Request $request, string $id): JsonResponse
    {
        $allowed = $request->only(['category_id', 'name', 'brand', 'unit', 'description', 'suggested_price']);
        if (isset($allowed['suggested_price'])) {
            $allowed['suggested_price'] = (int) $allowed['suggested_price'];
        }
        MasterProduct::where('id', $id)->update($allowed);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id],
            'message' => 'Master produk berhasil diperbarui',
            'errors'  => null,
        ]);
    }
}
