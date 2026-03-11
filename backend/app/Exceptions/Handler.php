<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Global Exception Handler
 *
 * Ensures all API errors return a consistent JSON shape and that
 * internal stack traces are NEVER leaked to the client.
 *
 * Response envelope:
 *   { "error": "<human message>", "errors": { ... } }  (4xx)
 *   { "error": "An unexpected error occurred." }        (5xx — no details)
 */
class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            // Unhandled 5xx errors are logged with context for developers
            // but the message is NEVER forwarded to the client (see render()).
        });
    }

    public function render($request, Throwable $e)
    {
        // Only intercept JSON / API requests
        if ($request->expectsJson() || $request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    private function handleApiException($request, Throwable $e)
    {
        // 401 — Unauthenticated
        if ($e instanceof AuthenticationException) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        // 403 — Unauthorized (policy check failed)
        if ($e instanceof AuthorizationException) {
            return response()->json(['error' => 'This action is not authorized.'], 403);
        }

        // 404 — Model not found (route model binding)
        if ($e instanceof ModelNotFoundException) {
            $model = class_basename($e->getModel());
            return response()->json(['error' => "{$model} not found."], 404);
        }

        // 422 — Validation errors
        if ($e instanceof ValidationException) {
            return response()->json([
                'error'  => 'The given data was invalid.',
                'errors' => $e->errors(),
            ], 422);
        }

        // 429 — Rate limit exceeded
        if ($e instanceof TooManyRequestsHttpException) {
            return response()->json([
                'error' => 'Too many requests. Please slow down and try again later.',
            ], 429);
        }

        // Generic HTTP exceptions (thrown manually)
        if ($e instanceof HttpException) {
            return response()->json(['error' => $e->getMessage() ?: 'HTTP error.'], $e->getStatusCode());
        }

        // 500 — Unexpected server error
        // Log full details for debugging, return generic message to client
        Log::error('Unhandled exception', [
            'message' => $e->getMessage(),
            'file'    => $e->getFile(),
            'line'    => $e->getLine(),
            'url'     => $request->fullUrl(),
            'method'  => $request->method(),
        ]);

        return response()->json(
            ['error' => 'An unexpected error occurred. Please try again later.'],
            500
        );
    }
}
