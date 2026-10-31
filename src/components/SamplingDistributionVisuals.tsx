import React, { useMemo, useState } from 'react';
import { normalCdf, normalPdf } from '../data/continuousSampleData';
import {
  samplingSampleData,
  standardErrorMean,
  zSampleMean,
  xbarFromZ,
  standardErrorProportion,
  zSampleProportion,
  populationMean,
  populationSd,
  mulberry32,
} from '../data/samplingSampleData';

// =========================================================================
// SHARED: NORMAL CURVE SVG (viewBox 460 x 160, baseline y = 130)
// =========================================================================
interface BellCurveProps {
  mu: number;
  sd: number;
  minX: number;
  maxX: number;
  ticks: number[];
  tickFormat?: (v: number) => string;
  shadeFrom?: number;
  shadeTo?: number;
  ghostSd?: number;
  yMax?: number;
  markers?: { x: number; label: string; color: string }[];
  centerLabel?: string;
}

export const BellCurve: React.FC<BellCurveProps> = ({
  mu,
  sd,
  minX,
  maxX,
  ticks,
  tickFormat = (v) => String(v),
  shadeFrom,
  shadeTo,
  ghostSd,
  yMax,
  markers = [],
  centerLabel,
}) => {
  const svgW = 460;
  const toPx = (x: number) => 30 + ((x - minX) / (maxX - minX)) * (svgW - 60);
  const peak = yMax ?? normalPdf(mu, mu, sd) * 1.1;
  const toPy = (y: number) => 130 - (y / peak) * 112;

  const buildPath = (s: number, from: number, to: number) => {
    const steps = 120;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const x = from + (i / steps) * (to - from);
      pts.push(`${toPx(x).toFixed(1)} ${Math.max(8, toPy(normalPdf(x, mu, s))).toFixed(1)}`);
    }
    return pts;
  };

  const curve = buildPath(sd, minX, maxX);
  const ghost = ghostSd ? buildPath(ghostSd, minX, maxX) : null;

  let shaded = '';
  if (shadeFrom !== undefined && shadeTo !== undefined) {
    const from = Math.max(minX, shadeFrom);
    const to = Math.min(maxX, shadeTo);
    if (to > from) {
      const pts = buildPath(sd, from, to);
      shaded = `M ${toPx(from).toFixed(1)} 130 L ${pts.join(' L ')} L ${toPx(to).toFixed(1)} 130 Z`;
    }
  }

  return (
    <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
      <svg viewBox="0 0 460 160" className="w-full h-full select-none overflow-visible">
        {ghost && (
          <path d={`M ${ghost.join(' L ')}`} fill="none" stroke="#6e7a74" strokeWidth="1.5" strokeDasharray="4 4" />
        )}
        {shaded && <path d={shaded} fill="#97f4d5" opacity="0.85" />}
        <path d={`M ${curve.join(' L ')}`} fill="none" stroke="#00614d" strokeWidth="2.5" />

        <line x1="20" y1="130" x2="440" y2="130" stroke="#191c1c" strokeWidth="1.5" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toPx(t)} y1="127" x2={toPx(t)} y2="133" stroke="#191c1c" strokeWidth="1.5" />
            <text x={toPx(t)} y="148" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
              {tickFormat(t)}
            </text>
          </g>
        ))}

        {markers
          .filter((m) => m.x >= minX && m.x <= maxX)
          .map((m, i) => (
            <g key={i}>
              <line x1={toPx(m.x)} y1="22" x2={toPx(m.x)} y2="130" stroke={m.color} strokeWidth="2" strokeDasharray="3 3" />
              <text x={toPx(m.x)} y="16" textAnchor="middle" fontSize="11" fontWeight="bold" fill={m.color} fontFamily="monospace">
                {m.label}
              </text>
            </g>
          ))}

        {centerLabel && (
          <text x={toPx(mu)} y="100" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#002118">
            {centerLabel}
          </text>
        )}
      </svg>
    </div>
  );
};

export const tabClass = (active: boolean) =>
  `px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
    active ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
  }`;

// =========================================================================
// 1. SAMPLING DISTRIBUTION CONCEPT (ALL 16 SAMPLES OF n = 2)
// =========================================================================
export const SamplingConceptVisual: React.FC = () => {
  const data = samplingSampleData.typoPopulation;
  const samples = data.allSamples;
  const [revealed, setRevealed] = useState<number>(4);

  const shown = samples.slice(0, revealed);
  const runningMean = shown.length ? populationMean(shown.map((s) => s.mean)) : 0;

  const possibleMeans = [1, 1.5, 2, 2.5, 3, 3.5, 4];
  const freq = possibleMeans.map((m) => shown.filter((s) => s.mean === m).length);

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Populasi (N = 4): Jumlah Typo Laporan Mingguan
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {data.names.map((name, i) => (
            <div key={name} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 flex flex-col items-center">
              <span className="text-xs text-on-surface-variant">{name}</span>
              <span className="text-lg font-bold font-mono text-black">{data.values[i]}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-fixed/30 border border-primary/30 text-xs space-y-1">
            <span className="font-bold text-primary uppercase">Population Mean (μ)</span>
            <div className="font-mono text-sm text-black font-bold">μ = (3 + 2 + 1 + 4) / 4 = {data.mu.toFixed(2)}</div>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border border-primary/30 text-xs space-y-1">
            <span className="font-bold text-primary uppercase">Population SD (σ)</span>
            <div className="font-mono text-sm text-black font-bold">σ = √(5 / 4) = {data.sigma.toFixed(4)}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Semua 4 × 4 = 16 Kemungkinan Sampel (n = 2, dengan pengembalian):
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setRevealed((r) => Math.min(16, r + 1))} className={tabClass(false)}>
              + Ambil Sampel
            </button>
            <button type="button" onClick={() => setRevealed(16)} className={tabClass(revealed === 16)}>
              Tampilkan Semua
            </button>
            <button type="button" onClick={() => setRevealed(0)} className={tabClass(false)}>
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {samples.map((s, i) => {
            const isShown = i < revealed;
            return (
              <div
                key={i}
                className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                  isShown
                    ? 'bg-surface-container-lowest border-outline-variant/60'
                    : 'bg-surface-container-low/40 border-outline-variant/30 opacity-70'
                }`}
              >
                <span className="text-xs font-mono text-on-surface">
                  ({s.pair[0]}, {s.pair[1]})
                </span>
                <span className="text-sm font-bold font-mono text-black">{isShown ? `x̄ = ${s.mean.toFixed(1)}` : '...'}</span>
              </div>
            );
          })}
        </div>

        {/* Frequency bars of sample means */}
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
          <div className="text-xs font-semibold text-on-surface">Sampling Distribution of the Mean (frekuensi x̄):</div>
          <div className="grid grid-cols-7 gap-2 items-end h-28">
            {possibleMeans.map((m, i) => (
              <div key={m} className="flex flex-col items-center justify-end h-full">
                <span className="text-xs font-mono font-bold text-black">{freq[i]}</span>
                <div
                  className={`w-full rounded-t transition-all ${m === 2.5 ? 'bg-primary' : 'bg-primary/50'}`}
                  style={{ height: `${freq[i] * 18}px` }}
                />
                <span className="text-xs font-mono text-on-surface mt-1">{m.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Rata-rata dari {revealed} sample mean:</span>
            <div className="text-lg font-bold font-mono text-black">{revealed ? runningMean.toFixed(4) : '—'}</div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Standar deviasi seluruh sample mean:</span>
            <div className="text-lg font-bold font-mono text-black">
              {revealed === 16 ? populationSd(samples.map((s) => s.mean)).toFixed(4) : 'Tampilkan semua dulu'}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Kesimpulan: Sample Mean bersifat Unbiased</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Rata-rata dari ke-16 sample mean = <strong className="font-semibold text-black">{data.meanOfSampleMeans.toFixed(2)}</strong>, sama persis dengan μ ={' '}
          {data.mu.toFixed(2)}. Standar deviasi ke-16 sample mean ({data.sdOfSampleMeans.toFixed(4)}) sama dengan σ / √n = {data.sigma.toFixed(4)} / √2 ={' '}
          {data.standardError.toFixed(4)}, inilah <strong className="font-semibold text-black">standard error of the mean</strong>.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 2. STANDARD ERROR OF THE MEAN
// =========================================================================
export const StandardErrorVisual: React.FC = () => {
  const { mu, sigma } = samplingSampleData.riceFill;
  const [n, setN] = useState<number>(25);
  const se = standardErrorMean(sigma, n);
  const benchmarks = [1, 4, 16, 25, 64, 100];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Berat Kemasan Beras: μ = {mu} g, σ = {sigma} g
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">
            σ<sub>x̄</sub> = {sigma} / √{n} = {se.toFixed(3)} g
          </span>
        </div>

        <BellCurve
          mu={mu}
          sd={se}
          ghostSd={sigma}
          minX={mu - 45}
          maxX={mu + 45}
          ticks={[323, 338, 353, 368, 383, 398, 413]}
          yMax={normalPdf(mu, mu, standardErrorMean(sigma, 100)) * 1.05}
        />
        <div className="flex flex-wrap gap-4 text-xs text-on-surface">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-[#6e7a74]" /> Populasi (satu kemasan, σ = {sigma})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-[#00614d]" /> Distribusi x̄ (n = {n}, σ<sub>x̄</sub> = {se.toFixed(2)})
          </span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-on-surface">Ukuran Sampel (n):</span>
            <span className="font-mono font-bold text-black">n = {n}</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {benchmarks.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setN(b)}
              className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                n === b
                  ? 'bg-primary-fixed border-2 border-primary-container scale-105'
                  : 'bg-surface-container-lowest border-outline-variant/60 hover:bg-surface-container-low'
              }`}
            >
              <span className="text-xs font-mono text-on-surface">n = {b}</span>
              <span className="text-sm font-bold font-mono text-black">{standardErrorMean(sigma, b).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Perhatikan Pola Akar Kuadrat:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Standard error turun sebanding dengan <strong className="font-semibold text-black">1 / √n</strong>, bukan 1 / n. Untuk membuat standard error
          menjadi <strong className="font-semibold text-black">setengahnya</strong>, ukuran sampel harus dinaikkan{' '}
          <strong className="font-semibold text-black">4 kali lipat</strong> (n = 25 → SE = 3; n = 100 → SE = 1.5).
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 3. CENTRAL LIMIT THEOREM SIMULATION
// =========================================================================
type PopShape = 'normal' | 'uniform' | 'skewed';

const POPULATIONS: Record<PopShape, { label: string; mu: number; sigma: number; min: number; max: number; seed: number }> = {
  normal: { label: 'Normal', mu: 50, sigma: 10, min: 10, max: 90, seed: 11 },
  uniform: { label: 'Uniform (simetris)', mu: 50, sigma: 100 / Math.sqrt(12), min: 0, max: 100, seed: 23 },
  skewed: { label: 'Eksponensial (sangat menceng kanan)', mu: 20, sigma: 20, min: 0, max: 100, seed: 37 },
};

function drawFrom(shape: PopShape, rand: () => number): number {
  const u = rand();
  if (shape === 'uniform') return u * 100;
  if (shape === 'skewed') return -20 * Math.log(1 - u);
  // Box-Muller for normal(50, 10)
  const u2 = rand();
  return 50 + 10 * Math.sqrt(-2 * Math.log(1 - u)) * Math.cos(2 * Math.PI * u2);
}

export const CentralLimitVisual: React.FC = () => {
  const [shape, setShape] = useState<PopShape>('skewed');
  const [n, setN] = useState<number>(1);
  const sizes = [1, 2, 5, 10, 30, 50];
  const sims = 2000;
  const bins = 25;
  const pop = POPULATIONS[shape];

  const { counts, simMean, simSd } = useMemo(() => {
    const rand = mulberry32(pop.seed * 1000 + n);
    const means: number[] = [];
    for (let s = 0; s < sims; s++) {
      let sum = 0;
      for (let i = 0; i < n; i++) sum += drawFrom(shape, rand);
      means.push(sum / n);
    }
    const c = new Array(bins).fill(0);
    const w = (pop.max - pop.min) / bins;
    for (const m of means) {
      const idx = Math.floor((m - pop.min) / w);
      if (idx >= 0 && idx < bins) c[idx]++;
    }
    return { counts: c as number[], simMean: populationMean(means), simSd: populationSd(means) };
  }, [shape, n, pop]);

  const se = standardErrorMean(pop.sigma, n);
  const binW = (pop.max - pop.min) / bins;
  const expectedPeak = sims * binW * normalPdf(pop.mu, pop.mu, se);
  const yMax = Math.max(...counts, expectedPeak) * 1.1;

  const svgW = 460;
  const toPx = (x: number) => 30 + ((x - pop.min) / (pop.max - pop.min)) * (svgW - 60);
  const toPy = (c: number) => 130 - (c / yMax) * 112;

  const overlay: string[] = [];
  for (let i = 0; i <= 150; i++) {
    const x = pop.min + (i / 150) * (pop.max - pop.min);
    overlay.push(`${toPx(x).toFixed(1)} ${toPy(sims * binW * normalPdf(x, pop.mu, se)).toFixed(1)}`);
  }

  let verdict: string;
  if (shape === 'normal') verdict = 'Populasi normal → distribusi x̄ selalu normal untuk n berapa pun.';
  else if (shape === 'uniform') verdict = n >= 5 ? 'Populasi simetris & n ≥ 5 → distribusi x̄ sudah mendekati normal.' : 'Populasi simetris: tunggu sampai n ≥ 5.';
  else verdict = n >= 30 ? 'Populasi menceng & n ≥ 30 → distribusi x̄ sudah mendekati normal (CLT).' : 'Populasi sangat menceng: butuh n ≥ 30 agar distribusi x̄ mendekati normal.';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        {(Object.keys(POPULATIONS) as PopShape[]).map((k) => (
          <button key={k} type="button" onClick={() => setShape(k)} className={tabClass(shape === k)}>
            Populasi {POPULATIONS[k].label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Histogram {sims.toLocaleString('id-ID')} Sample Mean (n = {n})
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">
            μ = {pop.mu}, σ = {pop.sigma.toFixed(2)}
          </span>
        </div>

        <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 160" className="w-full h-full select-none overflow-visible">
            {counts.map((c, i) => {
              const x1 = toPx(pop.min + i * binW);
              const x2 = toPx(pop.min + (i + 1) * binW);
              return (
                <rect key={i} x={x1 + 0.5} y={toPy(c)} width={Math.max(0, x2 - x1 - 1)} height={130 - toPy(c)} fill="#97f4d5" stroke="#00614d" strokeWidth="0.8" />
              );
            })}
            {n > 1 && <path d={`M ${overlay.join(' L ')}`} fill="none" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="5 3" />}
            <line x1="20" y1="130" x2="440" y2="130" stroke="#191c1c" strokeWidth="1.5" />
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const t = pop.min + f * (pop.max - pop.min);
              return (
                <g key={f}>
                  <line x1={toPx(t)} y1="127" x2={toPx(t)} y2="133" stroke="#191c1c" strokeWidth="1.5" />
                  <text x={toPx(t)} y="148" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                    {t}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs text-on-surface-variant">
          {n === 1
            ? 'Dengan n = 1, setiap "sample mean" hanyalah satu nilai, jadi histogram ini menunjukkan bentuk populasi aslinya.'
            : 'Garis merah putus-putus = kurva normal dengan mean μ dan standard error σ / √n yang diprediksi oleh CLT.'}
        </p>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-on-surface">Pilih ukuran sampel (n):</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setN(s)}
                className={`p-2 rounded-xl border text-sm font-bold font-mono transition-all ${
                  n === s
                    ? 'bg-primary-fixed border-2 border-primary-container text-black scale-105'
                    : 'bg-surface-container-lowest border-outline-variant/60 text-black hover:bg-surface-container-low'
                }`}
              >
                n = {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Rata-rata simulasi x̄ vs μ:</span>
            <div className="text-lg font-bold font-mono text-black">
              {simMean.toFixed(2)} ≈ {pop.mu}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">SD simulasi x̄ vs σ / √n:</span>
            <div className="text-lg font-bold font-mono text-black">
              {simSd.toFixed(2)} ≈ {se.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Status Central Limit Theorem:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">{verdict}</p>
      </div>
    </div>
  );
};

// =========================================================================
// 4. Z FOR THE SAMPLE MEAN (INDIVIDUAL VS SAMPLE MEAN)
// =========================================================================
export const SampleMeanZVisual: React.FC = () => {
  const { mu, sigma } = samplingSampleData.riceFill;
  const [xbar, setXbar] = useState<number>(365);
  const [n, setN] = useState<number>(25);
  const [dir, setDir] = useState<'less' | 'greater'>('less');

  const se = standardErrorMean(sigma, n);
  const zMean = zSampleMean(xbar, mu, sigma, n);
  const zInd = (xbar - mu) / sigma;
  const pMean = dir === 'less' ? normalCdf(zMean) : 1 - normalCdf(zMean);
  const pInd = dir === 'less' ? normalCdf(zInd) : 1 - normalCdf(zInd);
  const sym = dir === 'less' ? '<' : '>';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        <button type="button" onClick={() => setDir('less')} className={tabClass(dir === 'less')}>
          P(X̄ &lt; batas)
        </button>
        <button type="button" onClick={() => setDir('greater')} className={tabClass(dir === 'greater')}>
          P(X̄ &gt; batas)
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Sampling Distribution x̄ Berat Beras (μ = {mu}, σ = {sigma}, n = {n})
        </div>

        <BellCurve
          mu={mu}
          sd={se}
          ghostSd={sigma}
          minX={mu - 20}
          maxX={mu + 20}
          ticks={[350, 356, 362, 368, 374, 380, 386]}
          shadeFrom={dir === 'less' ? mu - 100 : xbar}
          shadeTo={dir === 'less' ? xbar : mu + 100}
          markers={[{ x: xbar, label: `x̄ = ${xbar}`, color: '#ba1a1a' }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Sample Mean (x̄):</span>
              <span className="font-mono font-bold text-error">{xbar} g</span>
            </div>
            <input type="range" min="355" max="381" step="1" value={xbar} onChange={(e) => setXbar(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Ukuran Sampel (n):</span>
              <span className="font-mono font-bold text-black">n = {n}</span>
            </div>
            <input type="range" min="1" max="100" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Satu kemasan saja: P(X {sym} {xbar})</span>
            <div className="text-lg font-bold font-mono text-black">{(pInd * 100).toFixed(2)}%</div>
            <span className="text-xs text-on-surface-variant font-mono">
              Z = ({xbar} − {mu}) / {sigma} = {zInd.toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Rata-rata {n} kemasan: P(X̄ {sym} {xbar})</span>
            <div className="text-xl font-extrabold font-mono text-black">{(pMean * 100).toFixed(2)}%</div>
            <span className="text-xs text-primary font-mono font-bold">
              Z = ({xbar} − {mu}) / ({sigma} / √{n}) = {zMean.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Kenapa Peluangnya Berbeda?</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Satu kemasan bisa saja jauh dari rata-rata, tetapi <strong className="font-semibold text-black">rata-rata dari banyak kemasan</strong> jauh lebih stabil.
          Karena itu Z untuk x̄ dibagi dengan <strong className="font-semibold text-black">σ / √n</strong> (bukan σ), sehingga nilai x̄ yang jauh dari μ menjadi lebih jarang terjadi.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 5. FINDING X-BAR (INTERVAL AROUND MU)
// =========================================================================
export const SampleMeanIntervalVisual: React.FC = () => {
  const { mu, sigma } = samplingSampleData.riceFill;
  const levels = [
    { pct: 90, z: 1.645 },
    { pct: 95, z: 1.96 },
    { pct: 99, z: 2.576 },
  ];
  const [levelIdx, setLevelIdx] = useState<number>(1);
  const [n, setN] = useState<number>(25);
  const { pct, z } = levels[levelIdx];

  const se = standardErrorMean(sigma, n);
  const lower = xbarFromZ(mu, -z, sigma, n);
  const upper = xbarFromZ(mu, z, sigma, n);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        {levels.map((l, i) => (
          <button key={l.pct} type="button" onClick={() => setLevelIdx(i)} className={tabClass(levelIdx === i)}>
            {l.pct}% Sample Mean (Z = ±{l.z})
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Interval yang Memuat {pct}% Sample Mean di Sekitar μ = {mu}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">σ<sub>x̄</sub> = {se.toFixed(3)}</span>
        </div>

        <BellCurve
          mu={mu}
          sd={se}
          minX={mu - 20}
          maxX={mu + 20}
          ticks={[350, 356, 362, 368, 374, 380, 386]}
          shadeFrom={lower}
          shadeTo={upper}
          centerLabel={`${pct}%`}
          markers={[
            { x: lower, label: lower.toFixed(2), color: '#ba1a1a' },
            { x: upper, label: upper.toFixed(2), color: '#ba1a1a' },
          ]}
        />

        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-on-surface">Ukuran Sampel (n):</span>
            <span className="font-mono font-bold text-black">n = {n}</span>
          </div>
          <input type="range" min="4" max="100" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Batas Bawah (Z = −{z}):</span>
            <div className="text-lg font-bold font-mono text-black">{lower.toFixed(2)} g</div>
            <span className="text-xs text-on-surface-variant font-mono">
              {mu} + (−{z})({sigma} / √{n}) = {mu} − {(z * se).toFixed(2)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Batas Atas (Z = +{z}):</span>
            <div className="text-lg font-bold font-mono text-black">{upper.toFixed(2)} g</div>
            <span className="text-xs text-on-surface-variant font-mono">
              {mu} + ({z})({sigma} / √{n}) = {mu} + {(z * se).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Interpretasi:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Jika diambil banyak sampel berukuran n = {n}, sekitar <strong className="font-semibold text-black">{pct}%</strong> dari sample mean akan jatuh di antara{' '}
          <strong className="font-semibold text-black">
            {lower.toFixed(2)} g dan {upper.toFixed(2)} g
          </strong>
          . Ide ini adalah fondasi confidence interval di bab berikutnya.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 6. SAMPLE PROPORTION & STANDARD ERROR OF THE PROPORTION
// =========================================================================
export const SampleProportionVisual: React.FC = () => {
  const [pi, setPi] = useState<number>(0.5);
  const [n, setN] = useState<number>(100);
  const [draw, setDraw] = useState<number>(1);

  const dots = useMemo(() => {
    const rand = mulberry32(draw * 7919 + n);
    return Array.from({ length: n }, () => rand() < pi);
  }, [draw, n, pi]);

  const x = dots.filter(Boolean).length;
  const p = x / n;
  const se = standardErrorProportion(pi, n);
  const okSuccess = n * pi >= 5;
  const okFailure = n * (1 - pi) >= 5;

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Sampel {n} Mahasiswa: Memilih Kuliah Hybrid?
          </div>
          <button type="button" onClick={() => setDraw((d) => d + 1)} className={tabClass(true)}>
            Ambil Sampel Baru
          </button>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40">
          <div className="flex flex-wrap gap-1">
            {dots.map((yes, i) => (
              <span key={i} className={`inline-block w-3 h-3 rounded-full ${yes ? 'bg-primary' : 'bg-outline-variant/60'}`} />
            ))}
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-on-surface mt-2">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-primary" /> Memilih hybrid (sukses)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-full bg-outline-variant/60" /> Tidak
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Proporsi Populasi (π):</span>
              <span className="font-mono font-bold text-black">π = {pi.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="0.95" step="0.05" value={pi} onChange={(e) => setPi(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Ukuran Sampel (n):</span>
              <span className="font-mono font-bold text-black">n = {n}</span>
            </div>
            <input type="range" min="20" max="200" step="10" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Sample Proportion (p):</span>
            <div className="text-xl font-extrabold font-mono text-black">
              p = {x} / {n} = {p.toFixed(3)}
            </div>
            <span className="text-xs text-on-surface-variant">Berubah setiap kali sampel baru diambil.</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs font-bold text-on-surface uppercase">Standard Error (σ<sub>p</sub>):</span>
            <div className="text-xl font-extrabold font-mono text-black">{se.toFixed(4)}</div>
            <span className="text-xs text-on-surface-variant font-mono">
              √({pi.toFixed(2)} × {(1 - pi).toFixed(2)} / {n})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { ok: okSuccess, label: `nπ = ${n} × ${pi.toFixed(2)} = ${(n * pi).toFixed(1)}` },
            { ok: okFailure, label: `n(1 − π) = ${n} × ${(1 - pi).toFixed(2)} = ${(n * (1 - pi)).toFixed(1)}` },
          ].map((c, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between ${
                c.ok ? 'bg-primary-fixed/30 border-primary/30 text-black' : 'bg-error-container/40 border-error/30 text-error'
              }`}
            >
              <span>{c.label}</span>
              <span className="font-bold">{c.ok ? '≥ 5 ✓' : '< 5 ✗'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Syarat Pendekatan Normal:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Sampling distribution of the proportion boleh didekati distribusi normal jika <strong className="font-semibold text-black">nπ ≥ 5</strong> dan{' '}
          <strong className="font-semibold text-black">n(1 − π) ≥ 5</strong>. {okSuccess && okFailure ? 'Kedua syarat terpenuhi.' : 'Saat ini syarat belum terpenuhi, perbesar n.'}
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 7. Z FOR THE SAMPLE PROPORTION
// =========================================================================
export const ProportionZVisual: React.FC = () => {
  const { pi } = samplingSampleData.hybridPreference;
  const [pVal, setPVal] = useState<number>(0.58);
  const [n, setN] = useState<number>(100);
  const [dir, setDir] = useState<'greater' | 'less'>('greater');

  const se = standardErrorProportion(pi, n);
  const z = zSampleProportion(pVal, pi, n);
  const prob = dir === 'less' ? normalCdf(z) : 1 - normalCdf(z);
  const sym = dir === 'less' ? '<' : '>';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        <button type="button" onClick={() => setDir('greater')} className={tabClass(dir === 'greater')}>
          P(p &gt; batas)
        </button>
        <button type="button" onClick={() => setDir('less')} className={tabClass(dir === 'less')}>
          P(p &lt; batas)
        </button>
      </div>

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Sampling Distribution p (π = {pi.toFixed(2)}, n = {n})
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">σ<sub>p</sub> = {se.toFixed(4)}</span>
        </div>

        <BellCurve
          mu={pi}
          sd={se}
          minX={0.2}
          maxX={0.8}
          ticks={[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]}
          tickFormat={(v) => v.toFixed(1)}
          yMax={normalPdf(pi, pi, standardErrorProportion(pi, 400)) * 1.05}
          shadeFrom={dir === 'less' ? -1 : pVal}
          shadeTo={dir === 'less' ? pVal : 2}
          markers={[{ x: pVal, label: `p = ${pVal.toFixed(2)}`, color: '#ba1a1a' }]}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Sample Proportion (p):</span>
              <span className="font-mono font-bold text-error">{pVal.toFixed(2)}</span>
            </div>
            <input type="range" min="0.3" max="0.7" step="0.01" value={pVal} onChange={(e) => setPVal(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Ukuran Sampel (n):</span>
              <span className="font-mono font-bold text-black">n = {n}</span>
            </div>
            <input type="range" min="25" max="400" step="25" value={n} onChange={(e) => setN(Number(e.target.value))} className="w-full accent-primary cursor-pointer" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Skor Z:</span>
            <div className="text-lg font-bold font-mono text-black">{z.toFixed(2)}</div>
            <span className="text-xs text-on-surface-variant font-mono">
              ({pVal.toFixed(2)} − {pi.toFixed(2)}) / {se.toFixed(4)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">
              P(p {sym} {pVal.toFixed(2)}):
            </span>
            <div className="text-xl font-extrabold font-mono text-black">
              {prob.toFixed(4)} ({(prob * 100).toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Ingat Simbol π di Sini:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Pada rumus proporsi, <strong className="font-semibold text-black">π adalah proporsi populasi</strong> (misalnya 0.50), BUKAN konstanta 3.14159 seperti pada
          rumus PDF normal.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// ROUTER FOR SAMPLING DISTRIBUTION VISUALS
// =========================================================================
export const SamplingDistributionVisuals: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'sampling-distribution-concept':
      return <SamplingConceptVisual />;
    case 'standard-error-mean':
      return <StandardErrorVisual />;
    case 'central-limit-theorem':
      return <CentralLimitVisual />;
    case 'sample-mean-z':
      return <SampleMeanZVisual />;
    case 'sample-mean-interval':
      return <SampleMeanIntervalVisual />;
    case 'sample-proportion':
      return <SampleProportionVisual />;
    case 'proportion-z':
      return <ProportionZVisual />;
    default:
      return null;
  }
};
