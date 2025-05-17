<?php

use App\Http\Controllers\Api\GroupController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ShoppingListController;
use App\Http\Controllers\Api\ShoppingListItemController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\UserFollowerController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Auth Routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        
        // User Routes
        Route::apiResource('users', UserController::class);
        Route::get('/user', [UserController::class, 'current']);
        
        // Group Routes
        Route::apiResource('groups', GroupController::class);
        Route::post('/groups/{group}/users', [GroupController::class, 'addUsers']);
        Route::delete('/groups/{group}/users', [GroupController::class, 'removeUsers']);
        
        // Shopping List Routes
        Route::apiResource('shopping-lists', ShoppingListController::class);
        Route::apiResource('shopping-list-items', ShoppingListItemController::class);
        
        // Social Routes
        Route::get('/followers', [UserFollowerController::class, 'followers']);
        Route::get('/following', [UserFollowerController::class, 'following']);
        Route::post('/follow/{user}', [UserFollowerController::class, 'follow']);
        Route::delete('/unfollow/{user}', [UserFollowerController::class, 'unfollow']);
        
        // Message Routes
        Route::apiResource('messages', MessageController::class)->except(['update']);
        Route::get('/messages/conversations', [MessageController::class, 'conversations']);
        Route::get('/messages/unread', [MessageController::class, 'unread']);
        Route::patch('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    });
});