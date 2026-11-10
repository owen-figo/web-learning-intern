import type { DailyQuestion } from './types';
import { questions as topic1 } from './topic1';
import { questions as topic2 } from './topic2';

// Latihan Harian question bank (the chapters' Latihan Soal). Only topics with questions here show the
// daily exercise on their reading page.
const ALL: DailyQuestion[] = [...topic1, ...topic2];

export const DAILY_BY_TOPIC: ReadonlyMap<string, DailyQuestion[]> = ALL.reduce((map, q) => {
  map.set(q.topicId, [...(map.get(q.topicId) ?? []), q]);
  return map;
}, new Map<string, DailyQuestion[]>());

export const DAILY_BY_ID: ReadonlyMap<string, DailyQuestion> = new Map(ALL.map((q) => [q.id, q]));

/** Questions per day: 5 on the reading page, 10 in Latihan Mandiri. */
export const DAILY_SET_SIZES = [5, 10] as const;

/** XP for a correct Latihan Harian answer, once per question (like Latihan Mandiri's Mudah tier). */
export const DAILY_XP = 5;

/**
 * Today's set of `size` questions for a topic, the same for every student on a given (Jakarta) date.
 * The bank is split into round(n / size) sets that take every k-th question, so each day mixes early
 * (easier) and later questions, and every question comes up once per cycle (30 questions: 6 days for
 * 5 a day, 3 days for 10 a day). With 30 questions the day's 5 are always part of the day's 10.
 */
export function dailySet(topicId: string, date: string, size: number): DailyQuestion[] {
  const bank = DAILY_BY_TOPIC.get(topicId) ?? [];
  if (bank.length === 0) return [];
  const sets = Math.max(1, Math.round(bank.length / size));
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  const k = ((day % sets) + sets) % sets;
  return bank.filter((_, i) => i % sets === k);
}
