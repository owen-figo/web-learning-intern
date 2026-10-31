import React from 'react';

/* Garis gelombang dekoratif di belakang hero Beranda.
   Setiap garis adalah gabungan dua gelombang sinus yang sedikit bergeser dari garis sebelumnya,
   sehingga bersama-sama terlihat seperti pita yang mengalir. */
const W = 1440;
const H = 640;
const STEP = 16;

interface WaveShape {
  lines: number;
  /** Vertical position of the first line, as a fraction of H. */
  base: number;
  /** Vertical gap between lines. */
  spread: number;
  amp1: number;
  freq1: number;
  phase1: number;
  amp2: number;
  freq2: number;
  phase2: number;
  /** How much each line shifts the phase, which makes the ribbon twist. */
  twist1: number;
  twist2: number;
}

const SHAPES: Record<'main' | 'corner', WaveShape> = {
  // Pita utama yang melintang di tengah hero.
  main: { lines: 9, base: 0.52, spread: 14, amp1: 78, freq1: 1.1, phase1: 0.6, amp2: 34, freq2: 2.3, phase2: 1.8, twist1: 0.16, twist2: -0.11 },
  // Pita kedua yang naik dari pojok kanan bawah.
  corner: { lines: 7, base: 0.62, spread: 16, amp1: 120, freq1: 0.55, phase1: 2.6, amp2: 26, freq2: 1.9, phase2: 0.4, twist1: 0.12, twist2: 0.18 },
};

function wavePath(shape: WaveShape, k: number): string {
  const points: string[] = [];
  for (let x = 0; x <= W; x += STEP) {
    const t = (x / W) * Math.PI * 2;
    const y =
      H * shape.base +
      k * shape.spread +
      shape.amp1 * Math.sin(t * shape.freq1 + shape.phase1 + k * shape.twist1) +
      shape.amp2 * Math.sin(t * shape.freq2 + shape.phase2 + k * shape.twist2);
    points.push(`${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(1)}`);
  }
  return points.join(' ');
}

const PATHS = {
  main: Array.from({ length: SHAPES.main.lines }, (_, k) => wavePath(SHAPES.main, k)),
  corner: Array.from({ length: SHAPES.corner.lines }, (_, k) => wavePath(SHAPES.corner, k)),
};

const PLACEMENT = {
  // Fixed-height band (at least 900px wide) so the waves keep their shape on narrow, tall phone layouts.
  main: 'hero-lines left-1/2 -translate-x-1/2 w-[max(100%,900px)] top-40 h-[440px] md:top-1/2 md:-translate-y-1/2 md:h-[620px]',
  // Bottom-right corner, reaching into the empty top padding of the next section (py-12 / md:py-16)
  // so the lines show below the "Apa gunanya XP?" bar instead of hiding behind it.
  corner: 'hero-lines-corner right-0 -bottom-12 md:-bottom-16 w-[min(100%,860px)] h-[300px] md:h-[360px]',
};

export const HeroBackgroundLines: React.FC<{ variant?: 'main' | 'corner' }> = ({ variant = 'main' }) => {
  const paths = PATHS[variant];
  const mid = (paths.length - 1) / 2;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute text-primary ${PLACEMENT[variant]}`}
    >
      {paths.map((d, k) => (
        <path
          key={k}
          d={d}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.25}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          // Garis tengah paling jelas, garis tepi memudar.
          strokeOpacity={(variant === 'corner' ? 0.14 : 0.07) + (variant === 'corner' ? 0.24 : 0.13) * (1 - Math.abs(k - mid) / mid)}
          className="hero-line-draw"
          style={{ animationDelay: `${(variant === 'corner' ? 400 : 0) + k * 90}ms` }}
        />
      ))}
    </svg>
  );
};
