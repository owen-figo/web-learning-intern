import React, { useState } from 'react';

interface ConceptExplainerProps {
  type:
    | 'jenis-variabel'
    | 'skala-pengukuran'
    | 'populasi-sampel'
    | 'metode-sampling'
    | 'jenis-error-sampling';
}

export const ConceptExplainer: React.FC<ConceptExplainerProps> = ({ type }) => {
  return (
    <div className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs">
      {type === 'jenis-variabel' && <JenisVariabelVisual />}
      {type === 'skala-pengukuran' && <SkalaPengukuranVisual />}
      {type === 'populasi-sampel' && <PopulasiSampelVisual />}
      {type === 'metode-sampling' && <MetodeSamplingVisual />}
      {type === 'jenis-error-sampling' && <JenisErrorSamplingVisual />}
    </div>
  );
};

// ==========================================
// 1. JENIS VARIABEL VISUAL
// ==========================================
interface VariableChip {
  id: string;
  name: string;
  correctBucket: 'categorical' | 'discrete' | 'continuous';
  reason: string;
}

const initialVariableChips: VariableChip[] = [
  {
    id: 'jurusan',
    name: 'Jurusan Kuliah',
    correctBucket: 'categorical',
    reason: 'Jurusan adalah label/kelompok non-angka (Categorical / Qualitative).',
  },
  {
    id: 'ipk',
    name: 'Nilai IPK Mahasiswa',
    correctBucket: 'continuous',
    reason: 'IPK diukur pada skala kontinu berdesimal seperti 3.75 (Numerical - Continuous).',
  },
  {
    id: 'jumlah-produk',
    name: 'Jumlah Produk Terjual',
    correctBucket: 'discrete',
    reason: 'Jumlah unit dihitung dengan mencacah bilangan bulat utuh (Numerical - Discrete).',
  },
  {
    id: 'waktu-tunggu',
    name: 'Waktu Tunggu Pesanan',
    correctBucket: 'continuous',
    reason: 'Waktu diperoleh dari pengukuran stopwatch dengan desimal (Numerical - Continuous).',
  },
  {
    id: 'jenis-kelamin',
    name: 'Jenis Kelamin Responden',
    correctBucket: 'categorical',
    reason: 'Jenis kelamin berupa kategori/label identitas (Categorical / Qualitative).',
  },
];

const JenisVariabelVisual: React.FC = () => {
  const [selectedChipId, setSelectedChipId] = useState<string | null>('jurusan');
  const [assignments, setAssignments] = useState<
    Record<string, 'categorical' | 'discrete' | 'continuous'>
  >({});
  const [feedback, setFeedback] = useState<{ chipId: string; isCorrect: boolean; message: string } | null>(
    null
  );

  const selectedChip = initialVariableChips.find((c) => c.id === selectedChipId);

  const handlePlaceInBucket = (bucket: 'categorical' | 'discrete' | 'continuous') => {
    if (!selectedChip) return;

    const isCorrect = selectedChip.correctBucket === bucket;
    setAssignments((prev) => ({
      ...prev,
      [selectedChip.id]: bucket,
    }));

    if (isCorrect) {
      setFeedback({
        chipId: selectedChip.id,
        isCorrect: true,
        message: `Benar! ${selectedChip.reason}`,
      });
      // Move to next unassigned chip
      const nextUnassigned = initialVariableChips.find(
        (c) => c.id !== selectedChip.id && !assignments[c.id]
      );
      if (nextUnassigned) {
        setSelectedChipId(nextUnassigned.id);
      }
    } else {
      setFeedback({
        chipId: selectedChip.id,
        isCorrect: false,
        message: `Coba pikirkan lagi: apakah ini kategori teks, hitungan cacah (bilangan bulat), atau hasil ukur berdesimal?`,
      });
    }
  };

  const handleReset = () => {
    setAssignments({});
    setSelectedChipId(initialVariableChips[0].id);
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">touch_app</span>
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">
              Eksplorasi Interaktif: Pilah Jenis Variabel
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Ketuk kartu variabel di bawah, lalu pilih keranjang yang tepat.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          Reset
        </button>
      </div>

      {/* Chips Selection Bar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {initialVariableChips.map((chip) => {
          const isSelected = selectedChipId === chip.id;
          const assigned = assignments[chip.id];
          const isCorrect = assigned && assigned === chip.correctBucket;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setSelectedChipId(chip.id);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-1 bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              } ${isCorrect ? 'border border-primary/50 text-primary' : 'border border-outline-variant/40'}`}
            >
              {isCorrect && (
                <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
              )}
              <span>{chip.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Indicator */}
      {selectedChip && (
        <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface flex items-center justify-between">
          <span>
            Variabel aktif:{' '}
            <strong className="text-primary font-bold">{selectedChip.name}</strong>
          </span>
          <span className="text-[11px] text-on-surface-variant">
            Pilih keranjang di bawah 👇
          </span>
        </div>
      )}

      {/* Three Target Buckets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Bucket 1: Categorical */}
        <button
          type="button"
          onClick={() => handlePlaceInBucket('categorical')}
          className="text-left p-3.5 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
              Categorical (Kualitatif)
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">
              label
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            Data berupa label, teks, atau kategori non-angka.
          </p>
          <div className="pt-1 flex flex-wrap gap-1">
            {initialVariableChips
              .filter((c) => assignments[c.id] === 'categorical')
              .map((c) => (
                <span
                  key={c.id}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    c.correctBucket === 'categorical'
                      ? 'bg-primary-fixed/60 text-primary'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.name}
                </span>
              ))}
          </div>
        </button>

        {/* Bucket 2: Discrete */}
        <button
          type="button"
          onClick={() => handlePlaceInBucket('discrete')}
          className="text-left p-3.5 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
              Numerical - Discrete
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">
              pin
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            Hasil menghitung (mencacah), bilangan bulat utuh.
          </p>
          <div className="pt-1 flex flex-wrap gap-1">
            {initialVariableChips
              .filter((c) => assignments[c.id] === 'discrete')
              .map((c) => (
                <span
                  key={c.id}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    c.correctBucket === 'discrete'
                      ? 'bg-primary-fixed/60 text-primary'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.name}
                </span>
              ))}
          </div>
        </button>

        {/* Bucket 3: Continuous */}
        <button
          type="button"
          onClick={() => handlePlaceInBucket('continuous')}
          className="text-left p-3.5 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
              Numerical - Continuous
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">
              straighten
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-tight">
            Hasil mengukur, berada dalam rentang desimal.
          </p>
          <div className="pt-1 flex flex-wrap gap-1">
            {initialVariableChips
              .filter((c) => assignments[c.id] === 'continuous')
              .map((c) => (
                <span
                  key={c.id}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    c.correctBucket === 'continuous'
                      ? 'bg-primary-fixed/60 text-primary'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {c.name}
                </span>
              ))}
          </div>
        </button>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            feedback.isCorrect
              ? 'bg-primary-fixed/40 text-primary border border-primary/30'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
            {feedback.isCorrect ? 'check_circle' : 'info'}
          </span>
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. SKALA PENGUKURAN VISUAL
// ==========================================
interface ScaleChip {
  id: string;
  name: string;
  correctScale: 'nominal' | 'ordinal' | 'interval' | 'ratio';
  reason: string;
}

const initialScaleChips: ScaleChip[] = [
  {
    id: 'jenis-kelamin',
    name: 'Jenis Kelamin',
    correctScale: 'nominal',
    reason: 'Nominal: label kategori murni tanpa tingkatan atau urutan.',
  },
  {
    id: 'tingkat-kepuasan',
    name: 'Tingkat Kepuasan (Rendah/Sedang/Tinggi)',
    correctScale: 'ordinal',
    reason: 'Ordinal: kategori yang memiliki urutan peringkat bermakna.',
  },
  {
    id: 'suhu-celsius',
    name: 'Suhu Udara Celsius (0°C)',
    correctScale: 'interval',
    reason: 'Interval: ada selisih pasti, tetapi angka 0 bukan ketiadaan suhu (tidak ada true zero).',
  },
  {
    id: 'pendapatan-bulanan',
    name: 'Pendapatan Bulanan (Rp)',
    correctScale: 'ratio',
    reason: 'Ratio: memiliki nilai nol mutlak (Rp 0 = ketiadaan uang) dan rasio kelipatan berlaku.',
  },
];

const SkalaPengukuranVisual: React.FC = () => {
  const [selectedChipId, setSelectedChipId] = useState<string | null>('jenis-kelamin');
  const [assignments, setAssignments] = useState<
    Record<string, 'nominal' | 'ordinal' | 'interval' | 'ratio'>
  >({});
  const [feedback, setFeedback] = useState<{ chipId: string; isCorrect: boolean; message: string } | null>(
    null
  );

  const selectedChip = initialScaleChips.find((c) => c.id === selectedChipId);

  const handlePlaceInScale = (scale: 'nominal' | 'ordinal' | 'interval' | 'ratio') => {
    if (!selectedChip) return;

    const isCorrect = selectedChip.correctScale === scale;
    setAssignments((prev) => ({
      ...prev,
      [selectedChip.id]: scale,
    }));

    if (isCorrect) {
      setFeedback({
        chipId: selectedChip.id,
        isCorrect: true,
        message: `Tepat sekali! ${selectedChip.reason}`,
      });
      const nextUnassigned = initialScaleChips.find(
        (c) => c.id !== selectedChip.id && !assignments[c.id]
      );
      if (nextUnassigned) {
        setSelectedChipId(nextUnassigned.id);
      }
    } else {
      setFeedback({
        chipId: selectedChip.id,
        isCorrect: false,
        message: `Petunjuk: Ingat urutan NOIR (Nominal = label, Ordinal = ranking, Interval = tanpa true zero, Ratio = true zero mutlak).`,
      });
    }
  };

  const handleReset = () => {
    setAssignments({});
    setSelectedChipId(initialScaleChips[0].id);
    setFeedback(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">sort</span>
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">
              Eksplorasi Interaktif: Urutkan Tingkat Skala (NOIR)
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Ketuk contoh data, lalu tempatkan ke skala pengukuran yang sesuai.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <span className="material-symbols-outlined text-[14px]">refresh</span>
          Reset
        </button>
      </div>

      {/* Chips Selection */}
      <div className="flex flex-wrap gap-2 pt-1">
        {initialScaleChips.map((chip) => {
          const isSelected = selectedChipId === chip.id;
          const assigned = assignments[chip.id];
          const isCorrect = assigned && assigned === chip.correctScale;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => {
                setSelectedChipId(chip.id);
                setFeedback(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-1 bg-surface-container-high text-on-surface'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              } ${isCorrect ? 'border border-primary/50 text-primary' : 'border border-outline-variant/40'}`}
            >
              {isCorrect && (
                <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
              )}
              <span>{chip.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Indicator */}
      {selectedChip && (
        <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface flex items-center justify-between">
          <span>
            Data aktif: <strong className="text-primary font-bold">{selectedChip.name}</strong>
          </span>
          <span className="text-[11px] text-on-surface-variant">Pilih skala NOIR di bawah 👇</span>
        </div>
      )}

      {/* Four Target Buckets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { key: 'nominal' as const, label: '1. Nominal', desc: 'Label/kategori tanpa urutan' },
          { key: 'ordinal' as const, label: '2. Ordinal', desc: 'Ada urutan/ranking terarah' },
          { key: 'interval' as const, label: '3. Interval', desc: 'Ada selisih, tanpa true zero' },
          { key: 'ratio' as const, label: '4. Ratio', desc: 'Ada true zero (nol mutlak)' },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => handlePlaceInScale(item.key)}
            className="text-left p-3 rounded-xl border-2 border-dashed border-outline-variant hover:border-primary hover:bg-primary/5 transition-all space-y-1.5 group flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                {item.label}
              </div>
              <p className="text-[10px] text-on-surface-variant leading-tight">{item.desc}</p>
            </div>
            <div className="pt-2 flex flex-wrap gap-1">
              {initialScaleChips
                .filter((c) => assignments[c.id] === item.key)
                .map((c) => (
                  <span
                    key={c.id}
                    className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                      c.correctScale === item.key
                        ? 'bg-primary-fixed/60 text-primary'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {c.name.split(' ')[0]}
                  </span>
                ))}
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
            feedback.isCorrect
              ? 'bg-primary-fixed/40 text-primary border border-primary/30'
              : 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40'
          }`}
        >
          <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">
            {feedback.isCorrect ? 'check_circle' : 'info'}
          </span>
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. POPULASI DAN SAMPEL VISUAL
// ==========================================
// Fixed set of 60 population values with a known mean
const POPULATION_SIZE = 60;
const populationValues = [
  3.2, 3.8, 3.5, 3.9, 2.8, 3.1, 3.7, 3.6, 3.4, 3.9, 3.3, 3.5, 3.2, 3.7, 3.8, 2.9, 3.6, 3.4, 3.5,
  3.8, 3.3, 3.7, 3.6, 3.2, 3.9, 3.1, 3.5, 3.4, 3.7, 3.8, 3.0, 3.6, 3.5, 3.9, 3.3, 3.4, 3.7, 3.2,
  3.8, 3.6, 3.1, 3.5, 3.9, 3.4, 3.7, 3.3, 3.6, 3.8, 3.2, 3.5, 3.7, 3.4, 3.9, 3.1, 3.6, 3.8, 3.5,
  3.3, 3.7, 3.4,
];
const POPULATION_PARAM = (
  populationValues.reduce((a, b) => a + b, 0) / POPULATION_SIZE
).toFixed(2); // ~3.53

const PopulasiSampelVisual: React.FC = () => {
  const [sampleIndices, setSampleIndices] = useState<number[]>([
    4, 12, 19, 27, 33, 41, 48, 52, 55, 59,
  ]);
  const [drawCount, setDrawCount] = useState<number>(1);

  const drawRandomSample = () => {
    const indices: number[] = [];
    while (indices.length < 10) {
      const rand = Math.floor(Math.random() * POPULATION_SIZE);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setSampleIndices(indices);
    setDrawCount((prev) => prev + 1);
  };

  const sampleValues = sampleIndices.map((i) => populationValues[i]);
  const sampleStatistic = (
    sampleValues.reduce((a, b) => a + b, 0) / sampleValues.length
  ).toFixed(2);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">scatter_plot</span>
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">
              Simulasi Interaktif: Populasi vs Sampel
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Ambil sampel acak 10 responden dari populasi 60 mahasiswa untuk melihat fluktuasi statistik.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={drawRandomSample}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs transition-colors shrink-0 active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">casino</span>
          <span>Ambil Sampel Baru (Tarikan #{drawCount})</span>
        </button>
      </div>

      {/* Comparison Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold">Populasi (N = 60)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-bold uppercase">
              Tetap
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-on-surface flex items-baseline gap-1.5">
            <span>μ = {POPULATION_PARAM}</span>
            <span className="text-[11px] font-normal text-on-surface-variant">IPK Rata-rata</span>
          </div>
          <p className="text-[11px] text-primary font-semibold">
            Parameter (Nilai Sebenarnya dari Populasi)
          </p>
        </div>

        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span className="font-semibold text-primary">Sampel (n = 10)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold uppercase">
              Berfluktuasi
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-primary flex items-baseline gap-1.5">
            <span>x̄ = {sampleStatistic}</span>
            <span className="text-[11px] font-normal text-on-surface-variant">IPK Rata-rata</span>
          </div>
          <p className="text-[11px] text-primary font-semibold">
            Statistic (Perkiraan dari 10 Responden Terpilih)
          </p>
        </div>
      </div>

      {/* Population Grid of 60 Dots */}
      <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant pb-1">
          <span>Grid Populasi (Titik hijau menandai 10 sampel yang terpilih saat ini):</span>
          <span>Selisih estimasi: {Math.abs(Number(sampleStatistic) - Number(POPULATION_PARAM)).toFixed(2)}</span>
        </div>
        <div className="grid grid-cols-10 sm:grid-cols-12 gap-2 sm:gap-2.5 justify-items-center py-2">
          {populationValues.map((val, idx) => {
            const isSample = sampleIndices.includes(idx);
            return (
              <div
                key={idx}
                title={`Responden #${idx + 1} • IPK: ${val}`}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  isSample
                    ? 'bg-primary text-on-primary scale-125 ring-2 ring-primary ring-offset-2 shadow-xs z-10'
                    : 'bg-surface-container-high text-on-surface-variant/70 opacity-60'
                }`}
              >
                {isSample ? '✓' : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Observation Callout */}
      <div className="p-3 rounded-xl bg-surface-container-low text-xs text-on-surface-variant flex items-start gap-2 border-l-3 border-primary">
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
          lightbulb
        </span>
        <span className="leading-relaxed">
          <strong>Perhatikan:</strong> Parameter populasi (μ = {POPULATION_PARAM}) selalu bernilai tetap, sementara nilai Statistic sampel (x̄) sedikit bergeser setiap kali kamu menekan tombol &ldquo;Ambil Sampel Baru&rdquo;. Fluktuasi inilah yang nantinya kita pelajari sebagai <em>Sampling Error</em>.
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 4. METODE SAMPLING VISUAL
// ==========================================
const MetodeSamplingVisual: React.FC = () => {
  const [method, setMethod] = useState<'probability' | 'nonprobability'>('probability');

  // 48 dots grid (6 rows x 8 cols)
  // probability picks random scattered
  const probabilityIndices = [2, 9, 14, 21, 26, 33, 38, 45];
  // nonprobability picks only top-left corner (convenience sampling)
  const nonprobabilityIndices = [0, 1, 2, 8, 9, 10, 16, 17];

  const activeIndices = method === 'probability' ? probabilityIndices : nonprobabilityIndices;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
            <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          </span>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-on-surface">
              Perbandingan: Probability vs Nonprobability Sampling
            </h4>
            <p className="text-[11px] text-on-surface-variant">
              Bandingkan bagaimana objek populasi ditarik untuk mewakili keseluruhan.
            </p>
          </div>
        </div>

        {/* Toggle Buttons */}
        <div className="inline-flex rounded-xl bg-surface-container p-1 border border-outline-variant/40 shrink-0">
          <button
            type="button"
            onClick={() => setMethod('probability')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              method === 'probability'
                ? 'bg-primary text-on-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Probability Sample
          </button>
          <button
            type="button"
            onClick={() => setMethod('nonprobability')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              method === 'nonprobability'
                ? 'bg-primary text-on-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Nonprobability Sample
          </button>
        </div>
      </div>

      {/* Visualization Grid */}
      <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-on-surface">
            Pola Penyebaran Sampel Terpilih:
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {method === 'probability'
              ? 'Tersebar merata di seluruh populasi (Peluang diketahui)'
              : 'Terkumpul hanya di pojok yang mudah dijangkau (Convenience)'}
          </span>
        </div>

        <div className="grid grid-cols-8 gap-2.5 sm:gap-3 justify-items-center py-2 max-w-md mx-auto">
          {Array.from({ length: 48 }).map((_, idx) => {
            const isPicked = activeIndices.includes(idx);
            return (
              <div
                key={idx}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  isPicked
                    ? method === 'probability'
                      ? 'bg-primary text-on-primary scale-110 shadow-xs ring-2 ring-primary ring-offset-1'
                      : 'bg-amber-600 text-white scale-110 shadow-xs ring-2 ring-amber-600 ring-offset-1'
                    : 'bg-surface-container text-on-surface-variant/50 opacity-40'
                }`}
              >
                {isPicked ? '✓' : idx + 1}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory Conclusion Box */}
      <div
        className={`p-3.5 rounded-xl text-xs space-y-1.5 border ${
          method === 'probability'
            ? 'bg-primary/5 border-primary/20 text-on-surface'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-on-surface'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold">
          <span className="material-symbols-outlined text-[16px] text-primary">
            {method === 'probability' ? 'verified' : 'warning'}
          </span>
          <span>
            {method === 'probability'
              ? 'Memungkinkan Statistical Inference yang Sah'
              : 'Tidak Dapat Digeneralisasi ke Seluruh Populasi'}
          </span>
        </div>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          {method === 'probability' ? (
            <>
              Karena setiap elemen memiliki probabilitas yang diketahui untuk terpilih, sampel ini merepresentasikan seluruh lapisan populasi. <strong>Hanya probability sample yang memungkinkan peneliti membuat kesimpulan (inference) mengenai karakteristik population.</strong>
            </>
          ) : (
            <>
              Meneliti hanya teman sekelas atau responden yang ada di dekat kita (convenience) membuat kelompok lain di luar pojok tersebut sama sekali tidak terwakili. Hasilnya tidak sah untuk ditarik kesimpulan umum atas seluruh mahasiswa.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// ==========================================
// 5. JENIS ERROR SAMPLING VISUAL
// ==========================================
const JenisErrorSamplingVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'coverage' | 'nonresponse' | 'sampling' | 'measurement'
  >('coverage');

  // Sub-states for tabs
  const [nonresponseSubmitted, setNonresponseSubmitted] = useState<boolean>(false);
  const [sampleSize, setSampleSize] = useState<number>(30);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
          <span className="material-symbols-outlined text-[16px]">report_problem</span>
        </span>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-on-surface">
            Simulasi 4 Jenis Error dalam Pengumpulan Data
          </h4>
          <p className="text-[11px] text-on-surface-variant">
            Pilih salah satu jenis error untuk melihat ilustrasi konkretnya.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-surface-container pb-2">
        {[
          { key: 'coverage' as const, label: 'Coverage Error' },
          { key: 'nonresponse' as const, label: 'Nonresponse Error' },
          { key: 'sampling' as const, label: 'Sampling Error' },
          { key: 'measurement' as const, label: 'Measurement Error' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/40 space-y-3">
        {/* 1. COVERAGE ERROR */}
        {activeTab === 'coverage' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">
                Sampling Frame Lebih Kecil dari Populasi Sebenarnya
              </span>
              <span className="text-[11px] text-amber-600 font-medium">Ada yang tertinggal</span>
            </div>

            <div className="relative p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-center min-h-[180px]">
              {/* Big Outer Circle: Population */}
              <div className="relative w-64 h-48 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface-container/20">
                <span className="absolute top-2 left-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Seluruh Populasi Mahasiswa
                </span>

                {/* Leftover dots outside sampling frame */}
                <div className="absolute top-6 right-6 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-[9px] text-red-500 font-bold">Tak terdaftar</span>
                </div>
                <div className="absolute bottom-6 left-6 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-[9px] text-red-500 font-bold">Email keliru</span>
                </div>

                {/* Inner Circle: Sampling Frame */}
                <div className="w-40 h-32 rounded-full border-2 border-primary bg-primary/10 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-xs font-bold text-primary">Daftar Email Kampus</span>
                  <span className="text-[10px] text-on-surface-variant leading-tight">
                    (Sampling Frame)
                  </span>
                  <span className="text-[9px] text-primary font-medium mt-1">
                    Hanya bagian ini yang bisa terpilih
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Contoh:</strong> Survei diadakan menggunakan daftar kontak email kampus. Mahasiswa baru yang emailnya belum selesai diaktivasi otomatis tidak tercakup dalam sampling frame, sehingga peluang mereka terpilih adalah 0.
            </p>
          </div>
        )}

        {/* 2. NONRESPONSE ERROR */}
        {activeTab === 'nonresponse' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-xs text-on-surface">
                Responden Terpilih Menolak atau Tidak Mengisi Kuesioner
              </span>
              <button
                type="button"
                onClick={() => setNonresponseSubmitted((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-2xs transition-colors shrink-0"
              >
                {nonresponseSubmitted ? 'Reset Pengiriman' : 'Kirim Kuesioner (Simulasi)'}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Total 20 orang terpilih sebagai sampel:</span>
                <span className="font-semibold text-primary">
                  {nonresponseSubmitted ? '8 Mengisi (Aktif) • 12 Tidak Mengisi (Fade)' : 'Menunggu pengiriman survei...'}
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-items-center">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const responds = idx < 8; // only 8 respond
                  const faded = nonresponseSubmitted && !responds;
                  return (
                    <div
                      key={idx}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                        faded
                          ? 'opacity-20 bg-gray-200 line-through scale-90'
                          : responds && nonresponseSubmitted
                          ? 'bg-primary text-on-primary scale-105 shadow-xs'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {faded ? '✕' : responds && nonresponseSubmitted ? '✓' : idx + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Contoh:</strong> Dari 200 kuesioner yang disebar ke mahasiswa terpilih, hanya 80 orang yang meluangkan waktu mengisi. Pandangan 120 orang yang tidak merespons mungkin sangat berbeda dari mereka yang bersedia mengisi.
            </p>
          </div>
        )}

        {/* 3. SAMPLING ERROR */}
        {activeTab === 'sampling' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-bold text-xs text-on-surface">
                Variasi Acak Antar-Sampel Dapat Dikurangi dengan Memperbesar Ukuran Sampel (n)
              </span>
              <span className="text-xs font-bold text-primary">n = {sampleSize} Responden</span>
            </div>

            {/* Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={sampleSize}
                onChange={(e) => setSampleSize(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant">
                <span>n = 5 (Variasi besar / Error tinggi)</span>
                <span>n = 100 (Variasi kecil / Error rendah)</span>
              </div>
            </div>

            {/* Visual Margin of Error spread */}
            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 space-y-2">
              <div className="text-[11px] font-semibold text-on-surface flex justify-between">
                <span>Rentang Sebaran Rata-rata Sampel (Margin of Error):</span>
                <span className="text-primary font-bold">
                  ±{(15 / Math.sqrt(sampleSize)).toFixed(1)}%
                </span>
              </div>

              {/* Progress-like visual narrowing */}
              <div className="relative h-6 bg-surface-container rounded-full overflow-hidden flex items-center justify-center">
                <div
                  className="h-full bg-primary/30 border-x-2 border-primary transition-all duration-300"
                  style={{
                    width: `${Math.max(12, Math.min(100, (100 / Math.sqrt(sampleSize)) * 3))}%`,
                  }}
                />
                <span className="absolute text-[10px] font-bold text-primary">
                  Pusat Parameter (μ)
                </span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              <strong>Prinsip:</strong> Dua sampel berbeda dari populasi yang sama selalu menghasilkan rata-rata yang sedikit berbeda hanya karena kebetulan acak. Meningkatkan ukuran sampel (n) mempersempit sebaran error ini.
            </p>
          </div>
        )}

        {/* 4. MEASUREMENT ERROR */}
        {activeTab === 'measurement' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">
                Data Tidak Akurat karena Instrumen atau Pertanyaan Kurang Tepat
              </span>
              <span className="text-[11px] text-red-500 font-semibold">Bias Sistematis</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 flex flex-col sm:flex-row items-center gap-6 justify-center">
              {/* Bullseye target SVG */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="46" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
                  <circle cx="50" cy="50" r="32" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
                  <circle cx="50" cy="50" r="18" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" />
                  <circle cx="50" cy="50" r="6" fill="#0e7c63" />
                  {/* Off-center clustered dots (Measurement error: consistent bias) */}
                  <circle cx="76" cy="28" r="3" fill="#dc2626" />
                  <circle cx="79" cy="24" r="3" fill="#dc2626" />
                  <circle cx="73" cy="25" r="3" fill="#dc2626" />
                </svg>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-red-600">
                  <span className="material-symbols-outlined text-[16px]">gps_off</span>
                  <span>Tembakan Meleset Terus-Menerus ke Satu Arah</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Titik merah selalu meleset dari pusat target hijau karena alat ukur atau pertanyaan survei mengandung bias sejak awal.
                </p>
                <div className="p-2 rounded-lg bg-surface-container-low text-[11px] text-on-surface">
                  Contoh pertanyaan ambigu: <em>&ldquo;Seberapa sering kamu belajar per minggu?&rdquo;</em> (tanpa menyebutkan hitungan jam atau hari). Responden A menjawab &ldquo;Sering&rdquo; (2 jam), sedangkan Responden B menjawab &ldquo;Jarang&rdquo; (5 jam).
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
