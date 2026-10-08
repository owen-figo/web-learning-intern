import React from 'react';
import { ActivePage } from '../types';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onStartActiveTopic?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage, onStartActiveTopic }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Canvas */}
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="py-8 md:py-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (7 Columns) */}
            <div className="lg:col-span-7 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-[1.18]">
                Statistika Kuliah di BINUS? <br className="hidden sm:inline" />
                <span className="text-primary font-semibold">Tenang, Kamu Pasti Ngerti.</span>
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                Tidak ada BINUSIAN yang terlahir &quot;payah statistika&quot;. Yang ada hanyalah materi yang selama ini dijelaskan dengan cara rumit. Di Ngerti, kita uraikan rumus dan uji statistik jadi penalaran masuk akal, tanpa rasa takut dihakimi.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  onClick={() => {
                    if (onStartActiveTopic) {
                      onStartActiveTopic();
                    } else {
                      setActivePage('practice');
                    }
                  }}
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
            </div>

            {/* Right Column: Cara Dapat XP (5 Columns) */}
            <div className="lg:col-span-5">
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 card-float relative overflow-hidden transition-all duration-300 space-y-5">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
                    <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                      stars
                    </span>
                    <span>Sistem Apresiasi Usaha</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                    Cara Dapat XP
                  </h2>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Setiap usaha dihitung, bukan cuma jawaban benar.
                  </p>
                </div>

                {/* Compact Vertical List of XP Rules */}
                <div className="space-y-2.5">
                  {/* Row 1: Mencoba soal */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base">edit_note</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Mencoba soal</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Benar atau salah, usahamu tetap dihargai.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                      +10 XP
                    </span>
                  </div>

                  {/* Row 2: Jawaban benar */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Jawaban benar</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Bonus untuk jawaban yang tepat.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                      +15 XP
                    </span>
                  </div>

                  {/* Row 3: Langkah "Cek jawabanmu" */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base">fact_check</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Langkah &quot;Cek jawabanmu&quot;</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Bonus karena kamu memeriksa sebelum lanjut.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                      +10 XP
                    </span>
                  </div>

                  {/* Row 4: Bonus kecepatan */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base">bolt</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Bonus kecepatan</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Hanya untuk fase mengerjakan. Timer berhenti saat kamu mengecek jawaban, jadi tidak perlu buru-buru.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold text-[11px] border border-primary/20">
                      sampai +10 XP
                    </span>
                  </div>

                  {/* Row 5: Baca materi teori */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base">menu_book</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Baca materi teori sampai selesai</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Pahami konsep fondasi tanpa tekanan kuis.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                      +15 XP
                    </span>
                  </div>

                  {/* Row 6: Daily Quest harian */}
                  <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-primary shrink-0 border border-outline-variant">
                        <span className="material-symbols-outlined text-base">task_alt</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-on-surface">Daily Quest harian</p>
                        <p className="text-[11px] text-on-surface-variant truncate">Selesaikan satu set singkat setiap hari.</p>
                      </div>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                      +20 XP
                    </span>
                  </div>
                </div>

                {/* Apa gunanya XP? Strip */}
                <div className="pt-3 border-t border-outline-variant space-y-2">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      emoji_events
                    </span>
                    <span>Apa gunanya XP?</span>
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant text-[11px] space-y-1">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        <span>Naik Rank</span>
                      </p>
                      <p className="text-on-surface-variant leading-snug">
                        Rank berdasarkan progres pribadimu, bukan perbandingan dengan orang lain.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant text-[11px] space-y-1">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">military_tech</span>
                        <span>Buka Achievement</span>
                      </p>
                      <p className="text-on-surface-variant leading-snug">
                        Badge membuka bingkai avatar, warna banner, dan gelar untuk profilmu.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-low/60 border border-outline-variant text-[11px] space-y-1">
                      <p className="font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">local_fire_department</span>
                        <span>Jaga Streak</span>
                      </p>
                      <p className="text-on-surface-variant leading-snug">
                        Belajar tiap hari menjaga streak tetap menyala.
                      </p>
                    </div>
                  </div>
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
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Kurikulum Statistika BINUS</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                Topik Statistika Esensial untuk BINUSIAN
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Dari mata kuliah Business Statistics / Computational Statistics hingga olah data skripsi &amp; tugas akhir BINUS.
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
              onClick={() => {
                if (onStartActiveTopic) {
                  onStartActiveTopic();
                } else {
                  setActivePage('topics');
                }
              }}
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
              onClick={() => {
                if (onStartActiveTopic) {
                  onStartActiveTopic();
                } else {
                  setActivePage('topics');
                }
              }}
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
              onClick={() => {
                if (onStartActiveTopic) {
                  onStartActiveTopic();
                } else {
                  setActivePage('topics');
                }
              }}
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
              onClick={() => {
                if (onStartActiveTopic) {
                  onStartActiveTopic();
                } else {
                  setActivePage('topics');
                }
              }}
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
                onClick={() => {
                  if (onStartActiveTopic) {
                    onStartActiveTopic();
                  } else {
                    setActivePage('topics');
                  }
                }}
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
