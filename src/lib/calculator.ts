// Scientific calculator engine: tokenizer + recursive-descent parser. No eval().
//
// Grammar (lowest to highest precedence):
//   expr    := term (('+' | '−') term)*
//   term    := comb (('×' | '÷' | implicit) comb)*      implicit: 2π, 3(4), 2sin(30)
//   comb    := unary (('C' | 'P') unary)*               nCr / nPr, like on a handheld calculator
//   unary   := ('−' | '+') unary | power
//   power   := postfix ('^' unary)?                      right-associative, −2^2 = −4
//   postfix := primary ('!' | '%')*
//   primary := number | π | e | Ans | func primary | '(' expr ')'

export type AngleMode = 'deg' | 'rad';

const FUNCTIONS = ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'sin', 'cos', 'tan', 'ln', 'log', 'abs', '√', '∛'] as const;
type FnName = (typeof FUNCTIONS)[number];
// Longest names first so "sin⁻¹" wins over "sin".
const NAMES = [...FUNCTIONS, 'Ans', 'π', 'e'].sort((a, b) => b.length - a.length);

type Token =
  | { type: 'num'; value: number }
  | { type: 'const'; value: 'π' | 'e' | 'Ans' }
  | { type: 'fn'; value: FnName }
  | { type: 'op'; value: string };

export class CalcError extends Error {}

function tokenize(input: string): Token[] {
  const src = input.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−').replace(/\s+/g, '');
  const tokens: Token[] = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      const text = src.slice(i, j);
      if ((text.match(/\./g) ?? []).length > 1 || text === '.') throw new CalcError('Angka tidak valid');
      tokens.push({ type: 'num', value: parseFloat(text) });
      i = j;
      continue;
    }
    if ('+−×÷^!%()CP'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }
    const name = NAMES.find((n) => src.startsWith(n, i));
    if (!name) throw new CalcError(`Simbol tidak dikenal: ${ch}`);
    if (name === 'π' || name === 'e' || name === 'Ans') tokens.push({ type: 'const', value: name });
    else tokens.push({ type: 'fn', value: name as FnName });
    i += name.length;
  }
  return tokens;
}

function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0 || n > 170) throw new CalcError('Faktorial hanya untuk bilangan bulat 0–170');
  let r = 1;
  for (let k = 2; k <= n; k++) r *= k;
  return r;
}

function permutations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || n < r) throw new CalcError('nPr butuh bilangan bulat 0 ≤ r ≤ n');
  let out = 1;
  for (let k = 0; k < r; k++) out *= n - k;
  return out;
}

function combinations(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || r < 0 || n < r) throw new CalcError('nCr butuh bilangan bulat 0 ≤ r ≤ n');
  const k = Math.min(r, n - r);
  let out = 1;
  for (let i = 1; i <= k; i++) out = (out * (n - k + i)) / i;
  return Math.round(out);
}

/** Removes floating-point dust such as sin(180°) = 1.22e-16. */
function clean(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : v;
}

export function evaluate(input: string, mode: AngleMode, ans = 0): number {
  const tokens = tokenize(input);
  let pos = 0;
  const peek = () => tokens[pos];
  const isOp = (v: string) => peek()?.type === 'op' && peek()!.value === v;
  const toRad = (x: number) => (mode === 'deg' ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (mode === 'deg' ? (x * 180) / Math.PI : x);

  const applyFn = (fn: FnName, x: number): number => {
    switch (fn) {
      case 'sin':
        return clean(Math.sin(toRad(x)));
      case 'cos':
        return clean(Math.cos(toRad(x)));
      case 'tan': {
        if (mode === 'deg' && Math.abs(((x % 180) + 180) % 180 - 90) < 1e-12) throw new CalcError('tan tidak terdefinisi di sini');
        return clean(Math.tan(toRad(x)));
      }
      case 'sin⁻¹':
        if (x < -1 || x > 1) throw new CalcError('sin⁻¹ butuh nilai −1 sampai 1');
        return fromRad(Math.asin(x));
      case 'cos⁻¹':
        if (x < -1 || x > 1) throw new CalcError('cos⁻¹ butuh nilai −1 sampai 1');
        return fromRad(Math.acos(x));
      case 'tan⁻¹':
        return fromRad(Math.atan(x));
      case 'ln':
        if (x <= 0) throw new CalcError('ln butuh nilai > 0');
        return Math.log(x);
      case 'log':
        if (x <= 0) throw new CalcError('log butuh nilai > 0');
        return Math.log10(x);
      case 'abs':
        return Math.abs(x);
      case '√':
        if (x < 0) throw new CalcError('Akar kuadrat butuh nilai ≥ 0');
        return Math.sqrt(x);
      case '∛':
        return Math.cbrt(x);
    }
  };

  const startsPrimary = () => {
    const t = peek();
    return !!t && (t.type === 'num' || t.type === 'const' || t.type === 'fn' || (t.type === 'op' && t.value === '('));
  };

  function parseExpr(): number {
    let v = parseTerm();
    while (isOp('+') || isOp('−')) {
      const op = (tokens[pos++] as { value: string }).value;
      const rhs = parseTerm();
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  }

  function parseTerm(): number {
    let v = parseComb();
    for (;;) {
      if (isOp('×') || isOp('÷')) {
        const op = (tokens[pos++] as { value: string }).value;
        const rhs = parseComb();
        if (op === '÷' && rhs === 0) throw new CalcError('Tidak bisa dibagi nol');
        v = op === '×' ? v * rhs : v / rhs;
      } else if (startsPrimary()) {
        v *= parseComb(); // implicit multiplication
      } else {
        return v;
      }
    }
  }

  function parseComb(): number {
    let v = parseUnary();
    while (isOp('C') || isOp('P')) {
      const op = (tokens[pos++] as { value: string }).value;
      const r = parseUnary();
      v = op === 'C' ? combinations(v, r) : permutations(v, r);
    }
    return v;
  }

  function parseUnary(): number {
    if (isOp('−')) {
      pos++;
      return -parseUnary();
    }
    if (isOp('+')) {
      pos++;
      return parseUnary();
    }
    return parsePower();
  }

  function parsePower(): number {
    const base = parsePostfix();
    if (isOp('^')) {
      pos++;
      const exp = parseUnary();
      const v = Math.pow(base, exp);
      if (Number.isNaN(v)) throw new CalcError('Pangkat tidak terdefinisi');
      return v;
    }
    return base;
  }

  function parsePostfix(): number {
    let v = parsePrimary();
    while (isOp('!') || isOp('%')) {
      const op = (tokens[pos++] as { value: string }).value;
      v = op === '!' ? factorial(v) : v / 100;
    }
    return v;
  }

  function parsePrimary(): number {
    const t = tokens[pos];
    if (!t) throw new CalcError('Ekspresi belum lengkap');
    pos++;
    if (t.type === 'num') return t.value;
    if (t.type === 'const') return t.value === 'π' ? Math.PI : t.value === 'e' ? Math.E : ans;
    if (t.type === 'fn') {
      // sin(30) or sin30; without brackets the function takes the next postfix value
      const arg = isOp('(') ? parsePrimary() : parsePostfix();
      return applyFn(t.value, arg);
    }
    if (t.value === '(') {
      const v = parseExpr();
      if (!isOp(')')) throw new CalcError('Kurung belum ditutup');
      pos++;
      return v;
    }
    throw new CalcError(`Tidak terduga: ${t.value}`);
  }

  if (tokens.length === 0) throw new CalcError('Kosong');
  const result = parseExpr();
  if (pos < tokens.length) throw new CalcError(`Tidak terduga: ${(tokens[pos] as { value: unknown }).value}`);
  if (!Number.isFinite(result)) throw new CalcError('Hasil terlalu besar');
  return result;
}

/** Appends the closing brackets the student did not type yet. */
export function closeBrackets(input: string): string {
  const open = (input.match(/\(/g) ?? []).length - (input.match(/\)/g) ?? []).length;
  return open > 0 ? input + ')'.repeat(open) : input;
}

/** Up to 10 significant digits; scientific notation for very large or very small values. */
export function formatResult(v: number): string {
  if (v === 0) return '0';
  const abs = Math.abs(v);
  if (abs >= 1e12 || abs < 1e-9) {
    const [m, e] = v.toExponential(8).split('e');
    return `${parseFloat(m)}×10^${Number(e)}`;
  }
  return String(parseFloat(v.toPrecision(10)));
}
