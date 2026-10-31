import type { PracticeQuestion } from '../../lib/practice-types';
import { questions as topic1 } from './topic1Data';
import { questions as topic2 } from './topic2Organizing';
import { questions as topic3 } from './topic3Measures';
import { questions as topic4 } from './topic4Probability';
import { questions as topic5 } from './topic5Discrete';
import { questions as topic6 } from './topic6Continuous';
import { questions as topic7 } from './topic7Sampling';
import { questions as topic8 } from './topic8Confidence';

// Latihan Mandiri question bank: 8 topics × 4 tiers × 10 questions.
const ALL: PracticeQuestion[] = [...topic1, ...topic2, ...topic3, ...topic4, ...topic5, ...topic6, ...topic7, ...topic8];

export const QUESTIONS_BY_TOPIC: ReadonlyMap<string, PracticeQuestion[]> = ALL.reduce((map, q) => {
  map.set(q.topicId, [...(map.get(q.topicId) ?? []), q]);
  return map;
}, new Map<string, PracticeQuestion[]>());

export const QUESTION_BY_ID: ReadonlyMap<string, PracticeQuestion> = new Map(ALL.map((q) => [q.id, q]));
