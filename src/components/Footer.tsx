import React from 'react';
import { ActivePage } from '../types';

interface FooterProps {
  setActivePage: (page: ActivePage) => void;
  onOpenFormula: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  setActivePage,
  onOpenFormula,
  onOpenHelp,
  onOpenPrivacy,
}) => {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center w-full py-8 md:py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <button
            onClick={() => setActivePage('landing')}
            className="text-lg font-semibold text-primary flex items-center justify-center sm:justify-start gap-1.5 hover:opacity-90"
          >
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
            <span>Ngerti</span>
          </button>
          <span className="hidden sm:inline text-outline-variant">|</span>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md">
            © 2025 Ngerti. Platform belajar statistika tanpa cemas untuk mahasiswa BINUS University.
          </p>
        </div>

        <nav aria-label="Navigasi Footer" className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <button
            onClick={() => setActivePage('topics')}
            className="text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Topik Belajar
          </button>
          <button
            onClick={() => setActivePage('practice')}
            className="text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Latihan Mandiri
          </button>
          <button
            onClick={onOpenFormula}
            className="text-primary font-medium hover:underline transition-colors duration-200 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">menu_book</span>
            <span>Panduan Formula</span>
          </button>
          <button
            onClick={onOpenPrivacy}
            className="text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Privasi
          </button>
          <button
            onClick={onOpenHelp}
            className="text-on-surface-variant hover:text-primary transition-colors duration-200"
          >
            Bantuan
          </button>
        </nav>
      </div>
    </footer>
  );
};
