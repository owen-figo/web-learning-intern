export type DifficultyTier = 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit';

/** A Latihan Mandiri question as stored on the server, including its answer key. */
export interface PracticeQuestion {
  /** e.g. 'T3-L04' = topic 3, tier Sulit (L), question 4 */
  id: string;
  topicId: string;
  tier: DifficultyTier;
  /** Question text; supports **bold** and line breaks. */
  prompt: string;
  /** Optional data block (table, list of values), shown in monospace. */
  data?: string;
  options: string[];
  /** Index (0–3) of the correct option. Never sent with the question list. */
  answer: number;
  /** Worked solution. Sent only after the student checks their answer. */
  explanation: string;
  hint?: string;
  formula?: string;
  /** Optional link to a glossary concept in the frontend's data/concepts.ts. */
  conceptId?: string;
}

/** What GET /api/practice/[topicId] sends: everything except the answer key and the explanation. */
export type PublicPracticeQuestion = Omit<PracticeQuestion, 'answer' | 'explanation'>;

export function toPublic({ answer: _answer, explanation: _explanation, ...rest }: PracticeQuestion): PublicPracticeQuestion {
  return rest;
}
