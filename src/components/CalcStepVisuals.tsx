import React from 'react';
import { normalCdf, normalPdf, exponentialPdf } from '../data/continuousSampleData';
import { tPdf, tCritical } from '../data/confidenceSampleData';
import { Frame, MiniTable, c, NEW, INK, MUTED, GRID, PRIMARY, FILL } from './StepVisualKit';

// =========================================================================
// CALCULATION STEP PICTURES (Sections 3–8)
// Each picture shows the state AFTER the step, with what the step adds in red.
// Numbers mirror the worked example written in that section's steps.
// =========================================================================

const SOFT = '#97f4d5';
const NEW_SOFT = '#ffdad6';

// ---------- shared primitives ----------

const Chips: React.FC<{ items: { v: React.ReactNode; sub?: React.ReactNode; hl?: boolean; dim?: boolean }[]; sep?: string }> = ({ items, sep }) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {items.map((it, i) => (
      <React.Fragment key={i}>
        {sep && i > 0 && <span className="text-xs font-bold text-on-surface-variant">{sep}</span>}
        <div
          className={`min-w-[40px] px-2 py-1 rounded-lg border text-center font-mono ${
            it.hl ? 'border-2 border-[#ba1a1a] bg-[#ffdad6]/60 text-[#ba1a1a] font-bold' : 'border-outline-variant/60 bg-surface-container-lowest text-black'
          } ${it.dim ? 'opacity-60' : ''}`}
        >
          {it.sub !== undefined && <div className="text-xs font-sans text-on-surface-variant">{it.sub}</div>}
          <div className="text-sm">{it.v}</div>
        </div>
      </React.Fragment>
    ))}
  </div>
);

const Result: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-lg border-2 border-[#ba1a1a] bg-[#ffdad6]/40">
    <span className="text-xs font-bold text-[#ba1a1a]">{label}</span>
    <span className="font-mono font-extrabold text-black text-sm">{value}</span>
  </div>
);

interface LinePoint {
  x: number;
  label?: string;
  color?: string;
  stack?: number;
}
interface Bracket {
  from: number;
  to: number;
  label: string;
  color?: string;
}
// Horizontal number line with dots, markers (vertical labelled lines) and brackets.
const NumLine: React.FC<{
  min: number;
  max: number;
  ticks: number[];
  dots?: LinePoint[];
  markers?: LinePoint[];
  brackets?: Bracket[];
  band?: { from: number; to: number; color?: string };
  fmt?: (v: number) => string;
}> = ({ min, max, ticks, dots = [], markers = [], brackets = [], band, fmt = (v) => String(v) }) => {
  const X = (v: number) => 20 + ((v - min) / (max - min)) * 360;
  const base = 95;
  return (
    <svg viewBox="0 0 400 125" className="w-full h-auto overflow-visible select-none">
      {band && <rect x={X(band.from)} y={base - 55} width={X(band.to) - X(band.from)} height="55" fill={band.color ?? NEW_SOFT} opacity="0.7" />}
      <line x1="15" y1={base} x2="385" y2={base} stroke={MUTED} strokeWidth="1.5" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1={base - 3} x2={X(t)} y2={base + 3} stroke={MUTED} />
          <text x={X(t)} y={base + 15} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="monospace">
            {fmt(t)}
          </text>
        </g>
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={X(d.x)} cy={base - 7 - (d.stack ?? 0) * 12} r="5" fill={d.color ?? FILL} />
          {d.label && (
            <text x={X(d.x)} y={base - 16 - (d.stack ?? 0) * 12} textAnchor="middle" fontSize="9" fontWeight="bold" fill={d.color ?? INK} fontFamily="monospace">
              {d.label}
            </text>
          )}
        </g>
      ))}
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={X(m.x)} y1={base - 62 + (m.stack ?? 0) * 14} x2={X(m.x)} y2={base} stroke={m.color ?? NEW} strokeWidth="2" strokeDasharray="4 3" />
          <text x={X(m.x)} y={base - 66 + (m.stack ?? 0) * 14} textAnchor="middle" fontSize="10" fontWeight="bold" fill={m.color ?? NEW} fontFamily="monospace">
            {m.label}
          </text>
        </g>
      ))}
      {brackets.map((b, i) => (
        <g key={i}>
          <path d={`M ${X(b.from)} ${base + 22} v 6 H ${X(b.to)} v -6`} fill="none" stroke={b.color ?? NEW} strokeWidth="2" />
          <text x={(X(b.from) + X(b.to)) / 2} y={base + 30 + 11} textAnchor="middle" fontSize="10" fontWeight="bold" fill={b.color ?? NEW}>
            {b.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

interface Shade {
  from: number;
  to: number;
  color?: string;
  label?: string;
}
// Density curve with shaded regions, vertical markers and an optional second (Z) axis.
const Curve: React.FC<{
  f: (x: number) => number;
  xMin: number;
  xMax: number;
  yMax?: number;
  ticks: number[];
  fmt?: (v: number) => string;
  shades?: Shade[];
  markers?: LinePoint[];
  ghost?: (x: number) => number;
  zAxis?: { ticks: { x: number; label: string }[]; title: string; hl?: boolean };
  hlCurve?: boolean;
  rect?: boolean;
}> = ({ f, xMin, xMax, yMax, ticks, fmt = (v) => String(v), shades = [], markers = [], ghost, zAxis, hlCurve, rect }) => {
  const W = 400;
  const X = (v: number) => 20 + ((v - xMin) / (xMax - xMin)) * (W - 40);
  let peak = yMax ?? 0;
  if (!yMax) for (let i = 0; i <= 100; i++) peak = Math.max(peak, f(xMin + (i / 100) * (xMax - xMin)));
  peak *= yMax ? 1 : 1.12;
  const Y = (v: number) => 125 - (v / peak) * 105;
  const path = (g: (x: number) => number, a: number, b: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = a + (i / 120) * (b - a);
      pts.push(`${X(x).toFixed(1)} ${Math.max(6, Y(g(x))).toFixed(1)}`);
    }
    return pts;
  };
  const h = zAxis ? 185 : 150;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} className="w-full h-auto overflow-visible select-none">
      {shades.map((s, i) => {
        const a = Math.max(xMin, s.from);
        const b = Math.min(xMax, s.to);
        if (b <= a) return null;
        return (
          <g key={i}>
            <path d={`M ${X(a)} 125 L ${path(f, a, b).join(' L ')} L ${X(b)} 125 Z`} fill={s.color ?? NEW_SOFT} opacity="0.9" />
            {s.label && (
              <text x={X((a + b) / 2)} y="112" textAnchor="middle" fontSize="11" fontWeight="bold" fill={INK} fontFamily="monospace">
                {s.label}
              </text>
            )}
          </g>
        );
      })}
      {ghost && <path d={`M ${path(ghost, xMin, xMax).join(' L ')}`} fill="none" stroke="#6e7a74" strokeWidth="1.5" strokeDasharray="4 4" />}
      {!rect && <path d={`M ${path(f, xMin, xMax).join(' L ')}`} fill="none" stroke={hlCurve ? NEW : PRIMARY} strokeWidth="2.5" />}
      {rect && <path d={`M ${path(f, xMin, xMax).join(' L ')}`} fill="none" stroke={hlCurve ? NEW : PRIMARY} strokeWidth="2.5" strokeLinejoin="miter" />}
      <line x1="10" y1="125" x2={W - 10} y2="125" stroke={MUTED} strokeWidth="1.5" />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={X(t)} y1="122" x2={X(t)} y2="128" stroke={MUTED} />
          <text x={X(t)} y="140" textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="monospace">
            {fmt(t)}
          </text>
        </g>
      ))}
      {markers.map((m, i) => (
        <g key={i}>
          <line x1={X(m.x)} y1={14 + (m.stack ?? 0) * 13} x2={X(m.x)} y2="125" stroke={m.color ?? NEW} strokeWidth="2" strokeDasharray="4 3" />
          <text x={X(m.x)} y={10 + (m.stack ?? 0) * 13} textAnchor="middle" fontSize="10" fontWeight="bold" fill={m.color ?? NEW} fontFamily="monospace">
            {m.label}
          </text>
        </g>
      ))}
      {zAxis && (
        <g>
          <line x1="10" y1="160" x2={W - 10} y2="160" stroke={zAxis.hl ? NEW : MUTED} strokeWidth={zAxis.hl ? 2 : 1} />
          <text x="12" y="155" fontSize="9" fontWeight="bold" fill={zAxis.hl ? NEW : MUTED}>
            {zAxis.title}
          </text>
          {zAxis.ticks.map((t, i) => (
            <g key={i}>
              <line x1={X(t.x)} y1="157" x2={X(t.x)} y2="163" stroke={zAxis.hl ? NEW : MUTED} />
              <text x={X(t.x)} y="176" textAnchor="middle" fontSize="10" fontWeight="bold" fill={zAxis.hl ? NEW : MUTED} fontFamily="monospace">
                {t.label}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  );
};

// Bar chart of a discrete distribution
const Bars: React.FC<{ items: { x: number; p: number }[]; hl?: (x: number) => boolean; outline?: (x: number) => boolean; showValues?: boolean; noBars?: boolean; yMax?: number }> = ({
  items,
  hl = () => false,
  outline = () => false,
  showValues = true,
  noBars = false,
  yMax,
}) => {
  const max = yMax ?? Math.max(...items.map((i) => i.p)) * 1.2;
  const slot = 340 / items.length;
  const Y = (p: number) => 125 - (p / max) * 105;
  return (
    <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible select-none">
      <line x1="30" y1="125" x2="390" y2="125" stroke={MUTED} strokeWidth="1.5" />
      {items.map((it, i) => {
        const cx = 45 + (i + 0.5) * slot;
        const isHl = hl(it.x);
        return (
          <g key={it.x}>
            {!noBars && (
              <rect
                x={cx - slot * 0.32}
                y={Y(it.p)}
                width={slot * 0.64}
                height={125 - Y(it.p)}
                fill={isHl ? NEW : outline(it.x) ? '#ffffff' : FILL}
                stroke={outline(it.x) ? NEW : 'none'}
                strokeWidth="2"
                strokeDasharray={outline(it.x) ? '4 3' : undefined}
                opacity={isHl || outline(it.x) ? 1 : 0.75}
              />
            )}
            {!noBars && showValues && (
              <text x={cx} y={Y(it.p) - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill={isHl ? NEW : INK} fontFamily="monospace">
                {it.p.toFixed(Math.abs(it.p * 100 - Math.round(it.p * 100)) < 1e-9 ? 2 : 4)}
              </text>
            )}
            <text x={cx} y="140" textAnchor="middle" fontSize="10" fontWeight="bold" fill={noBars ? NEW : MUTED} fontFamily="monospace">
              {it.x}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Excerpt of a lookup table (Z or t) with the row and column being read highlighted.
const Lookup: React.FC<{
  corner: string;
  rows: (string | number)[];
  cols: string[];
  value: (r: number, c: number) => string;
  hlRow?: number;
  hlCol?: number;
}> = ({ corner, rows, cols, value, hlRow, hlCol }) => (
  <div className="overflow-x-auto rounded-lg border border-outline-variant/60 bg-surface-container-lowest">
    <table className="w-full text-xs border-collapse text-black">
      <thead>
        <tr className="bg-surface-container">
          <th className="py-1 px-2 font-bold text-left">{corner}</th>
          {cols.map((col, ci) => (
            <th key={col} className={`py-1 px-2 font-mono font-bold ${ci === hlCol ? 'bg-[#ffdad6] text-[#ba1a1a]' : ''}`}>
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {rows.map((r, ri) => (
          <tr key={ri}>
            <td className={`py-1 px-2 font-mono font-bold ${ri === hlRow ? 'bg-[#ffdad6] text-[#ba1a1a]' : ''}`}>{r}</td>
            {cols.map((col, ci) => {
              const hit = ri === hlRow && ci === hlCol;
              const lane = ri === hlRow || ci === hlCol;
              return (
                <td
                  key={col}
                  className={`py-1 px-2 font-mono text-center ${hit ? 'bg-[#ba1a1a] text-white font-extrabold' : lane && hlRow !== undefined && hlCol !== undefined ? 'bg-[#ffdad6]/40' : ''}`}
                >
                  {value(ri, ci)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const fmtP = (p: number) => p.toFixed(4);

// =========================================================================
// SECTION 3: UKURAN DESKRIPTIF NUMERIK
// =========================================================================
const A = [12, 15, 18, 20, 20, 25, 30]; // datasetA, mean 20, S = 6.03
const A_RAW = [20, 12, 30, 18, 25, 15, 20];
const B = [12, 15, 18, 20, 22, 25, 27, 30, 34, 40, 55]; // datasetB
const stackOf = (arr: number[]) => arr.map((x, i) => ({ x, stack: arr.slice(0, i).filter((y) => y === x).length }));

const MeanStep: React.FC<{ step: number }> = ({ step }) =>
  step === 1 ? (
    <Frame note="ΣX = 12 + 15 + 18 + 20 + 20 + 25 + 30 = 140 (waktu tempuh ke kampus, menit).">
      <Chips items={A.map((v) => ({ v }))} sep="+" />
      <Result label="ΣX =" value="140" />
    </Frame>
  ) : (
    <Frame note="X̄ = 140 / 7 = 20 menit: titik keseimbangan seluruh data.">
      <NumLine min={10} max={32} ticks={[10, 15, 20, 25, 30]} dots={stackOf(A)} markers={[{ x: 20, label: 'X̄ = 20' }]} />
    </Frame>
  );

const MedianStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'Data mentah (atas) diurutkan dari terkecil ke terbesar (bawah).'
        : step === 2
          ? 'n = 7 (ganjil) → posisi median = (7 + 1) / 2 = 4.'
          : 'Nilai pada posisi ke-4 = 20, jadi median = 20 menit.'
    }
  >
    {step === 1 && (
      <div className="space-y-1">
        <div className="text-xs text-on-surface-variant">Belum urut:</div>
        <Chips items={A_RAW.map((v) => ({ v, dim: true }))} />
        <div className="text-xs font-bold text-[#ba1a1a]">Sudah urut:</div>
      </div>
    )}
    <Chips items={A.map((v, i) => ({ v, sub: `#${i + 1}`, hl: step === 1 || (step >= 2 && i === 3) }))} />
    {step === 3 && <Result label="Median =" value="20" />}
  </Frame>
);

const ModeStep: React.FC<{ step: number }> = ({ step }) => {
  const vals = [12, 15, 18, 20, 25, 30];
  return (
    <Frame note={step === 1 ? 'Hitung berapa kali setiap nilai muncul.' : 'Nilai 20 muncul paling sering (f = 2), jadi modus = 20.'}>
      <MiniTable
        headers={[c('Nilai'), ...vals.map((v) => c(v, step === 2 && v === 20))]}
        rows={[[c('f', step === 1), ...vals.map((v) => c(A.filter((x) => x === v).length, step === 1 || v === 20))]]}
      />
    </Frame>
  );
};

const RangeStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame note={step === 1 ? 'Nilai terkecil = 12, nilai terbesar = 30.' : 'Range = 30 − 12 = 18 menit.'}>
    <NumLine
      min={10}
      max={32}
      ticks={[10, 15, 20, 25, 30]}
      dots={stackOf(A).map((d) => ({ ...d, color: d.x === 12 || d.x === 30 ? NEW : FILL, label: d.x === 12 || d.x === 30 ? String(d.x) : undefined }))}
      brackets={step === 2 ? [{ from: 12, to: 30, label: 'Range = 18' }] : []}
    />
  </Frame>
);

const VarianceStep: React.FC<{ step: number }> = ({ step }) => {
  const notes = [
    'X̄ = 140 / 7 = 20 menjadi titik acuan.',
    'Kurangkan tiap nilai dengan 20: misalnya 12 − 20 = −8.',
    'Kuadratkan setiap selisih: (−8)² = 64.',
    'Σ(X − X̄)² = 64 + 25 + 4 + 0 + 0 + 25 + 100 = 218.',
    'S² = 218 / (7 − 1) = 218 / 6 = 36.33.',
  ];
  return (
    <Frame note={notes[step - 1]}>
      <MiniTable
        headers={[c('X'), c(step >= 1 ? 'X̄' : '', step === 1), ...(step >= 2 ? [c('X − X̄', step === 2)] : []), ...(step >= 3 ? [c('(X − X̄)²', step === 3)] : [])]}
        rows={A.map((x) => [c(x), c(20, step === 1), ...(step >= 2 ? [c(x - 20, step === 2)] : []), ...(step >= 3 ? [c((x - 20) ** 2, step === 3)] : [])])}
        footer={step >= 4 ? [c('Σ'), c(''), c(0), c(218, true)] : undefined}
      />
      {step === 5 && <Result label="S² =" value="218 / 6 = 36.33" />}
    </Frame>
  );
};

const SdStep: React.FC<{ step: number }> = ({ step }) =>
  step === 1 ? (
    <Frame note="Gunakan variansi dari langkah sebelumnya.">
      <Result label="S² =" value="36.33 menit²" />
    </Frame>
  ) : (
    <Frame note="S = √36.33 = 6.03 menit. Pita merah = X̄ ± 1S (13.97 sampai 26.03).">
      <NumLine min={10} max={32} ticks={[10, 15, 20, 25, 30]} dots={stackOf(A)} band={{ from: 13.97, to: 26.03 }} markers={[{ x: 20, label: 'X̄ = 20', color: PRIMARY }]} brackets={[{ from: 20, to: 26.03, label: 'S = 6.03' }]} />
    </Frame>
  );

const ZScoreStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1)
    return (
      <Frame note="Untuk X = 30: X − X̄ = 30 − 20 = 10 menit di atas rata-rata.">
        <NumLine min={10} max={32} ticks={[10, 15, 20, 25, 30]} dots={stackOf(A)} markers={[{ x: 20, label: 'X̄', color: PRIMARY }]} brackets={[{ from: 20, to: 30, label: '30 − 20 = 10' }]} />
      </Frame>
    );
  if (step === 2)
    return (
      <Frame note="Z = 10 / 6.03 = 1.66: nilai 30 berada 1.66 standar deviasi di atas rata-rata.">
        <NumLine
          min={-3}
          max={3}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          fmt={(v) => (v > 0 ? `+${v}` : String(v))}
          dots={[{ x: 1.66, label: 'Z = 1.66', color: NEW }]}
          brackets={[{ from: 0, to: 1.66, label: '10 / 6.03' }]}
        />
      </Frame>
    );
  return (
    <Frame note="Z = 1.66 berada di antara −3 dan +3, jadi 30 menit bukan outlier.">
      <NumLine
        min={-4}
        max={4}
        ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]}
        band={{ from: -3, to: 3, color: SOFT }}
        dots={[{ x: 1.66, label: '1.66 ✓', color: NEW }]}
        brackets={[
          { from: -4, to: -3, label: 'outlier' },
          { from: 3, to: 4, label: 'outlier' },
        ]}
      />
    </Frame>
  );
};

const SkewStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'Dataset waktu tugas (n = 11): Median = 25, Mean = 298 / 11 = 27.09.'
        : 'Mean (27.09) > Median (25): ekor panjang ke kanan karena nilai 55, jadi distribusi menceng kanan (right-skewed).'
    }
  >
    <NumLine
      min={10}
      max={58}
      ticks={[10, 20, 30, 40, 50]}
      dots={B.map((x) => ({ x, color: step === 2 && x === 55 ? NEW : FILL }))}
      markers={[
        { x: 25, label: 'Median 25', color: PRIMARY },
        { x: 27.09, label: 'Mean 27.09', color: NEW, stack: 1 },
      ]}
      brackets={step === 2 ? [{ from: 34, to: 55, label: 'ekor kanan →' }] : []}
    />
  </Frame>
);

const QuartileStep: React.FC<{ step: number }> = ({ step }) => {
  const qIdx = [2, 5, 8];
  const notes = [
    'Data waktu tugas (n = 11) diurutkan.',
    'Posisi Q1 = (11 + 1) / 4 = 3, Median = 6, Q3 = 3(11 + 1) / 4 = 9.',
    'Q1 = 18, Median = 25, Q3 = 34.',
    'IQR = Q3 − Q1 = 34 − 18 = 16: rentang 50% data di tengah.',
  ];
  return (
    <Frame note={notes[step - 1]}>
      <Chips
        items={B.map((v, i) => ({
          v: step >= 3 && qIdx.includes(i) ? <strong>{v}</strong> : v,
          sub: step >= 2 && qIdx.includes(i) ? ['Q1', 'Med', 'Q3'][qIdx.indexOf(i)] : `#${i + 1}`,
          hl: step === 1 || (step >= 2 && qIdx.includes(i)) || (step === 4 && i >= 2 && i <= 8),
        }))}
      />
      {step === 4 && <Result label="IQR =" value="34 − 18 = 16" />}
    </Frame>
  );
};

const FIVE = [
  { k: 'X smallest', v: 12 },
  { k: 'Q1', v: 18 },
  { k: 'Median', v: 25 },
  { k: 'Q3', v: 34 },
  { k: 'X largest', v: 55 },
];

const FiveNumberStep: React.FC<{ step: number }> = ({ step }) =>
  step === 1 ? (
    <Frame note="Urutkan 11 data waktu tugas.">
      <Chips items={B.map((v) => ({ v, hl: true }))} />
    </Frame>
  ) : (
    <Frame note="Lima angka ringkasan: 12, 18, 25, 34, 55.">
      <Chips items={FIVE.map((f) => ({ v: f.v, sub: f.k, hl: true }))} />
    </Frame>
  );

const BoxplotStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1)
    return (
      <Frame note="Five-number summary: 12, 18, 25, 34, 55.">
        <Chips items={FIVE.map((f) => ({ v: f.v, sub: f.k, hl: true }))} />
      </Frame>
    );
  const X = (v: number) => 20 + ((v - 10) / 50) * 360;
  return (
    <Frame
      note={
        step === 2
          ? 'Sumbu angka 10 sampai 60 mencakup seluruh data.'
          : step === 3
            ? 'Kotak dari Q1 = 18 sampai Q3 = 34, dengan garis median di 25.'
            : 'Whisker kiri ke 12 (pendek), whisker kanan ke 55 (panjang) → data menceng kanan.'
      }
    >
      <svg viewBox="0 0 400 110" className="w-full h-auto overflow-visible select-none">
        <line x1="15" y1="85" x2="385" y2="85" stroke={step === 2 ? NEW : MUTED} strokeWidth={step === 2 ? 2.5 : 1.5} />
        {[10, 20, 30, 40, 50, 60].map((t) => (
          <g key={t}>
            <line x1={X(t)} y1="82" x2={X(t)} y2="88" stroke={step === 2 ? NEW : MUTED} />
            <text x={X(t)} y="101" textAnchor="middle" fontSize="10" fill={step === 2 ? NEW : MUTED} fontFamily="monospace">
              {t}
            </text>
          </g>
        ))}
        {step >= 3 && (
          <g>
            <rect x={X(18)} y="25" width={X(34) - X(18)} height="40" fill={step === 3 ? NEW_SOFT : SOFT} stroke={step === 3 ? NEW : PRIMARY} strokeWidth="2" />
            <line x1={X(25)} y1="25" x2={X(25)} y2="65" stroke={step === 3 ? NEW : PRIMARY} strokeWidth="3" />
            {[18, 25, 34].map((v) => (
              <text key={v} x={X(v)} y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill={INK} fontFamily="monospace">
                {v}
              </text>
            ))}
          </g>
        )}
        {step >= 4 && (
          <g stroke={NEW} strokeWidth="2.5">
            <line x1={X(12)} y1="45" x2={X(18)} y2="45" />
            <line x1={X(34)} y1="45" x2={X(55)} y2="45" />
            <line x1={X(12)} y1="35" x2={X(12)} y2="55" />
            <line x1={X(55)} y1="35" x2={X(55)} y2="55" />
            <text x={X(12)} y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill={NEW} stroke="none" fontFamily="monospace">
              12
            </text>
            <text x={X(55)} y="18" textAnchor="middle" fontSize="10" fontWeight="bold" fill={NEW} stroke="none" fontFamily="monospace">
              55
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
};

// =========================================================================
// SECTION 4: PROBABILITAS DASAR
// =========================================================================
const Die: React.FC<{ n: number; hl?: boolean; dim?: boolean; alt?: boolean }> = ({ n, hl, dim, alt }) => {
  const pips: Record<number, [number, number][]> = {
    1: [[2, 2]],
    2: [
      [1, 1],
      [3, 3],
    ],
    3: [
      [1, 1],
      [2, 2],
      [3, 3],
    ],
    4: [
      [1, 1],
      [3, 1],
      [1, 3],
      [3, 3],
    ],
    5: [
      [1, 1],
      [3, 1],
      [2, 2],
      [1, 3],
      [3, 3],
    ],
    6: [
      [1, 1],
      [3, 1],
      [1, 2],
      [3, 2],
      [1, 3],
      [3, 3],
    ],
  };
  const col = hl ? (alt ? '#0284c7' : NEW) : INK;
  return (
    <svg viewBox="0 0 40 40" className={`w-10 h-10 ${dim ? 'opacity-25' : ''}`}>
      <rect x="2" y="2" width="36" height="36" rx="7" fill={hl ? (alt ? '#e0f2fe' : NEW_SOFT) : '#ffffff'} stroke={col} strokeWidth={hl ? 3 : 1.5} />
      {pips[n].map(([px, py], i) => (
        <circle key={i} cx={px * 9 + 2} cy={py * 9 + 2} r="3.2" fill={col} />
      ))}
    </svg>
  );
};

const ProbScale: React.FC<{ p: number; label: string }> = ({ p, label }) => (
  <NumLine min={0} max={1} ticks={[0, 0.25, 0.5, 0.75, 1]} dots={[{ x: p, label, color: NEW }]} fmt={(v) => v.toFixed(2)} />
);

const ProbBasicStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1 ? 'Dadu 6 sisi: total outcome T = 6.' : step === 2 ? 'Peristiwa A = angka genap {2, 4, 6} → X = 3.' : 'P(A) = X / T = 3 / 6 = 0.50 (tepat di tengah skala 0 sampai 1).'
    }
  >
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Die key={n} n={n} hl={step === 1 || (step >= 2 && n % 2 === 0)} dim={step >= 2 && n % 2 === 1} />
      ))}
    </div>
    {step === 3 && <ProbScale p={0.5} label="P(A) = 0.50" />}
  </Frame>
);

const SampleSpaceStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'S = {1, 2, 3, 4, 5, 6}: semua hasil lemparan dadu.'
        : step === 2
          ? 'A = genap = {2, 4, 6} → P(A) = 3 / 6 = 0.50.'
          : "Komplemen A' = {1, 3, 5} (biru) → P(A') = 1 − 0.50 = 0.50."
    }
  >
    <div className="flex flex-wrap gap-2 p-2 rounded-lg border-2 border-dashed" style={{ borderColor: step === 1 ? NEW : GRID }}>
      <span className="self-center text-xs font-bold" style={{ color: step === 1 ? NEW : MUTED }}>
        S
      </span>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Die key={n} n={n} hl={step === 1 || (step >= 2 && n % 2 === 0) || (step === 3 && n % 2 === 1)} alt={step === 3 && n % 2 === 1} />
      ))}
    </div>
  </Frame>
);

// Tabel A: kebiasaan belajar × nilai ujian (N = 200)
const CT = [
  { r: 'Rutin', v: [90, 30], t: 120 },
  { r: 'Tidak Rutin', v: [20, 60], t: 80 },
];
const CT_COL = [110, 90];

const ContTable: React.FC<{ hl: (key: string) => boolean; dimRow?: number }> = ({ hl, dimRow }) => {
  const dim = (ri: number, v: React.ReactNode) => (dimRow === ri ? <span className="opacity-60 line-through">{v}</span> : v);
  return (
    <MiniTable
      headers={[c('Belajar \\ Nilai'), c('≥ 70'), c('< 70'), c('Total')]}
      rows={CT.map((row, ri) => [c(dim(ri, row.r)), ...row.v.map((v, ci) => c(dim(ri, v), hl(`${ri}${ci}`))), c(dim(ri, row.t), hl(`r${ri}`))])}
      footer={[c('Total'), ...CT_COL.map((v, ci) => c(v, hl(`c${ci}`))), c(200, hl('N'))]}
    />
  );
};

const ContingencyStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'Sel irisan baris Rutin dan kolom ≥ 70 = 90.'
        : step === 2
          ? 'Joint probability: P(Rutin and ≥70) = 90 / 200 = 0.45.'
          : 'Marginal probability: P(Rutin) = 120 / 200 = 0.60 dan P(≥70) = 110 / 200 = 0.55.'
    }
  >
    <ContTable hl={(k) => (step === 1 ? k === '00' : step === 2 ? k === '00' || k === 'N' : ['r0', 'c0', 'N'].includes(k))} />
  </Frame>
);

const ConditionalStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'Syarat "Rutin": ruang sampel menyempit menjadi baris Rutin saja (total 120). Baris lain diabaikan.'
        : step === 2
          ? 'Di dalam kelompok Rutin, yang nilainya ≥ 70 ada 90.'
          : 'P(≥70 | Rutin) = 90 / 120 = 0.75.'
    }
  >
    <ContTable dimRow={1} hl={(k) => (step === 1 ? k === 'r0' : step === 2 ? k === '00' : k === '00' || k === 'r0')} />
  </Frame>
);

const TreeStep: React.FC<{ step: number }> = ({ step }) => {
  const leaves = [
    { y: 25, l: '≥70', p: '0.75', j: '0.60 × 0.75 = 0.45', hl: true },
    { y: 65, l: '<70', p: '0.25', j: '0.60 × 0.25 = 0.15' },
    { y: 115, l: '≥70', p: '0.25', j: '0.40 × 0.25 = 0.10' },
    { y: 155, l: '<70', p: '0.75', j: '0.40 × 0.75 = 0.30' },
  ];
  const mids = [
    { y: 45, l: 'Rutin', p: '0.60' },
    { y: 135, l: 'Tidak Rutin', p: '0.40' },
  ];
  const s1 = step === 1 ? NEW : MUTED;
  return (
    <Frame
      note={
        step === 1
          ? 'Cabang tahap 1 = peluang marginal: P(Rutin) = 0.60, P(Tidak Rutin) = 0.40.'
          : step === 2
            ? 'Ranting tahap 2 = peluang bersyarat, misalnya P(≥70 | Rutin) = 0.75.'
            : 'Kalikan sepanjang jalur: P(Rutin and ≥70) = 0.60 × 0.75 = 0.45.'
      }
    >
      <svg viewBox="0 0 400 180" className="w-full h-auto overflow-visible select-none">
        <circle cx="20" cy="90" r="5" fill={INK} />
        {mids.map((m, i) => (
          <g key={i}>
            <line x1="20" y1="90" x2="130" y2={m.y} stroke={step === 3 && i === 0 ? NEW : s1} strokeWidth={step === 3 && i === 0 ? 3 : 2} />
            <text x="70" y={(90 + m.y) / 2 - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 1 ? NEW : INK} fontFamily="monospace">
              {m.p}
            </text>
            <text x="136" y={m.y + 4} fontSize="10" fontWeight="bold" fill={INK}>
              {m.l}
            </text>
          </g>
        ))}
        {step >= 2 &&
          leaves.map((lf, i) => {
            const from = mids[i < 2 ? 0 : 1];
            const onPath = step === 3 && lf.hl;
            return (
              <g key={i}>
                <line x1="195" y1={from.y} x2="260" y2={lf.y} stroke={step === 2 || onPath ? NEW : MUTED} strokeWidth={onPath ? 3 : 2} />
                <text x="222" y={(from.y + lf.y) / 2 - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 2 ? NEW : INK} fontFamily="monospace">
                  {lf.p}
                </text>
                <text x="265" y={lf.y + 4} fontSize="10" fontWeight="bold" fill={INK}>
                  {lf.l}
                </text>
                {step === 3 && (
                  <text x="295" y={lf.y + 4} fontSize="9" fontWeight="bold" fill={lf.hl ? NEW : MUTED} fontFamily="monospace">
                    {lf.j}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
    </Frame>
  );
};

const IndependenceStep: React.FC<{ step: number }> = ({ step }) => {
  const bars = [
    { k: 'P(≥70)', v: 0.55, show: step >= 1 },
    { k: 'P(≥70 | Rutin)', v: 0.75, show: step >= 2 },
  ];
  return (
    <Frame
      note={
        step === 1
          ? 'Tanpa syarat: P(≥70) = 110 / 200 = 0.55.'
          : step === 2
            ? 'Dengan syarat Rutin: P(≥70 | Rutin) = 90 / 120 = 0.75.'
            : '0.75 ≠ 0.55 → mengetahui "Rutin" mengubah peluang lulus, jadi kedua peristiwa DEPENDEN.'
      }
    >
      <div className="space-y-2">
        {bars
          .filter((b) => b.show)
          .map((b, i) => {
            const isNew = (step === 1 && i === 0) || (step === 2 && i === 1);
            return (
              <div key={b.k} className="flex items-center gap-2 text-xs">
                <span className="w-28 shrink-0 font-mono font-bold text-black">{b.k}</span>
                <div className="flex-1 h-5 rounded bg-surface-container-high overflow-hidden">
                  <div className="h-full rounded" style={{ width: `${b.v * 100}%`, backgroundColor: isNew ? NEW : FILL }} />
                </div>
                <span className="w-10 font-mono font-bold text-black">{b.v.toFixed(2)}</span>
              </div>
            );
          })}
        {step === 3 && <Result label="Kesimpulan:" value="0.75 ≠ 0.55 → DEPENDEN" />}
      </div>
    </Frame>
  );
};

// =========================================================================
// SECTION 5: DISTRIBUSI PROBABILITAS DISKRIT
// =========================================================================
const SIGNAL = [
  { x: 0, p: 0.1 },
  { x: 1, p: 0.3 },
  { x: 2, p: 0.3 },
  { x: 3, p: 0.2 },
  { x: 4, p: 0.1 },
];

const DiscreteDistStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'Nilai X yang mungkin: 0, 1, 2, 3, 4 kali gangguan sinyal.'
        : step === 2
          ? 'Setiap nilai X diberi peluang P(X = x).'
          : step === 3
            ? 'Σ P(X) = 0.10 + 0.30 + 0.30 + 0.20 + 0.10 = 1.00 ✓'
            : 'P(X ≥ 2) = 0.30 + 0.20 + 0.10 = 0.60.'
    }
  >
    <Bars items={SIGNAL} noBars={step === 1} hl={(x) => step === 2 || (step === 4 && x >= 2)} yMax={0.4} />
    {step === 3 && (
      <div className="flex h-5 rounded overflow-hidden border-2 border-[#ba1a1a]">
        {SIGNAL.map((s, i) => (
          <div key={s.x} className="h-full flex items-center justify-center text-xs font-bold text-white" style={{ width: `${s.p * 100}%`, backgroundColor: i % 2 ? '#0369a1' : '#0f766e' }}>
            {s.p.toFixed(1)}
          </div>
        ))}
      </div>
    )}
  </Frame>
);

const ExpectedValueStep: React.FC<{ step: number }> = ({ step }) => {
  const rows = SIGNAL.map((s) => ({ ...s, xp: s.x * s.p, w: (s.x - 1.9) ** 2 * s.p }));
  return (
    <Frame
      note={
        step === 1
          ? 'Kalikan tiap x dengan peluangnya, misalnya 2 × 0.30 = 0.60.'
          : step === 2
            ? 'E(X) = μ = Σ x·P = 1.90 kali gangguan.'
            : step === 3
              ? 'Deviasi kuadrat terbobot, misalnya (0 − 1.9)² × 0.10 = 0.361.'
              : 'σ² = Σ = 1.290 → σ = √1.290 ≈ 1.136.'
      }
    >
      <MiniTable
        headers={[c('x'), c('P(x)'), c('x·P', step === 1), ...(step >= 3 ? [c('(x − μ)²·P', step === 3)] : [])]}
        rows={rows.map((r) => [c(r.x), c(r.p.toFixed(2)), c(r.xp.toFixed(2), step === 1), ...(step >= 3 ? [c(r.w.toFixed(3), step === 3)] : [])])}
        footer={step >= 2 ? [c('Σ'), c('1.00'), c('μ = 1.90', step === 2), ...(step >= 3 ? [c(step >= 4 ? 'σ² = 1.290' : '', step === 4)] : [])] : undefined}
      />
      {step === 4 && <Result label="σ =" value="√1.290 ≈ 1.136" />}
    </Frame>
  );
};

const PAIRS: [number, number][] = [];
for (let a = 1; a <= 5; a++) for (let b = a + 1; b <= 5; b++) PAIRS.push([a, b]);

const CombinationStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1)
    return (
      <Frame note="n = 5 soal, dipilih x = 2 soal yang benar (urutan tidak penting).">
        <Chips items={[1, 2, 3, 4, 5].map((k) => ({ v: `S${k}`, hl: k <= 2 }))} />
      </Frame>
    );
  if (step === 2)
    return (
      <Frame note="5C2 = 5! / [2! · (5 − 2)!] = 5! / (2! · 3!).">
        <div className="text-center font-mono text-lg text-black">
          <div className="inline-block">
            <div className="px-3 border-b-2 border-black" style={{ color: NEW }}>
              5!
            </div>
            <div className="px-3" style={{ color: NEW }}>
              2! · 3!
            </div>
          </div>
        </div>
      </Frame>
    );
  if (step === 3)
    return (
      <Frame note="5! = 5 × 4 × 3!, lalu 3! dicoret di atas dan di bawah: tersisa (5 × 4) / (2 × 1).">
        <div className="text-center font-mono text-lg text-black">
          <div className="inline-block">
            <div className="px-3 border-b-2 border-black">
              5 × 4 × <span className="line-through decoration-[#ba1a1a] decoration-2 text-[#ba1a1a]">3!</span>
            </div>
            <div className="px-3">
              (2 × 1) × <span className="line-through decoration-[#ba1a1a] decoration-2 text-[#ba1a1a]">3!</span>
            </div>
          </div>
        </div>
      </Frame>
    );
  return (
    <Frame note="20 / 2 = 10. Kesepuluh cara memilih 2 soal dari 5 ditampilkan di bawah.">
      <div className="grid grid-cols-5 gap-1.5">
        {PAIRS.map(([a, b]) => (
          <div key={`${a}${b}`} className="px-1 py-1 rounded-md border-2 border-[#ba1a1a] bg-[#ffdad6]/40 text-center font-mono text-xs font-bold text-black">
            S{a}, S{b}
          </div>
        ))}
      </div>
    </Frame>
  );
};

const BINOM = [0.2373, 0.3955, 0.2637, 0.0879, 0.0146, 0.001].map((p, x) => ({ x, p }));

const BinomialStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1)
    return (
      <Frame note="n = 5 soal, peluang benar π = 0.25 (gagal 0.75), target x = 2 benar.">
        <Chips items={[1, 2, 3, 4, 5].map((k) => ({ v: '?', sub: `Soal ${k}`, hl: true }))} />
      </Frame>
    );
  if (step === 2)
    return (
      <Frame note="Ada 5C2 = 10 susunan berbeda untuk 2 benar (✓) dan 3 salah (✗).">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {PAIRS.map(([a, b]) => (
            <div key={`${a}${b}`} className="px-1 py-0.5 rounded-md border border-outline-variant/60 bg-surface-container-lowest text-center font-mono text-xs tracking-wider">
              {[1, 2, 3, 4, 5].map((k) => (
                <span key={k} style={{ color: k === a || k === b ? NEW : MUTED }}>
                  {k === a || k === b ? '✓' : '✗'}
                </span>
              ))}
            </div>
          ))}
        </div>
      </Frame>
    );
  if (step === 3)
    return (
      <Frame note="Satu jalur (✓✓✗✗✗): 0.25 × 0.25 × 0.75 × 0.75 × 0.75 = 0.0625 × 0.421875 = 0.026367.">
        <Chips items={['0.25', '0.25', '0.75', '0.75', '0.75'].map((v, i) => ({ v, sub: i < 2 ? '✓' : '✗', hl: i < 2 }))} sep="×" />
      </Frame>
    );
  return (
    <Frame note="P(X = 2) = 10 × 0.026367 = 0.2637.">
      <Bars items={BINOM} hl={(x) => x === 2} yMax={0.45} />
    </Frame>
  );
};

const POIS = [0.0498, 0.1494, 0.224, 0.224, 0.168, 0.1008, 0.0504, 0.0216].map((p, x) => ({ x, p }));

const PoissonStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'λ = 3 pengunjung per menit: distribusi Poisson berpusat di sekitar 3.'
        : step === 2
          ? 'e^(−3) ≈ 0.0498. Nilai ini juga sama dengan P(X = 0).'
          : step === 3
            ? 'Untuk x = 2: λ² / 2! = 9 / 2 = 4.5.'
            : 'P(X = 2) = 4.5 × 0.0498 = 0.2240.'
    }
  >
    <Bars items={POIS} hl={(x) => (step === 2 && x === 0) || (step === 4 && x === 2)} outline={(x) => step === 3 && x === 2} yMax={0.28} showValues={step !== 3} />
    {step === 3 && <Result label="λˣ / x! =" value="3² / 2! = 9 / 2 = 4.5" />}
  </Frame>
);

// =========================================================================
// SECTION 6: DISTRIBUSI KONTINU
// =========================================================================
const examPdf = (x: number) => normalPdf(x, 70, 10);

const PdfAreaStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'f(X) = kurva normal nilai ujian (μ = 70, σ = 10).'
        : step === 2
          ? 'Batas interval: c = 60 dan d = 80.'
          : step === 3
            ? 'Luas di antara 60 dan 80 = 0.8413 − 0.1587 = 0.6826.'
            : 'Kiri + tengah + kanan = 0.1587 + 0.6826 + 0.1587 = 1.0000.'
    }
  >
    <Curve
      f={examPdf}
      xMin={35}
      xMax={105}
      ticks={[40, 50, 60, 70, 80, 90, 100]}
      hlCurve={step === 1}
      markers={step >= 2 ? [{ x: 60, label: 'c = 60' }, { x: 80, label: 'd = 80' }] : []}
      shades={
        step === 3
          ? [{ from: 60, to: 80, label: '0.6826' }]
          : step === 4
            ? [
                { from: 35, to: 60, color: '#e0f2fe' },
                { from: 60, to: 80, color: SOFT, label: '0.6826' },
                { from: 80, to: 105, color: '#e0f2fe' },
              ]
            : []
      }
    />
    {step === 4 && <Result label="Total luas =" value="0.1587 + 0.6826 + 0.1587 = 1.0000" />}
  </Frame>
);

const Z_ROWS = [1.3, 1.4, 1.5, 1.6];
const Z_COLS = ['.00', '.01', '.02', '.03'];

const ZTableStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 3)
    return (
      <Frame note="Baris 1.5 dan kolom .00 bertemu di 0.9332.">
        <Lookup corner="Z" rows={Z_ROWS.map((z) => z.toFixed(1))} cols={Z_COLS} value={(r, ci) => normalCdf(Z_ROWS[r] + ci / 100).toFixed(4)} hlRow={2} hlCol={0} />
      </Frame>
    );
  return (
    <Frame
      note={
        step === 1
          ? 'μ = 70, σ = 10, batas X = 85.'
          : step === 2
            ? 'Z = (85 − 70) / 10 = 1.50: sumbu X diubah menjadi sumbu Z.'
            : step === 4
              ? 'P(X ≤ 85) = P(Z ≤ 1.50) = 0.9332 (luas di kiri).'
              : 'P(X > 85) = 1 − 0.9332 = 0.0668 (luas di kanan).'
      }
    >
      <Curve
        f={examPdf}
        xMin={35}
        xMax={105}
        ticks={[40, 50, 60, 70, 80, 90, 100]}
        markers={[{ x: 85, label: step >= 2 ? 'X = 85 → Z = 1.50' : 'X = 85' }]}
        zAxis={step >= 2 ? { title: 'Z', hl: step === 2, ticks: [-3, -2, -1, 0, 1, 1.5, 2, 3].map((z) => ({ x: 70 + 10 * z, label: z === 1.5 ? '1.5' : String(z) })) } : undefined}
        shades={step === 4 ? [{ from: 35, to: 85, label: '0.9332' }] : step === 5 ? [{ from: 85, to: 105 }] : []}
      />
      {step === 5 && <Result label="P(X > 85) =" value="1 − 0.9332 = 0.0668" />}
    </Frame>
  );
};

const UniformStep: React.FC<{ step: number }> = ({ step }) => {
  const f = (x: number) => (x >= 5 && x <= 15 ? 0.1 : 0);
  return (
    <Frame
      note={
        step === 1
          ? 'Waktu tunggu shuttle: a = 5 menit, b = 15 menit.'
          : step === 2
            ? 'Tinggi f(X) = 1 / (15 − 5) = 0.10.'
            : step === 3
              ? 'Interval sasaran: c = 8 sampai d = 12.'
              : 'Luas = lebar × tinggi = (12 − 8) × 0.10 = 0.40.'
      }
    >
      <Curve
        f={step >= 2 ? f : () => 0}
        xMin={2}
        xMax={18}
        yMax={0.13}
        ticks={[2, 5, 8, 10, 12, 15, 18]}
        rect
        hlCurve={step === 2}
        markers={step === 1 ? [{ x: 5, label: 'a = 5' }, { x: 15, label: 'b = 15' }] : step >= 3 ? [{ x: 8, label: 'c = 8' }, { x: 12, label: 'd = 12' }] : []}
        shades={step === 4 ? [{ from: 8, to: 12, label: '0.40' }] : []}
      />
    </Frame>
  );
};

const ExponentialStep: React.FC<{ step: number }> = ({ step }) => {
  const f = (x: number) => exponentialPdf(x, 3);
  return (
    <Frame
      note={
        step === 1
          ? 'λ = 3 pengunjung per menit; ambang waktu x = 0.5 menit.'
          : step === 2
            ? 'Eksponen −λx = −(3 × 0.5) = −1.50.'
            : step === 3
              ? 'e^(−1.5) ≈ 0.2231 = luas di kanan 0.5 (menunggu lebih dari 30 detik).'
              : step === 4
                ? 'P(X ≤ 0.5) = 1 − 0.2231 = 0.7769 (luas di kiri).'
                : 'μ = 1 / λ = 1 / 3 ≈ 0.333 menit (20 detik).'
      }
    >
      <Curve
        f={f}
        xMin={0}
        xMax={1.6}
        ticks={[0, 0.25, 0.5, 0.75, 1, 1.25, 1.5]}
        fmt={(v) => String(v)}
        markers={step === 5 ? [{ x: 1 / 3, label: 'μ = 0.333' }] : [{ x: 0.5, label: 'x = 0.5' }]}
        shades={step === 3 ? [{ from: 0.5, to: 1.6, label: '0.2231' }] : step === 4 ? [{ from: 0, to: 0.5, label: '0.7769' }] : []}
      />
      {step === 2 && <Result label="−λx =" value="−(3 × 0.5) = −1.50" />}
    </Frame>
  );
};

// =========================================================================
// SECTION 7: DISTRIBUSI SAMPLING
// =========================================================================
const SamplingConceptStep: React.FC<{ step: number }> = ({ step }) => {
  const pop = [3, 2, 1, 4];
  if (step === 1)
    return (
      <Frame note="μ = (3 + 2 + 1 + 4) / 4 = 2.5.">
        <Chips items={pop.map((v, i) => ({ v, sub: ['Ani', 'Budi', 'Citra', 'Dodi'][i] }))} sep="+" />
        <Result label="μ =" value="10 / 4 = 2.5" />
      </Frame>
    );
  if (step === 2)
    return (
      <Frame note="σ = √(5 / 4) ≈ 1.118 (pembagi N, bukan n − 1).">
        <MiniTable headers={[c('X'), c('X − μ', true), c('(X − μ)²', true)]} rows={pop.map((x) => [c(x), c(x - 2.5, true), c((x - 2.5) ** 2, true)])} footer={[c('Σ'), c(0), c(5, true)]} />
      </Frame>
    );
  const means: number[] = [];
  for (const a of pop) for (const b of pop) means.push((a + b) / 2);
  return (
    <Frame note={step === 3 ? '4 × 4 = 16 kemungkinan sampel (n = 2); tiap sel = sample mean x̄.' : 'Rata-rata 16 sample mean = 40 / 16 = 2.5 = μ (unbiased).'}>
      <div className="grid grid-cols-4 gap-1">
        {means.map((m, i) => (
          <div
            key={i}
            className={`py-1 rounded-md text-center font-mono text-xs font-bold ${step === 3 ? 'border-2 border-[#ba1a1a] text-[#ba1a1a]' : m === 2.5 ? 'bg-[#ba1a1a] text-white' : 'border border-outline-variant/60 text-black'}`}
          >
            {m.toFixed(1)}
          </div>
        ))}
      </div>
      {step === 4 && <Result label="μ_x̄ =" value="40 / 16 = 2.5 = μ" />}
    </Frame>
  );
};

const SeStep: React.FC<{ step: number }> = ({ step }) => {
  const pop = (x: number) => normalPdf(x, 368, 15);
  const s25 = (x: number) => normalPdf(x, 368, 3);
  const s100 = (x: number) => normalPdf(x, 368, 1.5);
  if (step === 2)
    return (
      <Frame note="√n = √25 = 5.">
        <Result label="√25 =" value="5" />
      </Frame>
    );
  return (
    <Frame
      note={
        step === 1
          ? 'Populasi berat beras: σ = 15 g. Sampel n = 25.'
          : step === 3
            ? 'σ_x̄ = 15 / 5 = 3: kurva sample mean jauh lebih sempit daripada populasi (putus-putus).'
            : 'n = 100 → σ_x̄ = 15 / 10 = 1.5: n naik 4×, standard error turun setengah.'
      }
    >
      <Curve
        f={step === 1 ? pop : step === 3 ? s25 : s100}
        ghost={step === 1 ? undefined : step === 3 ? pop : s25}
        xMin={323}
        xMax={413}
        yMax={normalPdf(368, 368, 1.5) * 1.05}
        ticks={[338, 353, 368, 383, 398]}
        hlCurve
      />
    </Frame>
  );
};

const meanDist = (x: number) => normalPdf(x, 368, 3);

const ZMeanStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 5)
    return (
      <Frame note="Satu kemasan (pembagi σ = 15): P(X < 365) = 0.4207, jauh lebih besar daripada 0.1587 untuk rata-rata 25 kemasan.">
        <Curve f={(x) => normalPdf(x, 368, 15)} xMin={323} xMax={413} ticks={[338, 353, 368, 383, 398]} markers={[{ x: 365, label: '365' }]} shades={[{ from: 323, to: 365, label: '0.4207' }]} />
      </Frame>
    );
  return (
    <Frame
      note={
        step === 1
          ? 'μ = 368, σ = 15, n = 25; ditanya P(x̄ < 365).'
          : step === 2
            ? 'σ_x̄ = 15 / √25 = 3: lebar kurva sample mean.'
            : step === 3
              ? 'Z = (365 − 368) / 3 = −1.00.'
              : 'P(Z < −1.00) = 0.1587.'
      }
    >
      <Curve
        f={meanDist}
        xMin={356}
        xMax={380}
        ticks={[359, 362, 365, 368, 371, 374, 377]}
        hlCurve={step === 2}
        markers={[{ x: 365, label: 'x̄ = 365' }]}
        zAxis={step >= 3 ? { title: 'Z', hl: step === 3, ticks: [-3, -2, -1, 0, 1, 2, 3].map((z) => ({ x: 368 + 3 * z, label: String(z) })) } : undefined}
        shades={step === 4 ? [{ from: 356, to: 365, label: '0.1587' }] : []}
      />
    </Frame>
  );
};

const XbarIntervalStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 2)
    return (
      <Frame note="Cari luas kumulatif 0.9750 di tabel Z → baris 1.9, kolom .06 → Z = 1.96.">
        <Lookup corner="Z" rows={['1.8', '1.9', '2.0']} cols={['.04', '.05', '.06', '.07']} value={(r, ci) => normalCdf(1.8 + r / 10 + (4 + ci) / 100).toFixed(4)} hlRow={1} hlCol={2} />
      </Frame>
    );
  return (
    <Frame
      note={
        step === 1
          ? 'Interval 95% di tengah, sisa 2.5% di setiap ekor.'
          : step === 3
            ? 'σ_x̄ = 15 / √25 = 3.'
            : step === 4
              ? '368 ± 1.96 × 3 → 362.12 dan 373.88.'
              : '95% dari seluruh sample mean (n = 25) jatuh di antara 362.12 g dan 373.88 g.'
      }
    >
      <Curve
        f={meanDist}
        xMin={356}
        xMax={380}
        ticks={[359, 362, 365, 368, 371, 374, 377]}
        hlCurve={step === 3}
        markers={step >= 4 ? [{ x: 362.12, label: '362.12' }, { x: 373.88, label: '373.88' }] : []}
        shades={[
          { from: 356, to: 362.12, color: step === 1 ? '#e0f2fe' : NEW_SOFT, label: step === 1 ? '2.5%' : undefined },
          { from: 362.12, to: 373.88, color: SOFT, label: '95%' },
          { from: 373.88, to: 380, color: step === 1 ? '#e0f2fe' : NEW_SOFT, label: step === 1 ? '2.5%' : undefined },
        ]}
      />
    </Frame>
  );
};

const ZPropStep: React.FC<{ step: number }> = ({ step }) => (
  <Frame
    note={
      step === 1
        ? 'π = 0.50, n = 100; ditanya P(p > 0.58).'
        : step === 2
          ? 'σ_p = √(0.50 × 0.50 / 100) = 0.05.'
          : step === 3
            ? 'Z = (0.58 − 0.50) / 0.05 = 1.60.'
            : 'P(p > 0.58) = 1 − 0.9452 = 0.0548.'
    }
  >
    <Curve
      f={(x) => normalPdf(x, 0.5, 0.05)}
      xMin={0.33}
      xMax={0.67}
      ticks={[0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65]}
      fmt={(v) => v.toFixed(2)}
      hlCurve={step === 2}
      markers={[{ x: 0.58, label: 'p = 0.58' }]}
      zAxis={step >= 3 ? { title: 'Z', hl: step === 3, ticks: [-3, -2, -1, 0, 1, 1.6, 3].map((z) => ({ x: 0.5 + 0.05 * z, label: String(z) })) } : undefined}
      shades={step === 4 ? [{ from: 0.58, to: 0.67 }] : []}
    />
    {step === 4 && <Result label="P(p > 0.58) =" value="0.0548" />}
  </Frame>
);

// =========================================================================
// SECTION 8: CONFIDENCE INTERVAL
// =========================================================================
const IntervalBar: React.FC<{ min: number; max: number; ticks: number[]; point: number; pointLabel: string; lower?: number; upper?: number; target?: number; fmt?: (v: number) => string; arrows?: boolean }> = ({
  min,
  max,
  ticks,
  point,
  pointLabel,
  lower,
  upper,
  target,
  fmt = (v) => v.toFixed(2),
  arrows,
}) => {
  const X = (v: number) => 20 + ((v - min) / (max - min)) * 360;
  return (
    <svg viewBox="0 0 400 115" className="w-full h-auto overflow-visible select-none">
      <line x1="15" y1="70" x2="385" y2="70" stroke={MUTED} strokeWidth="1.5" />
      {ticks.map((t) => (
        <text key={t} x={X(t)} y="108" textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="monospace">
          {fmt(t)}
        </text>
      ))}
      {lower !== undefined && upper !== undefined && (
        <g>
          <rect x={X(lower)} y="58" width={X(upper) - X(lower)} height="24" rx="4" fill={arrows ? 'none' : NEW_SOFT} stroke={NEW} strokeWidth="2" strokeDasharray={arrows ? '4 3' : undefined} />
          {!arrows && (
            <g fontSize="10" fontWeight="bold" fill={NEW} fontFamily="monospace" textAnchor="middle">
              <text x={X(lower)} y="95">
                {fmt(lower)}
              </text>
              <text x={X(upper)} y="95">
                {fmt(upper)}
              </text>
            </g>
          )}
          {arrows && (
            <g stroke={NEW} strokeWidth="2">
              <line x1={X(point)} y1="45" x2={X(lower)} y2="45" />
              <line x1={X(point)} y1="45" x2={X(upper)} y2="45" />
              <text x={(X(point) + X(upper)) / 2} y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill={NEW} stroke="none" fontFamily="monospace">
                + ME
              </text>
              <text x={(X(point) + X(lower)) / 2} y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill={NEW} stroke="none" fontFamily="monospace">
                − ME
              </text>
            </g>
          )}
        </g>
      )}
      <circle cx={X(point)} cy="70" r="5" fill={PRIMARY} stroke="#ffffff" strokeWidth="1.5" />
      <text x={X(point)} y="28" textAnchor="middle" fontSize="10" fontWeight="bold" fill={PRIMARY} fontFamily="monospace">
        {pointLabel}
      </text>
      {target !== undefined && (
        <g>
          <line x1={X(target)} y1="50" x2={X(target)} y2="90" stroke={PRIMARY} strokeWidth="2.5" />
          <text x={X(target)} y="14" textAnchor="middle" fontSize="10" fontWeight="bold" fill={PRIMARY} fontFamily="monospace">
            target {target} ✓
          </text>
        </g>
      )}
    </svg>
  );
};

const CiKnownStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 2)
    return (
      <Frame note="95% di tengah → 0.025 di setiap ekor → Z_α/2 = 1.96.">
        <Curve
          f={(x) => normalPdf(x, 0, 1)}
          xMin={-3.5}
          xMax={3.5}
          ticks={[-3, -1.96, 0, 1.96, 3]}
          fmt={(v) => (Math.abs(v) === 1.96 ? (v > 0 ? '+1.96' : '−1.96') : String(v))}
          shades={[
            { from: -3.5, to: -1.96, label: '.025' },
            { from: -1.96, to: 1.96, color: SOFT, label: '0.95' },
            { from: 1.96, to: 3.5, label: '.025' },
          ]}
        />
      </Frame>
    );
  const ticks = [350, 355, 360, 365, 370, 375];
  return (
    <Frame
      note={
        step === 1
          ? 'Point estimate: x̄ = 362.3 g dari 25 kemasan (σ = 15, 95%).'
          : step === 3
            ? 'σ / √n = 15 / 5 = 3; margin of error = 1.96 × 3 = 5.88 ke kiri dan ke kanan.'
            : step === 4
              ? 'Interval: 362.3 ± 5.88 → 356.42 ≤ μ ≤ 368.18.'
              : 'Target 368 g berada di dalam interval → proses masih sesuai.'
      }
    >
      <IntervalBar
        min={348}
        max={377}
        ticks={ticks}
        fmt={(v) => String(v)}
        point={362.3}
        pointLabel="x̄ = 362.3"
        lower={step >= 3 ? 356.42 : undefined}
        upper={step >= 3 ? 368.18 : undefined}
        arrows={step === 3}
        target={step === 5 ? 368 : undefined}
      />
      {step === 4 && <Result label="95% CI:" value="356.42 ≤ μ ≤ 368.18" />}
    </Frame>
  );
};

const T_ROWS = [97, 98, 99, 100];
const T_COLS = [0.1, 0.05, 0.025, 0.01];
const tFmt = (p: number) => `.${String(p).split('.')[1]}`;

const TTable: React.FC<{ hl: boolean }> = ({ hl }) => (
  <Lookup corner="df \\ ekor atas" rows={T_ROWS} cols={T_COLS.map(tFmt)} value={(r, ci) => tCritical((1 - 2 * T_COLS[ci]) * 100, T_ROWS[r]).toFixed(4)} hlRow={hl ? 2 : undefined} hlCol={hl ? 2 : undefined} />
);

const TDistStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1)
    return (
      <Frame note="n = 100 → df = n − 1 = 99.">
        <Result label="df =" value="100 − 1 = 99" />
      </Frame>
    );
  if (step === 2)
    return (
      <Frame note="95% → α = 0.05 → α/2 = 0.025 di ekor atas (kumulatif 0.975).">
        <Curve
          f={(x) => tPdf(x, 99)}
          xMin={-3.5}
          xMax={3.5}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          shades={[
            { from: -3.5, to: -1.9842, label: '.025' },
            { from: 1.9842, to: 3.5, label: '.025' },
          ]}
        />
      </Frame>
    );
  return (
    <Frame note="Baris df = 99 bertemu kolom 0.025 di t = 1.9842.">
      <TTable hl />
    </Frame>
  );
};

const CiUnknownStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 2)
    return (
      <Frame note="df = 99, ekor atas 0.025 → t_α/2 = 1.9842.">
        <TTable hl />
      </Frame>
    );
  return (
    <Frame
      note={
        step === 1
          ? 'x̄ = 110.27, S = 28.95, n = 100 (ribu rupiah), 95%.'
          : step === 3
            ? 'S / √n = 2.895; margin of error = 1.9842 × 2.895 = 5.74.'
            : 'Interval: 110.27 ± 5.74 → 104.53 ≤ μ ≤ 116.01.'
      }
    >
      <IntervalBar
        min={100}
        max={120}
        ticks={[100, 104, 108, 112, 116, 120]}
        fmt={(v) => (Number.isInteger(v) ? String(v) : v.toFixed(2))}
        point={110.27}
        pointLabel="x̄ = 110.27"
        lower={step >= 3 ? 104.53 : undefined}
        upper={step >= 3 ? 116.01 : undefined}
        arrows={step === 3}
      />
    </Frame>
  );
};

const CiPropStep: React.FC<{ step: number }> = ({ step }) => {
  if (step <= 2)
    return (
      <Frame note={step === 1 ? '10 dari 100 formulir mengandung kesalahan → p = 10 / 100 = 0.10.' : 'X = 10 > 5 dan n − X = 90 > 5 → syarat terpenuhi.'}>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 100 }, (_, i) => (
            <span key={i} className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i < 10 ? NEW : step === 2 ? '#0284c7' : GRID }} />
          ))}
        </div>
        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            <Result label="X =" value="10 > 5 ✓" />
            <Result label="n − X =" value="90 > 5 ✓" />
          </div>
        )}
      </Frame>
    );
  if (step === 3)
    return (
      <Frame note="√(0.10 × 0.90 / 100) = √0.0009 = 0.03.">
        <Result label="SE =" value="√0.0009 = 0.03" />
      </Frame>
    );
  return (
    <Frame note={step === 4 ? '0.10 ± 1.96 × 0.03 = 0.10 ± 0.0588 → 0.0412 sampai 0.1588.' : 'Dengan kepercayaan 95%, proporsi formulir salah di populasi antara 4.12% dan 15.88%.'}>
      <IntervalBar
        min={0}
        max={0.25}
        ticks={[0, 0.05, 0.1, 0.15, 0.2, 0.25]}
        fmt={(v) => {
          const isTick = Math.abs(v * 20 - Math.round(v * 20)) < 1e-9; // multiples of 0.05
          return step === 5 ? `${(v * 100).toFixed(isTick ? 0 : 2)}%` : v.toFixed(isTick ? 2 : 4);
        }}
        point={0.1}
        pointLabel="p = 0.10"
        lower={0.0412}
        upper={0.1588}
      />
    </Frame>
  );
};

// =========================================================================
// ROUTER
// =========================================================================
const REGISTRY: Record<string, React.FC<{ step: number }>> = {
  'calc-mean': MeanStep,
  'calc-median': MedianStep,
  'calc-mode': ModeStep,
  'calc-range': RangeStep,
  'calc-variance': VarianceStep,
  'calc-sd': SdStep,
  'calc-zscore': ZScoreStep,
  'calc-skewness': SkewStep,
  'calc-quartiles': QuartileStep,
  'calc-five-number': FiveNumberStep,
  'calc-boxplot': BoxplotStep,
  'calc-prob-basic': ProbBasicStep,
  'calc-sample-space': SampleSpaceStep,
  'calc-contingency': ContingencyStep,
  'calc-conditional': ConditionalStep,
  'calc-tree': TreeStep,
  'calc-independence': IndependenceStep,
  'calc-discrete-dist': DiscreteDistStep,
  'calc-expected-value': ExpectedValueStep,
  'calc-combination': CombinationStep,
  'calc-binomial': BinomialStep,
  'calc-poisson': PoissonStep,
  'calc-pdf-area': PdfAreaStep,
  'calc-z-table': ZTableStep,
  'calc-uniform': UniformStep,
  'calc-exponential': ExponentialStep,
  'calc-sampling-concept': SamplingConceptStep,
  'calc-se': SeStep,
  'calc-z-mean': ZMeanStep,
  'calc-xbar-interval': XbarIntervalStep,
  'calc-z-prop': ZPropStep,
  'calc-ci-known': CiKnownStep,
  'calc-t-table': TDistStep,
  'calc-ci-unknown': CiUnknownStep,
  'calc-ci-prop': CiPropStep,
};

/** Section id → picture type, used to tag steps in mockData. */
export const CALC_SECTION_VISUALS: Record<string, string> = {
  'sec-num-1': 'calc-mean',
  'sec-num-2': 'calc-median',
  'sec-num-3': 'calc-mode',
  'sec-num-5': 'calc-range',
  'sec-num-6': 'calc-variance',
  'sec-num-7': 'calc-sd',
  'sec-num-9': 'calc-zscore',
  'sec-num-10': 'calc-skewness',
  'sec-num-12': 'calc-quartiles',
  'sec-num-13': 'calc-five-number',
  'sec-num-14': 'calc-boxplot',
  'sec-prob-1': 'calc-prob-basic',
  'sec-prob-3': 'calc-sample-space',
  'sec-prob-4': 'calc-contingency',
  'sec-prob-5': 'calc-conditional',
  'sec-prob-6': 'calc-tree',
  'sec-prob-7': 'calc-independence',
  'dpd-1-variabel-diskrit': 'calc-discrete-dist',
  'dpd-2-expected-value-variance': 'calc-expected-value',
  'dpd-4-kombinasi': 'calc-combination',
  'dpd-5-distribusi-binomial': 'calc-binomial',
  'dpd-7-distribusi-poisson': 'calc-poisson',
  'cd-2-probability-density-function': 'calc-pdf-area',
  'cd-4-transformasi-z-tabel-normal': 'calc-z-table',
  'cd-5-distribusi-uniform-pdf': 'calc-uniform',
  'cd-7-distribusi-eksponensial': 'calc-exponential',
  'sd-1-konsep-sampling-distribution': 'calc-sampling-concept',
  'sd-2-standard-error-mean': 'calc-se',
  'sd-4-z-sample-mean': 'calc-z-mean',
  'sd-5-finding-xbar': 'calc-xbar-interval',
  'sd-7-z-proportion': 'calc-z-prop',
  'ci-2-mean-sigma-known': 'calc-ci-known',
  'ci-3-distribusi-t': 'calc-t-table',
  'ci-4-mean-sigma-unknown': 'calc-ci-unknown',
  'ci-5-proportion': 'calc-ci-prop',
};

export const CalcStepVisual: React.FC<{ type: string; step: number }> = ({ type, step }) => {
  const Comp = REGISTRY[type];
  return Comp ? <Comp step={step} /> : null;
};
