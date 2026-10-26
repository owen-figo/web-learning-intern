import React, { useState } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { LIMITS, MODE_LABEL, clamp, durationMs, type PomodoroMode } from '../lib/pomodoro';

/** Kelas Tailwind harus tertulis utuh agar ikut terbuat, jadi dipetakan di sini. */
export const MODE_STYLE: Record<PomodoroMode, { ring: string; text: string; dot: string; chip: string }> = {
  focus: {
    ring: 'stroke-primary-container',
    text: 'text-primary',
    dot: 'bg-primary-container',
    chip: 'bg-primary-fixed/40 text-primary',
  },
  short: {
    ring: 'stroke-secondary-container',
    text: 'text-secondary',
    dot: 'bg-secondary-container',
    chip: 'bg-secondary-fixed/60 text-on-secondary-fixed-variant',
  },
  long: {
    ring: 'stroke-secondary',
    text: 'text-secondary',
    dot: 'bg-secondary',
    chip: 'bg-secondary-fixed/60 text-on-secondary-fixed-variant',
  },
};

const TABS: { mode: PomodoroMode; label: string }[] = [
  { mode: 'focus', label: 'Fokus' },
  { mode: 'short', label: 'Istirahat' },
  { mode: 'long', label: 'Panjang' },
];

const ICON_BUTTON =
  'w-11 h-11 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-surface-container hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

/* ------------------------------------------------------------------ */
/* Komponen kecil untuk pengaturan                                     */
/* ------------------------------------------------------------------ */

const Stepper: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}> = ({ label, value, min, max, onChange }) => {
  // Saat diketik, nilai sementara disimpan sebagai teks dan baru dipakai saat selesai mengetik.
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n)) onChange(clamp(n, min, max));
    setDraft(null);
  };

  const step = (delta: number) => {
    setDraft(null);
    onChange(clamp(value + delta, min, max));
  };

  const stepButton =
    'w-8 h-8 rounded-lg border border-outline-variant/70 text-on-surface-variant flex items-center justify-center hover:bg-surface-container-low hover:text-primary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-on-surface-variant transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary';

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" aria-label={`Kurangi ${label}`} disabled={value <= min} onClick={() => step(-1)} className={stepButton}>
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">remove</span>
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        autoComplete="off"
        value={draft ?? String(value)}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 3))}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            step(1);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            step(-1);
          }
        }}
        className="w-12 h-8 rounded-lg bg-surface-container-low text-center text-sm font-semibold font-code-formula text-on-surface focus:outline-2 focus:outline-primary"
      />
      <button type="button" aria-label={`Tambah ${label}`} disabled={value >= max} onClick={() => step(1)} className={stepButton}>
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">add</span>
      </button>
    </div>
  );
};

const Switch: React.FC<{ checked: boolean; labelledBy: string; onChange: (on: boolean) => void }> = ({
  checked,
  labelledBy,
  onChange,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelledBy}
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
      checked ? 'bg-primary' : 'bg-outline-variant'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-5' : ''
      }`}
    />
  </button>
);

/* ------------------------------------------------------------------ */
/* Panel                                                               */
/* ------------------------------------------------------------------ */

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const PomodoroPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const p = usePomodoro();
  const [showSettings, setShowSettings] = useState(false);
  const [notifyHint, setNotifyHint] = useState<string | null>(null);

  const style = MODE_STYLE[p.mode];
  const { settings } = p;
  const filledDots = p.mode === 'long' ? settings.longBreakEvery : Math.min(p.cycle, settings.longBreakEvery);

  const mainLabel = p.status === 'running' ? 'Jeda' : p.status === 'paused' ? 'Lanjutkan' : 'Mulai';
  const mainIcon = p.status === 'running' ? 'pause' : 'play_arrow';
  const caption = p.status === 'paused' ? `${MODE_LABEL[p.mode]} (dijeda)` : MODE_LABEL[p.mode];

  const handleNotify = async (on: boolean) => {
    setNotifyHint(null);
    const result = await p.setNotify(on);
    if (result === 'denied') setNotifyHint('Izin notifikasi ditolak. Ubah lewat pengaturan situs di browser, lalu coba lagi.');
    if (result === 'unsupported') setNotifyHint('Browser ini belum mendukung notifikasi.');
  };

  return (
    <div className="p-5">
      {/* Kepala: judul + pengaturan + tutup */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-on-surface">{showSettings ? 'Pengaturan' : 'Pomodoro'}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Pengaturan"
            aria-pressed={showSettings}
            onClick={() => setShowSettings((v) => !v)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
              showSettings
                ? 'bg-primary-fixed/50 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">settings</span>
          </button>
          <button
            type="button"
            aria-label="Tutup timer"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {!showSettings ? (
        <>
          {/* Pilihan fase */}
          <div role="group" aria-label="Pilih fase" className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-container-low">
            {TABS.map((tab) => {
              const active = p.mode === tab.mode;
              return (
                <button
                  key={tab.mode}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${MODE_LABEL[tab.mode]}, ${durationMs(tab.mode, settings) / 60_000} menit`}
                  onClick={() => p.selectMode(tab.mode)}
                  className={`py-1.5 rounded-lg text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
                    active
                      ? 'bg-surface-container-lowest shadow-xs text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="block text-xs font-semibold leading-tight">{tab.label}</span>
                  <span className="block text-xs text-outline leading-tight">{durationMs(tab.mode, settings) / 60_000} menit</span>
                </button>
              );
            })}
          </div>

          {/* Cincin waktu */}
          <div className="relative mx-auto mt-5 w-48 h-48">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="100" cy="100" r={RADIUS} fill="none" strokeWidth="10" className="stroke-outline-variant/50" />
              <circle
                cx="100"
                cy="100"
                r={RADIUS}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={CIRCUMFERENCE * (1 - p.progress)}
                className={`pomodoro-ring ${style.ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-code-formula text-[2.75rem] leading-none font-semibold tabular-nums text-on-surface"
                aria-label={`Sisa waktu ${p.clock}`}
              >
                {p.clock}
              </span>
              <span className={`mt-2 text-sm font-medium ${style.text}`}>{caption}</span>
            </div>
          </div>

          {/* Kontrol */}
          <div className="mt-5 flex items-center justify-center gap-4">
            <button type="button" aria-label="Atur ulang fase ini" title="Atur ulang" onClick={p.reset} className={ICON_BUTTON}>
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]">restart_alt</span>
            </button>
            <button
              type="button"
              onClick={p.toggle}
              className="h-12 min-w-36 px-6 rounded-full bg-primary text-on-primary text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:bg-primary-container transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {mainIcon}
              </span>
              <span>{mainLabel}</span>
            </button>
            <button type="button" aria-label="Lewati ke fase berikutnya" title="Lewati" onClick={p.skip} className={ICON_BUTTON}>
              <span aria-hidden="true" className="material-symbols-outlined text-[24px]">skip_next</span>
            </button>
          </div>

          {/* Kemajuan siklus */}
          <div className="mt-5 flex items-center justify-between gap-3 text-xs text-on-surface-variant">
            <div
              role="img"
              aria-label={`${filledDots} dari ${settings.longBreakEvery} sesi fokus menuju istirahat panjang`}
              className="flex items-center gap-1.5"
            >
              {Array.from({ length: settings.longBreakEvery }, (_, i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${i < filledDots ? 'bg-primary-container' : 'bg-outline-variant/60'}`}
                />
              ))}
            </div>
            <span>
              {p.sessionsToday === 0 ? 'Belum ada sesi fokus hari ini' : `${p.sessionsToday} sesi fokus hari ini`}
            </span>
          </div>

          {p.lastEvent && (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary-fixed/30 px-3 py-2.5 text-xs leading-relaxed text-on-surface">
              <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-primary shrink-0">
                check_circle
              </span>
              <span>{p.lastEvent.text}</span>
            </p>
          )}
        </>
      ) : (
        <div className="space-y-5">
          <section aria-label="Durasi">
            <h3 className="text-sm font-semibold text-on-surface mb-1">Durasi</h3>
            {p.status !== 'idle' && (
              <p className="text-xs text-outline mb-1">Perubahan berlaku mulai sesi berikutnya.</p>
            )}
            <ul className="divide-y divide-outline-variant/40">
              {(
                [
                  ['Fokus', 'focusMin'],
                  ['Istirahat pendek', 'shortBreakMin'],
                  ['Istirahat panjang', 'longBreakMin'],
                ] as const
              ).map(([label, key]) => (
                <li key={key} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-on-surface">{label}</span>
                  <div className="flex items-center gap-2">
                    <Stepper
                      label={`${label} (menit)`}
                      value={settings[key]}
                      min={LIMITS[key].min}
                      max={LIMITS[key].max}
                      onChange={(n) => p.updateSettings({ [key]: n })}
                    />
                    <span className="text-xs text-outline w-8">menit</span>
                  </div>
                </li>
              ))}
              <li className="flex items-center justify-between py-2.5">
                <span className="text-sm text-on-surface">Istirahat panjang setiap</span>
                <div className="flex items-center gap-2">
                  <Stepper
                    label="jumlah sesi fokus sebelum istirahat panjang"
                    value={settings.longBreakEvery}
                    min={LIMITS.longBreakEvery.min}
                    max={LIMITS.longBreakEvery.max}
                    onChange={(n) => p.updateSettings({ longBreakEvery: n })}
                  />
                  <span className="text-xs text-outline w-8">sesi</span>
                </div>
              </li>
            </ul>
          </section>

          <section aria-label="Otomatis dan pengingat">
            <h3 className="text-sm font-semibold text-on-surface mb-1">Otomatis dan pengingat</h3>
            <ul className="divide-y divide-outline-variant/40">
              <li className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p id="pomo-auto" className="text-sm text-on-surface">Mulai sesi berikutnya otomatis</p>
                  <p className="text-xs text-outline">Tanpa menekan Mulai setiap kali.</p>
                </div>
                <Switch checked={settings.autoStart} labelledBy="pomo-auto" onChange={(on) => p.updateSettings({ autoStart: on })} />
              </li>
              <li className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p id="pomo-sound" className="text-sm text-on-surface">Bunyi saat sesi selesai</p>
                  <p className="text-xs text-outline">Nada singkat yang lembut.</p>
                </div>
                <Switch checked={settings.sound} labelledBy="pomo-sound" onChange={(on) => p.updateSettings({ sound: on })} />
              </li>
              <li className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p id="pomo-notify" className="text-sm text-on-surface">Notifikasi browser</p>
                  <p className={`text-xs ${notifyHint || p.notifyPermission === 'denied' ? 'text-error' : 'text-outline'}`}>
                    {notifyHint ??
                      (p.notifyPermission === 'denied'
                        ? 'Izin diblokir di browser.'
                        : p.notifyPermission === 'unsupported'
                          ? 'Browser ini belum mendukung notifikasi.'
                          : 'Pengingat saat tab sedang tidak dibuka.')}
                  </p>
                </div>
                <Switch checked={settings.notify} labelledBy="pomo-notify" onChange={handleNotify} />
              </li>
            </ul>
          </section>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                setNotifyHint(null);
                p.resetSettings();
              }}
              className="text-xs font-medium text-on-surface-variant hover:text-primary underline-offset-2 hover:underline"
            >
              Kembalikan ke bawaan
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="h-9 px-4 rounded-full bg-primary-fixed/50 text-primary text-sm font-semibold hover:bg-primary-fixed transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
