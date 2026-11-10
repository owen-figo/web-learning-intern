import React, { useEffect, useRef, useState } from 'react';

/* Garis gelombang dekoratif di latar Beranda.
   Setiap garis adalah gabungan dua gelombang sinus yang sedikit bergeser dari garis sebelumnya,
   sehingga bersama-sama terlihat seperti pita yang mengalir. Hero punya dua pita (main, corner);
   tiap bagian di bawahnya punya pitanya sendiri yang lebih samar, supaya teks tetap mudah dibaca. */
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

type Variant = 'main' | 'corner' | 'about' | 'quick' | 'reasons' | 'team';

interface VariantConfig {
  shape: WaveShape;
  /** Position and fade mask (classes); see index.css for the masks. */
  placement: string;
  /** Stroke opacity of the outer lines, and how much more the middle line gets. */
  edge: number;
  center: number;
  /** Delay before the first line starts drawing. */
  delay: number;
}

const VARIANTS: Record<Variant, VariantConfig> = {
  // Pita utama yang melintang di tengah hero.
  main: {
    shape: { lines: 18, base: 0.5, spread: 8, amp1: 78, freq1: 1.1, phase1: 0.6, amp2: 34, freq2: 2.3, phase2: 1.8, twist1: 0.16, twist2: -0.11 },
    // Fixed-height band (at least 900px wide) so the waves keep their shape on narrow, tall phone layouts.
    placement: 'hero-lines left-1/2 -translate-x-1/2 w-[max(100%,900px)] top-40 h-[440px] md:top-1/2 md:-translate-y-1/2 md:h-[620px]',
    edge: 0.07,
    center: 0.13,
    delay: 0,
  },
  // Pita kedua yang naik dari pojok kanan bawah hero.
  corner: {
    shape: { lines: 13, base: 0.6, spread: 10, amp1: 120, freq1: 0.55, phase1: 2.6, amp2: 26, freq2: 1.9, phase2: 0.4, twist1: 0.12, twist2: 0.18 },
    // Reaches into the empty top padding of the next section so the lines show below the "Apa gunanya XP?" bar.
    placement: 'hero-lines-corner right-0 -bottom-12 md:-bottom-16 w-[min(100%,860px)] h-[300px] md:h-[360px]',
    edge: 0.14,
    center: 0.24,
    delay: 400,
  },
  // Apa itu Ngerti?: pita lebar yang turun pelan dari kiri ke kanan.
  about: {
    shape: { lines: 14, base: 0.42, spread: 9, amp1: 64, freq1: 0.8, phase1: 3.2, amp2: 26, freq2: 2.0, phase2: 0.3, twist1: 0.14, twist2: -0.08 },
    placement: 'section-lines left-1/2 -translate-x-1/2 w-[max(100%,900px)] top-1/2 -translate-y-1/2 h-[480px]',
    edge: 0.11,
    center: 0.2,
    delay: 0,
  },
  // Contoh soal: pita dari pojok kiri bawah.
  quick: {
    shape: { lines: 12, base: 0.55, spread: 10, amp1: 96, freq1: 0.6, phase1: 0.9, amp2: 22, freq2: 2.6, phase2: 2.2, twist1: 0.1, twist2: 0.15 },
    placement: 'corner-lines-left left-0 bottom-0 w-[min(100%,900px)] h-[360px]',
    edge: 0.15,
    center: 0.26,
    delay: 0,
  },
  // Kenapa Belajar di Ngerti Terasa Beda?: pita bergelombang rapat di belakang kartu.
  reasons: {
    shape: { lines: 16, base: 0.38, spread: 8, amp1: 52, freq1: 1.4, phase1: 1.2, amp2: 30, freq2: 2.8, phase2: 0.7, twist1: -0.12, twist2: 0.09 },
    placement: 'section-lines left-1/2 -translate-x-1/2 w-[max(100%,900px)] top-1/2 -translate-y-1/2 h-[560px]',
    edge: 0.11,
    center: 0.2,
    delay: 0,
  },
  // Tim pengembang: pita tenang di belakang kartu tim.
  team: {
    shape: { lines: 12, base: 0.48, spread: 10, amp1: 72, freq1: 0.9, phase1: 4.0, amp2: 20, freq2: 1.7, phase2: 1.1, twist1: 0.13, twist2: -0.1 },
    placement: 'section-lines left-1/2 -translate-x-1/2 w-[max(100%,900px)] top-1/2 -translate-y-1/2 h-[420px]',
    edge: 0.12,
    center: 0.22,
    delay: 0,
  },
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

const pathCache: Partial<Record<Variant, string[]>> = {};
const pathsFor = (variant: Variant) =>
  (pathCache[variant] ??= Array.from({ length: VARIANTS[variant].shape.lines }, (_, k) => wavePath(VARIANTS[variant].shape, k)));

/**
 * The hero's lines draw in when the page opens; the other sections' lines draw in when they
 * scroll into view. The parent needs `relative` (and `overflow-hidden`), and its content `relative`
 * so it sits above the lines.
 */
export const HeroBackgroundLines: React.FC<{ variant?: Variant }> = ({ variant = 'main' }) => {
  const config = VARIANTS[variant];
  const paths = pathsFor(variant);
  const mid = (paths.length - 1) / 2;
  const inHero = variant === 'main' || variant === 'corner';
  const ref = useRef<SVGSVGElement>(null);
  const [drawing, setDrawing] = useState(inHero);

  useEffect(() => {
    if (drawing || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawing(true);
        observer.disconnect();
      },
      { threshold: 0.2 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [drawing]);

  return (
    <svg
      ref={ref}
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={`pointer-events-none absolute text-primary ${config.placement} ${drawing ? '' : 'lines-wait'}`}
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
          strokeOpacity={config.edge + config.center * (1 - Math.abs(k - mid) / mid)}
          className="hero-line-draw"
          // Same total draw-in time whatever the number of lines.
          style={{ animationDelay: `${config.delay + Math.round((k * 800) / paths.length)}ms` }}
        />
      ))}
    </svg>
  );
};
