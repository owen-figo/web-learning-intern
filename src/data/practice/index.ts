import type { DifficultyTier, PracticeCheckResult, PracticeQuestion } from '../../types';
import { api } from '../../lib/api';
import { authApi } from '../../lib/auth';

// Latihan Mandiri: the question bank (8 topics × 4 tiers × 10 questions) lives in the backend
// (backend/data/practice). Questions arrive without answers; answers are checked by the server.

export const TIER_ORDER: DifficultyTier[] = ['mudah', 'sedang', 'sulit', 'sangat_sulit'];

export const TIER_LABEL: Record<DifficultyTier, string> = {
  mudah: 'Mudah',
  sedang: 'Sedang',
  sulit: 'Sulit',
  sangat_sulit: 'Sangat Sulit',
};

/** XP for answering correctly on the first attempt. */
export const TIER_XP: Record<DifficultyTier, number> = {
  mudah: 5,
  sedang: 10,
  sulit: 15,
  sangat_sulit: 20,
};

/** Sangat Sulit gives 10–30 XP depending on speed (see speedXp); TIER_XP holds the other tiers. */
export const SPEED_XP_RANGE = { min: 10, max: 30 } as const;

/**
 * XP for a correct Sangat Sulit answer after `seconds` (null: not timed). Same curve as the backend
 * (backend/lib/question-timer.ts), which decides the real XP:
 *   ≤ 1.5 min → 30 · 1.5–5 min → 30 down to 20 · 5–10 min → 20 down to 10 · > 10 min → 10.
 */
export function speedXp(seconds: number | null): number {
  if (seconds === null) return 10;
  if (seconds <= 90) return 30;
  if (seconds <= 300) return Math.round(30 - (10 * (seconds - 90)) / 210);
  if (seconds <= 600) return Math.round(20 - (10 * (seconds - 300)) / 300);
  return 10;
}

/** Correct answers needed in Sulit to unlock Sangat Sulit. */
export const UNLOCK_HARDEST_AT = 8;

/** GET /api/practice/[topicId] */
export async function loadPracticeSet(topicId: string): Promise<PracticeQuestion[]> {
  const { questions } = await api<{ questions: PracticeQuestion[] }>(`/api/practice/${encodeURIComponent(topicId)}`);
  return questions;
}

/** POST /api/practice/start: the server's signed "opened at" stamp for a Sangat Sulit question. */
export async function startPracticeQuestion(questionId: string): Promise<string> {
  const { stamp } = await authApi<{ stamp: string }>('/api/practice/start', { method: 'POST', body: JSON.stringify({ questionId }) });
  return stamp;
}

/** When a stamp was issued (ms), for the timer shown on the question. */
export const stampTime = (stamp: string) => Number(stamp.split('.')[0]);

/**
 * POST /api/practice/check (signed in: the server also saves the answer, awards XP and counts the
 * streak). `review` only fetches the solution of an earlier answer; `stamp` times a Sangat Sulit answer.
 */
export function checkPracticeAnswer(questionId: string, selected: number, review = false, stamp?: string): Promise<PracticeCheckResult> {
  return authApi<PracticeCheckResult>('/api/practice/check', {
    method: 'POST',
    body: JSON.stringify(review ? { questionId, selected, review } : { questionId, selected, ...(stamp ? { stamp } : {}) }),
  });
}
