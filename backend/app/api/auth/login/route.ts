import { timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';
import { clearAttempts, tooManyAttempts } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_PER_EMAIL = 10;
const MAX_PER_IP = 30;

function sameText(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// POST /api/auth/login  { "email": "...", "nim": "..." }  → { ok: true }
// Checks the email + NIM against the `students` table and makes sure the student has a Supabase Auth
// account whose password is their NIM. The browser then signs in with Supabase directly
// (src/lib/auth.ts), so sessions and token refresh are handled by Supabase.
export const POST = handle(async (req: Request) => {
  const body = (await req.json().catch(() => null)) as { email?: unknown; nim?: unknown } | null;
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  const nim = typeof body?.nim === 'string' ? body.nim.trim() : '';
  if (!email || !nim) return errorResponse(400, 'Isi email dan NIM kamu.');

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (tooManyAttempts(`ip:${ip}`, MAX_PER_IP, WINDOW_MS) || tooManyAttempts(`email:${email}`, MAX_PER_EMAIL, WINDOW_MS)) {
    return errorResponse(429, 'Terlalu banyak percobaan masuk. Tunggu 15 menit, lalu coba lagi.');
  }

  const db = supabaseAdmin();
  const { data: student, error } = await db
    .from('students')
    .select('email, nim, name, user_id')
    .eq('email', email)
    .maybeSingle();
  if (error) {
    if (error.code === 'PGRST205' || error.code === '42P01') {
      return errorResponse(503, 'Data mahasiswa belum disiapkan. Jalankan backend/supabase/students.sql di Supabase.');
    }
    throw error;
  }
  if (!student || !sameText(student.nim, nim)) return errorResponse(401, 'Email atau NIM tidak cocok dengan data mahasiswa.');
  clearAttempts(`email:${email}`);

  // The students table is the source of truth: the account is created on first login, and its
  // password and name are re-synced on every login (e.g. after a corrected NIM was imported).
  const account = { password: nim, user_metadata: { name: student.name } };
  if (student.user_id) {
    const { error: updateError } = await db.auth.admin.updateUserById(student.user_id, account);
    if (updateError) throw updateError;
  } else {
    const { data: created, error: createError } = await db.auth.admin.createUser({ email, email_confirm: true, ...account });
    if (createError?.code === 'email_exists') {
      // Made by hand in the dashboard (not by this route), or a parallel first login: not linked yet.
      return errorResponse(409, 'Akun ini sedang disiapkan atau dibuat manual di Supabase. Coba lagi sebentar lagi.');
    }
    if (createError) throw createError;
    const { error: linkError } = await db.from('students').update({ user_id: created.user.id }).eq('email', email);
    if (linkError) throw linkError;
  }

  return Response.json({ ok: true });
});
