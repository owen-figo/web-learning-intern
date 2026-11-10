// Turns the material's plain-text formulas into LaTeX, so KaTeX can draw them as real math
// (fractions, square roots, x̄, subscripts) instead of monospace text. Used by MathFormula.
//
// The material writes formulas like  "S² = Σ(Xᵢ − X̄)² / (n − 1)"  or  "x̄ ± Z_α/2 · σ / √n".
// Rules of that notation, as read here:
//   a / b          → fraction; a and b are the nearest operands (a bracket group, or a run without
//                    spaces such as ΣXᵢ, √n, σ_x̄); outer brackets of an operand are dropped
//   √n, √[ … ]     → square root
//   x̄, X̄, Ȳ, p̂    → \bar / \hat
//   Xᵢ, X₁, Z_α/2, λ_baru, σ_x̄  → subscripts;   S², π^x, e^(−λx)  → superscripts
//   words          → upright text ("and", "atau", "Range"); single letters stay math variables
//   "(7.4)" at the end → equation number
// Formulas this reading gets wrong are written by hand in TEX_OVERRIDES.

const GREEK: Record<string, string> = {
  α: '\\alpha',
  β: '\\beta',
  γ: '\\gamma',
  δ: '\\delta',
  ε: '\\varepsilon',
  θ: '\\theta',
  λ: '\\lambda',
  μ: '\\mu',
  π: '\\pi',
  ρ: '\\rho',
  σ: '\\sigma',
  τ: '\\tau',
  φ: '\\varphi',
  χ: '\\chi',
  ω: '\\omega',
  Δ: '\\Delta',
  Σ: '\\sum',
  Π: '\\prod',
};

const SYMBOLS: Record<string, string> = {
  '−': '-',
  '–': '-',
  '·': '\\cdot ',
  '×': '\\times ',
  '÷': '\\div ',
  '±': '\\pm ',
  '≤': '\\le ',
  '≥': '\\ge ',
  '≠': '\\ne ',
  '≈': '\\approx ',
  '→': '\\to ',
  '∩': '\\cap ',
  '∪': '\\cup ',
  '…': '\\dots ',
  '%': '\\%',
  '°': '^{\\circ}',
  '½': '\\tfrac{1}{2}',
  '∞': '\\infty ',
  '∣': '\\mid ',
  '•': '\\quad\\bullet\\quad ',
  '&': '\\&',
  ':': '\\colon ',
  '#': '\\#',
  '’': "'",
  '"': '',
};

const SUB_DIGITS: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  ᵢ: 'i', ⱼ: 'j', ₖ: 'k', ₙ: 'n', ₓ: 'x', ₒ: 'o', ₚ: 'p',
};
const SUP_DIGITS: Record<string, string> = { '²': '2', '³': '3', '¹': '1', 'ⁿ': 'n', '⁻': '-', 'ˣ': 'x' };

/** Words that join two formulas ("… atau …") or two conditions ("P(A and B)"). */
const CONNECTORS = new Set(['atau', 'dan', 'dengan', 'untuk', 'and', 'or', 'jika', 'maka', 'sampai', 'dari', 'di', 'ke']);

const OPEN = '([{';
const CLOSE = ')]}';

// ---------------------------------------------------------------------------------------------
// Placeholders: finished TeX pieces are swapped for one private-use character, so later steps treat
// them as a single atom and never touch the TeX inside.
// ---------------------------------------------------------------------------------------------
let store: string[] = [];
const PH_BASE = 0xe100;
const ph = (tex: string) => {
  store.push(tex);
  return String.fromCharCode(PH_BASE + store.length - 1);
};
const isPh = (c: string) => c.charCodeAt(0) >= PH_BASE && c.charCodeAt(0) < PH_BASE + 0xe00;
const expand = (s: string): string =>
  s.replace(/[\ue100-\uefff]/g, (c) => expand(store[c.charCodeAt(0) - PH_BASE] ?? ''));

/** Index of the bracket that closes the one at `start`, or -1. */
function matchForward(s: string, start: number): number {
  let depth = 0;
  for (let i = start; i < s.length; i++) {
    if (OPEN.includes(s[i])) depth++;
    else if (CLOSE.includes(s[i])) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function matchBackward(s: string, end: number): number {
  let depth = 0;
  for (let i = end; i >= 0; i--) {
    if (CLOSE.includes(s[i])) depth++;
    else if (OPEN.includes(s[i])) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Drops one pair of brackets around the whole operand, e.g. "(x̄ − μ)" → "x̄ − μ". */
function unwrap(s: string): string {
  const t = s.trim();
  if (t.length >= 2 && OPEN.includes(t[0]) && matchForward(t, 0) === t.length - 1) return t.slice(1, -1).trim();
  return t;
}

const BOUNDARY = ' +-−=±≤≥×·,;:<>|•';

// ---------------------------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------------------------

function marksAndScripts(s: string): string {
  // x̄ / p̂ (combining marks) and precomposed Ȳ ȳ
  s = s.replace(/([A-Za-zα-ωΑ-Ω])\u0304/g, (_m, c: string) => ph(`\\bar{${GREEK[c] ?? c}}`));
  s = s.replace(/([A-Za-zα-ωΑ-Ω])\u0302/g, (_m, c: string) => ph(`\\hat{${GREEK[c] ?? c}}`));
  s = s.replace(/Ȳ/g, () => ph('\\bar{Y}')).replace(/ȳ/g, () => ph('\\bar{y}'));
  // unicode subscripts / superscripts (runs like "ₙ" or "²")
  s = s.replace(/[₀-₉ᵢⱼₖₙₓₒₚ]+/g, (run) => ph(`_{${[...run].map((c) => SUB_DIGITS[c]).join('')}}`));
  s = s.replace(/[²³¹ⁿ⁻ˣ]+/g, (run) => ph(`^{${[...run].map((c) => SUP_DIGITS[c]).join('')}}`));
  return s;
}

function words(s: string): string {
  // abs(…) → |…|  (a bare "|" would split the formula, see splitFormulas)
  for (let i = s.indexOf('abs('); i !== -1; i = s.indexOf('abs(')) {
    const end = matchForward(s, i + 3);
    if (end === -1) break;
    s = s.slice(0, i) + ph(`\\left|${convert(s.slice(i + 4, end))}\\right|`) + s.slice(end + 1);
  }
  // Connectors between formulas: "   atau   " → wide gap, "A and B" → small gap. The spaces stay, so
  // fraction operands still end there.
  s = s.replace(/(\s+)([A-Za-z]+)(\s+)/g, (m, a: string, w: string, b: string, offset: number, all: string) => {
    if (!CONNECTORS.has(w.toLowerCase())) return m;
    const wide = a.length >= 2 || b.length >= 2;
    // "Total Baris atau Kolom": a connector between two words is part of the phrase
    const before = /([A-Za-z]+)$/.exec(all.slice(0, offset))?.[1] ?? '';
    const after = /^([A-Za-z]+)/.exec(all.slice(offset + m.length))?.[1] ?? '';
    if (!wide && before.length >= 2 && after.length >= 2) return m;
    return `${a}${ph(wide ? `\\qquad\\text{${w}}\\qquad` : `\\text{${w}}`)}${b}`;
  });
  // X largest / X smallest, Xi, Qk, Q1 …
  s = s.replace(/\bX[ _](largest|smallest)\b/g, (_m, w: string) => ph(`X_{\\text{${w}}}`));
  s = s.replace(/\b([XQ])([ik])\b/g, (_m, l: string, i: string) => ph(`${l}_{${i}}`));
  s = s.replace(/(?<![A-Za-z])([A-Z])(\d)(?![\d.,])/g, (_m, l: string, d: string) => ph(`${l}_{${d}}`));
  // Combinations: nCx, ACx, NCn
  s = s.replace(/(?<![A-Za-z])([A-Za-z])C([A-Za-z])(?![A-Za-z])/g, (_m, a: string, b: string) => ph(`{}_{${a}}C_{${b}}`));
  // Function-like names
  s = s.replace(/\bcov(?=\()/g, () => ph('\\operatorname{cov}'));
  s = s.replace(/\b(Var|SD)(?=\()/g, (w) => ph(`\\operatorname{${w}}`));
  // Other words (2+ letters, may span several words) → upright text. A single letter right before or
  // after the phrase belongs to it ("X cara", "total percobaan n") but stays a math variable.
  s = s.replace(
    /(?:(?<![A-Za-z(-])([A-Za-z]) )?([A-Za-z][A-Za-z'’\-]*[A-Za-z](?: [A-Za-z][A-Za-z'’\-]*[A-Za-z])*)(?: ([A-Za-z])(?![A-Za-z(_̄̂]))?/g,
    (_m, lead: string | undefined, phrase: string, trail: string | undefined) =>
      ph(`${lead ? `${lead}\\ ` : ''}\\text{${phrase}}${trail ? `\\ ${trail}` : ''}`),
  );
  return s;
}

function explicitScripts(s: string): string {
  // _α/2, _(…), _x̄, _word, _X
  s = s.replace(/_(?:([α-ωΑ-Ω]\/2)|\(([^()]*)\)|([\ue100-\uefff])|([A-Za-z0-9α-ωΑ-Ω]+))/g, (_m, half, paren, p, run) => {
    if (half) return ph(`_{${GREEK[half[0]] ?? half[0]}/2}`);
    if (paren !== undefined) return ph(`_{${convert(paren, true)}}`);
    if (p) return ph(`_{${expand(p)}}`);
    return ph(`_{${convert(run, true)}}`);
  });
  // ^( … ) with balanced brackets
  for (let i = s.indexOf('^('); i !== -1; i = s.indexOf('^(')) {
    const end = matchForward(s, i + 1);
    if (end === -1) break;
    s = s.slice(0, i) + ph(`^{${convert(s.slice(i + 2, end), true)}}`) + s.slice(end + 1);
  }
  // ^x, ^-x, ^2
  s = s.replace(/\^(-?[A-Za-z0-9α-ωΑ-Ω\ue100-\uefff]+)/g, (_m, run: string) => ph(`^{${convert(run, true)}}`));
  return s;
}

function roots(s: string, inScript: boolean): string {
  for (let i = s.lastIndexOf('√'); i !== -1; i = s.lastIndexOf('√')) {
    let end: number;
    let inner: string;
    if (OPEN.includes(s[i + 1] ?? '')) {
      end = matchForward(s, i + 1);
      if (end === -1) break;
      inner = s.slice(i + 2, end);
    } else {
      end = i;
      while (end + 1 < s.length && !BOUNDARY.includes(s[end + 1]) && !CLOSE.includes(s[end + 1]) && !OPEN.includes(s[end + 1])) end++;
      inner = s.slice(i + 1, end + 1);
    }
    s = s.slice(0, i) + ph(`\\sqrt{${convert(inner, inScript)}}`) + s.slice(end + 1);
  }
  return s;
}

/** Converts fractions inside bracket groups first, then at this level. */
function fractions(s: string, inScript: boolean): string {
  // groups first (keep the brackets; tall content gets \left( \right))
  let out = '';
  for (let i = 0; i < s.length; i++) {
    if (OPEN.includes(s[i])) {
      const end = matchForward(s, i);
      if (end === -1) {
        out += s[i];
        continue;
      }
      const inner = symbols(fractions(s.slice(i + 1, end), inScript));
      const innerTex = expand(inner).trim();
      // "(f / n) × 100%": brackets around a lone fraction add nothing once it is drawn as a fraction.
      if (inner.trim().length === 1 && /^\\frac/.test(innerTex) && s[i] !== '{') {
        out += inner.trim();
        i = end;
        continue;
      }
      const tall = /\\frac|\\sqrt|\\sum/.test(innerTex);
      const [l, r] = s[i] === '(' ? ['(', ')'] : s[i] === '[' ? ['[', ']'] : ['\\{', '\\}'];
      out += ph(tall ? `\\left${l}${inner}\\right${r}` : `${l}${inner}${r}`);
      i = end;
    } else out += s[i];
  }
  s = out;
  if (inScript) return s;
  // a / b at this level
  for (let i = s.indexOf('/'); i !== -1; i = s.indexOf('/')) {
    let a = i - 1;
    while (a >= 0 && s[a] === ' ') a--;
    let start = a;
    while (start >= 0 && !BOUNDARY.includes(s[start])) start--;
    start++;
    let b = i + 1;
    while (b < s.length && s[b] === ' ') b++;
    let end = b;
    while (end < s.length && !BOUNDARY.includes(s[end])) end++;
    const num = s.slice(start, a + 1);
    const den = s.slice(b, end);
    if (!num || !den) {
      s = s.slice(0, i) + ph('/') + s.slice(i + 1);
      continue;
    }
    s = s.slice(0, start) + ph(`\\frac{${operandTex(num)}}{${operandTex(den)}}`) + s.slice(end);
  }
  return s;
}

/**
 * TeX of a fraction operand; a single bracket group loses its brackets ("(x̄ − μ)" → x̄ − μ).
 * Fractions inside it stay full size (\dfrac), otherwise σ/√n under a fraction bar gets too small to read.
 */
function operandTex(operand: string): string {
  let tex: string;
  if (operand.length === 1 && isPh(operand)) {
    tex = expand(operand).trim();
    const m = /^\\left[([](.*)\\right[)\]]$/s.exec(tex) ?? /^[([](.*)[)\]]$/s.exec(tex);
    if (m) tex = m[1];
  } else tex = expand(symbols(operand)).trim();
  return tex.replace(/\\frac\{/g, '\\dfrac{');
}

function symbols(s: string): string {
  let out = '';
  const chars = [...s];
  chars.forEach((c, i) => {
    if (isPh(c)) out += c;
    else if (GREEK[c]) out += `${GREEK[c]}${/[A-Za-z]/.test(chars[i + 1] ?? '') ? ' ' : ''}`;
    else if (c in SYMBOLS) out += SYMBOLS[c];
    else if (c === '|') out += '\\mid ';
    else if (c === ' ') {
      // A visible space only between two "things" (e.g. "X largest"); operators already get TeX spacing.
      const prev = chars[i - 1] ?? '';
      const next = chars[i + 1] ?? '';
      const atom = (x: string) => x !== '' && (isPh(x) || /[A-Za-z0-9α-ωΑ-Ω)\]!']/.test(x));
      const atomNext = (x: string) => x !== '' && (isPh(x) || /[A-Za-z0-9α-ωΑ-Ω(\[√]/.test(x));
      out += atom(prev) && atomNext(next) ? '\\ ' : ' ';
    } else out += c;
  });
  return out.replace(/(\d),(\d)/g, '$1{,}$2');
}

function convert(text: string, inScript = false): string {
  let s = text.replace(/\s+$/, '').replace(/^\s+/, '');
  s = marksAndScripts(s);
  s = words(s);
  s = explicitScripts(s);
  s = roots(s, inScript);
  s = fractions(s, inScript);
  s = symbols(s);
  return expand(s);
}

// ---------------------------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------------------------

/** Formulas the automatic reading gets wrong, written by hand (key: the formula text, trimmed). */
const TEX_OVERRIDES: Record<string, string> = {
  'Range = X largest − X smallest': '\\text{Range} = X_{\\text{largest}} - X_{\\text{smallest}}',
  'X largest − X smallest': 'X_{\\text{largest}} - X_{\\text{smallest}}',
  'nCx = n! / [x! · (n - x)!]': '{}_{n}C_{x} = \\frac{n!}{x!\\,(n-x)!}',
  'P(X = x) = [ ACx · (N - A)C(n - x) ] / NCn':
    'P(X = x) = \\dfrac{\\dbinom{A}{x}\\dbinom{N-A}{n-x}}{\\dbinom{N}{n}}',
  'P(X = x) = [n! / (x!(n - x)!)] · π^x · (1 - π)^(n - x)': 'P(X = x) = \\frac{n!}{x!\\,(n-x)!}\\,\\pi^{x}(1-\\pi)^{n-x}',
  'P(X = x) = (λ^x · e^(-λ)) / x!': 'P(X = x) = \\frac{e^{-\\lambda}\\,\\lambda^{x}}{x!}',
  'f(X) = [ 1 / (σ√(2π)) ] · e^( −½ · ((X − μ) / σ)² )':
    'f(X) = \\frac{1}{\\sigma\\sqrt{2\\pi}}\\, e^{-\\frac{1}{2}\\left(\\frac{X-\\mu}{\\sigma}\\right)^{2}}',
  'R_G = [(1 + R₁) × (1 + R₂) × … × (1 + Rₙ)]^(1/n) − 1': 'R_G = \\left[(1+R_1)\\times(1+R_2)\\times\\dots\\times(1+R_n)\\right]^{1/n} - 1',
  'Persentase Kategori = (Frekuensi Kategori f / Total Sampel n) × 100%':
    '\\text{Persentase Kategori} = \\frac{\\text{Frekuensi kategori } (f)}{\\text{Total sampel } (n)} \\times 100\\%',
  'Sudut Irisan Lingkaran = (Persentase Kategori / 100) × 360°':
    '\\text{Sudut irisan} = \\frac{\\text{Persentase kategori}}{100} \\times 360^{\\circ}',
  'Persentase Kumulatif Kategori ke-k = Σ (Persentase Kategori 1 s/d k)':
    '\\text{Persentase kumulatif ke-}k = \\sum_{j=1}^{k} \\text{Persentase kategori}_{j}',
  'Persentase Sub-Kelompok = (Frekuensi Sel / Total Kelompok Baris atau Kolom) × 100%':
    '\\text{Persentase sub-kelompok} = \\frac{\\text{Frekuensi sel}}{\\text{Total baris atau kolom}} \\times 100\\%',
  'Rentang Data (Range) = Nilai Maksimum - Nilai Minimum': '\\text{Range} = \\text{Nilai maksimum} - \\text{Nilai minimum}',
  'Lebar Kelas (w) = (Nilai Maksimum - Nilai Minimum) / Jumlah Kelas (k)':
    'w = \\frac{\\text{Nilai maksimum} - \\text{Nilai minimum}}{\\text{Jumlah kelas } (k)}',
  'Titik Tengah Kelas Xi = (Batas Bawah Kelas + Batas Atas Kelas) / 2':
    '\\text{Titik tengah } X_i = \\frac{\\text{Batas bawah} + \\text{Batas atas}}{2}',
  'Persentase Kumulatif = (Frekuensi Kumulatif Sampai Kelas Tersebut / Total n) × 100%':
    '\\text{Persentase kumulatif} = \\frac{\\text{Frekuensi kumulatif sampai kelas tersebut}}{n} \\times 100\\%',
  'P_empiris(A) = (Frekuensi Kemunculan Event A) / (Total Percobaan n)':
    'P_{\\text{empiris}}(A) = \\frac{\\text{Frekuensi kemunculan event } A}{\\text{Total percobaan } (n)}',
  'P(A and B) = (Frekuensi Sel A ∩ B) / (Grand Total N)': 'P(A \\text{ and } B) = \\frac{\\text{Frekuensi sel } A \\cap B}{\\text{Grand total } (N)}',
  'P(A | B) = P(A and B) / P(B) = (Frekuensi Sel A ∩ B) / (Total Sel Syarat B)':
    'P(A \\mid B) = \\frac{P(A \\text{ and } B)}{P(B)} = \\frac{\\text{Frekuensi sel } A \\cap B}{\\text{Total kolom/baris syarat } B}',
  'P(Daun Akhir) = P(Cabang 1) × P(Cabang 2 | Cabang 1) = P(A) × P(B | A)':
    'P(\\text{daun akhir}) = P(\\text{cabang 1}) \\times P(\\text{cabang 2} \\mid \\text{cabang 1}) = P(A)\\,P(B \\mid A)',
  'λ_baru = λ_dasar · (Rentang Baru / Rentang Dasar)': '\\lambda_{\\text{baru}} = \\lambda_{\\text{dasar}} \\cdot \\frac{\\text{Rentang baru}}{\\text{Rentang dasar}}',
  'P(c ≤ X ≤ d) = luas di bawah kurva f(X) dari c sampai d': 'P(c \\le X \\le d) = \\text{luas di bawah kurva } f(X) \\text{ dari } c \\text{ sampai } d',
  'Luas total di bawah kurva = 1': '\\text{Luas total di bawah kurva} = 1',
  'Modus = Nilai dengan Frekuensi Kemunculan Tertinggi (f_max)': '\\text{Modus} = \\text{nilai dengan frekuensi tertinggi } (f_{\\max})',
  'Point estimate ± (Nilai kritis) × (Standard error)': '\\text{Point estimate} \\pm (\\text{Nilai kritis}) \\times (\\text{Standard error})',
  'Five-Number Summary: [X smallest, Q1, Median (Q2), Q3, X largest]':
    '\\text{Five-number summary: } \\left[\\,X_{\\text{smallest}},\\ Q_1,\\ \\text{Median } (Q_2),\\ Q_3,\\ X_{\\text{largest}}\\,\\right]',
  'Komponen Boxplot: Whisker Kiri [X smallest, Q1] + Box [Q1, Q3] + Whisker Kanan [Q3, X largest]':
    '\\text{Whisker kiri } [X_{\\text{smallest}}, Q_1] + \\text{Box } [Q_1, Q_3] + \\text{Whisker kanan } [Q_3, X_{\\text{largest}}]',
};

const HYPERGEOMETRIC = '\\dfrac{\\dbinom{A}{x}\\dbinom{N-A}{n-x}}{\\dbinom{N}{n}}';
Object.assign(TEX_OVERRIDES, {
  'P(X = x) = [ACx · (N − A)C(n − x)] / NCn': `P(X = x) = ${HYPERGEOMETRIC}`,
  'P(x) = [ ACx · (N - A)C(n - x) ] / NCn': `P(x) = ${HYPERGEOMETRIC}`,
  'Lebar Kelas (w) = (Nilai Maksimum − Nilai Minimum) / Jumlah Kelas (k)':
    'w = \\frac{\\text{Nilai maksimum} - \\text{Nilai minimum}}{\\text{Jumlah kelas } (k)}',
  '[X smallest, Q1, Median, Q3, X largest]': '\\left[\\,X_{\\text{smallest}},\\ Q_1,\\ \\text{Median},\\ Q_3,\\ X_{\\text{largest}}\\,\\right]',
  'P(A and B) = frekuensi sel A ∩ B / total keseluruhan': 'P(A \\text{ and } B) = \\frac{\\text{frekuensi sel } A \\cap B}{\\text{total keseluruhan}}',
});

/** Override lookup ignores spacing and the kind of minus sign. */
const keyOf = (s: string) => s.replace(/\s+/g, '').replace(/[−–]/g, '-');
const OVERRIDES_BY_KEY = new Map(Object.entries(TEX_OVERRIDES).map(([k, v]) => [keyOf(k), v]));

/** Formulas that are really sentences or mnemonics: shown as text, not as math. */
function looksLikeText(s: string): boolean {
  const longWords = s.match(/[A-Za-z]{4,}/g) ?? [];
  const mathSign = /[=≠√±≤≥<>^²³Σ/×·−+-]|_[A-Za-zα-ω]/.test(s);
  // a variable: a lone letter, a Greek letter, a digit or a bar accent ("Mean = Median" has none)
  const variable = /(?<![A-Za-z])[A-Za-z](?![A-Za-z])|[α-ωΑ-Ω\d²̄]/.test(s);
  const sentence = /\.\s+[A-Z]|\.$/.test(s);
  // "Benar (peluang 1 − α)": only a minus sign between words is a phrase, not a formula
  const strongMath = /[=≠√±≤≥<>^²³Σ/]|_[A-Za-zα-ω]/.test(s);
  return !mathSign || !variable || sentence || longWords.length > 7 || (!strongMath && longWords.length >= 1);
}

const normalize = (s: string) => s.replace(/\s+$/, '').replace(/^\s+/, '');

/**
 * TeX for one formula, or null if it should stay text. An equation number at the end
 * ("… (7.4)") is kept apart and returned as `tag`.
 */
export function formulaToTex(text: string, opts: { symbol?: boolean } = {}): { tex: string; tag?: string } | null {
  const t = normalize(text);
  // A legend symbol ("Z_α/2", "x̄", "df") is always math unless it is a name ("Nilai kritis").
  if (opts.symbol) {
    if (/[A-Za-z]{3,}/.test(t) && !/[α-ωΑ-Ω_̄]/.test(t)) return null;
    store = [];
    try {
      return { tex: convert(t) };
    } finally {
      store = [];
    }
  }
  const direct = OVERRIDES_BY_KEY.get(keyOf(t));
  if (direct) return { tex: direct };
  const tagMatch = /^(.*?)\s*\((\d+\.\d+[a-z]?)\)$/s.exec(t);
  const body = tagMatch ? tagMatch[1] : t;
  const tagged = OVERRIDES_BY_KEY.get(keyOf(body));
  if (tagged) return { tex: tagged, tag: tagMatch?.[2] };
  if (looksLikeText(body)) return null;
  // "Label: formula" → the label stays text
  const label = /^([A-Za-z][A-Za-z \-]{2,40}):\s+(.*)$/s.exec(body);
  store = [];
  try {
    const tex = label ? `\\text{${label[1]}:}\\quad ${convert(label[2])}` : convert(body);
    return { tex, tag: tagMatch?.[2] };
  } finally {
    store = [];
  }
}

export interface FormulaPart {
  text: string;
  /** true: an alternative form of the previous part ("…   atau   …"). */
  alternative: boolean;
}

/** Splits "f1 | f2" (top-level bars only; "P(A | B)" stays whole) and "f1   atau   f2". */
export function splitFormulas(text: string): FormulaPart[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const c of text) {
    if (OPEN.includes(c)) depth++;
    if (CLOSE.includes(c)) depth--;
    if (c === '|' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else cur += c;
  }
  parts.push(cur);
  return parts.flatMap((p) =>
    p
      .split(/\s{2,}atau\s{2,}/)
      .map(normalize)
      .filter(Boolean)
      .map((t, i) => ({ text: t, alternative: i > 0 })),
  );
}
