import React, { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { ActivePage, TheoryContent, TheorySection } from '../types';
import { ConceptExplainer } from '../components/ConceptExplainer';
import { FormulaStepCard } from '../components/FormulaStepCard';
import { MathFormula, MathSymbol } from '../components/MathFormula';
import { PomodoroButton } from '../components/PomodoroButton';
import { mockTopics } from '../data/mockData';
import { RichText, stripMarkers } from '../components/RichText';
import { GlossaryLinkContext, createGlossaryLinker } from '../components/GlossaryText';
import { DailyExercise, type DailyCheckResult } from '../components/DailyExercise';
import type { GlossaryTerm } from '../data/glossary';

// Step pictures are downloaded on demand (they are only needed on the reading page).
const StepVisual = lazy(() => import('../components/StepVisuals').then((m) => ({ default: m.StepVisual })));
// The glossary pop-up downloads the first time it is opened.
const GlossaryModal = lazy(() => import('../components/GlossaryModal').then((m) => ({ default: m.GlossaryModal })));

const LazyStepVisual: React.FC<{ type: string; step: number }> = (props) => (
  <Suspense fallback={<div className="h-24 rounded-xl bg-surface-container-low animate-pulse" />}>
    <StepVisual {...props} />
  </Suspense>
);

interface TheoryPageProps {
  theoryContent: TheoryContent;
  onComplete: (xp: number) => void;
  setActivePage: (page: ActivePage) => void;
  isCompleted?: boolean;
  /** Open the page scrolled to this section (e.g. from a glossary term). */
  initialSectionId?: string | null;
  /** Signed-in student's id (Latihan Harian progress is kept per account). */
  userId?: string | null;
  /** Latihan Harian answer checked (XP, streak, saved answer). */
  onDailyResult?: (result: DailyCheckResult & { selected: number }) => void;
}

export const TheoryPage: React.FC<TheoryPageProps> = ({
  theoryContent,
  onComplete,
  setActivePage,
  isCompleted = false,
  initialSectionId,
  userId,
  onDailyResult,
}) => {
  const [hasReachedBottom, setHasReachedBottom] = useState<boolean>(isCompleted);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [markedDone, setMarkedDone] = useState<boolean>(isCompleted);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    theoryContent.sections[0]?.id || ''
  );
  const [readProgressPercent, setReadProgressPercent] = useState<number>(isCompleted ? 100 : 0);

  const [glossaryOpen, setGlossaryOpen] = useState<boolean>(false);
  // Opened from an underlined word: the glossary starts at that term.
  const [glossaryTerm, setGlossaryTerm] = useState<GlossaryTerm | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocScrollRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);

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

  const scrollToSection = (sectionId: string, behavior: ScrollBehavior = 'smooth') => {
    const targetEl = sectionRefs.current[sectionId];
    if (targetEl) {
      const yOffset = -90; // offset for sticky navbar
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior });
    }
  };

  // Opened from a glossary term: jump straight to its section (after App's scroll-to-top). Pictures
  // above it load lazily and push it down, so keep it pinned while the page settles, until the
  // student scrolls themselves.
  useEffect(() => {
    if (!initialSectionId) return;
    const pin = () => scrollToSection(initialSectionId, 'auto');
    const raf = requestAnimationFrame(pin);
    const resize = new ResizeObserver(pin);
    if (articleRef.current) resize.observe(articleRef.current);
    const stop = () => {
      resize.disconnect();
      window.clearTimeout(timer);
      ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.removeEventListener(e, stop));
    };
    const timer = window.setTimeout(stop, 3000);
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.addEventListener(e, stop, { passive: true }));
    return () => {
      cancelAnimationFrame(raf);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSectionId]);

  // The Daftar Isi scrolls on its own; keep the section being read visible in it.
  useEffect(() => {
    const box = tocScrollRef.current;
    const item = box?.querySelector<HTMLElement>(`[data-section-id="${activeSectionId}"]`);
    if (!box || !item) return;
    const margin = 8;
    // Positions inside the list (items sit in nested, positioned lists, so offsetTop isn't enough).
    const inBox = (el: Element) => el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    // For a chapter's first section, bring the chapter title into view too.
    const li = item.closest('li');
    const anchor = li && li === li.parentElement?.querySelector('li') ? (li.parentElement?.parentElement ?? item) : item;
    const top = inBox(anchor);
    const bottom = inBox(item) + item.offsetHeight;
    if (top < box.scrollTop + margin) {
      box.scrollTo({ top: top - margin, behavior: 'smooth' });
    } else if (bottom > box.scrollTop + box.clientHeight - margin) {
      box.scrollTo({ top: bottom - box.clientHeight + margin, behavior: 'smooth' });
    }
  }, [activeSectionId]);

  // XP is awarded as the student lands on the topic list, so the navbar can show it arriving.
  // If they leave before the redirect, it is awarded on unmount instead.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const xpAwardedRef = useRef(false);
  const redirectTimerRef = useRef<number | null>(null);
  const awardCompletion = () => {
    if (xpAwardedRef.current) return;
    xpAwardedRef.current = true;
    onCompleteRef.current(theoryContent.completionXp);
  };
  useEffect(
    () => () => {
      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
        awardCompletion();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleFinishReading = () => {
    if (!hasReachedBottom || markedDone) return;

    setMarkedDone(true);
    setIsSuccess(true);

    // Let the check animation play, then go back to the topic list.
    redirectTimerRef.current = window.setTimeout(() => {
      redirectTimerRef.current = null;
      awardCompletion();
      setActivePage('topics');
    }, 1800);
  };

  // Glossary terms in the text are underlined where they first appear on the page.
  const linkTerms = createGlossaryLinker(theoryContent.topicId);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      {/* Top Reading Navigation Bar */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/60 py-3 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActivePage('topics')}
            aria-label="Kembali ke Topik"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-on-surface-variant hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>
              <span className="hidden sm:inline">Kembali ke </span>Topik
            </span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden min-[360px]:inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>
                ~{mockTopics.find((tp) => tp.id === theoryContent.topicId)?.estimatedReadMinutes ?? 15}
                <span className="sm:hidden"> mnt</span>
                <span className="hidden sm:inline"> menit baca</span>
              </span>
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold">
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span>+{theoryContent.completionXp} XP</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setGlossaryTerm(null);
                setGlossaryOpen(true);
              }}
              aria-label="Glosarium"
              className="inline-flex items-center gap-1 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">dictionary</span>
              <span className="hidden sm:inline">Glosarium</span>
            </button>
            <PomodoroButton />
          </div>
        </div>
      </header>

      {/* Main Container - 3-Zone Layout on Desktop */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-36">
        {/* Article Meta Header (Spans cleanly across) */}
        {(() => {
          const currentTopic = mockTopics.find((t) => t.id === theoryContent.topicId);
          return (
            <header className="mb-8 pb-6 border-b border-outline-variant/60">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/30 text-primary text-xs font-semibold tracking-wide uppercase">
                  <span className="material-symbols-outlined text-[16px]">menu_book</span>
                  <span>Materi Wajib • Buku Teks Interaktif</span>
                </span>
                <span className="text-xs text-on-surface-variant/80 font-medium">
                  {currentTopic
                    ? `${currentTopic.subCategory === 'deskriptif' ? 'Statistika Deskriptif' : 'Statistika Inferensial'} • ${currentTopic.badge}`
                    : 'Fondasi Statistika'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface leading-tight">
                <RichText text={theoryContent.topicTitle} />
              </h1>
              <p className="mt-2 text-sm sm:text-base text-on-surface-variant max-w-3xl leading-relaxed">
                <RichText
                  text={
                    currentTopic?.description ||
                    'Pelajari materi ini dengan santai tanpa kuis atau ujian. XP diperoleh setelah menyelesaikan bacaan.'
                  }
                />
              </p>
            </header>
          );
        })()}

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
                  title={stripMarkers(section.heading)}
                  aria-label={stripMarkers(section.heading)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center bg-black/15">
                    {idx + 1}
                  </span>
                  <span>
                    <RichText text={section.heading.split('(')[0].trim()} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Desktop Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT RAIL (~20% = 3 cols): Table of Contents & Reading Progress */}
          {/* Capped to the space between the sticky header and the completion bar; the section list
              scrolls inside it, so the wheel over the Daftar Isi scrolls the list, not the material. */}
          <aside className="hidden lg:flex lg:col-span-3 sticky top-24 flex-col gap-4 max-h-[calc(100vh-11.5rem)]">
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 shadow-xs flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-surface-container shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px] text-primary">toc</span>
                  <span>Daftar Isi</span>
                </div>
                <span className="text-xs text-on-surface-variant font-medium">
                  {theoryContent.sections.length} Bagian
                </span>
              </div>

              {/* Navigation list: chapters (the sections' `group`) with a timeline of their sections.
                  Topics without groups show one plain timeline. Sections before the one being read
                  count as passed. */}
              <div ref={tocScrollRef} className="toc-scroll relative min-h-0 overflow-y-auto overscroll-contain -mx-1 px-1">
              {(() => {
                const activeIdx = Math.max(0, theoryContent.sections.findIndex((s) => s.id === activeSectionId));
                const groups: { name: string | null; sections: { section: TheorySection; globalIdx: number }[] }[] = [];
                theoryContent.sections.forEach((section, globalIdx) => {
                  const name = section.group ?? null;
                  const last = groups[groups.length - 1];
                  if (last && last.name === name) last.sections.push({ section, globalIdx });
                  else groups.push({ name, sections: [{ section, globalIdx }] });
                });
                let chapterNo = 0;

                return (
                  <nav aria-label="Daftar isi" className="space-y-1 pb-1">
                    {groups.map((grp, gIdx) => {
                      const first = grp.sections[0].globalIdx;
                      const lastIdx = grp.sections[grp.sections.length - 1].globalIdx;
                      const state = lastIdx < activeIdx ? 'done' : first <= activeIdx ? 'current' : 'next';
                      const isSummary = !!grp.name && /summary|rangkuman/i.test(grp.name);
                      if (grp.name && !isSummary) chapterNo += 1;

                      return (
                        <div key={gIdx} className={grp.name && gIdx > 0 ? 'pt-2' : ''}>
                          {grp.name && (
                            <div className="flex items-center gap-2.5 px-1.5 py-1.5">
                              <span
                                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                                  state === 'done'
                                    ? 'bg-primary text-on-primary'
                                    : state === 'current'
                                      ? 'bg-primary-fixed text-on-primary-fixed-variant ring-2 ring-primary/30'
                                      : 'bg-surface-container text-on-surface-variant'
                                }`}
                                aria-hidden="true"
                              >
                                {state === 'done' ? (
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                ) : isSummary ? (
                                  <span className="material-symbols-outlined text-[16px]">summarize</span>
                                ) : (
                                  chapterNo
                                )}
                              </span>
                              <div className="min-w-0">
                                <p
                                  className={`text-[13px] font-semibold leading-snug ${
                                    state === 'next' ? 'text-on-surface-variant' : 'text-on-surface'
                                  }`}
                                >
                                  <RichText text={grp.name.replace(/^\d+\.\s*/, '')} />
                                </p>
                                <p className="text-[11px] text-outline">{grp.sections.length} bagian</p>
                              </div>
                            </div>
                          )}

                          {/* Timeline: the rail lines up under the chapter badge. */}
                          <ol className={`relative ${grp.name ? 'ml-[19px] pl-3' : 'ml-[7px] pl-3'}`}>
                            <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-surface-container-high" />
                            {grp.sections.map(({ section, globalIdx }) => {
                              const isActive = globalIdx === activeIdx;
                              const isPassed = globalIdx < activeIdx;
                              return (
                                <li key={section.id} className="relative">
                                  <span
                                    aria-hidden="true"
                                    className={`absolute rounded-full transition-all ${
                                      isActive
                                        ? 'top-[10px] -left-[17px] w-2.5 h-2.5 bg-primary ring-4 ring-primary/15'
                                        : isPassed
                                          ? 'top-[12px] -left-[15px] w-1.5 h-1.5 bg-primary/70'
                                          : 'top-[12px] -left-[15px] w-1.5 h-1.5 bg-outline-variant'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    data-section-id={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    title={stripMarkers(section.heading)}
                                    aria-current={isActive ? 'location' : undefined}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] leading-snug transition-colors flex items-baseline gap-2 ${
                                      isActive
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : isPassed
                                          ? 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
                                          : 'text-on-surface-variant/90 hover:text-on-surface hover:bg-surface-container-low'
                                    }`}
                                  >
                                    <span className={`text-[11px] tabular-nums shrink-0 w-4 ${isActive ? 'text-primary' : 'text-outline'}`}>
                                      {globalIdx + 1}
                                    </span>
                                    <span className="line-clamp-2">
                                      <RichText text={grp.name ? section.heading.replace(/^\d+\.\s*/, '') : section.heading} />
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      );
                    })}
                  </nav>
                );
              })()}
              </div>

              {/* Reading Progress indicator */}
              <div className="mt-4 pt-3 border-t border-surface-container shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">
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

            {/* Quick reading reassurance tip (only on tall screens, so the Daftar Isi keeps its room) */}
            <div className="hidden [@media(min-height:900px)]:block bg-primary/5 border border-primary/20 rounded-2xl p-3.5 text-xs text-on-surface-variant space-y-1.5 shrink-0">
              <div className="flex items-center gap-1.5 font-semibold text-primary text-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Belajar Santai &amp; Terarah</span>
              </div>
              <p className="text-xs leading-relaxed text-on-surface-variant/90">
                Materi bacaan murni gaya buku teks tanpa kuis atau ujian. Gulir ke bawah hingga akhir untuk mengklaim +{theoryContent.completionXp} XP dan membuka topik berikutnya.
              </p>
            </div>
          </aside>

          {/* RIGHT COLUMN (9 cols): Main Reading Content */}
          <main className="lg:col-span-9 space-y-8">
            <GlossaryLinkContext.Provider
              value={{
                topicId: theoryContent.topicId,
                onOpenSection: (term) => term.sectionId && scrollToSection(term.sectionId),
                onOpenGlossary: (term) => {
                  setGlossaryTerm(term);
                  setGlossaryOpen(true);
                },
              }}
            >
            <article ref={articleRef} className="space-y-8">
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
                      <span className="text-xs font-bold tracking-wider uppercase text-primary">
                        Bagian {idx + 1} dari {theoryContent.sections.length}
                      </span>
                      <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight leading-snug">
                        <RichText text={section.heading} />
                      </h2>
                    </div>
                  </div>

                  {/* Body Paragraph */}
                  <p className="text-base sm:text-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                    <RichText text={section.body} linkText={(t) => linkTerms(t, section.id)} />
                  </p>

                  {/* TERMS: one card listing the section's key terms. Each row: the term (with the name in
                      brackets shown as a subtitle) on the left, its meaning and an example on the right. */}
                  {section.terms && section.terms.length > 0 && (
                    <div className="@container rounded-2xl border border-outline-variant/60 bg-surface-container-lowest overflow-hidden">
                      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-primary-fixed/25 border-b border-outline-variant/40">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[18px]">dictionary</span>
                          <span>Definisi &amp; Konsep Kunci</span>
                        </div>
                        <span className="text-xs text-on-surface-variant">{section.terms.length} istilah</span>
                      </div>
                      <dl className="divide-y divide-outline-variant/40">
                        {section.terms.map((t, tIdx) => {
                          const named = t.term.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
                          return (
                            <div
                              key={tIdx}
                              className="grid grid-cols-1 @xl:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] @3xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] gap-x-6 gap-y-2 px-4 sm:px-5 py-4"
                            >
                              <dt className="flex items-start gap-2.5">
                                <span aria-hidden="true" className="mt-[7px] w-1.5 h-4 rounded-full bg-primary shrink-0" />
                                <span className="min-w-0">
                                  <span className="block text-sm sm:text-base font-bold text-on-surface leading-snug">
                                    <RichText text={named ? named[1] : t.term} />
                                  </span>
                                  {named && (
                                    <span className="block mt-0.5 text-xs font-medium text-on-surface-variant">{named[2]}</span>
                                  )}
                                </span>
                              </dt>
                              <dd className="space-y-2 pl-4 @xl:pl-0">
                                <p className="text-sm sm:text-[15px] text-on-surface leading-relaxed">
                                  <RichText text={t.definition} />
                                </p>
                                {t.example && (
                                  <p className="flex items-start gap-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                                    <span className="shrink-0 inline-flex items-center gap-1 mt-px px-1.5 py-0.5 rounded-md bg-secondary-fixed/60 text-on-secondary-fixed-variant text-[11px] font-semibold">
                                      <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                                      Contoh
                                    </span>
                                    <span className="min-w-0">
                                      <RichText text={t.example} />
                                    </span>
                                  </p>
                                )}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </div>
                  )}

                  {/* SCENARIO IF PRESENT */}
                  {section.scenario && (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line">
                      <RichText text={section.scenario} linkText={(t) => linkTerms(t, section.id)} />
                    </div>
                  )}

                  {/* FORMULA OR MEMORY AID BOX */}
                  {(section.formula || (section.formulas && section.formulas.length > 0)) && (
                    <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/25 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[20px]">functions</span>
                        <span>Rumus &amp; Notasi Matematis</span>
                      </div>

                      {section.formula && (
                        <div className="bg-surface-container-lowest px-4 py-3.5 rounded-xl border border-outline-variant/60 text-sm sm:text-base text-black leading-relaxed shadow-2xs">
                          <MathFormula text={section.formula} display textClassName="font-semibold" />
                        </div>
                      )}

                      {/* Multiple formulas list if available */}
                      {section.formulas && section.formulas.length > 0 && (
                        <div className="space-y-3">
                          {section.formulas.map((fItem, fIdx) => (
                            <div
                              key={fIdx}
                              className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/60 space-y-2"
                            >
                              <div className="font-bold text-xs text-primary">
                                <RichText text={fItem.label} />
                              </div>
                              <div className="text-sm sm:text-base text-black">
                                <MathFormula text={fItem.formula} display textClassName="font-semibold" />
                              </div>
                              {fItem.note && (
                                <p className="text-xs text-on-surface-variant leading-relaxed">
                                  <RichText text={fItem.note} />
                                </p>
                              )}
                              {fItem.symbols && fItem.symbols.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 border-t border-outline-variant/30">
                                  {fItem.symbols.map((sym, sIdx) => (
                                    <div
                                      key={sIdx}
                                      className="flex items-center gap-1.5 text-xs text-on-surface-variant"
                                    >
                                      <MathSymbol
                                        symbol={sym.symbol}
                                        className="math-inline font-semibold text-black bg-surface-container-high/60 px-1 py-0.5 rounded text-xs shrink-0"
                                      />
                                      <span>
                                        ={' '}
                                        <RichText text={sym.meaning} />
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formula Symbol Legend */}
                      {section.formulaSymbols && section.formulaSymbols.length > 0 && (
                        <div className="pt-2 border-t border-primary/20 text-xs space-y-1.5">
                          <div className="font-bold text-xs text-black uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                            <span>Keterangan Simbol:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {section.formulaSymbols.map((sym, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-2 text-xs text-black bg-surface-container-lowest px-2.5 py-1 rounded-lg border border-outline-variant/30"
                              >
                                <MathSymbol
                                  symbol={sym.symbol}
                                  className="math-inline font-semibold text-black bg-surface-container-high/60 px-1.5 py-0.5 rounded shrink-0"
                                />
                                <span className="font-medium">
                                  ={' '}
                                  <RichText text={sym.meaning} />
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {section.formulaNote && (
                        <div className="text-xs text-black font-medium flex items-start gap-2 pt-1 border-l-2 border-primary pl-3">
                          <span className="font-bold text-black shrink-0">Catatan:</span>
                          <span className="leading-relaxed text-black">
                            <RichText text={section.formulaNote} />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* HOW TO MAKE / STEPS LIST */}
                  {((section.steps && section.steps.length > 0) ||
                    (section.howToMake && section.howToMake.steps && section.howToMake.steps.length > 0)) && (
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                        <span>
                          <RichText
                            text={
                              section.stepsLabel ||
                              section.howToMake?.title ||
                              'Cara Menghitung'
                            }
                          />
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {(section.steps || section.howToMake?.steps || []).map((st) => (
                          <div
                            key={st.step}
                            className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low/90 border border-outline-variant/60 flex items-start gap-3 hover:border-primary/40 transition-colors"
                          >
                            <div className="w-6 h-6 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                              {st.step}
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-black">
                                <RichText text={st.title} />
                              </h4>
                              <p className="text-xs sm:text-sm text-black font-medium leading-relaxed">
                                <RichText text={st.instruction} linkText={(t) => linkTerms(t, section.id)} />
                              </p>
                              {(st as { substituted?: string }).substituted && (
                                <p className="text-xs sm:text-sm font-mono text-black bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-outline-variant/40 leading-relaxed">
                                  <span className="font-sans font-bold text-primary">Contoh: </span>
                                  <RichText text={(st as { substituted?: string }).substituted} />
                                </p>
                              )}
                              {st.stepVisual ? (
                                <div className="pt-1">
                                  <LazyStepVisual type={st.stepVisual.type} step={st.stepVisual.step} />
                                </div>
                              ) : (
                                section.steps && (
                                  <div className="pt-1">
                                    <FormulaStepCard
                                      section={section}
                                      stepNumber={st.step}
                                      total={section.steps.length}
                                      stepText={`${st.title} ${st.instruction} ${(st as { substituted?: string }).substituted ?? ''}`}
                                    />
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GROUPED HOW-TO-MAKE STEPS (one step list per chart / method) */}
                  {section.howToMakeGroups && section.howToMakeGroups.length > 0 && (
                    <div className="space-y-4 pt-2">
                      {section.howToMakeGroups.map((group, gIdx) => (
                        <div
                          key={gIdx}
                          className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-3.5 sm:p-4 space-y-3"
                        >
                          <div className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[20px]">{group.icon || 'format_list_numbered'}</span>
                            <span>
                              <RichText text={group.title} />
                            </span>
                          </div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {group.steps.map((st) => (
                              <div
                                key={st.step}
                                className="p-3.5 sm:p-4 rounded-xl bg-surface-container-low/90 border border-outline-variant/60 flex items-start gap-3 hover:border-primary/40 transition-colors"
                              >
                                <div className="w-6 h-6 rounded-lg bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                  {st.step}
                                </div>
                                <div className="space-y-1 flex-1 min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold text-black">
                                    <RichText text={st.title} />
                                  </h4>
                                  <p className="text-xs sm:text-sm text-black font-medium leading-relaxed">
                                    <RichText text={st.instruction} linkText={(t) => linkTerms(t, section.id)} />
                                  </p>
                                  {st.substituted && (
                                    <p className="text-xs sm:text-sm font-mono text-black bg-surface-container-lowest px-2.5 py-1.5 rounded-lg border border-outline-variant/40 leading-relaxed whitespace-pre-line">
                                      <span className="font-sans font-bold text-primary">Contoh: </span>
                                      <RichText text={st.substituted} />
                                    </p>
                                  )}
                                  {st.stepVisual && (
                                    <div className="pt-1">
                                      <LazyStepVisual type={st.stepVisual.type} step={st.stepVisual.step} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* SUMMARY TABLE (For Final Section Ringkasan Rumus) */}
                  {section.summaryTable && (
                    <div className="space-y-3 pt-2">
                      <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="bg-surface-container text-black font-bold border-b-2 border-outline-variant/80">
                              {section.summaryTable.columns.map((col, cIdx) => (
                                <th key={cIdx} className="py-3 px-3 text-black font-extrabold text-xs">
                                  <RichText text={col} />
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-surface-container">
                            {section.summaryTable.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-surface-container-low/60 transition-colors">
                                <td className="py-2.5 px-3 font-bold text-black">
                                  <RichText text={row.ukuran} />
                                </td>
                                <td className="py-2.5 px-3 text-black text-xs sm:text-sm">
                                  <MathFormula text={row.sampel} display className="math-cell" textClassName="font-medium" />
                                </td>
                                <td className="py-2.5 px-3 text-black text-xs sm:text-sm bg-surface-container-low/40">
                                  {row.populasi ? <MathFormula text={row.populasi} display className="math-cell" textClassName="font-medium" /> : '—'}
                                </td>
                                {row.catatan && (
                                  <td className="py-2.5 px-3 text-xs text-black font-medium leading-relaxed">
                                    <RichText text={row.catatan} />
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                        <span className="material-symbols-outlined text-[16px] text-amber-700">
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
                              <span className="material-symbols-outlined text-[20px]">menu_book</span>
                              <span>
                                <RichText text={example.label} />
                              </span>
                            </div>
                            <div className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 space-y-1">
                              <RichText text={example.text} linkText={(t) => linkTerms(t, section.id)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ))}
            </article>
            </GlossaryLinkContext.Provider>

            {/* Latihan Harian (only topics whose chapter has Latihan Soal) */}
            <DailyExercise topicId={theoryContent.topicId} userId={userId} onResult={onDailyResult} />

            {/* Bottom Sentinel to detect completion of reading */}
            <div ref={sentinelRef} className="h-8 w-full mt-4" aria-hidden="true" />
          </main>

        </div>
      </div>

      {/* Sticky Bottom Completion Bar (Spans max-w-7xl to align with content) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/60 py-3.5 px-4 sm:px-6 lg:px-10 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant text-center sm:text-left flex items-center gap-2">
            {isSuccess ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-[16px]">celebration</span>
                <span>Hebat! Satu topik tuntas. Membuka daftar topik…</span>
              </span>
            ) : markedDone ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Materi ini telah kamu pelajari di sesi ini. Kamu siap melangkah ke topik berikutnya!</span>
              </span>
            ) : hasReachedBottom ? (
              <span className="text-primary font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-[16px]">task_alt</span>
                <span>Kamu sudah membaca sampai akhir. Klik Selesai Belajar untuk klaim XP-mu.</span>
              </span>
            ) : (
              <span className="text-outline flex items-center justify-center sm:justify-start gap-1.5">
                <span className="material-symbols-outlined text-[16px] animate-bounce text-primary">
                  arrow_downward
                </span>
                <span>
                  Gulir ke bawah untuk menyelesaikan ({readProgressPercent}% terbaca)
                </span>
              </span>
            )}
          </div>

          <div className="w-full sm:w-auto">
            {markedDone && !isSuccess ? (
              <div className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-primary-fixed/50 text-primary text-sm font-semibold flex items-center justify-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <span>Sudah Selesai Dipelajari</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFinishReading}
                disabled={!hasReachedBottom || isSuccess}
                title={hasReachedBottom ? undefined : 'Baca materi sampai akhir untuk menyelesaikannya'}
                className={`relative w-full sm:w-auto py-2.5 pl-3 pr-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors duration-300 ${
                  isSuccess
                    ? 'complete-pop bg-primary text-on-primary cursor-default'
                    : hasReachedBottom
                      ? 'bg-primary hover:bg-primary-container text-on-primary active:scale-95 shadow-sm'
                      : 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                }`}
              >
                {isSuccess && (
                  <span aria-hidden="true" className="complete-ring pointer-events-none absolute inset-0 rounded-xl border-2 border-primary" />
                )}
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    isSuccess
                      ? 'bg-on-primary text-primary'
                      : hasReachedBottom
                        ? 'border-2 border-on-primary/80 animate-gentle-pulse'
                        : 'border-2 border-outline'
                  }`}
                >
                  {isSuccess && (
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path className="check-draw" d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  )}
                </span>
                <span aria-live="polite">{isSuccess ? 'Materi Tuntas!' : 'Selesai Belajar'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isSuccess || hasReachedBottom ? 'bg-on-primary/15' : 'bg-surface-container-high'
                  }`}
                >
                  +{theoryContent.completionXp} XP
                </span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {glossaryOpen && (
        <Suspense fallback={null}>
          <GlossaryModal
            isOpen
            onClose={() => setGlossaryOpen(false)}
            topicId={glossaryTerm?.topicId ?? theoryContent.topicId}
            initialQuery={glossaryTerm?.term}
            canOpen={(term) => term.topicId === theoryContent.topicId}
            onOpenSection={(term) => {
              setGlossaryOpen(false);
              if (term.sectionId) scrollToSection(term.sectionId);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
