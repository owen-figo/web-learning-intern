import React from 'react';
import { TheorySection, FormulaSymbol } from '../types';

// =========================================================================
// FORMULA STEP CARD
// Fallback visual for calculation steps without a dedicated picture.
// Shows the section's formula with the symbols this step works on
// highlighted, plus a progress strip of the steps.
// Highlighting is automatic: a symbol is highlighted when it appears
// (as a standalone token) in the step's title, instruction or example.
// =========================================================================

interface Candidate {
  label?: string;
  formula: string;
  symbols: FormulaSymbol[];
}

// Boundaries: a token must not be glued to letters, decimal digits or combining marks
// (so "X" does not match inside "X̄" and "n" does not match inside words).
// Superscripts like "²" are allowed next to a token, so "σ" matches in "σ²".
const tokenRegex = (token: string) =>
  new RegExp(`(?<![\\p{L}\\p{Nd}\\p{M}_])${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{Nd}\\p{M}_])`, 'gu');

function candidatesOf(section: TheorySection): Candidate[] {
  if (section.formulas && section.formulas.length > 0) {
    return section.formulas.map((f) => ({ label: f.label, formula: f.formula, symbols: f.symbols ?? section.formulaSymbols ?? [] }));
  }
  if (!section.formula) return [];
  return section.formula
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((formula) => ({ formula, symbols: section.formulaSymbols ?? [] }));
}

// Filler words that appear inside some formulas but should never be highlighted.
const STOPWORDS = new Set(['untuk', 'dan', 'atau', 'dari', 'sampai', 'dengan', 'di', 'ke', 'yang', 'luas', 'total']);

// Variables/words taken directly from the formula text, e.g. "X̄", "Ȳ", "Rᵢ", "λ_baru", "Sukses".
function atomsOf(formula: string): string[] {
  return (formula.match(/\p{L}[\p{L}\p{M}_₀-₉]*/gu) ?? []).filter((a) => !STOPWORDS.has(a.toLowerCase()));
}

function highlightRanges(formula: string, symbols: FormulaSymbol[], stepText: string): [number, number][] {
  const declared = symbols.map((s) => s.symbol.trim());
  const tokens = Array.from(new Set([...declared, ...atomsOf(formula)].filter((s) => s.length > 0))).sort((a, b) => b.length - a.length);
  const taken = new Array(formula.length).fill(false);
  const ranges: [number, number][] = [];
  for (const tok of tokens) {
    if (!tokenRegex(tok).test(stepText)) continue;
    for (const m of formula.matchAll(tokenRegex(tok))) {
      const start = m.index ?? 0;
      const end = start + m[0].length;
      if (taken.slice(start, end).some(Boolean)) continue;
      for (let i = start; i < end; i++) taken[i] = true;
      ranges.push([start, end]);
    }
  }
  return ranges.sort((a, b) => a[0] - b[0]);
}

const Highlighted: React.FC<{ text: string; ranges: [number, number][] }> = ({ text, ranges }) => {
  const parts: React.ReactNode[] = [];
  let pos = 0;
  ranges.forEach(([s, e], i) => {
    if (s > pos) parts.push(text.slice(pos, s));
    parts.push(
      <mark key={i} className="bg-[#ffdad6] text-[#ba1a1a] font-extrabold rounded px-0.5">
        {text.slice(s, e)}
      </mark>,
    );
    pos = e;
  });
  if (pos < text.length) parts.push(text.slice(pos));
  return <>{parts}</>;
};

export const FormulaStepCard: React.FC<{ section: TheorySection; stepNumber: number; total: number; stepText: string }> = ({ section, stepNumber, total, stepText }) => {
  const cands = candidatesOf(section);
  if (cands.length === 0) return null;

  const scored = cands.map((cand) => {
    const ranges = highlightRanges(cand.formula, cand.symbols, stepText);
    // A step that writes "σ = ..." is about the formula whose left-hand side is "σ".
    const lhs = cand.formula.split('=')[0].trim();
    const namesLhs = lhs.length > 0 && lhs.length < 20 && stepText.includes(`${lhs} =`);
    return { cand, ranges, score: ranges.length + (namesLhs ? 10 : 0) };
  });
  let best = 0;
  scored.forEach((s, i) => {
    if (s.score > scored[best].score) best = i;
  });

  return (
    <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/40 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-primary uppercase tracking-wide">Rumus di langkah ini</span>
        <div className="flex items-center gap-1" aria-label={`Langkah ${stepNumber} dari ${total}`}>
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full ${i + 1 === stepNumber ? 'w-5 bg-[#ba1a1a]' : i + 1 < stepNumber ? 'w-2.5 bg-primary' : 'w-2.5 bg-outline-variant/60'}`}
            />
          ))}
        </div>
      </div>
      {scored.map((s, i) => {
        const isBest = i === best;
        if (!isBest && scored.length > 3) return null;
        return (
          <div
            key={i}
            className={`rounded-lg px-3 py-2 font-mono overflow-x-auto ${
              isBest ? 'bg-surface-container-lowest border border-outline-variant/60 text-sm sm:text-base font-bold text-black' : 'text-xs text-on-surface-variant'
            }`}
          >
            {s.cand.label && isBest && <div className="font-sans text-xs font-bold text-primary mb-0.5">{s.cand.label}</div>}
            <Highlighted text={s.cand.formula} ranges={isBest ? s.ranges : []} />
          </div>
        );
      })}
    </div>
  );
};
