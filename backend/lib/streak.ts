import type { SupabaseClient } from '@supabase/supabase-js';

/** 'YYYY-MM-DD' in Jakarta time (UTC+7), `daysAgo` days back. */
export function jakartaDate(daysAgo = 0): string {
  return new Date(Date.now() + 7 * 3600_000 - daysAgo * 86400_000).toISOString().slice(0, 10);
}

/**
 * Counts today as an active day: any learning activity (answering a question, finishing a topic)
 * keeps the streak, not only activity that earns XP. Studying on consecutive days grows it;
 * missing a day starts it again at 1.
 */
export async function recordActivity(db: SupabaseClient, userId: string): Promise<{ streakDays: number; bestStreak: number }> {
  const { data, error } = await db
    .from('profiles')
    .select('streak_days, best_streak, last_active_date')
    .eq('id', userId)
    .single();
  if (error) throw error;

  const today = jakartaDate(0);
  if (data.last_active_date === today) return { streakDays: data.streak_days, bestStreak: data.best_streak };

  const streakDays = data.last_active_date === jakartaDate(1) ? data.streak_days + 1 : 1;
  const bestStreak = Math.max(data.best_streak, streakDays);
  const { error: updateError } = await db
    .from('profiles')
    .update({ streak_days: streakDays, best_streak: bestStreak, last_active_date: today })
    .eq('id', userId);
  if (updateError) throw updateError;
  return { streakDays, bestStreak };
}
