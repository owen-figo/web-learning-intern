import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePomodoro } from '../context/PomodoroContext';
import { MODE_LABEL } from '../lib/pomodoro';
import { MODE_STYLE, PomodoroPanel } from './PomodoroPanel';

/**
 * Tombol Pomodoro untuk diletakkan di header (yang sudah sticky) sisi kanan atas.
 * Saat timer berjalan, tombol menampilkan sisa waktu supaya tetap terlihat walau popup tertutup.
 * Popup dirender lewat portal agar selalu berada di atas konten dan tidak terpotong header.
 */
export const PomodoroButton: React.FC = () => {
  const p = usePomodoro();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 72, right: 16 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      top: Math.round(rect.bottom + 8),
      // Rata kanan dengan tombol, tapi jangan keluar layar.
      right: Math.max(12, Math.round(window.innerWidth - rect.right)),
    });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus({ preventScroll: true });

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener('resize', place);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', place);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, place]);

  const active = p.status !== 'idle';
  const label = active
    ? `Pomodoro: ${MODE_LABEL[p.mode]}, sisa ${p.clock}${p.status === 'paused' ? ', dijeda' : ''}`
    : 'Buka timer Pomodoro';
  const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

  return (
    <div className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
        title="Timer Pomodoro"
        className={
          active
            ? `h-9 px-2 sm:pl-2.5 sm:pr-3 rounded-full flex items-center gap-1.5 transition-colors ${focusRing} ${MODE_STYLE[p.mode].chip} ${
                open ? 'ring-2 ring-primary/40' : 'hover:brightness-95'
              }`
            : `p-2 rounded-lg transition-colors ${focusRing} ${
                open
                  ? 'bg-primary-fixed/50 text-primary'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`
        }
      >
        {active ? (
          <>
            {p.status === 'paused' ? (
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>
                pause
              </span>
            ) : (
              <span
                className={`hidden sm:block w-2 h-2 rounded-full motion-safe:animate-gentle-pulse ${MODE_STYLE[p.mode].dot}`}
                aria-hidden="true"
              />
            )}
            <span className="font-code-formula text-sm font-semibold tabular-nums">{p.clock}</span>
          </>
        ) : (
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            timer
          </span>
        )}
      </button>

      {/* Pembaca layar diberi tahu saat sebuah sesi selesai, bukan tiap detik. */}
      <span className="sr-only" role="status" aria-live="polite">
        {p.lastEvent?.text ?? ''}
      </span>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Timer Pomodoro"
            tabIndex={-1}
            style={{ top: pos.top, ['--pomo-right' as string]: `${pos.right}px` }}
            className="pomodoro-popover fixed z-[55] left-3 right-3 sm:left-auto sm:right-[var(--pomo-right)] sm:w-[22rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-outline-variant/70 bg-surface-container-lowest shadow-xl outline-none"
          >
            <PomodoroPanel onClose={() => setOpen(false)} />
          </div>,
          document.body,
        )}
    </div>
  );
};
