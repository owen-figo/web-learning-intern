import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from './supabase';

/**
 * The frontend signs in with Supabase Auth and sends the session's access token as
 * `Authorization: Bearer <token>`. Supabase verifies the token and returns the user, or null.
 */
export async function getUser(req: Request): Promise<User | null> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
  if (!token) return null;
  const { data, error } = await supabaseAdmin().auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
