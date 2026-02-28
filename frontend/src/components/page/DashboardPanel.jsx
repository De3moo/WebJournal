import { useState } from 'react';
import '../../styles/Dashboard.css';

function MonthlyChart({ data }) {
    const max = Math.max(...data.map((d) => d.count), 1);
    return (
        <div className="db-chart">
            {data.map((d) => (
                <div key={d.month} className="db-chart-col">
                    <div
                        className="db-chart-bar"
                        style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
                        title={`${d.month}: ${d.count}`}
                    />
                    <span className="db-chart-label">{d.month}</span>
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────
   Mini calendar — highlights journal dates
───────────────────────────────────────── */
function MiniCalendar({ journalDates }) {
    const [offset, setOffset] = useState(0);
    const dateSet = new Set(journalDates);

    const base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + offset);
    const year  = base.getFullYear();
    const month = base.getMonth();

    const monthName  = base.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDay   = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayStr   = new Date().toISOString().split('T')[0];

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const pad    = (n) => String(n).padStart(2, '0');
    const toISO  = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;

    return (
        <div className="db-calendar">
            <div className="db-calendar-nav">
                <button onClick={() => setOffset((o) => o - 1)}>‹</button>
                <span>{monthName}</span>
                <button onClick={() => setOffset((o) => o + 1)}>›</button>
            </div>
            <div className="db-calendar-grid">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                    <div key={d} className="db-cal-header">{d}</div>
                ))}
                {cells.map((d, i) => {
                    if (!d) return <div key={`e-${i}`} />;
                    const iso      = toISO(d);
                    const hasEntry = dateSet.has(iso);
                    const isToday  = iso === todayStr;
                    return (
                        <div
                            key={iso}
                            className={`db-cal-day${hasEntry ? ' has-entry' : ''}${isToday ? ' today' : ''}`}
                        >
                            {d}
                            {hasEntry && <span className="db-cal-dot" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, accent }) {
    return (
        <div className="db-stat-card" style={{ '--accent': accent, borderLeftColor: accent }}>
            <span className="db-stat-icon">{icon}</span>
            <div className="db-stat-body">
                <span className="db-stat-value">{value}</span>
                <span className="db-stat-label">{label}</span>
            </div>
        </div>
    );
}


function computeStats(journals) {
    const now        = new Date();
    const todayStr   = now.toISOString().split('T')[0];
    const y          = now.getFullYear();
    const m          = now.getMonth();

    // week start (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(y, m, 1);
    const yearStart  = new Date(y, 0, 1);

    let thisWeek  = 0, thisMonth = 0, thisYear = 0, withImages = 0;

    for (const j of journals) {
        const d = new Date(j.journal_date);
        if (d >= weekStart)  thisWeek++;
        if (d >= monthStart) thisMonth++;
        if (d >= yearStart)  thisYear++;
        if (j.image_url)     withImages++;
    }

    // Unique sorted dates for streak calculation
    const allDates = [...new Set(
        journals.map((j) => j.journal_date.split('T')[0])
    )].sort();

    let longestStreak = 0, currentStreak = 0;
    for (let i = 0; i < allDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const prev = new Date(allDates[i - 1]);
            const curr = new Date(allDates[i]);
            prev.setDate(prev.getDate() + 1);
            currentStreak = prev.toISOString().split('T')[0] === allDates[i]
                ? currentStreak + 1
                : 1;
        }
        if (currentStreak > longestStreak) longestStreak = currentStreak;
    }

    let activeStreak = 0;
    if (allDates.length > 0) {
        const last      = allDates[allDates.length - 1];
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (last === todayStr || last === yesterdayStr) {
            activeStreak = 1;
            for (let i = allDates.length - 2; i >= 0; i--) {
                const curr = new Date(allDates[i + 1]);
                const prev = new Date(allDates[i]);
                curr.setDate(curr.getDate() - 1);
                if (curr.toISOString().split('T')[0] === allDates[i]) {
                    activeStreak++;
                } else break;
            }
        }
    }

    // Monthly breakdown for current year
    const monthCounts = Array(12).fill(0);
    for (const j of journals) {
        const d = new Date(j.journal_date);
        if (d.getFullYear() === y) monthCounts[d.getMonth()]++;
    }
    const monthlyBreakdown = monthCounts.map((count, idx) => ({
        month: new Date(y, idx).toLocaleDateString('en-US', { month: 'short' }),
        count,
    }));

    // All date strings for calendar
    const journalDates = allDates;

    // Recent 5
    const recentJournals = [...journals]
        .sort((a, b) => new Date(b.journal_date) - new Date(a.journal_date))
        .slice(0, 5);

    return {
        stats: {
            total: journals.length,
            this_week: thisWeek,
            this_month: thisMonth,
            this_year: thisYear,
            active_streak: activeStreak,
            longest_streak: longestStreak,
            with_images: withImages,
        },
        monthlyBreakdown,
        journalDates,
        recentJournals,
    };
}


function DashboardPanel({ journals = [], onSelectJournal }) {
    const { stats, monthlyBreakdown, journalDates, recentJournals } = computeStats(journals);

    const fmtDate = (str) =>
        new Date(str).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
        });

    return (
        <div className="db-panel">
            <div className="db-panel-header">
                <h2>Dashboard</h2>
                <p>Your journaling at a glance</p>
            </div>

            {/* ── Stat cards ── */}
            <section className="db-stats-grid">
                <StatCard label="Total Entries"  value={stats.total}                    accent="#2c7a4b" />
                <StatCard label="This Week"       value={stats.this_week}                accent="#3b82f6" />
                <StatCard label="This Month"      value={stats.this_month}              accent="#8b5cf6" />
                <StatCard label="This Year"       value={stats.this_year}                accent="#f59e0b" />
                <StatCard label="Active Streak"   value={`${stats.active_streak}d`}     accent="#ef4444" />
                <StatCard label="Longest Streak"  value={`${stats.longest_streak}d`}   accent="#10b981" />
            </section>

            {/* ── Monthly chart ── */}
            <section className="db-section">
                <h3 className="db-section-title">Entries This Year</h3>
                <MonthlyChart data={monthlyBreakdown} />
            </section>

            {/* ── Calendar ── */}
            <section className="db-section">
                <h3 className="db-section-title">Journal Calendar</h3>
                <MiniCalendar journalDates={journalDates} />
            </section>

            {/* ── Recent journals ── */}
            <section className="db-section">
                <h3 className="db-section-title">Recent Entries</h3>
                {recentJournals.length === 0 ? (
                    <p className="db-empty">No entries yet.</p>
                ) : (
                    <ul className="db-recent-list">
                        {recentJournals.map((j) => (
                            <li key={j.id} className="db-recent-item">
                                <button
                                    className="db-recent-btn"
                                    onClick={() => onSelectJournal?.(j.id)}
                                >
                                    <div className="db-recent-left">
                                        {j.image_url
                                            ? <img src={j.image_url} alt="" className="db-recent-thumb" />
                                            : <div className="db-recent-thumb db-recent-thumb-placeholder">📓</div>
                                        }
                                        <div className="db-recent-info">
                                            <span className="db-recent-title">{j.title}</span>
                                            <span className="db-recent-date">{fmtDate(j.journal_date)}</span>
                                        </div>
                                    </div>
                                    <span className="db-recent-arrow">›</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}

export default DashboardPanel;