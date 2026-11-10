import React, { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { glossaryTerms, type GlossaryTerm } from '../data/glossary';
import { mockTopics } from '../data/mockData';
import { MathFormula } from './MathFormula';

// Glossary terms inside the reading text: underlined, with a small card that shows the definition
// (hover or keyboard focus on a computer, tap on a phone).

interface GlossaryLinkActions {
  /** Topic of the page being read. */
  topicId: string;
  /** "Baca penjelasan lengkap": jump to the section that explains a term of this topic. */
  onOpenSection?: (term: GlossaryTerm) => void;
  /** "Lihat di Glosarium": open the glossary pop-up at this term. */
  onOpenGlossary?: (term: GlossaryTerm) => void;
}

export const GlossaryLinkContext = createContext<GlossaryLinkActions>({ topicId: '' });

// ---------------------------------------------------------------- matching
const stripParens = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The phrases the material may use for a term: its name, its Indonesian name and `textMatches`. */
function phrasesOf(term: GlossaryTerm): string[] {
  if (term.linkInText === false) return [];
  const names = [term.term, term.alias]
    .filter((p): p is string => Boolean(p))
    .map(stripParens)
    .filter((p) => p.length > 2 && !/[&,]/.test(p));
  // The material writes both "peluang" and "probabilitas".
  const probabilitas = names.filter((p) => /peluang/i.test(p)).map((p) => p.replace(/peluang/gi, 'Probabilitas'));
  return [...names, ...probabilitas, ...(term.textMatches ?? [])];
}

let matcher: { re: RegExp; byPhrase: Map<string, GlossaryTerm[]> } | null = null;

function getMatcher() {
  if (matcher) return matcher;
  const byPhrase = new Map<string, GlossaryTerm[]>();
  for (const term of glossaryTerms) {
    for (const phrase of phrasesOf(term)) {
      const key = phrase.toLowerCase();
      const list = byPhrase.get(key) ?? [];
      if (!list.includes(term)) list.push(term);
      byPhrase.set(key, list);
    }
  }
  // Longest first, so "Distribusi Normal Baku" wins over "Distribusi Normal"; whole words only.
  const alternatives = [...byPhrase.keys()].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'giu');
  matcher = { re, byPhrase };
  return matcher;
}

/**
 * Returns a function for RichText's `linkText` that underlines glossary terms. Each term is underlined
 * only where it first appears on the page, so the text doesn't fill up with underlines. When a phrase
 * belongs to several terms (e.g. "Sampling Error"), the one from the page's topic wins.
 * Create one per render of the page, and call it in reading order.
 */
export function createGlossaryLinker(topicId: string) {
  const seen = new Set<string>();
  return (text: string, sectionId: string): React.ReactNode => {
    const { re, byPhrase } = getMatcher();
    const nodes: React.ReactNode[] = [];
    let last = 0;
    for (const match of text.matchAll(re)) {
      const candidates = byPhrase.get(match[0].toLowerCase());
      const term = candidates?.find((t) => t.topicId === topicId) ?? candidates?.[0];
      if (!term || seen.has(term.id)) continue;
      seen.add(term.id);
      const start = match.index ?? 0;
      nodes.push(text.slice(last, start));
      nodes.push(
        <GlossaryTermLink key={start} term={term} sectionId={sectionId}>
          {match[0]}
        </GlossaryTermLink>
      );
      last = start + match[0].length;
    }
    if (nodes.length === 0) return text;
    nodes.push(text.slice(last));
    return nodes;
  };
}

// ---------------------------------------------------------------- term + card
const topicTitle = (id: string) => mockTopics.find((t) => t.id === id)?.title ?? '';
const CARD_WIDTH = 320;
const GUTTER = 12;

// Only one card is open at a time.
let closeOpenCard: (() => void) | null = null;

interface GlossaryTermLinkProps {
  term: GlossaryTerm;
  /** Section the underlined word is in. */
  sectionId: string;
  children: React.ReactNode;
}

export const GlossaryTermLink: React.FC<GlossaryTermLinkProps> = ({ term, sectionId, children }) => {
  const { topicId, onOpenSection, onOpenGlossary } = useContext(GlossaryLinkContext);
  // 'hover' closes when the pointer leaves; 'pinned' (tap/click) stays until closed.
  const [mode, setMode] = useState<'hover' | 'pinned' | null>(null);
  const [position, setPosition] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | undefined>(undefined);
  const cardId = useId();

  const clearTimer = () => window.clearTimeout(timerRef.current);
  const close = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setMode(null);
  }, []);
  const open = (next: 'hover' | 'pinned') => {
    clearTimer();
    if (closeOpenCard && closeOpenCard !== close) closeOpenCard();
    closeOpenCard = close;
    setMode(next);
  };
  const openSoon = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => open('hover'), 200);
  };
  const closeSoon = () => {
    clearTimer();
    if (mode !== 'pinned') timerRef.current = window.setTimeout(close, 150);
  };

  useEffect(
    () => () => {
      window.clearTimeout(timerRef.current);
      if (closeOpenCard === close) closeOpenCard = null;
    },
    [close]
  );

  // Place the card under the word (above it when there's no room), inside the screen; follow scrolling.
  useLayoutEffect(() => {
    if (!mode) return;
    const place = () => {
      const button = buttonRef.current;
      if (!button) return;
      const rect = button.getClientRects()[0] ?? button.getBoundingClientRect();
      const cardHeight = cardRef.current?.offsetHeight ?? 180;
      const width = Math.min(CARD_WIDTH, window.innerWidth - GUTTER * 2);
      const left = Math.min(Math.max(GUTTER, rect.left), window.innerWidth - width - GUTTER);
      const above = rect.bottom + 8 + cardHeight > window.innerHeight && rect.top - 8 - cardHeight > 0;
      setPosition({ top: above ? rect.top - 8 - cardHeight : rect.bottom + 8, left, above });
    };
    place();
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
    };
  }, [mode]);

  // A pinned card closes on a tap outside it or Escape.
  useEffect(() => {
    if (!mode) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!buttonRef.current?.contains(target) && !cardRef.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      close();
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [mode, close]);

  const canReadMore = Boolean(onOpenSection && term.topicId === topicId && term.sectionId && term.sectionId !== sectionId);
  const otherTopic = term.topicId !== topicId;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={mode !== null}
        aria-controls={mode ? cardId : undefined}
        onPointerEnter={(e) => e.pointerType === 'mouse' && openSoon()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
        onFocus={() => mode === null && open('hover')}
        onBlur={(e) => {
          if (mode === 'hover' && !cardRef.current?.contains(e.relatedTarget as Node)) close();
        }}
        onClick={() => (mode === 'pinned' ? close() : open('pinned'))}
        className={`inline underline decoration-dotted decoration-primary/70 decoration-[1.5px] underline-offset-[5px] rounded-sm cursor-help hover:text-primary hover:decoration-solid transition-colors ${
          mode ? 'text-primary decoration-solid' : ''
        }`}
      >
        {children}
      </button>
      {mode &&
        createPortal(
          <div
            ref={cardRef}
            id={cardId}
            role="dialog"
            aria-label={term.term}
            onPointerEnter={(e) => e.pointerType === 'mouse' && clearTimer()}
            onPointerLeave={(e) => e.pointerType === 'mouse' && closeSoon()}
            style={{
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: Math.min(CARD_WIDTH, window.innerWidth - GUTTER * 2),
            }}
            className="fixed z-50 rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-4 custom-floating-shadow text-left space-y-2"
          >
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary mt-0.5 shrink-0">dictionary</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-on-surface leading-snug">{term.term}</p>
                {term.alias && <p className="text-xs text-on-surface-variant">{term.alias}</p>}
              </div>
              {mode === 'pinned' && (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Tutup"
                  className="-mt-1 -mr-1 w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">{term.definition}</p>
            {term.formula && (
              <div className="text-xs text-on-surface bg-surface-container-low rounded-lg px-2.5 py-1.5">
                <MathFormula text={term.formula} display />
              </div>
            )}
            {otherTopic && (
              <p className="text-xs text-outline">Dari topik: {topicTitle(term.topicId)}</p>
            )}
            {(canReadMore || onOpenGlossary) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
                {canReadMore && (
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onOpenSection?.(term);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Baca penjelasan lengkap
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                )}
                {onOpenGlossary && (
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onOpenGlossary(term);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Lihat di Glosarium
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  </button>
                )}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
