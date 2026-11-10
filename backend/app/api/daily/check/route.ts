import { DAILY_BY_ID, DAILY_XP } from '@/data/daily';
import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';
import { recordActivity } from '@/lib/streak';

export const dynamic = 'force-dynamic';

// POST /api/daily/check  { "questionId": "H1-07", "selected": 2 }
// → { questionId, correct, answer, explanation, xpAwarded?, streakDays? }
// Same rules as Latihan Mandiri (/api/practice/check): signed in, the first answer to each question is
// saved (practice_answers), a correct first answer gives XP once, and every answer counts for the streak.
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { questionId?: unknown; selected?: unknown } | null;
  const question = typeof body?.questionId === 'string' ? DAILY_BY_ID.get(body.questionId) : undefined;
  if (!question) return errorResponse(404, 'Soal tidak ditemukan');

  const selected = body?.selected;
  if (typeof selected !== 'number' || !Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
    return errorResponse(400, 'Pilihan jawaban tidak valid');
  }
  const correct = selected === question.answer;

  let xpAwarded: number | undefined;
  let streakDays: number | undefined;
  const user = await getUser(req);
  if (user) {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from('practice_answers')
      .upsert({ user_id: user.id, question_id: question.id, selected, correct }, { onConflict: 'user_id,question_id', ignoreDuplicates: true })
      .select('question_id');
    if (error) throw error;
    ({ streakDays } = await recordActivity(db, user.id));
    xpAwarded = data.length > 0 && correct ? DAILY_XP : 0;
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
