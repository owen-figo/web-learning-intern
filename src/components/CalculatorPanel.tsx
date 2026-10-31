import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AngleMode, CalcError, closeBrackets, evaluate, formatResult } from '../lib/calculator';

interface CalculatorPanelProps {
  open: boolean;
  onClose: () => void;
}

type KeyKind = 'num' | 'fn' | 'op' | 'eq' | 'clear' | 'toggle';

interface KeyDef {
  label: string;
  /** Label when INV is on (if different). */
  invLabel?: string;
  /** Text inserted into the expression. */
  insert?: string;
  invInsert?: string;
  action?: 'clear' | 'back' | 'equals' | 'inv';
  kind: KeyKind;
  aria?: string;
}

// 5 columns × 7 rows. INV swaps the function keys to their inverse/companion.
const KEYS: KeyDef[] = [
  { label: 'INV', action: 'inv', kind: 'toggle', aria: 'Fungsi kebalikan' },
  { label: 'sin', invLabel: 'sin⁻¹', insert: 'sin(', invInsert: 'sin⁻¹(', kind: 'fn' },
  { label: 'cos', invLabel: 'cos⁻¹', insert: 'cos(', invInsert: 'cos⁻¹(', kind: 'fn' },
  { label: 'tan', invLabel: 'tan⁻¹', insert: 'tan(', invInsert: 'tan⁻¹(', kind: 'fn' },
  { label: 'AC', action: 'clear', kind: 'clear', aria: 'Hapus semua' },

  { label: 'ln', invLabel: 'eˣ', insert: 'ln(', invInsert: 'e^(', kind: 'fn' },
  { label: 'log', invLabel: '10ˣ', insert: 'log(', invInsert: '10^(', kind: 'fn' },
  { label: '√', invLabel: '∛', insert: '√(', invInsert: '∛(', kind: 'fn', aria: 'Akar kuadrat' },
  { label: 'x²', invLabel: 'x³', insert: '^2', invInsert: '^3', kind: 'fn', aria: 'Kuadrat' },
  { label: '⌫', action: 'back', kind: 'clear', aria: 'Hapus satu karakter' },

  { label: 'xʸ', invLabel: 'x⁻¹', insert: '^', invInsert: '^(−1)', kind: 'fn', aria: 'Pangkat' },
  { label: '(', insert: '(', kind: 'fn' },
  { label: ')', insert: ')', kind: 'fn' },
  { label: 'n!', invLabel: '%', insert: '!', invInsert: '%', kind: 'fn', aria: 'Faktorial' },
  { label: '÷', insert: '÷', kind: 'op', aria: 'Bagi' },

  { label: 'nCr', insert: 'C', kind: 'fn', aria: 'Kombinasi' },
  { label: '7', insert: '7', kind: 'num' },
  { label: '8', insert: '8', kind: 'num' },
  { label: '9', insert: '9', kind: 'num' },
  { label: '×', insert: '×', kind: 'op', aria: 'Kali' },

  { label: 'nPr', insert: 'P', kind: 'fn', aria: 'Permutasi' },
  { label: '4', insert: '4', kind: 'num' },
  { label: '5', insert: '5', kind: 'num' },
  { label: '6', insert: '6', kind: 'num' },
  { label: '−', insert: '−', kind: 'op', aria: 'Kurang' },

  { label: 'π', insert: 'π', kind: 'fn', aria: 'Pi' },
  { label: '1', insert: '1', kind: 'num' },
  { label: '2', insert: '2', kind: 'num' },
  { label: '3', insert: '3', kind: 'num' },
  { label: '+', insert: '+', kind: 'op', aria: 'Tambah' },

  { label: 'e', insert: 'e', kind: 'fn', aria: 'Bilangan Euler' },
  { label: '0', insert: '0', kind: 'num' },
  { label: '.', insert: '.', kind: 'num', aria: 'Titik desimal' },
  { label: 'Ans', insert: 'Ans', kind: 'fn', aria: 'Hasil sebelumnya' },
  { label: '=', action: 'equals', kind: 'eq', aria: 'Sama dengan' },
];

// After "=", these keys continue from the previous answer instead of starting a new expression.
const CONTINUES_ANSWER = ['+', '−', '×', '÷', '^', '!', '%', 'C', 'P'];

const KEY_STYLE: Record<KeyKind, string> = {
  num: 'bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-low text-base font-semibold',
  fn: 'bg-surface-container-low text-on-surface hover:bg-surface-container text-sm font-medium',
  op: 'bg-primary-fixed/60 text-primary hover:bg-primary-fixed text-lg font-semibold',
  eq: 'bg-primary text-on-primary hover:bg-primary-container text-lg font-bold',
  clear: 'bg-secondary-fixed/50 text-on-secondary-fixed hover:bg-secondary-fixed text-sm font-semibold',
  toggle: 'text-xs font-bold tracking-wide',
};

export const CalculatorPanel: React.FC<CalculatorPanelProps> = ({ open, onClose }) => {
  const [expr, setExpr] = useState('');
  const [mode, setMode] = useState<AngleMode>('deg');
  const [inv, setInv] = useState(false);
  const [ans, setAns] = useState(0);
  // After "=": the finished expression and its result.
  const [last, setLast] = useState<{ expr: string; result: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Live result while typing (only when the expression is already valid).
  const preview = useMemo(() => {
    if (!expr || last) return '';
    try {
      return formatResult(evaluate(closeBrackets(expr), mode, ans));
    } catch {
      return '';
    }
  }, [expr, mode, ans, last]);

  const insert = (text: string) => {
    setError(null);
    if (last) {
      setLast(null);
      setExpr(CONTINUES_ANSWER.some((op) => text.startsWith(op)) ? 'Ans' + text : text);
      return;
    }
    setExpr((e) => e + text);
  };

  const backspace = () => {
    setError(null);
    if (last) {
      setLast(null);
      setExpr('');
      return;
    }
    setExpr((e) => {
      // Remove a whole function name or constant at once (e.g. "sin⁻¹(" or "Ans").
      const tail = ['sin⁻¹(', 'cos⁻¹(', 'tan⁻¹(', 'sin(', 'cos(', 'tan(', 'ln(', 'log(', '√(', '∛(', 'Ans'].find((t) => e.endsWith(t));
      return e.slice(0, e.length - (tail?.length ?? 1));
    });
  };

  const clearAll = () => {
    setExpr('');
    setLast(null);
    setError(null);
  };

  const equals = () => {
    if (!expr || last) return;
    const full = closeBrackets(expr);
    try {
      const value = evaluate(full, mode, ans);
      setAns(value);
      setLast({ expr: full, result: formatResult(value) });
      setError(null);
    } catch (err) {
      setError(err instanceof CalcError ? err.message : 'Ekspresi tidak valid');
    }
  };

  const press = (k: KeyDef) => {
    if (k.action === 'inv') return setInv((v) => !v);
    if (k.action === 'clear') return clearAll();
    if (k.action === 'back') return backspace();
    if (k.action === 'equals') return equals();
    const text = inv && k.invInsert ? k.invInsert : k.insert;
    if (text) insert(text);
    if (inv && k.invInsert) setInv(false); // INV applies to one key, like a handheld calculator
  };

  // Keyboard input while the panel is open (ignored while typing in a form field).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const map: Record<string, string> = { '*': '×', '/': '÷', '-': '−', '+': '+', '^': '^', '(': '(', ')': ')', '!': '!', '%': '%', '.': '.', ',': '.' };
      if (/^[0-9]$/.test(e.key)) insert(e.key);
      else if (map[e.key]) insert(map[e.key]);
      else if (e.key === 'Enter' || e.key === '=') equals();
      else if (e.key === 'Backspace') backspace();
      else if (e.key === 'Delete') clearAll();
      else if (e.key === 'Escape') onClose();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Keep the end of a long expression in view.
  useEffect(() => {
    const el = displayRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [expr, last]);

  // Move focus into the panel when it opens so keyboard and screen reader users land there.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <div
      ref={panelRef}
      id="calculator-panel"
      role="dialog"
      aria-label="Kalkulator ilmiah"
      tabIndex={-1}
      hidden={!open}
      style={{ viewTransitionName: 'calculator-panel' }}
      className="calc-panel-in fixed z-40 inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-auto sm:right-16 sm:top-1/2 sm:-translate-y-1/2 sm:w-[340px] bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-2xl p-3.5 outline-none"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-bold text-on-surface flex items-center gap-1.5">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-primary">calculate</span>
          Kalkulator Ilmiah
        </h2>
        <div className="flex items-center gap-1.5">
          <div role="radiogroup" aria-label="Satuan sudut" className="flex rounded-lg bg-surface-container-low p-0.5">
            {(['deg', 'rad'] as AngleMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={mode === m}
                onClick={() => setMode(m)}
                className={`px-2 py-1 rounded-md text-xs font-bold uppercase transition-colors ${
                  mode === m ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup kalkulator"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      </div>

      {/* Display */}
      <div className="rounded-xl bg-surface-container-low border border-outline-variant/60 px-3 py-2.5 mb-3 text-right">
        <div className="h-5 text-xs text-on-surface-variant font-code-formula truncate" aria-hidden={!last}>
          {last ? `${last.expr} =` : inv ? 'INV aktif' : ' '}
        </div>
        <div
          ref={displayRef}
          className="font-code-formula text-2xl font-semibold text-on-surface whitespace-nowrap overflow-x-auto [scrollbar-width:none]"
          aria-live="polite"
        >
          {last ? last.result : expr || '0'}
        </div>
        <div className={`h-5 text-sm font-code-formula truncate ${error ? 'text-error' : 'text-primary'}`} role={error ? 'alert' : undefined}>
          {error ?? (preview && preview !== expr ? `= ${preview}` : ' ')}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-5 gap-1.5">
        {KEYS.map((k) => {
          const label = inv && k.invLabel ? k.invLabel : k.label;
          const toggleOn = k.action === 'inv' && inv;
          return (
            <button
              key={k.label}
              type="button"
              onClick={() => press(k)}
              aria-label={k.aria && !(inv && k.invLabel) ? k.aria : undefined}
              aria-pressed={k.action === 'inv' ? inv : undefined}
              className={`h-10 sm:h-11 rounded-lg transition-colors active:scale-95 ${KEY_STYLE[k.kind]} ${
                k.kind === 'toggle'
                  ? toggleOn
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-primary hover:bg-surface-container'
                  : ''
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
