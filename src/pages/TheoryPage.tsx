import React, { useState, useEffect, useRef } from 'react';
import { ActivePage, TheoryContent } from '../types';

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
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isCompleted) {
      setHasReachedBottom(true);
      setMarkedDone(true);
      return;
    }

    // IntersectionObserver for sentinel element
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasReachedBottom(true);
        }
      },
      { root: null, rootMargin: '0px 0px 100px 0px', threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    // Fallback scroll listener for reliable triggering
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 150;
      if (scrollPosition >= threshold) {
        setHasReachedBottom(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check in case content fits viewport
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isCompleted]);

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

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Reading Navigation Bar */}
      <header className="sticky top-0 z-20 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/60 py-3 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('topics')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Kembali ke Topik</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>~{theoryContent.estimatedReadMinutes} menit baca</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <span>+{theoryContent.completionXp} XP</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Reading Canvas (Textbook Single-Column Layout) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-36">
        {/* Article Meta Header */}
        <header className="space-y-3 mb-10 pb-6 border-b border-outline-variant/60">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs font-semibold tracking-wide uppercase">
            <span>📖 Materi Teori Fondasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface leading-tight">
            {theoryContent.topicTitle}
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Bacalah santai tanpa beban kuis atau ujian. Pahami logikanya secara runtut agar kamu siap menghadapi penyusunan metodologi penelitian Bab 3.
          </p>
        </header>

        {/* Sections Stream */}
        <article className="space-y-10">
          {theoryContent.sections.map((section, idx) => (
            <section key={section.id} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-surface-container">
                <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">
                  {section.heading}
                </h2>
              </div>

              {/* Body text with comfortable line height */}
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                {section.body}
              </p>

              {/* Formula Callout Box if present */}
              {section.formula && (
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/60 shadow-xs space-y-2">
                  <div className="font-code-formula text-sm sm:text-base font-semibold text-primary">
                    {section.formula}
                  </div>
                  {section.formulaNote && (
                    <div className="text-xs text-on-surface-variant border-l-2 border-primary-container pl-3 py-0.5 leading-relaxed">
                      <strong className="text-on-surface">Catatan Penenang:</strong> {section.formulaNote}
                    </div>
                  )}
                </div>
              )}

              {/* Examples in distinct callout style */}
              {section.examples && section.examples.length > 0 && (
                <div className="space-y-3 pt-1">
                  {section.examples.map((example, exIdx) => (
                    <div
                      key={exIdx}
                      className="p-4 rounded-xl bg-surface-container-low/70 border border-outline-variant/50 space-y-1.5 transition-colors hover:border-primary-container"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <span className="material-symbols-outlined text-[18px]">lightbulb</span>
                        <span>Contoh: {example.label}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                        {example.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </article>

        {/* Bottom Sentinel to detect completion of reading */}
        <div ref={sentinelRef} className="h-8 w-full mt-8" aria-hidden="true" />
      </main>

      {/* Sticky Bottom Completion Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/60 py-3.5 px-4 sm:px-6 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant text-center sm:text-left">
            {markedDone ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Materi ini telah kamu pelajari di sesi ini.</span>
              </span>
            ) : hasReachedBottom ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-base">task_alt</span>
                <span>Kamu telah membaca seluruh materi sampai akhir.</span>
              </span>
            ) : (
              <span className="text-outline flex items-center justify-center sm:justify-start gap-1">
                <span className="material-symbols-outlined text-base animate-bounce">arrow_downward</span>
                <span>Baca sampai akhir untuk membuka tombol penyelesaian</span>
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {isSuccess ? (
              <div className="py-2.5 px-5 rounded-lg bg-primary-fixed text-primary font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs">
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
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
