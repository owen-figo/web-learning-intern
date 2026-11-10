import React, { useEffect } from 'react';
import { GlossaryBrowser } from './GlossaryBrowser';
import type { GlossaryTerm } from '../data/glossary';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Start filtered to this topic (the one being read or practised). */
  topicId?: string | null;
  /** Start with this search (e.g. the term that was clicked in the text). */
  initialQuery?: string;
  onOpenSection?: (term: GlossaryTerm) => void;
  canOpen?: (term: GlossaryTerm) => boolean;
}

/** The glossary as a pop-up, so students can look up a term without leaving the page. */
export const GlossaryModal: React.FC<GlossaryModalProps> = ({ isOpen, onClose, topicId, initialQuery, onOpenSection, canOpen }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="glossary-modal-title"
        className="relative bg-surface-container-lowest w-full max-w-3xl rounded-2xl border border-outline-variant/70 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-5 border-b border-surface-container flex items-center justify-between gap-3 bg-surface-container-low/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">dictionary</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider block">Glosarium</span>
              <h2 id="glossary-modal-title" className="text-base sm:text-lg font-bold text-on-surface">
                Kamus Istilah Statistika
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup glosarium"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <div className="p-4 sm:p-5 overflow-y-auto overscroll-contain">
          <GlossaryBrowser initialTopicId={topicId} initialQuery={initialQuery} onOpenSection={onOpenSection} canOpen={canOpen} compact autoFocusSearch />
        </div>
      </div>
    </div>
  );
};
