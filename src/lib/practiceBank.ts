import { mockTopics } from '../data/mockData';

// What Latihan Mandiri offers per topic.
// Every topic has the four-tier bank (backend/data/practice, ids like 'T3-L04'). Topics whose chapter
// has its own Latihan Soal (course material) also have a Latihan Harian without difficulty levels
// (backend/data/daily, ids like 'H1-07').

/** Topic orders whose chapter has Latihan Soal (Latihan Harian). */
export const DAILY_TOPIC_ORDERS: readonly number[] = [1, 2];
/** Latihan Soal per chapter. */
export const DAILY_BANK_SIZE = 30;
/** Questions in Latihan Mandiri's daily set (the reading page shows 5 of them). */
export const PRACTICE_DAILY_COUNT = 10;
/** Four tiers × 10 questions. */
export const TIERED_QUESTIONS_PER_TOPIC = 40;

const TOPIC_COUNT = mockTopics.length;

export const hasDailyPractice = (topicOrder: number) => DAILY_TOPIC_ORDERS.includes(topicOrder);

export const practiceQuestionsFor = (topicOrder: number) =>
  TIERED_QUESTIONS_PER_TOPIC + (hasDailyPractice(topicOrder) ? DAILY_BANK_SIZE : 0);

export const TOTAL_PRACTICE_QUESTIONS = Array.from({ length: TOPIC_COUNT }, (_, i) => practiceQuestionsFor(i + 1)).reduce(
  (a, b) => a + b,
  0
);

/** The topic order a saved answer (tiered or Latihan Harian) counts for, or null. */
export function practiceTopicOf(questionId: string): number | null {
  const m = /^[TH](\d+)-/.exec(questionId);
  return m ? Number(m[1]) : null;
}
