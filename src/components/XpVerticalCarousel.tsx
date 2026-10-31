import React, { useEffect, useState } from 'react';

interface XpSlide {
  title: string;
  xp: string;
  desc: string;
  icon: string;
}

const SLIDES: XpSlide[] = [
  { title: 'Mencoba soal', xp: '+10 XP', desc: 'Benar atau salah, tetap dihargai.', icon: 'draw' },
  { title: 'Jawaban benar', xp: '+15 XP', desc: 'Bonus untuk jawaban tepat.', icon: 'verified' },
  { title: 'Cek jawabanmu', xp: '+10 XP', desc: 'Bonus karena kamu memeriksa dulu.', icon: 'manage_search' },
  { title: 'Bonus kecepatan', xp: 'sampai +10 XP', desc: 'Hanya saat mengerjakan, bukan saat mengecek.', icon: 'speed' },
  { title: 'Baca materi sampai selesai', xp: '+15 XP', desc: 'Selesaikan satu materi.', icon: 'auto_stories' },
  { title: 'Daily Quest', xp: '+20 XP', desc: 'Satu set singkat tiap hari.', icon: 'flag' },
];

/* Ukuran tumpukan (px). Kartu di atas dan bawah adalah kartu aktif yang diperkecil. */
const CARD_H = 116;
const SCALE = 0.9;
const GAP = 10;
const SIDE_H = CARD_H * SCALE;
const STEP = CARD_H / 2 + GAP + SIDE_H / 2; // jarak antar pusat kartu aktif dan tetangganya
const STACK_H = Math.round(2 * (STEP + SIDE_H / 2));

/** Lama tiap kartu tampil sebelum berganti otomatis (ms). */
const AUTOPLAY_MS = 6000;
/** Lama animasi perpindahan kartu (ms), dengan kurva ease-in-out. */
const MOVE_MS = 900;
const EASE_IN_OUT = 'cubic-bezier(0.65, 0, 0.35, 1)';

/** Selisih posisi kartu terhadap kartu aktif, dengan pembungkusan (kartu terakhir berada tepat di atas kartu pertama). */
function offsetOf(index: number, current: number, total: number): number {
  let d = (index - current) % total;
  if (d > total / 2) d -= total;
  if (d < -total / 2) d += total;
  return d;
}

function transformFor(d: number): React.CSSProperties {
  const abs = Math.abs(d);
  if (abs === 0) return { transform: 'translateY(0) scale(1)', opacity: 1, zIndex: 30 };
  if (abs === 1) return { transform: `translateY(${d * STEP}px) scale(${SCALE})`, opacity: 0.85, zIndex: 20 };
  // Kartu yang jauh menyingkir keluar tumpukan sambil memudar.
  return { transform: `translateY(${Math.sign(d) * (STEP + 56)}px) scale(0.7)`, opacity: 0, zIndex: 10, pointerEvents: 'none' };
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

export const XpVerticalCarousel: React.FC = () => {
  const total = SLIDES.length;
  const [current, setCurrent] = useState(0);
  // Berganti otomatis, kecuali pengguna meminta gerakan dikurangi.
  const [autoplay] = useState(() => !prefersReducedMotion());
  // Jeda sementara saat kursor di atas karusel atau fokus keyboard ada di dalamnya, agar teks sempat dibaca.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabHidden, setTabHidden] = useState(() => typeof document !== 'undefined' && document.hidden);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const running = autoplay && !hovered && !focused && !tabHidden;

  const goPrev = () => setCurrent((c) => (c - 1 + total) % total);
  const goNext = () => setCurrent((c) => (c + 1) % total);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setCurrent(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setCurrent(total - 1);
    }
  };

  const arrowButton =
    'w-9 h-9 rounded-xl bg-surface-container-lowest/80 hover:bg-primary-fixed active:bg-primary-fixed border border-outline-variant text-primary flex items-center justify-center transition-colors';
  const motion: React.CSSProperties = { transitionDuration: `${MOVE_MS}ms`, transitionTimingFunction: EASE_IN_OUT };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Hanya fokus keyboard yang menjeda; klik mouse pada tombol tidak membuat karusel berhenti selamanya.
      onFocus={(e) => setFocused((e.target as HTMLElement).matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
      className="relative"
    >
      <div className="relative">
      {/* Kepala: judul, penghitung, dan tombol atas/bawah */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.14em] mb-1">Cara dapat XP</p>
          <h2 className="text-xl sm:text-2xl font-bold leading-tight text-on-surface">Coba Dulu, XP Menyusul.</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">Benar atau salah, setiap usaha tetap dihitung.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-semibold tabular-nums text-on-surface-variant mr-1" aria-hidden="true">
            {current + 1} / {total}
          </span>
          <button type="button" onClick={goPrev} aria-label="Hadiah sebelumnya" className={arrowButton}>
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">keyboard_arrow_up</span>
          </button>
          <button type="button" onClick={goNext} aria-label="Hadiah berikutnya" className={arrowButton}>
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
          </button>
        </div>
      </div>

      {/* Tumpukan kartu vertikal */}
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Karusel Cara Dapat XP"
        tabIndex={0}
        onKeyDown={onKeyDown}
        // overflow-hidden: kartu yang keluar dari tumpukan tidak menutupi judul di atasnya saat berpindah.
        className="relative mt-4 -mx-1 px-1 overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
        style={{ height: STACK_H }}
      >
        {SLIDES.map((slide, index) => {
          const d = offsetOf(index, current, total);
          const active = d === 0;
          return (
            <div
              key={slide.title}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} dari ${total}`}
              // Kartu tetangga hanya kemudahan untuk pengguna mouse/sentuh; pengguna keyboard memakai tombol atas/bawah.
              aria-hidden={!active}
              onClick={active || Math.abs(d) > 1 ? undefined : () => setCurrent(index)}
              className={`absolute inset-x-1 top-1/2 rounded-2xl border transition-[transform,opacity,background-color,border-color,box-shadow] motion-reduce:transition-none will-change-transform ${
                active
                  ? 'bg-surface-container-lowest border-primary/20 shadow-[0_12px_32px_-12px_rgba(0,97,77,0.35)]'
                  : 'bg-surface-container-lowest/60 border-outline-variant/70 backdrop-blur-sm cursor-pointer hover:bg-surface-container-lowest/85'
              }`}
              style={{ height: CARD_H, marginTop: -CARD_H / 2, ...motion, ...transformFor(d) }}
            >
              <div className="h-full flex items-center gap-4 pl-4 pr-3 sm:pl-5 sm:pr-4">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h3
                    className={`text-base sm:text-lg font-bold leading-snug line-clamp-1 transition-colors motion-reduce:transition-none ${
                      active ? 'text-on-surface' : 'text-on-surface-variant'
                    }`}
                    style={motion}
                  >
                    {slide.title}
                  </h3>
                  <p
                    className={`text-sm leading-snug line-clamp-2 transition-colors motion-reduce:transition-none ${
                      active ? 'text-on-surface-variant' : 'text-on-surface-variant/80'
                    }`}
                    style={motion}
                  >
                    {slide.desc}
                  </p>
                  <span
                    className={`inline-flex w-fit mt-0.5 px-2 py-0.5 rounded-lg text-xs font-bold font-code-formula whitespace-nowrap transition-opacity motion-reduce:transition-none ${
                      active ? 'bg-primary/10 text-primary opacity-100' : 'bg-primary/10 text-primary opacity-0'
                    }`}
                    style={motion}
                  >
                    {slide.xp}
                  </span>
                </div>

                {/* Ikon di sisi kanan kartu */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center transition-colors motion-reduce:transition-none ${
                    active ? 'bg-primary text-on-primary' : 'bg-primary-fixed/60 text-primary'
                  }`}
                  style={motion}
                >
                  <span aria-hidden="true" className="material-symbols-outlined text-[30px] sm:text-[34px]">
                    {slide.icon}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bilah waktu: penuh berarti kartu berganti. Berhenti saat kursor atau fokus keyboard ada di karusel. */}
      {autoplay && (
        <div className="mt-4 mx-1 h-1 rounded-full bg-outline-variant/50 overflow-hidden" aria-hidden="true">
          <div
            key={current}
            className="xp-carousel-timer h-full rounded-full bg-primary"
            style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationPlayState: running ? 'running' : 'paused' }}
            onAnimationEnd={goNext}
          />
        </div>
      )}

      {/* Pembaca layar diberi tahu kartu mana yang aktif, tapi tidak saat berganti otomatis agar tidak mengganggu */}
      <p className="sr-only" aria-live={autoplay ? 'off' : 'polite'} aria-atomic="true">
        Hadiah {current + 1} dari {total}: {SLIDES[current].title}, {SLIDES[current].xp}. {SLIDES[current].desc}
      </p>
      </div>
    </div>
  );
};
