<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * Security controls:
     *  - Input validation (name, email uniqueness, password policy)
     *  - Password hashed via bcrypt (User model cast)
     *  - Audit log on success
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
            ],
        ], [
            'password.min'           => 'Password must be at least 8 characters.',
            'password.mixed'         => 'Password must contain uppercase and lowercase letters.',
            'password.numbers'       => 'Password must contain at least one number.',
            'password.symbols'       => 'Password must contain at least one special character.',
            'password.uncompromised' => 'This password appeared in a data breach. Please choose another.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name'     => strip_tags(trim($request->name)),
            'email'    => strtolower(trim($request->email)),
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogger::logRegister($user->id, $request);

        return response()->json([
            'message' => 'Registration successful',
            'user'    => $user,
            'token'   => $token,
        ], 201);
    }

    /**
     * Authenticate a user and issue a Sanctum token.
     *
     * Security controls:
     *  - Input validation
     *  - Auth::attempt (timing-safe password check)
     *  - Audit log on success and on failure
     *  - Generic error message on failure (prevents user enumeration)
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            // Log the failed attempt (email only — never log passwords)
            AuditLogger::logLoginFailed($request->email, $request);

            // Generic message: do not reveal whether the email exists
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user  = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogger::logLogin($user->id, $request);

        return response()->json([
            'message' => 'Login successful',
            'user'    => $user,
            'token'   => $token,
        ]);
    }

    /**
     * Return the currently authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * Revoke the current access token and log the event.
     */
    public function logout(Request $request): JsonResponse
    {
        AuditLogger::logLogout($request->user()->id, $request);

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout successful']);
    }
}
