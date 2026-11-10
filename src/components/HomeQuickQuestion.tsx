import React, { useState } from 'react';

// One sample question on the home page, so visitors feel what learning in Ngerti is like:
// answer, then see why (with a picture), without a score. Checked in the browser, no XP.

const DATA = [3, 5, 5, 9, 18];
const MEAN = 8; // (3 + 5 + 5 + 9 + 18) / 5
const MEDIAN = 5;
const OPTIONS = ['Mean (rata-rata)', 'Median (nilai tengah)', 'Keduanya sama besar'];
const CORRECT = 0;

const x = (v: number) => 20 + v * 16;

/** Dot plot of the data; after answering, the mean and median are marked and the outlier highlighted. */
const DotPlot: React.FC<{ answered: boolean }> = ({ answered }) => {
  const seen: Record<number, number> = {};
  return (
    <svg viewBox="0 0 360 112" className="w-full max-w-[420px] mx-auto h-auto select-none" role="img" aria-label="Diagram titik data 3, 5, 5, 9, 18">
      <line x1="16" y1="86" x2="344" y2="86" stroke="#6e7a74" strokeWidth="1.5" />
      {[0, 5, 10, 15, 20].map((v) => (
        <g key={v}>
          <line x1={x(v)} y1="86" x2={x(v)} y2="91" stroke="#6e7a74" strokeWidth="1.5" />
          <text x={x(v)} y="105" textAnchor="middle" fontSize="12" fill="#3e4944" fontFamily="JetBrains Mono, monospace">
            {v}
          </text>
        </g>
      ))}
      {answered && (
        <g>
          <line x1={x(MEDIAN)} y1="22" x2={x(MEDIAN)} y2="86" stroke="#835500" strokeWidth="2" strokeDasharray="4 3" />
          <text x={x(MEDIAN) - 4} y="18" textAnchor="end" fontSize="13" fontWeight="700" fill="#835500">
            Median = 5
          </text>
          <line x1={x(MEAN)} y1="22" x2={x(MEAN)} y2="86" stroke="#00614d" strokeWidth="2" />
          <text x={x(MEAN) + 4} y="18" fontSize="13" fontWeight="700" fill="#00614d">
            Mean = 8
          </text>
          <text x={x(18)} y="50" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ba1a1a">
            outlier
          </text>
        </g>
      )}
      {DATA.map((v, i) => {
        seen[v] = (seen[v] ?? 0) + 1;
        const outlier = answered && v === 18;
        return (
          <circle
            key={i}
            cx={x(v)}
            cy={76 - (seen[v] - 1) * 16}
            r="7"
            fill={outlier ? '#ba1a1a' : '#0e7c63'}
          />
        );
      })}
    </svg>
  );
};

export const HomeQuickQuestion: React.FC<{ onExplore: () => void }> = ({ onExplore }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === CORRECT;

  const optionClass = (i: number) => {
    if (!answered) {
      return 'border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-primary-fixed/20 text-on-surface';
    }
    if (i === CORRECT) return 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant font-semibold';
    if (i === picked) return 'border-error/60 bg-error-container/50 text-on-error-container';
    return 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant opacity-70';
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-5 sm:p-6 card-float space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold">
          Contoh soal · Ukuran Pemusatan
        </span>
        <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">Mudah</span>
      </div>

      <div className="space-y-2">
        <p className="text-base sm:text-lg font-semibold text-on-surface leading-snug">
          Waktu tunggu 5 pelanggan (menit) tercatat seperti ini. Mana yang lebih besar?
        </p>
        <div className="flex flex-wrap gap-1.5" aria-label="Data">
          {DATA.map((v, i) => (
            <span
              key={i}
              className={`min-w-9 text-center px-2 py-1 rounded-lg border font-code-formula text-sm ${
                answered && v === 18
                  ? 'border-error/50 bg-error-container/50 text-on-error-container'
                  : 'border-outline-variant bg-surface-container-low text-on-surface'
              }`}
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-surface-container-low/60 border border-outline-variant/50 px-3 pt-2 pb-1">
        <DotPlot answered={answered} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label="Pilihan jawaban">
        {OPTIONS.map((label, i) => (
          <button
            key={label}
            type="button"
            disabled={answered}
            aria-pressed={picked === i}
            onClick={() => setPicked(i)}
            className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-xl border text-sm disabled:cursor-default ${optionClass(i)}`}
          >
            <span className="w-6 h-6 rounded-md bg-surface-container text-on-surface-variant text-xs font-bold flex items-center justify-center shrink-0">
              {answered && i === CORRECT ? (
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
              ) : (
                'ABC'[i]
              )}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {answered && (
          <div className="space-y-3">
            <div
              className={`rounded-xl p-3.5 border text-sm space-y-1.5 ${
                correct ? 'bg-primary-fixed/25 border-primary/30' : 'bg-secondary-fixed/40 border-secondary/30'
              }`}
            >
              <p className={`font-bold ${correct ? 'text-primary' : 'text-on-secondary-fixed-variant'}`}>
                {correct ? 'Tepat! Mean-nya lebih besar.' : 'Belum tepat, dan itu tidak apa-apa. Ini jawabannya:'}
              </p>
              <p className="font-code-formula text-xs sm:text-sm text-on-surface">Mean = (3 + 5 + 5 + 9 + 18) / 5 = 40 / 5 = 8</p>
              <p className="font-code-formula text-xs sm:text-sm text-on-surface">Median = nilai ke-3 setelah diurutkan = 5</p>
              <p className="text-on-surface-variant leading-relaxed">
                Nilai <strong className="text-on-surface">18</strong> jauh lebih besar dari yang lain (outlier), sehingga menarik
                mean ke atas. Median tidak ikut tertarik, karena hanya melihat posisi tengah.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors"
              >
                Pelajari topiknya
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
              </button>
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
                Coba lagi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
