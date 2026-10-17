import React, { useState } from 'react';
import {
  datasetA,
  datasetB,
  growthRatesData,
  cvComparisonData,
  zScoreDemoData,
  studyExamData,
} from '../data/measureSampleData';
import { RichText } from './RichText';

// Helper Stepper for "Lihat cara menghitungnya"
interface StepperProps {
  steps: {
    title: string;
    description: string;
    formula?: string;
    substitution: string;
    result?: string;
  }[];
}

export const CalculationStepper: React.FC<StepperProps> = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = steps[currentStep];

  return (
    <div className="mt-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-outline-variant/40">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center shadow-2xs">
            {currentStep + 1}
          </span>
          <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Lihat Cara Menghitungnya
          </span>
          <span className="text-[11px] text-on-surface-variant font-medium">
            (Langkah {currentStep + 1} dari {steps.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStep === steps.length - 1}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Langkah Berikutnya →
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-black">
            arrow_right_alt
          </span>
          <span className="text-black font-bold">
            <RichText text={step.title} />
          </span>
        </div>
        <p className="text-xs sm:text-sm text-black font-semibold leading-relaxed">
          <RichText text={step.description} />
        </p>
        {step.formula && (
          <div className="text-xs font-mono font-bold text-black bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/50">
            Rumus: {step.formula}
          </div>
        )}
        <div className="p-3.5 sm:p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 text-xs sm:text-sm font-mono space-y-2">
          <div className="text-black font-extrabold text-xs sm:text-sm font-sans uppercase tracking-wider">
            Substitusi Angka Nyata:
          </div>
          <div className="text-black font-extrabold text-sm sm:text-base leading-relaxed break-words">
            <RichText text={step.substitution} />
          </div>
          {step.result && (
            <div className="text-xs sm:text-sm font-sans text-black font-extrabold pt-2 border-t border-outline-variant/50">
              <span className="text-black font-extrabold">
                <RichText text={step.result} />
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentStep(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === currentStep ? 'w-6 bg-primary' : 'w-2 bg-surface-container-high'
            }`}
            aria-label={`Ke langkah ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// 1. MEAN, MEDIAN, MODE VISUAL
// =========================================================================
export const MeanMedianModeVisual: React.FC = () => {
  // Initial points chosen so Mean (26.0) and Median (20.0) are far apart and clearly not sticking together
  const initialDataPoints = [12, 14, 16, 20, 20, 42, 58];
  const [points, setPoints] = useState<number[]>([...initialDataPoints]);
  const [hasOutlier, setHasOutlier] = useState(false);

  const calculateStats = (vals: number[]) => {
    const sorted = [...vals].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = sum / sorted.length;

    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    const freq: Record<number, number> = {};
    vals.forEach((v) => {
      freq[v] = (freq[v] || 0) + 1;
    });
    let maxFreq = 0;
    let modeVal: number | null = null;
    Object.entries(freq).forEach(([k, f]) => {
      if (f > maxFreq) {
        maxFreq = f;
        modeVal = Number(k);
      }
    });

    return { mean, median, mode: modeVal, sorted, sum };
  };

  const { mean, median, mode, sorted, sum } = calculateStats(points);

  const handleAddOutlier = () => {
    if (!hasOutlier) {
      setPoints([...initialDataPoints, 60]);
      setHasOutlier(true);
    } else {
      setPoints([...initialDataPoints]);
      setHasOutlier(false);
    }
  };

  const handlePointDrag = (index: number, newX: number) => {
    const clamped = Math.max(10, Math.min(65, Math.round(newX)));
    const updated = [...points];
    updated[index] = clamped;
    setPoints(updated);
  };

  const minScale = 10;
  const maxScale = 65;

  const getPositionPct = (val: number) => {
    return ((val - minScale) / (maxScale - minScale)) * 100;
  };

  const calculationSteps = [
    {
      title: 'Jumlahkan Semua Nilai Data',
      description: 'Menjumlahkan seluruh data waktu tempuh amatan untuk mendapatkan total data ΣX.',
      formula: 'ΣX = X₁ + X₂ + ... + Xₙ',
      substitution: `${sorted.join(' + ')} = ${sum} menit`,
      result: `Hasil total data ΣX = ${sum} menit`,
    },
    {
      title: 'Hitung Mean (Rata-Rata)',
      description: 'Membagi hasil total data ΣX dengan banyaknya sampel n untuk memperoleh rata-rata amatan.',
      formula: 'X̄ = ΣX / n',
      substitution: `X̄ = ${sum} menit / ${points.length} = ${mean.toFixed(2)} menit`,
      result: `Hasil Mean = ${mean.toFixed(2)} menit`,
    },
    {
      title: 'Urutkan & Hitung Posisi Median',
      description: 'Mencari nilai yang tepat membagi data terurut menjadi dua kelompok sama besar (50% di bawah dan 50% di atas).',
      formula: 'Posisi Median = (n + 1) / 2',
      substitution: `Posisi = (${points.length} + 1) / 2 = ${(points.length + 1) / 2}. Data terurut: [${sorted.join(', ')}] menit`,
      result: `Hasil Median = ${median.toFixed(1)} menit`,
    },
    {
      title: 'Tentukan Modus (Nilai Paling Sering Muncul)',
      description: 'Mencatat frekuensi kemunculan tertinggi dari setiap nilai amatan pada sampel.',
      formula: 'Modus = Nilai dengan frekuensi kemunculan terbanyak',
      substitution:
        mode !== null
          ? `Nilai ${mode} menit muncul paling sering (${points.filter((p) => p === mode).length} kali)`
          : 'Semua nilai amatan memiliki frekuensi kemunculan yang sama',
      result: mode !== null ? `Hasil Modus = ${mode} menit` : 'Tidak ada modus tunggal',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Top Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-black uppercase tracking-wide">Dataset A:</span>
          <span className="text-xs text-black font-bold font-mono">
            n = {points.length} amatan ({points.join(', ')} <span className="text-black font-extrabold">menit</span>)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddOutlier}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs ${
              hasOutlier
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-400 text-black hover:bg-amber-300'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-black">
              {hasOutlier ? 'restart_alt' : 'bolt'}
            </span>
            <span className="text-black font-extrabold">{hasOutlier ? 'Hapus Outlier (Reset)' : '+ Tambah Outlier (60 menit)'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Number Line */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        {/* Metric Badges with generous gap */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-3.5 bg-surface-container-lowest rounded-xl border-2 border-teal-600/60 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                Mean (Rata-rata)
              </span>
              <div className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">
                {mean.toFixed(2)}{' '}
                <span className="text-xs font-sans text-black font-extrabold">menit</span>
              </div>
            </div>
            <span className="w-4 h-4 rounded-full bg-teal-700" title="Marker Mean" />
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-xl border-2 border-blue-600/60 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                Median (Nilai Tengah)
              </span>
              <div className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">
                {median.toFixed(1)}{' '}
                <span className="text-xs font-sans text-black font-extrabold">menit</span>
              </div>
            </div>
            <span className="w-4 h-4 rounded-sm bg-blue-600" title="Marker Median" />
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-xl border-2 border-amber-600/60 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-extrabold text-black uppercase tracking-wider">
                Modus (Paling Sering)
              </span>
              <div className="text-xl sm:text-2xl font-black text-black font-mono mt-0.5">
                {mode !== null ? `${mode}` : '-'}{' '}
                <span className="text-xs font-sans text-black font-extrabold">menit</span>
              </div>
            </div>
            <span className="w-4 h-4 rotate-45 bg-amber-500" title="Marker Modus" />
          </div>
        </div>

        {/* Number line SVG */}
        <div className="relative pt-20 pb-16 px-4">
          {/* Axis line */}
          <div className="h-2 w-full bg-slate-400 dark:bg-slate-600 rounded-full relative">
            {/* Ticks */}
            {[10, 20, 30, 40, 50, 60].map((tick) => {
              const pct = getPositionPct(tick);
              return (
                <div
                  key={tick}
                  className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <div className="w-0.5 h-3 bg-slate-500 dark:bg-slate-400" />
                  <span className="text-[11px] font-mono font-bold text-black mt-1 select-none">
                    {tick}
                  </span>
                </div>
              );
            })}

            {/* Mean Flag (Placed ABOVE the axis with clear height & black text) */}
            <div
              className="absolute -top-16 flex flex-col items-center -translate-x-1/2 transition-all duration-200 z-10 pointer-events-none"
              style={{ left: `${getPositionPct(mean)}%` }}
            >
              <div className="px-3 py-1 rounded-xl bg-teal-100 border-2 border-teal-700 text-black text-xs font-extrabold whitespace-nowrap shadow-sm">
                Mean: {mean.toFixed(1)} <span className="text-black font-extrabold">menit</span>
              </div>
              <div className="w-0.5 h-8 bg-teal-700" />
            </div>

            {/* Median Flag (Placed BELOW the axis with clear spacing & black text) */}
            <div
              className="absolute top-7 flex flex-col-reverse items-center -translate-x-1/2 transition-all duration-200 z-10 pointer-events-none"
              style={{ left: `${getPositionPct(median)}%` }}
            >
              <div className="px-3 py-1 rounded-xl bg-blue-100 border-2 border-blue-700 text-black text-xs font-extrabold whitespace-nowrap shadow-sm">
                Median: {median.toFixed(1)} <span className="text-black font-extrabold">menit</span>
              </div>
              <div className="w-0.5 h-8 bg-blue-700 border-l border-dashed border-blue-700" />
            </div>

            {/* Draggable Data Points */}
            {points.map((val, idx) => {
              const pct = getPositionPct(val);
              return (
                <div
                  key={idx}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group z-20 cursor-grab active:cursor-grabbing"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 transition-transform hover:scale-125 ${
                      val >= 55
                        ? 'bg-rose-500 border-white text-white animate-pulse'
                        : 'bg-teal-700 border-white text-white'
                    }`}
                  >
                    {val}
                  </div>
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none transition-opacity">
                    Titik #{idx + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Observation Insight */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 text-xs sm:text-sm text-black font-medium leading-relaxed space-y-2">
          {hasOutlier ? (
            <p className="text-black font-medium leading-relaxed">
              💡 <strong className="text-black font-bold">Perhatikan efek Outlier (60 <span className="text-black font-bold">menit</span>):</strong> Nilai Mean melonjak jauh dari <strong className="text-black font-bold">26.0 <span className="text-black font-bold">menit</span></strong> ke <strong className="text-black font-bold">{mean.toFixed(1)} <span className="text-black font-bold">menit</span></strong> karena ditarik oleh amatan ekstrem, sedangkan Median tetap stabil di <strong className="text-black font-bold">{median.toFixed(1)} <span className="text-black font-bold">menit</span></strong>. Hal ini membuktikan bahwa Median sangat <em className="text-black font-bold not-italic">resisten</em> terhadap pencilan.
            </p>
          ) : (
            <p className="text-black font-medium leading-relaxed">
              💡 <strong className="text-black font-bold">Posisi Mean vs Median:</strong> Nilai Mean (<strong className="text-black font-bold">{mean.toFixed(1)} <span className="text-black font-bold">menit</span></strong>) dan Median (<strong className="text-black font-bold">{median.toFixed(1)} <span className="text-black font-bold">menit</span></strong>) memiliki jarak yang jelas dan terpisah (tidak menempel). Coba klik tombol <strong className="text-black font-bold">"+ Tambah Outlier (60 <span className="text-black font-bold">menit</span>)"</strong> di kanan atas untuk melihat bagaimana nilai Mean tertarik semakin jauh menjauhi Median!
            </p>
          )}
        </div>
      </div>

      {/* Stepper with real calculations */}
      <CalculationStepper steps={calculationSteps} />
    </div>
  );
};

// =========================================================================
// 2. GEOMETRIC MEAN VISUAL
// =========================================================================
export const GeometricMeanVisual: React.FC = () => {
  const [rates, setRates] = useState<number[]>([10, -5, 20]); // percentage numbers

  const r1 = rates[0] / 100;
  const r2 = rates[1] / 100;
  const r3 = rates[2] / 100;

  const mult1 = 1 + r1;
  const mult2 = 1 + r2;
  const mult3 = 1 + r3;

  const product = mult1 * mult2 * mult3;
  const geometricMean = (Math.pow(Math.max(0.0001, product), 1 / 3) - 1) * 100;
  const arithmeticMean = (rates[0] + rates[1] + rates[2]) / 3;

  const handleRateChange = (index: number, val: number) => {
    const updated = [...rates];
    updated[index] = val;
    setRates(updated);
  };

  const steps = [
    {
      title: 'Ubah Tiap Persentase Menjadi Faktor Pertumbuhan (1 + R)',
      description: 'Pertumbuhan dinyatakan sebagai pengali modal awal (1 + Rᵢ).',
      formula: 'Faktor = (1 + Rᵢ)',
      substitution: `Tahun 1: (1 + ${r1.toFixed(2)}) = ${mult1.toFixed(2)} | Tahun 2: (1 + ${r2.toFixed(2)}) = ${mult2.toFixed(2)} | Tahun 3: (1 + ${r3.toFixed(2)}) = ${mult3.toFixed(2)}`,
      result: `Pengali modal: ${mult1.toFixed(2)}, ${mult2.toFixed(2)}, ${mult3.toFixed(2)}`,
    },
    {
      title: 'Kalikan Seluruh Faktor Pertumbuhan',
      description: 'Menghitung pertumbuhan gabungan majemuk selama 3 tahun berturut-turut.',
      formula: 'Produk = (1 + R₁) × (1 + R₂) × (1 + R₃)',
      substitution: `${mult1.toFixed(2)} × ${mult2.toFixed(2)} × ${mult3.toFixed(2)} = ${product.toFixed(4)}`,
      result: `Total faktor majemuk = ${product.toFixed(4)}`,
    },
    {
      title: 'Ambil Akar Pangkat n (n = 3) dan Kurangi 1',
      description: 'Mencari laju pertumbuhan tahunan konstan rata-rata geometrik.',
      formula: 'R_G = [Produk]^(1/n) − 1',
      substitution: `[${product.toFixed(4)}]^(1/3) − 1 = ${Math.pow(product, 1 / 3).toFixed(4)} − 1 = ${(geometricMean / 100).toFixed(4)}`,
      result: `Tingkat Rata-rata Geometrik = ${geometricMean.toFixed(2)}% per tahun`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Rate Inputs */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wider">
          Tingkat Pengembalian Investasi Tahunan (R₁ s/d R₃):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {rates.map((rate, idx) => (
            <div key={idx} className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface">Tahun {idx + 1}</span>
                <span className={`font-mono font-bold ${rate >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {rate >= 0 ? `+${rate}%` : `${rate}%`}
                </span>
              </div>
              <input
                type="range"
                min="-20"
                max="40"
                step="1"
                value={rate}
                onChange={(e) => handleRateChange(idx, Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="text-[11px] text-on-surface-variant font-mono">
                Faktor: (1 + {rate / 100 >= 0 ? `+${(rate / 100).toFixed(2)}` : (rate / 100).toFixed(2)}) = {(1 + rate / 100).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/40 border-2 border-teal-300 dark:border-teal-800 space-y-1">
            <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide">
              Geometric Mean (R_G) — Tepat untuk Laju Majemuk
            </span>
            <div className="text-2xl font-extrabold text-teal-900 dark:text-teal-100 font-mono">
              {geometricMean.toFixed(2)}%
            </div>
            <p className="text-[11px] text-teal-950/80 dark:text-teal-200/80 leading-relaxed">
              Mencerminkan pertumbuhan majemuk nyata saldo awal investasi jika bertumbuh dengan laju tetap setiap tahun.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-1">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
              Arithmetic Mean (X̄) — Bias Terlalu Tinggi
            </span>
            <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 font-mono">
              {arithmeticMean.toFixed(2)}%
            </div>
            <p className="text-[11px] text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
              Rata-rata aritmatika biasa ({arithmeticMean.toFixed(2)}%) selalu melebih-lebihkan laju pertumbuhan finansial nyata saat ada fluktuasi.
            </p>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 3. RANGE VISUAL
// =========================================================================
export const RangeVisual: React.FC = () => {
  const [minVal, setMinVal] = useState<number>(12);
  const [maxVal, setMaxVal] = useState<number>(30);

  const range = maxVal - minVal;

  const minScale = 5;
  const maxScale = 45;

  const getPct = (val: number) => ((val - minScale) / (maxScale - minScale)) * 100;

  const steps = [
    {
      title: 'Cari Nilai Terbesar (X largest)',
      description: 'Menelusuri seluruh data amatan untuk menemukan angka maksimum.',
      formula: 'X largest = Nilai Maksimum',
      substitution: `Nilai terbesar di Dataset A adalah ${maxVal} menit`,
      result: `X largest = ${maxVal}`,
    },
    {
      title: 'Cari Nilai Terkecil (X smallest)',
      description: 'Menelusuri seluruh data amatan untuk menemukan angka minimum.',
      formula: 'X smallest = Nilai Minimum',
      substitution: `Nilai terkecil di Dataset A adalah ${minVal} menit`,
      result: `X smallest = ${minVal}`,
    },
    {
      title: 'Kurangkan Nilai Terbesar dengan Nilai Terkecil',
      description: 'Menghitung rentang selisih total antara kedua nilai ekstrem.',
      formula: 'Range = X largest − X smallest',
      substitution: `Range = ${maxVal} − ${minVal} = ${range} menit`,
      result: `Range = ${range} menit`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Rentang Data (Range):
            </span>
            <div className="text-2xl font-extrabold text-black font-mono">
              {range}{' '}
              <span className="text-xs font-sans text-black font-bold">menit</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 font-bold">
              X smallest = {minVal}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 font-bold">
              X largest = {maxVal}
            </span>
          </div>
        </div>

        {/* Interactive Number line with draggable bracket */}
        <div className="relative pt-10 pb-8 px-2">
          {/* Main Axis */}
          <div className="h-2 w-full bg-slate-300 dark:bg-slate-700 rounded-full relative">
            {/* Axis Ticks */}
            {[5, 10, 15, 20, 25, 30, 35, 40, 45].map((tick) => (
              <div
                key={tick}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${getPct(tick)}%` }}
              >
                <div className="w-0.5 h-3 bg-slate-400 dark:bg-slate-500" />
                <span className="text-[10px] font-mono font-medium text-slate-500 mt-1 select-none">
                  {tick}
                </span>
              </div>
            ))}

            {/* Bracket highlighting Range */}
            <div
              className="absolute -top-7 h-6 border-t-2 border-l-2 border-r-2 border-primary rounded-t-lg flex items-center justify-center transition-all"
              style={{
                left: `${getPct(minVal)}%`,
                width: `${getPct(maxVal) - getPct(minVal)}%`,
              }}
            >
              <span className="text-[11px] font-bold text-primary bg-surface-container-lowest px-2 rounded-full border border-primary/30 shadow-2xs whitespace-nowrap">
                Range = {range} menit
              </span>
            </div>

            {/* Min Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${getPct(minVal)}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-teal-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                MIN
              </div>
            </div>

            {/* Max Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-20"
              style={{ left: `${getPct(maxVal)}%` }}
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold cursor-pointer">
                MAX
              </div>
            </div>
          </div>
        </div>

        {/* Slider Controls for Min & Max */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-on-surface">
              <span className="font-bold">Geser X smallest:</span>
              <span className="font-mono font-bold text-teal-700">{minVal}</span>
            </div>
            <input
              type="range"
              min="5"
              max={maxVal - 1}
              value={minVal}
              onChange={(e) => setMinVal(Number(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-on-surface">
              <span className="font-bold">Geser X largest:</span>
              <span className="font-mono font-bold text-blue-700">{maxVal}</span>
            </div>
            <input
              type="range"
              min={minVal + 1}
              max="45"
              value={maxVal}
              onChange={(e) => setMaxVal(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 4. VARIANCE & STANDARD DEVIATION VISUAL
// =========================================================================
export const VarianceSdVisual: React.FC = () => {
  const [spreadMultiplier, setSpreadMultiplier] = useState<number>(1);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const baseValues = datasetA.rawValues; // [12, 15, 18, 20, 20, 25, 30]
  const mean = 20;

  // Modified values based on spread multiplier
  const dynamicValues = baseValues.map((v) => {
    const diff = v - mean;
    return Math.round(mean + diff * spreadMultiplier);
  });

  const deviations = dynamicValues.map((v) => {
    const dev = v - mean;
    return { x: v, dev, devSq: dev * dev };
  });

  const sumDevSq = deviations.reduce((acc, d) => acc + d.devSq, 0);
  const sampleVariance = sumDevSq / (dynamicValues.length - 1);
  const sampleSd = Math.sqrt(sampleVariance);

  const steps = [
    {
      title: 'Hitung Rata-Rata (X̄)',
      description: 'Menghitung nilai pusat data amatan sebagai titik jangkar perbandingan.',
      formula: 'X̄ = ΣX / n',
      substitution: `(12 + 15 + 18 + 20 + 20 + 25 + 30) / 7 = 140 / 7 = 20 menit`,
      result: `Mean (X̄) = 20 menit`,
    },
    {
      title: 'Hitung Selisih Tiap Nilai dari Mean (Xᵢ − X̄)',
      description: 'Mengukur jarak deviasi masing-masing data dari titik pusat.',
      formula: 'Deviasi = Xᵢ − X̄',
      substitution: `12−20 = −8 | 15−20 = −5 | 18−20 = −2 | 20−20 = 0 | 25−20 = +5 | 30−20 = +10`,
      result: `Catatan: Jumlah deviasi sebelum dikuadratkan selalu bernilai 0!`,
    },
    {
      title: 'Kuadratkan Deviasi & Jumlahkan: Σ(Xᵢ − X̄)²',
      description: 'Menguadratkan deviasi agar bernilai positif dan memberi bobot lebih pada nilai yang jauh.',
      formula: 'SS = Σ(Xᵢ − X̄)²',
      substitution: `(-8)² + (-5)² + (-2)² + 0² + 0² + 5² + 10² = 64 + 25 + 4 + 0 + 0 + 25 + 100 = 218`,
      result: `Jumlah Kuadrat Deviasi (SS) = 218`,
    },
    {
      title: 'Bagi dengan (n − 1) untuk Sample Variance (S²)',
      description: 'Menggunakan pembagi n − 1 (bukan n) sebagai koreksi derajat kebebasan untuk sampel acak.',
      formula: 'S² = Σ(Xᵢ − X̄)² / (n − 1)',
      substitution: `S² = 218 / (7 − 1) = 218 / 6 ≈ 36.33 menit²`,
      result: `Sample Variance = 36.33 menit²`,
    },
    {
      title: 'Ambil Akar Kuadrat untuk Standard Deviation (S)',
      description: 'Mengembalikan satuan kuadrat (menit²) ke satuan asli data (menit).',
      formula: 'S = √S²',
      substitution: `S = √36.333 ≈ 6.03 menit`,
      result: `Sample Standard Deviation = 6.03 menit`,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Spread Control Slider */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Pengatur Sebaran Data (Simulasi):
            </span>
            <p className="text-[11px] text-on-surface-variant">
              Tarik slider untuk melihat bagaimana penyebaran titik memengaruhi S dan S² secara langsung
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-on-surface">Skala Sebaran:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">
              {spreadMultiplier.toFixed(1)}x
            </span>
          </div>
        </div>

        <input
          type="range"
          min="0.5"
          max="1.8"
          step="0.1"
          value={spreadMultiplier}
          onChange={(e) => setSpreadMultiplier(Number(e.target.value))}
          className="w-full accent-primary"
        />

        {/* Live Stat Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-primary/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-black uppercase">
                Sample Variance (S²)
              </span>
              <div className="text-xl font-extrabold text-black font-mono">
                {sampleVariance.toFixed(2)}{' '}
                <span className="text-xs font-bold text-black font-sans">menit²</span>
              </div>
            </div>
            <span className="text-xs font-mono text-on-surface-variant">Σ(X−X̄)² / {dynamicValues.length - 1}</span>
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-teal-500/30 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-black uppercase">
                Standard Deviation (S)
              </span>
              <div className="text-xl font-extrabold text-black font-mono">
                {sampleSd.toFixed(2)}{' '}
                <span className="text-xs font-bold text-black font-sans">menit</span>
              </div>
            </div>
            <span className="text-xs font-mono text-teal-700 dark:text-teal-300 font-bold">±1S Band</span>
          </div>
        </div>

        {/* Step Table */}
        <div className="space-y-1 pt-2">
          <div className="text-xs font-bold text-black">
            Tabel Komputasi Deviasi Kuadrat (Klik baris untuk menyorot):
          </div>
          <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-surface-container text-black font-bold border-b-2 border-outline-variant/80">
                  <th className="py-2.5 px-3 text-black font-extrabold">Amatan (Xᵢ)</th>
                  <th className="py-2.5 px-3 text-black font-extrabold">Mean (X̄)</th>
                  <th className="py-2.5 px-3 text-black font-extrabold bg-surface-container-high/60">
                    Deviasi (Xᵢ − X̄)
                  </th>
                  <th className="py-2.5 px-3 text-black font-extrabold">Deviasi Kuadrat (Xᵢ − X̄)²</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {deviations.map((d, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedRow(selectedRow === idx ? null : idx)}
                    className={`cursor-pointer transition-colors ${
                      selectedRow === idx ? 'bg-primary-fixed/30 font-bold' : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <td className="py-2 px-3 font-mono font-bold text-black">{d.x}</td>
                    <td className="py-2 px-3 font-mono font-bold text-black">{mean}</td>
                    <td className="py-2 px-3 font-mono font-bold text-black bg-surface-container-low/40">
                      {d.dev >= 0 ? `+${d.dev}` : d.dev}
                    </td>
                    <td className="py-2 px-3 font-mono font-bold text-black">{d.devSq}</td>
                  </tr>
                ))}
                <tr className="bg-surface-container font-bold border-t-2 border-outline-variant/80">
                  <td className="py-2.5 px-3 text-black font-extrabold">Total (Σ)</td>
                  <td className="py-2.5 px-3 text-black font-extrabold">-</td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-black bg-surface-container-low/40">0</td>
                  <td className="py-2.5 px-3 font-mono font-extrabold text-black text-sm">{sumDevSq}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 5. COEFFICIENT OF VARIATION (CV) VISUAL
// =========================================================================
export const CoefficientOfVariationVisual: React.FC = () => {
  const [showComparison, setShowComparison] = useState(false);

  const { tinggi, berat } = cvComparisonData;

  const steps = [
    {
      title: 'Hitung Standard Deviation (S) dan Mean (X̄) untuk Masing-Masing Variabel',
      description: 'Mengumpulkan nilai rata-rata dan simpangan baku dari data yang ingin diperbandingkan.',
      formula: 'Tinggi Badan: X̄ = 165 cm, S = 6 cm | Berat Badan: X̄ = 60 kg, S = 9 kg',
      substitution: `Tinggi: S = 6 cm, X̄ = 165 cm | Berat: S = 9 kg, X̄ = 60 kg`,
      result: `Satuan cm dan kg berbeda sehingga nilai S tidak bisa dibandingkan secara langsung!`,
    },
    {
      title: 'Hitung CV Tinggi Badan',
      description: 'Membagi simpangan baku dengan mean lalu dikalikan 100%.',
      formula: 'CV = (S / X̄) × 100%',
      substitution: `CV Tinggi = (6 / 165) × 100% ≈ 3.64%`,
      result: `Variasi Relatif Tinggi = 3.64%`,
    },
    {
      title: 'Hitung CV Berat Badan',
      description: 'Membagi simpangan baku dengan mean lalu dikalikan 100%.',
      formula: 'CV = (S / X̄) × 100%',
      substitution: `CV Berat = (9 / 60) × 100% = 15.00%`,
      result: `Variasi Relatif Berat = 15.00%`,
    },
    {
      title: 'Bandingkan Kedua Nilai CV Bebas Satuan',
      description: 'CV mengeliminasi pengaruh satuan fisik sehingga variasi dapat diperbandingkan secara adil.',
      formula: 'Rasio Variabilitas = CV Berat / CV Tinggi',
      substitution: `15.00% / 3.64% ≈ 4.12 kali lipat`,
      result: `Berat badan memiliki variasi relatif 4 kali lebih besar dibanding tinggi badan!`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        {/* Toggle Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container">
          <div>
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Studi Kasus Dua Satuan Berbeda:
            </span>
            <p className="text-[11px] text-black font-medium">
              Tinggi badan (cm) vs Berat badan (kg)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-2xs hover:bg-primary-container transition-colors"
          >
            {showComparison ? 'Kembalikan Tampilan Kartu' : '⚡ Bandingkan dengan CV (%)'}
          </button>
        </div>

        {!showComparison ? (
          /* Two Separate Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">Tinggi Badan Mahasiswa</span>
                <span className="text-[11px] font-mono text-black font-bold">cm</span>
              </div>
              <div className="text-sm font-mono space-y-1 text-black">
                <div>Mean (X̄) = <strong className="text-black font-bold">165 cm</strong></div>
                <div>Standard Deviation (S) = <strong className="text-black font-bold">6 cm</strong></div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                <span className="text-xs text-black font-medium">Koefisien Variasi:</span>
                <span className="text-base font-bold font-mono text-black">3.64%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black">Berat Badan Mahasiswa</span>
                <span className="text-[11px] font-mono text-black font-bold">kg</span>
              </div>
              <div className="text-sm font-mono space-y-1 text-black">
                <div>Mean (X̄) = <strong className="text-black font-bold">60 kg</strong></div>
                <div>Standard Deviation (S) = <strong className="text-black font-bold">9 kg</strong></div>
              </div>
              <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                <span className="text-xs text-black font-medium">Koefisien Variasi:</span>
                <span className="text-base font-bold font-mono text-black">15.00%</span>
              </div>
            </div>
          </div>
        ) : (
          /* Comparison Bar Chart */
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-3">
              <div className="text-xs font-bold text-black">
                Perbandingan Variabilitas Relatif (CV Bebas Satuan):
              </div>

              {/* Bar 1: Tinggi */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-black">Tinggi Badan (CV = 3.64%)</span>
                  <span className="font-mono font-bold text-black">3.64%</span>
                </div>
                <div className="w-full h-5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>

              {/* Bar 2: Berat */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-black">Berat Badan (CV = 15.00%)</span>
                  <span className="font-mono font-bold text-black">15.00%</span>
                </div>
                <div className="w-full h-5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 text-xs sm:text-sm text-black font-medium leading-relaxed">
              💡 <strong className="text-black font-bold">Kesimpulan:</strong> Meski simpangan baku berat badan (9 kg) dan tinggi badan (6 cm) tampak mirip secara nominal angka, <strong className="text-black font-bold">Berat Badan 4 kali lipat lebih bervariasi</strong> terhadap nilai tengahnya dibanding Tinggi Badan.
            </div>
          </div>
        )}
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 6. Z-SCORE VISUAL
// =========================================================================
export const ZScoreVisual: React.FC = () => {
  const [valX, setValX] = useState<number>(85);

  const mean = zScoreDemoData.mean; // 70
  const sd = zScoreDemoData.sd; // 10

  const z = (valX - mean) / sd;
  const isOutlier = Math.abs(z) > 3;

  const steps = [
    {
      title: 'Ketahui Nilai Amatan (X), Mean (X̄), dan Standard Deviation (S)',
      description: 'Menyiapkan parameter data nilai ujian mahasiswa.',
      formula: 'X = Nilai amatan, X̄ = 70, S = 10',
      substitution: `X = ${valX}, X̄ = 70, S = 10`,
      result: `Parameter lengkap`,
    },
    {
      title: 'Kurangi Nilai Amatan dengan Mean: (X − X̄)',
      description: 'Mengukur jarak mentah nilai dari rata-rata kelas.',
      formula: 'Selisih = X − X̄',
      substitution: `${valX} − 70 = ${valX - 70}`,
      result: `Deviasi dari rata-rata = ${valX - 70} poin`,
    },
    {
      title: 'Bagi dengan Standard Deviation: Z = (X − X̄) / S',
      description: 'Menstandarkan jarak ke dalam satuan simpangan baku.',
      formula: 'Z = (X − X̄) / S',
      substitution: `Z = (${valX} − 70) / 10 = ${z.toFixed(2)}`,
      result: `Skor Z = ${z.toFixed(2)}`,
    },
    {
      title: 'Evaluasi Kemungkinan Outlier (|Z| > 3)',
      description: 'Secara umum nilai Z di luar rentang −3 s/d +3 dianggap sebagai amatan ekstrem / outlier.',
      formula: 'Outlier jika Z < −3 atau Z > +3',
      substitution: `|Z| = ${Math.abs(z).toFixed(2)} ${isOutlier ? '> 3 (Kemungkinan Outlier)' : '≤ 3 (Dalam batas wajar)'}`,
      result: isOutlier ? '⚠️ Terindikasi Nilai Ekstrem (Outlier)' : '✅ Nilai Dalam Rentang Normal',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        {/* Slider for X */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-on-surface">Pilih Nilai Ujian (X):</span>
            <div className="flex items-center gap-3 font-mono">
              <span className="text-sm font-bold text-on-surface">X = {valX}</span>
              <span className={`text-sm font-bold px-2 py-0.5 rounded ${isOutlier ? 'bg-rose-600 text-white animate-pulse' : 'bg-primary text-on-primary'}`}>
                Z = {z >= 0 ? `+${z.toFixed(2)}` : z.toFixed(2)}
              </span>
            </div>
          </div>
          <input
            type="range"
            min="35"
            max="105"
            step="1"
            value={valX}
            onChange={(e) => setValX(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Bell Curve Canvas SVG */}
        <div className="relative w-full h-44 sm:h-52">
          <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible select-none">
            {/* Outlier Hatched Regions (Z < -3 and Z > +3) */}
            {/* Left Outlier (X < 40) */}
            <rect x="20" y="40" width="70" height="110" fill="#fee2e2" opacity="0.6" />
            <text x="55" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">
              Outlier (Z &lt; −3)
            </text>

            {/* Right Outlier (X > 100) */}
            <rect x="410" y="40" width="70" height="110" fill="#fee2e2" opacity="0.6" />
            <text x="445" y="30" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">
              Outlier (Z &gt; +3)
            </text>

            {/* Bell Curve Shape */}
            <path
              d="M 20 150 Q 150 150 210 50 Q 250 20 290 50 Q 350 150 480 150"
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
            />

            {/* Base line */}
            <line x1="20" y1="150" x2="480" y2="150" stroke="#64748b" strokeWidth="1.5" />

            {/* Mean Center Line */}
            <line x1="250" y1="20" x2="250" y2="150" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
            <text x="250" y="165" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e">
              Mean = 70 (Z = 0)
            </text>

            {/* Marks for ±1, ±2, ±3 */}
            <text x="317" y="165" textAnchor="middle" fontSize="9" fill="#64748b">
              80 (+1)
            </text>
            <text x="383" y="165" textAnchor="middle" fontSize="9" fill="#64748b">
              90 (+2)
            </text>
            <text x="445" y="165" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">
              100 (+3)
            </text>

            <text x="183" y="165" textAnchor="middle" fontSize="9" fill="#64748b">
              60 (−1)
            </text>
            <text x="117" y="165" textAnchor="middle" fontSize="9" fill="#64748b">
              50 (−2)
            </text>
            <text x="55" y="165" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">
              40 (−3)
            </text>

            {/* Current Selected X Dot & Marker */}
            {(() => {
              // Map valX (40 to 100) -> X coords (55 to 445)
              const cx = 55 + ((valX - 40) / 60) * 390;
              // Bell height approx
              const diffFromCenter = Math.abs(valX - 70) / 30; // 0 to 1
              const cy = 20 + diffFromCenter * diffFromCenter * 130;

              return (
                <g>
                  <line x1={cx} y1="35" x2={cx} y2="150" stroke="#f59e0b" strokeWidth="2" strokeDasharray="2 2" />
                  <circle cx={cx} cy={Math.min(150, cy)} r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x={cx}
                    y="18"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={isOutlier ? '#dc2626' : '#d97706'}
                    className="font-mono"
                  >
                    X = {valX} (Z = {z.toFixed(2)})
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Outlier Alert */}
        {isOutlier && (
          <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 text-xs font-bold text-rose-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>Nilai X = {valX} menghasilkan |Z| = {Math.abs(z).toFixed(2)} &gt; 3: Terdeteksi sebagai Kemungkinan Outlier!</span>
          </div>
        )}
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 7. SKEWNESS VISUAL
// =========================================================================
export const SkewnessVisual: React.FC = () => {
  const [skewSlider, setSkewSlider] = useState<number>(0); // -1: negative, 0: symmetric, 1: positive

  const steps = [
    {
      title: 'Hitung Mean dan Median Data',
      description: 'Menghitung kedua ukuran pemusatan utama untuk membandingkan posisinya.',
      formula: 'Bandingkan nilai Mean (X̄) dan Median',
      substitution: `Contoh Dataset B: Mean ≈ 27.09 menit, Median = 25.00 menit`,
      result: `Mean (27.09) > Median (25.00)`,
    },
    {
      title: 'Tentukan Arah Kemiringan (Skewness)',
      description: 'Posisi mean yang ditarik oleh nilai ekstrem menentukan arah ekor distribusi.',
      formula: 'Mean < Median: Left-Skewed | Mean = Median: Simetris | Mean > Median: Right-Skewed',
      substitution: `27.09 > 25.00 → Distribusi condong ke kanan (Positive / Right-Skewed)`,
      result: `Bentuk Distribusi: Positive (Right-Skewed)`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        {/* THREE CARDS SIDE BY SIDE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Negative Skewed */}
          <div
            className={`p-3.5 rounded-xl border-2 transition-all ${
              skewSlider < -0.3
                ? 'bg-primary-fixed/20 border-primary shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/40'
            }`}
          >
            <div className="text-xs font-bold text-on-surface mb-1">
              1. Negative (Left-Skewed)
            </div>
            <div className="text-[11px] font-mono text-primary font-bold mb-2">
              Mean &lt; Median
            </div>
            {/* Mini SVG curve */}
            <div className="h-20 w-full">
              <svg viewBox="0 0 160 80" className="w-full h-full">
                {/* tail stretches left */}
                <path d="M 10 70 Q 70 65 110 20 Q 130 20 150 70" fill="none" stroke="#0d9488" strokeWidth="2" />
                <line x1="10" y1="70" x2="150" y2="70" stroke="#94a3b8" />
                {/* Mean line solid */}
                <line x1="95" y1="25" x2="95" y2="70" stroke="#0d9488" strokeWidth="2" />
                <text x="95" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0d9488">Mean</text>
                {/* Median line dashed */}
                <line x1="112" y1="20" x2="112" y2="70" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="120" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#2563eb">Med</text>
              </svg>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              Ekor memanjang ke arah kiri, mean ditarik ke kiri oleh amatan bernilai rendah.
            </p>
          </div>

          {/* 2. Symmetrical */}
          <div
            className={`p-3.5 rounded-xl border-2 transition-all ${
              Math.abs(skewSlider) <= 0.3
                ? 'bg-primary-fixed/20 border-primary shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/40'
            }`}
          >
            <div className="text-xs font-bold text-on-surface mb-1">
              2. Symmetrical (Simetris)
            </div>
            <div className="text-[11px] font-mono text-primary font-bold mb-2">
              Mean = Median
            </div>
            <div className="h-20 w-full">
              <svg viewBox="0 0 160 80" className="w-full h-full">
                <path d="M 10 70 Q 60 70 80 20 Q 100 70 150 70" fill="none" stroke="#0d9488" strokeWidth="2" />
                <line x1="10" y1="70" x2="150" y2="70" stroke="#94a3b8" />
                {/* Both coincide */}
                <line x1="80" y1="20" x2="80" y2="70" stroke="#0d9488" strokeWidth="2" />
                <text x="80" y="15" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0d9488">Mean = Med</text>
              </svg>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              Bentuk lonceng seimbang sempurna, garis mean dan median berimpit di tengah.
            </p>
          </div>

          {/* 3. Positive Skewed */}
          <div
            className={`p-3.5 rounded-xl border-2 transition-all ${
              skewSlider > 0.3
                ? 'bg-primary-fixed/20 border-primary shadow-xs'
                : 'bg-surface-container-lowest border-outline-variant/40'
            }`}
          >
            <div className="text-xs font-bold text-on-surface mb-1">
              3. Positive (Right-Skewed)
            </div>
            <div className="text-[11px] font-mono text-primary font-bold mb-2">
              Mean &gt; Median
            </div>
            <div className="h-20 w-full">
              <svg viewBox="0 0 160 80" className="w-full h-full">
                <path d="M 10 70 Q 30 20 50 20 Q 90 65 150 70" fill="none" stroke="#0d9488" strokeWidth="2" />
                <line x1="10" y1="70" x2="150" y2="70" stroke="#94a3b8" />
                {/* Median dashed */}
                <line x1="48" y1="20" x2="48" y2="70" stroke="#2563eb" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="40" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#2563eb">Med</text>
                {/* Mean solid */}
                <line x1="65" y1="25" x2="65" y2="70" stroke="#0d9488" strokeWidth="2" />
                <text x="65" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0d9488">Mean</text>
              </svg>
            </div>
            <p className="text-[10px] text-on-surface-variant leading-tight">
              Ekor memanjang ke arah kanan, mean ditarik ke kanan oleh amatan bernilai tinggi.
            </p>
          </div>
        </div>

        {/* Morph Slider */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-xs text-on-surface">
            <span className="font-bold">Geser Derajat Kemiringan:</span>
            <span className="font-mono font-bold text-primary">
              {skewSlider < -0.3 ? 'Negative (Left-Skewed)' : skewSlider > 0.3 ? 'Positive (Right-Skewed)' : 'Symmetrical'}
            </span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={skewSlider}
            onChange={(e) => setSkewSlider(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 8. KURTOSIS VISUAL
// =========================================================================
export const KurtosisVisual: React.FC = () => {
  const [kurtosisLevel, setKurtosisLevel] = useState<number>(0); // -1: Platykurtic, 0: Mesokurtic, 1: Leptokurtic

  const steps = [
    {
      title: 'Pahami Tiga Kategori Kurtosis',
      description: 'Kurtosis mengukur keruncingan puncak kurva distribusi relatif terhadap distribusi normal.',
      formula: 'Kurtosis = Keruncingan Puncak Distribusi',
      substitution: `Platykurtic (Puncak Datar) | Mesokurtic (Normal) | Leptokurtic (Puncak Runcing Tajam)`,
      result: `Tiga tipe ketajaman puncak`,
    },
    {
      title: 'Interpretasi Bentuk Puncak',
      description: 'Leptokurtic memiliki ekor yang lebih tebal (fat tails) dan amatan yang lebih mengelompok ketat di pusat.',
      formula: 'K > 3: Leptokurtic | K = 3: Mesokurtic | K < 3: Platykurtic',
      substitution: `Tingkat saat ini: ${kurtosisLevel === 1 ? 'Leptokurtic (Runcing)' : kurtosisLevel === -1 ? 'Platykurtic (Datar)' : 'Mesokurtic (Normal)'}`,
      result: `Evaluasi ketajaman visual`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-on-surface uppercase">Ketajaman Puncak (Kurtosis):</span>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">
            {kurtosisLevel === -1 ? 'Platykurtic (Lebih Datar)' : kurtosisLevel === 1 ? 'Leptokurtic (Lebih Runcing)' : 'Mesokurtic (Normal)'}
          </span>
        </div>

        {/* Big Morphing SVG Curve */}
        <div className="h-44 w-full">
          <svg viewBox="0 0 400 160" className="w-full h-full select-none">
            <line x1="20" y1="140" x2="380" y2="140" stroke="#64748b" strokeWidth="1.5" />
            {/* Center Mean */}
            <line x1="200" y1="20" x2="200" y2="140" stroke="#94a3b8" strokeDasharray="3 3" />

            {/* Dynamic Curve based on kurtosisLevel */}
            {(() => {
              // Peak Y: leptokurtic peak = 20, mesokurtic peak = 50, platykurtic peak = 80
              const peakY = 50 - kurtosisLevel * 35;
              const ctrlY = 140 - (140 - peakY) * 0.9;

              return (
                <path
                  d={`M 40 140 Q 150 ${ctrlY} 200 ${peakY} Q 250 ${ctrlY} 360 140`}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                />
              );
            })()}

            <text x="200" y="155" textAnchor="middle" fontSize="10" fill="#64748b">
              Pusat (Mean = Tetap)
            </text>
          </svg>
        </div>

        {/* Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-on-surface-variant font-medium">
            <span>Platykurtic (Datar)</span>
            <span>Mesokurtic (Normal)</span>
            <span>Leptokurtic (Tajam)</span>
          </div>
          <input
            type="range"
            min="-1"
            max="1"
            step="1"
            value={kurtosisLevel}
            onChange={(e) => setKurtosisLevel(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 9. QUARTILES & IQR VISUAL (Dataset B)
// =========================================================================
export const QuartilesIqrVisual: React.FC = () => {
  const [highlighted, setHighlighted] = useState<'q1' | 'q2' | 'q3' | 'iqr' | null>(null);

  const values = datasetB.rawValues; // 11 sorted values: [12, 15, 18, 20, 22, 25, 27, 30, 34, 40, 55]
  const n = values.length;

  const q1Idx = 2; // index 2 = 3rd value = 18
  const q2Idx = 5; // index 5 = 6th value = 25
  const q3Idx = 8; // index 8 = 9th value = 34

  const steps = [
    {
      title: 'Urutkan 11 Data Amatan (Dataset B)',
      description: 'Menyusun data dari nilai terkecil hingga terbesar dan memberi nomor posisi 1 sampai 11.',
      formula: 'Data Terurut: 12, 15, 18, 20, 22, 25, 27, 30, 34, 40, 55',
      substitution: `Ukuran sampel n = 11`,
      result: `Data siap dipartisi menjadi 4 kelompok`,
    },
    {
      title: 'Hitung Posisi dan Nilai Q1',
      description: 'Q1 memisahkan 25% data terbawah dari 75% data teratas.',
      formula: 'Posisi Q1 = (n + 1) / 4',
      substitution: `Posisi = (11 + 1) / 4 = 12 / 4 = 3 → Nilai ke-3 = 18`,
      result: `Q1 = 18 menit`,
    },
    {
      title: 'Hitung Posisi dan Nilai Q2 (Median)',
      description: 'Q2 adalah median yang membagi data menjadi dua kelompok sama besar (50%).',
      formula: 'Posisi Q2 = (n + 1) / 2',
      substitution: `Posisi = (11 + 1) / 2 = 12 / 2 = 6 → Nilai ke-6 = 25`,
      result: `Q2 (Median) = 25 menit`,
    },
    {
      title: 'Hitung Posisi dan Nilai Q3',
      description: 'Q3 memisahkan 75% data terbawah dari 25% data teratas.',
      formula: 'Posisi Q3 = 3(n + 1) / 4',
      substitution: `Posisi = 3 × 12 / 4 = 9 → Nilai ke-9 = 34`,
      result: `Q3 = 34 menit`,
    },
    {
      title: 'Hitung Interquartile Range (IQR = Q3 − Q1)',
      description: 'Mengukur rentang penyebaran 50% data di bagian tengah.',
      formula: 'IQR = Q3 − Q1',
      substitution: `IQR = 34 − 18 = 16 menit`,
      result: `IQR = 16 menit`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Interactive Buttons */}
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-surface-container">
          <button
            type="button"
            onClick={() => setHighlighted(highlighted === 'q1' ? null : 'q1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              highlighted === 'q1' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            Cari Q1 (Posisi 3)
          </button>
          <button
            type="button"
            onClick={() => setHighlighted(highlighted === 'q2' ? null : 'q2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              highlighted === 'q2' ? 'bg-blue-600 text-white' : 'bg-surface-container text-on-surface'
            }`}
          >
            Cari Q2 / Median (Posisi 6)
          </button>
          <button
            type="button"
            onClick={() => setHighlighted(highlighted === 'q3' ? null : 'q3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              highlighted === 'q3' ? 'bg-purple-600 text-white' : 'bg-surface-container text-on-surface'
            }`}
          >
            Cari Q3 (Posisi 9)
          </button>
          <button
            type="button"
            onClick={() => setHighlighted(highlighted === 'iqr' ? null : 'iqr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              highlighted === 'iqr' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-surface-container text-on-surface'
            }`}
          >
            Tampilkan IQR (50% Tengah)
          </button>
        </div>

        {/* 11 Sorted Values Dots */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-on-surface-variant">
            11 Nilai Waktu Pengerjaan Tugas (Dataset B, n = {n}):
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-11 gap-2">
            {values.map((v, i) => {
              const isQ1 = i === q1Idx;
              const isQ2 = i === q2Idx;
              const isQ3 = i === q3Idx;
              const isInIqr = i >= q1Idx && i <= q3Idx;

              let highlightClass = 'bg-surface-container-lowest border-outline-variant/60 text-slate-900 dark:text-slate-100';
              if (highlighted === 'q1' && isQ1) highlightClass = 'bg-primary text-on-primary border-primary scale-110';
              if (highlighted === 'q2' && isQ2) highlightClass = 'bg-blue-600 text-white border-blue-600 scale-110';
              if (highlighted === 'q3' && isQ3) highlightClass = 'bg-purple-600 text-white border-purple-600 scale-110';
              if (highlighted === 'iqr' && isInIqr) highlightClass = 'bg-amber-100 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold';

              return (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all ${highlightClass}`}
                >
                  <span className="text-[10px] text-on-surface-variant/70 font-mono">#{i + 1}</span>
                  <span className="text-sm font-bold font-mono">{v}</span>
                  {isQ1 && <span className="text-[9px] font-bold text-teal-700 dark:text-teal-300">Q1</span>}
                  {isQ2 && <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300">Q2</span>}
                  {isQ3 && <span className="text-[9px] font-bold text-purple-700 dark:text-purple-300">Q3</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* IQR Bracket Display */}
        {highlighted === 'iqr' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 rounded-xl text-xs space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              Interquartile Range (IQR) = Q3 − Q1 = 34 − 18 = 16 menit
            </div>
            <p className="text-amber-950/80 dark:text-amber-200/80 text-[11px] leading-relaxed">
              Mewakili rentang sebaran 50% data di bagian tengah. IQR tidak terpengaruh oleh nilai ekstrem (outlier) seperti angka 55 menit.
            </p>
          </div>
        )}
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 10. FIVE-NUMBER SUMMARY VISUAL
// =========================================================================
export const FiveNumberSummaryVisual: React.FC = () => {
  const [filledCount, setFilledCount] = useState<number>(5);

  const cards = [
    { label: 'X smallest', val: 12, desc: 'Nilai Minimum', color: '#0d9488' },
    { label: 'Q1', val: 18, desc: 'Kuartil Pertama (25%)', color: '#14b8a6' },
    { label: 'Median (Q2)', val: 25, desc: 'Nilai Tengah (50%)', color: '#2563eb' },
    { label: 'Q3', val: 34, desc: 'Kuartil Ketiga (75%)', color: '#8b5cf6' },
    { label: 'X largest', val: 55, desc: 'Nilai Maksimum', color: '#f59e0b' },
  ];

  const steps = [
    {
      title: 'Ketahui 5 Angka Ringkasan Dataset B',
      description: 'Five-Number Summary adalah fondasi pembuatan grafik Boxplot.',
      formula: 'X smallest, Q1, Median, Q3, X largest',
      substitution: `12, 18, 25, 34, 55 (menit)`,
      result: `5 angka ringkasan lengkap`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-on-surface uppercase">Lima Angka Ringkasan (Five-Number Summary):</span>
          <button
            type="button"
            onClick={() => setFilledCount(filledCount === 5 ? 1 : filledCount + 1)}
            className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-semibold hover:bg-surface-container-high transition-colors"
          >
            {filledCount === 5 ? 'Ulangi Pengisian' : `Tampilkan Berikutnya (${filledCount}/5)`}
          </button>
        </div>

        {/* 5 Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {cards.map((c, i) => {
            const isShown = i < filledCount;
            return (
              <div
                key={c.label}
                className={`p-3.5 rounded-xl border transition-all text-center space-y-1 ${
                  isShown
                    ? 'bg-surface-container-lowest border-primary shadow-xs'
                    : 'bg-surface-container-low/40 border-outline-variant/30 opacity-40'
                }`}
              >
                <span className="text-[10px] font-bold text-primary uppercase">{c.label}</span>
                <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
                  {isShown ? c.val : '...'}
                </div>
                <div className="text-[10px] text-on-surface-variant font-medium">{c.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 11. BOXPLOT VISUAL
// =========================================================================
export const BoxplotVisual: React.FC = () => {
  const [xMin, setXMin] = useState<number>(12);
  const [q1, setQ1] = useState<number>(18);
  const [med, setMed] = useState<number>(25);
  const [q3, setQ3] = useState<number>(34);
  const [xMax, setXMax] = useState<number>(55);
  const [showRawDots, setShowRawDots] = useState<boolean>(true);

  const iqr = q3 - q1;
  const leftWhisker = q1 - xMin;
  const rightWhisker = xMax - q3;

  // Evaluate shape
  let shapeNote = 'Kotak dan kedua whisker relatif seimbang (Cenderung Simetris).';
  if (rightWhisker > leftWhisker * 1.5 || med - q1 < q3 - med) {
    shapeNote = 'Whisker kanan lebih panjang & median dekat ke Q1 (Cenderung Right-Skewed / Positif).';
  } else if (leftWhisker > rightWhisker * 1.5) {
    shapeNote = 'Whisker kiri lebih panjang (Cenderung Left-Skewed / Negatif).';
  }

  const minScale = 5;
  const maxScale = 65;
  const getX = (val: number) => 30 + ((val - minScale) / (maxScale - minScale)) * 440;

  const steps = [
    {
      title: 'Tentukan Five-Number Summary',
      description: 'Menemukan nilai X smallest (12), Q1 (18), Median (25), Q3 (34), dan X largest (55).',
      formula: '5 Angka: [12, 18, 25, 34, 55]',
      substitution: `Nilai minimum = 12, Q1 = 18, Median = 25, Q3 = 34, Maksimum = 55`,
      result: `Parameter garis boxplot`,
    },
    {
      title: 'Gambar Kotak Box dari Q1 ke Q3',
      description: 'Menggambar kotak selebar IQR = Q3 − Q1 = 34 − 18 = 16 menit.',
      formula: 'Kotak = Rentang [Q1, Q3]',
      substitution: `Kotak membentang dari posisi 18 ke 34 dengan garis vertikal di median 25`,
      result: `Kotak IQR terbentuk`,
    },
    {
      title: 'Tarik Garis Whisker ke Nilai Ekstrem',
      description: 'Garis whisker ditarik dari Q1 ke X smallest dan dari Q3 ke X largest.',
      formula: 'Whisker Kiri: [X smallest, Q1] | Whisker Kanan: [Q3, X largest]',
      substitution: `Kiri: 12 ke 18 (panjang 6) | Kanan: 34 ke 55 (panjang 21)`,
      result: `Whisker kanan jauh lebih panjang → Right-Skewed`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container">
          <div>
            <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Diagram Kotak Garis (Boxplot):
            </span>
            <p className="text-[11px] text-on-surface-variant">
              Tarik slider X largest ke kanan untuk melihat whisker kanan memanjang (Right-Skewed)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowRawDots(!showRawDots)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showRawDots ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface'
            }`}
          >
            {showRawDots ? 'Sembunyikan Titik Mentah' : 'Tampilkan Titik Mentah'}
          </button>
        </div>

        {/* Boxplot SVG */}
        <div className="relative w-full h-44 sm:h-48">
          <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible select-none">
            {/* Horizontal Axis */}
            <line x1="30" y1="130" x2="470" y2="130" stroke="#64748b" strokeWidth="1.5" />
            {[10, 20, 30, 40, 50, 60].map((tick) => (
              <g key={tick}>
                <line x1={getX(tick)} y1="130" x2={getX(tick)} y2="136" stroke="#64748b" />
                <text x={getX(tick)} y="148" textAnchor="middle" fontSize="10" fill="#64748b" className="font-mono">
                  {tick}
                </text>
              </g>
            ))}

            {/* Raw Dots above boxplot */}
            {showRawDots &&
              datasetB.rawValues.map((v, i) => (
                <circle
                  key={i}
                  cx={getX(v)}
                  cy="40"
                  r="4"
                  fill="#0d9488"
                  opacity="0.8"
                />
              ))}

            {/* Left Whisker Line */}
            <line
              x1={getX(xMin)}
              y1="85"
              x2={getX(q1)}
              y2="85"
              stroke="#0f766e"
              strokeWidth="2"
            />
            {/* Left Whisker End Cap */}
            <line
              x1={getX(xMin)}
              y1="75"
              x2={getX(xMin)}
              y2="95"
              stroke="#0f766e"
              strokeWidth="2"
            />

            {/* Right Whisker Line */}
            <line
              x1={getX(q3)}
              y1="85"
              x2={getX(xMax)}
              y2="85"
              stroke="#0f766e"
              strokeWidth="2"
            />
            {/* Right Whisker End Cap */}
            <line
              x1={getX(xMax)}
              y1="75"
              x2={getX(xMax)}
              y2="95"
              stroke="#0f766e"
              strokeWidth="2"
            />

            {/* BOX: Q1 to Q3 */}
            <rect
              x={getX(q1)}
              y="65"
              width={Math.max(1, getX(q3) - getX(q1))}
              height="40"
              fill="#99f6e4"
              stroke="#0f766e"
              strokeWidth="2"
              rx="2"
            />

            {/* Median Line inside box */}
            <line
              x1={getX(med)}
              y1="65"
              x2={getX(med)}
              y2="105"
              stroke="#0f172a"
              strokeWidth="2.5"
            />

            {/* IQR Bracket above box */}
            <path
              d={`M ${getX(q1)} 60 L ${getX(q1)} 54 L ${getX(q3)} 54 L ${getX(q3)} 60`}
              fill="none"
              stroke="#0f766e"
              strokeWidth="1.5"
            />
            <text
              x={(getX(q1) + getX(q3)) / 2}
              y="48"
              textAnchor="middle"
              fontSize="10"
              fontWeight="bold"
              fill="#0f766e"
            >
              IQR = {iqr}
            </text>

            {/* Exact Marker Labels */}
            <text x={getX(xMin)} y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
              X smallest
            </text>
            <text x={getX(xMin)} y="108" textAnchor="middle" fontSize="9" fill="#64748b">
              {xMin}
            </text>

            <text x={getX(q1)} y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
              Q1
            </text>
            <text x={getX(q1)} y="108" textAnchor="middle" fontSize="9" fill="#64748b">
              {q1}
            </text>

            <text x={getX(med)} y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
              Median (Q2)
            </text>
            <text x={getX(med)} y="108" textAnchor="middle" fontSize="9" fill="#64748b">
              {med}
            </text>

            <text x={getX(q3)} y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
              Q3
            </text>
            <text x={getX(q3)} y="108" textAnchor="middle" fontSize="9" fill="#64748b">
              {q3}
            </text>

            <text x={getX(xMax)} y="118" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
              X largest
            </text>
            <text x={getX(xMax)} y="108" textAnchor="middle" fontSize="9" fill="#64748b">
              {xMax}
            </text>
          </svg>
        </div>

        {/* Live Note: Cara Membaca Bentuk */}
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
          <strong>Cara Membaca Bentuk Distribusi:</strong> {shapeNote}
        </div>

        {/* Slider for X largest */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-on-surface">
            <span>Ubah Nilai Ekstrem (X largest):</span>
            <span className="font-mono font-bold text-primary">{xMax} menit</span>
          </div>
          <input
            type="range"
            min="38"
            max="65"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 12. POPULATION MEASURES VISUAL
// =========================================================================
export const PopulationMeasuresVisual: React.FC = () => {
  const [mode, setMode] = useState<'sample' | 'population'>('sample');

  const { expected } = datasetA;

  const isSample = mode === 'sample';

  const steps = [
    {
      title: 'Pahami Perbedaan Parameter Populasi vs Statistik Sampel',
      description: 'Populasi memakai simbol Yunani (μ, σ², σ) sedangkan Sampel memakai simbol alfabet Latin (X̄, S², S).',
      formula: 'Populasi: Pembagi N | Sampel: Pembagi n − 1',
      substitution: `Dataset A: Σ(X − X̄)² = 218`,
      result: `Jumlah kuadrat deviasi = 218`,
    },
    {
      title: 'Pilih Pembagi Derajat Kebebasan yang Tepat',
      description: 'Pada sampel, 1 derajat kebebasan hilang karena telah dipakai untuk mengestimasi mean sampel (X̄).',
      formula: isSample ? 'S² = 218 / (7 − 1) = 218 / 6' : 'σ² = 218 / 7',
      substitution: isSample ? `218 / 6 = 36.33 menit²` : `218 / 7 = 31.14 menit²`,
      result: isSample ? `S² = 36.33 | S = 6.03` : `σ² = 31.14 | σ = 5.58`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Mode Toggle Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container">
          <span className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Pilih Sudut Pandang Data:
          </span>

          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
            <button
              type="button"
              onClick={() => setMode('sample')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSample ? 'bg-primary text-on-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sampel (n − 1 = 6)
            </button>
            <button
              type="button"
              onClick={() => setMode('population')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isSample ? 'bg-primary text-on-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Populasi (N = 7)
            </button>
          </div>
        </div>

        {/* Comparative Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              {isSample ? 'Mean Sampel (X̄)' : 'Mean Populasi (μ)'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-black">
              {expected.mean} <span className="text-xs font-sans text-black font-bold">menit</span>
            </div>
            <div className="text-xs text-black font-mono font-bold">ΣX / {isSample ? 'n (7)' : 'N (7)'}</div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              {isSample ? 'Variance Sampel (S²)' : 'Variance Populasi (σ²)'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-black">
              {isSample ? expected.sampleVariance : expected.populationVariance}{' '}
              <span className="text-xs font-sans text-black font-bold">menit²</span>
            </div>
            <div className="text-xs text-black font-mono">
              218 / <strong className="text-black font-bold">{isSample ? '6 (n − 1)' : '7 (N)'}</strong>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              {isSample ? 'Simpangan Baku (S)' : 'Simpangan Baku (σ)'}
            </span>
            <div className="text-2xl font-extrabold font-mono text-black">
              {isSample ? expected.sampleSd : expected.populationSd}{' '}
              <span className="text-xs font-sans text-black font-bold">menit</span>
            </div>
            <div className="text-xs text-black font-mono font-bold">
              √{isSample ? expected.sampleVariance : expected.populationVariance}
            </div>
          </div>
        </div>

        {/* Explain difference */}
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 text-xs sm:text-sm text-black leading-relaxed">
          {isSample ? (
            <p className="text-black">
              ℹ️ <strong className="text-black font-bold">Kenapa sampel dibagi (n − 1)?</strong> Pembagi <strong className="text-black font-bold">n − 1</strong> berfungsi sebagai <em className="not-italic text-black font-bold">Koreksi Bessel</em> agar variansi sampel tidak bias (*unbiased estimator*) saat digunakan untuk menduga variansi populasi sebenarnya.
            </p>
          ) : (
            <p className="text-black">
              ℹ️ <strong className="text-black font-bold">Kenapa populasi dibagi N?</strong> Ketika seluruh data sensus populasi lengkap tersedia tanpa proses sampling, tidak ada derajat kebebasan yang hilang sehingga dibagi penuh dengan ukuran total <strong className="text-black font-bold">N = 7</strong>.
            </p>
          )}
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 13. COVARIANCE VISUAL
// =========================================================================
export const CovarianceVisual: React.FC = () => {
  const [points, setPoints] = useState(studyExamData.pairs);

  const meanX = 13.08;
  const meanY = 72.67;

  // calculate covariance
  const sumProd = points.reduce((acc, p) => acc + (p.x - meanX) * (p.y - meanY), 0);
  const covXY = sumProd / (points.length - 1);

  const handleDrag = (id: number, deltaY: number) => {
    setPoints(
      points.map((p) => (p.id === id ? { ...p, y: Math.max(40, Math.min(100, p.y + deltaY)) } : p))
    );
  };

  const steps = [
    {
      title: 'Hitung Rata-Rata Kedua Variabel (X̄ dan Ȳ)',
      description: 'Mencari titik pusat gravitasi sebaran data jam belajar dan nilai ujian.',
      formula: 'X̄ = ΣX / n | Ȳ = ΣY / n',
      substitution: `X̄ = 13.08 jam | Ȳ = 72.67 poin`,
      result: `Titik potong sumbu kuadran: (13.08, 72.67)`,
    },
    {
      title: 'Hitung Produk Deviasi: (Xᵢ − X̄)(Yᵢ − Ȳ)',
      description: 'Titik di Kuadran I dan III menghasilkan produk bertanda (+), sedangkan Kuadran II dan IV menghasilkan tanda (−).',
      formula: 'Produk Deviasi = (Xᵢ − X̄)(Yᵢ − Ȳ)',
      substitution: `Sebagian besar titik amatan berada di Kuadran I (+) dan Kuadran III (+)`,
      result: `Σ(Xᵢ − X̄)(Yᵢ − Ȳ) = ${sumProd.toFixed(2)}`,
    },
    {
      title: 'Bagi dengan (n − 1) untuk Sample Covariance',
      description: 'Mengukur arah hubungan linear bersama antara X dan Y.',
      formula: 'cov(X, Y) = Σ(Xᵢ − X̄)(Yᵢ − Ȳ) / (n − 1)',
      substitution: `cov(X, Y) = ${sumProd.toFixed(2)} / (12 − 1) = ${covXY.toFixed(2)}`,
      result: `Kovarians Positif = ${covXY.toFixed(2)} (Hubungan searah)`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        {/* Stats Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container">
          <div>
            <span className="text-xs font-bold text-on-surface uppercase">Kovarians Sampel (cov(X, Y)):</span>
            <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {covXY >= 0 ? `+${covXY.toFixed(2)}` : covXY.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-teal-700">
              <span className="w-3 h-3 rounded-full bg-teal-600 flex items-center justify-center text-white text-[9px] font-bold">+</span>
              Produk Positif
            </span>
            <span className="flex items-center gap-1 font-semibold text-rose-700">
              <span className="w-3 h-3 rounded-full bg-rose-600 flex items-center justify-center text-white text-[9px] font-bold">−</span>
              Produk Negatif
            </span>
          </div>
        </div>

        {/* 4-Quadrant Scatter Plot SVG */}
        <div className="relative w-full h-56 sm:h-64">
          <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible select-none">
            {/* Quadrant Crosshair lines */}
            {(() => {
              const crossX = 40 + (meanX / 28) * 420;
              const crossY = 200 - ((meanY - 50) / 45) * 160;

              return (
                <g>
                  {/* Background Quadrant Labels */}
                  <rect x={crossX} y="20" width={460 - crossX} height={crossY - 20} fill="#f0fdf4" opacity="0.6" />
                  <text x={crossX + 10} y="35" fontSize="10" fontWeight="bold" fill="#15803d">
                    Kuadran I (+)
                  </text>

                  <rect x="40" y="20" width={crossX - 40} height={crossY - 20} fill="#fff1f2" opacity="0.6" />
                  <text x="50" y="35" fontSize="10" fontWeight="bold" fill="#be123c">
                    Kuadran II (−)
                  </text>

                  <rect x="40" y={crossY} width={crossX - 40} height={200 - crossY} fill="#f0fdf4" opacity="0.6" />
                  <text x="50" y={190} fontSize="10" fontWeight="bold" fill="#15803d">
                    Kuadran III (+)
                  </text>

                  <rect x={crossX} y={crossY} width={460 - crossX} height={200 - crossY} fill="#fff1f2" opacity="0.6" />
                  <text x={crossX + 10} y={190} fontSize="10" fontWeight="bold" fill="#be123c">
                    Kuadran IV (−)
                  </text>

                  {/* Crosshair Lines */}
                  <line x1={crossX} y1="20" x2={crossX} y2="200" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="40" y1={crossY} x2="460" y2={crossY} stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 3" />

                  {/* Axes labels */}
                  <text x="250" y="222" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                    Jam Belajar per Minggu (X) → X̄ = 13.08
                  </text>
                  <text x="18" y="110" textAnchor="middle" transform="rotate(-90 18 110)" fontSize="10" fontWeight="bold" fill="#334155">
                    Nilai Ujian (Y) → Ȳ = 72.67
                  </text>
                </g>
              );
            })()}

            {/* Scatter Points with +/- icons */}
            {points.map((p) => {
              const cx = 40 + (p.x / 28) * 420;
              const cy = 200 - ((p.y - 50) / 45) * 160;
              const isPositive = (p.x - meanX) * (p.y - meanY) >= 0;

              return (
                <g key={p.id} className="cursor-pointer">
                  <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill={isPositive ? '#0d9488' : '#e11d48'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={cx}
                    y={cy + 3.5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="#ffffff"
                  >
                    {isPositive ? '+' : '−'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 14. CORRELATION VISUAL
// =========================================================================
export const CorrelationVisual: React.FC = () => {
  const [preset, setPreset] = useState<'strong-pos' | 'strong-neg' | 'none'>('strong-pos');

  const rValues: Record<string, { r: number; label: string }> = {
    'strong-pos': { r: 0.98, label: 'Hubungan Positif Sangat Kuat (r = +0.98)' },
    'strong-neg': { r: -0.95, label: 'Hubungan Negatif Sangat Kuat (r = −0.95)' },
    none: { r: 0.02, label: 'Tidak Ada Hubungan Linear (r ≈ 0)' },
  };

  const current = rValues[preset];

  const steps = [
    {
      title: 'Hitung Covariance dan Standar Deviasi Kedua Variabel',
      description: 'Menyiapkan parameter cov(X, Y), S_X, dan S_Y.',
      formula: 'cov(X, Y) = 77.49 | S_X = 7.15 | S_Y = 11.08',
      substitution: `cov(X, Y) = 77.49, S_X = 7.15, S_Y = 11.08`,
      result: `Parameter lengkap`,
    },
    {
      title: 'Bagi Kovarians dengan Perkalian Standar Deviasi',
      description: 'Standarisasi nilai kovarians agar berada dalam batas universal [−1, +1].',
      formula: 'r = cov(X, Y) / (S_X × S_Y)',
      substitution: `r = 77.49 / (7.15 × 11.08) = 77.49 / 79.22 = 0.98`,
      result: `Koefisien Korelasi r = +0.98`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container">
          <span className="text-xs font-bold text-on-surface uppercase">Pilih Pola Hubungan:</span>
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
            <button
              type="button"
              onClick={() => setPreset('strong-pos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === 'strong-pos' ? 'bg-primary text-on-primary shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Positif Kuat (+0.98)
            </button>
            <button
              type="button"
              onClick={() => setPreset('strong-neg')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === 'strong-neg' ? 'bg-rose-600 text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Negatif Kuat (−0.95)
            </button>
            <button
              type="button"
              onClick={() => setPreset('none')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                preset === 'none' ? 'bg-amber-600 text-white shadow-2xs' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Nol (r ≈ 0)
            </button>
          </div>
        </div>

        {/* Gauge / Meter from -1 to +1 */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-on-surface">Skala Koefisien Korelasi (r):</span>
            <span className="text-base font-extrabold font-mono text-primary">
              r = {current.r >= 0 ? `+${current.r.toFixed(2)}` : current.r.toFixed(2)}
            </span>
          </div>

          {/* Bar track from -1 to +1 */}
          <div className="relative h-6 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            {/* Center mark */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-400 z-10" />

            {/* Filled bar */}
            {current.r >= 0 ? (
              <div
                className="absolute top-0 bottom-0 left-1/2 bg-teal-600 transition-all duration-300 rounded-r-full"
                style={{ width: `${(current.r / 1) * 50}%` }}
              />
            ) : (
              <div
                className="absolute top-0 bottom-0 bg-rose-600 transition-all duration-300 rounded-l-full"
                style={{
                  left: `${50 - (Math.abs(current.r) / 1) * 50}%`,
                  width: `${(Math.abs(current.r) / 1) * 50}%`,
                }}
              />
            )}
          </div>

          <div className="flex justify-between text-[11px] font-mono text-on-surface-variant font-medium">
            <span>−1.0 (Negatif Sempurna)</span>
            <span>0.0 (Tidak Ada Korelasi)</span>
            <span>+1.0 (Positif Sempurna)</span>
          </div>
        </div>

        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs text-teal-950 dark:text-teal-200 font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{current.label}</span>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// MASTER ROUTER COMPONENT FOR MEASURE VISUALS
// =========================================================================
interface MeasureVisualProps {
  type: string;
}

export const MeasureVisuals: React.FC<MeasureVisualProps> = ({ type }) => {
  switch (type) {
    case 'mean-median-mode':
      return <MeanMedianModeVisual />;
    case 'geometric-mean':
      return <GeometricMeanVisual />;
    case 'range':
      return <RangeVisual />;
    case 'variance-sd':
      return <VarianceSdVisual />;
    case 'coefficient-of-variation':
      return <CoefficientOfVariationVisual />;
    case 'z-score':
      return <ZScoreVisual />;
    case 'skewness':
      return <SkewnessVisual />;
    case 'kurtosis':
      return <KurtosisVisual />;
    case 'quartiles-iqr':
      return <QuartilesIqrVisual />;
    case 'five-number-summary':
      return <FiveNumberSummaryVisual />;
    case 'boxplot':
      return <BoxplotVisual />;
    case 'population-measures':
      return <PopulationMeasuresVisual />;
    case 'covariance':
      return <CovarianceVisual />;
    case 'correlation':
      return <CorrelationVisual />;
    default:
      return null;
  }
};
