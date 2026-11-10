import React from 'react';
import type { PomodoroMode } from '../lib/pomodoro';

/**
 * Small illustration above the Pomodoro clock: an open book with turning pages while focusing,
 * a steaming coffee cup on breaks (with a cookie on the long break). It only animates while the
 * timer runs; idle or paused it stays still. Animations live in index.css (.pomo-art-*).
 */
export const PomodoroArt: React.FC<{ mode: PomodoroMode; running: boolean }> = ({ mode, running }) => (
  <svg
    key={mode}
    viewBox="0 0 72 52"
    className={`pomo-art w-16 h-12 ${running ? 'pomo-art-run' : ''}`}
    aria-hidden="true"
  >
    {mode === 'focus' ? <Book /> : <Coffee withCookie={mode === 'long'} />}
  </svg>
);

const PAGE_LEFT = 'M36 12 C28 7 16 7 8 10 V42 C16 39 28 39 36 44 Z';
const PAGE_RIGHT = 'M36 12 C44 7 56 7 64 10 V42 C56 39 44 39 36 44 Z';

const Book: React.FC = () => (
  <g>
    {/* cover behind the pages */}
    <path
      d="M36 15 C28 10 14 10 4 13 V46 C14 43 28 43 36 48 C44 43 58 43 68 46 V13 C58 10 44 10 36 15 Z"
      className="fill-primary"
    />
    <path d={PAGE_LEFT} className="fill-surface-container-lowest stroke-primary/40" strokeWidth="1" />
    <path d={PAGE_RIGHT} className="fill-surface-container-lowest stroke-primary/40" strokeWidth="1" />
    {/* lines of text */}
    <g className="stroke-primary/45" strokeWidth="1.6" strokeLinecap="round">
      <path d="M13 17 C19 15.5 25 15.5 31 17.5" />
      <path d="M13 23 C19 21.5 25 21.5 31 23.5" />
      <path d="M13 29 C19 27.5 25 27.5 31 29.5" />
      <path d="M13 35 C17 34 21 34 24 34.6" />
      <path d="M41 17.5 C47 15.5 53 15.5 59 17" />
      <path d="M41 23.5 C47 21.5 53 21.5 59 23" />
      <path d="M41 29.5 C47 27.5 53 27.5 59 29" />
    </g>
    {/* the page that turns from right to left */}
    <path d={PAGE_RIGHT} className="pomo-page-flip fill-primary-fixed stroke-primary/40" strokeWidth="1" />
    <path d="M36 12 V44" className="stroke-primary/50" strokeWidth="1.2" />
  </g>
);

const Coffee: React.FC<{ withCookie: boolean }> = ({ withCookie }) => (
  <g>
    {/* steam */}
    <g className="stroke-secondary/70" strokeWidth="2" strokeLinecap="round" fill="none">
      <path className="pomo-steam" d="M24 17 C21 13.5 27 10.5 24 5" />
      <path className="pomo-steam pomo-steam-2" d="M32 17 C29 13.5 35 10.5 32 5" />
      <path className="pomo-steam pomo-steam-3" d="M40 17 C37 13.5 43 10.5 40 5" />
    </g>
    {/* saucer, handle, cup, coffee */}
    <ellipse cx="32" cy="46" rx="23" ry="3.5" className="fill-secondary-fixed-dim" />
    <path d="M49 25 C58 25 58 38 48 38" className="stroke-secondary" strokeWidth="3.2" fill="none" strokeLinecap="round" />
    <path d="M13 21 H51 V33 C51 40.5 45 45 37.5 45 H26.5 C19 45 13 40.5 13 33 Z" className="fill-secondary-fixed stroke-secondary" strokeWidth="1.4" />
    <ellipse cx="32" cy="21" rx="19" ry="2.6" fill="#7a4a24" />
    <path d="M18 29 H46" className="stroke-secondary/40" strokeWidth="1.4" strokeLinecap="round" />
    {withCookie && (
      <g>
        <circle cx="63" cy="42.5" r="6" className="fill-secondary-container stroke-secondary" strokeWidth="1.2" />
        <circle cx="61" cy="41" r="1" fill="#7a4a24" />
        <circle cx="65" cy="43.5" r="1" fill="#7a4a24" />
        <circle cx="62.5" cy="45" r="0.9" fill="#7a4a24" />
      </g>
    )}
  </g>
);
