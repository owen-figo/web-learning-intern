import React, { useEffect, useRef, useState } from 'react';
import { ActivePage } from '../types';
import { XpVerticalCarousel } from '../components/XpVerticalCarousel';
import { HeroBackgroundLines } from '../components/HeroBackgroundLines';
import { HomeQuickQuestion } from '../components/HomeQuickQuestion';
import { TOTAL_PRACTICE_QUESTIONS } from '../lib/practiceBank';

// Tim pengembang Ngerti. Foto sengaja anonim (ikon orang), bukan foto asli.
const DEVELOPERS = [
  { name: 'Kurnia Yoga Pratama', role: 'Backend Developer', color: '#0e7c63' },
  { name: 'Owen Figo', role: 'Frontend Developer', color: '#0d9488' },
  { name: 'Danendra Rafi Firjatullah', role: 'Business Analyst / Content', color: '#00614d' },
];

const ABOUT_STATS = [
  { value: 8, label: 'Topik materi' },
  { value: TOTAL_PRACTICE_QUESTIONS, label: 'Soal latihan' },
  { value: 4, label: 'Tingkat kesulitan' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Counts from 0 up to `value` (ease-out) the first time the number scrolls into view. */
const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 1400 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
};

/**
 * Bouncing arrow at the bottom of the screen that invites scrolling down. It shows while the hero is
 * being looked at (the next section at most peeks in), hides once that section is well into view or
 * the arrow is clicked, and comes back when the student scrolls up to the hero again.
 */
const ScrollHint: React.FC<{ targetId: string }> = ({ targetId }) => {
  const [inHero, setInHero] = useState(true);
  // Clicked: stay hidden while the page scrolls away, until the student is back in the hero.
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    const update = () => {
      const target = document.getElementById(targetId);
      const hero = !target || target.getBoundingClientRect().top > window.innerHeight * 0.6;
      setInHero(hero);
      if (!hero) setClicked(false);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetId]);

  const visible = inHero && !clicked;

  return (
    <button
      type="button"
      onClick={() => {
        setClicked(true);
        document.getElementById(targetId)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }}
      aria-label="Gulir ke bawah: Apa itu Ngerti?"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      title="Kenali Ngerti"
      className={`group fixed bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 p-1 rounded-full transition-[opacity,translate] duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      {/* Amber (the site's accent) so it stands out from the green page, with a pulsing halo. */}
      <span className="scroll-hint-bounce relative block">
        <span aria-hidden="true" className="scroll-hint-halo absolute inset-0 rounded-full bg-secondary-container" />
        <span className="relative w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container shadow-lg shadow-secondary/40 ring-4 ring-surface-container-lowest flex items-center justify-center transition-[background-color,scale] duration-200 group-hover:bg-secondary-fixed-dim group-hover:scale-110 group-active:scale-95">
          <span className="material-symbols-outlined" style={{ fontSize: 34 }}>
            keyboard_double_arrow_down
          </span>
        </span>
      </span>
    </button>
  );
};

const ABOUT_STEPS = [
  {
    icon: 'auto_stories',
    title: 'Baca materi interaktif',
    desc: 'Teori dipecah per bagian, lengkap dengan simulasi dan visual untuk setiap langkah.',
  },
  {
    icon: 'stairs',
    title: 'Latihan bertingkat',
    desc: 'Dari Mudah sampai Sangat Sulit, dengan petunjuk yang menyesuaikan tingkatnya.',
  },
  {
    icon: 'stars',
    title: 'Kumpulkan XP',
    desc: 'Setiap usaha dihitung. Jaga streak dan buka achievement sambil belajar.',
  },
];

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
  onStartActiveTopic?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage, onStartActiveTopic }) => {
  // Below the hero, blocks marked data-reveal fade up as they scroll into view (once).
  // `--reveal-delay` on a block staggers cards in the same row.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const blocks = rootRef.current?.querySelectorAll<HTMLElement>('[data-reveal]');
    if (!blocks?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    blocks.forEach((b) => observer.observe(b));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col min-h-screen">
      {/* Main Canvas */}
      <div className="flex-grow">
        {/* Hero Section, with decorative wave lines behind it */}
        {/* overflow-x-clip (not hidden): clips the wide lines sideways but lets the corner lines reach below */}
        <div className="relative overflow-x-clip">
        <HeroBackgroundLines />
        <HeroBackgroundLines variant="corner" />
        <section className="relative pt-6 pb-6 md:pt-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column (7 Columns) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
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
            <div className="lg:col-span-6">
              <XpVerticalCarousel />
            </div>
          </div>

          {/* Full-width "Apa gunanya XP?" Bar */}
          <div className="mt-6 bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 card-gentle">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 flex-1">
                <div className="p-2.5 sm:p-3 lg:p-0 rounded-xl lg:rounded-none bg-surface-container-low/70 lg:bg-transparent border border-outline-variant lg:border-0 text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>Naik Rank</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Rank berdasarkan progres pribadimu, bukan perbandingan dengan orang lain.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 lg:p-0 rounded-xl lg:rounded-none bg-surface-container-low/70 lg:bg-transparent border border-outline-variant lg:border-0 text-xs space-y-1">
                  <p className="font-semibold text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    <span>Buka Achievement</span>
                  </p>
                  <p className="text-on-surface-variant leading-relaxed">
                    Badge membuka bingkai avatar, warna banner, dan gelar untuk profilmu.
                  </p>
                </div>

                <div className="p-2.5 sm:p-3 lg:p-0 rounded-xl lg:rounded-none bg-surface-container-low/70 lg:bg-transparent border border-outline-variant lg:border-0 text-xs space-y-1">
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
        <ScrollHint targetId="tentang-ngerti" />
        </div>

        {/* Apa itu Ngerti? */}
        <section id="tentang-ngerti" aria-labelledby="about-heading" className="relative overflow-x-clip pt-6 pb-12 md:pt-8 md:pb-16 scroll-mt-20">
          <HeroBackgroundLines variant="about" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="space-y-5">
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Tentang Ngerti</span>
              <h2 id="about-heading" className="text-2xl sm:text-3xl font-bold text-on-surface">
                Apa itu Ngerti?
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Ngerti adalah ruang belajar statistika online untuk mahasiswa. Namanya diambil dari kata
                &ldquo;mengerti&rdquo;, karena tujuannya sederhana: kamu benar-benar paham, bukan sekadar hafal rumus.
              </p>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Materinya mengikuti alur perkuliahan statistika, dari mengumpulkan data sampai confidence interval,
                dan bisa kamu pelajari sesuai ritmemu sendiri.
              </p>
              <dl className="grid grid-cols-3 gap-3 pt-2">
                {ABOUT_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-surface-container-lowest border border-outline-variant p-3 sm:p-4">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                      <CountUp value={stat.value} />
                    </dd>
                    <dd className="text-xs sm:text-sm text-on-surface-variant mt-0.5">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ol className="space-y-3">
              {ABOUT_STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="flex items-start gap-4 rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 sm:p-5 card-gentle"
                >
                  <span className="w-12 h-12 rounded-xl bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
                      {step.icon}
                    </span>
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-primary">Langkah {i + 1}</p>
                    <h3 className="text-base sm:text-lg font-semibold text-on-surface">{step.title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed mt-0.5">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Coba satu soal: rasakan cara belajar di Ngerti */}
        <section aria-labelledby="quick-heading" className="relative overflow-hidden pb-12 md:pb-16">
          <HeroBackgroundLines variant="quick" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Coba 10 Detik</span>
              <h2 id="quick-heading" className="text-2xl sm:text-3xl font-bold text-on-surface">
                Satu soal, langsung paham alasannya
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Begini rasanya belajar di Ngerti: pilih jawaban, lalu lihat penjelasannya lengkap dengan gambar. Tidak ada
                nilai, tidak ada yang menghakimi. Salah pun tetap belajar.
              </p>
              <ul className="space-y-2 text-sm text-on-surface-variant">
                {['Penjelasan langkah demi langkah', 'Visual yang menunjukkan kenapa', 'XP untuk setiap usaha (setelah masuk)'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>check_circle</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-7">
              <HomeQuickQuestion onExplore={() => setActivePage('topics')} />
            </div>
          </div>
        </section>

        {/* Student Reassurance Bento Section */}
        <section className="relative overflow-hidden py-12 md:py-16 bg-surface-container-lowest border-y border-outline-variant">
          <HeroBackgroundLines variant="reasons" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
            <div data-reveal className="text-center max-w-2xl mx-auto space-y-2.5">
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
              <div data-reveal style={{ '--reveal-delay': '0ms' } as React.CSSProperties} className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
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
              <div data-reveal style={{ '--reveal-delay': '90ms' } as React.CSSProperties} className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
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
              <div data-reveal style={{ '--reveal-delay': '180ms' } as React.CSSProperties} className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
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
              <div data-reveal style={{ '--reveal-delay': '270ms' } as React.CSSProperties} className="bg-surface rounded-xl p-6 border border-outline-variant card-gentle hover:-translate-y-1 transition-transform flex flex-col justify-between">
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

        {/* Tim pengembang (data di DEVELOPERS, di atas komponen ini) */}
        <section aria-labelledby="team-heading" className="relative overflow-hidden py-12 md:py-16">
          <HeroBackgroundLines variant="team" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
            <div data-reveal className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Tim Pengembang</span>
              <h2 id="team-heading" className="text-2xl sm:text-3xl font-bold text-on-surface">
                Orang di Balik Ngerti
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Ngerti dibangun oleh tim kecil yang ingin belajar statistika terasa lebih ramah.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {DEVELOPERS.map((dev, i) => (
                <li
                  key={dev.name}
                  data-reveal
                  style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 card-gentle flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform"
                >
                  <span
                    aria-hidden="true"
                    className="w-20 h-20 rounded-full flex items-end justify-center overflow-hidden text-white/90 ring-4 ring-primary-fixed/60"
                    style={{ backgroundColor: dev.color }}
                  >
                    <span className="material-symbols-outlined -mb-2" style={{ fontSize: 68, fontVariationSettings: "'FILL' 1" }}>
                      person
                    </span>
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-on-surface">{dev.name}</h3>
                    <p className="text-sm text-on-surface-variant">{dev.role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};
