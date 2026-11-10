import React from 'react';
import { GlossaryBrowser } from '../components/GlossaryBrowser';
import { glossaryTerms, type GlossaryTerm } from '../data/glossary';
import { mockTopics } from '../data/mockData';

interface GlossaryPageProps {
  /** "Baca di materi": open the topic's reading page at the term's section. */
  onOpenTerm: (term: GlossaryTerm) => void;
}

export const GlossaryPage: React.FC<GlossaryPageProps> = ({ onOpenTerm }) => (
  <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full space-y-8 pb-24">
    <div className="pb-6 border-b border-outline-variant/60">
      <div className="flex items-center gap-1.5 text-primary text-xs font-semibold uppercase tracking-wider mb-1">
        <span className="material-symbols-outlined text-[16px]">dictionary</span>
        <span>Glosarium</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">Kamus Istilah Statistika</h1>
      <p className="text-sm sm:text-base text-on-surface-variant mt-1 max-w-2xl">
        {glossaryTerms.length} istilah dari {mockTopics.length} topik, dijelaskan dengan bahasa sehari-hari. Lupa artinya? Cari di sini, lalu buka
        bagian materinya.
      </p>
    </div>

    <GlossaryBrowser onOpenSection={onOpenTerm} autoFocusSearch />
  </div>
);
