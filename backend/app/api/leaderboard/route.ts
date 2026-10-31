import { supabaseAdmin } from '@/lib/supabase';
import { handle } from '@/lib/http';

export const dynamic = 'force-dynamic';

// GET /api/leaderboard  → top 50 students by total XP (global, all time).
// Public: only display names, avatars and XP.
export const GET = handle(async () => {
  const { data, error } = await supabaseAdmin()
    .from('profiles')
    .select('id, display_name, initials, avatar_color, xp')
    .order('xp', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50);
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
