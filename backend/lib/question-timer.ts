import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

// Speed bonus for Sangat Sulit questions: the faster a correct answer, the more XP.
// When such a question opens, the server hands out a signed "opened at" stamp
// (POST /api/practice/start); the check route verifies it and measures the time itself, so the
// browser cannot fake a fast answer. The signing secret lives in memory only: after a server restart
// older stamps are invalid and the answer simply gets the minimum XP.

const g = globalThis as { __questionTimerSecret?: Buffer };
const secret = (g.__questionTimerSecret ??= randomBytes(32));

const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');

/** A stamp for this student and question: "<issued at ms>.<signature>". */
export function issueStamp(userId: string, questionId: string): string {
  const issuedAt = Date.now();
  return `${issuedAt}.${sign(`${userId}|${questionId}|${issuedAt}`)}`;
}

/** Seconds since the stamp was issued, or null if it is missing, forged or for another question. */
export function secondsSince(stamp: unknown, userId: string, questionId: string): number | null {
  if (typeof stamp !== 'string') return null;
  const [issuedAtText, signature] = stamp.split('.');
  const issuedAt = Number(issuedAtText);
  if (!Number.isFinite(issuedAt) || !signature) return null;
  const expected = Buffer.from(sign(`${userId}|${questionId}|${issuedAt}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const seconds = (Date.now() - issuedAt) / 1000;
  return seconds >= 0 ? seconds : null;
}

/**
 * XP for a correct Sangat Sulit answer after `seconds` (null: no valid stamp). Same curve as the
 * frontend's speedXp (src/data/practice/index.ts):
 *   ≤ 1.5 min → 30 · 1.5–5 min → 30 down to 20 · 5–10 min → 20 down to 10 · > 10 min → 10.
 */
export function speedXp(seconds: number | null): number {
  if (seconds === null) return 10;
  if (seconds <= 90) return 30;
  if (seconds <= 300) return Math.round(30 - (10 * (seconds - 90)) / 210);
  if (seconds <= 600) return Math.round(20 - (10 * (seconds - 300)) / 300);
  return 10;
}
