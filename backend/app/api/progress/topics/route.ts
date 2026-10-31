import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';
import { isTopicId, TOPIC_COMPLETION_XP } from '@/lib/topics';

export const dynamic = 'force-dynamic';

// POST /api/progress/topics  { "topicId": "..." }  (needs Authorization: Bearer <token>)
// Marks a topic's theory as finished ("Selesai Belajar"). XP is decided here, not by the browser,
// and only awarded the first time.
export const POST = handle(async (req: Request) => {
  const user = await getUser(req);
  if (!user) return errorResponse(401, 'Silakan masuk terlebih dahulu');

  const body = (await req.json().catch(() => null)) as { topicId?: unknown } | null;
  if (!isTopicId(body?.topicId)) return errorResponse(400, 'topicId tidak dikenal');

  const db = supabaseAdmin();
  // ignoreDuplicates: returns the row only when it was newly inserted.
  const { data, error } = await db
    .from('topic_progress')
    .upsert({ user_id: user.id, topic_id: body.topicId }, { onConflict: 'user_id,topic_id', ignoreDuplicates: true })
    .select('topic_id');
  if (error) throw error;

  const firstTime = data.length > 0;
  if (firstTime) {
    const { error: xpError } = await db.rpc('add_xp', { p_user: user.id, p_amount: TOPIC_COMPLETION_XP });
    if (xpError) throw xpError;
  }

  return Response.json({ topicId: body.topicId, xpAwarded: firstTime ? TOPIC_COMPLETION_XP : 0 });
});
