import React from 'react';
import { BarPieStepSnapshot } from './OrganizingVisuals';
import { CalcStepVisual } from './CalcStepVisuals';
import {
  Cell,
  FILL,
  Frame,
  GRID,
  INK,
  MUTED,
  MiniTable,
  NEW,
  PRIMARY,
  PX0,
  PX1,
  PY0,
  PY1,
  Svg,
  XBase,
  YAxis,
  c,
  sx,
  sy,
} from './StepVisualKit';

// =========================================================================
// STEP VISUALS: one small picture per "Cara Membuat" step.
// Each picture shows the chart AS IT LOOKS AFTER that step; the part that
// the step adds is drawn in the highlight color (red).
// Data mirrors the matching interactive visual in OrganizingVisuals.tsx.
// =========================================================================

// =========================================================================
// 1. TABEL RINGKASAN & KONTINGENSI
// =========================================================================
const PAYMENT = [
  { m: 'E-Wallet', f: 80 },
  { m: 'Virtual Account', f: 50 },
  { m: 'Kartu Kredit', f: 40 },
  { m: 'COD', f: 30 },
];
const CONTINGENCY = [
  { tipe: 'Pelanggan Baru', v: [50, 15, 10, 25] },
  { tipe: 'Pelanggan Setia', v: [30, 35, 30, 5] },
];

const TableStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    return (
      <Frame note="Setiap transaksi masuk ke tepat satu kotak kategori: tidak ada yang ganda atau tertinggal.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PAYMENT.map((p) => (
            <div key={p.m} className="p-2 rounded-lg border-2 border-[#ba1a1a] bg-surface-container-lowest text-center text-xs font-bold text-black">
              {p.m}
            </div>
          ))}
        </div>
      </Frame>
    );
  }
  const head = [c('Tipe \\ Metode'), ...PAYMENT.map((p) => c(p.m))];
  if (step === 2) {
    return (
      <Frame note="Isi setiap sel dengan banyaknya transaksi pada persilangan baris dan kolom.">
        <MiniTable headers={head} rows={CONTINGENCY.map((r) => [c(r.tipe), ...r.v.map((v) => c(v, true))])} />
      </Frame>
    );
  }
  const rowTotal = (r: { v: number[] }) => r.v.reduce((a, b) => a + b, 0);
  if (step === 3) {
    return (
      <Frame note="Total baris (100 + 100) dan total kolom (80 + 50 + 40 + 30) sama-sama menghasilkan grand total 200.">
        <MiniTable
          headers={[...head, c('Total', true)]}
          rows={CONTINGENCY.map((r) => [c(r.tipe), ...r.v.map((v) => c(v)), c(rowTotal(r), true)])}
          footer={[c('Total', true), ...PAYMENT.map((p) => c(p.f, true)), c(200, true)]}
        />
      </Frame>
    );
  }
  return (
    <Frame note="Persentase terhadap grand total: misalnya 50 / 200 × 100% = 25.0%.">
      <MiniTable
        headers={[...head, c('Total')]}
        rows={CONTINGENCY.map((r) => [c(r.tipe), ...r.v.map((v) => c(`${((v / 200) * 100).toFixed(1)}%`, true)), c(`${(rowTotal(r) / 2).toFixed(1)}%`, true)])}
        footer={[c('Total'), ...PAYMENT.map((p) => c(`${((p.f / 200) * 100).toFixed(1)}%`, true)), c('100%', true)]}
      />
    </Frame>
  );
};

// =========================================================================
// 2. DIAGRAM PARETO
// =========================================================================
const PARETO_RAW = [
  { d: 'Kesalahan Invoice', f: 10 },
  { d: 'Kemasan Rusak', f: 84 },
  { d: 'Respon CS Lambat', f: 16 },
  { d: 'Pengiriman Terlambat', f: 60 },
  { d: 'Barang Tidak Sesuai', f: 30 },
];
const PARETO_SORTED = [...PARETO_RAW].sort((a, b) => b.f - a.f);

const ParetoStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    return (
      <Frame note="Catat setiap jenis keluhan dan hitung frekuensinya (belum diurutkan).">
        <MiniTable headers={[c('Jenis Keluhan'), c('f')]} rows={PARETO_RAW.map((r) => [c(r.d), c(r.f, true)])} footer={[c('Total'), c(200)]} />
      </Frame>
    );
  }
  if (step === 2) {
    return (
      <Frame note="Urutkan dari frekuensi terbesar (84) ke terkecil (10).">
        <MiniTable headers={[c('Urutan', true), c('Jenis Keluhan'), c('f')]} rows={PARETO_SORTED.map((r, i) => [c(i + 1, true), c(r.d), c(r.f, true)])} footer={[c(''), c('Total'), c(200)]} />
      </Frame>
    );
  }
  let cum = 0;
  const rows = PARETO_SORTED.map((r) => {
    const pct = (r.f / 200) * 100;
    cum += pct;
    return { ...r, pct, cum };
  });
  if (step === 3) {
    return (
      <Frame note="% = f / 200 × 100%. Kumulatif = jumlah berjalan: 42% → 42% + 30% = 72% → … → 100%.">
        <MiniTable
          headers={[c('Jenis Keluhan'), c('f'), c('%', true), c('% Kumulatif', true)]}
          rows={rows.map((r) => [c(r.d), c(r.f), c(`${r.pct.toFixed(0)}%`, true), c(`${r.cum.toFixed(0)}%`, true)])}
        />
      </Frame>
    );
  }
  const slot = (PX1 - PX0) / rows.length;
  const pts = rows.map((r, i) => ({ x: PX0 + (i + 0.5) * slot, y: sy(r.cum, 0, 100) }));
  return (
    <Frame note="Batang = frekuensi (sumbu kiri). Garis = persentase kumulatif (sumbu kanan). Dua keluhan teratas sudah mencakup 72%.">
      <Svg h={235}>
        <YAxis ticks={[0, 50, 100, 150, 200]} min={0} max={200} grid={false} />
        <YAxis ticks={[0, 20, 40, 60, 80, 100]} min={0} max={100} x={PX1} right fmt={(v) => `${v}%`} color={NEW} grid={false} />
        <line x1={PX0} y1={sy(80, 0, 100)} x2={PX1} y2={sy(80, 0, 100)} stroke={NEW} strokeDasharray="4 3" opacity="0.6" />
        <XBase />
        {rows.map((r, i) => {
          const h = PY1 - sy(r.f, 0, 200);
          return <rect key={r.d} x={PX0 + i * slot + 4} y={PY1 - h} width={slot - 8} height={h} fill={FILL} rx="2" />;
        })}
        <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={NEW} strokeWidth="2.5" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill={NEW} />
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="9" fontWeight="bold" fill={NEW} fontFamily="monospace">
              {rows[i].cum.toFixed(0)}%
            </text>
          </g>
        ))}
        {rows.map((r, i) => (
          <text key={r.d} x={PX0 + (i + 0.5) * slot} y={PY1 + 14} textAnchor="middle" fontSize="8.5" fill={MUTED}>
            {r.d.split(' ')[0]}
          </text>
        ))}
      </Svg>
    </Frame>
  );
};

// =========================================================================
// 3. SIDE-BY-SIDE BAR CHART
// =========================================================================
const MEDIA = [
  { m: 'Video Interaktif', y1: 60, y4: 30 },
  { m: 'E-Book / Modul', y1: 25, y4: 45 },
  { m: 'Diskusi Forum', y1: 15, y4: 25 },
];
const Y1_COLOR = '#0d9488';
const Y4_COLOR = '#f59e0b';

const SideBySideStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    return (
      <Frame note="Tabel kontingensi: media belajar (baris) × tahun angkatan (kolom), masing-masing kelompok n = 100.">
        <MiniTable
          headers={[c('Media Belajar'), c('Tahun 1'), c('Tahun 4')]}
          rows={MEDIA.map((r) => [c(r.m), c(`${r.y1}%`, true), c(`${r.y4}%`, true)])}
          footer={[c('Total'), c('100%'), c('100%')]}
        />
      </Frame>
    );
  }
  const slot = (PX1 - PX0) / MEDIA.length;
  const bw = 34;
  return (
    <Frame
      note={
        step === 2
          ? 'Media belajar dipilih sebagai variabel utama di sumbu X; sumbu Y adalah persentase mulai dari 0.'
          : step === 3
            ? 'Di setiap kelompok media, batang Tahun 1 dan Tahun 4 digambar bersebelahan.'
            : 'Warna kontras + legenda membuat perbandingan antarangkatan langsung terbaca.'
      }
    >
      <Svg h={240}>
        <YAxis ticks={[0, 20, 40, 60, 80]} min={0} max={80} fmt={(v) => `${v}%`} />
        <XBase color={step === 2 ? NEW : MUTED} />
        {MEDIA.map((r, i) => {
          const cx = PX0 + (i + 0.5) * slot;
          const h1 = PY1 - sy(r.y1, 0, 80);
          const h4 = PY1 - sy(r.y4, 0, 80);
          return (
            <g key={r.m}>
              <text x={cx} y={PY1 + 15} textAnchor="middle" fontSize="10" fontWeight="600" fill={step === 2 ? NEW : MUTED}>
                {r.m}
              </text>
              {step >= 3 && (
                <g>
                  <rect x={cx - bw} y={PY1 - h1} width={bw} height={h1} fill={step >= 4 ? Y1_COLOR : '#94a3b8'} stroke={step === 3 ? NEW : 'none'} strokeWidth="2" />
                  <rect x={cx} y={PY1 - h4} width={bw} height={h4} fill={step >= 4 ? Y4_COLOR : '#cbd5e1'} stroke={step === 3 ? NEW : 'none'} strokeWidth="2" />
                  {step >= 4 && (
                    <g fontSize="9" fontWeight="bold" fill={INK} fontFamily="monospace" textAnchor="middle">
                      <text x={cx - bw / 2} y={PY1 - h1 - 4}>
                        {r.y1}%
                      </text>
                      <text x={cx + bw / 2} y={PY1 - h4 - 4}>
                        {r.y4}%
                      </text>
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}
        {step >= 4 && (
          <g>
            <rect x={PX1 - 120} y={4} width="116" height="34" rx="4" fill="#ffffff" stroke={NEW} strokeWidth="1.5" />
            <rect x={PX1 - 112} y={11} width="10" height="8" fill={Y1_COLOR} />
            <text x={PX1 - 97} y={19} fontSize="10" fill={INK}>
              Tahun 1
            </text>
            <rect x={PX1 - 112} y={24} width="10" height="8" fill={Y4_COLOR} />
            <text x={PX1 - 97} y={32} fontSize="10" fill={INK}>
              Tahun 4
            </text>
          </g>
        )}
      </Svg>
    </Frame>
  );
};

// =========================================================================
// 4. STEM-AND-LEAF
// =========================================================================
const STEM_RAW = [72, 65, 84, 52, 75, 91, 68, 78, 48, 80, 64, 75, 89, 57, 98, 71, 82, 87, 61, 95];
const STEMS = [4, 5, 6, 7, 8, 9];

const StemLeafStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    return (
      <Frame note="Puluhan menjadi batang (stem), satuan menjadi daun (leaf). Contoh: 72 → batang 7, daun 2.">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {STEM_RAW.map((v, i) => (
            <div key={i} className="px-1 py-1 rounded-md bg-surface-container-lowest border border-outline-variant/50 text-center font-mono text-xs text-black">
              <span className="font-bold">{Math.floor(v / 10)}</span>
              <span className="text-on-surface-variant">|</span>
              <span className="font-bold" style={{ color: NEW }}>
                {v % 10}
              </span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }
  const leavesInOrder = (s: number) => STEM_RAW.filter((v) => Math.floor(v / 10) === s).map((v) => v % 10);
  return (
    <Frame
      note={
        step === 2
          ? 'Batang 4 sampai 9 ditulis menurun ke bawah di kiri garis vertikal.'
          : step === 3
            ? 'Daun ditulis sesuai urutan data mentah (belum terurut).'
            : 'Daun di setiap baris diurutkan dari kecil ke besar, dan kunci pembacaan dicantumkan.'
      }
    >
      <div className="inline-block rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-3 py-2 font-mono text-sm text-black">
        {STEMS.map((s) => {
          const leaves = step >= 4 ? [...leavesInOrder(s)].sort((a, b) => a - b) : leavesInOrder(s);
          return (
            <div key={s} className="flex items-center gap-2 leading-7">
              <span className="w-4 text-right font-bold" style={{ color: step === 2 ? NEW : INK }}>
                {s}
              </span>
              <span className="text-on-surface-variant">|</span>
              <span className="tracking-[0.35em]" style={{ color: step >= 3 ? NEW : 'transparent' }}>
                {step >= 3 ? leaves.join('') : '·'}
              </span>
            </div>
          );
        })}
        {step >= 4 && (
          <div className="mt-1 pt-1 border-t border-outline-variant/50 text-xs font-sans font-bold" style={{ color: NEW }}>
            Kunci: 7 | 2 = 72
          </div>
        )}
      </div>
    </Frame>
  );
};

// =========================================================================
// 5. DISTRIBUSI FREKUENSI (n = 50, min 120, max 320)
// =========================================================================
const FD_CLASSES = [
  { lo: 120, hi: 155, f: 6 },
  { lo: 155, hi: 190, f: 15 },
  { lo: 190, hi: 225, f: 14 },
  { lo: 225, hi: 260, f: 8 },
  { lo: 260, hi: 295, f: 5 },
  { lo: 295, hi: 330, f: 2 },
];

const FreqDistStep: React.FC<{ step: number }> = ({ step }) => {
  const lineMin = 110;
  const lineMax = 340;
  const lx = (v: number) => 20 + ((v - lineMin) / (lineMax - lineMin)) * 360;

  if (step === 1) {
    return (
      <Frame note="Range = Maks − Min = 320 − 120 = 200 detik.">
        <Svg h={80}>
          <line x1="20" y1="40" x2="380" y2="40" stroke={MUTED} strokeWidth="1.5" />
          <line x1={lx(120)} y1="40" x2={lx(320)} y2="40" stroke={NEW} strokeWidth="5" />
          {[120, 320].map((v) => (
            <g key={v}>
              <circle cx={lx(v)} cy="40" r="5" fill={NEW} />
              <text x={lx(v)} y="62" textAnchor="middle" fontSize="11" fontWeight="bold" fill={INK} fontFamily="monospace">
                {v}
              </text>
            </g>
          ))}
          <text x={lx(220)} y="28" textAnchor="middle" fontSize="12" fontWeight="bold" fill={NEW}>
            Range = 200
          </text>
          <text x={lx(120)} y="20" textAnchor="middle" fontSize="10" fill={MUTED}>
            Min
          </text>
          <text x={lx(320)} y="20" textAnchor="middle" fontSize="10" fill={MUTED}>
            Maks
          </text>
        </Svg>
      </Frame>
    );
  }
  if (step === 2) {
    return (
      <Frame note="Cari k terkecil dengan 2^k ≥ n = 50 → k = 6 kelas.">
        <MiniTable
          headers={[c('k'), c('2^k'), c('≥ 50?')]}
          rows={[4, 5, 6].map((k) => [c(k, k === 6), c(2 ** k, k === 6), c(2 ** k >= 50 ? 'Ya ✓' : 'Belum ✗', k === 6)])}
        />
      </Frame>
    );
  }
  if (step === 3) {
    const raw = 200 / 6;
    return (
      <Frame note="w = 200 / 6 = 33.3 → dibulatkan ke atas menjadi 35 agar mudah dibaca. 6 × 35 = 210 ≥ 200, jadi semua data tercakup.">
        <Svg h={90}>
          <text x="20" y="18" fontSize="10" fill={MUTED}>
            w = 33.3 (belum dibulatkan)
          </text>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={lx(120 + i * raw)} y="24" width={lx(120 + raw) - lx(120) - 1} height="14" fill="#cbd5e1" />
          ))}
          <text x="20" y="58" fontSize="10" fontWeight="bold" fill={NEW}>
            w = 35 (dibulatkan ke atas)
          </text>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={lx(120 + i * 35)} y="64" width={lx(155) - lx(120) - 1} height="14" fill={i % 2 ? '#ffdad6' : NEW} opacity="0.85" />
          ))}
        </Svg>
      </Frame>
    );
  }
  if (step === 4) {
    return (
      <Frame note="Mulai dari 120, tambahkan 35 berulang: 120, 155, 190, 225, 260, 295, 330. Kelas ditulis 120 s/d < 155, dst.">
        <Svg h={80}>
          <line x1="20" y1="40" x2="380" y2="40" stroke={MUTED} strokeWidth="1.5" />
          {FD_CLASSES.map((k, i) => (
            <rect key={i} x={lx(k.lo)} y="30" width={lx(k.hi) - lx(k.lo)} height="20" fill={i % 2 ? '#ffdad6' : '#fff1ef'} stroke={NEW} strokeWidth="1" />
          ))}
          {[120, 155, 190, 225, 260, 295, 330].map((b) => (
            <text key={b} x={lx(b)} y="66" textAnchor="middle" fontSize="10" fontWeight="bold" fill={NEW} fontFamily="monospace">
              {b}
            </text>
          ))}
        </Svg>
      </Frame>
    );
  }
  let cum = 0;
  return (
    <Frame note="Persentase = f / 50 × 100%; kumulatif dijumlahkan berjalan hingga 100%.">
      <MiniTable
        headers={[c('Interval Kelas'), c('f', true), c('%', true), c('% Kumulatif', true)]}
        rows={FD_CLASSES.map((k) => {
          const pct = (k.f / 50) * 100;
          cum += pct;
          return [c(`${k.lo} s/d < ${k.hi}`), c(k.f, true), c(`${pct.toFixed(0)}%`, true), c(`${cum.toFixed(0)}%`, true)];
        })}
        footer={[c('Total'), c(50), c('100%'), c('')]}
      />
    </Frame>
  );
};

// =========================================================================
// 6. HISTOGRAM & POLIGON FREKUENSI (5 kelas, lebar 40)
// =========================================================================
const HIST = [
  { lo: 120, hi: 160, f: 7 },
  { lo: 160, hi: 200, f: 18 },
  { lo: 200, hi: 240, f: 14 },
  { lo: 240, hi: 280, f: 7 },
  { lo: 280, hi: 320, f: 4 },
];

const HistogramStep: React.FC<{ step: number }> = ({ step }) => {
  const xMin = 80;
  const xMax = 360;
  const X = (v: number) => sx(v, xMin, xMax);
  const Y = (f: number) => sy(f, 0, 20);
  const bounds = [120, 160, 200, 240, 280, 320];
  const poly = [{ x: 100, f: 0 }, ...HIST.map((h) => ({ x: (h.lo + h.hi) / 2, f: h.f })), { x: 340, f: 0 }];

  return (
    <Frame
      note={
        step === 1
          ? 'Sumbu X diberi batas-batas kelas: 120, 160, 200, 240, 280, 320.'
          : step === 2
            ? 'Sumbu Y = frekuensi, mulai dari 0 dengan skala sama (0, 5, 10, 15, 20).'
            : step === 3
              ? 'Kolom selebar interval kelas dan saling menempel (tanpa celah) karena data kontinu.'
              : 'Titik tengah puncak tiap kolom dihubungkan, lalu ditutup ke f = 0 di titik tengah kelas fiktif (100 dan 340).'
      }
    >
      <Svg h={215}>
        {step >= 2 && <YAxis ticks={[0, 5, 10, 15, 20]} min={0} max={20} color={step === 2 ? NEW : MUTED} />}
        <XBase color={step === 1 ? NEW : MUTED} />
        {bounds.map((b) => (
          <g key={b}>
            <line x1={X(b)} y1={PY1} x2={X(b)} y2={PY1 + 4} stroke={step === 1 ? NEW : MUTED} />
            <text x={X(b)} y={PY1 + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 1 ? NEW : MUTED} fontFamily="monospace">
              {b}
            </text>
          </g>
        ))}
        {step >= 3 &&
          HIST.map((h) => (
            <rect
              key={h.lo}
              x={X(h.lo)}
              y={Y(h.f)}
              width={X(h.hi) - X(h.lo)}
              height={PY1 - Y(h.f)}
              fill={step === 3 ? '#ffdad6' : '#97f4d5'}
              stroke={step === 3 ? NEW : PRIMARY}
              strokeWidth="1.5"
            />
          ))}
        {step >= 4 && (
          <g>
            <polyline points={poly.map((p) => `${X(p.x)},${Y(p.f)}`).join(' ')} fill="none" stroke={NEW} strokeWidth="2.5" />
            {poly.map((p, i) => (
              <circle key={i} cx={X(p.x)} cy={Y(p.f)} r="3.5" fill={NEW} />
            ))}
          </g>
        )}
      </Svg>
    </Frame>
  );
};

// =========================================================================
// 7. OGIVE (POLIGON KUMULATIF)
// =========================================================================
const OGIVE = [
  { x: 120, cum: 0 },
  { x: 160, cum: 14 },
  { x: 200, cum: 50 },
  { x: 240, cum: 78 },
  { x: 280, cum: 92 },
  { x: 320, cum: 100 },
];

const OgiveStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    let cum = 0;
    return (
      <Frame note="% kumulatif = jumlah berjalan persentase: 14% → 14% + 36% = 50% → … → 100%.">
        <MiniTable
          headers={[c('Kelas'), c('f'), c('%'), c('% Kumulatif', true)]}
          rows={HIST.map((h) => {
            const pct = (h.f / 50) * 100;
            cum += pct;
            return [c(`${h.lo} s/d < ${h.hi}`), c(h.f), c(`${pct.toFixed(0)}%`), c(`${cum.toFixed(0)}%`, true)];
          })}
        />
      </Frame>
    );
  }
  const X = (v: number) => sx(v, 110, 330);
  const Y = (p: number) => sy(p, 0, 100);
  const shown = step === 3 ? OGIVE.slice(0, 1) : step >= 4 ? OGIVE : [];
  return (
    <Frame
      note={
        step === 2
          ? 'Sumbu X = batas kelas (120 sampai 320), sumbu Y = persentase kumulatif 0% sampai 100%.'
          : step === 3
            ? 'Titik pertama (120, 0%): belum ada data di bawah batas bawah kelas pertama.'
            : 'Plot (batas atas kelas, % kumulatif) lalu hubungkan hingga 100% di 320.'
      }
    >
      <Svg h={215}>
        <YAxis ticks={[0, 25, 50, 75, 100]} min={0} max={100} fmt={(v) => `${v}%`} color={step === 2 ? NEW : MUTED} />
        <XBase color={step === 2 ? NEW : MUTED} />
        {OGIVE.map((p) => (
          <text key={p.x} x={X(p.x)} y={PY1 + 16} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 2 ? NEW : MUTED} fontFamily="monospace">
            {p.x}
          </text>
        ))}
        {step >= 4 && <polyline points={OGIVE.map((p) => `${X(p.x)},${Y(p.cum)}`).join(' ')} fill="none" stroke={NEW} strokeWidth="2.5" />}
        {shown.map((p) => (
          <g key={p.x}>
            <circle cx={X(p.x)} cy={Y(p.cum)} r="4" fill={NEW} />
            <text x={X(p.x) + (p.cum === 100 ? -6 : 6)} y={Y(p.cum) - 6} textAnchor={p.cum === 100 ? 'end' : 'start'} fontSize="9" fontWeight="bold" fill={NEW} fontFamily="monospace">
              ({p.x}, {p.cum}%)
            </text>
          </g>
        ))}
      </Svg>
    </Frame>
  );
};

// =========================================================================
// 8. SCATTER PLOT & TIME SERIES
// =========================================================================
const SCATTER = [
  { x: 1, y: 55 },
  { x: 2, y: 60 },
  { x: 2.5, y: 68 },
  { x: 3, y: 70 },
  { x: 3.5, y: 75 },
  { x: 4, y: 82 },
  { x: 5, y: 88 },
  { x: 6, y: 95 },
];
const TS = [420, 460, 450, 510, 540, 580, 620, 610, 680, 720, 750, 820];
const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

function leastSquares(pts: { x: number; y: number }[]) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const b1 = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  return { b0: my - b1 * mx, b1 };
}

const ScatterStep: React.FC<{ step: number }> = ({ step }) => {
  const X = (v: number) => sx(v, 0, 7);
  const Y = (v: number) => sy(v, 40, 100);
  const { b0, b1 } = leastSquares(SCATTER);

  return (
    <Frame
      note={
        step === 1
          ? 'Variabel independen (jam belajar) di sumbu X, variabel dependen (nilai ujian) di sumbu Y. Untuk time series, waktu di sumbu X.'
          : step === 2
            ? 'Skala linier seragam: jarak 1 jam selalu sama, jarak 10 poin nilai selalu sama.'
            : step === 3
              ? 'Setiap mahasiswa menjadi satu titik (xᵢ, yᵢ), contoh (3, 70).'
              : 'Scatter: garis tren linear mengikuti pola naik. Time series: titik berurutan dihubungkan garis.'
      }
    >
      <Svg h={225}>
        {step >= 2 ? (
          <YAxis ticks={[40, 60, 80, 100]} min={40} max={100} color={step === 2 ? NEW : MUTED} />
        ) : (
          <line x1={PX0} y1={PY0 - 4} x2={PX0} y2={PY1} stroke={NEW} strokeWidth="2.5" />
        )}
        <XBase color={step <= 2 ? NEW : MUTED} />
        {step >= 2 &&
          [0, 1, 2, 3, 4, 5, 6, 7].map((t) => (
            <text key={t} x={X(t)} y={PY1 + 14} textAnchor="middle" fontSize="10" fill={step === 2 ? NEW : MUTED} fontFamily="monospace">
              {t}
            </text>
          ))}
        <text x={(PX0 + PX1) / 2} y={PY1 + 30} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 1 ? NEW : INK}>
          X: Jam Belajar Mandiri per Minggu
        </text>
        <text x="12" y={(PY0 + PY1) / 2} textAnchor="middle" fontSize="10" fontWeight="bold" fill={step === 1 ? NEW : INK} transform={`rotate(-90 12 ${(PY0 + PY1) / 2})`}>
          Y: Nilai Ujian
        </text>
        {step >= 3 &&
          SCATTER.map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r="4.5" fill={step === 3 ? NEW : FILL} />)}
        {step === 3 && (
          <text x={X(3) + 8} y={Y(70) + 14} fontSize="9" fontWeight="bold" fill={NEW} fontFamily="monospace">
            (3, 70)
          </text>
        )}
        {step >= 4 && <line x1={X(0.5)} y1={Y(b0 + b1 * 0.5)} x2={X(6.5)} y2={Y(b0 + b1 * 6.5)} stroke={NEW} strokeWidth="2.5" strokeDasharray="6 3" />}
      </Svg>
      {step >= 4 && (
        <Svg h={110}>
          <text x="10" y="12" fontSize="10" fontWeight="bold" fill={INK}>
            Time series: nilai bulanan Jan–Des
          </text>
          <line x1="30" y1="90" x2="390" y2="90" stroke={MUTED} strokeWidth="1.5" />
          <polyline
            points={TS.map((v, i) => `${30 + (i + 0.5) * 30},${90 - ((v - 400) / 450) * 70}`).join(' ')}
            fill="none"
            stroke={NEW}
            strokeWidth="2.5"
          />
          {TS.map((v, i) => (
            <g key={i}>
              <circle cx={30 + (i + 0.5) * 30} cy={90 - ((v - 400) / 450) * 70} r="3" fill={NEW} />
              <text x={30 + (i + 0.5) * 30} y="104" textAnchor="middle" fontSize="9" fill={MUTED}>
                {MONTHS[i]}
              </text>
            </g>
          ))}
        </Svg>
      )}
    </Frame>
  );
};

// =========================================================================
// 9. ETIKA VISUALISASI: SALAH vs BENAR
// =========================================================================
const Compare: React.FC<{ bad: React.ReactNode; good: React.ReactNode; badLabel: string; goodLabel: string }> = ({ bad, good, badLabel, goodLabel }) => (
  <div className="grid grid-cols-2 gap-2">
    <div className="rounded-lg border-2 border-[#ba1a1a] bg-surface-container-lowest p-1.5 space-y-1">
      <div className="text-xs font-bold text-[#ba1a1a]">✗ {badLabel}</div>
      {bad}
    </div>
    <div className="rounded-lg border-2 border-[#00614d] bg-surface-container-lowest p-1.5 space-y-1">
      <div className="text-xs font-bold text-[#00614d]">✓ {goodLabel}</div>
      {good}
    </div>
  </div>
);

const TwoBars: React.FC<{ min: number; max: number; ticks: number[]; color: string; bare?: boolean }> = ({ min, max, ticks, color, bare }) => {
  const Y = (v: number) => 130 - ((v - min) / (max - min)) * 110;
  return (
    <svg viewBox="0 0 180 150" className="w-full h-auto">
      {!bare &&
        ticks.map((t) => (
          <text key={t} x="28" y={Y(t) + 3} textAnchor="end" fontSize="9" fill={MUTED} fontFamily="monospace">
            {t}
          </text>
        ))}
      <line x1="32" y1="15" x2="32" y2="130" stroke={MUTED} />
      <line x1="32" y1="130" x2="175" y2="130" stroke={MUTED} />
      {[
        { l: 'A', v: 100 },
        { l: 'B', v: 105 },
      ].map((b, i) => (
        <g key={b.l}>
          <rect x={55 + i * 60} y={Y(b.v)} width="36" height={130 - Y(b.v)} fill={color} />
          {!bare && (
            <text x={73 + i * 60} y="142" textAnchor="middle" fontSize="9" fill={MUTED}>
              Produk {b.l}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
};

const MisleadingStep: React.FC<{ step: number }> = ({ step }) => {
  if (step === 1) {
    return (
      <Frame note="Produk B hanya 5% lebih tinggi (105 vs 100), tetapi sumbu yang dipotong di 98 membuatnya tampak 3,5× lebih tinggi.">
        <Compare badLabel="Sumbu mulai 98" goodLabel="Sumbu mulai 0" bad={<TwoBars min={98} max={106} ticks={[98, 102, 106]} color="#e11d48" />} good={<TwoBars min={0} max={120} ticks={[0, 60, 120]} color={FILL} />} />
      </Frame>
    );
  }
  if (step === 2) {
    const badTicks = [0, 10, 20, 50, 100];
    const goodTicks = [0, 25, 50, 75, 100];
    const axis = (ticks: number[], uniform: boolean, color: string) => (
      <svg viewBox="0 0 180 60" className="w-full h-auto">
        <line x1="10" y1="30" x2="170" y2="30" stroke={MUTED} />
        {ticks.map((t, i) => {
          const x = uniform ? 10 + (t / 100) * 160 : 10 + i * 40;
          return (
            <g key={t}>
              <line x1={x} y1="25" x2={x} y2="35" stroke={color} strokeWidth="2" />
              <text x={x} y="50" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color} fontFamily="monospace">
                {t}
              </text>
            </g>
          );
        })}
      </svg>
    );
    return (
      <Frame note="Kiri: jarak 0→10 sama dengan 50→100 sehingga perubahan besar tampak kecil. Kanan: setiap 25 satuan berjarak sama.">
        <Compare badLabel="Jarak skala tidak seragam" goodLabel="Skala linier seragam" bad={axis(badTicks, false, '#e11d48')} good={axis(goodTicks, true, PRIMARY)} />
      </Frame>
    );
  }
  if (step === 3) {
    // Same data (A 35%, B 35%, C 30%); the tilted 3D pie makes the front slice C look biggest.
    const slices = [
      { p: 35, col: '#0d9488' },
      { p: 35, col: '#0284c7' },
      { p: 30, col: '#f59e0b' },
    ];
    const pie = (tilt: boolean) => {
      let a = tilt ? 300 : 0;
      const cx = 90;
      const cy = tilt ? 55 : 65;
      const r = 55;
      const ry = tilt ? 0.42 : 1;
      return (
        <svg viewBox="0 0 180 130" className="w-full h-auto">
          {tilt && <ellipse cx={cx} cy={cy + 14} rx={r} ry={r * ry} fill="#94a3b8" />}
          {slices.map((s, i) => {
            const start = a;
            a += s.p * 3.6;
            const p1 = { x: cx + r * Math.sin((start * Math.PI) / 180), y: cy - r * ry * Math.cos((start * Math.PI) / 180) };
            const p2 = { x: cx + r * Math.sin((a * Math.PI) / 180), y: cy - r * ry * Math.cos((a * Math.PI) / 180) };
            return <path key={i} d={`M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r * ry} 0 ${s.p > 50 ? 1 : 0} 1 ${p2.x} ${p2.y} Z`} fill={s.col} stroke="#ffffff" strokeWidth="1.5" />;
          })}
          {!tilt && (
            <g fontSize="9" fontWeight="bold" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" paintOrder="stroke" textAnchor="middle" fontFamily="monospace">
              <text x="125" y="55">
                35%
              </text>
              <text x="90" y="112">
                35%
              </text>
              <text x="52" y="50">
                30%
              </text>
            </g>
          )}
        </svg>
      );
    };
    return (
      <Frame note="Data sama persis (35%, 35%, 30%). Efek 3D miring membuat juring paling depan tampak jauh lebih besar.">
        <Compare badLabel="Pie 3D miring" goodLabel="Pie 2D datar" bad={pie(true)} good={pie(false)} />
      </Frame>
    );
  }
  return (
    <Frame note="Grafik yang benar menyebutkan judul, satuan, ukuran sampel n, dan sumber data.">
      <Compare
        badLabel="Tanpa konteks"
        goodLabel="Lengkap"
        bad={<TwoBars min={0} max={120} ticks={[0, 60, 120]} color="#94a3b8" bare />}
        good={
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-black leading-tight">Rata-rata Penjualan Harian (unit), n = 30 hari</div>
            <TwoBars min={0} max={120} ticks={[0, 60, 120]} color={FILL} />
            <div className="text-xs text-on-surface-variant">Sumber: (contoh) catatan penjualan toko</div>
          </div>
        }
      />
    </Frame>
  );
};

// =========================================================================
// ROUTER
// =========================================================================
export const StepVisual: React.FC<{ type: string; step: number }> = ({ type, step }) => {
  switch (type) {
    case 'bar-build':
      return <BarPieStepSnapshot chartType="bar" step={step} />;
    case 'pie-build':
      return <BarPieStepSnapshot chartType="pie" step={step} />;
    case 'summary-table-build':
      return <TableStep step={step} />;
    case 'pareto-build':
      return <ParetoStep step={step} />;
    case 'side-by-side-build':
      return <SideBySideStep step={step} />;
    case 'stem-leaf-build':
      return <StemLeafStep step={step} />;
    case 'freq-dist-build':
      return <FreqDistStep step={step} />;
    case 'histogram-build':
      return <HistogramStep step={step} />;
    case 'ogive-build':
      return <OgiveStep step={step} />;
    case 'scatter-build':
      return <ScatterStep step={step} />;
    case 'misleading-build':
      return <MisleadingStep step={step} />;
    default:
      return <CalcStepVisual type={type} step={step} />;
  }
};
