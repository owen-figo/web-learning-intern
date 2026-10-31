import { NotConfiguredError } from './supabase';

export function errorResponse(status: number, message: string): Response {
  return Response.json({ error: message }, { status });
}

/** Postgres/PostgREST codes for a missing table or column: a SQL file in backend/supabase hasn't been run. */
const MISSING_SCHEMA_CODES = ['42P01', '42703', 'PGRST204', 'PGRST205'];

/** Wraps a route handler: a missing Supabase config or schema becomes 503, anything unexpected becomes 500. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof NotConfiguredError) return errorResponse(503, err.message);
      if (MISSING_SCHEMA_CODES.includes((err as { code?: string }).code ?? '')) {
        console.error(err);
        return errorResponse(503, 'Database belum diperbarui. Jalankan file SQL terbaru dari backend/supabase di Supabase.');
      }
      console.error(err);
      return errorResponse(500, 'Terjadi kesalahan di server');
    }
  };
}
