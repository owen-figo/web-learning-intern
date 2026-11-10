import React, { useMemo, useState } from 'react';
import { normalCdf, normalPdf } from '../data/continuousSampleData';
import { tCdf, tPdf } from '../data/confidenceSampleData';
import { tabClass } from './SamplingDistributionVisuals';
import { MathFormula } from './MathFormula';

// Visuals for chapter 9 (one-sample hypothesis tests) and chapter 10 (two-sample tests).
// Worked-example numbers match data/theoryHypothesis.ts.

type Tail = 'two' | 'left' | 'right';

const GREEN = '#00614d';
const RED = '#ba1a1a';
const AMBER = '#9a6400';
const INK = '#191c1c';

// ---------------------------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------------------------

/** x with cdf(x) = p, by bisection. */
function inverse(cdf: (x: number) => number, p: number, lo = -60, hi = 60): number {
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (cdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Positive critical value for a test with this α and tail (Z if df is undefined, else t). */
export function criticalValue(alpha: number, tail: Tail, df?: number): number {
  const cdf = df === undefined ? normalCdf : (x: number) => tCdf(x, df);
  return inverse(cdf, tail === 'two' ? 1 - alpha / 2 : 1 - alpha);
}

export function pValue(stat: number, tail: Tail, df?: number): number {
  const cdf = df === undefined ? normalCdf : (x: number) => tCdf(x, df);
  if (tail === 'two') return Math.min(1, 2 * (1 - cdf(Math.abs(stat))));
  if (tail === 'right') return 1 - cdf(stat);
  return cdf(stat);
}

function rejects(stat: number, crit: number, tail: Tail): boolean {
  if (tail === 'two') return Math.abs(stat) > crit;
  if (tail === 'right') return stat > crit;
  return stat < -crit;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sampleVar = (xs: number[]) => {
  const m = mean(xs);
  return xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1);
};

/** "t_STAT" → t with subscript STAT, for labels. */
const sub = (base: string, script: string, rest = '') => (
  <>
    {base}
    <sub className="text-[0.75em]">{script}</sub>
    {rest}
  </>
);

const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const fmtP = (p: number) => (p < 0.0001 ? '< 0.0001' : p.toFixed(4));

// ---------------------------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------------------------

const ALPHAS = [0.01, 0.05, 0.1];

const AlphaTabs: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-xs font-semibold text-on-surface-variant">α =</span>
    {ALPHAS.map((a) => (
      <button key={a} type="button" onClick={() => onChange(a)} className={tabClass(value === a)}>
        {a}
      </button>
    ))}
  </div>
);

const TAIL_LABEL: Record<Tail, string> = { left: 'Sisi kiri (<)', two: 'Dua sisi (≠)', right: 'Sisi kanan (>)' };

const TailTabs: React.FC<{ value: Tail; onChange: (v: Tail) => void }> = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {(['left', 'two', 'right'] as Tail[]).map((t) => (
      <button key={t} type="button" onClick={() => onChange(t)} className={tabClass(value === t)}>
        {TAIL_LABEL[t]}
      </button>
    ))}
  </div>
);

const Banner: React.FC<{ title: string; tone?: 'neutral' | 'reject' | 'keep'; children: React.ReactNode }> = ({ title, tone = 'neutral', children }) => {
  const cls =
    tone === 'reject'
      ? 'bg-error-container/40 border-error/30'
      : tone === 'keep'
        ? 'bg-primary-fixed/30 border-primary/30'
        : 'bg-secondary-fixed/40 border-secondary-fixed-dim';
  const icon = tone === 'reject' ? 'gavel' : tone === 'keep' ? 'balance' : 'lightbulb';
  return (
    <div className={`p-3 rounded-xl border text-xs space-y-1 ${cls}`}>
      <div className="font-bold text-black flex items-center gap-1.5">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          {icon}
        </span>
        <span>{title}</span>
      </div>
      <div className="text-on-surface text-xs leading-relaxed">{children}</div>
    </div>
  );
};

const SliderCard: React.FC<{
  label: React.ReactNode;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, display, min, max, step, value, onChange }) => (
  <label className="block p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
    <span className="flex justify-between text-xs gap-2">
      <span className="font-semibold text-on-surface">{label}</span>
      <span className="font-mono font-bold text-black">{display}</span>
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary cursor-pointer"
    />
  </label>
);

const Stat: React.FC<{ label: React.ReactNode; value: React.ReactNode; note?: React.ReactNode; strong?: boolean; tone?: 'reject' | 'keep' }> = ({
  label,
  value,
  note,
  strong,
  tone,
}) => (
  <div
    className={`p-3 rounded-xl space-y-0.5 ${
      tone === 'reject'
        ? 'bg-error-container/40 border-2 border-error/40'
        : tone === 'keep'
          ? 'bg-primary-fixed/30 border-2 border-primary/40'
          : strong
            ? 'bg-primary-fixed/30 border-2 border-primary/40'
            : 'bg-surface-container-lowest border border-outline-variant/50'
    }`}
  >
    <div className="text-xs font-semibold text-on-surface-variant">{label}</div>
    <div className="text-lg font-extrabold font-mono text-black leading-tight">{value}</div>
    {note && <div className="text-xs text-on-surface-variant font-mono">{note}</div>}
  </div>
);

const Panel: React.FC<{ title: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }> = ({ title, right, children }) => (
  <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="text-sm font-bold text-on-surface">{title}</div>
      {right}
    </div>
    {children}
  </div>
);

interface Shade {
  from: number;
  to: number;
  color: string;
  opacity?: number;
}
interface Mark {
  x: number;
  label: string;
  color: string;
  dashed?: boolean;
  row?: 0 | 1;
}

/** A density curve with shaded areas and labelled vertical lines. */
const Curve: React.FC<{
  pdfs: { f: (x: number) => number; color: string; dashed?: boolean; width?: number }[];
  min: number;
  max: number;
  peak: number;
  shades?: (Shade & { pdf?: (x: number) => number })[];
  marks?: Mark[];
  ticks: number[];
  tickLabel?: (x: number) => string;
  axisLabel?: string;
}> = ({ pdfs, min, max, peak, shades = [], marks = [], ticks, tickLabel = (x) => String(x), axisLabel }) => {
  const toPx = (x: number) => 30 + ((x - min) / (max - min)) * 400;
  const toPy = (y: number) => 140 - (y / peak) * 108;
  const clampX = (x: number) => Math.min(max, Math.max(min, x));
  const line = (f: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const x = min + (i / 160) * (max - min);
      pts.push(`${toPx(x).toFixed(1)} ${toPy(f(x)).toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  };
  const area = (f: (x: number) => number, from: number, to: number) => {
    const a = clampX(from);
    const b = clampX(to);
    if (b <= a) return '';
    const pts: string[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = a + (i / 60) * (b - a);
      pts.push(`${toPx(x).toFixed(1)} ${toPy(f(x)).toFixed(1)}`);
    }
    return `M ${toPx(a).toFixed(1)} 140 L ${pts.join(' L ')} L ${toPx(b).toFixed(1)} 140 Z`;
  };
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
      <svg viewBox="0 0 460 178" className="w-full h-auto select-none overflow-visible" role="img" aria-label="Kurva distribusi">
        {shades.map((s, i) => (
          <path key={i} d={area(s.pdf ?? pdfs[0].f, s.from, s.to)} fill={s.color} opacity={s.opacity ?? 0.85} />
        ))}
        {shades
          .filter((s) => s.color === '#ffdad6')
          .map((s, i) => (
            <rect key={`band${i}`} x={toPx(clampX(s.from))} y="138" width={Math.max(0, toPx(clampX(s.to)) - toPx(clampX(s.from)))} height="5" fill={RED} opacity="0.75" />
          ))}
        {pdfs.map((p, i) => (
          <path key={i} d={line(p.f)} fill="none" stroke={p.color} strokeWidth={p.width ?? 2.5} strokeDasharray={p.dashed ? '5 4' : undefined} />
        ))}
        <line x1="20" y1="140" x2="440" y2="140" stroke={INK} strokeWidth="1.5" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toPx(t)} y1="137" x2={toPx(t)} y2="143" stroke={INK} strokeWidth="1.5" />
            <text x={toPx(t)} y="157" textAnchor="middle" fontSize="10" fontWeight="bold" fill={INK} fontFamily="monospace">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {axisLabel && (
          <text x="440" y="174" textAnchor="end" fontSize="10" fill="#3f4945" fontFamily="sans-serif">
            {axisLabel}
          </text>
        )}
        {marks
          .filter((m) => m.x >= min && m.x <= max)
          .map((m, i) => (
            <g key={i}>
              <line x1={toPx(m.x)} y1={m.row === 1 ? 30 : 16} x2={toPx(m.x)} y2="140" stroke={m.color} strokeWidth="2" strokeDasharray={m.dashed ? '3 3' : undefined} />
              <text x={toPx(m.x)} y={m.row === 1 ? 26 : 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill={m.color} fontFamily="monospace">
                {m.label}
              </text>
            </g>
          ))}
      </svg>
    </div>
  );
};

/** Rejection-region shades for a test statistic curve. */
function rejectionShades(crit: number, tail: Tail, min: number, max: number): Shade[] {
  const c = { color: '#ffdad6', opacity: 0.95 };
  if (tail === 'two')
    return [
      { from: min, to: -crit, ...c },
      { from: crit, to: max, ...c },
    ];
  if (tail === 'right') return [{ from: crit, to: max, ...c }];
  return [{ from: min, to: -crit, ...c }];
}

function criticalMarks(crit: number, tail: Tail): Mark[] {
  const m = (x: number): Mark => ({ x, label: `${x > 0 ? '+' : '−'}${fmt(Math.abs(x), 3)}`, color: RED, dashed: true, row: 1 });
  if (tail === 'two') return [m(-crit), m(crit)];
  if (tail === 'right') return [m(crit)];
  return [m(-crit)];
}

const Legend: React.FC<{ items: { color: string; label: string; kind?: 'box' | 'line' | 'dash' }[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface">
    {items.map((it) => (
      <span key={it.label} className="flex items-center gap-1.5">
        {it.kind === 'line' || it.kind === 'dash' ? (
          <span className="inline-block w-5 border-t-2" style={{ borderColor: it.color, borderStyle: it.kind === 'dash' ? 'dashed' : 'solid' }} />
        ) : (
          <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: it.color }} />
        )}
        {it.label}
      </span>
    ))}
  </div>
);

const Verdict: React.FC<{ reject: boolean; children?: React.ReactNode }> = ({ reject, children }) => (
  <Banner tone={reject ? 'reject' : 'keep'} title={reject ? 'Keputusan: tolak H₀' : 'Keputusan: tidak tolak H₀'}>
    {children}
  </Banner>
);

// =============================================================================================
// 1. SETTING UP H0 AND H1
// =============================================================================================
const SCENARIOS: { tail: Tail; title: string; story: string; h0: string; h1: string; keyword: string }[] = [
  {
    tail: 'two',
    title: 'Mesin pengisi beras',
    story: 'Manajer pabrik ingin tahu apakah rata-rata berat beras per kemasan berbeda dari target 368 g (bisa lebih, bisa kurang).',
    h0: 'H₀: μ = 368',
    h1: 'H₁: μ ≠ 368',
    keyword: '"berbeda", "berubah", "tidak sama" → ≠ (dua sisi)',
  },
  {
    tail: 'right',
    title: 'Jam belajar mahasiswa',
    story: 'Seorang dosen menduga rata-rata jam belajar mandiri mahasiswa lebih dari 10 jam per minggu.',
    h0: 'H₀: μ ≤ 10',
    h1: 'H₁: μ > 10',
    keyword: '"lebih dari", "meningkat", "melebihi" → > (sisi kanan)',
  },
  {
    tail: 'left',
    title: 'Isi botol minuman',
    story: 'Lembaga konsumen menduga rata-rata isi botol kurang dari 600 ml yang tertulis di label.',
    h0: 'H₀: μ ≥ 600',
    h1: 'H₁: μ < 600',
    keyword: '"kurang dari", "menurun", "di bawah" → < (sisi kiri)',
  },
];

export const HypothesisSetupVisual: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const sc = SCENARIOS[idx];
  const crit = criticalValue(0.05, sc.tail);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        {SCENARIOS.map((s, i) => (
          <button key={s.title} type="button" onClick={() => setIdx(i)} className={tabClass(idx === i)}>
            {s.title}
          </button>
        ))}
      </div>
      <Panel title="Dari pertanyaan penelitian ke hipotesis">
        <p className="text-sm text-on-surface leading-relaxed">{sc.story}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <div className="text-xs font-bold text-on-surface-variant uppercase">Null hypothesis (status quo)</div>
            <MathFormula text={sc.h0} display />
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <div className="text-xs font-bold text-primary uppercase">Alternative hypothesis (yang ingin dibuktikan)</div>
            <MathFormula text={sc.h1} display />
          </div>
        </div>
        <Curve
          pdfs={[{ f: (x) => normalPdf(x, 0, 1), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={rejectionShades(crit, sc.tail, -4, 4)}
          marks={criticalMarks(crit, sc.tail)}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="Z (jika H₀ benar)"
        />
        <Legend items={[{ color: '#ffdad6', label: `Rejection region (α = 0.05, ${TAIL_LABEL[sc.tail].toLowerCase()})` }]} />
      </Panel>
      <Banner title="Kata kunci dalam soal:">{sc.keyword}. H₀ selalu memuat tanda sama dengan (=, ≤, atau ≥).</Banner>
    </div>
  );
};

// =============================================================================================
// 2. TYPE I AND TYPE II ERRORS
// =============================================================================================
export const TypeErrorsVisual: React.FC = () => {
  const mu0 = 368;
  const sigma = 15;
  const [alpha, setAlpha] = useState(0.05);
  const [trueMu, setTrueMu] = useState(374);
  const [n, setN] = useState(25);
  const se = sigma / Math.sqrt(n);
  const z = criticalValue(alpha, 'two');
  const lo = mu0 - z * se;
  const hi = mu0 + z * se;
  const beta = normalCdf((hi - trueMu) / se) - normalCdf((lo - trueMu) / se);
  const h0True = Math.abs(trueMu - mu0) < 1e-9;
  const min = 352;
  const max = 386;
  const f0 = (x: number) => normalPdf(x, mu0, se);
  const f1 = (x: number) => normalPdf(x, trueMu, se);
  const peak = normalPdf(0, 0, se) * 1.05;

  return (
    <div className="space-y-4">
      <AlphaTabs value={alpha} onChange={setAlpha} />
      <Panel title={`Sampling distribution x̄ (σ = ${sigma}, n = ${n})`}>
        <Curve
          pdfs={[
            { f: f0, color: '#6e7a74', dashed: true, width: 2 },
            ...(h0True ? [] : [{ f: f1, color: GREEN }]),
          ]}
          min={min}
          max={max}
          peak={peak}
          shades={[
            { from: min, to: lo, color: '#ffdad6', pdf: f0 },
            { from: hi, to: max, color: '#ffdad6', pdf: f0 },
            ...(h0True ? [] : [{ from: lo, to: hi, color: '#ffddb5', opacity: 0.75, pdf: f1 }]),
          ]}
          marks={[
            { x: lo, label: fmt(lo, 1), color: RED, dashed: true, row: 1 },
            { x: hi, label: fmt(hi, 1), color: RED, dashed: true, row: 1 },
            { x: mu0, label: 'H₀: 368', color: '#3f4945', row: 0 },
            ...(h0True ? [] : [{ x: trueMu, label: `μ = ${trueMu}`, color: GREEN, row: 0 as const }]),
          ]}
          ticks={[356, 362, 368, 374, 380]}
          axisLabel="x̄ (gram)"
        />
        <Legend
          items={[
            { color: '#6e7a74', label: 'Jika H₀ benar (μ = 368)', kind: 'dash' },
            ...(h0True ? [] : [{ color: GREEN, label: `Kenyataan (μ = ${trueMu})`, kind: 'line' as const }]),
            { color: '#ffdad6', label: 'α: menolak H₀ yang benar' },
            ...(h0True ? [] : [{ color: '#ffddb5', label: 'β: tidak menolak H₀ yang salah' }]),
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderCard label="Rata-rata sebenarnya (μ):" display={`${trueMu} g`} min={362} max={380} step={1} value={trueMu} onChange={setTrueMu} />
          <SliderCard label="Ukuran sampel (n):" display={`n = ${n}`} min={5} max={100} step={1} value={n} onChange={setN} />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <Stat label="α (Type I)" value={alpha.toFixed(2)} />
          <Stat label="β (Type II)" value={h0True ? '—' : beta.toFixed(3)} />
          <Stat label="Power (1 − β)" value={h0True ? '—' : (1 - beta).toFixed(3)} strong />
        </div>
      </Panel>
      <Banner title={h0True ? 'H₀ benar: hanya Type I error yang mungkin' : 'Coba ubah α dan n:'}>
        {h0True
          ? `Jika μ memang 368, satu-satunya kesalahan yang bisa terjadi adalah menolak H₀ (false alarm), dengan peluang α = ${alpha}.`
          : 'α lebih kecil menggeser batas penolakan keluar sehingga β membesar. Menambah n menyempitkan kedua kurva, sehingga β turun dan power naik tanpa mengubah α.'}
      </Banner>
    </div>
  );
};

// =============================================================================================
// 3. CRITICAL VALUE AND REJECTION REGION
// =============================================================================================
export const CriticalRegionVisual: React.FC = () => {
  const [alpha, setAlpha] = useState(0.05);
  const [tail, setTail] = useState<Tail>('two');
  const [stat, setStat] = useState(1.5);
  const crit = criticalValue(alpha, tail);
  const reject = rejects(stat, crit, tail);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 pb-2 border-b border-surface-container">
        <TailTabs value={tail} onChange={setTail} />
        <AlphaTabs value={alpha} onChange={setAlpha} />
      </div>
      <Panel title="Distribusi Z jika H₀ benar">
        <Curve
          pdfs={[{ f: (x) => normalPdf(x, 0, 1), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={rejectionShades(crit, tail, -4, 4)}
          marks={[...criticalMarks(crit, tail), { x: stat, label: `Z_STAT = ${fmt(stat)}`, color: reject ? RED : GREEN, row: 0 }]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="Z"
        />
        <Legend
          items={[
            { color: '#ffdad6', label: `Rejection region, luas total α = ${alpha}` },
            { color: RED, label: 'Critical value', kind: 'dash' },
          ]}
        />
        <SliderCard label={sub('Test statistic Z', 'STAT', ' dari sampel:')} display={fmt(stat)} min={-4} max={4} step={0.01} value={stat} onChange={setStat} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat label="Critical value" value={tail === 'two' ? `±${fmt(crit, 3)}` : tail === 'right' ? `+${fmt(crit, 3)}` : `−${fmt(crit, 3)}`} />
          <Stat label={sub('Z', 'STAT', ' jatuh di')} value={reject ? 'Rejection region' : 'Nonrejection region'} tone={reject ? 'reject' : 'keep'} />
        </div>
      </Panel>
      <Verdict reject={reject}>
        {tail === 'two'
          ? `Uji dua sisi membagi α = ${alpha} menjadi ${alpha / 2} di setiap ekor.`
          : `Uji satu sisi meletakkan seluruh α = ${alpha} di ekor ${tail === 'right' ? 'kanan' : 'kiri'}, sehingga critical value lebih dekat ke 0.`}{' '}
        {reject ? 'Hasil sampel terlalu jauh dari nilai H₀ untuk dianggap kebetulan.' : 'Hasil sampel masih wajar jika H₀ benar.'}
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 4. Z TEST FOR THE MEAN (SIX STEPS)
// =============================================================================================
export const ZTestMeanVisual: React.FC = () => {
  const mu0 = 368;
  const sigma = 15;
  const [alpha, setAlpha] = useState(0.05);
  const [xbar, setXbar] = useState(372.5);
  const [n, setN] = useState(25);
  const se = sigma / Math.sqrt(n);
  const z = (xbar - mu0) / se;
  const crit = criticalValue(alpha, 'two');
  const reject = Math.abs(z) > crit;
  const p = pValue(z, 'two');
  const steps = [
    ['Hipotesis', 'H₀: μ = 368, H₁: μ ≠ 368'],
    ['Level of significance', `α = ${alpha}`],
    ['Test statistic', `Z-test (σ = ${sigma} diketahui)`],
    ['Critical value', `±${fmt(crit, 3)}`],
    ['Decision rule', `Tolak H₀ jika Z_STAT < −${fmt(crit, 2)} atau > ${fmt(crit, 2)}`],
    ['Keputusan', `Z_STAT = ${fmt(z)} → ${reject ? 'tolak H₀' : 'tidak tolak H₀'}`],
  ];
  return (
    <div className="space-y-4">
      <AlphaTabs value={alpha} onChange={setAlpha} />
      <Panel title="Uji Z: rata-rata berat beras (target 368 g, σ = 15 g)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderCard label="Sample mean (x̄):" display={`${fmt(xbar, 1)} g`} min={358} max={378} step={0.1} value={xbar} onChange={setXbar} />
          <SliderCard label="Ukuran sampel (n):" display={`n = ${n}`} min={4} max={100} step={1} value={n} onChange={setN} />
        </div>
        <Curve
          pdfs={[{ f: (x) => normalPdf(x, 0, 1), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={rejectionShades(crit, 'two', -4, 4)}
          marks={[...criticalMarks(crit, 'two'), { x: Math.max(-4, Math.min(4, z)), label: `Z_STAT = ${fmt(z)}`, color: reject ? RED : GREEN }]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="Z"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="Standard error σ/√n" value={fmt(se, 3)} note={`${sigma} / √${n}`} />
          <Stat label={sub('Z', 'STAT')} value={fmt(z)} note={`(${fmt(xbar, 1)} − 368) / ${fmt(se, 3)}`} tone={reject ? 'reject' : 'keep'} />
          <Stat label="p-value (dua sisi)" value={fmtP(p)} note={p < alpha ? `< α = ${alpha}` : `≥ α = ${alpha}`} />
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {steps.map(([t, v], i) => (
            <li key={t} className="flex items-start gap-2 text-xs p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40">
              <span className="w-5 h-5 shrink-0 rounded-md bg-primary text-on-primary font-bold flex items-center justify-center">{i + 1}</span>
              <span>
                <span className="font-semibold text-on-surface">{t}: </span>
                <span className="font-mono text-black">{v}</span>
              </span>
            </li>
          ))}
        </ol>
      </Panel>
      <Verdict reject={reject}>
        {reject
          ? `Rata-rata sampel ${fmt(xbar, 1)} g terlalu jauh dari 368 g: ada bukti bahwa rata-rata berat berbeda dari target.`
          : `Selisih ${fmt(xbar - mu0, 1)} g masih bisa terjadi karena kebetulan sampling: tidak ada bukti bahwa rata-rata berat berbeda dari 368 g.`}
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 5. P-VALUE
// =============================================================================================
export const PValueVisual: React.FC = () => {
  const [alpha, setAlpha] = useState(0.05);
  const [tail, setTail] = useState<Tail>('two');
  const [stat, setStat] = useState(1.5);
  const p = pValue(stat, tail);
  const reject = p < alpha;
  const a = Math.abs(stat);
  const shades: Shade[] =
    tail === 'two'
      ? [
          { from: -4, to: -a, color: '#a8d8ff' },
          { from: a, to: 4, color: '#a8d8ff' },
        ]
      : tail === 'right'
        ? [{ from: stat, to: 4, color: '#a8d8ff' }]
        : [{ from: -4, to: stat, color: '#a8d8ff' }];
  const crit = criticalValue(alpha, tail);
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 pb-2 border-b border-surface-container">
        <TailTabs value={tail} onChange={setTail} />
        <AlphaTabs value={alpha} onChange={setAlpha} />
      </div>
      <Panel title="p-value = luas di luar test statistic (jika H₀ benar)">
        <Curve
          pdfs={[{ f: (x) => normalPdf(x, 0, 1), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={shades}
          marks={[
            ...criticalMarks(crit, tail),
            { x: stat, label: `Z_STAT = ${fmt(stat)}`, color: '#00497d' },
            ...(tail === 'two' && a > 0.05 ? [{ x: -stat, label: '', color: '#00497d', dashed: true }] : []),
          ]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="Z"
        />
        <Legend
          items={[
            { color: '#a8d8ff', label: tail === 'two' ? 'p-value (kedua ekor)' : 'p-value (satu ekor)' },
            { color: RED, label: `Critical value untuk α = ${alpha}`, kind: 'dash' },
          ]}
        />
        <SliderCard label={sub('Test statistic Z', 'STAT', ':')} display={fmt(stat)} min={-4} max={4} step={0.01} value={stat} onChange={setStat} />
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-on-surface">
            <span>p-value = {fmtP(p)}</span>
            <span>α = {alpha}</span>
          </div>
          <div className="relative h-3 rounded-full bg-surface-container overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (p / 0.2) * 100)}%`, backgroundColor: reject ? RED : '#00497d' }} />
            <div className="absolute inset-y-0 w-0.5 bg-black" style={{ left: `${(alpha / 0.2) * 100}%` }} />
          </div>
          <div className="text-xs text-on-surface-variant">Skala 0 sampai 0.20; garis hitam = α.</div>
        </div>
      </Panel>
      <Verdict reject={reject}>
        {reject
          ? `p-value ${fmtP(p)} < α = ${alpha}: hasil seekstrem ini jarang terjadi jika H₀ benar, jadi H₀ ditolak.`
          : `p-value ${fmtP(p)} ≥ α = ${alpha}: hasil seperti ini cukup sering muncul walaupun H₀ benar, jadi H₀ tidak ditolak.`}
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 6. t TEST FOR THE MEAN
// =============================================================================================
export const TTestMeanVisual: React.FC = () => {
  const mu0 = 120;
  const [alpha, setAlpha] = useState(0.05);
  const [xbar, setXbar] = useState(112.85);
  const [s, setS] = useState(20.8);
  const [n, setN] = useState(12);
  const df = n - 1;
  const se = s / Math.sqrt(n);
  const t = (xbar - mu0) / se;
  const crit = criticalValue(alpha, 'two', df);
  const zc = criticalValue(alpha, 'two');
  const reject = Math.abs(t) > crit;
  const p = pValue(t, 'two', df);
  return (
    <div className="space-y-4">
      <AlphaTabs value={alpha} onChange={setAlpha} />
      <Panel title="Uji t: rata-rata nilai faktur (H₀: μ = 120 ribu rupiah)" right={<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">df = {df}</span>}>
        <Curve
          pdfs={[
            { f: (x) => normalPdf(x, 0, 1), color: '#6e7a74', dashed: true, width: 1.5 },
            { f: (x) => tPdf(x, df), color: GREEN },
          ]}
          min={-4.5}
          max={4.5}
          peak={0.42}
          shades={rejectionShades(crit, 'two', -4.5, 4.5).map((sh) => ({ ...sh, pdf: (x: number) => tPdf(x, df) }))}
          marks={[...criticalMarks(crit, 'two'), { x: Math.max(-4.5, Math.min(4.5, t)), label: `t_STAT = ${fmt(t)}`, color: reject ? RED : GREEN }]}
          ticks={[-4, -2, 0, 2, 4]}
          axisLabel="t"
        />
        <Legend
          items={[
            { color: GREEN, label: `Distribusi t (df = ${df})`, kind: 'line' },
            { color: '#6e7a74', label: 'Normal standar Z', kind: 'dash' },
            { color: '#ffdad6', label: 'Rejection region' },
          ]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SliderCard label="x̄ (ribu Rp):" display={fmt(xbar)} min={100} max={135} step={0.05} value={xbar} onChange={setXbar} />
          <SliderCard label="S:" display={fmt(s)} min={5} max={40} step={0.1} value={s} onChange={setS} />
          <SliderCard label="n:" display={String(n)} min={3} max={60} step={1} value={n} onChange={setN} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label={sub('t', 'STAT')} value={fmt(t)} note={`(${fmt(xbar)} − 120) / (${fmt(s)} / √${n})`} tone={reject ? 'reject' : 'keep'} />
          <Stat label={`Critical t (df = ${df})`} value={`±${fmt(crit, 4)}`} note={`Z akan memberi ±${fmt(zc, 3)}`} />
          <Stat label="p-value (dua sisi)" value={fmtP(p)} />
        </div>
      </Panel>
      <Verdict reject={reject}>
        {reject
          ? 'Rata-rata nilai faktur berbeda secara signifikan dari Rp120 ribu.'
          : 'Tidak ada bukti bahwa rata-rata nilai faktur berbeda dari Rp120 ribu.'}{' '}
        Perhatikan: critical t selalu lebih besar daripada critical Z, karena S hanyalah estimasi dari σ. Perbedaannya mengecil saat n membesar.
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 7. ONE-TAIL TESTS
// =============================================================================================
export const OneTailVisual: React.FC = () => {
  const mu0 = 600;
  const s = 10;
  const n = 25;
  const df = n - 1;
  const [tail, setTail] = useState<Tail>('left');
  const [xbar, setXbar] = useState(596);
  const alpha = 0.05;
  const t = (xbar - mu0) / (s / Math.sqrt(n));
  const crit = criticalValue(alpha, tail, df);
  const reject = rejects(t, crit, tail);
  const p = pValue(t, tail, df);
  const hyp: Record<Tail, string> = {
    left: 'H₀: μ ≥ 600   |   H₁: μ < 600',
    two: 'H₀: μ = 600   |   H₁: μ ≠ 600',
    right: 'H₀: μ ≤ 600   |   H₁: μ > 600',
  };
  return (
    <div className="space-y-4">
      <TailTabs value={tail} onChange={setTail} />
      <Panel title={`Isi botol: n = ${n}, S = ${s} ml, α = 0.05, df = ${df}`}>
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 flex flex-wrap gap-x-6 gap-y-1">
          <MathFormula text={hyp[tail]} />
        </div>
        <Curve
          pdfs={[{ f: (x) => tPdf(x, df), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={rejectionShades(crit, tail, -4, 4).map((sh) => ({ ...sh, pdf: (x: number) => tPdf(x, df) }))}
          marks={[...criticalMarks(crit, tail), { x: Math.max(-4, Math.min(4, t)), label: `t_STAT = ${fmt(t)}`, color: reject ? RED : GREEN }]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="t"
        />
        <SliderCard label="Rata-rata isi sampel (x̄):" display={`${fmt(xbar, 1)} ml`} min={590} max={608} step={0.1} value={xbar} onChange={setXbar} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label={sub('t', 'STAT')} value={fmt(t)} note={`(${fmt(xbar, 1)} − 600) / (10 / 5)`} tone={reject ? 'reject' : 'keep'} />
          <Stat
            label="Critical value"
            value={tail === 'two' ? `±${fmt(crit, 4)}` : tail === 'right' ? `+${fmt(crit, 4)}` : `−${fmt(crit, 4)}`}
            note={tail === 'two' ? 'α/2 = 0.025 per ekor' : 'seluruh α = 0.05 di satu ekor'}
          />
          <Stat label="p-value" value={fmtP(p)} />
        </div>
      </Panel>
      <Verdict reject={reject}>
        {tail === 'left' &&
          (reject
            ? 'Ada bukti bahwa rata-rata isi botol kurang dari 600 ml.'
            : 'Belum ada bukti bahwa rata-rata isi botol kurang dari 600 ml.')}
        {tail === 'right' &&
          'Uji sisi kanan hanya bisa menolak H₀ jika t_STAT positif dan besar. Dengan x̄ di bawah 600, data justru berlawanan arah dengan H₁.'}
        {tail === 'two' &&
          `Pada uji dua sisi, α dibagi ke dua ekor sehingga critical value lebih jauh (±${fmt(crit, 3)}). Hasil yang signifikan pada uji satu sisi bisa tidak signifikan di sini.`}
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 8. Z TEST FOR THE PROPORTION
// =============================================================================================
export const ZTestProportionVisual: React.FC = () => {
  const [n, setN] = useState(400);
  const [x, setX] = useState(230);
  const [pi0, setPi0] = useState(0.5);
  const [alpha, setAlpha] = useState(0.05);
  const safeX = Math.min(x, n);
  const p = safeX / n;
  const se = Math.sqrt((pi0 * (1 - pi0)) / n);
  const z = (p - pi0) / se;
  const crit = criticalValue(alpha, 'two');
  const reject = Math.abs(z) > crit;
  const pv = pValue(z, 'two');
  const okX = safeX >= 5;
  const okNX = n - safeX >= 5;
  return (
    <div className="space-y-4">
      <AlphaTabs value={alpha} onChange={setAlpha} />
      <Panel title={`Proporsi pengguna e-wallet (H₀: π = ${pi0.toFixed(2)}, dua sisi)`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SliderCard label="Success (X):" display={String(safeX)} min={0} max={n} step={1} value={safeX} onChange={setX} />
          <SliderCard label="Sample size (n):" display={String(n)} min={50} max={1000} step={10} value={n} onChange={setN} />
          <SliderCard label="π pada H₀:" display={pi0.toFixed(2)} min={0.1} max={0.9} step={0.05} value={pi0} onChange={setPi0} />
        </div>
        <Curve
          pdfs={[{ f: (v) => normalPdf(v, 0, 1), color: GREEN }]}
          min={-4}
          max={4}
          peak={0.42}
          shades={rejectionShades(crit, 'two', -4, 4)}
          marks={[...criticalMarks(crit, 'two'), { x: Math.max(-4, Math.min(4, z)), label: `Z_STAT = ${fmt(z)}`, color: reject ? RED : GREEN }]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          axisLabel="Z"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Stat label="p = X / n" value={p.toFixed(3)} note={`${safeX} / ${n}`} />
          <Stat label="Standard error" value={se.toFixed(4)} note={`√(${pi0.toFixed(2)} × ${(1 - pi0).toFixed(2)} / ${n})`} />
          <Stat label={sub('Z', 'STAT')} value={fmt(z)} note={`p-value = ${fmtP(pv)}`} tone={reject ? 'reject' : 'keep'} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { ok: okX, label: `X = ${safeX}` },
            { ok: okNX, label: `n − X = ${n - safeX}` },
          ].map((c) => (
            <div
              key={c.label}
              className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                c.ok ? 'bg-primary-fixed/30 border-primary/30 text-black' : 'bg-error-container/40 border-error/30 text-error'
              }`}
            >
              <span>{c.label}</span>
              <span className="font-bold">{c.ok ? '≥ 5 ✓' : '< 5 ✗'}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Verdict reject={reject}>
        {!okX || !okNX
          ? 'Syarat X ≥ 5 dan n − X ≥ 5 belum terpenuhi, jadi pendekatan normal kurang tepat. '
          : ''}
        {reject
          ? `Proporsi sampel ${p.toFixed(3)} terlalu jauh dari ${pi0.toFixed(2)}: proporsi populasi berbeda dari ${pi0.toFixed(2)}.`
          : `Proporsi sampel ${p.toFixed(3)} masih wajar jika π = ${pi0.toFixed(2)}.`}
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 9. CHOOSING A TEST
// =============================================================================================
type Choice = { q: string; options: { label: string; next: string }[] };
const TREE: Record<string, Choice> = {
  start: {
    q: 'Berapa sampel yang dibandingkan?',
    options: [
      { label: 'Satu sampel vs nilai klaim', next: 'one' },
      { label: 'Dua sampel / dua kelompok', next: 'two' },
    ],
  },
  one: {
    q: 'Jenis datanya?',
    options: [
      { label: 'Numerik (rata-rata)', next: 'sigma' },
      { label: 'Kategorikal (success / failure)', next: 'R:prop' },
    ],
  },
  sigma: {
    q: 'Apakah σ populasi diketahui?',
    options: [
      { label: 'Ya, diketahui', next: 'R:z' },
      { label: 'Tidak, pakai S', next: 'R:t' },
    ],
  },
  two: {
    q: 'Apakah setiap data di sampel 1 punya pasangan di sampel 2?',
    options: [
      { label: 'Tidak, dua kelompok berbeda', next: 'R:pooled' },
      { label: 'Ya, sebelum-sesudah / berpasangan', next: 'R:paired' },
    ],
  },
};
const RESULTS: Record<string, { name: string; formula: string; df: string; example: string }> = {
  z: { name: 'Z test for the mean (σ known)', formula: 'Z_STAT = (x̄ − μ) / (σ / √n)', df: 'Pakai distribusi normal standar Z', example: 'Berat beras vs target 368 g, σ dari data historis mesin.' },
  t: { name: 't test for the mean (σ unknown)', formula: 't_STAT = (x̄ − μ) / (S / √n)', df: 'df = n − 1', example: 'Rata-rata nilai faktur vs Rp120 ribu.' },
  prop: { name: 'Z test for the proportion', formula: 'Z_STAT = (p − π) / √[ π(1 − π) / n ]', df: 'Syarat X ≥ 5 dan n − X ≥ 5', example: 'Proporsi pengguna e-wallet vs 50%.' },
  pooled: {
    name: 'Pooled-variance t test',
    formula: 't_STAT = (x̄₁ − x̄₂) / √[ S²_p (1/n₁ + 1/n₂) ]',
    df: 'df = n₁ + n₂ − 2',
    example: 'Penjualan di rak biasa vs rak ujung lorong.',
  },
  paired: { name: 'Paired t test', formula: 't_STAT = D̄ / (S_D / √n)', df: 'df = n − 1 (n = banyaknya pasangan)', example: 'Nilai sebelum vs sesudah pelatihan.' },
};

export const TestChooserVisual: React.FC<{ start?: 'start' | 'one' | 'two' }> = ({ start = 'start' }) => {
  const [path, setPath] = useState<string[]>([start]);
  const current = path[path.length - 1];
  const result = current.startsWith('R:') ? RESULTS[current.slice(2)] : null;
  const node = result ? null : TREE[current];
  return (
    <div className="space-y-4">
      <Panel
        title="Pilih uji yang tepat"
        right={
          path.length > 1 && (
            <button type="button" onClick={() => setPath([start])} className={tabClass(false)}>
              Ulangi
            </button>
          )
        }
      >
        <ol className="flex flex-wrap items-center gap-1.5 text-xs">
          {path.slice(0, -1).map((id, i) => {
            const chosen = TREE[id].options.find((o) => o.next === path[i + 1]);
            return (
              <li key={id} className="flex items-center gap-1.5">
                <button type="button" onClick={() => setPath(path.slice(0, i + 1))} className="px-2 py-0.5 rounded-full bg-primary-fixed/50 text-primary font-semibold hover:bg-primary-fixed">
                  {chosen?.label}
                </button>
                <span className="material-symbols-outlined text-outline" style={{ fontSize: 16 }}>
                  chevron_right
                </span>
              </li>
            );
          })}
        </ol>
        {node && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-on-surface">{node.q}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {node.options.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => setPath([...path, o.next])}
                  className="text-left p-3 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:border-primary hover:bg-primary-fixed/20 text-sm font-medium text-on-surface transition-colors"
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {result && (
          <div className="p-4 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-2">
            <div className="text-xs font-bold text-primary uppercase">Uji yang dipakai</div>
            <div className="text-base font-bold text-black">{result.name}</div>
            <div className="text-sm text-black">
              <MathFormula text={result.formula} display />
            </div>
            <div className="text-xs text-on-surface font-semibold">{result.df}</div>
            <div className="text-xs text-on-surface-variant">Contoh di materi: {result.example}</div>
          </div>
        )}
      </Panel>
    </div>
  );
};

// =============================================================================================
// 10. INDEPENDENT VS RELATED SAMPLES
// =============================================================================================
const BEFORE = [62, 70, 58, 75, 66, 71];
const AFTER = [68, 74, 61, 80, 65, 78];
const NAMES = ['Ayu', 'Bima', 'Citra', 'Dodi', 'Eka', 'Fajar'];

export const IndependentRelatedVisual: React.FC = () => {
  const [mode, setMode] = useState<'independent' | 'related'>('independent');
  const classA = [72, 65, 80, 58, 77, 69];
  const classB = [81, 74, 66, 88, 79, 70];
  const min = 50;
  const max = 92;
  const toY = (v: number) => 150 - ((v - min) / (max - min)) * 130;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        <button type="button" onClick={() => setMode('independent')} className={tabClass(mode === 'independent')}>
          Independent samples
        </button>
        <button type="button" onClick={() => setMode('related')} className={tabClass(mode === 'related')}>
          Related samples
        </button>
      </div>
      <Panel title={mode === 'independent' ? 'Nilai ujian kelas A vs kelas B (orang berbeda)' : 'Nilai sebelum vs sesudah pelatihan (orang yang sama)'}>
        <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 170" className="w-full h-auto select-none" role="img" aria-label="Perbandingan dua sampel">
            {[60, 70, 80, 90].map((v) => (
              <g key={v}>
                <line x1="40" y1={toY(v)} x2="440" y2={toY(v)} stroke="#e0e3e1" strokeWidth="1" />
                <text x="34" y={toY(v) + 3} textAnchor="end" fontSize="10" fill="#3f4945" fontFamily="monospace">
                  {v}
                </text>
              </g>
            ))}
            <text x="150" y="166" textAnchor="middle" fontSize="11" fontWeight="bold" fill={INK}>
              {mode === 'independent' ? 'Kelas A' : 'Sebelum'}
            </text>
            <text x="330" y="166" textAnchor="middle" fontSize="11" fontWeight="bold" fill={INK}>
              {mode === 'independent' ? 'Kelas B' : 'Sesudah'}
            </text>
            {mode === 'independent' ? (
              <>
                {classA.map((v, i) => (
                  <circle key={`a${i}`} cx={120 + (i % 3) * 30} cy={toY(v)} r="7" fill="#6e7a74" opacity="0.85" />
                ))}
                {classB.map((v, i) => (
                  <circle key={`b${i}`} cx={300 + (i % 3) * 30} cy={toY(v)} r="7" fill={GREEN} opacity="0.85" />
                ))}
              </>
            ) : (
              BEFORE.map((b, i) => {
                const a = AFTER[i];
                const up = a >= b;
                return (
                  <g key={i}>
                    <line x1="150" y1={toY(b)} x2="330" y2={toY(a)} stroke={up ? GREEN : RED} strokeWidth="2" opacity="0.8" />
                    <circle cx="150" cy={toY(b)} r="6" fill="#6e7a74" />
                    <circle cx="330" cy={toY(a)} r="6" fill={GREEN} />
                    <text x="342" y={toY(a) + 4} fontSize="10" fill={INK}>
                      {NAMES[i]}
                    </text>
                  </g>
                );
              })
            )}
          </svg>
        </div>
      </Panel>
      <Banner title={mode === 'independent' ? 'Tidak ada pasangan:' : 'Setiap titik punya pasangan:'}>
        {mode === 'independent'
          ? 'Mahasiswa kelas A dan kelas B adalah orang yang berbeda dan dipilih terpisah. Yang dibandingkan adalah rata-rata kedua kelompok → pooled-variance t test.'
          : 'Setiap garis adalah satu mahasiswa yang diukur dua kali. Yang dianalisis adalah selisih tiap garis (D = sesudah − sebelum) → paired t test.'}
      </Banner>
    </div>
  );
};

// =============================================================================================
// 11. POOLED-VARIANCE t TEST
// =============================================================================================
const NORMAL_SHELF = [22, 34, 52, 62, 30, 40, 64, 84, 56, 59];
const END_AISLE = [52, 71, 76, 54, 67, 83, 66, 90, 77, 84];

function pooledStats(g1: number[], g2: number[]) {
  const n1 = g1.length;
  const n2 = g2.length;
  const m1 = mean(g1);
  const m2 = mean(g2);
  const v1 = sampleVar(g1);
  const v2 = sampleVar(g2);
  const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 - 1 + (n2 - 1));
  const se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
  return { n1, n2, m1, m2, v1, v2, sp2, se, t: (m1 - m2) / se, df: n1 + n2 - 2 };
}

const DotStrip: React.FC<{ groups: { label: string; values: number[]; color: string }[]; min: number; max: number }> = ({ groups, min, max }) => {
  const toX = (v: number) => 110 + ((v - min) / (max - min)) * 320;
  return (
    <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
      <svg viewBox={`0 0 460 ${groups.length * 50 + 30}`} className="w-full h-auto select-none" role="img" aria-label="Sebaran data kedua kelompok">
        {groups.map((g, gi) => {
          const y = 30 + gi * 50;
          const m = mean(g.values);
          return (
            <g key={g.label}>
              <text x="8" y={y + 4} fontSize="11" fontWeight="bold" fill={INK}>
                {g.label}
              </text>
              <line x1="110" y1={y} x2="430" y2={y} stroke="#e0e3e1" strokeWidth="1" />
              {g.values.map((v, i) => (
                <circle key={i} cx={toX(v)} cy={y + ((i % 3) - 1) * 6} r="5" fill={g.color} opacity="0.75" />
              ))}
              <line x1={toX(m)} y1={y - 16} x2={toX(m)} y2={y + 16} stroke={g.color} strokeWidth="3" />
              <text x={toX(m)} y={y - 19} textAnchor="middle" fontSize="10" fontWeight="bold" fill={g.color} fontFamily="monospace">
                x̄ = {m.toFixed(1)}
              </text>
            </g>
          );
        })}
        {[20, 40, 60, 80, 100].filter((v) => v >= min && v <= max).map((v) => (
          <text key={v} x={toX(v)} y={groups.length * 50 + 24} textAnchor="middle" fontSize="10" fill="#3f4945" fontFamily="monospace">
            {v}
          </text>
        ))}
      </svg>
    </div>
  );
};

export const PooledTVisual: React.FC = () => {
  const [shift, setShift] = useState(0);
  const alpha = 0.05;
  const g2 = useMemo(() => END_AISLE.map((v) => v + shift), [shift]);
  const st = pooledStats(NORMAL_SHELF, g2);
  const crit = criticalValue(alpha, 'two', st.df);
  const reject = Math.abs(st.t) > crit;
  return (
    <div className="space-y-4">
      <Panel title="Penjualan minuman per minggu (kaleng), 10 toko per rak" right={<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">df = {st.df}</span>}>
        <DotStrip
          groups={[
            { label: 'Rak biasa', values: NORMAL_SHELF, color: '#6e7a74' },
            { label: 'Rak ujung', values: g2, color: GREEN },
          ]}
          min={10}
          max={110}
        />
        <SliderCard
          label="Geser semua penjualan rak ujung lorong:"
          display={`${shift > 0 ? '+' : ''}${shift} kaleng`}
          min={-30}
          max={10}
          step={1}
          value={shift}
          onChange={setShift}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="S²₁ (rak biasa)" value={fmt(st.v1, 2)} />
          <Stat label="S²₂ (rak ujung)" value={fmt(st.v2, 2)} />
          <Stat label={sub('Pooled S²', 'p')} value={fmt(st.sp2, 2)} note="rata-rata tertimbang" />
          <Stat label="Standard error" value={fmt(st.se, 4)} note="√[S²_p (1/10 + 1/10)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat label={sub('t', 'STAT')} value={fmt(st.t)} note={`(${fmt(st.m1, 1)} − ${fmt(st.m2, 1)}) / ${fmt(st.se, 4)}`} tone={reject ? 'reject' : 'keep'} />
          <Stat label="Critical value (α = 0.05)" value={`±${fmt(crit, 4)}`} note={`p-value = ${fmtP(pValue(st.t, 'two', st.df))}`} />
        </div>
      </Panel>
      <Verdict reject={reject}>
        {reject
          ? 'Selisih rata-rata kedua rak terlalu besar untuk dianggap kebetulan: letak rak memengaruhi penjualan.'
          : 'Selisih rata-rata masih bisa terjadi karena variasi antar toko: belum ada bukti bahwa letak rak berpengaruh.'}{' '}
        Geser slider ke kiri: ketika kedua rata-rata mendekat, t_STAT mengecil dan H₀ tidak lagi ditolak. Varians tidak berubah karena hanya posisinya yang digeser.
      </Verdict>
    </div>
  );
};

// =============================================================================================
// 12. CONFIDENCE INTERVAL FOR THE DIFFERENCE
// =============================================================================================
export const CiDifferenceVisual: React.FC = () => {
  const [level, setLevel] = useState(95);
  const [shift, setShift] = useState(0);
  const g2 = END_AISLE.map((v) => v + shift);
  const st = pooledStats(NORMAL_SHELF, g2);
  const tc = criticalValue(1 - level / 100, 'two', st.df);
  const diff = st.m1 - st.m2;
  const margin = tc * st.se;
  const lower = diff - margin;
  const upper = diff + margin;
  const containsZero = lower <= 0 && upper >= 0;
  const minX = -60;
  const maxX = 30;
  const toPx = (x: number) => 30 + ((Math.min(maxX, Math.max(minX, x)) - minX) / (maxX - minX)) * 400;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        {[90, 95, 99].map((l) => (
          <button key={l} type="button" onClick={() => setLevel(l)} className={tabClass(level === l)}>
            {l}%
          </button>
        ))}
      </div>
      <Panel title={`Interval ${level}% untuk μ₁ − μ₂ (rak biasa − rak ujung)`}>
        <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 110" className="w-full h-auto select-none overflow-visible" role="img" aria-label="Interval selisih mean">
            <line x1="20" y1="70" x2="440" y2="70" stroke={INK} strokeWidth="1.5" />
            <rect x={toPx(lower)} y="58" width={Math.max(2, toPx(upper) - toPx(lower))} height="24" rx="4" fill="#97f4d5" opacity="0.85" stroke={GREEN} strokeWidth="2" />
            <circle cx={toPx(diff)} cy="70" r="5" fill={GREEN} stroke="#fff" strokeWidth="1.5" />
            <text x={toPx(diff)} y="50" textAnchor="middle" fontSize="11" fontWeight="bold" fill={GREEN} fontFamily="monospace">
              {fmt(diff, 1)}
            </text>
            <text x={toPx(lower)} y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill={GREEN} fontFamily="monospace">
              {fmt(lower, 2)}
            </text>
            <text x={toPx(upper)} y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill={GREEN} fontFamily="monospace">
              {fmt(upper, 2)}
            </text>
            <line x1={toPx(0)} y1="20" x2={toPx(0)} y2="86" stroke={containsZero ? GREEN : RED} strokeWidth="2" strokeDasharray="3 3" />
            <text x={toPx(0)} y="14" textAnchor="middle" fontSize="11" fontWeight="bold" fill={containsZero ? GREEN : RED} fontFamily="monospace">
              0 (tidak ada beda)
            </text>
          </svg>
        </div>
        <SliderCard
          label="Geser semua penjualan rak ujung lorong:"
          display={`${shift > 0 ? '+' : ''}${shift} kaleng`}
          min={-30}
          max={10}
          step={1}
          value={shift}
          onChange={setShift}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Stat label="Margin of error" value={`± ${fmt(margin, 2)}`} note={`${fmt(tc, 4)} × ${fmt(st.se, 4)} (df = ${st.df})`} />
          <Stat label={`Interval ${level}%`} value={`${fmt(lower, 2)} ≤ μ₁ − μ₂ ≤ ${fmt(upper, 2)}`} tone={containsZero ? 'keep' : 'reject'} />
        </div>
      </Panel>
      <Banner tone={containsZero ? 'keep' : 'reject'} title={containsZero ? 'Interval memuat 0' : 'Interval tidak memuat 0'}>
        {containsZero
          ? `Selisih nol masih masuk akal, jadi uji dua sisi dengan α = ${(1 - level / 100).toFixed(2)} tidak menolak H₀.`
          : `Selisih nol tidak masuk akal, jadi uji dua sisi dengan α = ${(1 - level / 100).toFixed(2)} menolak H₀. Interval juga memberi tahu besarnya selisih.`}
      </Banner>
    </div>
  );
};

// =============================================================================================
// 13. PAIRED t TEST
// =============================================================================================
export const PairedTVisual: React.FC = () => {
  const [boost, setBoost] = useState(0);
  const after = AFTER.map((v) => v + boost);
  const d = after.map((a, i) => a - BEFORE[i]);
  const n = d.length;
  const dbar = mean(d);
  const sd = Math.sqrt(sampleVar(d));
  const se = sd / Math.sqrt(n);
  const t = dbar / se;
  const df = n - 1;
  const crit = criticalValue(0.05, 'two', df);
  const reject = Math.abs(t) > crit;
  const wrong = pooledStats(after, BEFORE);
  const wrongCrit = criticalValue(0.05, 'two', wrong.df);
  const maxAbs = Math.max(8, ...d.map((v) => Math.abs(v)));
  return (
    <div className="space-y-4">
      <Panel title="Nilai 6 mahasiswa sebelum dan sesudah pelatihan">
        <div className="overflow-x-auto rounded-xl border border-outline-variant/50 bg-surface-container-lowest">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-surface-container text-black">
                <th className="py-2 px-3 text-left font-bold">Mahasiswa</th>
                <th className="py-2 px-3 text-right font-bold">Sebelum</th>
                <th className="py-2 px-3 text-right font-bold">Sesudah</th>
                <th className="py-2 px-3 text-right font-bold">D</th>
                <th className="py-2 px-3 font-bold w-2/5">Selisih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-mono">
              {BEFORE.map((b, i) => (
                <tr key={i}>
                  <td className="py-1.5 px-3 font-sans">{NAMES[i]}</td>
                  <td className="py-1.5 px-3 text-right">{b}</td>
                  <td className="py-1.5 px-3 text-right">{after[i]}</td>
                  <td className={`py-1.5 px-3 text-right font-bold ${d[i] < 0 ? 'text-error' : 'text-primary'}`}>{d[i] > 0 ? `+${d[i]}` : d[i]}</td>
                  <td className="py-1.5 px-3">
                    <div className="relative h-3">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-outline-variant" />
                      <div
                        className="absolute inset-y-0 rounded-sm"
                        style={{
                          backgroundColor: d[i] < 0 ? RED : GREEN,
                          left: d[i] < 0 ? `${50 - (Math.abs(d[i]) / maxAbs) * 50}%` : '50%',
                          width: `${(Math.abs(d[i]) / maxAbs) * 50}%`,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <SliderCard label="Tambahkan efek pelatihan ke semua nilai sesudah:" display={`${boost > 0 ? '+' : ''}${boost} poin`} min={-6} max={6} step={1} value={boost} onChange={setBoost} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="D̄" value={fmt(dbar, 2)} note={`ΣD / ${n}`} />
          <Stat label={sub('S', 'D')} value={fmt(sd, 4)} />
          <Stat label={sub('S', 'D', ' / √n')} value={fmt(se, 4)} />
          <Stat label={sub('t', 'STAT', ` (df = ${df})`)} value={fmt(t)} note={`critical ±${fmt(crit, 4)}`} tone={reject ? 'reject' : 'keep'} />
        </div>
        <div className="p-3 rounded-xl bg-surface-container-lowest border border-dashed border-outline-variant text-xs space-y-1">
          <div className="font-bold text-on-surface">Jika keliru diperlakukan sebagai dua sampel independen (pooled t test):</div>
          <div className="font-mono text-black">
            t_STAT = {fmt(wrong.t)} (df = {wrong.df}, critical ±{fmt(wrongCrit, 4)}) → {Math.abs(wrong.t) > wrongCrit ? 'tolak H₀' : 'tidak tolak H₀'}
          </div>
        </div>
      </Panel>
      <Verdict reject={reject}>
        {reject
          ? `Rata-rata nilai berubah setelah pelatihan (rata-rata selisih ${fmt(dbar, 1)} poin).`
          : 'Belum ada bukti bahwa pelatihan mengubah rata-rata nilai.'}{' '}
        Paired t test hanya melihat selisih tiap orang, sehingga perbedaan kemampuan antar mahasiswa tidak ikut menjadi "noise". Itulah sebabnya pooled t test pada data yang sama
        jauh kurang peka.
      </Verdict>
    </div>
  );
};

// =============================================================================================
// ROUTER
// =============================================================================================
export const HypothesisVisuals: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'hypothesis-setup':
      return <HypothesisSetupVisual />;
    case 'type-errors':
      return <TypeErrorsVisual />;
    case 'critical-region':
      return <CriticalRegionVisual />;
    case 'z-test-mean':
      return <ZTestMeanVisual />;
    case 'p-value':
      return <PValueVisual />;
    case 't-test-mean':
      return <TTestMeanVisual />;
    case 'one-tail-test':
      return <OneTailVisual />;
    case 'z-test-proportion':
      return <ZTestProportionVisual />;
    case 'test-chooser':
      return <TestChooserVisual start="one" />;
    case 'test-chooser-two':
      return <TestChooserVisual start="start" />;
    case 'independent-vs-related':
      return <IndependentRelatedVisual />;
    case 'pooled-t-test':
      return <PooledTVisual />;
    case 'ci-difference':
      return <CiDifferenceVisual />;
    case 'paired-t-test':
      return <PairedTVisual />;
    default:
      return null;
  }
};
