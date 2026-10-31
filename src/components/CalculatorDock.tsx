import React, { Suspense, lazy, useState } from 'react';

// The calculator itself downloads on first open; afterwards it stays mounted (hidden) so the
// expression and answer survive closing and reopening.
const CalculatorPanel = lazy(() => import('./CalculatorPanel').then((m) => ({ default: m.CalculatorPanel })));

/** Sticky tab on the right edge of the screen that opens the scientific calculator. */
export const CalculatorDock: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const toggle = () => {
    setLoaded(true);
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="calculator-panel"
        aria-label={open ? 'Tutup kalkulator' : 'Buka kalkulator ilmiah'}
        title="Kalkulator ilmiah"
        style={{ viewTransitionName: 'calculator-tab' }}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 pl-2 pr-1.5 py-3 rounded-l-xl shadow-lg transition-colors ${
          open ? 'bg-primary-container text-on-primary' : 'bg-primary text-on-primary hover:bg-primary-container'
        }`}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[22px]">
          {open ? 'close' : 'calculate'}
        </span>
        <span aria-hidden="true" className="hidden sm:block text-xs font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180">
          Kalkulator
        </span>
      </button>

      {loaded && (
        <Suspense fallback={null}>
          <CalculatorPanel open={open} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
};
