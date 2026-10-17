import React, { useState } from 'react';
import {
  signalIssueData,
  signalIssueStats,
  quizBinomialData,
  websitePoissonData,
  poissonAreaWindows,
  ledHypergeometricData,
  combination,
  factorial,
  calcBinomialProb,
  calcPoissonProb,
  calcHypergeometricProb,
} from '../data/discreteSampleData';
import { CalculationStepper } from './MeasureVisuals';
import { RichText } from './RichText';

// =========================================================================
// 1. DISCRETE DISTRIBUTION VISUAL (Variabel Diskrit & Nilai Harapan / E(X))
// =========================================================================
export const DiscreteDistributionVisual: React.FC = () => {
  const [selectedX, setSelectedX] = useState<number>(2);

  const stats = signalIssueStats;
  const currentDetail = stats.details.find((d) => d.x === selectedX) || stats.details[2];

  const steps = [
    {
      title: 'Validasi Syarat Distribusi Probabilitas Diskrit',
      description: 'Periksa apakah setiap P(X) berada di antara 0 dan 1, serta total semua peluang sama dengan 1.',
      formula: '0 ≤ P(X = x) ≤ 1 dan Σ P(X = x) = 1',
      substitution: `P(0)+P(1)+P(2)+P(3)+P(4) = 0.10 + 0.30 + 0.30 + 0.20 + 0.10 = 1.00`,
      result: 'Syarat Terpenuhi: Sah sebagai distribusi probabilitas diskrit',
    },
    {
      title: 'Hitung Nilai Harapan / Rata-rata: E(X) = μ',
      description: 'Kalikan setiap nilai X dengan probabilitasnya masing-masing, lalu jumlahkan semuanya.',
      formula: 'E(X) = μ = Σ [x · P(X = x)]',
      substitution: `E(X) = (0×0.10) + (1×0.30) + (2×0.30) + (3×0.20) + (4×0.10) = 0 + 0.3 + 0.6 + 0.6 + 0.4`,
      result: `E(X) = 1.90 kali gangguan sinyal`,
    },
    {
      title: 'Hitung Deviasi Kuadrat Terbobot untuk Varians: σ²',
      description: 'Hitung (x - μ)² lalu kalikan dengan P(X = x) untuk setiap nilai X.',
      formula: 'σ² = Var(X) = Σ [(x - μ)² · P(X = x)]',
      substitution: `(0-1.9)²(0.1) + (1-1.9)²(0.3) + (2-1.9)²(0.3) + (3-1.9)²(0.2) + (4-1.9)²(0.1) = 0.361 + 0.243 + 0.003 + 0.242 + 0.441`,
      result: `Varians σ² = 1.29`,
    },
    {
      title: 'Hitung Standar Deviasi: σ = √σ²',
      description: 'Tarik akar kuadrat dari varians untuk mendapatkan simpangan rata-rata dalam satuan aslinya.',
      formula: 'σ = √[Var(X)]',
      substitution: `σ = √1.29 ≈ 1.13578`,
      result: `Standar Deviasi σ ≈ 1.136 kali gangguan`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        {/* Header & Context */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Studi Kasus: Gangguan Sinyal per Sesi Kuliah Online
            </span>
            <p className="text-xs text-black font-medium">
              Variabel acak X menyatakan jumlah frekuensi gangguan koneksi internet mahasiswa dalam 1 sesi kelas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
              Σ P(X) = 1.00 (100%)
            </span>
          </div>
        </div>

        {/* Probability Distribution Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>Grafik Batang Probabilitas P(X = x)</span>
            <span className="text-primary font-mono text-[11px]">
              Klik batang untuk melihat kalkulasi detail
            </span>
          </div>

          <div className="h-44 sm:h-52 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex items-end justify-around gap-2 sm:gap-6 pt-8">
            {signalIssueData.map((d) => {
              const isSelected = selectedX === d.x;
              const heightPercent = (d.p / 0.4) * 100; // max scale 0.4
              return (
                <button
                  key={d.x}
                  type="button"
                  onClick={() => setSelectedX(d.x)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <span
                    className={`text-[11px] font-bold font-mono transition-colors ${
                      isSelected ? 'text-primary scale-110' : 'text-black'
                    }`}
                  >
                    {d.p.toFixed(2)}
                  </span>
                  <div className="w-full max-w-[56px] h-32 sm:h-36 bg-surface-container rounded-t-lg relative flex items-end justify-center overflow-hidden">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        isSelected
                          ? 'bg-primary shadow-md'
                          : 'bg-primary/40 group-hover:bg-primary/60'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    {/* Expected value indicator overlay */}
                    {d.x === 2 && (
                      <div
                        className="absolute w-full border-t-2 border-dashed border-amber-600 top-[20%] pointer-events-none"
                        title="Titik Pusat Rata-rata E(X) = 1.90"
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded transition-colors ${
                      isSelected ? 'bg-primary text-on-primary' : 'text-black bg-surface-container'
                    }`}
                  >
                    X = {d.x}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Nilai Harapan / Mean E(X)
            </span>
            <div className="text-xl font-extrabold text-black font-mono">1.90</div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Rata-rata jangka panjang frekuensi gangguan per sesi adalah 1.90 kali.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Varians Populasi σ²
            </span>
            <div className="text-xl font-extrabold text-black font-mono">1.290</div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Kuadrat rata-rata deviasi jarak tiap outcome dari titik tengah 1.90.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Standar Deviasi σ
            </span>
            <div className="text-xl font-extrabold text-black font-mono">1.136</div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Penyimpangan khas sekitar ±1.14 kali gangguan dari rata-rata 1.90.
            </p>
          </div>
        </div>

        {/* Detail Breakdown for Selected X */}
        <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Detail Komponen Bar Terpilih (X = {selectedX}):</span>
            </div>
            <div className="text-xs text-black font-medium mt-1">
              Probabilitas P(X = {selectedX}) = <strong>{currentDetail.p.toFixed(2)}</strong>.
              Kontribusi ke E(X): <strong>{currentDetail.xTimesP.toFixed(2)}</strong>.
              Deviasi kuadrat terbobot: (X - 1.9)² × P(X) = <strong>{currentDetail.diffSqTimesP.toFixed(3)}</strong>.
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-primary/10 text-primary shrink-0">
            {((currentDetail.diffSqTimesP / stats.variance) * 100).toFixed(1)}% dari varians
          </span>
        </div>
      </div>

      {/* Stepper */}
      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 2. BINOMIAL CONDITIONS VISUAL (Syarat Eksperimen Binomial)
// =========================================================================
export const BinomialConditionsVisual: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'quiz' | 'coin' | 'cards'>('quiz');

  const conditions = [
    {
      num: '1',
      title: 'Jumlah Percobaan Tetap (n Identical Trials)',
      desc: 'Eksperimen terdiri dari n pengulangan yang jumlahnya telah ditentukan sebelum percobaan dimulai.',
      icon: 'repeat',
    },
    {
      num: '2',
      title: 'Hanya 2 Hasil yang Mungkin (Two Mutually Exclusive Outcomes)',
      desc: 'Setiap percobaan hanya berujung pada Sukses (S) atau Gagal (F), tanpa ada opsi ketiga.',
      icon: 'thumbs_up_down',
    },
    {
      num: '3',
      title: 'Peluang Sukses Tetap Konstan (Constant Probability π)',
      desc: 'Peluang sukses π tidak berubah dari percobaan pertama hingga percobaan terakhir.',
      icon: 'equalizer',
    },
    {
      num: '4',
      title: 'Percobaan Saling Independen (Independent Trials)',
      desc: 'Hasil satu percobaan sama sekali tidak memengaruhi kemungkinan hasil percobaan berikutnya.',
      icon: 'link_off',
    },
  ];

  const scenarios = {
    quiz: {
      name: 'Menjawab Kuis 5 Soal Pilihan Ganda dengan Menebak',
      isBinomial: true,
      n: 'n = 5 soal',
      outcomes: 'Benar (Sukses) atau Salah (Gagal)',
      pi: 'π = 0.25 (1 dari 4 opsi jawaban)',
      independence: 'Tebakan di soal #1 tidak memengaruhi peluang di soal #2',
      verdict: 'MEMENUHI 4 SYARAT (Distribusi Binomial Valid)',
      verdictColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
    coin: {
      name: 'Melempar Koin Adil Sebanyak 10 Kali',
      isBinomial: true,
      n: 'n = 10 lemparan',
      outcomes: 'Muncul Gambar (Sukses) atau Angka (Gagal)',
      pi: 'π = 0.50 tetap di setiap lemparan',
      independence: 'Koin tidak punya ingatan, setiap lemparan independen',
      verdict: 'MEMENUHI 4 SYARAT (Distribusi Binomial Valid)',
      verdictColor: 'text-emerald-700 bg-emerald-50 border-emerald-300',
    },
    cards: {
      name: 'Mengambil 3 Kartu dari Tumpukan Tanpa Pengembalian (Without Replacement)',
      isBinomial: false,
      n: 'n = 3 kartu',
      outcomes: 'Kartu As (Sukses) atau Bukan As (Gagal)',
      pi: 'GAGAL: π berubah dari 4/52 menjadi 3/51 atau 4/51 setelah kartu diambil!',
      independence: 'GAGAL: Percobaan dependen karena kartu tidak dikembalikan ke tumpukan.',
      verdict: 'BUKAN BINOMIAL! Harus dianalisis dengan Distribusi Hipergeometrik',
      verdictColor: 'text-rose-700 bg-rose-50 border-rose-300',
    },
  };

  const currentScen = scenarios[selectedScenario];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="pb-3 border-b border-surface-container">
          <span className="text-xs font-bold text-black uppercase tracking-wide">
            4 Syarat Mutlak Eksperimen Binomial
          </span>
          <p className="text-xs text-black font-medium mt-1">
            Jika salah satu dari keempat syarat ini tidak terpenuhi, kita tidak boleh menggunakan rumus Binomial!
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {conditions.map((c) => (
            <div
              key={c.num}
              className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                  {c.num}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-black">
                  <RichText text={c.title} />
                </h4>
              </div>
              <p className="text-xs text-black font-medium leading-relaxed pl-8.5">
                <RichText text={c.desc} />
              </p>
            </div>
          ))}
        </div>

        {/* Interactive Scenario Tester */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Uji Coba Skenario Nyata:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedScenario('quiz')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedScenario === 'quiz'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-black hover:bg-surface-container-high'
                }`}
              >
                1. Kuis 5 Soal
              </button>
              <button
                type="button"
                onClick={() => setSelectedScenario('coin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedScenario === 'coin'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-black hover:bg-surface-container-high'
                }`}
              >
                2. Lemparan Koin 10x
              </button>
              <button
                type="button"
                onClick={() => setSelectedScenario('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedScenario === 'cards'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-black hover:bg-surface-container-high'
                }`}
              >
                3. Kartu Tanpa Pengembalian
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-low space-y-3">
            <div className="text-sm font-bold text-black">
              <RichText text={currentScen.name} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-black">
                <strong>Jumlah Percobaan (n):</strong> <RichText text={currentScen.n} />
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-black">
                <strong>2 Hasil Dikotomis:</strong> <RichText text={currentScen.outcomes} />
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-black">
                <strong>Peluang Sukses (π):</strong> <RichText text={currentScen.pi} />
              </div>
              <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-black">
                <strong>Independensi:</strong> <RichText text={currentScen.independence} />
              </div>
            </div>

            <div
              className={`p-3 rounded-lg border font-bold text-xs flex items-center gap-2 ${currentScen.verdictColor}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {currentScen.isBinomial ? 'check_circle' : 'warning'}
              </span>
              <span>
                <RichText text={currentScen.verdict} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. COMBINATION VISUAL (Kombinasi nCx & Kaidah Pencacahan)
// =========================================================================
export const CombinationVisual: React.FC = () => {
  const [n, setN] = useState<number>(5);
  const [x, setX] = useState<number>(2);

  const safeX = Math.min(x, n);
  const combResult = combination(n, safeX);

  const steps = [
    {
      title: 'Tentukan Nilai n (Total Objek) dan x (Banyak yang Dipilih)',
      description: 'Kombinasi menghitung banyak cara memilih x item dari n item tanpa memedulikan urutan.',
      formula: 'n = Ukuran Himpunan, x = Banyak Pilihan',
      substitution: `Diberikan n = ${n} item dan x = ${safeX} item yang dipilih`,
      result: `n = ${n}, x = ${safeX}`,
    },
    {
      title: 'Tuliskan Rumus Faktorial Kombinasi: nCx',
      description: 'Membagi faktorial total dengan hasil kali faktorial pilihan dan faktorial sisanya.',
      formula: 'nCx = n! / [x! · (n - x)!]',
      substitution: `${n}C${safeX} = ${n}! / [${safeX}! · (${n} - ${safeX})!] = ${n}! / [${safeX}! · ${n - safeX}!]`,
      result: `Faktorial: ${n}! = ${factorial(n)}, ${safeX}! = ${factorial(safeX)}, ${n - safeX}! = ${factorial(n - safeX)}`,
    },
    {
      title: 'Sederhanakan Pecahan dengan Pembatalan Faktor',
      description: 'Coret faktor yang sama di pembilang dan penyebut untuk mempercepat perhitungan.',
      formula: 'Penyederhanaan: coret (${n - safeX})!',
      substitution: `${n}C${safeX} = ${factorial(n)} / (${factorial(safeX)} × ${factorial(n - safeX)})`,
      result: `Hasil Akhir: ${n}C${safeX} = ${combResult} cara kombinasi`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Kalkulator Interaktif Kombinasi: nCx
            </span>
            <p className="text-xs text-black font-medium">
              Menghitung banyaknya susunan kelompok tanpa memerhatikan urutan (AB = BA).
            </p>
          </div>
          {/* Quick Presets from textbook */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-black mr-1">Contoh Kuis:</span>
            <button
              type="button"
              onClick={() => {
                setN(5);
                setX(0);
              }}
              className="px-2.5 py-1 rounded bg-surface-container text-xs font-bold text-black hover:bg-surface-container-high"
            >
              5C0 = 1
            </button>
            <button
              type="button"
              onClick={() => {
                setN(5);
                setX(2);
              }}
              className="px-2.5 py-1 rounded bg-surface-container text-xs font-bold text-black hover:bg-surface-container-high"
            >
              5C2 = 10
            </button>
            <button
              type="button"
              onClick={() => {
                setN(5);
                setX(3);
              }}
              className="px-2.5 py-1 rounded bg-surface-container text-xs font-bold text-black hover:bg-surface-container-high"
            >
              5C3 = 10
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Ukuran Total Percobaan / Objek (n):</span>
              <span className="text-primary font-mono text-sm">{n}</span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              value={n}
              onChange={(e) => {
                const val = Number(e.target.value);
                setN(val);
                if (x > val) setX(val);
              }}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-black font-medium">
              <span>n = 1</span>
              <span>n = 8</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Banyak Pilihan Sukses (x):</span>
              <span className="text-primary font-mono text-sm">{safeX}</span>
            </div>
            <input
              type="range"
              min={0}
              max={n}
              value={safeX}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-black font-medium">
              <span>x = 0</span>
              <span>x = {n}</span>
            </div>
          </div>
        </div>

        {/* Big Formula Calculation Box */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest border border-primary/40 flex flex-col items-center justify-center gap-4 text-center">
          <div className="text-xs font-bold text-black uppercase tracking-wider">
            Substitusi Rumus Kombinasi
          </div>
          <div className="flex items-center gap-3 text-sm sm:text-lg font-bold text-black font-mono">
            <span>
              {n}C{safeX} =
            </span>
            <div className="inline-flex flex-col items-center justify-center">
              <span className="border-b-2 border-black px-3 pb-0.5">{n}!</span>
              <span className="pt-0.5">
                {safeX}! · ({n} - {safeX})!
              </span>
            </div>
            <span>=</span>
            <div className="inline-flex flex-col items-center justify-center">
              <span className="border-b-2 border-black px-3 pb-0.5">{factorial(n)}</span>
              <span className="pt-0.5">
                {factorial(safeX)} × {factorial(n - safeX)}
              </span>
            </div>
            <span>=</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-primary px-3 py-1 bg-primary/10 rounded-xl">
              {combResult}
            </span>
          </div>

          {/* Visual representations of selected items */}
          <div className="w-full pt-3 border-t border-surface-container flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-black mr-2">Simulasi Objek ({n} item):</span>
            {Array.from({ length: n }).map((_, idx) => {
              const isChosen = idx < safeX;
              return (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                    isChosen
                      ? 'bg-primary text-on-primary ring-2 ring-primary/40 shadow-xs'
                      : 'bg-surface-container text-black border border-outline-variant/60'
                  }`}
                >
                  #{idx + 1}
                </div>
              );
            })}
            <span className="text-xs text-black font-medium ml-2">
              (Ada <strong>{combResult}</strong> kombinasi memilih {safeX} item dari {n} item)
            </span>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 4. BINOMIAL DISTRIBUTION VISUAL (P(X = x) & Kurva Binomial Interaktif)
// =========================================================================
export const BinomialDistributionVisual: React.FC = () => {
  const [selectedX, setSelectedX] = useState<number>(2);
  const [n, setN] = useState<number>(5);
  const [pi, setPi] = useState<number>(0.25);

  const safeX = Math.min(selectedX, n);

  // Compute distribution array
  const dist = Array.from({ length: n + 1 }).map((_, idx) => {
    const prob = calcBinomialProb(n, pi, idx);
    return {
      x: idx,
      p: prob,
      comb: combination(n, idx),
    };
  });

  // Calculate cumulative P(X >= 3) when n=5, pi=0.25 as textbook reference
  const pAtLeast3 = dist.filter((d) => d.x >= 3).reduce((sum, d) => sum + d.p, 0);
  const currentP = calcBinomialProb(n, pi, safeX);

  const steps = [
    {
      title: 'Tentukan Parameter Eksperimen (n, π, dan x)',
      description: 'Identifikasi banyak percobaan n, peluang sukses π di tiap percobaan, dan target x.',
      formula: 'n = 5 soal, π = 0.25 (1/4 opsi), x = 2 benar',
      substitution: `Peluang sukses π = ${pi.toFixed(2)}, peluang gagal (1 - π) = ${(1 - pi).toFixed(2)}`,
      result: `n = ${n}, π = ${pi.toFixed(2)}, 1 - π = ${(1 - pi).toFixed(2)}, x = ${safeX}`,
    },
    {
      title: 'Hitung Faktor Kombinasi: nCx',
      description: 'Berapa banyak kombinasi penempatan posisi x jawaban benar dari n soal.',
      formula: 'nCx = n! / [x!(n - x)!]',
      substitution: `${n}C${safeX} = ${n}! / [${safeX}! · ${n - safeX}!] = ${combination(n, safeX)} cara`,
      result: `Faktor Kombinasi = ${combination(n, safeX)}`,
    },
    {
      title: 'Hitung Peluang Rantai Sukses dan Gagal: π^x · (1 - π)^(n - x)',
      description: 'Peluang satu urutan tertentu terjadi sebelum dikalikan banyak kombinasinya.',
      formula: 'Peluang urutan = π^x · (1 - π)^(n - x)',
      substitution: `(${pi.toFixed(2)})^${safeX} × (${(1 - pi).toFixed(2)})^${n - safeX} = ${Math.pow(
        pi,
        safeX
      ).toFixed(6)} × ${Math.pow(1 - pi, n - safeX).toFixed(6)}`,
      result: `Peluang satu urutan = ${(
        Math.pow(pi, safeX) * Math.pow(1 - pi, n - safeX)
      ).toFixed(6)}`,
    },
    {
      title: 'Kalikan Seluruh Komponen: P(X = x) = nCx · π^x · (1 - π)^(n - x)',
      description: 'Gabungkan banyak kemungkinan urutan dengan probabilitas satu urutan.',
      formula: 'P(X = x) = nCx · π^x · (1 - π)^(n - x)',
      substitution: `P(X = ${safeX}) = ${combination(n, safeX)} × ${Math.pow(pi, safeX).toFixed(
        4
      )} × ${Math.pow(1 - pi, n - safeX).toFixed(4)}`,
      result: `P(X = ${safeX}) = ${currentP.toFixed(4)} (${(currentP * 100).toFixed(2)}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Distribusi Probabilitas Binomial: Kuis 5 Soal (Tebak Murni)
            </span>
            <p className="text-xs text-black font-medium">
              n = {n} soal kuis pilihan ganda (4 opsi A,B,C,D), peluang menebak benar per soal π = {pi.toFixed(2)}.
            </p>
          </div>
          {/* Quick toggle to standard textbook data */}
          <button
            type="button"
            onClick={() => {
              setN(5);
              setPi(0.25);
              setSelectedX(2);
            }}
            className="px-3 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-bold text-black"
          >
            Reset ke Data Buku (n=5, π=0.25)
          </button>
        </div>

        {/* Sliders for n and pi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Banyak Percobaan (n):</span>
              <span className="text-primary font-mono text-sm">{n}</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              value={n}
              onChange={(e) => {
                const val = Number(e.target.value);
                setN(val);
                if (selectedX > val) setSelectedX(val);
              }}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Peluang Sukses di Setiap Soal (π):</span>
              <span className="text-primary font-mono text-sm">{pi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.95}
              step={0.05}
              value={pi}
              onChange={(e) => setPi(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Distribution Bar Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>Probabilitas P(X = x) Sukses Terjadi</span>
            <span className="text-primary font-mono text-[11px]">
              Klik batang untuk menguji target x
            </span>
          </div>

          <div className="h-44 sm:h-52 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex items-end justify-around gap-2 pt-8">
            {dist.map((d) => {
              const isSelected = safeX === d.x;
              const maxP = Math.max(...dist.map((item) => item.p), 0.4);
              const heightPercent = (d.p / maxP) * 100;
              return (
                <button
                  key={d.x}
                  type="button"
                  onClick={() => setSelectedX(d.x)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold font-mono transition-colors ${
                      isSelected ? 'text-primary scale-110' : 'text-black'
                    }`}
                  >
                    {d.p < 0.0001 ? '<0.001' : d.p.toFixed(4)}
                  </span>
                  <div className="w-full max-w-[48px] h-32 sm:h-36 bg-surface-container rounded-t-lg relative flex items-end justify-center overflow-hidden">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        isSelected
                          ? 'bg-primary shadow-md'
                          : d.x >= 3 && n === 5
                          ? 'bg-amber-500/80 group-hover:bg-amber-500'
                          : 'bg-primary/40 group-hover:bg-primary/60'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold px-1.5 py-0.5 rounded transition-colors ${
                      isSelected ? 'bg-primary text-on-primary' : 'text-black bg-surface-container'
                    }`}
                  >
                    x={d.x}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Cards: Single P(X = x) vs Cumulative P(X >= 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-primary/40 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-black uppercase">
                Peluang Tepat {safeX} Soal Benar: P(X = {safeX})
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">
                {currentP.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-black font-medium leading-relaxed">
              Peluang mahasiswa yang menebak murni akan mendapat tepat {safeX} jawaban benar adalah{' '}
              <strong>{(currentP * 100).toFixed(2)}%</strong>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-amber-600/40 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-black uppercase">
                Peluang Lulus (X ≥ 3 Benar):
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                {pAtLeast3.toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-black font-medium leading-relaxed">
              P(X ≥ 3) = P(3) + P(4) + P(5) ≈ <strong>{(pAtLeast3 * 100).toFixed(2)}%</strong> (~10.35%).
              Hanya sekitar 1 dari 10 mahasiswa yang bisa lulus jika hanya mengandalkan keberuntungan tebak murni!
            </p>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 5. BINOMIAL MEAN & STANDARD DEVIATION VISUAL (μ = nπ, σ = √(nπ(1-π)))
// =========================================================================
export const BinomialMeanSdVisual: React.FC = () => {
  const [n, setN] = useState<number>(5);
  const [pi, setPi] = useState<number>(0.25);

  const mean = n * pi;
  const variance = n * pi * (1 - pi);
  const sd = Math.sqrt(variance);

  // Normal approximation rule of thumb: n*pi >= 5 and n*(1-pi) >= 5
  const rule1 = n * pi;
  const rule2 = n * (1 - pi);
  const isNormalApproximationValid = rule1 >= 5 && rule2 >= 5;

  const steps = [
    {
      title: 'Hitung Rata-rata / Mean Binomial: μ = nπ',
      description: 'Cukup kalikan banyak percobaan n dengan probabilitas sukses π di setiap percobaan.',
      formula: 'μ = n · π',
      substitution: `μ = ${n} × ${pi.toFixed(2)} = ${(n * pi).toFixed(4)}`,
      result: `Mean μ = ${mean.toFixed(2)} soal benar yang diharapkan`,
    },
    {
      title: 'Hitung Varians Binomial: σ² = nπ(1 - π)',
      description: 'Kalikan mean dengan probabilitas kegagalan (1 - π).',
      formula: 'σ² = n · π · (1 - π)',
      substitution: `σ² = ${n} × ${pi.toFixed(2)} × ${(1 - pi).toFixed(2)} = ${variance.toFixed(4)}`,
      result: `Varians σ² = ${variance.toFixed(4)}`,
    },
    {
      title: 'Hitung Standar Deviasi: σ = √[nπ(1 - π)]',
      description: 'Tarik akar kuadrat dari varians untuk mendapatkan sebaran deviasi dalam satuan aslinya.',
      formula: 'σ = √[n · π · (1 - π)]',
      substitution: `σ = √${variance.toFixed(4)} ≈ ${sd.toFixed(4)}`,
      result: `Standar Deviasi σ ≈ ${sd.toFixed(3)} soal`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Karakteristik Parameter Binomial: Nilai Tengah & Sebaran
            </span>
            <p className="text-xs text-black font-medium">
              Eksplorasi bagaimana ukuran sampel (n) dan peluang sukses (π) menentukan pusat (μ) dan rentang deviasi (σ).
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setN(5);
              setPi(0.25);
            }}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold text-black"
          >
            Reset (n=5, π=0.25)
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Banyak Percobaan (n):</span>
              <span className="text-primary font-mono text-sm">{n}</span>
            </div>
            <input
              type="range"
              min={5}
              max={50}
              step={1}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-black font-medium">
              <span>n = 5</span>
              <span>n = 50</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-black">
              <span>Peluang Sukses (π):</span>
              <span className="text-primary font-mono text-sm">{pi.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={0.9}
              step={0.05}
              value={pi}
              onChange={(e) => setPi(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-black font-medium">
              <span>π = 0.10</span>
              <span>π = 0.90</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Rata-rata: μ = nπ
            </span>
            <div className="text-2xl font-extrabold text-black font-mono">
              {mean.toFixed(2)}
            </div>
            <p className="text-xs text-black font-medium">
              {n} × {pi.toFixed(2)} = <strong>{mean.toFixed(2)}</strong> soal
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Varians: σ² = nπ(1 - π)
            </span>
            <div className="text-2xl font-extrabold text-black font-mono">
              {variance.toFixed(3)}
            </div>
            <p className="text-xs text-black font-medium">
              {mean.toFixed(2)} × {(1 - pi).toFixed(2)} = <strong>{variance.toFixed(3)}</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Standar Deviasi: σ = √σ²
            </span>
            <div className="text-2xl font-extrabold text-primary font-mono">
              {sd.toFixed(3)}
            </div>
            <p className="text-xs text-black font-medium">
              Simpangan sebaran ≈ <strong>±{sd.toFixed(2)}</strong> soal
            </p>
          </div>
        </div>

        {/* Visual Bell / Rule of Thumb indicator */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isNormalApproximationValid
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
              : 'bg-amber-50/70 border-amber-300 text-amber-900'
          }`}
        >
          <div className="space-y-1 text-xs">
            <div className="font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">
                {isNormalApproximationValid ? 'verified' : 'help'}
              </span>
              <span>
                Aturan Praktis Pendekatan Distribusi Normal (Rule of Thumb):
              </span>
            </div>
            <p className="font-medium text-[11px] leading-relaxed">
              nπ = {rule1.toFixed(1)} {rule1 >= 5 ? '≥ 5 (Memenuhi)' : '< 5 (Belum)'} dan n(1 - π) ={' '}
              {rule2.toFixed(1)} {rule2 >= 5 ? '≥ 5 (Memenuhi)' : '< 5 (Belum)'}.
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
              isNormalApproximationValid
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isNormalApproximationValid
              ? 'Dapat didekati Distribusi Normal (Simetris)'
              : 'Asimetris / Miring (Gunakan Binomial Eksak)'}
          </span>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 6. POISSON DISTRIBUTION VISUAL (P(X = x) = (λ^x * e^-λ) / x!)
// =========================================================================
export const PoissonDistributionVisual: React.FC = () => {
  const [lambda, setLambda] = useState<number>(3);
  const [selectedX, setSelectedX] = useState<number>(2);

  const mean = lambda;
  const sd = Math.sqrt(lambda);

  const maxX = 10;
  const dist = Array.from({ length: maxX + 1 }).map((_, idx) => ({
    x: idx,
    p: calcPoissonProb(lambda, idx),
  }));

  const currentP = calcPoissonProb(lambda, selectedX);
  const pAtLeast5 = dist.filter((d) => d.x >= 5).reduce((acc, curr) => acc + curr.p, 0);

  const steps = [
    {
      title: 'Tentukan Laju Rata-rata Kejadian (λ / Lambda)',
      description: 'Poisson hanya membutuhkan 1 parameter tunggal: rata-rata kemunculan event per rentang waktu/area.',
      formula: 'λ = Rata-rata Kejadian per Satuan Waktu/Ruang',
      substitution: `Pada studi kasus pengunjung website: λ = ${lambda} pengunjung per menit`,
      result: `λ = ${lambda}, e ≈ 2.71828 (konstanta Euler)`,
    },
    {
      title: 'Hitung Eksponensial Basis Euler: e^(-λ)',
      description: 'Faktor redaman probabilitas untuk intensitas λ yang diberikan.',
      formula: 'e^(-λ)',
      substitution: `e^(-${lambda}) ≈ ${(Math.exp(-lambda)).toFixed(6)}`,
      result: `e^(-${lambda}) ≈ ${(Math.exp(-lambda)).toFixed(4)}`,
    },
    {
      title: 'Hitung Pangkat dan Faktorial untuk x: λ^x dan x!',
      description: 'Pangkatkan rata-rata dengan nilai target x, lalu bagi dengan faktorial x.',
      formula: 'λ^x / x!',
      substitution: `${lambda}^${selectedX} / ${selectedX}! = ${Math.pow(lambda, selectedX)} / ${factorial(
        selectedX
      )} = ${(Math.pow(lambda, selectedX) / factorial(selectedX)).toFixed(4)}`,
      result: `Faktor pengali = ${(Math.pow(lambda, selectedX) / factorial(selectedX)).toFixed(4)}`,
    },
    {
      title: 'Hitung Peluang Akhir: P(X = x) = (λ^x · e^-λ) / x!',
      description: 'Kalikan faktor pembagi dengan e^(-λ).',
      formula: 'P(X = x) = (λ^x · e^-λ) / x!',
      substitution: `P(X = ${selectedX}) = [(${lambda}^${selectedX}) · e^(-${lambda})] / ${selectedX}! = [${Math.pow(
        lambda,
        selectedX
      )} × ${Math.exp(-lambda).toFixed(4)}] / ${factorial(selectedX)}`,
      result: `P(X = ${selectedX}) = ${currentP.toFixed(4)} (${(currentP * 100).toFixed(2)}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Studi Kasus: Jumlah Pengunjung Website per Menit (λ = 3)
            </span>
            <p className="text-xs text-black font-medium">
              Distribusi kejadian diskrit langka yang terjadi dalam rentang waktu kontinu yang tetap.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLambda(3);
              setSelectedX(2);
            }}
            className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-bold text-black"
          >
            Reset (λ = 3)
          </button>
        </div>

        {/* Lambda Slider */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-2">
          <div className="flex justify-between text-xs font-bold text-black">
            <span>Rata-rata Tingkat Kejadian (λ / Lambda):</span>
            <span className="text-primary font-mono text-sm">{lambda.toFixed(1)} per menit</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={7.0}
            step={0.5}
            value={lambda}
            onChange={(e) => setLambda(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-black font-medium">
            <span>λ = 0.5 (Sangat Jarang)</span>
            <span>λ = 3.0 (Standar Soal)</span>
            <span>λ = 7.0 (Padat)</span>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>Peluang Tepat x Pengunjung Tiba dalam 1 Menit: P(X = x)</span>
            <span className="text-primary font-mono text-[11px]">
              Klik batang untuk menguji nilai x
            </span>
          </div>

          <div className="h-44 sm:h-52 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/50 flex items-end justify-around gap-1 sm:gap-2 pt-8">
            {dist.map((d) => {
              const isSelected = selectedX === d.x;
              const maxP = Math.max(...dist.map((item) => item.p), 0.25);
              const heightPercent = (d.p / maxP) * 100;
              return (
                <button
                  key={d.x}
                  type="button"
                  onClick={() => setSelectedX(d.x)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer focus:outline-none"
                >
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold font-mono transition-colors ${
                      isSelected ? 'text-primary scale-110' : 'text-black'
                    }`}
                  >
                    {d.p < 0.0001 ? '0' : d.p.toFixed(3)}
                  </span>
                  <div className="w-full max-w-[40px] h-32 sm:h-36 bg-surface-container rounded-t-lg relative flex items-end justify-center overflow-hidden">
                    <div
                      className={`w-full transition-all duration-300 rounded-t-lg ${
                        isSelected
                          ? 'bg-primary shadow-md'
                          : d.x >= 5 && lambda === 3
                          ? 'bg-amber-500/80 group-hover:bg-amber-500'
                          : 'bg-primary/40 group-hover:bg-primary/60'
                      }`}
                      style={{ height: `${Math.max(3, heightPercent)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-1 py-0.5 rounded transition-colors ${
                      isSelected ? 'bg-primary text-on-primary' : 'text-black bg-surface-container'
                    }`}
                  >
                    {d.x}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              Mean = Varians = λ
            </span>
            <div className="text-xl font-extrabold text-black font-mono">
              μ = σ² = {lambda.toFixed(1)}
            </div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Ciri khas utama Poisson: rata-rata dan variansnya identik sama dengan λ!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-primary/40 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              P(X = {selectedX}) Tepat
            </span>
            <div className="text-xl font-extrabold text-primary font-mono">
              {currentP.toFixed(4)}
            </div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Peluang tepat {selectedX} pengunjung tiba dalam semenit adalah {(currentP * 100).toFixed(2)}%.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-amber-500/40 space-y-1">
            <span className="text-[11px] font-bold text-black uppercase tracking-wider">
              P(X ≥ 5) Pengunjung Padat
            </span>
            <div className="text-xl font-extrabold text-amber-700 font-mono">
              {pAtLeast5.toFixed(4)}
            </div>
            <p className="text-[11px] text-black font-medium leading-tight">
              Peluang lonjakan ≥ 5 pengunjung per menit sekitar {(pAtLeast5 * 100).toFixed(1)}%.
            </p>
          </div>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 7. POISSON AREA OF OPPORTUNITY VISUAL (Rentang Kesempatan & Skala λ)
// =========================================================================
export const PoissonAreaVisual: React.FC = () => {
  const [selectedSecIndex, setSelectedSecIndex] = useState<number>(0);

  const activeWindow = poissonAreaWindows[selectedSecIndex];

  const steps = [
    {
      title: 'Identifikasi Laju Acuan per Satuan Standar (Base λ)',
      description: 'Ketahui berapa rata-rata kedatangan per 1 satuan waktu acuan (1 menit = 60 detik).',
      formula: 'λ_dasar = 3 pengunjung / 60 detik',
      substitution: `Laju dasar: 3 pengunjung per menit (0.05 pengunjung per detik)`,
      result: `λ_dasar = 3`,
    },
    {
      title: 'Skalakan Parameter λ Sesuai Rentang Kesempatan Baru',
      description: 'Kalikan laju dasar dengan rasio rentang waktu yang sedang diamati.',
      formula: 'λ_baru = λ_dasar · (Rentang Baru / 60 detik)',
      substitution: `λ_baru = 3 × (${activeWindow.seconds} / 60) = ${activeWindow.lambda}`,
      result: `λ_baru = ${activeWindow.lambda}`,
    },
    {
      title: 'Hitung Peluang Komplementer: P(X ≥ 2) = 1 - P(0) - P(1)',
      description: 'Menghitung kemungkinan kedatangan 2 atau lebih pengunjung dengan mengurangkan peluang 0 dan 1 dari total 1.',
      formula: 'P(X ≥ 2) = 1 - [P(X = 0) + P(X = 1)]',
      substitution: `1 - [${activeWindow.p0.toFixed(4)} + ${activeWindow.p1.toFixed(4)}] = 1 - ${(
        activeWindow.p0 + activeWindow.p1
      ).toFixed(4)}`,
      result: `P(X ≥ 2) = ${activeWindow.pAtLeast2.toFixed(4)} (${(
        activeWindow.pAtLeast2 * 100
      ).toFixed(2)}%)`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Konsep: Area of Opportunity (Rentang Kesempatan Kejadian)
            </span>
            <p className="text-xs text-black font-medium">
              Bila rentang waktu dipersempit atau diperlebar, nilai λ menyesuaikan secara proporsional.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            Base: λ = 3 / menit
          </span>
        </div>

        {/* 3 Interval Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {poissonAreaWindows.map((win, idx) => {
            const isSelected = selectedSecIndex === idx;
            return (
              <button
                key={win.seconds}
                type="button"
                onClick={() => setSelectedSecIndex(idx)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary/10 border-primary shadow-xs ring-2 ring-primary/30'
                    : 'bg-surface-container-lowest border-outline-variant/60 hover:border-primary/40'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-black">{win.label}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-black'
                    }`}
                  >
                    λ = {win.lambda}
                  </span>
                </div>
                <div className="text-lg font-extrabold text-black font-mono">
                  {(win.pAtLeast2 * 100).toFixed(2)}%
                </div>
                <div className="text-[11px] text-black font-medium mt-1">
                  Peluang ≥ 2 pengunjung: {win.pAtLeast2.toFixed(4)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Visual Timeline Bar Demonstrating Density */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>Visualisasi Lebar Jendela Waktu & Kepadatan Kejadian:</span>
            <span className="text-primary font-mono">{activeWindow.label}</span>
          </div>

          {/* Timeline visualization */}
          <div className="relative h-12 bg-surface-container rounded-xl overflow-hidden flex items-center p-2">
            <div
              className="h-full bg-primary/30 border-2 border-primary rounded-lg transition-all duration-500 flex items-center justify-center relative overflow-hidden"
              style={{
                width: `${Math.max(6, (activeWindow.seconds / 60) * 100)}%`,
              }}
            >
              <span className="text-[10px] font-bold text-primary truncate px-1">
                {activeWindow.label}
              </span>
            </div>
            {/* Dots representing arrivals */}
            {activeWindow.seconds === 60 && (
              <div className="absolute inset-0 flex items-center justify-around px-8 pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-primary" title="Pengunjung 1" />
                <span className="w-3 h-3 rounded-full bg-primary" title="Pengunjung 2" />
                <span className="w-3 h-3 rounded-full bg-primary" title="Pengunjung 3" />
              </div>
            )}
            {activeWindow.seconds === 10 && (
              <div className="absolute left-4 flex items-center gap-4 pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
              </div>
            )}
          </div>

          <p className="text-xs text-black font-medium leading-relaxed">
            {activeWindow.description}
          </p>
        </div>
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// 8. HYPERGEOMETRIC VISUAL (Sampling Tanpa Pengembalian / N=10, A=3, n=2)
// =========================================================================
export const HypergeometricVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tree' | 'distribution'>('tree');
  const [firstDrawDefective, setFirstDrawDefective] = useState<boolean>(true);

  const data = ledHypergeometricData;

  const steps = [
    {
      title: 'Pahami Struktur Populasi Terbatas (N, A, n)',
      description: 'Populasi berukuran kecil N = 10 lampu LED, dengan A = 3 lampu rusak dan 7 lampu baik. Diambil sampel n = 2 tanpa pengembalian.',
      formula: 'N = 10, A = 3 rusak, (N - A) = 7 baik, n = 2',
      substitution: `Total kemungkinan memilih 2 dari 10 lampu: 10C2 = 45 kombinasi sampel`,
      result: `NCn = 10C2 = 45 cara`,
    },
    {
      title: 'Hitung Peluang Tarikan Pertama (Draw 1)',
      description: 'Peluang mengambil lampu rusak pertama kali adalah proporsi awal di populasi.',
      formula: 'P(Rusak ke-1) = A / N',
      substitution: `P(Rusak) = 3 / 10 = 0.30 (30%)`,
      result: `P(Rusak) = 0.30; P(Baik) = 7 / 10 = 0.70`,
    },
    {
      title: 'Perhatikan Efek Tanpa Pengembalian pada Tarikan Kedua (Draw 2)',
      description: 'Karena lampu pertama tidak dikembalikan, ukuran populasi berkurang menjadi 9, mengubah peluang tarikan kedua (dependen!).',
      formula: 'P(Rusak ke-2 | Kondisi ke-1)',
      substitution: firstDrawDefective
        ? `Jika tarikan 1 rusak: sisa 2 rusak dari 9 lampu → P = 2/9 ≈ 0.2222`
        : `Jika tarikan 1 baik: sisa 3 rusak dari 9 lampu → P = 3/9 ≈ 0.3333`,
      result: firstDrawDefective ? `2/9 ≈ 0.222 (22.2%)` : `3/9 ≈ 0.333 (33.3%)`,
    },
    {
      title: 'Hitung Distribusi Hipergeometrik Lengkap: P(X = x)',
      description: 'Rumus kombinasi untuk x item rusak: P(X = x) = [ ACx · (N - A)C(n - x) ] / [ NCn ]',
      formula: 'P(X = x) = [ ACx · (N - A)C(n - x) ] / NCn',
      substitution: `Untuk x = 1 rusak: [ 3C1 · 7C1 ] / 10C2 = [ 3 × 7 ] / 45 = 21 / 45`,
      result: `P(X = 0) = 21/45 ≈ 0.4667, P(X = 1) = 21/45 ≈ 0.4667, P(X = 2) = 3/45 ≈ 0.0667`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
          <div className="space-y-1">
            <span className="text-xs font-bold text-black uppercase tracking-wide">
              Studi Kasus: Pengujian 10 Lampu LED Tanpa Pengembalian
            </span>
            <p className="text-xs text-black font-medium">
              Populasi N = 10 lampu (3 rusak [merah], 7 normal [hijau]). Diambil sampel uji n = 2 tanpa dikembalikan.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('tree')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tree'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              1. Pohon Dependen (Tarikan 1 & 2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('distribution')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'distribution'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container text-black hover:bg-surface-container-high'
              }`}
            >
              2. Tabel Distribusi P(X = x)
            </button>
          </div>
        </div>

        {/* 10 Items Visual Population */}
        <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-black">
            <span>Populasi Awal (N = 10):</span>
            <span className="text-[11px] font-mono">
              <span className="text-rose-600 font-bold">3 Rusak</span> •{' '}
              <span className="text-emerald-700 font-bold">7 Baik</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`def-${i}`}
                className="px-3 py-1.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 font-bold text-xs flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Rusak #{i + 1}</span>
              </div>
            ))}
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={`good-${i}`}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center gap-1.5"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Normal #{i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tab 1: Tree / Sequential Draw Simulator */}
        {activeTab === 'tree' && (
          <div className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                Simulasi Kondisi Tarikan Pertama:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFirstDrawDefective(true)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    firstDrawDefective
                      ? 'bg-rose-600 text-white'
                      : 'bg-surface-container text-black'
                  }`}
                >
                  Jika Tarikan 1: RUSAK (3/10)
                </button>
                <button
                  type="button"
                  onClick={() => setFirstDrawDefective(false)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    !firstDrawDefective
                      ? 'bg-emerald-700 text-white'
                      : 'bg-surface-container text-black'
                  }`}
                >
                  Jika Tarikan 1: NORMAL (7/10)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
                <span className="text-[11px] font-bold text-black uppercase">
                  Tarikan Pertama (N = 10 tersisa)
                </span>
                <div className="text-sm font-bold text-black">
                  {firstDrawDefective ? 'Terambil Lampu Rusak' : 'Terambil Lampu Normal'}
                </div>
                <div className="text-xs text-black font-medium">
                  Peluang tarikan 1: <strong>{firstDrawDefective ? '3/10 (0.30)' : '7/10 (0.70)'}</strong>.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-low border border-primary/40 space-y-2">
                <span className="text-[11px] font-bold text-primary uppercase">
                  Tarikan Kedua (N = 9 tersisa, Tanpa Pengembalian!)
                </span>
                <div className="text-sm font-bold text-black">
                  Peluang Lampu Rusak pada Tarikan Kedua:
                </div>
                <div className="text-lg font-mono font-extrabold text-primary">
                  {firstDrawDefective ? '2 / 9 ≈ 0.222 (22.2%)' : '3 / 9 ≈ 0.333 (33.3%)'}
                </div>
                <p className="text-[11px] text-black font-medium leading-relaxed">
                  {firstDrawDefective
                    ? 'Karena 1 lampu rusak sudah terambil, sisa lampu rusak di kotak tinggal 2 dari total 9 lampu.'
                    : 'Karena 1 lampu normal yang terambil, sisa lampu rusak di kotak tetap 3 dari total 9 lampu.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Full Hypergeometric Distribution */}
        {activeTab === 'distribution' && (
          <div className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-4">
            <span className="text-xs font-bold text-black uppercase tracking-wider block">
              Distribusi Probabilitas Lengkap untuk Sampel n = 2:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.distribution.map((d) => (
                <div
                  key={d.x}
                  className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-black">X = {d.x} Rusak</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary text-on-primary">
                      {d.pFraction}
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-black font-mono">
                    {(d.p * 100).toFixed(2)}%
                  </div>
                  <p className="text-[11px] text-black font-medium leading-tight">{d.label}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-low text-xs text-black font-medium leading-relaxed">
              <strong>Rumus Hipergeometrik:</strong> P(X = x) = [ 3Cx · 7C(2 - x) ] / 10C2.
              Total peluang: 21/45 + 21/45 + 3/45 = 45/45 = <strong>1.00 (100%)</strong>.
            </div>
          </div>
        )}
      </div>

      <CalculationStepper steps={steps} />
    </div>
  );
};

// =========================================================================
// MAIN ROUTER COMPONENT
// =========================================================================
export const DiscreteProbabilityVisuals: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'discrete-distribution':
      return <DiscreteDistributionVisual />;
    case 'binomial-conditions':
      return <BinomialConditionsVisual />;
    case 'combination':
      return <CombinationVisual />;
    case 'binomial-distribution':
      return <BinomialDistributionVisual />;
    case 'binomial-mean-sd':
      return <BinomialMeanSdVisual />;
    case 'poisson-distribution':
      return <PoissonDistributionVisual />;
    case 'poisson-area':
      return <PoissonAreaVisual />;
    case 'hypergeometric':
      return <HypergeometricVisual />;
    default:
      return null;
  }
};
