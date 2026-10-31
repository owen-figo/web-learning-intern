import React from 'react';
import { ActivePage } from '../types';
import { XpVerticalCarousel } from '../components/XpVerticalCarousel';
import { HeroBackgroundLines } from '../components/HeroBackgroundLines';

// Tim pengembang Ngerti. GANTI dengan nama, peran, dan inisial anggota tim yang sebenarnya.
const DEVELOPERS = [
  { name: 'Nama Developer 1', role: 'Peran, mis. Frontend Developer', initials: 'D1', color: '#0e7c63' },
  { name: 'Nama Developer 2', role: 'Peran, mis. UI/UX Designer', initials: 'D2', color: '#0d9488' },
  { name: 'Nama Developer 3', role: 'Peran, mis. Content & Statistik', initials: 'D3', color: '#00614d' },
];

const ABOUT_STATS = [
  { value: '8', label: 'Topik materi' },
  { value: '320', label: 'Soal latihan' },
  { value: '4', label: 'Tingkat kesulitan' },
];

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
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Canvas */}
      <div className="flex-grow">
        {/* Hero Section, with decorative wave lines behind it */}
        {/* overflow-x-clip (not hidden): clips the wide lines sideways but lets the corner lines reach below */}
        <div className="relative overflow-x-clip">
        <HeroBackgroundLines />
        <HeroBackgroundLines variant="corner" />
        <section className="relative py-8 md:py-14 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
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
        </div>

        {/* Apa itu Ngerti? */}
        <section aria-labelledby="about-heading" className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
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
                    <dd className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">{stat.value}</dd>
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

        {/* Tim pengembang (data di DEVELOPERS, di atas komponen ini) */}
        <section aria-labelledby="team-heading" className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-primary text-xs font-semibold tracking-wider uppercase">Tim Pengembang</span>
              <h2 id="team-heading" className="text-2xl sm:text-3xl font-bold text-on-surface">
                Orang di Balik Ngerti
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant">
                Ngerti dibangun oleh tim kecil yang ingin belajar statistika terasa lebih ramah.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {DEVELOPERS.map((dev) => (
                <li
                  key={dev.name}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 card-gentle flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform"
                >
                  <span
                    aria-hidden="true"
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold ring-4 ring-primary-fixed/60"
                    style={{ backgroundColor: dev.color }}
                  >
                    {dev.initials}
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
