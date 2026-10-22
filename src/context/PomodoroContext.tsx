import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  MODE_LABEL,
  STORAGE_KEY,
  advance,
  clamp,
  durationMs,
  formatClock,
  loadState,
  progressOf,
  rolloverDay,
  sanitizeSettings,
  type PomodoroMode,
  type PomodoroSettings,
  type PomodoroState,
  type PomodoroStatus,
} from '../lib/pomodoro';

export type NotifyResult = 'ok' | 'denied' | 'unsupported';
export type NotifyPermission = NotificationPermission | 'unsupported';

export interface PomodoroApi {
  settings: PomodoroSettings;
  mode: PomodoroMode;
  status: PomodoroStatus;
  remainingMs: number;
  totalMs: number;
  /** 0 sampai 1 */
  progress: number;
  /** Sisa waktu dalam format mm:ss */
  clock: string;
  /** Sesi fokus selesai sejak istirahat panjang terakhir */
  cycle: number;
  sessionsToday: number;
  /** Pesan terakhir saat sebuah fase selesai (untuk banner dan pembaca layar) */
  lastEvent: { id: number; text: string } | null;
  notifyPermission: NotifyPermission;
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  skip: () => void;
  selectMode: (mode: PomodoroMode) => void;
  updateSettings: (patch: Partial<PomodoroSettings>) => void;
  resetSettings: () => void;
  setNotify: (on: boolean) => Promise<NotifyResult>;
}

const PomodoroContext = createContext<PomodoroApi | null>(null);

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStorage(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* penyimpanan penuh atau diblokir: timer tetap jalan, hanya tidak tersimpan */
  }
}

const notificationSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PomodoroState>(() => loadState(readStorage(), Date.now()));
  // Salinan sinkron dari state: semua aksi membaca dari sini supaya tidak ketinggalan
  // saat dua pemanggilan terjadi sebelum React sempat me-render ulang.
  const stateRef = useRef<PomodoroState>(state);
  const [, setDisplaySecond] = useState(0);
  const [lastEvent, setLastEvent] = useState<{ id: number; text: string } | null>(null);
  const [notifyPermission, setNotifyPermission] = useState<NotifyPermission>(() =>
    notificationSupported() ? Notification.permission : 'unsupported',
  );
  const audioRef = useRef<AudioContext | null>(null);
  const eventId = useRef(0);
  const baseTitle = useRef('');

  const commit = useCallback((next: PomodoroState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  /* ---------------- bunyi ---------------- */

  const getAudio = useCallback((): AudioContext | null => {
    if (audioRef.current) return audioRef.current;
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      audioRef.current = new Ctor();
    } catch {
      return null;
    }
    return audioRef.current;
  }, []);

  /** Browser hanya mengizinkan audio setelah interaksi pengguna, jadi dibuka saat tombol Mulai ditekan. */
  const unlockAudio = useCallback(() => {
    const ctx = getAudio();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }, [getAudio]);

  const playChime = useCallback(
    (finished: PomodoroMode) => {
      if (!stateRef.current.settings.sound) return;
      const ctx = getAudio();
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      // Fokus selesai: tiga nada naik (lega). Istirahat selesai: tiga nada turun (ajakan kembali).
      const notes = finished === 'focus' ? [659.25, 783.99, 987.77] : [987.77, 783.99, 659.25];
      const t0 = ctx.currentTime + 0.02;
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = t0 + i * 0.22;
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    },
    [getAudio],
  );

  const showNotification = useCallback((title: string, body: string) => {
    const { settings } = stateRef.current;
    if (!settings.notify || !notificationSupported() || Notification.permission !== 'granted') return;
    try {
      new Notification(title, { body, tag: 'ngerti-pomodoro', silent: settings.sound });
    } catch {
      /* sebagian browser seluler melarang konstruktor Notification langsung */
    }
  }, []);

  /* ---------------- fase selesai ---------------- */

  const complete = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'running') return; // cegah pemanggilan ganda
    const now = Date.now();
    const finished = s.snap.mode;
    const snap = advance(rolloverDay(s.snap, now), s.settings, true);
    const total = durationMs(snap.mode, s.settings);
    const auto = s.settings.autoStart;
    commit({ ...s, snap, status: auto ? 'running' : 'idle', endAt: auto ? now + total : null, remainingMs: total });

    const minutes = Math.round(total / 60_000);
    const next =
      finished === 'focus'
        ? `Sesi fokus selesai. Saatnya ${snap.mode === 'long' ? 'istirahat panjang' : 'istirahat'} ${minutes} menit.`
        : `Istirahat selesai. Siap fokus ${minutes} menit?`;
    const text = auto ? `${next} Sesi berikutnya sudah berjalan.` : next;
    eventId.current += 1;
    setLastEvent({ id: eventId.current, text });
    playChime(finished);
    showNotification(finished === 'focus' ? 'Sesi fokus selesai' : 'Istirahat selesai', next);
  }, [commit, playChime, showNotification]);

  /* ---------------- detak ---------------- */

  useEffect(() => {
    if (state.status !== 'running') return;
    const tick = () => {
      const s = stateRef.current;
      if (s.status !== 'running' || s.endAt === null) return;
      const left = s.endAt - Date.now();
      if (left <= 0) {
        complete();
        return;
      }
      // Nilainya hanya berubah tiap detik, jadi render ulang juga hanya sekali per detik.
      setDisplaySecond(Math.ceil(left / 1000));
    };
    tick();
    const id = window.setInterval(tick, 250);
    // Tab di latar belakang bisa diperlambat browser; periksa segera saat kembali terlihat.
    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [state.status, state.endAt, complete]);

  /* ---------------- simpan state ---------------- */

  useEffect(() => {
    writeStorage(JSON.stringify(state));
  }, [state]);

  /* ---------------- aksi ---------------- */

  const start = useCallback(() => {
    const s = stateRef.current;
    if (s.status === 'running') return;
    unlockAudio();
    const now = Date.now();
    const snap = rolloverDay(s.snap, now);
    const total = durationMs(snap.mode, s.settings);
    const remaining = s.status === 'paused' ? clamp(s.remainingMs, 1000, total) : total;
    commit({ ...s, snap, status: 'running', endAt: now + remaining, remainingMs: remaining });
    setLastEvent(null);
  }, [commit, unlockAudio]);

  const pause = useCallback(() => {
    const s = stateRef.current;
    if (s.status !== 'running' || s.endAt === null) return;
    const left = s.endAt - Date.now();
    if (left <= 0) {
      complete();
      return;
    }
    commit({ ...s, status: 'paused', endAt: null, remainingMs: left });
  }, [commit, complete]);

  const toggle = useCallback(() => {
    if (stateRef.current.status === 'running') pause();
    else start();
  }, [pause, start]);

  const reset = useCallback(() => {
    const s = stateRef.current;
    commit({ ...s, status: 'idle', endAt: null, remainingMs: durationMs(s.snap.mode, s.settings) });
    setLastEvent(null);
  }, [commit]);

  const skip = useCallback(() => {
    const s = stateRef.current;
    const now = Date.now();
    const snap = advance(rolloverDay(s.snap, now), s.settings, false); // dilewati = tidak dihitung
    const total = durationMs(snap.mode, s.settings);
    const keepRunning = s.status === 'running';
    commit({ ...s, snap, status: keepRunning ? 'running' : 'idle', endAt: keepRunning ? now + total : null, remainingMs: total });
    setLastEvent(null);
  }, [commit]);

  const selectMode = useCallback(
    (mode: PomodoroMode) => {
      const s = stateRef.current;
      if (s.snap.mode === mode && s.status === 'idle') return;
      commit({
        ...s,
        snap: { ...s.snap, mode },
        status: 'idle',
        endAt: null,
        remainingMs: durationMs(mode, s.settings),
      });
      setLastEvent(null);
    },
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<PomodoroSettings>) => {
      const s = stateRef.current;
      const settings = sanitizeSettings({ ...s.settings, ...patch });
      const total = durationMs(s.snap.mode, settings);
      // Saat siap (idle), durasi baru langsung tampil. Saat berjalan atau dijeda,
      // sesi yang sedang berlangsung tidak diganggu; durasi baru berlaku di sesi berikutnya.
      const remainingMs =
        s.status === 'idle' ? total : s.status === 'paused' ? clamp(s.remainingMs, 1000, total) : s.remainingMs;
      commit({ ...s, settings, remainingMs });
    },
    [commit],
  );

  const resetSettings = useCallback(() => updateSettings(DEFAULT_SETTINGS), [updateSettings]);

  const setNotify = useCallback(
    async (on: boolean): Promise<NotifyResult> => {
      if (!on) {
        updateSettings({ notify: false });
        return 'ok';
      }
      if (!notificationSupported()) return 'unsupported';
      let permission = Notification.permission;
      if (permission === 'default') {
        try {
          permission = await Notification.requestPermission();
        } catch {
          permission = 'denied';
        }
      }
      setNotifyPermission(permission);
      if (permission !== 'granted') {
        updateSettings({ notify: false });
        return 'denied';
      }
      updateSettings({ notify: true });
      return 'ok';
    },
    [updateSettings],
  );

  /* ---------------- nilai turunan ---------------- */

  const total = durationMs(state.snap.mode, state.settings);
  const remainingMs =
    state.status === 'running' && state.endAt !== null ? Math.max(0, state.endAt - Date.now()) : state.remainingMs;
  const clock = formatClock(remainingMs);

  // Tampilkan sisa waktu di judul tab selama timer berjalan.
  useEffect(() => {
    baseTitle.current = document.title;
    return () => {
      document.title = baseTitle.current;
    };
  }, []);
  useEffect(() => {
    const title =
      state.status === 'running' ? `${clock} ${MODE_LABEL[state.snap.mode]} | ${baseTitle.current}` : baseTitle.current;
    if (document.title !== title) document.title = title;
  });

  const api: PomodoroApi = {
    settings: state.settings,
    mode: state.snap.mode,
    status: state.status,
    remainingMs,
    totalMs: total,
    progress: progressOf(remainingMs, total),
    clock,
    cycle: state.snap.cycle,
    sessionsToday: state.snap.sessionsToday,
    lastEvent,
    notifyPermission,
    start,
    pause,
    toggle,
    reset,
    skip,
    selectMode,
    updateSettings,
    resetSettings,
    setNotify,
  };

  return <PomodoroContext.Provider value={api}>{children}</PomodoroContext.Provider>;
};

export function usePomodoro(): PomodoroApi {
  const ctx = useContext(PomodoroContext);
  if (!ctx) throw new Error('usePomodoro harus dipakai di dalam <PomodoroProvider>.');
  return ctx;
}
