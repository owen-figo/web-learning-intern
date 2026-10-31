import { QUESTIONS_BY_TOPIC } from '@/data/practice';
import { toPublic } from '@/lib/practice-types';
import { errorResponse, handle } from '@/lib/http';
import { isTopicId } from '@/lib/topics';

// GET /api/practice/[topicId] → the topic's 40 questions (4 tiers × 10), WITHOUT answers or explanations.
// Answers are checked with POST /api/practice/check so they never sit in the browser before an attempt.
export const GET = handle(async (_req: Request, { params }: { params: Promise<{ topicId: string }> }) => {
  const { topicId } = await params;
  if (!isTopicId(topicId)) return errorResponse(404, 'Topik tidak ditemukan');

  const questions = (QUESTIONS_BY_TOPIC.get(topicId) ?? []).map(toPublic);
  return Response.json(
    { topicId, questions },
    // The question bank only changes on deploy, so browsers may reuse it for a few minutes.
    { headers: { 'Cache-Control': 'public, max-age=300' } }
  );
});
