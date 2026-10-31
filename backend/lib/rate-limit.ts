// Fixed-window limiter kept in memory. Good enough for one server process; it resets on restart and
// is not shared between instances (use a shared store such as Redis if the backend is scaled out).
const hits = new Map<string, { count: number; resetAt: number }>();

/** Counts one attempt for `key`; returns true when the key has gone over `limit` in the window. */
export function tooManyAttempts(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}

export function clearAttempts(key: string): void {
  hits.delete(key);
}
