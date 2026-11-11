<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Report;
use App\Models\Review;
use App\Models\SearchLog;
use App\Models\StockVote;
use App\Models\Store;
use App\Models\StoreProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoteReportController extends Controller
{
    private function resolveValidUserId(string $userId, string $fallback = 'usr_customer_1'): string
    {
        return DB::table('users')->where('id', $userId)->exists() ? $userId : $fallback;
    }

    public function vote(Request $request, string $id): JsonResponse
    {
        $userId = $this->resolveValidUserId($request->input('user_id', 'usr_customer_1'));
        $voteType = $request->input('vote') === 'empty' ? 'empty' : 'available';

        StockVote::create([
            'id'               => 'v_' . bin2hex(random_bytes(6)),
            'store_product_id' => $id,
            'user_id'          => $userId,
            'vote'             => $voteType,
        ]);

        $product = StoreProduct::findOrFail($id);
        $avail = $product->votes_available + ($voteType === 'available' ? 1 : 0);
        $empty = $product->votes_empty + ($voteType === 'empty' ? 1 : 0);
        $total = $avail + $empty;

        $confidence = $total > 0 ? (int) round(($avail / $total) * 100) : 100;
        $isDoubtful = ($empty >= 3 && $confidence < 50);

        $product->update([
            'votes_available'  => $avail,
            'votes_empty'      => $empty,
            'confidence_score' => $confidence,
            'is_doubtful'      => $isDoubtful,
        ]);

        return response()->json([
            'success' => true,
            'data'    => [
                'store_product_id' => $id,
                'votes_available'  => $avail,
                'votes_empty'      => $empty,
                'confidence_score' => $confidence,
                'is_doubtful'      => $isDoubtful,
            ],
            'message' => 'Voting akurasi stok berhasil dicatat (Laravel 11)',
            'errors'  => null,
        ]);
    }

    public function storeReport(Request $request): JsonResponse
    {
        $id = $request->input('id', 'rep_' . bin2hex(random_bytes(6)));
        $reporterId = $this->resolveValidUserId($request->input('reporter_id', 'usr_customer_1'));

        Report::create([
            'id'          => $id,
            'store_id'    => $request->input('store_id'),
            'reporter_id' => $reporterId,
            'type'        => $request->input('type', 'stock_inaccurate'),
            'description' => $request->input('description', ''),
            'status'      => 'open',
        ]);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => 'open'],
            'message' => 'Laporan berhasil diajukan ke antrean admin',
            'errors'  => null,
        ], 201);
    }

    public function resolveReport(Request $request, string $id): JsonResponse
    {
        $adminNote = $request->input('admin_note', 'Selesai');
        Report::where('id', $id)->update([
            'status'     => 'resolved',
            'admin_note' => $adminNote,
        ]);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'status' => 'resolved', 'admin_note' => $adminNote],
            'message' => 'Laporan telah diselesaikan oleh admin',
            'errors'  => null,
        ]);
    }

    public function storeReview(Request $request): JsonResponse
    {
        $id = $request->input('id', 'rev_' . bin2hex(random_bytes(6)));
        $storeId = $request->input('store_id');
        $customerId = $this->resolveValidUserId($request->input('customer_id', 'usr_customer_1'));
        $rating = max(1, min(5, (int) $request->input('rating', 5)));

        Review::create([
            'id'          => $id,
            'store_id'    => $storeId,
            'customer_id' => $customerId,
            'rating'      => $rating,
            'comment'     => $request->input('comment', ''),
        ]);

        $avg = Review::where('store_id', $storeId)->avg('rating');
        if ($avg !== null) {
            Store::where('id', $storeId)->update([
                'rating'        => round((float) $avg, 2),
                'total_reviews' => DB::raw('total_reviews + 1'),
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id, 'rating' => $rating],
            'message' => 'Ulasan berhasil disimpan',
            'errors'  => null,
        ], 201);
    }

    public function logSearch(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->input('keyword', ''));
        if ($keyword === '') {
            return response()->json(['success' => false, 'data' => null, 'message' => 'Keyword kosong', 'errors' => null], 400);
        }

        $id = $request->input('id', 'sl_' . bin2hex(random_bytes(5)));
        SearchLog::create([
            'id'      => $id,
            'keyword' => $keyword,
            'user_id' => $request->input('user_id', 'usr_customer_1'),
            'lat'     => (float) $request->input('lat', -6.9110),
            'lng'     => (float) $request->input('lng', 107.6177),
        ]);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id],
            'message' => 'Log pencarian tercatat',
            'errors'  => null,
        ], 201);
    }

    public function logActivity(Request $request): JsonResponse
    {
        $action = trim((string) $request->input('action', ''));
        if ($action === '') {
            return response()->json(['success' => false, 'data' => null, 'message' => 'Action kosong', 'errors' => null], 400);
        }

        $id = $request->input('id', 'act_' . bin2hex(random_bytes(5)));
        ActivityLog::create([
            'id'      => $id,
            'user_id' => $request->input('user_id', 'usr_customer_1'),
            'action'  => $action,
            'meta'    => $request->input('meta'),
        ]);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id],
            'message' => 'Log aktivitas tercatat',
            'errors'  => null,
        ], 201);
    }
}
