<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * Return aggregated journal statistics for the authenticated user.
     *
     * Access control:
     *  - auth:sanctum middleware guarantees only authenticated users reach here.
     *  - All queries are scoped to $userId — no cross-user data leakage possible.
     *
     * No additional input is accepted from the client; all data is derived
     * from the authenticated user's own records.
     */
    public function stats(Request $request): JsonResponse
    {
        $user   = $request->user();
        $userId = $user->id;

        $now          = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear  = $now->copy()->startOfYear();
        $startOfWeek  = $now->copy()->startOfWeek();

        // ── Core counts (single query) ────────────────────────────────────
        $counts = Journal::where('user_id', $userId)
            ->selectRaw("
                COUNT(*) as total,
                SUM(CASE WHEN journal_date >= ? THEN 1 ELSE 0 END) as this_week,
                SUM(CASE WHEN journal_date >= ? THEN 1 ELSE 0 END) as this_month,
                SUM(CASE WHEN journal_date >= ? THEN 1 ELSE 0 END) as this_year,
                SUM(CASE WHEN image_url IS NOT NULL THEN 1 ELSE 0 END) as with_images
            ", [$startOfWeek, $startOfMonth, $startOfYear])
            ->first();

        // ── Streak calculation ────────────────────────────────────────────
        $allDates = Journal::where('user_id', $userId)
            ->orderBy('journal_date')
            ->pluck('journal_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values()
            ->toArray();

        $longestStreak = 0;
        $currentStreak = 0;

        for ($i = 0; $i < count($allDates); $i++) {
            if ($i === 0) {
                $currentStreak = 1;
            } else {
                $prev = Carbon::parse($allDates[$i - 1]);
                $curr = Carbon::parse($allDates[$i]);
                $currentStreak = $prev->copy()->addDay()->toDateString() === $curr->toDateString()
                    ? $currentStreak + 1
                    : 1;
            }
            if ($currentStreak > $longestStreak) {
                $longestStreak = $currentStreak;
            }
        }

        // Active streak (streak ending today or yesterday)
        $activeStreak = 0;
        if (!empty($allDates)) {
            $lastDate  = Carbon::parse(end($allDates));
            $yesterday = $now->copy()->subDay()->toDateString();

            if (
                $lastDate->toDateString() === $now->toDateString() ||
                $lastDate->toDateString() === $yesterday
            ) {
                $activeStreak = 1;
                for ($i = count($allDates) - 2; $i >= 0; $i--) {
                    $curr = Carbon::parse($allDates[$i + 1]);
                    $prev = Carbon::parse($allDates[$i]);
                    if ($curr->copy()->subDay()->toDateString() === $prev->toDateString()) {
                        $activeStreak++;
                    } else {
                        break;
                    }
                }
            }
        }

        // ── Monthly breakdown for current year ────────────────────────────
        $monthlyBreakdown = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$startOfYear, $now])
            ->selectRaw('MONTH(journal_date) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->keyBy('month')
            ->map(fn($row) => $row->count);

        $monthlyData = [];
        for ($m = 1; $m <= 12; $m++) {
            $monthlyData[] = [
                'month' => Carbon::create(null, $m)->format('M'),
                'count' => $monthlyBreakdown->get($m, 0),
            ];
        }

        // ── Calendar: entry dates (last 3 months + next month) ───────────
        $calendarFrom = $now->copy()->subMonths(2)->startOfMonth();
        $calendarTo   = $now->copy()->addMonth()->endOfMonth();

        $journalDates = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$calendarFrom, $calendarTo])
            ->pluck('journal_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        // ── Recent journals ───────────────────────────────────────────────
        $recentJournals = Journal::where('user_id', $userId)
            ->orderBy('journal_date', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'journal_date', 'image_url']);

        return response()->json([
            'stats' => [
                'total'          => (int) $counts->total,
                'this_week'      => (int) $counts->this_week,
                'this_month'     => (int) $counts->this_month,
                'this_year'      => (int) $counts->this_year,
                'active_streak'  => $activeStreak,
                'longest_streak' => $longestStreak,
                'with_images'    => (int) $counts->with_images,
            ],
            'monthly_breakdown' => $monthlyData,
            'journal_dates'     => $journalDates,
            'recent_journals'   => $recentJournals,
        ]);
    }
}
