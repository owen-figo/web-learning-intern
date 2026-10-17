// Sample data & mathematical helpers for "Distribusi Probabilitas Diskrit"
// Based on real-world educational cases (without university branding)

export interface DiscreteDataPoint {
  x: number;
  label: string;
  p: number; // P(X = x)
  cumP?: number; // P(X <= x)
}

// 1. DISCRETE VARIABLE SAMPLE DATA:
// "Jumlah gangguan sinyal per sesi kelas online"
// X = 0, 1, 2, 3, 4 with P(X) = 0.10, 0.30, 0.30, 0.20, 0.10 (sum = 1.00)
// Expected value E(X) = 1.90
// Variance = 1.29
// Standard Deviation = sqrt(1.29) ≈ 1.136
export const signalIssueData: DiscreteDataPoint[] = [
  { x: 0, label: '0 kali gangguan', p: 0.1 },
  { x: 1, label: '1 kali gangguan', p: 0.3 },
  { x: 2, label: '2 kali gangguan', p: 0.3 },
  { x: 3, label: '3 kali gangguan', p: 0.2 },
  { x: 4, label: '4 kali gangguan', p: 0.1 },
];

export const signalIssueStats = {
  n: 5,
  sumP: 1.0,
  expectedValue: 1.9, // E(X) = Σ [x * P(x)]
  variance: 1.29, // Var(X) = Σ [(x - μ)^2 * P(x)]
  standardDeviation: 1.136, // σ = √1.29 ≈ 1.13578
  details: [
    { x: 0, p: 0.1, xTimesP: 0.0, diff: -1.9, diffSq: 3.61, diffSqTimesP: 0.361 },
    { x: 1, p: 0.3, xTimesP: 0.3, diff: -0.9, diffSq: 0.81, diffSqTimesP: 0.243 },
    { x: 2, p: 0.3, xTimesP: 0.6, diff: 0.1, diffSq: 0.01, diffSqTimesP: 0.003 },
    { x: 3, p: 0.2, xTimesP: 0.6, diff: 1.1, diffSq: 1.21, diffSqTimesP: 0.242 },
    { x: 4, p: 0.1, xTimesP: 0.4, diff: 2.1, diffSq: 4.41, diffSqTimesP: 0.441 },
  ],
};

// 2. MATHEMATICAL HELPERS:
export function factorial(n: number): number {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

export function combination(n: number, x: number): number {
  if (x < 0 || x > n) return 0;
  if (x === 0 || x === n) return 1;
  const k = Math.min(x, n - x);
  let numerator = 1;
  let denominator = 1;
  for (let i = 1; i <= k; i++) {
    numerator *= n - (k - i);
    denominator *= i;
  }
  return Math.round(numerator / denominator);
}

// 3. BINOMIAL DATA:
// Quiz 5 multiple-choice questions (4 options each: A, B, C, D) answered by pure guessing.
// n = 5, π = 0.25 (1 - π = 0.75)
// Mean μ = nπ = 1.25
// Variance σ² = nπ(1 - π) = 0.9375
// Standard deviation σ ≈ 0.968
// P(X ≥ 3) = P(3) + P(4) + P(5) ≈ 0.1035
export const quizBinomialData = {
  n: 5,
  pi: 0.25,
  mean: 1.25,
  variance: 0.9375,
  standardDeviation: 0.968,
  pAtLeast3: 0.1035,
  distribution: [
    { x: 0, p: 0.2373, nCx: 1, piPowX: 1.0, compPow: 0.237305 },
    { x: 1, p: 0.3955, nCx: 5, piPowX: 0.25, compPow: 0.316406 },
    { x: 2, p: 0.2637, nCx: 10, piPowX: 0.0625, compPow: 0.421875 },
    { x: 3, p: 0.0879, nCx: 10, piPowX: 0.015625, compPow: 0.5625 },
    { x: 4, p: 0.0146, nCx: 5, piPowX: 0.00390625, compPow: 0.75 },
    { x: 5, p: 0.001, nCx: 1, piPowX: 0.0009765625, compPow: 1.0 },
  ],
  combinationExamples: [
    { n: 5, x: 0, result: 1, note: 'Hanya ada 1 cara tidak menjawab benar sama sekali (semua salah)' },
    { n: 5, x: 2, result: 10, note: 'Ada 10 kombinasi memilih 2 soal benar dari 5 soal' },
    { n: 5, x: 3, result: 10, note: 'Ada 10 kombinasi memilih 3 soal benar dari 5 soal (5C3 = 5C2)' },
  ],
};

export function calcBinomialProb(n: number, pi: number, x: number): number {
  const c = combination(n, x);
  return c * Math.pow(pi, x) * Math.pow(1 - pi, n - x);
}

// 4. POISSON DATA:
// "Jumlah pengunjung website per menit", λ = 3.
// Mean μ = λ = 3
// Variance σ² = λ = 3
// Standard deviation σ = √3 ≈ 1.732
// Expected P(X ≥ 5) ≈ 0.1847
export const websitePoissonData = {
  lambda: 3,
  mean: 3,
  variance: 3,
  standardDeviation: 1.732,
  pAtLeast5: 0.1847,
  distribution: [
    { x: 0, p: 0.0498, factor: 'e^(-3)', factorial: 1 },
    { x: 1, p: 0.1494, factor: '3 · e^(-3)', factorial: 1 },
    { x: 2, p: 0.224, factor: '(9 / 2) · e^(-3)', factorial: 2 },
    { x: 3, p: 0.224, factor: '(27 / 6) · e^(-3)', factorial: 6 },
    { x: 4, p: 0.168, factor: '(81 / 24) · e^(-3)', factorial: 24 },
    { x: 5, p: 0.1008, factor: '(243 / 120) · e^(-3)', factorial: 120 },
    { x: 6, p: 0.0504, factor: '(729 / 720) · e^(-3)', factorial: 720 },
    { x: 7, p: 0.0216, factor: '(2187 / 5040) · e^(-3)', factorial: 5040 },
    { x: 8, p: 0.0081, factor: '(6561 / 40320) · e^(-3)', factorial: 40320 },
  ],
};

export function calcPoissonProb(lambda: number, x: number): number {
  if (lambda <= 0 || x < 0) return 0;
  return (Math.pow(lambda, x) * Math.exp(-lambda)) / factorial(x);
}

// 5. POISSON AREA OF OPPORTUNITY SCALED DATA:
// Base rate: λ = 3 per menit (60 detik)
// 60-second window: λ = 3.0, P(X ≥ 2) ≈ 0.8009
// 10-second window: λ = 0.5, P(X ≥ 2) ≈ 0.0902
// 1-second window:  λ = 0.05, P(X ≥ 2) ≈ 0.0012
export const poissonAreaWindows = [
  {
    seconds: 60,
    label: '1 Menit (60 detik)',
    lambda: 3.0,
    p0: 0.0498,
    p1: 0.1494,
    pAtLeast2: 0.8009,
    description: 'Rentang waktu standar: rata-rata 3 pengunjung tiba.',
  },
  {
    seconds: 10,
    label: '10 Detik',
    lambda: 0.5, // 3 * (10 / 60)
    p0: 0.6065,
    p1: 0.3033,
    pAtLeast2: 0.0902,
    description: 'Rentang waktu dipersempit ke 10 detik: peluang ≥2 pengunjung turun drastis ke ~9%.',
  },
  {
    seconds: 1,
    label: '1 Detik',
    lambda: 0.05, // 3 * (1 / 60)
    p0: 0.9512,
    p1: 0.0476,
    pAtLeast2: 0.0012,
    description: 'Rentang sangat singkat 1 detik: peluang ≥2 pengunjung hampir mustahil (0.12%).',
  },
];

// 6. HYPERGEOMETRIC DEMO DATA:
// Population N = 10 lampu LED
// Number of defective items A = 3
// Number of non-defective items (N - A) = 7
// Sample size n = 2 (drawn WITHOUT replacement)
// 1st draw: P(defective) = 3/10 = 0.30
// If 1st defective: remaining 9 items, 2 defective -> P(defective 2nd) = 2/9 ≈ 0.222
// If 1st non-defective: remaining 9 items, 3 defective -> P(defective 2nd) = 3/9 ≈ 0.333
// Hypergeometric distribution for sample n = 2:
// P(X = 0) = (3C0 * 7C2) / 10C2 = (1 * 21) / 45 = 21/45 ≈ 0.4667
// P(X = 1) = (3C1 * 7C1) / 10C2 = (3 * 7) / 45 = 21/45 ≈ 0.4667
// P(X = 2) = (3C2 * 7C0) / 10C2 = (3 * 1) / 45 = 3/45 ≈ 0.0667
export const ledHypergeometricData = {
  N: 10, // Ukuran populasi
  A: 3, // Jumlah item rusak (sukses) di populasi
  nonDefective: 7, // N - A
  n: 2, // Ukuran sampel yang diambil tanpa pengembalian
  firstDrawProbDefective: 0.3, // 3 / 10
  secondDrawAfterDefective: 0.2222, // 2 / 9
  secondDrawAfterGood: 0.3333, // 3 / 9
  combinations: {
    totalCombinations: 45, // 10C2 = 45
    c3_0: 1, // 3C0
    c7_2: 21, // 7C2
    c3_1: 3, // 3C1
    c7_1: 7, // 7C1
    c3_2: 3, // 3C2
    c7_0: 1, // 7C0
  },
  distribution: [
    { x: 0, label: '0 lampu rusak (keduanya normal)', pFraction: '21/45', p: 0.4667 },
    { x: 1, label: '1 lampu rusak, 1 normal', pFraction: '21/45', p: 0.4667 },
    { x: 2, label: '2 lampu rusak (keduanya cacat)', pFraction: '3/45', p: 0.0667 },
  ],
};

export function calcHypergeometricProb(N: number, A: number, n: number, x: number): number {
  if (x < 0 || x > A || x > n || n - x > N - A) return 0;
  const num = combination(A, x) * combination(N - A, n - x);
  const den = combination(N, n);
  return den > 0 ? num / den : 0;
}
