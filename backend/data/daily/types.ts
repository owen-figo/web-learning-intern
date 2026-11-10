/** A Latihan Harian question (reading page, no difficulty levels), with its answer key. */
export interface DailyQuestion {
  /** e.g. 'H1-07' = topic 1, question 7 of the chapter's Latihan Soal. */
  id: string;
  topicId: string;
  /** Question text; supports **bold** and line breaks. */
  prompt: string;
  /** Optional data block (table, list of values), shown in monospace. */
  data?: string;
  options: string[];
  /** Index (0–3) of the correct option. Never sent with the question list. */
  answer: number;
  /** Explanation, sent only after the student answers. */
  explanation: string;
}

export type PublicDailyQuestion = Omit<DailyQuestion, 'answer' | 'explanation'>;

export function toPublicDaily({ answer: _answer, explanation: _explanation, ...rest }: DailyQuestion): PublicDailyQuestion {
  return rest;
}
