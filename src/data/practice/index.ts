import type { DifficultyTier, PracticeQuestion } from '../../types';

// Latihan Mandiri question bank: 8 topics × 4 tiers × 10 questions.
// Each topic file is loaded only when that topic is opened on the practice page.
const LOADERS: Record<string, () => Promise<{ questions: PracticeQuestion[] }>> = {
  'mendefinisikan-mengumpulkan-data': () => import('./topic1Data'),
  'mengorganisasi-memvisualisasikan-variabel': () => import('./topic2Organizing'),
  'ukuran-deskriptif-numerik': () => import('./topic3Measures'),
  'probabilitas-dasar': () => import('./topic4Probability'),
  'distribusi-probabilitas-diskrit': () => import('./topic5Discrete'),
  'distribusi-normal-kontinu': () => import('./topic6Continuous'),
  'distribusi-sampling': () => import('./topic7Sampling'),
  'estimasi-interval-kepercayaan': () => import('./topic8Confidence'),
};

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

export function hasPracticeSet(topicId: string): boolean {
  return topicId in LOADERS;
}

export async function loadPracticeSet(topicId: string): Promise<PracticeQuestion[]> {
  const load = LOADERS[topicId];
  if (!load) return [];
  const mod = await load();
  return mod.questions;
}
