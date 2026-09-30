import React, { useState } from 'react';
import { ActivePage } from '../types';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onAddXp?: (amount: number) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage, onAddXp }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<'a' | 'b' | 'c' | null>('b');
  const [xpClaimed, setXpClaimed] = useState(false);

  const handleSelectAnswer = (opt: 'a' | 'b' | 'c') => {
    setSelectedAnswer(opt);
    if (opt === 'b' && !xpClaimed && onAddXp) {
      onAddXp(15);
      setXpClaimed(true);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Gentle Supportive Banner */}
      <aside aria-label="Pengumuman ramah" className="bg-surface-container-low border-b border-outline-variant py-2 px-4 sm:px-6 md:px-8 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-on-surface-variant text-xs sm:text-sm font-medium">
          <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
          <span>Belajar statistik &amp; matematika kuliah tanpa rasa takut atau dihakimi. Progresmu, waktumu sendiri.</span>
        </div>
      </aside>

      {/* Main Canvas */}
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="py-8 md:py-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant text-primary text-xs sm:text-sm font-medium">
                <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span>Ruang Belajar Ramah Mahasiswa &amp; Pejuang Skripsi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-[1.18]">
                Statistika &amp; Matematika Kuliah? <br className="hidden sm:inline" />
                <span className="text-primary font-semibold">Tenang, Kamu Pasti Ngerti.</span>
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Tidak ada yang terlahir &quot;payah matematika&quot;. Yang ada hanyalah materi yang selama ini dijelaskan dengan cara rumit. Di Ngerti, kita uraikan rumus panjang jadi percakapan masuk akal, tanpa rasa takut dihakimi.
              </p>

              {/* Friendly Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant card-gentle">
                  <span className="material-symbols-outlined text-primary text-xl">sentiment_calm</span>
                  <span className="text-sm font-medium text-on-surface">Bebas cemas</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant card-gentle">
                  <span className="material-symbols-outlined text-primary text-xl">stairs</span>
                  <span className="text-sm font-medium text-on-surface">Langkah bertahap</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant card-gentle">
                  <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                  <span className="text-sm font-medium text-on-surface">Tanpa kompetisi</span>
                </div>
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => setActivePage('practice')}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-6 py-3.5 rounded-lg text-sm sm:text-base font-semibold transition-all card-gentle active:scale-95 shadow-sm"
                >
                  <span>Mulai Latihan Bebas (Gratis)</span>
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
                <button
                  onClick={() => setActivePage('topics')}
                  className="inline-flex items-center justify-center gap-2 bg-surface-container-low text-primary hover:bg-surface-container-high border border-outline-variant px-5 py-3.5 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                  <span>Jelajahi Topik</span>
                </button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3 pt-2 text-on-surface-variant text-xs sm:text-sm">
                <div className="flex -space-x-1.5">
                  <span className="inline-block w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] text-on-primary-fixed font-bold border border-surface-container-lowest">UI</span>
                  <span className="inline-block w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-[10px] text-on-secondary-fixed font-bold border border-surface-container-lowest">ITB</span>
                  <span className="inline-block w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-[10px] text-on-tertiary-fixed font-bold border border-surface-container-lowest">UGM</span>
                </div>
                <span>Didesain bersama 2.400+ mahasiswa dari berbagai jurusan soshum &amp; saintek</span>
              </div>
            </div>

            {/* Right Column: Interactive Sample Question Preview (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 card-float relative overflow-hidden transition-all duration-300">
                {/* Header Tag */}
                <div className="flex items-center justify-between pb-4 border-b border-surface-variant">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Simulasi Interaktif</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant">
                    Statistika Deskriptif
                  </span>
                </div>

                {/* Problem Prompt */}
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-on-surface-variant font-medium">Konteks Skripsi:</p>
                  <h2 className="text-base sm:text-lg font-semibold text-on-surface leading-snug">
                    Mencari Rata-rata (Mean) Waktu Belajar Mandiri
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Sampel 5 mahasiswa melaporkan jam belajar mingguan mereka:{' '}
                    <span className="font-code-formula font-semibold text-primary bg-surface-container-low px-2 py-0.5 rounded">
                      6, 8, 4, 10, 7
                    </span>{' '}
                    jam. Berapakah nilai rata-rata (<span className="font-code-formula italic">x̄</span>)?
                  </p>
                </div>

                {/* Formula Breakdown Box */}
                <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant space-y-2">
                  <div className="flex items-center gap-2 text-primary text-xs font-semibold">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      lightbulb
                    </span>
                    <span>Langkah Logika Santai</span>
                  </div>
                  <div className="font-code-formula text-on-surface-variant text-xs bg-surface-container-lowest p-2 rounded-lg border border-outline-variant">
                    x̄ = (Σx) / n = (6 + 8 + 4 + 10 + 7) / 5
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Jumlahkan seluruh nilai data terlebih dahulu, lalu bagi dengan jumlah respondennya (n = 5).
                  </p>
                </div>

                {/* Interactive Choice Options */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-xs text-on-surface font-medium">Pilih jawabanmu tanpa ragu:</p>

                  {/* Option A */}
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer('a')}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-all duration-150 group ${
                      selectedAnswer === 'a'
                        ? 'border-secondary bg-surface-container-low ring-2 ring-secondary/30'
                        : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-xs font-semibold text-on-surface-variant">
                        A
                      </span>
                      <span className="font-code-formula text-sm">6.5 Jam</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary">
                      chevron_right
                    </span>
                  </button>

                  {/* Option B (Correct) */}
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer('b')}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-all duration-150 group ${
                      selectedAnswer === 'b'
                        ? 'border-primary bg-primary-fixed/20 ring-2 ring-primary/30'
                        : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-semibold">
                        B
                      </span>
                      <span className="font-code-formula text-sm font-semibold text-primary">7.0 Jam</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </button>

                  {/* Option C */}
                  <button
                    type="button"
                    onClick={() => handleSelectAnswer('c')}
                    className={`w-full text-left p-3 rounded-lg border flex items-center justify-between transition-all duration-150 group ${
                      selectedAnswer === 'c'
                        ? 'border-secondary bg-surface-container-low ring-2 ring-secondary/30'
                        : 'border-outline-variant bg-surface-container-lowest hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border border-outline-variant flex items-center justify-center text-xs font-semibold text-on-surface-variant">
                        C
                      </span>
                      <span className="font-code-formula text-sm">7.4 Jam</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-outline-variant group-hover:text-primary">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* Positive Feedback Banner */}
                {selectedAnswer === 'b' ? (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#FEF6EB] border border-[#FCDCB2] flex items-start gap-3 transition-opacity">
                    <span
                      className="material-symbols-outlined text-secondary text-xl mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      sentiment_very_satisfied
                    </span>
                    <div className="space-y-0.5 text-xs">
                      <p className="font-semibold text-on-secondary-container">
                        Keren! Kamu menganalisis langkahnya dengan teliti.
                      </p>
                      <p className="text-on-secondary-fixed-variant leading-relaxed">
                        Total = 35, dibagi 5 = 7.0 jam. Langkah sederhana ini adalah pondasi 80% analisis data deskriptif skripsimu nanti!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant flex items-start gap-3">
                    <span className="material-symbols-outlined text-secondary text-xl mt-0.5">lightbulb</span>
                    <div className="space-y-0.5 text-xs text-on-surface-variant">
                      <p className="font-semibold text-on-surface">Mari cek ulang penjumlahannya bersama:</p>
                      <p>6 + 8 + 4 + 10 + 7 = 35. Lalu 35 dibagi 5 responden hasilnya adalah 7.0 jam. Santai saja, klik opsi B untuk mencoba!</p>
                    </div>
                  </div>
                )}

                {/* Mini Reflective Footer */}
                <div className="mt-4 pt-3 border-t border-surface-variant flex items-center justify-between text-on-surface-variant text-xs">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                    <span>Cek Ulang Jawaban: Tuntas</span>
                  </span>
                  <span className="text-primary font-medium">+15 XP Refleksi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Reassurance Bento Section */}
        <section className="py-12 md:py-16 bg-surface-container-lowest border-y border-outline-variant">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Pendekatan Ramah Mental</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Kenapa Belajar di Ngerti Terasa Beda?
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Kami merancang setiap interaksi untuk meredakan ketegangan akademik yang biasa dirasakan di ruang kelas.
              </p>
            </div>

            {/* 4 Calm Reassurance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">functions</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Trauma Rumus Panjang</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Dipecah jadi langkah-langkah logika sederhana yang masuk akal, bukan hafalan simbol buta yang bikin pusing.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">checklist</span>
                    <span>Dekomposisi Logika</span>
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">mood</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Takut Salah Menjawab</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Salah adalah bagian alami dari proses paham. Kamu tetap dapat apresiasi dan poin XP hanya dengan mencoba &amp; merefleksi.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                    <span>Ruang Eksplorasi Aman</span>
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">self_improvement</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Beban Kompetisi &amp; Nilai</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Progres pribadi tanpa papan peringkat (leaderboard) yang bikin minder. Fokus sepenuhnya pada kemajuan diri sendiri.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">pace</span>
                    <span>Ritme Belajar Pribadi</span>
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl">tips_and_updates</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Buntu di Tengah Jalan</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Tersedia petunjuk bertahap (Clue Cooldown), analogi kehidupan nyata, dan panduan visual formula saat kamu ragu.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-secondary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">support</span>
                    <span>Bantuan Tanpa Bocoran</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Topic Peek Showcase */}
        <section className="py-12 md:py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Kurikulum Kampus</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Topik Esensial yang Paling Sering Dicari Mahasiswa
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Dari tugas kuliah pengantar statistika sampai olah data skripsi bab 4.
              </p>
            </div>
            <button
              onClick={() => setActivePage('topics')}
              className="text-primary text-xs sm:text-sm font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <span>Lihat Semua Silabus</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>

          {/* 4 Topic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Topic 1 */}
            <div
              onClick={() => setActivePage('practice')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-gentle hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-xl">bar_chart</span>
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">6 Modul</span>
                </div>
                <h3 className="text-base font-semibold text-on-surface">Statistika Deskriptif</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Mean, Median, Modus, Varians, Standar Deviasi, hingga visualisasi boxplot tanpa bingung data ganjil-genap.
                </p>
              </div>
              <div className="pt-4 mt-3 flex items-center justify-between text-xs text-primary font-medium">
                <span>Tersedia Praktik Excel / SPSS</span>
                <span className="material-symbols-outlined text-base">arrow_outward</span>
              </div>
            </div>

            {/* Topic 2 */}
            <div
              onClick={() => setActivePage('topics')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-gentle hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-xl">psychology</span>
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">8 Modul</span>
                </div>
                <h3 className="text-base font-semibold text-on-surface">Uji Hipotesis &amp; Signifikansi</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Memahami logika p-value, Uji T (Independent &amp; Paired), Uji ANOVA, dan cara membuat kesimpulan penelitian.
                </p>
              </div>
              <div className="pt-4 mt-3 flex items-center justify-between text-xs text-primary font-medium">
                <span>Pondasi Bab 4 Skripsi</span>
                <span className="material-symbols-outlined text-base">arrow_outward</span>
              </div>
            </div>

            {/* Topic 3 */}
            <div
              onClick={() => setActivePage('topics')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-gentle hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-xl">show_chart</span>
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">5 Modul</span>
                </div>
                <h3 className="text-base font-semibold text-on-surface">Regresi &amp; Korelasi</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Korelasi Pearson, Spearman, Regresi Linier Sederhana &amp; Berganda dengan interpretasi R-Square yang kontekstual.
                </p>
              </div>
              <div className="pt-4 mt-3 flex items-center justify-between text-xs text-primary font-medium">
                <span>Latihan Soal Kuantitatif</span>
                <span className="material-symbols-outlined text-base">arrow_outward</span>
              </div>
            </div>

            {/* Topic 4 */}
            <div
              onClick={() => setActivePage('topics')}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 card-gentle hover:border-primary transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-xl">casino</span>
                  </span>
                  <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">7 Modul</span>
                </div>
                <h3 className="text-base font-semibold text-on-surface">Teori Probabilitas</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Kombinasi, permutasi, peluang bersyarat, dan distribusi normal dengan kurva z-score interaktif yang gampang dicerna.
                </p>
              </div>
              <div className="pt-4 mt-3 flex items-center justify-between text-xs text-primary font-medium">
                <span>Visualisasi Interaktif</span>
                <span className="material-symbols-outlined text-base">arrow_outward</span>
              </div>
            </div>
          </div>
        </section>

        {/* Warm Encouragement Pre-Footer Banner */}
        <section className="py-8 md:py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto mb-10">
          <div className="bg-primary text-on-primary rounded-2xl p-6 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 max-w-xl text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Siap mengubah rasa cemas jadi rasa paham?
              </h2>
              <p className="text-xs sm:text-sm text-on-primary-container leading-relaxed">
                Bergabung gratis sekarang. Tidak perlu registrasi kartu kredit, tidak ada ujian dadakan yang menakutkan.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setActivePage('practice')}
                className="inline-flex items-center gap-2 bg-surface-container-lowest text-primary hover:bg-surface-container-low px-6 py-3.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs active:scale-95"
              >
                <span>Coba 1 Modul Sekarang</span>
                <span className="material-symbols-outlined text-lg">play_circle</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
