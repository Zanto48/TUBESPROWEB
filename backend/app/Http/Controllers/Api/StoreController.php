<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreDocument;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
    public static function formatStoreRow(object|array $row, array $documents = []): array
    {
        $arr = (array) $row;
        $arr['lat'] = (float) ($arr['lat'] ?? 0);
        $arr['lng'] = (float) ($arr['lng'] ?? 0);
        $arr['rating'] = (float) ($arr['rating'] ?? 0);
        $arr['total_reviews'] = (int) ($arr['total_reviews'] ?? 0);
        if (isset($arr['distance_km'])) {
            $arr['distance_km'] = (float) $arr['distance_km'];
        }
        if (!empty($documents)) {
            $arr['documents'] = $documents;
        }
        return $arr;
    }

    public static function getAllFormatted(): array
    {
        $rows = DB::table('stores as s')
            ->leftJoin('users as u', 's.owner_id', '=', 'u.id')
            ->select('s.*', 'u.name as owner_name')
            ->orderBy('s.created_at', 'asc')
            ->get();

        $docs = StoreDocument::all();
        $docsByStore = [];
        foreach ($docs as $doc) {
            $docsByStore[$doc->store_id][] = [
                'id'          => $doc->id,
                'store_id'    => $doc->store_id,
                'file_name'   => basename($doc->file_path),
                'file_url'    => str_starts_with($doc->file_path, 'http')
                    ? $doc->file_path
                    : 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400',
                'type'        => $doc->type,
                'review_note' => $doc->review_note,
            ];
        }

        $result = [];
        foreach ($rows as $row) {
            $result[] = self::formatStoreRow($row, $docsByStore[$row->id] ?? []);
        }
        return $result;
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => self::getAllFormatted(),
            'message' => 'Daftar seluruh warung berhasil diambil (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function nearby(Request $request): JsonResponse
    {
        $lat = (float) $request->query('lat', -6.9110);
        $lng = (float) $request->query('lng', 107.6177);
        $radius = (float) $request->query('radius', 5.0);

        $rows = DB::select(
            "SELECT s.*, u.name AS owner_name,
               ROUND((6371 * ACOS(
                 LEAST(1.0, GREATEST(-1.0,
                   COS(RADIANS(?)) * COS(RADIANS(s.lat)) *
                   COS(RADIANS(s.lng) - RADIANS(?)) +
                   SIN(RADIANS(?)) * SIN(RADIANS(s.lat))
                 ))
               )), 2) AS distance_km
             FROM stores s
             LEFT JOIN users u ON s.owner_id = u.id
             WHERE s.status = 'active'
             HAVING distance_km <= ?
             ORDER BY distance_km ASC",
            [$lat, $lng, $lat, $radius]
        );

        $stores = array_map(fn($r) => self::formatStoreRow($r), $rows);

        return response()->json([
            'success' => true,
            'data'    => $stores,
            'message' => 'Daftar warung terdekat berhasil diambil (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $row = DB::table('stores as s')
            ->leftJoin('users as u', 's.owner_id', '=', 'u.id')
            ->select('s.*', 'u.name as owner_name')
            ->where('s.id', $id)
            ->first();

        if (!$row) {
            return response()->json([
                'success' => false,
                'data'    => null,
                'message' => 'Warung tidak ditemukan',
                'errors'  => null,
            ], 404);
        }

        $store = self::formatStoreRow($row);
        $store['products'] = StoreProduct::where('store_id', $id)->get()->toArray();
        $store['reviews'] = DB::table('reviews as r')
            ->join('users as u', 'r.customer_id', '=', 'u.id')
            ->select('r.*', 'u.name as customer_name')
            ->where('r.store_id', $id)
            ->orderByDesc('r.created_at')
            ->get()
            ->toArray();

        return response()->json([
            'success' => true,
            'data'    => $store,
            'message' => 'Detail warung berhasil diambil (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->all();
        $ownerId = $data['owner_id'] ?? 'usr_merchant_1';
        if (!DB::table('users')->where('id', $ownerId)->exists()) {
            $ownerId = 'usr_merchant_1';
        }

        $id = $data['id'] ?? ('str_' . bin2hex(random_bytes(6)));

        Store::create([
            'id'            => $id,
            'owner_id'      => $ownerId,
            'name'          => $data['name'] ?? 'Warung Baru',
            'description'   => $data['description'] ?? '',
            'address'       => $data['address'] ?? '',
            'lat'           => (float) ($data['lat'] ?? -6.9110),
            'lng'           => (float) ($data['lng'] ?? 107.6177),
            'phone'         => $data['phone'] ?? '0812-3456-7890',
            'opening_hours' => $data['opening_hours'] ?? '07.00 - 22.00 WIB',
            'status'        => 'pending',
            'rating'        => 0,
            'total_reviews' => 0,
        ]);

        $savedDocs = [];
        $documents = $data['documents'] ?? [];
        if (is_array($documents)) {
            foreach ($documents as $doc) {
                $docId = 'doc_' . bin2hex(random_bytes(5));
                $fileUrl = $doc['file_url'] ?? 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400';
                $docType = in_array($doc['type'] ?? '', ['ktp', 'foto_toko', 'surat_usaha']) ? $doc['type'] : 'ktp';

                StoreDocument::create([
                    'id'          => $docId,
                    'store_id'    => $id,
                    'file_path'   => $fileUrl,
                    'type'        => $docType,
                    'review_note' => 'Dokumen diunggah oleh pemilik warung',
                ]);

                $savedDocs[] = [
                    'id'          => $docId,
                    'store_id'    => $id,
                    'file_name'   => $doc['file_name'] ?? 'dokumen.jpg',
                    'file_url'    => $fileUrl,
                    'type'        => $docType,
                    'review_note' => 'Dokumen diunggah oleh pemilik warung',
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => 'pending', 'documents' => $savedDocs],
            'message' => 'Pengajuan toko berhasil diajukan, menunggu verifikasi admin',
            'errors'  => null,
        ], 201);
    }

    public function verify(Request $request, string $id): JsonResponse
    {
        $status = $request->input('status', 'active');
        $note = $request->input('note');
        $verifiedAt = ($status === 'active') ? now()->format('Y-m-d H:i:s') : null;

        Store::where('id', $id)->update([
            'status'      => $status,
            'verified_at' => $verifiedAt,
        ]);

        if (!empty($note)) {
            StoreDocument::where('store_id', $id)->update(['review_note' => $note]);
        }

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => $status, 'verified_at' => $verifiedAt],
            'message' => 'Status verifikasi warung berhasil diperbarui',
            'errors'  => null,
        ]);
    }

    public function relocate(Request $request): JsonResponse
    {
        $lat = (float) $request->input('lat', -6.9110);
        $lng = (float) $request->input('lng', 107.6177);

        $offsets = [
            ['dlat' =>  0.0008, 'dlng' =>  0.0007],
            ['dlat' => -0.0008, 'dlng' => -0.0008],
            ['dlat' =>  0.0014, 'dlng' => -0.0012],
            ['dlat' => -0.0014, 'dlng' =>  0.0014],
            ['dlat' =>  0.0022, 'dlng' =>  0.0019],
            ['dlat' => -0.0022, 'dlng' => -0.0019],
        ];

        $storeIds = Store::orderBy('created_at')->orderBy('id')->pluck('id');
        foreach ($storeIds as $idx => $storeId) {
            $offset = $offsets[$idx % count($offsets)];
            $mul = (int) floor($idx / count($offsets)) + 1;
            Store::where('id', $storeId)->update([
                'lat' => round($lat + ($offset['dlat'] * $mul), 6),
                'lng' => round($lng + ($offset['dlng'] * $mul), 6),
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => self::getAllFormatted(),
            'message' => 'Koordinat seluruh warung berhasil dipindahkan ke sekitar titik GPS Anda',
            'errors'  => null,
        ]);
    }
}
