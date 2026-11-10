import React, { useEffect, useMemo, useRef, useState } from 'react';
import { glossaryTerms, type GlossaryTerm } from '../data/glossary';
import { mockTopics } from '../data/mockData';
import { MathFormula } from './MathFormula';

interface GlossaryBrowserProps {
  /** Topic filter to start with (null = all topics). */
  initialTopicId?: string | null;
  initialQuery?: string;
  /** Shows "Baca di materi" on terms for which `canOpen` is true (default: all). */
  onOpenSection?: (term: GlossaryTerm) => void;
  canOpen?: (term: GlossaryTerm) => boolean;
  /** Single-column layout for the pop-up. */
  compact?: boolean;
  autoFocusSearch?: boolean;
}

const sortedTopics = [...mockTopics].sort((a, b) => a.order - b.order);

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * A row that scrolls sideways: arrow buttons and faded edges show there's more, and the mouse wheel
 * scrolls it sideways while the pointer is over it (until it reaches the end).
 */
const ChipScroller: React.FC<{ label: string; onWhite: boolean; children: React.ReactNode }> = ({ label, onWhite, children }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const update = () =>
      setEdges({ left: row.scrollLeft > 2, right: row.scrollLeft + row.clientWidth < row.scrollWidth - 2 });
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpad sideways swipe: native
      const max = row.scrollWidth - row.clientWidth;
      if ((e.deltaY < 0 && row.scrollLeft <= 0) || (e.deltaY > 0 && row.scrollLeft >= max - 1)) return;
      e.preventDefault();
      row.scrollLeft += e.deltaY;
    };
    update();
    row.addEventListener('scroll', update, { passive: true });
    row.addEventListener('wheel', onWheel, { passive: false });
    const observer = new ResizeObserver(update);
    observer.observe(row);
    return () => {
      row.removeEventListener('scroll', update);
      row.removeEventListener('wheel', onWheel);
      observer.disconnect();
    };
  }, []);

  const scrollBy = (dir: 1 | -1) => {
    const row = rowRef.current;
    row?.scrollBy({ left: dir * row.clientWidth * 0.7, behavior: 'smooth' });
  };
  const arrow = (dir: 1 | -1) => (
    <div
      className={`absolute inset-y-0 ${dir === 1 ? 'right-0 pl-10 bg-linear-to-l' : 'left-0 pr-10 bg-linear-to-r'} ${
        onWhite ? 'from-surface-container-lowest via-surface-container-lowest/90' : 'from-background via-background/90'
      } to-transparent flex items-center pointer-events-none`}
    >
      <button
        type="button"
        onClick={() => scrollBy(dir)}
        aria-label={dir === 1 ? 'Topik berikutnya' : 'Topik sebelumnya'}
        tabIndex={-1}
        className="pointer-events-auto w-8 h-8 rounded-full border border-outline-variant/70 bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:border-primary/50 shadow-xs flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">{dir === 1 ? 'chevron_right' : 'chevron_left'}</span>
      </button>
    </div>
  );

  return (
    <div className="relative -mx-1">
      <div
        ref={rowRef}
        role="group"
        aria-label={label}
        className="flex gap-2 overflow-x-auto no-scrollbar px-1 pb-0.5"
      >
        {children}
      </div>
      {edges.left && arrow(-1)}
      {edges.right && arrow(1)}
    </div>
  );
};

/** Search + topic filter over the glossary, grouped by topic in course order. */
export const GlossaryBrowser: React.FC<GlossaryBrowserProps> = ({
  initialTopicId = null,
  initialQuery = '',
  onOpenSection,
  canOpen = () => true,
  compact = false,
  autoFocusSearch = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [topicId, setTopicId] = useState<string | null>(initialTopicId);

  const groups = useMemo(() => {
    const q = normalize(query.trim());
    const matches = glossaryTerms.filter(
      (t) =>
        (!topicId || t.topicId === topicId) &&
        (!q || normalize(`${t.term} ${t.alias ?? ''} ${t.definition}`).includes(q))
    );
    // Terms whose name matches come before those that only mention the word in their definition.
    const nameMatch = (t: GlossaryTerm) => (q && normalize(`${t.term} ${t.alias ?? ''}`).includes(q) ? 0 : 1);
    return sortedTopics
      .map((topic) => ({
        topic,
        terms: matches.filter((t) => t.topicId === topic.id).sort((x, y) => nameMatch(x) - nameMatch(y)),
      }))
      .filter((g) => g.terms.length > 0);
  }, [query, topicId]);
  const total = groups.reduce((n, g) => n + g.terms.length, 0);

  const chip = (active: boolean) =>
    `shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? 'bg-primary text-on-primary border-primary'
        : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/70 hover:border-primary/50 hover:text-on-surface'
    }`;

  return (
    <div className="space-y-5">
      {/* Search & topic filter */}
      <div className="space-y-3">
        <label className="relative block">
          <span className="sr-only">Cari istilah</span>
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-outline absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={autoFocusSearch}
            placeholder="Cari istilah, misalnya median, peluang bersyarat, standard error…"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm text-on-surface placeholder:text-outline/70 border border-outline-variant bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        <ChipScroller label="Filter topik" onWhite={compact}>
          <button type="button" aria-pressed={!topicId} onClick={() => setTopicId(null)} className={chip(!topicId)}>
            Semua topik
          </button>
          {sortedTopics.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={topicId === t.id}
              onClick={() => setTopicId(t.id)}
              title={t.title}
              className={chip(topicId === t.id)}
            >
              {t.order}. {t.title}
            </button>
          ))}
        </ChipScroller>
        <p className="text-xs text-on-surface-variant" aria-live="polite">
          {total} istilah{query.trim() ? ` untuk "${query.trim()}"` : ''}
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant p-8 text-center space-y-1">
          <span aria-hidden="true" className="material-symbols-outlined text-[28px] text-outline">search_off</span>
          <p className="text-sm font-semibold text-on-surface">Istilah tidak ditemukan</p>
          <p className="text-xs text-on-surface-variant">Coba kata lain, atau pilih "Semua topik".</p>
        </div>
      ) : (
        groups.map(({ topic, terms }) => (
          <section key={topic.id} aria-labelledby={`glossary-${topic.id}`} className="space-y-3">
            <h2 id={`glossary-${topic.id}`} className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <span className="w-6 h-6 rounded-lg bg-primary-fixed text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {topic.order}
              </span>
              <span>{topic.title}</span>
            </h2>
            <div className={`grid grid-cols-1 gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
              {terms.map((t) => (
                <article
                  key={t.id}
                  id={`term-${t.id}`}
                  className="rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 flex flex-col gap-2"
                >
                  <header>
                    <h3 className="text-sm sm:text-base font-bold text-on-surface leading-snug">{t.term}</h3>
                    {t.alias && <p className="text-xs text-primary font-medium">{t.alias}</p>}
                  </header>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t.definition}</p>
                  {t.formula && (
                    <div className="px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs sm:text-sm text-on-surface">
                      <MathFormula text={t.formula} display />
                    </div>
                  )}
                  {t.example && (
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      <span className="font-semibold text-on-surface">Contoh: </span>
                      {t.example}
                    </p>
                  )}
                  {onOpenSection && t.sectionId && canOpen(t) && (
                    <button
                      type="button"
                      onClick={() => onOpenSection(t)}
                      className="mt-auto self-start inline-flex items-center gap-1 pt-1 text-xs font-semibold text-primary hover:underline underline-offset-2"
                    >
                      <span>Baca di materi</span>
                      <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
};
