import { QUESTION_BY_ID } from '@/data/practice';
import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';
import { recordActivity } from '@/lib/streak';
import { PRACTICE_XP } from '@/lib/topics';
import { secondsSince, speedXp } from '@/lib/question-timer';

export const dynamic = 'force-dynamic';

// POST /api/practice/check  { "questionId": "T3-L04", "selected": 2, "review"?: true, "stamp"?: "…" }
// → { questionId, correct, answer, explanation, xpAwarded?, streakDays? }
// The answer key stays on the server; the student gets it (with the worked solution) after answering.
// Signed in (Authorization: Bearer <token>): the first answer to each question is saved, a correct
// first answer gives XP once, and every answer counts as today's activity for the streak.
// `review: true` only fetches the solution of an earlier answer: nothing is saved or counted.
// Sangat Sulit: the XP depends on how fast it was answered, measured from the `stamp` that
// /api/practice/start gave when the question opened (lib/question-timer.ts).
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { questionId?: unknown; selected?: unknown; review?: unknown; stamp?: unknown } | null;
  const question = typeof body?.questionId === 'string' ? QUESTION_BY_ID.get(body.questionId) : undefined;
  if (!question) return errorResponse(404, 'Soal tidak ditemukan');

  const selected = body?.selected;
  if (typeof selected !== 'number' || !Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
    return errorResponse(400, 'Pilihan jawaban tidak valid');
  }
  const correct = selected === question.answer;

  let xpAwarded: number | undefined;
  let streakDays: number | undefined;
  const user = body?.review === true ? null : await getUser(req);
  if (user) {
    const db = supabaseAdmin();
    // ignoreDuplicates: returns the row only when this is the student's first answer to the question.
    const { data, error } = await db
      .from('practice_answers')
      .upsert({ user_id: user.id, question_id: question.id, selected, correct }, { onConflict: 'user_id,question_id', ignoreDuplicates: true })
      .select('question_id');
    if (error) throw error;
    // Before add_xp, so the streak is updated here (add_xp then sees today already counted).
    ({ streakDays } = await recordActivity(db, user.id));
    const tierXp = question.tier === 'sangat_sulit' ? speedXp(secondsSince(body?.stamp, user.id, question.id)) : PRACTICE_XP[question.tier];
    xpAwarded = data.length > 0 && correct ? tierXp : 0;
    if (xpAwarded > 0) {
      const { error: xpError } = await db.rpc('add_xp', { p_user: user.id, p_amount: xpAwarded });
      if (xpError) throw xpError;
    }
  }

  return Response.json({
    questionId: question.id,
    correct,
    answer: question.answer,
    explanation: question.explanation,
    xpAwarded,
    streakDays,
  });
});
