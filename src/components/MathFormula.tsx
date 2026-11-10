import React, { useEffect, useState } from 'react';
import { formulaToTex, splitFormulas } from '../lib/formulaTex';

// Draws the material's formulas as real math with KaTeX (fractions, roots, x̄, subscripts).
// KaTeX (~270 kB with its fonts) is downloaded the first time a formula is shown; until then, and for
// formulas that are really sentences, the plain text is shown.

type Katex = typeof import('katex').default;

let katexLib: Katex | null = null;
let katexLoading: Promise<Katex> | null = null;

function loadKatex(): Promise<Katex> {
  katexLoading ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([m]) => {
    katexLib = m.default;
    return katexLib;
  });
  return katexLoading;
}

function useKatex(): Katex | null {
  const [lib, setLib] = useState<Katex | null>(katexLib);
  useEffect(() => {
    if (lib) return;
    let alive = true;
    loadKatex()
      .then((k) => alive && setLib(() => k))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [lib]);
  return lib;
}

const htmlCache = new Map<string, string>();

function renderTex(katex: Katex, tex: string, display: boolean): string {
  const key = `${display ? 'D' : 'I'}${tex}`;
  let html = htmlCache.get(key);
  if (html === undefined) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' });
    htmlCache.set(key, html);
  }
  return html;
}

interface MathFormulaProps {
  /** The formula as written in the material, e.g. "S² = Σ(Xᵢ − X̄)² / (n − 1)". */
  text: string;
  /** Block formula (centered-left, full size) instead of inline math in a sentence or table. */
  display?: boolean;
  /** Classes for parts that stay text (mnemonics, sentences). */
  textClassName?: string;
  className?: string;
}

/**
 * One formula string from the material. "f1 | f2" becomes separate lines (display) or items (inline);
 * "f1   atau   f2" shows the second as an alternative form.
 */
export const MathFormula: React.FC<MathFormulaProps> = ({ text, display = false, textClassName = '', className = '' }) => {
  const katex = useKatex();
  const parts = splitFormulas(text);

  const renderPart = (part: string, key: number) => {
    const conv = formulaToTex(part);
    if (!conv || !katex) {
      return (
        <span key={key} className={textClassName}>
          {part}
        </span>
      );
    }
    return (
      <span key={key} className={`math-part inline-flex items-baseline gap-2 ${display ? 'max-w-full' : ''}`}>
        <span dangerouslySetInnerHTML={{ __html: renderTex(katex, conv.tex, display) }} />
        {conv.tag && <span className="text-xs text-outline font-sans shrink-0">({conv.tag})</span>}
      </span>
    );
  };

  if (!display) {
    return (
      <span className={`math-formula math-inline inline-flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}>
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            {p.alternative && <span className="text-xs text-on-surface-variant font-sans">atau</span>}
            {renderPart(p.text, i)}
          </React.Fragment>
        ))}
      </span>
    );
  }

  return (
    <div className={`math-formula math-display space-y-1.5 ${className}`}>
      {parts.map((p, i) => (
        <React.Fragment key={i}>
          {p.alternative && <div className="text-xs font-semibold text-on-surface-variant font-sans uppercase tracking-wide">atau</div>}
          <div className="overflow-x-auto overflow-y-hidden py-0.5">{renderPart(p.text, i)}</div>
        </React.Fragment>
      ))}
    </div>
  );
};

/** A symbol from a formula legend ("Z_α/2", "x̄", "σ_x̄") as inline math; names stay text. */
export const MathSymbol: React.FC<{ symbol: string; className?: string }> = ({ symbol, className = '' }) => {
  const katex = useKatex();
  const conv = formulaToTex(symbol, { symbol: true });
  if (!conv || !katex) return <span className={className}>{symbol}</span>;
  return <span className={className} dangerouslySetInnerHTML={{ __html: renderTex(katex, conv.tex, false) }} />;
};
