<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MasterProduct;
use App\Models\SearchLog;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BootstrapController extends Controller
{
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => [
                'app'       => 'WarLok (Warung Lokal) Backend API',
                'framework' => 'Laravel ' . app()->version(),
                'status'    => 'healthy',
                'database'  => config('database.connections.mysql.database'),
                'time'      => now()->format('Y-m-d H:i:s'),
            ],
            'message' => 'WarLok Laravel 11 API running smoothly',
            'errors'  => null,
        ]);
    }

    public function bootstrap(): JsonResponse
    {
        $stores = StoreController::getAllFormatted();
        $storeProducts = StoreProduct::orderByDesc('created_at')->get();
        $masterProducts = MasterProduct::orderBy('category_id')->orderBy('name')->get();
        $categories = Category::all();
        $reservations = ReservationController::getAllFormatted();

        $reviews = DB::table('reviews as r')
            ->leftJoin('users as u', 'r.customer_id', '=', 'u.id')
            ->select('r.*', 'u.name as customer_name')
            ->orderByDesc('r.created_at')
            ->get()
            ->map(function ($row) {
                $arr = (array) $row;
                $arr['rating'] = (int) $arr['rating'];
                $arr['customer_name'] = $arr['customer_name'] ?: 'Mahasiswa WarLok';
                return $arr;
            });

        $reports = DB::table('reports as rp')
            ->leftJoin('stores as s', 'rp.store_id', '=', 's.id')
            ->leftJoin('users as u', 'rp.reporter_id', '=', 'u.id')
            ->select('rp.*', 's.name as store_name', 'u.name as reporter_name')
            ->orderByDesc('rp.created_at')
            ->get()
            ->map(function ($row) {
                $arr = (array) $row;
                $arr['store_name'] = $arr['store_name'] ?: 'Toko WarLok';
                $arr['reporter_name'] = $arr['reporter_name'] ?: 'Mahasiswa Kos';
                return $arr;
            });

        $searchLogs = SearchLog::orderByDesc('created_at')->limit(100)->get();

        $activityLogs = DB::table('activity_logs as a')
            ->leftJoin('users as u', 'a.user_id', '=', 'u.id')
            ->select('a.*', 'u.name as user_name')
            ->orderByDesc('a.created_at')
            ->limit(50)
            ->get()
            ->map(function ($row) {
                $arr = (array) $row;
                $arr['user_name'] = $arr['user_name'] ?: 'Pengguna WarLok';
                if (!empty($arr['meta']) && is_string($arr['meta'])) {
                    $arr['meta'] = json_decode($arr['meta'], true);
                }
                return $arr;
            });

        return response()->json([
            'success' => true,
            'data'    => [
                'framework'       => 'Laravel ' . app()->version(),
                'stores'          => $stores,
                'store_products'  => $storeProducts,
                'master_products' => $masterProducts,
                'categories'      => $categories,
                'reservations'    => $reservations,
                'reviews'         => $reviews,
                'reports'         => $reports,
                'search_logs'     => $searchLogs,
                'activity_logs'   => $activityLogs,
            ],
            'message' => 'Data bootstrap berhasil diambil dari Laravel 11 + MySQL',
            'errors'  => null,
        ]);
    }
}
