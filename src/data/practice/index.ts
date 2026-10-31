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

/** Correct answers needed in Sulit to unlock Sangat Sulit. */
export const UNLOCK_HARDEST_AT = 8;

/** GET /api/practice/[topicId] */
export async function loadPracticeSet(topicId: string): Promise<PracticeQuestion[]> {
  const { questions } = await api<{ questions: PracticeQuestion[] }>(`/api/practice/${encodeURIComponent(topicId)}`);
  return questions;
}

/** POST /api/practice/check (signed in: the server also saves the answer and awards XP) */
export function checkPracticeAnswer(questionId: string, selected: number): Promise<PracticeCheckResult> {
  return authApi<PracticeCheckResult>('/api/practice/check', {
    method: 'POST',
    body: JSON.stringify({ questionId, selected }),
  });
}
