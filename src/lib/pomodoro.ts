/**
 * Logika Pomodoro yang murni (tanpa React / DOM) supaya mudah diuji.
 * Dipakai oleh PomodoroContext dan komponen UI-nya.
 */

export type PomodoroMode = 'focus' | 'short' | 'long';
export type PomodoroStatus = 'idle' | 'running' | 'paused';

export interface PomodoroSettings {
  focusMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  /** Istirahat panjang muncul setelah sekian sesi fokus selesai. */
  longBreakEvery: number;
  /** Sesi berikutnya langsung berjalan tanpa menekan Mulai. */
  autoStart: boolean;
  sound: boolean;
  notify: boolean;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakEvery: 4,
  autoStart: false,
  sound: true,
  notify: false,
};

export const LIMITS = {
  focusMin: { min: 1, max: 120 },
  shortBreakMin: { min: 1, max: 30 },
  longBreakMin: { min: 1, max: 60 },
  longBreakEvery: { min: 2, max: 8 },
} as const;

export const MODE_LABEL: Record<PomodoroMode, string> = {
  focus: 'Fokus',
  short: 'Istirahat',
  long: 'Istirahat panjang',
};

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Ambil bilangan bulat dari nilai apa pun; kembalikan fallback bila bukan angka. */
function toInt(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

/** Terima data mentah (localStorage / input) dan kembalikan pengaturan yang selalu valid. */
export function sanitizeSettings(raw: unknown): PomodoroSettings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  const num = (key: keyof typeof LIMITS) =>
    clamp(toInt(r[key], d[key]), LIMITS[key].min, LIMITS[key].max);
  const flag = (key: 'autoStart' | 'sound' | 'notify') =>
    typeof r[key] === 'boolean' ? (r[key] as boolean) : d[key];
  return {
    focusMin: num('focusMin'),
    shortBreakMin: num('shortBreakMin'),
    longBreakMin: num('longBreakMin'),
    longBreakEvery: num('longBreakEvery'),
    autoStart: flag('autoStart'),
    sound: flag('sound'),
    notify: flag('notify'),
  };
}

export function durationMs(mode: PomodoroMode, s: PomodoroSettings): number {
  const minutes = mode === 'focus' ? s.focusMin : mode === 'short' ? s.shortBreakMin : s.longBreakMin;
  return minutes * 60_000;
}

/* ------------------------------------------------------------------ */
/* Siklus sesi                                                         */
/* ------------------------------------------------------------------ */

export interface PomodoroSnapshot {
  mode: PomodoroMode;
  /** Sesi fokus selesai sejak istirahat panjang terakhir. */
  cycle: number;
  /** Sesi fokus selesai hari ini. */
  sessionsToday: number;
  /** Tanggal lokal (YYYY-MM-DD) untuk menghitung sessionsToday. */
  day: string;
}

export function localDay(now: number): string {
  const d = new Date(now);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Bila hari sudah berganti, hitungan harian dan siklus dimulai dari nol. */
export function rolloverDay(s: PomodoroSnapshot, now: number): PomodoroSnapshot {
  const today = localDay(now);
  return s.day === today ? s : { ...s, day: today, sessionsToday: 0, cycle: 0 };
}

/**
 * Pindah ke fase berikutnya.
 * `completed` = true bila fase berakhir sampai habis (sesi fokus dihitung);
 * false bila dilewati (tidak dihitung).
 */
export function advance(s: PomodoroSnapshot, settings: PomodoroSettings, completed: boolean): PomodoroSnapshot {
  if (s.mode === 'focus') {
    const cycle = completed ? s.cycle + 1 : s.cycle;
    const sessionsToday = completed ? s.sessionsToday + 1 : s.sessionsToday;
    return { ...s, mode: cycle >= settings.longBreakEvery ? 'long' : 'short', cycle, sessionsToday };
  }
  // Keluar dari istirahat: kembali fokus. Istirahat panjang menutup satu siklus.
  return { ...s, mode: 'focus', cycle: s.mode === 'long' ? 0 : s.cycle };
}

/* ------------------------------------------------------------------ */
/* Tampilan waktu                                                      */
/* ------------------------------------------------------------------ */

/** mm:ss, dibulatkan ke atas supaya awal sesi tampil tepat 25:00 dan berakhir di 00:00. */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 0 (baru mulai) sampai 1 (habis). */
export function progressOf(remainingMs: number, totalMs: number): number {
  if (totalMs <= 0) return 0;
  return clamp(1 - remainingMs / totalMs, 0, 1);
}

/* ------------------------------------------------------------------ */
/* State tersimpan                                                     */
/* ------------------------------------------------------------------ */

export interface PomodoroState {
  settings: PomodoroSettings;
  snap: PomodoroSnapshot;
  status: PomodoroStatus;
  /** Waktu (ms epoch) sesi berakhir; hanya bermakna saat status = running. */
  endAt: number | null;
  /** Sisa waktu saat idle / paused. */
  remainingMs: number;
}

export const STORAGE_KEY = 'ngerti:pomodoro:v1';

export function initialState(now: number, settings: PomodoroSettings = DEFAULT_SETTINGS): PomodoroState {
  return {
    settings,
    snap: { mode: 'focus', cycle: 0, sessionsToday: 0, day: localDay(now) },
    status: 'idle',
    endAt: null,
    remainingMs: durationMs('focus', settings),
  };
}

/**
 * Baca state dari localStorage dengan aman.
 * Sesi yang sedang berjalan dan waktunya sudah lewat saat halaman dibuka lagi
 * tidak dihitung sebagai sesi selesai; timer kembali siap di awal fase yang sama.
 */
export function loadState(raw: string | null, now: number): PomodoroState {
  if (!raw) return initialState(now);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return initialState(now);
  }
  if (!data || typeof data !== 'object') return initialState(now);
  const d = data as Record<string, unknown>;

  const settings = sanitizeSettings(d.settings);
  const rawSnap = (d.snap && typeof d.snap === 'object' ? d.snap : {}) as Record<string, unknown>;
  const mode: PomodoroMode =
    rawSnap.mode === 'short' || rawSnap.mode === 'long' || rawSnap.mode === 'focus' ? rawSnap.mode : 'focus';
  const snap = rolloverDay(
    {
      mode,
      cycle: Math.max(0, toInt(rawSnap.cycle, 0)),
      sessionsToday: Math.max(0, toInt(rawSnap.sessionsToday, 0)),
      day: typeof rawSnap.day === 'string' ? rawSnap.day : localDay(now),
    },
    now,
  );

  const total = durationMs(snap.mode, settings);
  const status: PomodoroStatus = d.status === 'running' || d.status === 'paused' ? d.status : 'idle';
  const endAt = typeof d.endAt === 'number' && Number.isFinite(d.endAt) ? d.endAt : null;
  const remaining = clamp(toInt(d.remainingMs, total), 1000, total);

  if (status === 'running') {
    if (endAt !== null && endAt > now) {
      return { settings, snap, status: 'running', endAt: Math.min(endAt, now + total), remainingMs: endAt - now };
    }
    return { settings, snap, status: 'idle', endAt: null, remainingMs: total };
  }
  if (status === 'paused') {
    return { settings, snap, status: 'paused', endAt: null, remainingMs: remaining };
  }
  return { settings, snap, status: 'idle', endAt: null, remainingMs: total };
}
