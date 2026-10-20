import React, { useState } from 'react';

interface XpSlide {
  title: string;
  xp: string;
  desc: string;
  icon: string;
}

const SLIDES: XpSlide[] = [
  { title: 'Mencoba soal', xp: '+10 XP', desc: 'Benar atau salah, tetap dihargai.', icon: 'edit_note' },
  { title: 'Jawaban benar', xp: '+15 XP', desc: 'Bonus untuk jawaban tepat.', icon: 'check_circle' },
  { title: 'Cek jawabanmu', xp: '+10 XP', desc: 'Bonus karena kamu memeriksa dulu.', icon: 'fact_check' },
  { title: 'Bonus kecepatan', xp: 'sampai +10 XP', desc: 'Hanya saat mengerjakan, bukan saat mengecek.', icon: 'bolt' },
  { title: 'Baca materi sampai selesai', xp: '+15 XP', desc: 'Selesaikan satu materi.', icon: 'menu_book' },
  { title: 'Daily Quest', xp: '+20 XP', desc: 'Satu set singkat tiap hari.', icon: 'task_alt' },
];

/* Ukuran tumpukan (px). Kartu di atas dan bawah adalah kartu aktif yang diperkecil. */
const CARD_H = 128;
const SCALE = 0.7;
const GAP = 12;
const SIDE_H = CARD_H * SCALE;
const STEP = CARD_H / 2 + GAP + SIDE_H / 2; // jarak antar pusat kartu aktif dan tetangganya
const STACK_H = Math.round(2 * (STEP + SIDE_H / 2));

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
  if (abs === 1) return { transform: `translateY(${d * STEP}px) scale(${SCALE})`, opacity: 1, zIndex: 20 };
  // Kartu yang jauh menyingkir keluar tumpukan sambil memudar.
  return { transform: `translateY(${Math.sign(d) * (STEP + 48)}px) scale(0.5)`, opacity: 0, zIndex: 10, pointerEvents: 'none' };
}

export const XpVerticalCarousel: React.FC = () => {
  const total = SLIDES.length;
  const [current, setCurrent] = useState(0);

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
    'w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/25 text-white flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#00614d_0%,#0e7c63_58%,#2f9a82_100%)] p-4 sm:p-5 text-white shadow-lg">
      {/* Kepala: judul, penghitung, dan tombol atas/bawah */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-primary-fixed text-xs font-semibold uppercase tracking-wider mb-0.5">
            <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
              stars
            </span>
            <span>Sistem Apresiasi Usaha</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Cara Dapat XP</h2>
          <p className="text-xs sm:text-sm text-white/80 mt-0.5">Setiap usaha dihitung.</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold tabular-nums">
            {current + 1} / {total}
          </span>
          <button type="button" onClick={goPrev} aria-label="Hadiah sebelumnya" className={arrowButton}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">keyboard_arrow_up</span>
          </button>
          <button type="button" onClick={goNext} aria-label="Hadiah berikutnya" className={arrowButton}>
            <span aria-hidden="true" className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
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
        className="relative mt-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
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
              className={`absolute left-10 right-0 top-1/2 rounded-2xl border transition-[transform,opacity,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none will-change-transform ${
                active
                  ? 'bg-surface-container-lowest border-transparent shadow-xl'
                  : 'bg-white/15 border-white/25 cursor-pointer hover:bg-white/25'
              }`}
              style={{ height: CARD_H, marginTop: -CARD_H / 2, ...transformFor(d) }}
            >
              {/* Lingkaran ikon yang menonjol keluar dari tepi kiri kartu */}
              <div
                className={`absolute -left-9 top-1/2 -translate-y-1/2 w-[72px] h-[72px] rounded-full flex items-center justify-center transition-colors duration-500 motion-reduce:transition-none ${
                  active ? 'bg-primary-fixed text-primary' : 'bg-white/20 text-white'
                }`}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[34px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {slide.icon}
                </span>
              </div>

              <div className="h-full pl-12 pr-3 py-2.5 sm:pl-14 sm:pr-4 sm:py-3 flex flex-col justify-center gap-1 min-w-0">
                <h3
                  className={`text-[15px] sm:text-lg font-bold leading-snug line-clamp-2 sm:line-clamp-1 transition-colors duration-500 motion-reduce:transition-none ${
                    active ? 'text-on-surface' : 'text-white'
                  }`}
                >
                  {slide.title}
                </h3>
                <p
                  className={`text-[13px] sm:text-sm leading-snug line-clamp-3 sm:line-clamp-2 transition-colors duration-500 motion-reduce:transition-none ${
                    active ? 'text-on-surface-variant' : 'text-white/75'
                  }`}
                >
                  {slide.desc}
                </p>
                <span
                  className={`inline-flex w-fit px-2.5 py-0.5 rounded-lg border text-[11px] sm:text-xs font-extrabold font-code-formula whitespace-nowrap transition-opacity duration-500 motion-reduce:transition-none ${
                    active ? 'bg-primary/10 text-primary border-primary/20 opacity-100' : 'bg-white/10 text-white border-white/20 opacity-0'
                  }`}
                >
                  {slide.xp}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pembaca layar diberi tahu kartu mana yang sedang aktif */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Hadiah {current + 1} dari {total}: {SLIDES[current].title}, {SLIDES[current].xp}. {SLIDES[current].desc}
      </p>
    </div>
  );
};
