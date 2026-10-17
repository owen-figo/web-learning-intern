import React, { useState } from 'react';
import {
  tableASampleData,
  tableBSampleData,
  diceSampleSpace,
  ContingencyCell,
} from '../data/probabilitySampleData';
import { CalculationStepper } from './MeasureVisuals';

// =========================================================================
// 1. PROBABILITY SCALE VISUAL
// =========================================================================
export const ProbabilityScaleVisual: React.FC = () => {
  const [x, setX] = useState<number>(3);
  const [t, setT] = useState<number>(6);

  // Ensure x <= t
  const safeX = Math.min(x, t);
  const prob = t > 0 ? safeX / t : 0;
  const pct = prob * 100;

  const steps = [
    {
      title: 'Tentukan Total Banyak Outcome yang Mungkin (T)',
      description: 'Menghitung seluruh kemungkinan hasil yang ada di dalam ruang sampel.',
      formula: 'T = Total Outcome',
      substitution: `Pada pelemparan satu dadu bersisi enam: T = ${t} sisi`,
      result: `T = ${t}`,
    },
    {
      title: 'Tentukan Banyak Cara Event Terjadi (X)',
      description: 'Menghitung banyaknya hasil yang memenuhi kriteria event yang diamati.',
      formula: 'X = Banyak Hasil Sesuai Kriteria',
      substitution: `Kriteria event (misal bilangan genap {2, 4, 6}): X = ${safeX} hasil`,
      result: `X = ${safeX}`,
    },
    {
      title: 'Hitung Peluang Kejadian: P(A) = X / T',
      description: 'Membagi banyak cara event terjadi dengan total seluruh kemungkinan hasil.',
      formula: 'P(A) = X / T',
      substitution: `P(A) = ${safeX} / ${t} = ${prob.toFixed(4)}`,
      result: `P(A) = ${prob.toFixed(2)} (${(prob * 100).toFixed(1)}%)`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Pengatur Nilai X dan T:
            </span>
            <p className="text-xs text-black font-medium">
              Ubah nilai X (banyak event) dan T (total outcome) untuk melihat posisi probabilitas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Stepper for X */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-2xs">
              <span className="text-xs font-bold text-black">X =</span>
              <button
                type="button"
                onClick={() => setX((prev) => Math.max(0, prev - 1))}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-black font-bold flex items-center justify-center transition-colors"
                aria-label="Kurangi X"
              >
                −
              </button>
              <span className="w-8 text-center font-mono font-bold text-black text-sm">{safeX}</span>
              <button
                type="button"
                onClick={() => setX((prev) => Math.min(t, prev + 1))}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-black font-bold flex items-center justify-center transition-colors"
                aria-label="Tambah X"
              >
                +
              </button>
            </div>

            {/* Stepper for T */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-2xs">
              <span className="text-xs font-bold text-black">T =</span>
              <button
                type="button"
                onClick={() => {
                  const newT = Math.max(1, t - 1);
                  setT(newT);
                  if (x > newT) setX(newT);
                }}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-black font-bold flex items-center justify-center transition-colors"
                aria-label="Kurangi T"
              >
                −
              </button>
              <span className="w-8 text-center font-mono font-bold text-black text-sm">{t}</span>
              <button
                type="button"
                onClick={() => setT((prev) => prev + 1)}
                className="w-7 h-7 rounded-lg bg-surface-container hover:bg-surface-container-high text-black font-bold flex items-center justify-center transition-colors"
                aria-label="Tambah T"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Big Live Value Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              Bentuk Pecahan (X / T)
            </span>
            <div className="text-2xl font-extrabold text-black font-mono">
              {safeX} / {t}
            </div>
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-teal-600/40 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              Nilai Desimal P(A)
            </span>
            <div className="text-2xl font-extrabold text-teal-800 dark:text-teal-300 font-mono">
              {prob.toFixed(4)}
            </div>
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-amber-500/40 shadow-2xs space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wide">
              Persentase Peluang
            </span>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
              {(prob * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Horizontal Probability Scale [0, 1] */}
        <div className="relative pt-16 pb-10 px-4">
          {/* Main Track */}
          <div className="h-3 w-full bg-gradient-to-r from-rose-200 via-amber-200 to-teal-200 dark:from-rose-950 dark:via-amber-950 dark:to-teal-950 rounded-full relative border border-outline-variant/40">
            {/* Ticks along track */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((val) => (
              <div
                key={val}
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${val * 100}%` }}
              >
                <div className="w-0.5 h-4 bg-slate-500" />
                <span className="text-xs font-mono font-bold text-black mt-1 select-none">
                  {val.toFixed(2)}
                </span>
              </div>
            ))}

            {/* Pointer / Marker */}
            <div
              className="absolute -top-12 flex flex-col items-center -translate-x-1/2 transition-all duration-200 z-20 pointer-events-none"
              style={{ left: `${pct}%` }}
            >
              <div className="px-2.5 py-1 rounded-lg bg-teal-800 text-white text-xs font-bold whitespace-nowrap shadow-md">
                P(A) = {prob.toFixed(2)}
              </div>
              <div className="w-0.5 h-7 bg-teal-800" />
              <div className="w-4 h-4 rounded-full bg-teal-700 border-2 border-white shadow-md -mt-1" />
            </div>
          </div>

          {/* Left & Right Scale End Labels */}
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-black pt-8">
            <div className="flex items-center gap-1.5 text-rose-800 dark:text-rose-400 font-extrabold">
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>0.0 (Impossible Event / Mustahil)</span>
            </div>
            <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-400 font-extrabold">
              <span>1.0 (Certain Event / Pasti)</span>
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          </div>
        </div>

        {/* Live Observation Box */}
        <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 text-xs sm:text-sm text-black font-medium leading-relaxed">
          {prob === 0 && (
            <p className="text-black">
              💡 <strong>Impossible Event:</strong> Karena X = 0, event tidak memiliki cara untuk terjadi sama sekali dalam ruang sampel (P = 0).
            </p>
          )}
          {prob === 1 && (
            <p className="text-black">
              💡 <strong>Certain Event:</strong> Karena X = T, seluruh outcome dalam ruang sampel memenuhi kriteria event sehingga pasti terjadi (P = 1).
            </p>
          )}
          {prob > 0 && prob < 1 && (
            <p className="text-black">
              💡 <strong>Rentang Standar:</strong> Nilai probabilitas selalu berada di antara 0 dan 1 (0 ≤ P ≤ 1). Pada kondisi X = {safeX} dari T = {t}, peluang keberhasilan adalah <strong>{(prob * 100).toFixed(1)}%</strong>.
            </p>
          )}
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 2. JENIS PROBABILITAS VISUAL
// =========================================================================
export const JenisProbabilitasVisual: React.FC = () => {
  // A Priori Die Face
  const [selectedDieFace, setSelectedDieFace] = useState<number>(4);

  // Empirical Coin Simulator
  const [headsCount, setHeadsCount] = useState<number>(27);
  const [totalFlips, setTotalFlips] = useState<number>(50);

  // Subjective Slider
  const [subjectiveProb, setSubjectiveProb] = useState<number>(70);

  const simulateFlips = (n: number) => {
    let heads = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() >= 0.5) heads++;
    }
    setHeadsCount((prev) => prev + heads);
    setTotalFlips((prev) => prev + n);
  };

  const resetFlips = () => {
    setHeadsCount(0);
    setTotalFlips(0);
  };

  const empiricalProb = totalFlips > 0 ? headsCount / totalFlips : 0;

  const steps = [
    {
      title: 'Pahami Tiga Pendekatan Probabilitas',
      description: 'Probabilitas dapat ditentukan secara deduktif teoritis (A Priori), induktif observasional (Empiris), atau persepsi subjektif.',
      formula: 'A Priori (X/T teoritis) | Empiris (Frekuensi Relatif) | Subjektif (Keyakinan)',
      substitution: `Dadu: 1/6 (A Priori) | Koin: ${headsCount}/${totalFlips} = ${empiricalProb.toFixed(4).replace('.', ',')} (Empiris) | Subjektif: ${subjectiveProb}%`,
      result: `Tiga metode menentukan peluang sesuai ketersediaan informasi`,
    },
  ];

  return (
    <div className="@container w-full space-y-5">
      {/* Cards stacked vertically, one per row at full width of column. Only multi-col if container >= 900px */}
      <div className="grid grid-cols-1 @min-[900px]:grid-cols-3 gap-5">
        
        {/* CARD 1: A PRIORI */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-surface-container-low/80 border border-teal-600/40 shadow-xs space-y-4">
          {/* Header Row */}
          <div className="space-y-1.5 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-teal-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                1
              </span>
              <h3 className="text-xl font-bold text-[#1B2430]">
                1. A Priori Probability
              </h3>
            </div>
            <p className="text-base text-[#1B2430] leading-relaxed">
              Berdasarkan pengetahuan deduktif sebelumnya tentang sifat proses atau simetri objek fisik.
            </p>
          </div>

          {/* Body: Left interactive control & Right Hasil panel, stack < 640px */}
          <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* Left: Interactive Control */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex flex-col justify-between space-y-3">
              <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                Pilih Angka Dadu:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
                {[1, 2, 3, 4, 5, 6].map((face) => (
                  <button
                    key={face}
                    type="button"
                    onClick={() => setSelectedDieFace(face)}
                    className={`min-w-[48px] min-h-[48px] h-12 w-12 sm:w-14 sm:h-14 rounded-xl font-mono font-bold text-lg flex items-center justify-center transition-all cursor-pointer ${
                      selectedDieFace === face
                        ? 'bg-teal-700 text-white shadow-md scale-105 ring-2 ring-teal-500'
                        : 'bg-surface-container hover:bg-surface-container-high text-[#1B2430] border border-outline-variant/60'
                    }`}
                  >
                    {face}
                  </button>
                ))}
              </div>
              <p className="text-sm text-[#1B2430] font-medium">
                Setiap sisi dadu adil memiliki peluang yang sama besar tanpa memerlukan percobaan fisik.
              </p>
            </div>

            {/* Right: Hasil (Result) Panel */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-teal-600/40 flex flex-col justify-center space-y-2">
              <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                Hasil Peluang A Priori:
              </span>
              <div className="text-2xl font-bold font-mono text-[#1B2430]">
                P(Angka {selectedDieFace}) = 1 / 6 ≈ 0,1667 (16,7%)
              </div>
              <p className="text-base text-[#1B2430] leading-relaxed">
                Dihitung langsung dari struktur dadu adil tanpa perlu melempar satu kali pun.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: EMPIRICAL */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-surface-container-low/80 border border-blue-600/40 shadow-xs space-y-4">
          {/* Header Row */}
          <div className="space-y-1.5 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-blue-700 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                2
              </span>
              <h3 className="text-xl font-bold text-[#1B2430]">
                2. Empirical Probability
              </h3>
            </div>
            <p className="text-base text-[#1B2430] leading-relaxed">
              Berdasarkan data frekuensi relatif hasil observasi percobaan atau survei nyata di lapangan.
            </p>
          </div>

          {/* Body: Left interactive control & Right Hasil panel, stack < 640px */}
          <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* Left: Interactive Control */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex flex-col justify-between space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                  Simulasi Lempar Koin:
                </span>
                <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-lg bg-surface-container text-[#1B2430]">
                  Total: {totalFlips}x (Kepala: {headsCount})
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5 items-center pt-1">
                <button
                  type="button"
                  onClick={() => simulateFlips(10)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-sm sm:text-base font-bold text-[#1B2430] border border-outline-variant/60 shadow-2xs transition-colors cursor-pointer"
                >
                  +10x
                </button>
                <button
                  type="button"
                  onClick={() => simulateFlips(50)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-sm sm:text-base font-bold text-[#1B2430] border border-outline-variant/60 shadow-2xs transition-colors cursor-pointer"
                >
                  +50x
                </button>
                <button
                  type="button"
                  onClick={() => simulateFlips(100)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-sm sm:text-base font-bold text-[#1B2430] border border-outline-variant/60 shadow-2xs transition-colors cursor-pointer"
                >
                  +100x
                </button>
                <button
                  type="button"
                  onClick={resetFlips}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-surface-container hover:bg-rose-100 text-sm sm:text-base font-bold text-rose-700 border border-outline-variant/60 shadow-2xs transition-colors ml-auto cursor-pointer"
                  title="Reset Lemparan"
                >
                  Reset
                </button>
              </div>
              <p className="text-sm text-[#1B2430] font-medium">
                Klik tombol di atas untuk menambah lemparan acak dan amati perubahan proporsi.
              </p>
            </div>

            {/* Right: Hasil (Result) Panel */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-blue-600/40 flex flex-col justify-center space-y-2">
              <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                Hasil Peluang Empiris:
              </span>
              <div className="text-2xl font-bold font-mono text-[#1B2430]">
                P(Kepala) = {headsCount} / {totalFlips} ≈ {totalFlips > 0 ? empiricalProb.toFixed(4).replace('.', ',') : '0,0000'}
              </div>
              <p className="text-base text-[#1B2430] leading-relaxed">
                Semakin banyak lemparan, proporsi empiris akan semakin mendekati nilai teoritis 0.50 (Law of Large Numbers).
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: SUBJECTIVE */}
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-surface-container-low/80 border border-amber-600/40 shadow-xs space-y-4">
          {/* Header Row */}
          <div className="space-y-1.5 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-amber-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                3
              </span>
              <h3 className="text-xl font-bold text-[#1B2430]">
                3. Subjective Probability
              </h3>
            </div>
            <p className="text-base text-[#1B2430] leading-relaxed">
              Berdasarkan intuisi, pengalaman masa lalu, atau keyakinan individu terhadap situasi unik.
            </p>
          </div>

          {/* Body: Left interactive control & Right Hasil panel, stack < 640px */}
          <div className="grid grid-cols-1 @min-[640px]:grid-cols-2 gap-4 sm:gap-5 items-stretch">
            {/* Left: Interactive Control */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                  Tingkat Keyakinanmu:
                </span>
                <span className="text-lg font-mono font-bold px-3 py-1 rounded-xl bg-amber-500/20 text-[#1B2430] border border-amber-600/40 shadow-2xs">
                  {subjectiveProb}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={subjectiveProb}
                onChange={(e) => setSubjectiveProb(Number(e.target.value))}
                className="w-full h-3 accent-amber-600 cursor-pointer rounded-lg bg-surface-container"
              />
              <p className="text-sm text-[#1B2430] font-medium italic">
                Contoh: &ldquo;Menurut saya peluang lolos seleksi beasiswa sekitar {subjectiveProb}%.&rdquo;
              </p>
            </div>

            {/* Right: Hasil (Result) Panel */}
            <div className="p-4 sm:p-5 bg-surface-container-lowest rounded-xl border border-amber-600/40 flex flex-col justify-center space-y-2">
              <span className="text-sm font-bold text-[#1B2430] uppercase tracking-wide">
                Karakteristik Subjektif:
              </span>
              <div className="text-2xl font-bold text-[#1B2430]">
                Tidak Memerlukan Rumus Matematis
              </div>
              <p className="text-base text-[#1B2430] leading-relaxed">
                Digunakan saat data historis tidak tersedia dan eksperimen berulang tidak mungkin dilakukan secara fisik.
              </p>
            </div>
          </div>
        </div>

      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 3. SAMPLE SPACE VISUAL
// =========================================================================
export const SampleSpaceVisual: React.FC = () => {
  const [filterEven, setFilterEven] = useState<boolean>(true);
  const [filterGt3, setFilterGt3] = useState<boolean>(false);

  // Filter dice outcomes
  const activeOutcomes = diceSampleSpace.filter((d) => {
    if (filterEven && filterGt3) return d.isEven && d.greaterThan3;
    if (filterEven) return d.isEven;
    if (filterGt3) return d.greaterThan3;
    return false;
  });

  const isBoth = filterEven && filterGt3;
  const isSingle = (filterEven && !filterGt3) || (!filterEven && filterGt3);
  const isNone = !filterEven && !filterGt3;

  const count = isNone ? 0 : activeOutcomes.length;
  const total = diceSampleSpace.length; // 6
  const prob = count / total;

  const steps = [
    {
      title: 'Identifikasi Seluruh Ruang Sampel S',
      description: 'Menuliskan semua kemungkinan hasil yang bisa terjadi.',
      formula: 'S = {1, 2, 3, 4, 5, 6}',
      substitution: `Total outcome dalam ruang sampel dadu: T = 6`,
      result: `T = 6`,
    },
    {
      title: 'Tentukan Simple vs Joint Event',
      description: 'Satu kriteria disebut Simple Event; gabungan dua atau lebih kriteria disebut Joint Event.',
      formula: isBoth ? 'Joint Event: Genap AND > 3' : 'Simple Event',
      substitution: isBoth
        ? `Hasil yang genap DAN lebih dari 3: {4, 6} (X = 2)`
        : `Hasil yang memenuhi satu kriteria: X = ${count}`,
      result: `P = ${count} / 6 = ${prob.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        {/* Checkbox controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Pilih Karakteristik Kejadian (Event):
            </span>
            <p className="text-xs text-black font-medium">
              Centang satu kotak untuk <strong>Simple Event</strong>, atau centang keduanya untuk <strong>Joint Event</strong>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-2xs">
              <input
                type="checkbox"
                checked={filterEven}
                onChange={(e) => setFilterEven(e.target.checked)}
                className="w-4 h-4 accent-teal-700 cursor-pointer"
              />
              <span className="text-xs font-bold text-black">Angka Genap</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/60 shadow-2xs">
              <input
                type="checkbox"
                checked={filterGt3}
                onChange={(e) => setFilterGt3(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-black">Lebih dari 3 (&gt; 3)</span>
            </label>
          </div>
        </div>

        {/* 6 Numbered Tiles */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-black">Ruang Sampel S = &#123; 1, 2, 3, 4, 5, 6 &#125;:</span>
            <span className="font-mono font-bold text-black">
              {isBoth && 'Mode: Joint Event (Irisan A ∩ B)'}
              {isSingle && 'Mode: Simple Event (1 Karakteristik)'}
              {isNone && 'Pilih minimal satu kotak di atas'}
            </span>
          </div>

          <div className="grid grid-cols-6 gap-3">
            {diceSampleSpace.map((d) => {
              const isMatch = isBoth
                ? d.isEven && d.greaterThan3
                : filterEven
                ? d.isEven
                : filterGt3
                ? d.greaterThan3
                : false;

              return (
                <div
                  key={d.value}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    isMatch
                      ? isBoth
                        ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-600 scale-105 shadow-md'
                        : 'bg-teal-100 dark:bg-teal-950/70 border-teal-700 scale-105 shadow-md'
                      : 'bg-surface-container-lowest border-outline-variant/40 opacity-40'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-black">
                    {d.value}
                  </span>
                  <span className="text-[10px] font-bold text-black mt-1">
                    {d.isEven ? 'Genap' : 'Ganjil'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status & Live Calculation Card */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isBoth
                    ? 'bg-amber-600 text-white'
                    : isSingle
                    ? 'bg-teal-700 text-white'
                    : 'bg-surface-container text-black'
                }`}
              >
                {isBoth ? 'Joint Event' : isSingle ? 'Simple Event' : 'Belum Dipilih'}
              </span>
              <span className="text-xs font-bold text-black">
                {isBoth && 'Genap DAN Lebih dari 3 = {4, 6}'}
                {!isBoth && filterEven && 'Karakteristik: Bilangan Genap = {2, 4, 6}'}
                {!isBoth && filterGt3 && 'Karakteristik: Angka > 3 = {4, 5, 6}'}
              </span>
            </div>
            <p className="text-xs text-black font-medium">
              Banyak outcome yang memenuhi: <strong>{count}</strong> dari total <strong>6</strong> kemungkinan.
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-black uppercase">Peluang Event P(A):</span>
            <div className="text-2xl font-extrabold text-black font-mono">
              {count} / {total} = {prob.toFixed(2)} ({(prob * 100).toFixed(0)}%)
            </div>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 4. CONTINGENCY PROBABILITY VISUAL (Table A: Simple, Joint, Marginal, Complement)
// =========================================================================
export const ContingencyProbabilityVisual: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<'joint-lolos' | 'marginal-rutin' | 'complement' | null>(
    'joint-lolos'
  );

  const data = tableASampleData;
  const totalRutin = data.rutinLolos + data.rutinGagal; // 120
  const totalTidakRutin = data.tidakRutinLolos + data.tidakRutinGagal; // 80
  const totalLolos = data.rutinLolos + data.tidakRutinLolos; // 110
  const totalGagal = data.rutinGagal + data.tidakRutinGagal; // 90
  const grandTotal = totalRutin + totalTidakRutin; // 200

  const steps = [
    {
      title: 'Baca Data dari Tabel Kontingensi 2x2',
      description: 'Mengambil frekuensi gabungan dari perpotongan baris dan kolom yang diamati.',
      formula: 'P(Event) = Frekuensi Sel / Grand Total',
      substitution: `Nilai sel: 90 mahasiswa rutin dan nilainya ≥ 70, dari total 200 mahasiswa`,
      result: `X = 90, T = 200`,
    },
    {
      title: 'Hitung Joint Probability: P(Rutin and ≥70)',
      description: 'Membagi frekuensi sel perpotongan dengan grand total.',
      formula: 'P(A and B) = (Sel A ∩ B) / Total',
      substitution: `P(Rutin and ≥70) = 90 / 200 = 0.45`,
      result: `P(Rutin and ≥70) = 0.45 (45%)`,
    },
    {
      title: 'Hitung Marginal Probability: P(Rutin)',
      description: 'Menjumlahkan seluruh sel pada baris yang sama.',
      formula: 'P(A) = P(A and B) + P(A and B′)',
      substitution: `P(Rutin) = 0.45 + 0.15 = 0.60 (atau 120 / 200)`,
      result: `P(Rutin) = 0.60 (60%)`,
    },
    {
      title: 'Hitung Komplemen: P(Rutin′) = 1 − P(Rutin)',
      description: 'Peluang seluruh kejadian selain belajar rutin.',
      formula: 'P(A′) = 1 − P(A)',
      substitution: `P(Tidak Rutin) = 1 − 0.60 = 0.40 (atau 80 / 200)`,
      result: `P(Tidak Rutin) = 0.40 (40%)`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Mode Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Eksplorasi Probabilitas pada Tabel A (n = 200):
            </span>
            <p className="text-xs text-black font-medium">
              Klik sel dalam tabel untuk melihat jenis probabilitasnya
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCell('joint-lolos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCell === 'joint-lolos'
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Joint: Rutin &amp; ≥70
            </button>
            <button
              type="button"
              onClick={() => setSelectedCell('marginal-rutin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCell === 'marginal-rutin'
                  ? 'bg-primary text-on-primary shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Marginal: P(Rutin)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCell('complement')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCell === 'complement'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Komplemen P(A′)
            </button>
          </div>
        </div>

        {/* 2x2 Contingency Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
          <table className="w-full text-xs sm:text-sm text-center border-collapse">
            <thead>
              <tr className="bg-surface-container text-black font-bold border-b-2 border-outline-variant/80">
                <th className="py-3 px-3 text-left">Kebiasaan Belajar</th>
                <th className="py-3 px-3">Nilai ≥ 70</th>
                <th className="py-3 px-3">Nilai &lt; 70</th>
                <th className="py-3 px-3 bg-surface-container-high/60 font-extrabold">Total Baris (Marginal)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {/* Row 1: Rutin */}
              <tr className={selectedCell === 'marginal-rutin' ? 'bg-primary-fixed/20' : ''}>
                <td className="py-2.5 px-3 font-bold text-left text-black">Belajar Rutin</td>
                <td
                  onClick={() => setSelectedCell('joint-lolos')}
                  className={`py-2.5 px-3 font-mono font-bold cursor-pointer transition-colors ${
                    selectedCell === 'joint-lolos'
                      ? 'bg-teal-600 text-white shadow-inner scale-105'
                      : 'hover:bg-surface-container-low text-black'
                  }`}
                >
                  {data.rutinLolos}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">{data.rutinGagal}</td>
                <td
                  onClick={() => setSelectedCell('marginal-rutin')}
                  className={`py-2.5 px-3 font-mono font-extrabold cursor-pointer ${
                    selectedCell === 'marginal-rutin'
                      ? 'bg-primary text-on-primary shadow-inner'
                      : 'bg-surface-container-low/40 text-black hover:bg-surface-container-high'
                  }`}
                >
                  {totalRutin}
                </td>
              </tr>

              {/* Row 2: Tidak Rutin */}
              <tr className={selectedCell === 'complement' ? 'bg-amber-100 dark:bg-amber-950/60' : ''}>
                <td className="py-2.5 px-3 font-bold text-left text-black">Tidak Rutin</td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">{data.tidakRutinLolos}</td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">{data.tidakRutinGagal}</td>
                <td
                  onClick={() => setSelectedCell('complement')}
                  className={`py-2.5 px-3 font-mono font-extrabold cursor-pointer ${
                    selectedCell === 'complement'
                      ? 'bg-amber-600 text-white shadow-inner'
                      : 'bg-surface-container-low/40 text-black hover:bg-surface-container-high'
                  }`}
                >
                  {totalTidakRutin}
                </td>
              </tr>

              {/* Total Row */}
              <tr className="bg-surface-container font-bold border-t-2 border-outline-variant/80">
                <td className="py-3 px-3 text-left text-black font-extrabold">Total Kolom (Marginal)</td>
                <td className="py-3 px-3 font-mono font-extrabold text-black">{totalLolos}</td>
                <td className="py-3 px-3 font-mono font-extrabold text-black">{totalGagal}</td>
                <td className="py-3 px-3 font-mono font-extrabold text-teal-800 dark:text-teal-300 text-base">
                  {grandTotal}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dynamic Explanation Panel */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 space-y-2">
          {selectedCell === 'joint-lolos' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide">
                Joint Probability: P(Rutin and ≥70)
              </span>
              <div className="text-xl font-mono font-extrabold text-black">
                P(Rutin and ≥70) = 90 / 200 = 0.45 (45%)
              </div>
              <p className="text-xs text-black font-medium">
                Peluang seorang mahasiswa yang dipilih acak memiliki kedua karakteristik sekaligus: rajin belajar rutin <strong>dan</strong> memperoleh nilai ujian ≥ 70.
              </p>
            </div>
          )}

          {selectedCell === 'marginal-rutin' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                Marginal Probability: P(Rutin)
              </span>
              <div className="text-xl font-mono font-extrabold text-black">
                P(Rutin) = 120 / 200 = 0.60 (60%)
              </div>
              <p className="text-xs text-black font-medium">
                Probabilitas marginal adalah jumlah total dari seluruh joint probability pada baris tersebut: 0.45 (lolos) + 0.15 (gagal) = 0.60.
              </p>
            </div>
          )}

          {selectedCell === 'complement' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Complement Rule: P(A′) = 1 − P(A)
              </span>
              <div className="text-xl font-mono font-extrabold text-black">
                P(Tidak Rutin) = 1 − P(Rutin) = 1 − 0.60 = 0.40 (40%)
              </div>
              <p className="text-xs text-black font-medium">
                Kejadian komplementer mencakup semua amatan di luar event A. Karena total probabilitas adalah 1, maka P(A′) = 1 − P(A) = 80 / 200 = 0.40.
              </p>
            </div>
          )}
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 5. CONDITIONAL PROBABILITY VISUAL (Shrinking World)
// =========================================================================
export const ConditionalProbabilityVisual: React.FC = () => {
  const [condition, setCondition] = useState<'rutin' | 'tidak-rutin' | 'lolos' | 'gagal'>('rutin');
  const [reversed, setReversed] = useState<boolean>(false);

  const data = tableASampleData;
  const totalRutin = 120;
  const totalTidakRutin = 80;
  const totalLolos = 110;
  const totalGagal = 90;

  // Primary: P(≥70 | Rutin) = 90 / 120 = 0.75
  // Reversed: P(Rutin | ≥70) = 90 / 110 ≈ 0.818
  const pLolosGivenRutin = data.rutinLolos / totalRutin; // 0.75
  const pRutinGivenLolos = data.rutinLolos / totalLolos; // 0.818

  const steps = [
    {
      title: 'Tentukan Kondisi Pembatas (Syarat B)',
      description: 'Informasi bahwa syarat B telah terjadi mengecilkan semesta data ke baris/kolom B saja.',
      formula: 'Dunia Mengecil ke Syarat B',
      substitution: reversed
        ? `Kondisi syarat: Mahasiswa yang nilainya ≥ 70 (Total B = ${totalLolos})`
        : `Kondisi syarat: Mahasiswa yang belajar rutin (Total B = ${totalRutin})`,
      result: reversed ? `Penyebut = ${totalLolos}` : `Penyebut = ${totalRutin}`,
    },
    {
      title: 'Ambil Frekuensi Irisan P(A and B)',
      description: 'Mencari banyaknya data yang memenuhi target A di dalam kelompok syarat B.',
      formula: 'X = Sel Irisan A ∩ B',
      substitution: `Banyak mahasiswa rutin yang nilainya ≥ 70: X = 90`,
      result: `X = 90`,
    },
    {
      title: 'Bagi Peluang Bersama dengan Peluang Syarat: P(A | B)',
      description: 'Menghitung rasio peluang bersyarat.',
      formula: 'P(A | B) = P(A and B) / P(B) = (Sel A ∩ B) / Total B',
      substitution: reversed
        ? `P(Rutin | ≥70) = 90 / 110 ≈ ${pRutinGivenLolos.toFixed(3)} (atau 0.45 / 0.55)`
        : `P(≥70 | Rutin) = 90 / 120 = ${pLolosGivenRutin.toFixed(2)} (atau 0.45 / 0.60)`,
      result: reversed
        ? `P(Rutin | ≥70) ≈ ${pRutinGivenLolos.toFixed(3)}`
        : `P(≥70 | Rutin) = ${pLolosGivenRutin.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Condition Picker & Reverse Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Pilih Syarat Kondisi (Dunia Mengecil):
            </span>
            <p className="text-xs text-black font-medium">
              Baris/kolom di luar syarat akan meredup, menunjukkan semesta data mengecil ke kondisi tersebut
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCondition('rutin');
                setReversed(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                condition === 'rutin' && !reversed
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Syarat: Rutin
            </button>
            <button
              type="button"
              onClick={() => {
                setCondition('tidak-rutin');
                setReversed(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                condition === 'tidak-rutin' && !reversed
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Syarat: Tidak Rutin
            </button>
            <button
              type="button"
              onClick={() => {
                setCondition('lolos');
                setReversed(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                condition === 'lolos' && !reversed
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Syarat: Nilai ≥ 70
            </button>

            <button
              type="button"
              onClick={() => setReversed(!reversed)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-2xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 ml-2"
            >
              <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
              <span>Tukar Urutan P(A|B) vs P(B|A)</span>
            </button>
          </div>
        </div>

        {/* Shrinking World Table Visual */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
          <table className="w-full text-xs sm:text-sm text-center border-collapse">
            <thead>
              <tr className="bg-surface-container text-black font-bold border-b-2 border-outline-variant/80">
                <th className="py-2.5 px-3 text-left">Kebiasaan Belajar</th>
                <th
                  className={`py-2.5 px-3 transition-opacity ${
                    condition === 'gagal' ? 'opacity-30 bg-surface-container-low' : ''
                  }`}
                >
                  Nilai ≥ 70
                </th>
                <th
                  className={`py-2.5 px-3 transition-opacity ${
                    condition === 'lolos' ? 'opacity-30 bg-surface-container-low' : ''
                  }`}
                >
                  Nilai &lt; 70
                </th>
                <th className="py-2.5 px-3 bg-surface-container-high/60">Total Baris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {/* Row 1: Rutin */}
              <tr
                className={`transition-all ${
                  condition === 'tidak-rutin'
                    ? 'opacity-25 bg-surface-container-low'
                    : 'bg-teal-50 dark:bg-teal-950/30'
                }`}
              >
                <td className="py-2.5 px-3 font-bold text-left text-black">Belajar Rutin</td>
                <td
                  className={`py-2.5 px-3 font-mono font-bold ${
                    condition === 'gagal' ? 'opacity-20' : 'text-teal-800 dark:text-teal-300 font-extrabold text-base'
                  }`}
                >
                  {data.rutinLolos}
                </td>
                <td
                  className={`py-2.5 px-3 font-mono font-bold ${
                    condition === 'lolos' ? 'opacity-20' : 'text-black'
                  }`}
                >
                  {data.rutinGagal}
                </td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black">{totalRutin}</td>
              </tr>

              {/* Row 2: Tidak Rutin */}
              <tr
                className={`transition-all ${
                  condition === 'rutin' ? 'opacity-25 bg-surface-container-low' : ''
                }`}
              >
                <td className="py-2.5 px-3 font-bold text-left text-black">Tidak Rutin</td>
                <td
                  className={`py-2.5 px-3 font-mono font-bold ${
                    condition === 'gagal' ? 'opacity-20' : 'text-black'
                  }`}
                >
                  {data.tidakRutinLolos}
                </td>
                <td
                  className={`py-2.5 px-3 font-mono font-bold ${
                    condition === 'lolos' ? 'opacity-20' : 'text-black'
                  }`}
                >
                  {data.tidakRutinGagal}
                </td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black">{totalTidakRutin}</td>
              </tr>

              {/* Row Totals */}
              <tr className="bg-surface-container font-bold border-t-2 border-outline-variant/80">
                <td className="py-2.5 px-3 text-left text-black font-extrabold">Total Kolom</td>
                <td
                  className={`py-2.5 px-3 font-mono font-extrabold text-black ${
                    condition === 'gagal' ? 'opacity-25' : ''
                  }`}
                >
                  {totalLolos}
                </td>
                <td
                  className={`py-2.5 px-3 font-mono font-extrabold text-black ${
                    condition === 'lolos' ? 'opacity-25' : ''
                  }`}
                >
                  {totalGagal}
                </td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black">200</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Calculation Card */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-teal-700/40 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide">
              {reversed ? 'Probabilitas Bersyarat Terbalik:' : 'Perhitungan Probabilitas Bersyarat:'}
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200">
              {reversed ? 'P(Rutin | ≥70)' : 'P(≥70 | Rutin)'}
            </span>
          </div>

          <div className="text-lg sm:text-xl font-mono font-extrabold text-black">
            {reversed ? (
              <span>
                P(Rutin | ≥70) = 90 / 110 ≈ 0.8182 (81.8%)
              </span>
            ) : (
              <span>
                P(≥70 | Rutin) = 90 / 120 = 0.7500 (75.0%)
              </span>
            )}
          </div>

          <div className="text-xs font-mono text-black font-semibold">
            Bentuk Rumus: {reversed ? 'P(Rutin and ≥70) / P(≥70) = 0.45 / 0.55 ≈ 0.818' : 'P(Rutin and ≥70) / P(Rutin) = 0.45 / 0.60 = 0.75'}
          </div>

          <p className="text-xs text-black font-medium leading-relaxed pt-1 border-t border-outline-variant/40">
            💡 <strong>Penting:</strong> Perhatikan bahwa P(A | B) <strong>tidak sama</strong> dengan P(B | A) (0.75 ≠ 0.818). Urutan kondisi syarat menentukan pembagi populasi yang digunakan.
          </p>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 6. DECISION TREE VISUAL (SVG Tree with sliders and coin toggle)
// =========================================================================
export const DecisionTreeVisual: React.FC = () => {
  const [isCoinMode, setIsCoinMode] = useState<boolean>(false);
  const [selectedLeaf, setSelectedLeaf] = useState<string | null>('rutin-lolos');
  const [clickedBranchInfo, setClickedBranchInfo] = useState<string | null>(null);

  // Sliders for Table A
  const [pRutin, setPRutin] = useState<number>(0.60);
  const [pLolosGivenRutin, setPLolosGivenRutin] = useState<number>(0.75);
  const [pLolosGivenTidakRutin, setPLolosGivenTidakRutin] = useState<number>(0.25);

  // Computed complements for Table A
  const pTidakRutin = 1 - pRutin;
  const pGagalGivenRutin = 1 - pLolosGivenRutin;
  const pGagalGivenTidakRutin = 1 - pLolosGivenTidakRutin;

  // Joint leaves
  const leaf1 = pRutin * pLolosGivenRutin;
  const leaf2 = pRutin * pGagalGivenRutin;
  const leaf3 = pTidakRutin * pLolosGivenTidakRutin;
  const leaf4 = pTidakRutin * pGagalGivenTidakRutin;
  const totalLeafSum = leaf1 + leaf2 + leaf3 + leaf4;

  const steps = [
    {
      title: 'Tentukan Event Pertama & Gambar Cabang Awal',
      description: 'Cabang tingkat pertama menggambarkan probabilitas marginal (P(Rutin) dan P(Tidak Rutin)).',
      formula: 'P(Rutin) + P(Tidak Rutin) = 1.0',
      substitution: `P(Rutin) = ${pRutin.toFixed(2)}, P(Tidak Rutin) = ${pTidakRutin.toFixed(2)}`,
      result: `Tingkat 1 Selesai`,
    },
    {
      title: 'Gambar Cabang Kedua dengan Probabilitas Bersyarat',
      description: 'Setiap cabang berikutnya memuat peluang bersyarat yang jumlahnya harus 1 pada masing-masing simpul.',
      formula: 'P(≥70 | Rutin) + P(<70 | Rutin) = 1.0',
      substitution: `${pLolosGivenRutin.toFixed(2)} + ${pGagalGivenRutin.toFixed(2)} = 1.00`,
      result: `Tingkat 2 Selesai`,
    },
    {
      title: 'Kalikan Peluang Sepanjang Cabang untuk Mencari Joint Probability',
      description: 'Peluang pada ujung pohon (leaf) adalah hasil kali seluruh cabang dari pangkal.',
      formula: 'P(A and B) = P(A) × P(B | A)',
      substitution: `${pRutin.toFixed(2)} × ${pLolosGivenRutin.toFixed(2)} = ${leaf1.toFixed(4)}`,
      result: `Total seluruh ujung pohon = ${totalLeafSum.toFixed(2)}`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Diagram Pohon Keputusan (Decision Tree):
            </span>
            <p className="text-xs text-black font-medium">
              Cabang tingkat 1 garis padat (Marginal); Cabang tingkat 2 garis putus-putus (Bersyarat).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCoinMode(!isCoinMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                isCoinMode
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              {isCoinMode ? 'Kembali ke Data Mahasiswa' : '⚡ Contoh Independen: Lempar Koin 2x'}
            </button>
          </div>
        </div>

        {/* Sliders for Tree parameters (only when not in coin mode) */}
        {!isCoinMode && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/60">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black">
                <span>P(Rutin):</span>
                <span className="font-mono text-teal-800 dark:text-teal-300">{pRutin.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={pRutin}
                onChange={(e) => setPRutin(Number(e.target.value))}
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black">
                <span>P(≥70 | Rutin):</span>
                <span className="font-mono text-blue-700 dark:text-blue-300">{pLolosGivenRutin.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={pLolosGivenRutin}
                onChange={(e) => setPLolosGivenRutin(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-black">
                <span>P(≥70 | Tidak Rutin):</span>
                <span className="font-mono text-amber-700 dark:text-amber-300">{pLolosGivenTidakRutin.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={pLolosGivenTidakRutin}
                onChange={(e) => setPLolosGivenTidakRutin(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Inline SVG Decision Tree */}
        <div className="w-full overflow-x-auto bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60">
          <svg viewBox="0 0 760 320" className="w-full min-w-[650px] h-72 select-none">
            {/* Root Node */}
            <circle cx="40" cy="160" r="12" fill="#0f766e" />
            <text x="40" y="195" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'Mulai Lempar Koin' : '200 Mhs'}
            </text>

            {/* Branch 1 Top: Marginal Rutin / Koin 1 K */}
            <path
              d="M 40 160 C 120 160, 140 80, 220 80"
              fill="none"
              stroke="#0f766e"
              strokeWidth="3"
              className="cursor-pointer hover:stroke-teal-500 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Marginal: P(Kepala₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Marginal: P(Rutin) = ${pRutin.toFixed(2)}`
                )
              }
            />
            <text x="120" y="105" fontSize="11" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'Kepala (0.50)' : `Rutin (${pRutin.toFixed(2)})`}
            </text>
            <text x="120" y="120" fontSize="9" fill="#000000">
              [Marginal]
            </text>

            {/* Branch 1 Bottom: Marginal Tidak Rutin / Koin 1 B */}
            <path
              d="M 40 160 C 120 160, 140 240, 220 240"
              fill="none"
              stroke="#0f766e"
              strokeWidth="3"
              className="cursor-pointer hover:stroke-teal-500 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Marginal: P(Buntut₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Marginal: P(Tidak Rutin) = ${pTidakRutin.toFixed(2)}`
                )
              }
            />
            <text x="120" y="215" fontSize="11" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'Buntut (0.50)' : `Tidak Rutin (${pTidakRutin.toFixed(2)})`}
            </text>
            <text x="120" y="230" fontSize="9" fill="#000000">
              [Marginal]
            </text>

            {/* Level 1 Nodes */}
            <circle cx="220" cy="80" r="8" fill="#0284c7" />
            <circle cx="220" cy="240" r="8" fill="#d97706" />

            {/* Level 2 Sub-Branches from Top (Rutin / K₁) */}
            {/* Sub-Branch 1: Lolos / K₂ */}
            <path
              d="M 220 80 C 300 80, 320 40, 420 40"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="cursor-pointer hover:stroke-blue-400 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Bersyarat: P(K₂ | K₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Bersyarat: P(≥70 | Rutin) = ${pLolosGivenRutin.toFixed(2)}`
                )
              }
            />
            <text x="300" y="50" fontSize="10" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'K₂ (0.50)' : `≥70 (${pLolosGivenRutin.toFixed(2)})`}
            </text>
            <text x="300" y="63" fontSize="8" fill="#000000">
              [Bersyarat]
            </text>

            {/* Sub-Branch 2: Gagal / B₂ */}
            <path
              d="M 220 80 C 300 80, 320 120, 420 120"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="cursor-pointer hover:stroke-blue-400 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Bersyarat: P(B₂ | K₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Bersyarat: P(<70 | Rutin) = ${pGagalGivenRutin.toFixed(2)}`
                )
              }
            />
            <text x="300" y="115" fontSize="10" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'B₂ (0.50)' : `<70 (${pGagalGivenRutin.toFixed(2)})`}
            </text>
            <text x="300" y="128" fontSize="8" fill="#000000">
              [Bersyarat]
            </text>

            {/* Level 2 Sub-Branches from Bottom (Tidak Rutin / B₁) */}
            {/* Sub-Branch 3: Lolos / K₂ */}
            <path
              d="M 220 240 C 300 240, 320 200, 420 200"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="cursor-pointer hover:stroke-amber-400 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Bersyarat: P(K₂ | B₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Bersyarat: P(≥70 | Tidak Rutin) = ${pLolosGivenTidakRutin.toFixed(2)}`
                )
              }
            />
            <text x="300" y="210" fontSize="10" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'K₂ (0.50)' : `≥70 (${pLolosGivenTidakRutin.toFixed(2)})`}
            </text>
            <text x="300" y="223" fontSize="8" fill="#000000">
              [Bersyarat]
            </text>

            {/* Sub-Branch 4: Gagal / B₂ */}
            <path
              d="M 220 240 C 300 240, 320 280, 420 280"
              fill="none"
              stroke="#d97706"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="cursor-pointer hover:stroke-amber-400 transition-all"
              onClick={() =>
                setClickedBranchInfo(
                  isCoinMode
                    ? 'Cabang ini adalah Probabilitas Bersyarat: P(B₂ | B₁) = 0.50'
                    : `Cabang ini adalah Probabilitas Bersyarat: P(<70 | Tidak Rutin) = ${pGagalGivenTidakRutin.toFixed(2)}`
                )
              }
            />
            <text x="300" y="275" fontSize="10" fontWeight="bold" fill="#000000">
              {isCoinMode ? 'B₂ (0.50)' : `<70 (${pGagalGivenTidakRutin.toFixed(2)})`}
            </text>
            <text x="300" y="288" fontSize="8" fill="#000000">
              [Bersyarat]
            </text>

            {/* Leaf Box 1: Rutin & Lolos / KK */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedLeaf('leaf1')}
            >
              <rect
                x="430"
                y="20"
                width="310"
                height="40"
                rx="8"
                fill={selectedLeaf === 'leaf1' ? '#ccfbf1' : '#f8fafc'}
                stroke="#0f766e"
                strokeWidth={selectedLeaf === 'leaf1' ? '2.5' : '1'}
              />
              <text x="445" y="44" fontSize="11" fontWeight="bold" fill="#000000">
                {isCoinMode
                  ? 'P(K₁ and K₂) = 0.50 × 0.50 = 0.25'
                  : `P(Rutin and ≥70) = ${pRutin.toFixed(2)} × ${pLolosGivenRutin.toFixed(2)} = ${leaf1.toFixed(4)}`}
              </text>
            </g>

            {/* Leaf Box 2: Rutin & Gagal / KB */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedLeaf('leaf2')}
            >
              <rect
                x="430"
                y="100"
                width="310"
                height="40"
                rx="8"
                fill={selectedLeaf === 'leaf2' ? '#ccfbf1' : '#f8fafc'}
                stroke="#0f766e"
                strokeWidth={selectedLeaf === 'leaf2' ? '2.5' : '1'}
              />
              <text x="445" y="124" fontSize="11" fontWeight="bold" fill="#000000">
                {isCoinMode
                  ? 'P(K₁ and B₂) = 0.50 × 0.50 = 0.25'
                  : `P(Rutin and <70) = ${pRutin.toFixed(2)} × ${pGagalGivenRutin.toFixed(2)} = ${leaf2.toFixed(4)}`}
              </text>
            </g>

            {/* Leaf Box 3: Tidak Rutin & Lolos / BK */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedLeaf('leaf3')}
            >
              <rect
                x="430"
                y="180"
                width="310"
                height="40"
                rx="8"
                fill={selectedLeaf === 'leaf3' ? '#ccfbf1' : '#f8fafc'}
                stroke="#0f766e"
                strokeWidth={selectedLeaf === 'leaf3' ? '2.5' : '1'}
              />
              <text x="445" y="204" fontSize="11" fontWeight="bold" fill="#000000">
                {isCoinMode
                  ? 'P(B₁ and K₂) = 0.50 × 0.50 = 0.25'
                  : `P(Tidak Rutin and ≥70) = ${pTidakRutin.toFixed(2)} × ${pLolosGivenTidakRutin.toFixed(2)} = ${leaf3.toFixed(4)}`}
              </text>
            </g>

            {/* Leaf Box 4: Tidak Rutin & Gagal / BB */}
            <g
              className="cursor-pointer"
              onClick={() => setSelectedLeaf('leaf4')}
            >
              <rect
                x="430"
                y="260"
                width="310"
                height="40"
                rx="8"
                fill={selectedLeaf === 'leaf4' ? '#ccfbf1' : '#f8fafc'}
                stroke="#0f766e"
                strokeWidth={selectedLeaf === 'leaf4' ? '2.5' : '1'}
              />
              <text x="445" y="284" fontSize="11" fontWeight="bold" fill="#000000">
                {isCoinMode
                  ? 'P(B₁ and B₂) = 0.50 × 0.50 = 0.25'
                  : `P(Tidak Rutin and <70) = ${pTidakRutin.toFixed(2)} × ${pGagalGivenTidakRutin.toFixed(2)} = ${leaf4.toFixed(4)}`}
              </text>
            </g>
          </svg>
        </div>

        {/* Verification & Branch Inspector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-teal-700/40 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase">Verifikasi Jumlah Daun (Leaves):</span>
            <div className="text-base font-mono font-extrabold text-black">
              {isCoinMode ? '0.25 + 0.25 + 0.25 + 0.25 = 1.00' : `${leaf1.toFixed(3)} + ${leaf2.toFixed(3)} + ${leaf3.toFixed(3)} + ${leaf4.toFixed(3)} = ${totalLeafSum.toFixed(2)}`}
            </div>
            <p className="text-[11px] text-teal-800 dark:text-teal-300 font-bold">
              ✓ Jumlah seluruh peluang di ujung pohon selalu tepat 1.00 (100%).
            </p>
          </div>

          <div className="p-3.5 bg-surface-container-lowest rounded-xl border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase">Info Cabang yang Diklik:</span>
            <p className="text-xs text-black font-bold">
              {clickedBranchInfo || 'Klik salah satu garis cabang pohon di atas untuk melihat status probabilitasnya.'}
            </p>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 7. INDEPENDENCE VISUAL (Table A vs Table B with Editable cells)
// =========================================================================
export const IndependenceVisual: React.FC = () => {
  const [activeTable, setActiveTable] = useState<'tableA' | 'tableB'>('tableA');
  const [cellData, setCellData] = useState<ContingencyCell>({ ...tableASampleData });

  const handleSwitchTable = (tbl: 'tableA' | 'tableB') => {
    setActiveTable(tbl);
    setCellData(tbl === 'tableA' ? { ...tableASampleData } : { ...tableBSampleData });
  };

  const handleCellChange = (field: keyof ContingencyCell, val: number) => {
    setCellData((prev) => ({ ...prev, [field]: Math.max(0, val) }));
  };

  const totalRutin = cellData.rutinLolos + cellData.rutinGagal;
  const totalTidakRutin = cellData.tidakRutinLolos + cellData.tidakRutinGagal;
  const totalLolos = cellData.rutinLolos + cellData.tidakRutinLolos;
  const grandTotal = totalRutin + totalTidakRutin;

  // P(≥70)
  const pLolos = grandTotal > 0 ? totalLolos / grandTotal : 0;
  // P(≥70 | Rutin)
  const pLolosGivenRutin = totalRutin > 0 ? cellData.rutinLolos / totalRutin : 0;

  // Check independence: difference < 0.005
  const isIndependent = Math.abs(pLolos - pLolosGivenRutin) < 0.005;

  const steps = [
    {
      title: 'Hitung Peluang Marginal P(A)',
      description: 'Mencari peluang mahasiswa memperoleh nilai ≥ 70 tanpa memandang status belajar rutin.',
      formula: 'P(A) = Total A / Grand Total',
      substitution: `P(≥70) = ${totalLolos} / ${grandTotal} = ${pLolos.toFixed(3)}`,
      result: `P(≥70) = ${pLolos.toFixed(2)}`,
    },
    {
      title: 'Hitung Peluang Bersyarat P(A | B)',
      description: 'Mencari peluang mahasiswa memperoleh nilai ≥ 70 dengan syarat mereka belajar rutin.',
      formula: 'P(A | B) = Sel (A ∩ B) / Total B',
      substitution: `P(≥70 | Rutin) = ${cellData.rutinLolos} / ${totalRutin} = ${pLolosGivenRutin.toFixed(3)}`,
      result: `P(≥70 | Rutin) = ${pLolosGivenRutin.toFixed(2)}`,
    },
    {
      title: 'Bandingkan Keduanya: P(A | B) = P(A)',
      description: 'Jika hasilnya sama, kejadian bersifat independen; jika berbeda, kejadian bersifat dependen.',
      formula: 'Independen jika P(A | B) = P(A)',
      substitution: `${pLolosGivenRutin.toFixed(3)} ${isIndependent ? '=' : '≠'} ${pLolos.toFixed(3)}`,
      result: isIndependent ? 'Verdict: Independent (Bebas)' : 'Verdict: Dependent (Tidak Bebas)',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        {/* Switcher Table A vs Table B */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Panel Pengujian Independensi:
            </span>
            <p className="text-xs text-black font-medium">
              Dua event dikatakan <strong>Independent</strong> apabila terjadinya event B tidak memengaruhi probabilitas event A: P(A|B) = P(A)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSwitchTable('tableA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                activeTable === 'tableA'
                  ? 'bg-primary text-on-primary font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Preset Tabel A (Dependen)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTable('tableB')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                activeTable === 'tableB'
                  ? 'bg-teal-700 text-white font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Preset Tabel B (Independen)
            </button>
          </div>
        </div>

        {/* Editable Table */}
        <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
          <table className="w-full text-xs sm:text-sm text-center border-collapse">
            <thead>
              <tr className="bg-surface-container text-black font-bold border-b-2 border-outline-variant/80">
                <th className="py-2.5 px-3 text-left">Kebiasaan Belajar</th>
                <th className="py-2.5 px-3">Nilai ≥ 70</th>
                <th className="py-2.5 px-3">Nilai &lt; 70</th>
                <th className="py-2.5 px-3 bg-surface-container-high/60">Total Baris</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              <tr>
                <td className="py-2.5 px-3 font-bold text-left text-black">Belajar Rutin</td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={cellData.rutinLolos}
                    onChange={(e) => handleCellChange('rutinLolos', Number(e.target.value))}
                    className="w-16 text-center font-mono font-bold text-black bg-surface-container-lowest p-1 rounded border border-outline-variant/60"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={cellData.rutinGagal}
                    onChange={(e) => handleCellChange('rutinGagal', Number(e.target.value))}
                    className="w-16 text-center font-mono font-bold text-black bg-surface-container-lowest p-1 rounded border border-outline-variant/60"
                  />
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">{totalRutin}</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-left text-black">Tidak Rutin</td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={cellData.tidakRutinLolos}
                    onChange={(e) => handleCellChange('tidakRutinLolos', Number(e.target.value))}
                    className="w-16 text-center font-mono font-bold text-black bg-surface-container-lowest p-1 rounded border border-outline-variant/60"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="number"
                    value={cellData.tidakRutinGagal}
                    onChange={(e) => handleCellChange('tidakRutinGagal', Number(e.target.value))}
                    className="w-16 text-center font-mono font-bold text-black bg-surface-container-lowest p-1 rounded border border-outline-variant/60"
                  />
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-black">{totalTidakRutin}</td>
              </tr>
              <tr className="bg-surface-container font-bold border-t-2 border-outline-variant/80">
                <td className="py-2.5 px-3 text-left text-black font-extrabold">Total Kolom</td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black">{totalLolos}</td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black">{cellData.rutinGagal + cellData.tidakRutinGagal}</td>
                <td className="py-2.5 px-3 font-mono font-extrabold text-black text-sm">{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Independence Verdict Box */}
        <div
          className={`p-4 rounded-xl border-2 space-y-2 transition-all ${
            isIndependent
              ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-600 text-teal-950 dark:text-teal-100'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-100'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Hasil Komparasi: P(≥70) vs P(≥70 | Rutin)
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-2xs ${
                isIndependent ? 'bg-teal-700 text-white' : 'bg-amber-600 text-white'
              }`}
            >
              {isIndependent ? '✓ INDEPENDENT' : '✕ TIDAK INDEPENDENT (DEPENDEN)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/60">
              <span className="text-[11px] font-bold text-black uppercase">Peluang Marginal: P(≥70)</span>
              <div className="text-xl font-mono font-extrabold text-black">
                {totalLolos} / {grandTotal} = {pLolos.toFixed(3)}
              </div>
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/60">
              <span className="text-[11px] font-bold text-black uppercase">Peluang Bersyarat: P(≥70 | Rutin)</span>
              <div className="text-xl font-mono font-extrabold text-black">
                {cellData.rutinLolos} / {totalRutin} = {pLolosGivenRutin.toFixed(3)}
              </div>
            </div>
          </div>

          <p className="text-xs text-black font-medium leading-relaxed pt-1">
            {isIndependent ? (
              <span>
                💡 <strong>Kondisi Terpenuhi:</strong> Peluang mendapat nilai ≥ 70 sama persis baik mahasiswa belajar rutin maupun secara umum ({pLolos.toFixed(2)} = {pLolosGivenRutin.toFixed(2)}). Mengetahui kebiasaan belajar <strong>tidak mengubah</strong> peluang nilai ujian.
              </span>
            ) : (
              <span>
                💡 <strong>Kondisi Tidak Terpenuhi:</strong> Peluang mendapat nilai ≥ 70 pada kelompok rutin ({pLolosGivenRutin.toFixed(2)}) jauh lebih tinggi dibanding populasi umum ({pLolos.toFixed(2)}). Mengetahui kebiasaan belajar <strong>memengaruhi</strong> probabilitas nilai ujian (dependen).
              </span>
            )}
          </p>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 8. MULTIPLICATION RULE VISUAL (General & Independent)
// =========================================================================
export const MultiplicationRuleVisual: React.FC = () => {
  const [activePreset, setActivePreset] = useState<'tableA' | 'tableB' | 'coin'>('tableA');
  const [formOrder, setFormOrder] = useState<'A-given-B' | 'B-given-A'>('A-given-B');

  const steps = [
    {
      title: 'Pilih Aturan Perkalian yang Sesuai',
      description: 'Gunakan aturan umum untuk sembarang event; aturan perkalian independen hanya berlaku jika event terbukti bebas.',
      formula: 'Umum: P(A and B) = P(A | B) × P(B) | Independen: P(A and B) = P(A) × P(B)',
      substitution: `Pada Tabel A: P(Rutin and ≥70) = P(≥70 | Rutin) × P(Rutin) = 0.75 × 0.60 = 0.45`,
      result: `P(Rutin and ≥70) = 0.45`,
    },
    {
      title: 'Verifikasi dengan Menghitung Langsung dari Tabel',
      description: 'Membandingkan hasil perkalian dengan frekuensi perpotongan sel dibagi grand total.',
      formula: 'P(A and B) = Sel (A ∩ B) / Total',
      substitution: `90 / 200 = 0.45`,
      result: `0.45 = 0.45 (Terverifikasi Identik)`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Block 1: General Multiplication Rule */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              1. General Multiplication Rule (Aturan Perkalian Umum):
            </span>
            <p className="text-xs text-black font-medium">
              Berlaku untuk seluruh jenis kejadian (baik dependen maupun independen). Diperoleh dengan menata ulang rumus peluang bersyarat.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormOrder(formOrder === 'A-given-B' ? 'B-given-A' : 'A-given-B')}
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-black transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <span className="material-symbols-outlined text-[15px]">sync_alt</span>
              <span>Ganti Bentuk Ekivalen</span>
            </button>
          </div>
        </div>

        {/* Formula Display & Calculation */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-teal-700/40 space-y-3">
          <span className="text-[11px] font-bold text-black uppercase">Substitusi Angka Nyata (Tabel A):</span>
          {formOrder === 'A-given-B' ? (
            <div className="text-base sm:text-lg font-mono font-extrabold text-black">
              P(Rutin and ≥70) = P(≥70 | Rutin) × P(Rutin) = 0.75 × 0.60 = 0.45
            </div>
          ) : (
            <div className="text-base sm:text-lg font-mono font-extrabold text-black">
              P(Rutin and ≥70) = P(Rutin | ≥70) × P(≥70) ≈ 0.8182 × 0.55 = 0.45
            </div>
          )}

          {/* Direct verification */}
          <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/40 text-xs font-bold text-black">
            <span className="material-symbols-outlined text-teal-700 text-[18px]">verified</span>
            <span>Cek dengan menghitung langsung dari tabel: 90 / 200 = 0.45</span>
          </div>
        </div>
      </div>

      {/* Block 2: Multiplication Rule for Independent Events */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              2. Multiplication Rule for Independent Events (Khusus Kejadian Bebas):
            </span>
            <p className="text-xs text-black font-medium">
              Rumus cepat <strong>P(A and B) = P(A) × P(B)</strong> HANYA berlaku apabila kedua event terbukti independen!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePreset('tableA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                activePreset === 'tableA'
                  ? 'bg-amber-600 text-white font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Uji Tabel A (Dependen)
            </button>
            <button
              type="button"
              onClick={() => setActivePreset('tableB')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                activePreset === 'tableB'
                  ? 'bg-teal-700 text-white font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Uji Tabel B (Independen)
            </button>
            <button
              type="button"
              onClick={() => setActivePreset('coin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                activePreset === 'coin'
                  ? 'bg-blue-600 text-white font-extrabold'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              Contoh Koin (Bebas)
            </button>
          </div>
        </div>

        {/* Dynamic Comparison Panel */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/60 space-y-3">
          {activePreset === 'tableA' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">
                Hasil Uji pada Tabel A (Data Dependen):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="text-[11px] font-bold text-black block">Perkalian Cepat P(A) × P(B):</span>
                  <div className="text-lg font-bold text-black mt-1">0.60 × 0.55 = 0.33</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="text-[11px] font-bold text-black block">Nilai Joint Sebenarnya P(A and B):</span>
                  <div className="text-lg font-bold text-black mt-1">90 / 200 = 0.45</div>
                </div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 font-bold">
                ✕ Nilai berbeda (0.33 ≠ 0.45)! Rumus perkalian cepat P(A) × P(B) TIDAK BOLEH digunakan pada Tabel A karena kejadian tidak independen.
              </div>
            </div>
          )}

          {activePreset === 'tableB' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase">
                Hasil Uji pada Tabel B (Data Independen):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm font-mono">
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="text-[11px] font-bold text-black block">Perkalian Cepat P(A) × P(B):</span>
                  <div className="text-lg font-bold text-black mt-1">0.60 × 0.55 = 0.33</div>
                </div>
                <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/40">
                  <span className="text-[11px] font-bold text-black block">Nilai Joint Sebenarnya P(A and B):</span>
                  <div className="text-lg font-bold text-black mt-1">66 / 200 = 0.33</div>
                </div>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 rounded-lg border border-teal-300 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 font-bold">
                ✓ Nilai cocok sempurna (0.33 = 0.33)! Rumus P(A) × P(B) sah digunakan karena status belajar rutin dan nilai ujian pada Tabel B terbukti saling bebas.
              </div>
            </div>
          )}

          {activePreset === 'coin' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase">
                Contoh Koin Independen:
              </span>
              <div className="text-sm font-mono font-bold text-black">
                P(Kepala₁ and Kepala₂) = P(Kepala₁) × P(Kepala₂) = 0.50 × 0.50 = 0.25 (25%)
              </div>
              <p className="text-xs text-black font-medium leading-relaxed">
                Hasil lemparan koin pertama sama sekali tidak memengaruhi fisik lemparan koin kedua, sehingga kedua kejadian secara alamiah bersifat independen.
              </p>
            </div>
          )}
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// MASTER ROUTER COMPONENT FOR PROBABILITY VISUALS
// =========================================================================
interface ProbabilityVisualProps {
  type: string;
}

export const ProbabilityVisuals: React.FC<ProbabilityVisualProps> = ({ type }) => {
  switch (type) {
    case 'probability-scale':
      return <ProbabilityScaleVisual />;
    case 'jenis-probabilitas':
      return <JenisProbabilitasVisual />;
    case 'sample-space':
      return <SampleSpaceVisual />;
    case 'contingency-probability':
      return <ContingencyProbabilityVisual />;
    case 'conditional-probability':
      return <ConditionalProbabilityVisual />;
    case 'decision-tree':
      return <DecisionTreeVisual />;
    case 'independence':
      return <IndependenceVisual />;
    case 'multiplication-rule':
      return <MultiplicationRuleVisual />;
    default:
      return null;
  }
};
