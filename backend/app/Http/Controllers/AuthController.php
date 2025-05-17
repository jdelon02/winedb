<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Class AuthController
 *
 * @category Controllers
 * @package  App\Http\Controllers
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 * @link     https://recipesandwines.app/docs/controllers/auth
 */
class AuthController extends Controller
{
    /**
     * Register a new user
     *
     * @param RegisterRequest $request Registration request
     *
     * @return JsonResponse
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create(
            [
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(
            [
                'user' => new UserResource($user),
                'token' => $token,
            ],
            201
        );
    }

    /**
     * Authenticate a user
     *
     * @param LoginRequest $request Login request
     *
     * @return JsonResponse
     *
     * @throws ValidationException
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(
                [
                    'email' => ['The provided credentials are incorrect.'],
                ]
            );
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json(
            [
                'user' => new UserResource($user),
                'token' => $token,
            ]
        );
    }

    /**
     * Logout the authenticated user
     *
     * @param Request $request Request instance
     *
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(null, 204);
    }
}