<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;

/**
 * AuditLogger
 *
 * Centralised security audit trail. All entries go to the dedicated
 * `security` log channel (storage/logs/security-YYYY-MM-DD.log).
 *
 * Each entry contains:
 *   - event     : machine-readable event name  (e.g. "auth.login")
 *   - user_id   : authenticated user id (or null for guests)
 *   - ip        : client IP address
 *   - user_agent: browser / client identifier
 *   - meta      : optional extra context (resource id, etc.)
 */
class AuditLogger
{
    // ── Auth events ───────────────────────────────────────────────────────

    public static function logLogin(int $userId, Request $request): void
    {
        self::write('auth.login', $userId, $request);
    }

    public static function logLoginFailed(string $email, Request $request): void
    {
        self::write('auth.login_failed', null, $request, ['email' => $email]);
    }

    public static function logLogout(int $userId, Request $request): void
    {
        self::write('auth.logout', $userId, $request);
    }

    public static function logRegister(int $userId, Request $request): void
    {
        self::write('auth.register', $userId, $request);
    }

    // ── Authorisation events ──────────────────────────────────────────────

    public static function logUnauthorizedAccess(int $userId, string $resource, Request $request): void
    {
        self::write('access.unauthorized', $userId, $request, ['resource' => $resource]);
    }

    // ── Journal CRUD events ───────────────────────────────────────────────

    public static function logJournalCreated(int $userId, int $journalId, Request $request): void
    {
        self::write('journal.created', $userId, $request, ['journal_id' => $journalId]);
    }

    public static function logJournalUpdated(int $userId, int $journalId, Request $request): void
    {
        self::write('journal.updated', $userId, $request, ['journal_id' => $journalId]);
    }

    public static function logJournalDeleted(int $userId, int $journalId, Request $request): void
    {
        self::write('journal.deleted', $userId, $request, ['journal_id' => $journalId]);
    }

    public static function logJournalExported(int $userId, int $journalId, Request $request): void
    {
        self::write('journal.exported_pdf', $userId, $request, ['journal_id' => $journalId]);
    }

    // ── Core writer ───────────────────────────────────────────────────────

    private static function write(
        string   $event,
        ?int     $userId,
        Request  $request,
        array    $meta = []
    ): void {
        Log::channel('security')->info($event, [
            'user_id'    => $userId,
            'ip'         => $request->ip(),
            'user_agent' => $request->userAgent(),
            'meta'       => $meta,
            'timestamp'  => now()->toIso8601String(),
        ]);
    }
}
