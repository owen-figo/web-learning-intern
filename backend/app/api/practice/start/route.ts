import { QUESTION_BY_ID } from '@/data/practice';
import { getUser } from '@/lib/auth';
import { errorResponse, handle } from '@/lib/http';
import { issueStamp } from '@/lib/question-timer';

export const dynamic = 'force-dynamic';

// POST /api/practice/start  { "questionId": "T3-X04" } → { stamp }
// Called when a signed-in student opens a Sangat Sulit question; the stamp goes back with the answer
// to /api/practice/check, which measures the time for the speed bonus (see lib/question-timer.ts).
export const POST = handle(async (req: Request) => {
  const user = await getUser(req);
  if (!user) return errorResponse(401, 'Masuk dulu untuk mendapatkan bonus kecepatan.');
  const body = (await req.json().catch(() => null)) as { questionId?: unknown } | null;
  const question = typeof body?.questionId === 'string' ? QUESTION_BY_ID.get(body.questionId) : undefined;
  if (!question) return errorResponse(404, 'Soal tidak ditemukan');
  if (question.tier !== 'sangat_sulit') return errorResponse(400, 'Bonus kecepatan hanya untuk soal Sangat Sulit');
  return Response.json({ stamp: issueStamp(user.id, question.id) });
});
