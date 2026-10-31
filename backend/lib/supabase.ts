import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export class NotConfiguredError extends Error {
  constructor() {
    super('Supabase belum dikonfigurasi: isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di backend/.env.local');
  }
}

/**
 * Server-only Supabase client using the service role key. It bypasses Row Level Security,
 * so every route must check who the user is (see lib/auth.ts) before reading or writing their data.
 */
export function supabaseAdmin(): SupabaseClient {
  if (!isSupabaseConfigured()) throw new NotConfiguredError();
  admin ??= createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return admin;
}
