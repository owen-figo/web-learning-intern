import React from 'react';
import { TheorySection, FormulaSymbol } from '../types';
import { MathFormula, MathSymbol } from './MathFormula';

// =========================================================================
// FORMULA STEP CARD
// Fallback visual for calculation steps without a dedicated picture.
// Shows the section's formula (drawn by KaTeX) with chips for the symbols
// this step works on, plus a progress strip of the steps.
// A symbol counts as used when it appears (as a standalone token) in the
// step's title, instruction or example.
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
        if (!isBest) {
          return (
            <div key={i} className="px-3 text-xs text-on-surface-variant opacity-80">
              <MathFormula text={s.cand.formula} />
            </div>
          );
        }
        // The symbols this step works on, as chips under the formula.
        // Only symbols as chips: plain words from the formula ("tolak", "value", "Rentang") are left out.
        const used = Array.from(new Set(s.ranges.map(([a, b]) => s.cand.formula.slice(a, b)))).filter((tok) => !/^[A-Za-z]{3,}$/.test(tok));
        return (
          <div key={i} className="rounded-lg px-3 py-2 bg-surface-container-lowest border border-outline-variant/60 text-sm text-black space-y-1.5">
            {s.cand.label && <div className="text-xs font-bold text-primary">{s.cand.label}</div>}
            <MathFormula text={s.cand.formula} display textClassName="font-semibold" />
            {used.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-outline-variant/30">
                <span className="text-xs text-on-surface-variant">Dipakai di langkah ini:</span>
                {used.map((tok) => (
                  <MathSymbol key={tok} symbol={tok} className="math-inline text-xs font-bold bg-[#ffdad6] text-[#ba1a1a] rounded px-1.5 py-0.5" />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
