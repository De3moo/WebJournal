<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

// ── Public routes (rate-limited) ─────────────────────────────────────────
// Strict throttle on auth endpoints to prevent brute-force & abuse
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});


// General API throttle: 60 requests/minute per authenticated user
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {

    // Auth management
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Dashboard (read-only, own data)
    Route::get('/dashboard', [DashboardController::class, 'stats']);

    // Journal routes — policy authorization applied inside controller
    Route::get('/journals',                          [JournalController::class, 'index']);
    Route::post('/journals',                         [JournalController::class, 'store']);
    Route::get('/journals/{journal}',                [JournalController::class, 'show']);
    Route::put('/journals/{journal}',                [JournalController::class, 'update']);
    Route::delete('/journals/{journal}',             [JournalController::class, 'destroy']);
    Route::get('/journals/{journal}/export-pdf',     [JournalController::class, 'exportPdf']);
});
