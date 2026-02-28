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
     */
    public function stats(Request $request): JsonResponse
    {
        $user   = $request->user();
        $userId = $user->id;

        $now            = Carbon::now();
        $startOfMonth   = $now->copy()->startOfMonth();
        $startOfYear    = $now->copy()->startOfYear();
        $startOfWeek    = $now->copy()->startOfWeek();

        // ── Core counts ──────────────────────────────────────────────
        $total = Journal::where('user_id', $userId)->count();

        $thisMonth = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$startOfMonth, $now])
            ->count();

        $thisYear = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$startOfYear, $now])
            ->count();

        $thisWeek = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$startOfWeek, $now])
            ->count();

        // ── Longest streak (consecutive days) ────────────────────────
        $allDates = Journal::where('user_id', $userId)
            ->orderBy('journal_date')
            ->pluck('journal_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values()
            ->toArray();

        $longestStreak = 0;
        $currentStreak = 0;
        $streakEnd     = null;

        for ($i = 0; $i < count($allDates); $i++) {
            if ($i === 0) {
                $currentStreak = 1;
            } else {
                $prev = Carbon::parse($allDates[$i - 1]);
                $curr = Carbon::parse($allDates[$i]);
                if ($prev->copy()->addDay()->toDateString() === $curr->toDateString()) {
                    $currentStreak++;
                } else {
                    $currentStreak = 1;
                }
            }
            if ($currentStreak > $longestStreak) {
                $longestStreak = $currentStreak;
                $streakEnd     = $allDates[$i];
            }
        }

        // Current streak (streak ending today or yesterday)
        $activeStreak = 0;
        if (!empty($allDates)) {
            $lastDate  = Carbon::parse(end($allDates));
            $yesterday = $now->copy()->subDay()->toDateString();

            if ($lastDate->toDateString() === $now->toDateString() || $lastDate->toDateString() === $yesterday) {
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

        // ── Monthly breakdown for the current year ───────────────────
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

        // ── Calendar: dates that have entries (last 3 months + next month) ──
        $calendarFrom = $now->copy()->subMonths(2)->startOfMonth();
        $calendarTo   = $now->copy()->addMonth()->endOfMonth();

        $journalDates = Journal::where('user_id', $userId)
            ->whereBetween('journal_date', [$calendarFrom, $calendarTo])
            ->pluck('journal_date')
            ->map(fn($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        // ── Recent journals (last 5) ──────────────────────────────────
        $recentJournals = Journal::where('user_id', $userId)
            ->orderBy('journal_date', 'desc')
            ->limit(5)
            ->get(['id', 'title', 'journal_date', 'image_url']);

        // ── Images uploaded ───────────────────────────────────────────
        $withImages = Journal::where('user_id', $userId)
            ->whereNotNull('image_url')
            ->count();

        return response()->json([
            'stats' => [
                'total'         => $total,
                'this_week'     => $thisWeek,
                'this_month'    => $thisMonth,
                'this_year'     => $thisYear,
                'active_streak' => $activeStreak,
                'longest_streak'=> $longestStreak,
                'with_images'   => $withImages,
            ],
            'monthly_breakdown' => $monthlyData,
            'journal_dates'     => $journalDates,
            'recent_journals'   => $recentJournals,
        ]);
    }
}
