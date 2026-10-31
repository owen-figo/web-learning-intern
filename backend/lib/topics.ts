import type { DifficultyTier } from './practice-types';

// Topic ids must match src/data/mockData.ts in the frontend.
export const TOPIC_IDS = [
  'mendefinisikan-mengumpulkan-data',
  'mengorganisasi-memvisualisasikan-variabel',
  'ukuran-deskriptif-numerik',
  'probabilitas-dasar',
  'distribusi-probabilitas-diskrit',
  'distribusi-normal-kontinu',
  'distribusi-sampling',
  'estimasi-interval-kepercayaan',
] as const;

/** XP for finishing a topic's theory, awarded once per topic (same as completionXp in the frontend). */
export const TOPIC_COMPLETION_XP = 15;

/** XP for a correct Latihan Mandiri answer, once per question (same as TIER_XP in the frontend). */
export const PRACTICE_XP: Record<DifficultyTier, number> = {
  mudah: 5,
  sedang: 10,
  sulit: 15,
  sangat_sulit: 20,
};

export function isTopicId(value: unknown): value is (typeof TOPIC_IDS)[number] {
  return typeof value === 'string' && (TOPIC_IDS as readonly string[]).includes(value);
}
