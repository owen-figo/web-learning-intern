import React, { useState } from 'react';
import { ActivePage } from '../types';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onStartActiveTopic?: () => void;
}

const xpRewardSlides = [
  {
    title: 'Mencoba soal',
    xp: '+10 XP',
    desc: 'Benar atau salah, tetap dihargai.',
    icon: 'edit_note',
  },
  {
    title: 'Jawaban benar',
    xp: '+15 XP',
    desc: 'Bonus untuk jawaban tepat.',
    icon: 'check_circle',
  },
  {
    title: 'Cek jawabanmu',
    xp: '+10 XP',
    desc: 'Bonus karena kamu memeriksa dulu.',
    icon: 'fact_check',
  },
  {
    title: 'Bonus kecepatan',
    xp: 'sampai +10 XP',
    desc: 'Hanya saat mengerjakan, bukan saat mengecek.',
    icon: 'bolt',
  },
  {
    title: 'Baca materi sampai selesai',
    xp: '+15 XP',
    desc: 'Selesaikan satu materi.',
    icon: 'menu_book',
  },
  {
    title: 'Daily Quest',
    xp: '+20 XP',
    desc: 'Satu set singkat tiap hari.',
    icon: 'task_alt',
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage, onStartActiveTopic }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : xpRewardSlides.length - 1));
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev < xpRewardSlides.length - 1 ? prev + 1 : 0));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      goToNext();
    } else if (diff < -40) {
      goToPrev();
    }
    setTouchStartX(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  };
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
                  Tidak ada BINUSIAN yang terlahir &quot;payah statistika&quot;. Yang ada hanyalah materi yang selama ini dijelaskan dengan cara rumit. Di Ngerti, kita uraikan rumus dan uji statistik jadi penalaran masuk akal, tanpa rasa takut dihakimi.
                </p>
              </div>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-6 lg:pt-8">
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
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 card-float relative overflow-hidden transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-0.5">
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        stars
                      </span>
                      <span>Sistem Apresiasi Usaha</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                      Cara Dapat XP
                    </h2>
                    <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                      Setiap usaha dihitung.
                    </p>
                  </div>
                  {/* Counter e.g. "1 / 6" */}
                  <div className="shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                      {currentSlide + 1} / {xpRewardSlides.length}
                    </span>
                  </div>
                </div>

                {/* Carousel Viewport (One Reward at a Time) */}
                <div
                  className="w-full overflow-hidden my-3 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl cursor-grab active:cursor-grabbing"
                  tabIndex={0}
                  role="region"
                  aria-roledescription="carousel"
                  aria-label="Karusel Cara Dapat XP"
                  onKeyDown={handleKeyDown}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <div
                    className="flex w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {xpRewardSlides.map((slide, idx) => (
                      <div
                        key={idx}
                        className="w-full shrink-0"
                        aria-hidden={idx !== currentSlide}
                      >
                        {/* Compact single row on desktop, stacked on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/60">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Small icon */}
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                              <span
                                className="material-symbols-outlined text-xl"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                {slide.icon}
                              </span>
                            </div>

                            {/* Title & 1-line Description */}
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm sm:text-base font-bold text-on-surface leading-tight truncate">
                                {slide.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-on-surface-variant truncate whitespace-nowrap mt-0.5">
                                {slide.desc}
                              </p>
                            </div>
                          </div>

                          {/* XP Chip */}
                          <div className="shrink-0 self-end sm:self-center">
                            <span className="inline-block px-3 py-1 rounded-xl bg-primary/15 text-primary text-xs sm:text-sm font-extrabold border border-primary/25 font-code-formula whitespace-nowrap">
                              {slide.xp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Controls: Prev / Dots / Next */}
                <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goToPrev}
                    aria-label="Hadiah sebelumnya"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container-low hover:bg-surface-container-high active:bg-surface-container border border-outline-variant text-on-surface flex items-center justify-center transition-all active:scale-95 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>

                  {/* Dot Indicators */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {xpRewardSlides.map((_, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Pindah ke slide ${idx + 1}: ${xpRewardSlides[idx].title}`}
                        className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                          idx === currentSlide
                            ? 'w-6 sm:w-7 bg-primary'
                            : 'w-2 sm:w-2.5 bg-outline-variant/80 hover:bg-primary/50'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={goToNext}
                    aria-label="Hadiah berikutnya"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container-low hover:bg-surface-container-high active:bg-surface-container border border-outline-variant text-on-surface flex items-center justify-center transition-all active:scale-95 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width "Apa gunanya XP?" Bar */}
          <div className="mt-8 lg:mt-10 bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 card-gentle">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Title / Badge */}
              <div className="flex items-center gap-2.5 shrink-0 lg:pr-6 lg:border-r lg:border-outline-variant">
                <span className="w-9 h-9 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    emoji_events
                  </span>
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-on-surface">Apa gunanya XP?</h3>
                  <p className="text-[11px] text-on-surface-variant hidden sm:block">Apresiasi konsistensimu</p>
                </div>
              </div>

              {/* 3 items in grid / flex */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-[11px] sm:text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>Naik Rank</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Rank berdasarkan progres pribadimu, bukan perbandingan dengan orang lain.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-[11px] sm:text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">military_tech</span>
                    <span>Buka Achievement</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Badge membuka bingkai avatar, warna banner, dan gelar untuk profilmu.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant text-[11px] sm:text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">local_fire_department</span>
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
      </div>
    </div>
  );
};
