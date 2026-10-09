import React, { useState } from 'react';
import { Concept } from '../types';
import { statisticsConcepts } from '../data/concepts';

interface ConceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConceptId?: string | null;
}

export const ConceptModal: React.FC<ConceptModalProps> = ({
  isOpen,
  onClose,
  initialConceptId,
}) => {
  const [activeConceptId, setActiveConceptId] = useState<string>(
    initialConceptId || statisticsConcepts[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync if initialConceptId changes
  React.useEffect(() => {
    if (initialConceptId) {
      setActiveConceptId(initialConceptId);
    }
  }, [initialConceptId]);

  if (!isOpen) return null;

  const currentConcept =
    statisticsConcepts.find((c) => c.id === activeConceptId) || statisticsConcepts[0];

  const filteredConcepts = statisticsConcepts.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.binusContext && c.binusContext.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-surface-container-lowest w-full max-w-3xl rounded-2xl border border-outline-variant/70 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-surface-container flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">menu_book</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block">
                Glosarium Konsep Statistika BINUS
              </span>
              <h2 id="concept-modal-title" className="text-base sm:text-lg font-bold text-on-surface">
                Penjelasan Singkat &amp; Bahasa Manusia
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela penjelasan"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Search & Topic Selector Bar */}
        <div className="p-3 sm:px-5 border-b border-surface-container-high bg-surface-bright flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-outline absolute left-3 top-2.5 text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari konsep statistik (misal: Mean, P-Value, Regresi)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-surface-container-lowest border border-outline-variant/60 rounded-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick pills dropdown / horizontal scroll */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar max-w-full sm:max-w-xs">
            {filteredConcepts.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveConceptId(c.id)}
                className={`text-[11px] px-2 py-1 rounded-md shrink-0 whitespace-nowrap transition-colors ${
                  activeConceptId === c.id
                    ? 'bg-primary text-on-primary font-medium'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {c.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Concept Header */}
          <div className="space-y-1 pb-3 border-b border-surface-container">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-fixed/50 text-primary">
                Konsep Inti
              </span>
              <span className="text-xs text-outline">• Ramah Pemula &amp; Bebas Hafalan Rumus</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              {currentConcept.title}
            </h3>
          </div>

          {/* Bahasa Manusia / Summary */}
          <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-4 sm:p-5 space-y-1.5">
            <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
              <span className="material-symbols-outlined text-lg">psychology</span>
              <span>Penjelasan Inti (Bahasa Manusia)</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
              {currentConcept.summary}
            </p>
          </div>

          {/* Formula Callout (if available) */}
          {currentConcept.formula && (
            <div className="bg-surface-container-lowest border border-primary/25 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  Bentuk Rumus / Notasi
                </span>
                <span className="text-[11px] text-primary bg-primary-fixed/30 px-2 py-0.5 rounded">
                  Pahami logikanya, jangan dihafal buta
                </span>
              </div>
              <div className="font-code-formula text-sm sm:text-base text-primary bg-surface-container-low/60 p-3 rounded-lg border border-outline-variant/40">
                {currentConcept.formula}
              </div>
            </div>
          )}

          {/* Everyday Example */}
          {currentConcept.example && (
            <div className="bg-secondary-fixed/20 border border-secondary-fixed-dim/50 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-secondary font-semibold text-xs sm:text-sm">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lightbulb
                </span>
                <span>Contoh Nyata Sehari-hari</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {currentConcept.example}
              </p>
            </div>
          )}

          {/* BINUS University Relevance */}
          {currentConcept.binusContext && (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
                <span className="material-symbols-outlined text-lg">school</span>
                <span>Konteks Mahasiswa BINUS (Perkuliahan &amp; Skripsi)</span>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                {currentConcept.binusContext}
              </p>
            </div>
          )}

          {/* Other Concepts Quick Carousel */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-2.5">
              Pilih konsep lain ({filteredConcepts.length} tersedia):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredConcepts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveConceptId(c.id)}
                  className={`text-left p-2.5 rounded-lg border transition-all flex items-center justify-between text-xs ${
                    activeConceptId === c.id
                      ? 'bg-primary-fixed/30 border-primary text-primary font-semibold'
                      : 'bg-surface-container-lowest border-outline-variant/50 text-on-surface-variant hover:border-primary/50 hover:bg-surface-container-low'
                  }`}
                >
                  <span className="truncate pr-2">{c.title}</span>
                  <span className="material-symbols-outlined text-[16px] text-outline shrink-0">
                    chevron_right
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-6 border-t border-surface-container bg-surface-container-low/40 flex items-center justify-between text-xs text-outline">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-primary">spa</span>
            <span>Ngerti • Belajar statistika dengan tempo tenang</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-medium transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
