import { isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/health: quick check that the backend is running and whether Supabase is set up.
export function GET() {
  return Response.json({
    ok: true,
    service: 'ngerti-backend',
    supabase: isSupabaseConfigured() ? 'configured' : 'missing env (see backend/.env.example)',
  });
}
