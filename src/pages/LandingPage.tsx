import React from 'react';
import { ActivePage } from '../types';
import { XpVerticalCarousel } from '../components/XpVerticalCarousel';

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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 Columns) */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div className="space-y-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface leading-[1.18]">
                  Statistika sulit? <br className="hidden sm:inline" />
                  <span className="text-primary font-semibold">Tenang, Kamu Pasti Ngerti.</span>
                </h1>

                <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                  Tidak ada INDIVIDU yang terlahir &quot;payah statistika&quot;. Yang ada hanyalah materi yang selama ini dijelaskan dengan cara rumit. Di Ngerti, kita uraikan rumus dan uji statistik jadi penalaran masuk akal, tanpa rasa takut dihakimi.
                </p>
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-6 lg:pt-8">
                {/* <button
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
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button> */}
                <button
                  onClick={() => setActivePage('topics')}
                  className="inline-flex items-center justify-center gap-2 bg-surface-container-low text-primary hover:bg-surface-container-high border border-outline-variant px-5 py-3.5 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  <span>Jelajahi Topik</span>
                </button>
              </div>
            </div>

            {/* Right Column: Cara Dapat XP (5 Columns), carousel vertikal */}
            <div className="lg:col-span-5">
              <XpVerticalCarousel />
            </div>
          </div>

          {/* Full-width "Apa gunanya XP?" Bar */}
          <div className="mt-8 lg:mt-10 bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 card-gentle">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Title / Badge */}
              <div className="flex items-center gap-2.5 shrink-0 lg:pr-6 lg:border-r lg:border-outline-variant">
                <span className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emoji_events
                  </span>
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-on-surface">Apa gunanya XP?</h3>
                  <p className="text-xs text-on-surface-variant hidden sm:block">Apresiasi konsistensimu</p>
                </div>
              </div>

              {/* 3 items in grid / flex */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>Naik Rank</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Rank berdasarkan progres pribadimu, bukan perbandingan dengan orang lain.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    <span>Buka Achievement</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Badge membuka bingkai avatar, warna banner, dan gelar untuk profilmu.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                    <span>Jaga Streak</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Belajar tiap hari menjaga streak tetap menyala.
                  </p>
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
                    <span className="material-symbols-outlined text-[24px]">functions</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Trauma Rumus Panjang</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Dipecah jadi langkah-langkah logika sederhana yang masuk akal, bukan hafalan simbol buta yang bikin pusing.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">checklist</span>
                    <span>Dekomposisi Logika</span>
                  </span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">mood</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Takut Salah Menjawab</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Salah adalah bagian alami dari proses paham. Kamu tetap dapat apresiasi dan poin XP hanya dengan mencoba &amp; merefleksi.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                    <span>Ruang Eksplorasi Aman</span>
                  </span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">self_improvement</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Beban Kompetisi &amp; Nilai</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Progres pribadi tanpa papan peringkat (leaderboard) yang bikin minder. Fokus sepenuhnya pada kemajuan diri sendiri.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">pace</span>
                    <span>Ritme Belajar Pribadi</span>
                  </span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-outline-variant text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">tips_and_updates</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-on-surface">Buntu di Tengah Jalan</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    Tersedia petunjuk bertahap (Clue Cooldown), analogi kehidupan nyata, dan panduan visual formula saat kamu ragu.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-surface-container-high">
                  <span className="text-xs text-secondary font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">support</span>
                    <span>Bantuan Tanpa Bocoran</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
