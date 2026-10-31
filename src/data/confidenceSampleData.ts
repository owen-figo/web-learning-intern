// =========================================================================
// CONFIDENCE INTERVAL ESTIMATION SAMPLE DATA & MATHEMATICAL HELPERS
// =========================================================================
import { standardErrorMean } from './samplingSampleData';

/**
 * Z_(alpha/2) critical values as printed in textbook tables.
 */
export const Z_CRITICAL: Record<number, number> = {
  80: 1.28,
  90: 1.645,
  95: 1.96,
  98: 2.33,
  99: 2.576,
};

export function zCritical(confidencePct: number): number {
  return Z_CRITICAL[confidencePct] ?? 1.96;
}

/**
 * ln Gamma(x) via Lanczos approximation (g = 7, n = 9).
 */
function logGamma(x: number): number {
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Student's t Probability Density Function with df degrees of freedom.
 */
export function tPdf(t: number, df: number): number {
  const logCoef = logGamma((df + 1) / 2) - logGamma(df / 2) - 0.5 * Math.log(df * Math.PI);
  return Math.exp(logCoef - ((df + 1) / 2) * Math.log(1 + (t * t) / df));
}

/**
 * Continued fraction for the regularized incomplete beta function (Numerical Recipes betacf).
 */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const tiny = 1e-30;
  let c = 1;
  let d = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-12) break;
  }
  return h;
}

/**
 * Regularized incomplete beta I_x(a, b).
 */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (front * betaContinuedFraction(a, b, x)) / a;
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/**
 * Student's t CDF P(T <= t) = 1 - ½ · I_(df / (df + t²))(df / 2, ½) for t ≥ 0.
 */
export function tCdf(t: number, df: number): number {
  const tail = 0.5 * incompleteBeta(df / (df + t * t), df / 2, 0.5);
  return t >= 0 ? 1 - tail : tail;
}

/**
 * t_(alpha/2) critical value: upper-tail area alpha/2 with df degrees of freedom.
 * Solved by bisection on the CDF (cumulative area 1 - alpha/2).
 */
export function tCritical(confidencePct: number, df: number): number {
  const target = 1 - (1 - confidencePct / 100) / 2;
  let lo = 0;
  let hi = 700;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * Confidence interval for the mean (sigma known): xbar ± Z * sigma / sqrt(n)
 */
export function ciMeanSigmaKnown(xbar: number, sigma: number, n: number, confidencePct: number) {
  const z = zCritical(confidencePct);
  const margin = z * standardErrorMean(sigma, n);
  return { critical: z, margin, lower: xbar - margin, upper: xbar + margin };
}

/**
 * Confidence interval for the mean (sigma unknown): xbar ± t * S / sqrt(n), df = n - 1
 */
export function ciMeanSigmaUnknown(xbar: number, s: number, n: number, confidencePct: number) {
  const t = tCritical(confidencePct, n - 1);
  const margin = t * standardErrorMean(s, n);
  return { critical: t, margin, lower: xbar - margin, upper: xbar + margin };
}

/**
 * Confidence interval for the proportion: p ± Z * sqrt(p(1 - p) / n)
 * Note: uses the SAMPLE proportion p inside the root because pi is unknown.
 */
export function ciProportion(x: number, n: number, confidencePct: number) {
  const p = x / n;
  const z = zCritical(confidencePct);
  const se = Math.sqrt((p * (1 - p)) / n);
  const margin = z * se;
  return { p, se, critical: z, margin, lower: p - margin, upper: p + margin };
}

/**
 * Sample size for the mean: n = Z^2 * sigma^2 / e^2 (always rounded UP).
 */
export function sampleSizeMean(confidencePct: number, sigma: number, e: number) {
  const z = zCritical(confidencePct);
  const raw = (z * z * sigma * sigma) / (e * e);
  return { z, raw, n: Math.ceil(raw - 1e-9) };
}

/**
 * Sample size for the proportion: n = Z^2 * pi(1 - pi) / e^2 (always rounded UP).
 */
export function sampleSizeProportion(confidencePct: number, pi: number, e: number) {
  const z = zCritical(confidencePct);
  const raw = (z * z * pi * (1 - pi)) / (e * e);
  return { z, raw, n: Math.ceil(raw - 1e-9) };
}

// =========================================================================
// VERIFIED SAMPLE DATASETS
// =========================================================================

export const confidenceSampleData = {
  // Sigma known: berat kemasan beras (lanjutan dari Bab 7)
  riceSigmaKnown: {
    title: 'Berat Isi Kemasan Beras (σ diketahui)',
    targetMu: 368,
    sigma: 15,
    n: 25,
    xbar: 362.3,
    get ci95() {
      return ciMeanSigmaKnown(this.xbar, this.sigma, this.n, 95); // 362.3 ± 5.88 → [356.42, 368.18]
    },
  },

  // Sigma unknown: nilai transaksi kantin (ribu rupiah), n = 100, df = 99
  canteenSigmaUnknown: {
    title: 'Nilai Transaksi Kantin Kampus (ribu rupiah)',
    n: 100,
    xbar: 110.27,
    s: 28.95,
    get ci95() {
      return ciMeanSigmaUnknown(this.xbar, this.s, this.n, 95); // t = 1.9842 → 110.27 ± 5.74 → [104.53, 116.01]
    },
  },

  // Proportion: formulir beasiswa yang mengandung kesalahan
  scholarshipForms: {
    title: 'Formulir Beasiswa yang Mengandung Kesalahan',
    n: 100,
    x: 10,
    get ci95() {
      return ciProportion(this.x, this.n, 95); // 0.10 ± 0.0588 → [0.0412, 0.1588]
    },
  },

  // Sample size
  sampleSize: {
    mean: { confidence: 95, sigma: 15, e: 5 }, // 34.57 → 35
    proportion: { confidence: 95, pi: 0.5, e: 0.03 }, // 1067.11 → 1068
  },
};
