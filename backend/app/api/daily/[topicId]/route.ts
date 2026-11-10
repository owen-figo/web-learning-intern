import { DAILY_BY_TOPIC, DAILY_SET_SIZES, dailySet } from '@/data/daily';
import { toPublicDaily } from '@/data/daily/types';
import { errorResponse, handle } from '@/lib/http';
import { jakartaDate } from '@/lib/streak';
import { isTopicId } from '@/lib/topics';

export const dynamic = 'force-dynamic';

// GET /api/daily/[topicId]?count=5|10 → { topicId, date, total, questions }
// Today's Latihan Harian (5 questions by default, 10 for Latihan Mandiri; a new set every day at
// midnight WIB), WITHOUT answers or explanations; answers are checked with POST /api/daily/check.
// `questions` is empty for topics that have no daily exercise.
export const GET = handle(async (req: Request, { params }: { params: Promise<{ topicId: string }> }) => {
  const { topicId } = await params;
  if (!isTopicId(topicId)) return errorResponse(404, 'Topik tidak ditemukan');

  const count = Number(new URL(req.url).searchParams.get('count') ?? 5);
  if (!(DAILY_SET_SIZES as readonly number[]).includes(count)) return errorResponse(400, 'Jumlah soal tidak valid');

  const date = jakartaDate();
  return Response.json({
    topicId,
    date,
    total: DAILY_BY_TOPIC.get(topicId)?.length ?? 0,
    questions: dailySet(topicId, date, count).map(toPublicDaily),
  });
});
