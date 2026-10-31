import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';

export const dynamic = 'force-dynamic';

/** 'YYYY-MM-DD' in Jakarta time (UTC+7), `daysAgo` days back. */
function jakartaDate(daysAgo = 0): string {
  return new Date(Date.now() + 7 * 3600_000 - daysAgo * 86400_000).toISOString().slice(0, 10);
}

// GET /api/progress  (needs Authorization: Bearer <token>)
// → the signed-in student's profile, finished topics, and Latihan Mandiri answers.
export const GET = handle(async (req: Request) => {
  const user = await getUser(req);
  if (!user) return errorResponse(401, 'Silakan masuk terlebih dahulu');

  const db = supabaseAdmin();
  const [profile, topics, answers] = await Promise.all([
    db
      .from('profiles')
      .select('display_name, initials, avatar_color, xp, streak_days, best_streak, last_active_date, email_digest, whatsapp_ping')
      .eq('id', user.id)
      .single(),
    db.from('topic_progress').select('topic_id, completed_at').eq('user_id', user.id),
    db.from('practice_answers').select('question_id, selected, correct').eq('user_id', user.id),
  ]);
  if (profile.error) throw profile.error;
  if (topics.error) throw topics.error;
  if (answers.error) throw answers.error;

  // The stored streak only counts while the student was active today or yesterday.
  const p = profile.data;
  const streakAlive = p.last_active_date === jakartaDate(0) || p.last_active_date === jakartaDate(1);

  return Response.json({
    id: user.id,
    name: p.display_name,
    initials: p.initials,
    avatarColor: p.avatar_color,
    xp: p.xp,
    streakDays: streakAlive ? p.streak_days : 0,
    bestStreak: p.best_streak,
    emailDigest: p.email_digest,
    whatsappPing: p.whatsapp_ping,
    completedTopicIds: topics.data.map((t) => t.topic_id),
    // Same shape as the frontend's saved practice state: { [questionId]: { selected, correct } }
    answers: Object.fromEntries(answers.data.map((a) => [a.question_id, { selected: a.selected, correct: a.correct }])),
  });
});
