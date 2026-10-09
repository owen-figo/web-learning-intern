import React, { useState, useEffect, useRef } from 'react';
import { ActivePage, TheoryContent, TheorySection } from '../types';
import { ConceptExplainer } from '../components/ConceptExplainer';

interface TheoryPageProps {
  theoryContent: TheoryContent;
  onComplete: (xp: number) => void;
  setActivePage: (page: ActivePage) => void;
  isCompleted?: boolean;
}

export const TheoryPage: React.FC<TheoryPageProps> = ({
  theoryContent,
  onComplete,
  setActivePage,
  isCompleted = false,
}) => {
  const [hasReachedBottom, setHasReachedBottom] = useState<boolean>(isCompleted);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [markedDone, setMarkedDone] = useState<boolean>(isCompleted);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    theoryContent.sections[0]?.id || ''
  );
  const [readProgressPercent, setReadProgressPercent] = useState<number>(isCompleted ? 100 : 0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Track overall scroll progress & active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollY / docHeight) * 100)) : 100;
      setReadProgressPercent(progress);

      // Determine active section based on scroll offset
      const offsetTop = 160;
      let currentId = theoryContent.sections[0]?.id || '';

      for (const section of theoryContent.sections) {
        const el = sectionRefs.current[section.id];
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetTop) {
            currentId = section.id;
          }
        }
      }

      if (currentId) {
        setActiveSectionId(currentId);
      }

      // Check if near bottom
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 160;
      if (scrollPosition >= threshold) {
        setHasReachedBottom(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [theoryContent.sections]);

  // Bottom intersection observer
  useEffect(() => {
    if (isCompleted) {
      setHasReachedBottom(true);
      setMarkedDone(true);
      setReadProgressPercent(100);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasReachedBottom(true);
          setReadProgressPercent(100);
        }
      },
      { root: null, rootMargin: '0px 0px 120px 0px', threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isCompleted]);

  const scrollToSection = (sectionId: string) => {
    const targetEl = sectionRefs.current[sectionId];
    if (targetEl) {
      const yOffset = -90; // offset for sticky navbar
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleFinishReading = () => {
    if (!hasReachedBottom || markedDone) return;

    setMarkedDone(true);
    setIsSuccess(true);
    onComplete(theoryContent.completionXp);

    // Auto-navigate back to topics after ~1.5 seconds
    setTimeout(() => {
      setActivePage('topics');
    }, 1500);
  };

  // Find currently active section object
  const activeSection: TheorySection =
    theoryContent.sections.find((s) => s.id === activeSectionId) || theoryContent.sections[0];

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Reading Navigation Bar */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/60 py-3 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('topics')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Topik</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>~{theoryContent.estimatedReadMinutes} menit baca</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold">
              <span
                className="material-symbols-outlined text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span>+{theoryContent.completionXp} XP</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container - 3-Zone Layout on Desktop */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-36">
        {/* Article Meta Header (Spans cleanly across) */}
        <header className="mb-8 pb-6 border-b border-outline-variant/60">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-xs font-semibold tracking-wide uppercase">
              <span className="material-symbols-outlined text-[15px]">menu_book</span>
              <span>Materi Wajib • Buku Teks Interaktif</span>
            </span>
            <span className="text-xs text-on-surface-variant/80 font-medium">
              Fondasi Statistika Deskriptif &amp; Pengumpulan Data
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface leading-tight">
            {theoryContent.topicTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
            Kenali jenis variabel, populasi dan sampel, metode sampling, serta jenis error sebelum mulai menghitung. Bacalah dengan santai tanpa kuis atau ujian.
          </p>
        </header>

        {/* Mobile / Tablet Horizontal TOC Bar (Hidden on desktop lg) */}
        <div className="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mr-1">
              Bagian:
            </span>
            {theoryContent.sections.map((section, idx) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center bg-black/15">
                    {idx + 1}
                  </span>
                  <span>{section.heading.split('(')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT RAIL (~20% = 3 cols): Table of Contents & Reading Progress */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-surface-container">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-primary">toc</span>
                  <span>Daftar Isi</span>
                </div>
                <span className="text-[11px] text-on-surface-variant font-medium">
                  {theoryContent.sections.length} Bagian
                </span>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1">
                {theoryContent.sections.map((section, idx) => {
                  const isActive = activeSectionId === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-start gap-2.5 group ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold border-l-3 border-primary pl-2.5 shadow-2xs'
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md text-[11px] font-bold shrink-0 flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="leading-snug pt-0.5 line-clamp-2">
                        {section.heading}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Reading Progress indicator */}
              <div className="mt-4 pt-3 border-t border-surface-container">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">
                      auto_stories
                    </span>
                    Progres Membaca
                  </span>
                  <span className="text-xs font-bold text-primary">{readProgressPercent}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-200"
                    style={{ width: `${readProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick reading reassurance tip */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3.5 text-xs text-on-surface-variant space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-primary text-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Belajar Santai &amp; Terarah</span>
              </div>
              <p className="text-[11px] leading-relaxed text-on-surface-variant/90">
                Materi bacaan murni gaya buku teks tanpa kuis atau ujian. Gulir ke bawah hingga akhir untuk mengklaim +{theoryContent.completionXp} XP dan membuka topik berikutnya.
              </p>
            </div>
          </aside>

          {/* CENTER COLUMN (~55% = 6 cols): Main Reading Content */}
          <main className="lg:col-span-6 space-y-8">
            <article className="space-y-8">
              {theoryContent.sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 sm:p-7 shadow-xs space-y-5 transition-shadow hover:shadow-sm"
                >
                  {/* Section Title Header */}
                  <div className="flex items-start gap-3 pb-3 border-b border-surface-container">
                    <div className="w-8 h-8 rounded-xl bg-primary-fixed text-primary font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                      {idx + 1}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-primary">
                        Bagian {idx + 1} dari {theoryContent.sections.length}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight leading-snug">
                        {section.heading}
                      </h2>
                    </div>
                  </div>

                  {/* Body Paragraph */}
                  <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed">
                    {section.body}
                  </p>

                  {/* TERMS LIST (Structured Definition Cards) */}
                  {section.terms && section.terms.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">dictionary</span>
                        <span>Definisi &amp; Konsep Kunci</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {section.terms.map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className="p-4 rounded-xl bg-surface-container-low/80 border border-outline-variant/60 space-y-2 hover:border-primary/40 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-primary"></span>
                              <strong className="text-xs sm:text-sm font-bold text-on-surface">
                                {t.term}
                              </strong>
                            </div>
                            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pl-4 border-l-2 border-primary/20">
                              {t.definition}
                            </p>
                            {t.example && (
                              <div className="text-[11px] sm:text-xs text-on-surface/90 bg-surface-container-lowest p-2.5 rounded-lg border border-outline-variant/40 flex items-start gap-1.5">
                                <span className="material-symbols-outlined text-[15px] text-amber-600 shrink-0 mt-0.5">
                                  lightbulb
                                </span>
                                <span>
                                  <strong className="text-on-surface">Contoh:</strong> {t.example}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* FORMULA OR MEMORY AID BOX */}
                  {section.formula && (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/25 p-4 sm:p-5 shadow-2xs space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[17px]">tips_and_updates</span>
                        <span>Pola Logika &amp; Jembatan Ingatan</span>
                      </div>
                      <div className="bg-surface-container-lowest px-4 py-3 rounded-lg border border-outline-variant/60 text-xs sm:text-sm font-semibold text-primary text-center sm:text-left overflow-x-auto font-sans leading-relaxed">
                        {section.formula}
                      </div>
                      {section.formulaNote && (
                        <div className="text-xs text-on-surface-variant flex items-start gap-2 pt-1 border-l-2 border-primary pl-3">
                          <span className="font-semibold text-on-surface shrink-0">Catatan Memahami:</span>
                          <span className="leading-relaxed">{section.formulaNote}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* INTERACTIVE VISUAL INLINE (At Full Column Width) */}
                  {section.visualType && (
                    <div className="pt-2">
                      <ConceptExplainer type={section.visualType} />
                    </div>
                  )}

                  {/* WORKED EXAMPLES / SCENARIO DISCUSSIONS (Answers visible) */}
                  {section.examples && section.examples.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[16px] text-amber-600">
                          task_alt
                        </span>
                        <span>Pembahasan Lengkap Soal Kasus</span>
                      </div>
                      <div className="space-y-4">
                        {section.examples.map((example, exIdx) => (
                          <div
                            key={exIdx}
                            className="p-5 rounded-2xl bg-surface-container-low/90 border border-outline-variant/60 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary">
                              <span className="material-symbols-outlined text-[18px]">menu_book</span>
                              <span>{example.label}</span>
                            </div>
                            <div className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 space-y-1">
                              {example.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </article>

            {/* Bottom Sentinel to detect completion of reading */}
            <div ref={sentinelRef} className="h-8 w-full mt-4" aria-hidden="true" />
          </main>

          {/* RIGHT RAIL (~25% = 3 cols): Sticky "Poin Penting" Panel for active section */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-24 space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-bold flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Poin Penting
                    </h3>
                    <p className="text-[11px] text-on-surface-variant truncate max-w-[170px]">
                      {activeSection.heading}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Content: Terms of active section or highlights */}
              {activeSection.terms && activeSection.terms.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">label_important</span>
                    <span>Istilah Kunci Bagian Ini</span>
                  </div>
                  <div className="space-y-2">
                    {activeSection.terms.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs space-y-1"
                      >
                        <div className="font-bold text-on-surface text-[11px]">{t.term}</div>
                        <p className="text-[10px] text-on-surface-variant leading-tight line-clamp-3">
                          {t.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Formula or Memory Aid if available */}
              {activeSection.formula && (
                <div className="space-y-2 pt-2 border-t border-surface-container">
                  <div className="text-[11px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                    <span>Intisari Logika</span>
                  </div>
                  <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-xs text-on-surface leading-relaxed font-medium">
                    {activeSection.formula}
                  </div>
                </div>
              )}

              {/* Examples Summary if present */}
              {activeSection.examples && activeSection.examples.length > 0 && !activeSection.terms && (
                <div className="space-y-2 pt-2 border-t border-surface-container">
                  <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">task_alt</span>
                    <span>Soal &amp; Solusi</span>
                  </div>
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px] text-on-surface-variant leading-relaxed">
                    Tersedia {activeSection.examples.length} studi kasus nyata dengan pembahasan lengkap empat komponen: Populasi, Sampel, Parameter, dan Statistik.
                  </div>
                </div>
              )}

              {/* Tip regarding research thesis */}
              <div className="pt-3 border-t border-surface-container flex items-center gap-2 text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px] text-primary shrink-0">
                  school
                </span>
                <span>Materi pondasi metodologi penelitian kuantitatif</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Bottom Completion Bar (Spans max-w-7xl to align with content) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/60 py-3.5 px-4 sm:px-6 lg:px-10 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant text-center sm:text-left flex items-center gap-2">
            {markedDone ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Materi ini telah kamu pelajari di sesi ini. Kamu siap melangkah ke topik berikutnya!</span>
              </span>
            ) : hasReachedBottom ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Kamu telah membaca seluruh materi sampai akhir. Silakan klaim XP belajarmu.</span>
              </span>
            ) : (
              <span className="text-outline flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-base animate-bounce text-primary">
                  arrow_downward
                </span>
                <span>
                  Gulir ke bawah untuk menyelesaikan ({readProgressPercent}% terbaca)
                </span>
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {isSuccess ? (
              <div className="py-2.5 px-5 rounded-lg bg-primary-fixed text-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs">
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span>Materi selesai dipelajari! (+{theoryContent.completionXp} XP)</span>
              </div>
            ) : markedDone ? (
              <button
                type="button"
                disabled
                className="w-full sm:w-auto py-2.5 px-5 rounded-lg bg-surface-container text-outline text-xs sm:text-sm font-medium cursor-default flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base text-primary">verified</span>
                <span>Materi Selesai Dipelajari</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishReading}
                disabled={!hasReachedBottom}
                className={`w-full sm:w-auto py-2.5 px-6 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-xs ${
                  hasReachedBottom
                    ? 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
                    : 'bg-surface-container text-outline cursor-not-allowed opacity-60'
                }`}
              >
                <span>Tandai Selesai &amp; Dapat +{theoryContent.completionXp} XP</span>
                <span className="material-symbols-outlined text-base">check_circle</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
