import React, { useMemo, useState } from 'react';
import { normalPdf } from '../data/continuousSampleData';
import { mulberry32, standardErrorMean } from '../data/samplingSampleData';
import {
  confidenceSampleData,
  zCritical,
  tPdf,
  tCritical,
  ciMeanSigmaKnown,
  ciMeanSigmaUnknown,
  ciProportion,
  sampleSizeMean,
  sampleSizeProportion,
} from '../data/confidenceSampleData';
import { tabClass } from './SamplingDistributionVisuals';

const LEVELS = [90, 95, 99];

const LevelTabs: React.FC<{ value: number; onChange: (v: number) => void; showZ?: boolean }> = ({ value, onChange, showZ = true }) => (
  <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
    {LEVELS.map((l) => (
      <button key={l} type="button" onClick={() => onChange(l)} className={tabClass(value === l)}>
        {l}% {showZ ? `(Z = ${zCritical(l)})` : ''}
      </button>
    ))}
  </div>
);

const Banner: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
    <div className="font-bold text-black flex items-center gap-1.5">
      <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
      <span>{title}</span>
    </div>
    <p className="text-on-surface text-xs leading-relaxed">{children}</p>
  </div>
);

const SliderCard: React.FC<{
  label: string;
  display: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, display, min, max, step, value, onChange }) => (
  <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
    <div className="flex justify-between text-xs gap-2">
      <span className="font-semibold text-on-surface">{label}</span>
      <span className="font-mono font-bold text-black">{display}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full accent-primary cursor-pointer"
    />
  </div>
);

// Horizontal number line with the interval bracket, the point estimate and an optional reference value.
const IntervalLine: React.FC<{
  minX: number;
  maxX: number;
  lower: number;
  upper: number;
  point: number;
  pointLabel: string;
  reference?: { x: number; label: string };
  format?: (v: number) => string;
}> = ({ minX, maxX, lower, upper, point, pointLabel, reference, format = (v) => v.toFixed(2) }) => {
  const toPx = (x: number) => 30 + ((Math.min(maxX, Math.max(minX, x)) - minX) / (maxX - minX)) * 400;
  const inside = reference ? reference.x >= lower && reference.x <= upper : true;
  return (
    <div className="w-full h-32 sm:h-36 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
      <svg viewBox="0 0 460 110" className="w-full h-full select-none overflow-visible">
        <line x1="20" y1="70" x2="440" y2="70" stroke="#191c1c" strokeWidth="1.5" />
        <rect x={toPx(lower)} y="58" width={Math.max(2, toPx(upper) - toPx(lower))} height="24" rx="4" fill="#97f4d5" opacity="0.85" stroke="#00614d" strokeWidth="2" />
        <text x={toPx(lower)} y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
          {format(lower)}
        </text>
        <text x={toPx(upper)} y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
          {format(upper)}
        </text>
        <circle cx={toPx(point)} cy="70" r="5" fill="#00614d" stroke="#ffffff" strokeWidth="1.5" />
        <text x={toPx(point)} y="50" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
          {pointLabel}
        </text>
        {reference && (
          <g>
            <line x1={toPx(reference.x)} y1="20" x2={toPx(reference.x)} y2="86" stroke={inside ? '#00614d' : '#ba1a1a'} strokeWidth="2" strokeDasharray="3 3" />
            <text x={toPx(reference.x)} y="14" textAnchor="middle" fontSize="11" fontWeight="bold" fill={inside ? '#00614d' : '#ba1a1a'} fontFamily="monospace">
              {reference.label}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

// =========================================================================
// 1. CONFIDENCE INTERVAL COVERAGE (REPEATED SAMPLING)
// =========================================================================
export const CiCoverageVisual: React.FC = () => {
  const mu = 368;
  const sigma = 15;
  const n = 25;
  const count = 50;
  const [level, setLevel] = useState<number>(95);
  const [seed, setSeed] = useState<number>(1);

  const se = standardErrorMean(sigma, n);
  const z = zCritical(level);

  const intervals = useMemo(() => {
    const rand = mulberry32(seed * 104729);
    return Array.from({ length: count }, () => {
      // x̄ drawn from its sampling distribution N(μ, σ/√n)
      const u1 = rand();
      const u2 = rand();
      const xbar = mu + se * Math.sqrt(-2 * Math.log(1 - u1)) * Math.cos(2 * Math.PI * u2);
      return { xbar, lower: xbar - z * se, upper: xbar + z * se };
    });
  }, [seed, se, z]);

  const hits = intervals.filter((iv) => iv.lower <= mu && mu <= iv.upper).length;
  const minX = mu - 14;
  const maxX = mu + 14;
  const toPx = (x: number) => 30 + ((Math.min(maxX, Math.max(minX, x)) - minX) / (maxX - minX)) * 400;

  return (
    <div className="space-y-4">
      <LevelTabs value={level} onChange={setLevel} />

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            {count} Sampel (n = {n}), Masing-masing Membuat Satu Interval {level}%
          </div>
          <button type="button" onClick={() => setSeed((s) => s + 1)} className={tabClass(true)}>
            Ulangi {count} Sampel
          </button>
        </div>

        <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox={`0 0 460 ${count * 6 + 40}`} className="w-full h-auto select-none overflow-visible">
            <line x1={toPx(mu)} y1="14" x2={toPx(mu)} y2={count * 6 + 20} stroke="#191c1c" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={toPx(mu)} y="10" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
              μ = {mu} (tidak diketahui peneliti)
            </text>
            {intervals.map((iv, i) => {
              const hit = iv.lower <= mu && mu <= iv.upper;
              const y = 22 + i * 6;
              const color = hit ? '#00614d' : '#ba1a1a';
              return (
                <g key={i}>
                  <line x1={toPx(iv.lower)} y1={y} x2={toPx(iv.upper)} y2={y} stroke={color} strokeWidth={hit ? 2 : 3} />
                  <circle cx={toPx(iv.xbar)} cy={y} r="1.8" fill={color} />
                </g>
              );
            })}
            {[356, 362, 368, 374, 380].map((t) => (
              <text key={t} x={toPx(t)} y={count * 6 + 36} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                {t}
              </text>
            ))}
          </svg>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Interval yang memuat μ:</span>
            <div className="text-xl font-extrabold font-mono text-black">
              {hits} / {count} ({((hits / count) * 100).toFixed(0)}%)
            </div>
          </div>
          <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 space-y-1">
            <span className="text-xs font-bold text-error uppercase">Interval yang meleset (merah):</span>
            <div className="text-xl font-extrabold font-mono text-black">{count - hits}</div>
            <span className="text-xs text-on-surface-variant">Diharapkan sekitar {((1 - level / 100) * count).toFixed(1)} interval.</span>
          </div>
        </div>
      </div>

      <Banner title="Arti Sebenarnya dari Confidence Level:">
        Tingkat kepercayaan {level}% adalah sifat dari <strong className="font-semibold text-black">metodenya</strong>: jika sampling diulang berkali-kali, sekitar{' '}
        {level}% interval yang dibuat akan memuat μ. Satu interval yang sudah jadi hanya punya dua kemungkinan: memuat μ atau tidak.
      </Banner>
    </div>
  );
};

// =========================================================================
// 2. CONFIDENCE INTERVAL FOR THE MEAN (SIGMA KNOWN)
// =========================================================================
export const CiSigmaKnownVisual: React.FC = () => {
  const d = confidenceSampleData.riceSigmaKnown;
  const [level, setLevel] = useState<number>(95);
  const [xbar, setXbar] = useState<number>(d.xbar);
  const [n, setN] = useState<number>(d.n);

  const ci = ciMeanSigmaKnown(xbar, d.sigma, n, level);
  const se = standardErrorMean(d.sigma, n);
  const ok = d.targetMu >= ci.lower && d.targetMu <= ci.upper;

  return (
    <div className="space-y-4">
      <LevelTabs value={level} onChange={setLevel} />

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Estimasi Rata-rata Berat Beras (σ = {d.sigma} g diketahui)
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">
            Target pabrik μ = {d.targetMu} g
          </span>
        </div>

        <IntervalLine
          minX={345}
          maxX={385}
          lower={ci.lower}
          upper={ci.upper}
          point={xbar}
          pointLabel={`x̄ = ${xbar.toFixed(1)}`}
          reference={{ x: d.targetMu, label: `${d.targetMu}` }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderCard label="Sample Mean (x̄):" display={`${xbar.toFixed(1)} g`} min={355} max={375} step={0.1} value={xbar} onChange={setXbar} />
          <SliderCard label="Ukuran Sampel (n):" display={`n = ${n}`} min={4} max={100} step={1} value={n} onChange={setN} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Margin of Error:</span>
            <div className="text-lg font-bold font-mono text-black">± {ci.margin.toFixed(2)} g</div>
            <span className="text-xs text-on-surface-variant font-mono">
              {ci.critical} × {d.sigma} / √{n} = {ci.critical} × {se.toFixed(3)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Interval {level}%:</span>
            <div className="text-xl font-extrabold font-mono text-black">
              {ci.lower.toFixed(2)} ≤ μ ≤ {ci.upper.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <Banner title={ok ? 'Target 368 g masih berada di dalam interval' : 'Target 368 g berada di luar interval'}>
        {ok
          ? `Data sampel tidak memberi bukti kuat bahwa rata-rata berat berbeda dari ${d.targetMu} g, sehingga proses pengemasan masih dianggap sesuai.`
          : `Dengan tingkat kepercayaan ${level}%, data sampel memberi bukti bahwa rata-rata berat tidak sama dengan ${d.targetMu} g. Proses pengemasan perlu diperiksa.`}
      </Banner>
    </div>
  );
};

// =========================================================================
// 3. t DISTRIBUTION VS STANDARD NORMAL
// =========================================================================
export const TDistributionVisual: React.FC = () => {
  const [df, setDf] = useState<number>(4);
  const [level, setLevel] = useState<number>(95);
  const tCrit = tCritical(level, df);
  const zCrit = zCritical(level);

  const svgW = 460;
  const minX = -5;
  const maxX = 5;
  const toPx = (x: number) => 30 + ((x - minX) / (maxX - minX)) * (svgW - 60);
  const toPy = (y: number) => 130 - (y / 0.44) * 112;
  const path = (f: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const x = minX + (i / 160) * (maxX - minX);
      pts.push(`${toPx(x).toFixed(1)} ${toPy(f(x)).toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  };

  const tailPath = (from: number, to: number) => {
    const a = Math.max(minX, from);
    const b = Math.min(maxX, to);
    if (b <= a) return '';
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const x = a + (i / 40) * (b - a);
      pts.push(`${toPx(x).toFixed(1)} ${toPy(tPdf(x, df)).toFixed(1)}`);
    }
    return `M ${toPx(a).toFixed(1)} 130 L ${pts.join(' L ')} L ${toPx(b).toFixed(1)} 130 Z`;
  };

  return (
    <div className="space-y-4">
      <LevelTabs value={level} onChange={setLevel} showZ={false} />

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Distribusi t (df = {df}) vs Normal Standar Z
        </div>

        <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 160" className="w-full h-full select-none overflow-visible">
            <path d={tailPath(minX, -tCrit)} fill="#ffdad6" opacity="0.9" />
            <path d={tailPath(tCrit, maxX)} fill="#ffdad6" opacity="0.9" />
            <path d={path((x) => normalPdf(x, 0, 1))} fill="none" stroke="#6e7a74" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d={path((x) => tPdf(x, df))} fill="none" stroke="#00614d" strokeWidth="2.5" />
            <line x1="20" y1="130" x2="440" y2="130" stroke="#191c1c" strokeWidth="1.5" />
            {[-4, -2, 0, 2, 4].map((t) => (
              <g key={t}>
                <line x1={toPx(t)} y1="127" x2={toPx(t)} y2="133" stroke="#191c1c" strokeWidth="1.5" />
                <text x={toPx(t)} y="148" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                  {t}
                </text>
              </g>
            ))}
            {tCrit <= maxX && (
              <g>
                <line x1={toPx(tCrit)} y1="22" x2={toPx(tCrit)} y2="130" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="3 3" />
                <text x={toPx(tCrit)} y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ba1a1a" fontFamily="monospace">
                  t = {tCrit.toFixed(3)}
                </text>
              </g>
            )}
          </svg>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-on-surface">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-[#6e7a74]" /> Normal standar Z
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-[#00614d]" /> Distribusi t (df = {df})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-[#ffdad6]" /> Ekor α/2 di tiap sisi
          </span>
        </div>

        <SliderCard label="Degrees of Freedom (df = n − 1):" display={`df = ${df}`} min={1} max={100} step={1} value={df} onChange={setDf} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Nilai kritis t (α/2 = {((1 - level / 100) / 2).toFixed(3)}):</span>
            <div className="text-xl font-extrabold font-mono text-black">t = {tCrit.toFixed(4)}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Bandingkan dengan nilai kritis Z:</span>
            <div className="text-xl font-extrabold font-mono text-black">Z = {zCrit}</div>
            <span className="text-xs text-on-surface-variant">t lebih besar {(((tCrit - zCrit) / zCrit) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <Banner title="Ekor Lebih Tebal, Interval Lebih Lebar:">
        Karena S hanyalah estimasi dari σ, distribusi t memiliki ekor lebih tebal daripada Z sehingga nilai kritisnya lebih besar. Semakin besar df, distribusi t
        semakin mirip normal standar (df = 99 → t = 1.9842, hampir sama dengan Z = 1.96).
      </Banner>
    </div>
  );
};

// =========================================================================
// 4. CONFIDENCE INTERVAL FOR THE MEAN (SIGMA UNKNOWN)
// =========================================================================
export const CiSigmaUnknownVisual: React.FC = () => {
  const d = confidenceSampleData.canteenSigmaUnknown;
  const [level, setLevel] = useState<number>(95);
  const [n, setN] = useState<number>(d.n);

  const ciT = ciMeanSigmaUnknown(d.xbar, d.s, n, level);
  const ciZ = ciMeanSigmaKnown(d.xbar, d.s, n, level);
  const se = standardErrorMean(d.s, n);

  return (
    <div className="space-y-4">
      <LevelTabs value={level} onChange={setLevel} showZ={false} />

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Nilai Transaksi Kantin: x̄ = {d.xbar}, S = {d.s} (ribu rupiah)
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">df = {n - 1}</span>
        </div>

        <IntervalLine minX={80} maxX={140} lower={ciT.lower} upper={ciT.upper} point={d.xbar} pointLabel={`x̄ = ${d.xbar}`} />

        <SliderCard label="Ukuran Sampel (n):" display={`n = ${n}`} min={2} max={120} step={1} value={n} onChange={setN} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Interval t (benar, σ tidak diketahui):</span>
            <div className="text-lg font-extrabold font-mono text-black">
              {ciT.lower.toFixed(2)} ≤ μ ≤ {ciT.upper.toFixed(2)}
            </div>
            <span className="text-xs text-primary font-mono font-bold">
              {d.xbar} ± {ciT.critical.toFixed(4)} × {se.toFixed(3)} = {d.xbar} ± {ciT.margin.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Jika keliru memakai Z = {ciZ.critical}:</span>
            <div className="text-lg font-bold font-mono text-black">
              {ciZ.lower.toFixed(2)} ≤ μ ≤ {ciZ.upper.toFixed(2)}
            </div>
            <span className="text-xs text-on-surface-variant">
              Terlalu sempit {(((ciT.margin - ciZ.margin) / ciT.margin) * 100).toFixed(1)}%, sehingga tingkat kepercayaan sebenarnya di bawah {level}%.
            </span>
          </div>
        </div>
      </div>

      <Banner title="Coba Perkecil n:">
        Pada n kecil, perbedaan t dan Z sangat terasa. Asumsinya: populasi berdistribusi kira-kira normal, atau n cukup besar sehingga Central Limit Theorem berlaku.
      </Banner>
    </div>
  );
};

// =========================================================================
// 5. CONFIDENCE INTERVAL FOR THE PROPORTION
// =========================================================================
export const CiProportionVisual: React.FC = () => {
  const d = confidenceSampleData.scholarshipForms;
  const [level, setLevel] = useState<number>(95);
  const [n, setN] = useState<number>(d.n);
  const [x, setX] = useState<number>(d.x);

  const safeX = Math.min(x, n);
  const ci = ciProportion(safeX, n, level);
  const okX = safeX > 5;
  const okNX = n - safeX > 5;

  return (
    <div className="space-y-4">
      <LevelTabs value={level} onChange={setLevel} />

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Proporsi Formulir Beasiswa yang Mengandung Kesalahan
        </div>

        <IntervalLine
          minX={0}
          maxX={0.5}
          lower={Math.max(0, ci.lower)}
          upper={ci.upper}
          point={ci.p}
          pointLabel={`p = ${ci.p.toFixed(3)}`}
          format={(v) => v.toFixed(3)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SliderCard label="Formulir bermasalah (X):" display={`X = ${safeX}`} min={1} max={Math.min(60, n)} step={1} value={safeX} onChange={setX} />
          <SliderCard label="Ukuran Sampel (n):" display={`n = ${n}`} min={20} max={400} step={10} value={n} onChange={setN} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Standard error estimasi:</span>
            <div className="text-lg font-bold font-mono text-black">{ci.se.toFixed(4)}</div>
            <span className="text-xs text-on-surface-variant font-mono">
              √({ci.p.toFixed(3)} × {(1 - ci.p).toFixed(3)} / {n})
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Interval {level}% untuk π:</span>
            <div className="text-lg font-extrabold font-mono text-black">
              {Math.max(0, ci.lower).toFixed(4)} ≤ π ≤ {ci.upper.toFixed(4)}
            </div>
            <span className="text-xs text-primary font-mono font-bold">
              {ci.p.toFixed(3)} ± {ci.margin.toFixed(4)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { ok: okX, label: `X = ${safeX}` },
            { ok: okNX, label: `n − X = ${n - safeX}` },
          ].map((c, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                c.ok ? 'bg-primary-fixed/30 border-primary/30 text-black' : 'bg-error-container/40 border-error/30 text-error'
              }`}
            >
              <span>{c.label}</span>
              <span className="font-bold">{c.ok ? '> 5 ✓' : '≤ 5 ✗'}</span>
            </div>
          ))}
        </div>
      </div>

      <Banner title="Kenapa Memakai p di Dalam Akar?">
        Rumus standard error proporsi idealnya memakai π, tetapi π justru yang sedang diestimasi (tidak diketahui). Karena itu, π di dalam akar diganti dengan sample
        proportion p. Rumus ini layak dipakai jika X &gt; 5 dan n − X &gt; 5.
      </Banner>
    </div>
  );
};

// =========================================================================
// 6. DETERMINING SAMPLE SIZE (MEAN & PROPORTION)
// =========================================================================
export const SampleSizeVisual: React.FC<{ initialMode: 'mean' | 'proportion' }> = ({ initialMode }) => {
  const defaults = confidenceSampleData.sampleSize;
  const [mode, setMode] = useState<'mean' | 'proportion'>(initialMode);
  const [level, setLevel] = useState<number>(95);
  const [sigma, setSigma] = useState<number>(defaults.mean.sigma);
  const [e, setE] = useState<number>(defaults.mean.e);
  const [pi, setPi] = useState<number>(defaults.proportion.pi);
  const [eP, setEP] = useState<number>(defaults.proportion.e);

  const result = mode === 'mean' ? sampleSizeMean(level, sigma, e) : sampleSizeProportion(level, pi, eP);
  const others = LEVELS.map((l) => ({
    l,
    n: (mode === 'mean' ? sampleSizeMean(l, sigma, e) : sampleSizeProportion(l, pi, eP)).n,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        <button type="button" onClick={() => setMode('mean')} className={tabClass(mode === 'mean')}>
          Sample Size untuk Mean
        </button>
        <button type="button" onClick={() => setMode('proportion')} className={tabClass(mode === 'proportion')}>
          Sample Size untuk Proporsi
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <LevelTabs value={level} onChange={setLevel} />

        {mode === 'mean' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SliderCard label="Standar deviasi (σ):" display={`σ = ${sigma}`} min={5} max={40} step={1} value={sigma} onChange={setSigma} />
            <SliderCard label="Margin of error (e):" display={`e = ± ${e}`} min={1} max={10} step={0.5} value={e} onChange={setE} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SliderCard label="Perkiraan proporsi (π):" display={`π = ${pi.toFixed(2)}`} min={0.05} max={0.95} step={0.05} value={pi} onChange={setPi} />
            <SliderCard label="Margin of error (e):" display={`e = ± ${eP.toFixed(2)}`} min={0.01} max={0.1} step={0.01} value={eP} onChange={setEP} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Hasil hitung mentah:</span>
            <div className="text-lg font-bold font-mono text-black">n = {result.raw.toFixed(2)}</div>
            <span className="text-xs text-on-surface-variant font-mono">
              {mode === 'mean'
                ? `(${result.z}² × ${sigma}²) / ${e}²`
                : `(${result.z}² × ${pi.toFixed(2)} × ${(1 - pi).toFixed(2)}) / ${eP.toFixed(2)}²`}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Sample size (selalu bulatkan ke atas):</span>
            <div className="text-2xl font-extrabold font-mono text-black">n = {result.n}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {others.map((o) => (
            <div
              key={o.l}
              className={`p-2 rounded-xl border flex flex-col items-center ${
                o.l === level ? 'bg-primary-fixed border-2 border-primary-container' : 'bg-surface-container-lowest border-outline-variant/60'
              }`}
            >
              <span className="text-xs font-mono text-on-surface">{o.l}%</span>
              <span className="text-sm font-bold font-mono text-black">n = {o.n}</span>
            </div>
          ))}
        </div>
      </div>

      <Banner title="Tiga Hal yang Menaikkan Sample Size:">
        Margin of error lebih kecil (e ada di penyebut dan dikuadratkan: e dibagi 2 → n hampir 4×), confidence level lebih tinggi (Z lebih besar), dan variasi
        populasi lebih besar ({mode === 'mean' ? 'σ besar' : 'π mendekati 0.5'}).
      </Banner>
    </div>
  );
};

// =========================================================================
// ROUTER FOR CONFIDENCE INTERVAL VISUALS
// =========================================================================
export const ConfidenceIntervalVisuals: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'ci-coverage':
      return <CiCoverageVisual />;
    case 'ci-sigma-known':
      return <CiSigmaKnownVisual />;
    case 't-distribution':
      return <TDistributionVisual />;
    case 'ci-sigma-unknown':
      return <CiSigmaUnknownVisual />;
    case 'ci-proportion':
      return <CiProportionVisual />;
    case 'sample-size-mean':
      return <SampleSizeVisual initialMode="mean" />;
    case 'sample-size-proportion':
      return <SampleSizeVisual initialMode="proportion" />;
    default:
      return null;
  }
};
