// Small client for the Next.js backend (backend/).
// In development VITE_API_URL is empty and Vite forwards /api to the backend (see vite.config.ts).
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.', 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (body as { error?: string } | null)?.error ??
      (res.status >= 500
        ? 'Server sedang tidak bisa dihubungi. Tunggu sebentar, lalu coba lagi.'
        : `Permintaan gagal (kode ${res.status}).`);
    throw new ApiError(message, res.status);
  }
  return body as T;
}
