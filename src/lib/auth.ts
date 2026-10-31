import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { api } from './api';

// Login = email + NIM. The backend checks them against the student list and prepares the account
// (POST /api/auth/login); then the browser signs in with Supabase Auth, which keeps the session in
// localStorage and refreshes it. supabase-js is downloaded on first use.

export interface SignedInStudent {
  name: string;
  email: string;
}

let client: Promise<SupabaseClient> | null = null;

function supabase(): Promise<SupabaseClient> {
  client ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(import.meta.env.VITE_SUPABASE_URL ?? '', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '')
  );
  return client;
}

function toStudent(session: Session | null): SignedInStudent | null {
  if (!session) return null;
  const email = session.user.email ?? '';
  const name = (session.user.user_metadata?.name as string | undefined) ?? email.split('@')[0];
  return { name, email };
}

export async function signIn(email: string, nim: string): Promise<SignedInStudent> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanNim = nim.trim();
  await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: cleanEmail, nim: cleanNim }) });
  const { data, error } = await (await supabase()).auth.signInWithPassword({ email: cleanEmail, password: cleanNim });
  const student = toStudent(data.session);
  if (error || !student) throw new Error('Masuk gagal. Coba lagi sebentar lagi.');
  return student;
}

/** True when supabase-js has saved a session in this browser (its key is sb-<project ref>-auth-token). */
function hasSavedSession(): boolean {
  try {
    const ref = new URL(import.meta.env.VITE_SUPABASE_URL ?? '').hostname.split('.')[0];
    return window.localStorage.getItem(`sb-${ref}-auth-token`) !== null;
  } catch {
    return false;
  }
}

/** The student from a saved session, or null. Visitors who never signed in don't download supabase-js. */
export async function getSignedInStudent(): Promise<SignedInStudent | null> {
  if (!hasSavedSession()) return null;
  try {
    const { data } = await (await supabase()).auth.getSession();
    return toStudent(data.session);
  } catch {
    return null;
  }
}

export async function signOut(): Promise<void> {
  await (await supabase()).auth.signOut();
}

/** For backend routes that need the student (send as `Authorization: Bearer <token>`). */
export async function getAccessToken(): Promise<string | null> {
  if (!hasSavedSession()) return null;
  const { data } = await (await supabase()).auth.getSession();
  return data.session?.access_token ?? null;
}

/** Like api(), but sends the signed-in student's access token (when there is one). */
export async function authApi<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken().catch(() => null);
  return api<T>(path, token ? { ...init, headers: { ...init?.headers, Authorization: `Bearer ${token}` } } : init);
}
