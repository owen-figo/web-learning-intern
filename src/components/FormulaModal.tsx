import React, { useState } from 'react';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'deskriptif' | 'inferensial' | 'aljabar'>('deskriptif');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed/40 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-on-surface">Panduan Formula Santai</h2>
              <p className="text-xs md:text-sm text-on-surface-variant">Bebas hafalan buta. Pahami maknanya dengan bahasa manusia.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-surface-container text-xs md:text-sm font-medium">
          <button
            onClick={() => setActiveTab('deskriptif')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'deskriptif'
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Statistika Deskriptif
          </button>
          <button
            onClick={() => setActiveTab('inferensial')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'inferensial'
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Peluang & Uji Hipotesis
          </button>
          <button
            onClick={() => setActiveTab('aljabar')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'aljabar'
                ? 'bg-primary-container text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Aljabar & Kalkulus
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'deskriptif' && (
            <>
              {/* Card 1: Mean */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Rata-rata Sampel (Mean, x̄)</h3>
                  <span className="text-xs bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/40 text-on-surface-variant">
                    Pusat Data
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  x̄ = (Σ xᵢ) / n
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Makna:</strong> Jumlahkan semua angka amatanmu, lalu bagi dengan banyaknya data (n). Hasilnya adalah titik seimbang dari seluruh sebaran.
                </p>
              </div>

              {/* Card 2: Varians Sampel */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Varians Sampel (s²)</h3>
                  <span className="text-xs bg-primary-fixed/50 px-2 py-0.5 rounded text-on-primary-fixed font-medium">
                    Kunci Skripsi
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  s² = Σ (xᵢ - x̄)² / (n - 1)
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Catatan Penenang:</strong> Kita membagi dengan <code>(n - 1)</code> untuk data sampel penelitian agar nilainya tidak bias terhadap populasi sebenarnya.
                </p>
              </div>

              {/* Card 3: Standar Deviasi */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Standar Deviasi Sampel (s)</h3>
                  <span className="text-xs bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/40 text-on-surface-variant">
                    Simpangan Baku
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  s = √(s²)
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Makna:</strong> Mengakarkan varians mengembalikan satuan hasil hitung ke satuan data aslinya (misalnya dari jam² kembali menjadi jam biasa).
                </p>
              </div>
            </>
          )}

          {activeTab === 'inferensial' && (
            <>
              {/* Card 4: Z-Score */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Standarisasi Z-Score</h3>
                  <span className="text-xs bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/40 text-on-surface-variant">
                    Distribusi Normal
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  z = (x - μ) / σ
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Makna:</strong> Mengukur berapa jarak posisi suatu data dari rata-rata dalam satuan standar deviasi.
                </p>
              </div>

              {/* Card 5: Uji T 1 Sampel */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Uji T Satu Sampel (t-statistic)</h3>
                  <span className="text-xs bg-secondary-fixed/50 px-2 py-0.5 rounded text-on-secondary-fixed-variant">
                    Uji Signifikansi
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  t = (x̄ - μ₀) / (s / √n)
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Makna:</strong> Menguji apakah rata-rata sampel kita berbeda secara bermakna dari nilai hipotesis awal (μ₀).
                </p>
              </div>
            </>
          )}

          {activeTab === 'aljabar' && (
            <>
              {/* Card 6: Garis Regresi */}
              <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary">Persamaan Regresi Linier</h3>
                  <span className="text-xs bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/40 text-on-surface-variant">
                    Prediksi
                  </span>
                </div>
                <div className="font-code-formula text-sm bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 text-primary">
                  Ŷ = a + bX
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <strong>Makna:</strong> a adalah titik potong (intersep saat X=0), b adalah koefisien arah (kenaikan Y setiap penambahan 1 satuan X).
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-surface-container flex items-center justify-between">
          <span className="text-xs text-outline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-primary">spa</span>
            <span>Bebas cemas: semua rumus tersedia gratis saat latihan mandiri</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
