import { supabaseAdmin } from '@/lib/supabase';
import { handle } from '@/lib/http';

export const dynamic = 'force-dynamic';

const COLUMNS = 'id, display_name, initials, avatar_color, xp';

// GET /api/leaderboard  → top 50 students by total XP (global, all time).
// Same XP: whoever reached that XP first ranks higher (profiles.xp_reached_at, stamped by add_xp;
// see supabase/leaderboard-ties.sql). Public: only display names, avatars and XP.
export const GET = handle(async () => {
  const db = supabaseAdmin();
  let result = await db
    .from('profiles')
    .select(COLUMNS)
    .order('xp', { ascending: false })
    .order('xp_reached_at', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(50);
  // leaderboard-ties.sql not run yet (no xp_reached_at column): fall back to the old order.
  if (result.error?.code === '42703') {
    result = await db
      .from('profiles')
      .select(COLUMNS)
      .order('xp', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(50);
  }
  const { data, error } = result;
  if (error) throw error;

  return Response.json({
    entries: data.map((p, i) => ({
      rank: i + 1,
      id: p.id,
      name: p.display_name,
      initials: p.initials,
      avatarColor: p.avatar_color,
      xp: p.xp,
    })),
  });
});
