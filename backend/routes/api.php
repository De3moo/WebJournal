<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirect'])
    ->where('provider', 'google|facebook');

Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'callback'])
    ->where('provider', 'google|facebook');

// Protected routes - using simple middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard/', [DashboardController::class, 'stats']);

    Route::get('/journals/{journal}/export-pdf', [JournalController::class, 'exportPdf']);


    // Journal route
    Route::get('/journals', [JournalController::class, 'index']);
    Route::post('/journals', [JournalController::class, 'store']);
    Route::get('/journals/{journal}', [JournalController::class, 'show']);
    Route::put('/journals/{journal}', [JournalController::class, 'update']);
    Route::delete('/journals/{journal}', [JournalController::class, 'destroy']);
});
