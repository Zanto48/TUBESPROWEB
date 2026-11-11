<?php

use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\VoteReportController;
use Illuminate\Support\Facades\Route;

// 1. Healthcheck & Bootstrap
Route::get('/', [BootstrapController::class, 'health']);
Route::get('/health', [BootstrapController::class, 'health']);
Route::get('/bootstrap', [BootstrapController::class, 'bootstrap']);

// 2. Stores & Geolocation (Haversine + GPS Relocate + Admin Verify)
Route::get('/stores/nearby', [StoreController::class, 'nearby']);
Route::post('/stores/relocate', [StoreController::class, 'relocate']);
Route::get('/stores', [StoreController::class, 'index']);
Route::get('/stores/{id}', [StoreController::class, 'show']);
Route::post('/stores', [StoreController::class, 'register']);
Route::patch('/admin/stores/{id}/verify', [StoreController::class, 'verify']);

// 3. Master Products & Store Products Inventory
Route::get('/master-products', [ProductController::class, 'masterProducts']);
Route::post('/master-products', [ProductController::class, 'storeMasterProduct']);
Route::match(['put', 'patch'], '/master-products/{id}', [ProductController::class, 'updateMasterProduct']);

Route::get('/compare', [ProductController::class, 'compare']);
Route::post('/store-products', [ProductController::class, 'store']);
Route::patch('/store-products/{id}/toggle', [ProductController::class, 'toggle']);
Route::match(['put', 'patch'], '/store-products/{id}', [ProductController::class, 'update']);

// 4. Reservations (ACID Transaction & Stock Lock)
Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::patch('/reservations/{id}/accept', [ReservationController::class, 'accept']);
Route::patch('/reservations/{id}/reject', [ReservationController::class, 'reject']);
Route::patch('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
Route::patch('/reservations/{id}/complete', [ReservationController::class, 'complete']);

// 5. Community Voting, Reviews, Reports & Analytics Logs
Route::post('/store-products/{id}/votes', [VoteReportController::class, 'vote']);
Route::post('/reports', [VoteReportController::class, 'storeReport']);
Route::patch('/admin/reports/{id}', [VoteReportController::class, 'resolveReport']);
Route::post('/reviews', [VoteReportController::class, 'storeReview']);
Route::post('/search-logs', [VoteReportController::class, 'logSearch']);
Route::post('/activity-logs', [VoteReportController::class, 'logActivity']);
