import React, { useState, useMemo } from 'react';
import { UserProfile, LeaderboardEntry } from '../types';

interface LeaderboardPageProps {
  user: UserProfile;
  mockEntries: LeaderboardEntry[];
}

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ user, mockEntries }) => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'all-time'>('weekly');

  // Compute full leaderboard including current user
  const rankedEntries = useMemo(() => {
    const currentUserEntry: LeaderboardEntry = {
      id: 'current-user',
      name: user.name,
      initials: user.initials,
      avatarColor: user.avatarColor || '#0e7c63',
      xp: user.xp,
      weeklyXp: user.weeklyXp ?? Math.min(user.xp, Math.max(40, user.xp - 50)),
    };

    // Combine mock entries with current user (ensure no duplicates)
    const all = [
      ...mockEntries.filter((item) => item.id !== 'current-user'),
      currentUserEntry,
    ];

    // Sort according to active timeframe
    const sorted = all.sort((a, b) => {
      if (timeframe === 'weekly') {
        if (b.weeklyXp !== a.weeklyXp) {
          return b.weeklyXp - a.weeklyXp;
        }
        return b.xp - a.xp;
      } else {
        if (b.xp !== a.xp) {
          return b.xp - a.xp;
        }
        return b.weeklyXp - a.weeklyXp;
      }
    });

    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      isCurrentUser: entry.id === 'current-user',
      displayXp: timeframe === 'weekly' ? entry.weeklyXp : entry.xp,
    }));
  }, [user, mockEntries, timeframe]);

  const top3 = rankedEntries.slice(0, 3);
  const ranks4To10 = rankedEntries.slice(3, 10);
  const currentUserItem = rankedEntries.find((e) => e.isCurrentUser);
  const isUserOutsideTop10 = (currentUserItem?.rank ?? 1) > 10;

  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full space-y-8 pb-24">
      {/* Header & Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-outline-variant/60">
        <div>
          <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
            <span
              className="material-symbols-outlined text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              leaderboard
            </span>
            <span>Peringkat Belajar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
            Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-on-surface-variant mt-1">
            Lihat siapa yang sedang rajin belajar minggu ini.
          </p>
        </div>

        {/* Segmented Toggle */}
        <div
          className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant shrink-0 self-start sm:self-auto"
          role="tablist"
          aria-label="Periode Leaderboard"
        >
          <button
            type="button"
            role="tab"
            aria-selected={timeframe === 'weekly'}
            onClick={() => setTimeframe('weekly')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              timeframe === 'weekly'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Minggu Ini
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={timeframe === 'all-time'}
            onClick={() => setTimeframe('all-time')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
              timeframe === 'all-time'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Sepanjang Waktu
          </button>
        </div>
      </div>

      {/* Top 3 Podium (Desktop: 3 Podium Cards with Center Raised; Mobile: Vertical List) */}
      <section aria-label="3 Besar">
        {/* Desktop Podium View (md and up) */}
        <div className="hidden md:grid grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto pt-6 pb-2">
          {/* Rank 2 (Left) */}
          {rank2 && (
            <div
              className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-between transition-all duration-200 min-h-[260px] ${
                rank2.isCurrentUser
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                  : 'bg-surface-container-lowest border-outline-variant shadow-xs'
              }`}
            >
              <div className="space-y-3 w-full flex flex-col items-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold">
                  <span>🥈</span> Juara 2
                </span>
                <div
                  className="w-16 h-16 rounded-full text-white font-bold text-xl flex items-center justify-center shadow-xs ring-4 ring-slate-200 dark:ring-slate-700"
                  style={{ backgroundColor: rank2.avatarColor }}
                >
                  {rank2.initials}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="font-bold text-base text-on-surface">
                      {rank2.name}
                    </span>
                    {rank2.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                        Kamu
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-3 w-full border-t border-outline-variant/60">
                <span className="inline-block px-3 py-1 rounded-xl bg-surface-container-low text-on-surface font-extrabold text-sm sm:text-base font-code-formula">
                  {rank2.displayXp} XP
                </span>
              </div>
            </div>
          )}

          {/* Rank 1 (Center - Raised) */}
          {rank1 && (
            <div
              className={`rounded-2xl border-2 p-6 text-center flex flex-col items-center justify-between -translate-y-4 shadow-md transition-all duration-200 min-h-[300px] ${
                rank1.isCurrentUser
                  ? 'bg-gradient-to-b from-amber-500/10 to-primary/10 border-amber-400 ring-2 ring-primary/40'
                  : 'bg-gradient-to-b from-amber-50/70 via-surface-container-lowest to-surface-container-lowest dark:from-amber-950/20 border-amber-400/70'
              }`}
            >
              <div className="space-y-3 w-full flex flex-col items-center">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400 text-xs sm:text-sm font-extrabold shadow-2xs">
                  <span>👑</span> Juara 1
                </span>
                <div
                  className="w-20 h-20 rounded-full text-white font-extrabold text-2xl flex items-center justify-center shadow-md ring-4 ring-amber-400"
                  style={{ backgroundColor: rank1.avatarColor }}
                >
                  {rank1.initials}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="font-bold text-lg text-on-surface">
                      {rank1.name}
                    </span>
                    {rank1.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                        Kamu
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-4 w-full border-t border-amber-400/30">
                <span className="inline-block px-4 py-1.5 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold text-base sm:text-lg font-code-formula border border-amber-400/40">
                  {rank1.displayXp} XP
                </span>
              </div>
            </div>
          )}

          {/* Rank 3 (Right) */}
          {rank3 && (
            <div
              className={`rounded-2xl border p-5 text-center flex flex-col items-center justify-between transition-all duration-200 min-h-[240px] ${
                rank3.isCurrentUser
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/30'
                  : 'bg-surface-container-lowest border-outline-variant shadow-xs'
              }`}
            >
              <div className="space-y-3 w-full flex flex-col items-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30 text-xs font-bold">
                  <span>🥉</span> Juara 3
                </span>
                <div
                  className="w-16 h-16 rounded-full text-white font-bold text-xl flex items-center justify-center shadow-xs ring-4 ring-amber-700/30"
                  style={{ backgroundColor: rank3.avatarColor }}
                >
                  {rank3.initials}
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <span className="font-bold text-base text-on-surface">
                      {rank3.name}
                    </span>
                    {rank3.isCurrentUser && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary">
                        Kamu
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="pt-3 w-full border-t border-outline-variant/60">
                <span className="inline-block px-3 py-1 rounded-xl bg-surface-container-low text-on-surface font-extrabold text-sm sm:text-base font-code-formula">
                  {rank3.displayXp} XP
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Podium View (Simple Vertical List) */}
        <div className="md:hidden flex flex-col gap-2.5 pt-1">
          {top3.map((entry, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
            const medalLabel = idx === 0 ? 'Juara 1' : idx === 1 ? 'Juara 2' : 'Juara 3';
            const isFirst = idx === 0;

            return (
              <div
                key={entry.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                  entry.isCurrentUser
                    ? 'bg-primary/10 border-primary shadow-xs'
                    : isFirst
                    ? 'bg-gradient-to-r from-amber-500/10 to-surface-container-lowest border-amber-400/60 shadow-xs'
                    : 'bg-surface-container-lowest border-outline-variant shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl select-none shrink-0" title={medalLabel}>
                    {medal}
                  </span>
                  <div
                    className="w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: entry.avatarColor }}
                  >
                    {entry.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-on-surface truncate">
                        {entry.name}
                      </span>
                      {entry.isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-on-primary shrink-0">
                          Kamu
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant font-medium">
                      {medalLabel}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold font-code-formula ${
                      isFirst
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30'
                        : 'bg-surface-container-low text-on-surface'
                    }`}
                  >
                    {entry.displayXp} XP
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ranks 4 to 10 List */}
      <section aria-label="Peringkat 4 hingga 10" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-on-surface">
            Peringkat Lainnya
          </h2>
          <span className="text-xs sm:text-sm text-on-surface-variant">
            Top 10 Pelajar Teraktif
          </span>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant divide-y divide-outline-variant/60 overflow-hidden shadow-xs">
          {ranks4To10.map((entry) => (
            <div
              key={entry.id}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4 transition-colors ${
                entry.isCurrentUser
                  ? 'bg-primary/10 border-l-4 border-l-primary font-medium'
                  : 'hover:bg-surface-container-low/50'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span
                  className={`w-7 sm:w-8 text-center font-bold text-sm sm:text-base ${
                    entry.isCurrentUser ? 'text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  #{entry.rank}
                </span>
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs"
                  style={{ backgroundColor: entry.avatarColor }}
                >
                  {entry.initials}
                </div>
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base text-on-surface truncate">
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary shrink-0">
                      Kamu
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <span
                  className="material-symbols-outlined text-primary text-base select-none"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  stars
                </span>
                <span className="font-bold text-sm sm:text-base text-on-surface font-code-formula">
                  {entry.displayXp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supportive Warm Note (Anti-Shaming, Mindful Learning) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/60 flex items-start gap-3.5 text-on-surface-variant">
        <span className="text-xl sm:text-2xl select-none shrink-0 mt-0.5">🌱</span>
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold text-on-surface">
            Belajar Sesuai Ritmemu Sendiri
          </p>
          <p className="leading-relaxed">
            Papan peringkat ini ada untuk merayakan usaha konsisten, bukan untuk membebani. Setiap soal yang kamu coba dan setiap bab yang kamu baca menambah pemahaman serta XP-mu secara bertahap.
          </p>
        </div>
      </div>

      {/* Sticky User Bar if Outside Top 10 */}
      {isUserOutsideTop10 && currentUserItem && (
        <div className="fixed bottom-4 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-7xl mx-auto pointer-events-auto">
            <div className="bg-surface-container-lowest/95 backdrop-blur-md border-2 border-primary/50 shadow-xl rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className="w-8 sm:w-10 text-center font-bold text-sm sm:text-base text-primary">
                  #{currentUserItem.rank}
                </span>
                <div
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs"
                  style={{ backgroundColor: currentUserItem.avatarColor }}
                >
                  {currentUserItem.initials}
                </div>
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-bold text-sm sm:text-base text-on-surface truncate">
                    {currentUserItem.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary text-on-primary shrink-0">
                    Kamu
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs sm:text-sm text-on-surface-variant hidden sm:inline">
                  Posisi saat ini
                </span>
                <span className="px-3 py-1 rounded-xl bg-primary/15 text-primary text-sm sm:text-base font-extrabold font-code-formula border border-primary/25">
                  {currentUserItem.displayXp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
