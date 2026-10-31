import { QUESTION_BY_ID } from '@/data/practice';
import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';
import { PRACTICE_XP } from '@/lib/topics';

export const dynamic = 'force-dynamic';

// POST /api/practice/check  { "questionId": "T3-L04", "selected": 2 }
// → { questionId, correct, answer, explanation, xpAwarded? }
// The answer key stays on the server; the student gets it (with the worked solution) after answering.
// Signed in (Authorization: Bearer <token>): the first answer to each question is saved, and a correct
// first answer gives XP once. `xpAwarded` is only sent to signed-in students.
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { questionId?: unknown; selected?: unknown } | null;
  const question = typeof body?.questionId === 'string' ? QUESTION_BY_ID.get(body.questionId) : undefined;
  if (!question) return errorResponse(404, 'Soal tidak ditemukan');

  const selected = body?.selected;
  if (typeof selected !== 'number' || !Number.isInteger(selected) || selected < 0 || selected >= question.options.length) {
    return errorResponse(400, 'Pilihan jawaban tidak valid');
  }
  const correct = selected === question.answer;

  let xpAwarded: number | undefined;
  const user = await getUser(req);
  if (user) {
    const db = supabaseAdmin();
    // ignoreDuplicates: returns the row only when this is the student's first answer to the question.
    const { data, error } = await db
      .from('practice_answers')
      .upsert({ user_id: user.id, question_id: question.id, selected, correct }, { onConflict: 'user_id,question_id', ignoreDuplicates: true })
      .select('question_id');
    if (error) throw error;
    xpAwarded = data.length > 0 && correct ? PRACTICE_XP[question.tier] : 0;
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
  });
});
