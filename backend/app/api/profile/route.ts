import { getUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse, handle } from '@/lib/http';

export const dynamic = 'force-dynamic';

// PATCH /api/profile  (needs Authorization: Bearer <token>)
// { name?, initials?, avatarColor?, emailDigest?, whatsappPing? }  → { ok: true }
// The settings a student can change on the profile page. XP and streak are not editable here.
export const PATCH = handle(async (req: Request) => {
  const user = await getUser(req);
  if (!user) return errorResponse(401, 'Silakan masuk terlebih dahulu');

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return errorResponse(400, 'Data profil tidak valid');

  const update: Record<string, string | boolean> = {};
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 60) return errorResponse(400, 'Nama harus 1–60 karakter');
    update.display_name = name;
  }
  if (body.initials !== undefined) {
    const initials = typeof body.initials === 'string' ? body.initials.trim().toUpperCase() : '';
    if (!/^[A-Z0-9]{1,2}$/.test(initials)) return errorResponse(400, 'Inisial harus 1–2 huruf atau angka');
    update.initials = initials;
  }
  if (body.avatarColor !== undefined) {
    const color = typeof body.avatarColor === 'string' ? body.avatarColor.toLowerCase() : '';
    if (!/^#[0-9a-f]{6}$/.test(color)) return errorResponse(400, 'Warna avatar tidak valid');
    update.avatar_color = color;
  }
  for (const [key, column] of [
    ['emailDigest', 'email_digest'],
    ['whatsappPing', 'whatsapp_ping'],
  ] as const) {
    if (body[key] === undefined) continue;
    if (typeof body[key] !== 'boolean') return errorResponse(400, `${key} harus true atau false`);
    update[column] = body[key];
  }
  if (Object.keys(update).length === 0) return errorResponse(400, 'Tidak ada yang diubah');

  const { error } = await supabaseAdmin().from('profiles').update(update).eq('id', user.id);
  if (error) throw error;
  return Response.json({ ok: true });
});
