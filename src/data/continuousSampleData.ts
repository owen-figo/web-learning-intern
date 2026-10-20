// =========================================================================
// CONTINUOUS PROBABILITY DISTRIBUTIONS SAMPLE DATA & MATHEMATICAL HELPERS
// =========================================================================

/**
 * Standard Error Function (erf) approximation (Abramowitz and Stegun 7.1.26)
 * Maximum error: < 1.5e-7 (well within required 1e-6 accuracy).
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function Phi(z) = P(Z <= z)
 * Calculated via erf(z / sqrt(2)).
 */
export function normalCdf(z: number): number {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

/**
 * Normal Probability Density Function f(x)
 * f(x) = [1 / (sigma * sqrt(2 * pi))] * exp(-0.5 * ((x - mu) / sigma)^2)
 */
export function normalPdf(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return 0;
  const coef = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const z = (x - mu) / sigma;
  return coef * Math.exp(-0.5 * z * z);
}

/**
 * Z-score standardized transformation
 * Z = (X - mu) / sigma
 */
export function zScore(x: number, mu: number, sigma: number): number {
  if (sigma === 0) return 0;
  return (x - mu) / sigma;
}

/**
 * Uniform Probability Density Function
 * f(x) = 1 / (b - a) for a <= x <= b, otherwise 0
 */
export function uniformPdf(a: number, b: number): number {
  if (b <= a) return 0;
  return 1 / (b - a);
}

/**
 * Uniform Mean E(X) = (a + b) / 2
 */
export function uniformMean(a: number, b: number): number {
  return (a + b) / 2;
}

/**
 * Uniform Variance Var(X) = (b - a)^2 / 12
 */
export function uniformVariance(a: number, b: number): number {
  return Math.pow(b - a, 2) / 12;
}

/**
 * Uniform Standard Deviation = sqrt(Var(X)) = (b - a) / sqrt(12)
 */
export function uniformSd(a: number, b: number): number {
  return Math.sqrt(uniformVariance(a, b));
}

/**
 * Uniform Probability on interval [c, d] within [a, b]
 * P(c <= X <= d) = (min(b, d) - max(a, c)) / (b - a)
 */
export function uniformProb(
  a: number,
  b: number,
  c: number,
  d: number
): number {
  if (b <= a || d <= c) return 0;
  const clampedLow = Math.max(a, Math.min(b, c));
  const clampedHigh = Math.max(a, Math.min(b, d));
  if (clampedHigh <= clampedLow) return 0;
  return (clampedHigh - clampedLow) / (b - a);
}

/**
 * Exponential Probability Density Function
 * f(x) = lambda * exp(-lambda * x) for x >= 0
 */
export function exponentialPdf(x: number, lambda: number): number {
  if (x < 0 || lambda <= 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

/**
 * Exponential Cumulative Distribution Function P(X <= x)
 * P(X <= x) = 1 - exp(-lambda * x) for x >= 0
 */
export function exponentialCdf(x: number, lambda: number): number {
  if (x < 0) return 0;
  if (lambda <= 0) return 0;
  return 1 - Math.exp(-lambda * x);
}

// =========================================================================
// VERIFIED SAMPLE DATASETS
// =========================================================================

export const continuousSampleData = {
  // Normal Distribution Sample: Nilai ujian statistika
  normalExam: {
    title: 'Nilai Ujian Statistika Mahasiswa',
    variableName: 'Nilai Ujian (X)',
    mu: 70,
    sigma: 10,
    exampleX: 85,
    get z(): number {
      return zScore(this.exampleX, this.mu, this.sigma); // 1.5
    },
    get pLess85(): number {
      return normalCdf(this.z); // 0.9332
    },
    get pGreater85(): number {
      return 1 - this.pLess85; // 0.0668
    },
    get pBetween60And80(): number {
      const z60 = zScore(60, this.mu, this.sigma); // -1.0
      const z80 = zScore(80, this.mu, this.sigma); // +1.0
      return normalCdf(z80) - normalCdf(z60); // 0.6827
    },
    get pdfAt70(): number {
      return normalPdf(70, this.mu, this.sigma); // 0.03989 ≈ 0.0399
    },
    get pdfAt80(): number {
      return normalPdf(80, this.mu, this.sigma); // 0.0242
    },
    // Standard normal benchmark checks:
    checks: {
      z0: normalCdf(0), // 0.5000
      z1: normalCdf(1.0), // 0.8413
      z1_5: normalCdf(1.5), // 0.9332
      z1_96: normalCdf(1.96), // 0.9750
      zNeg1: normalCdf(-1.0), // 0.1587
    },
  },

  // Uniform Distribution Sample: Waktu tunggu bus shuttle
  uniformShuttle: {
    title: 'Waktu Tunggu Bus Shuttle Kampus',
    variableName: 'Waktu Tunggu (X, menit)',
    a: 5,
    b: 15,
    get height(): number {
      return uniformPdf(this.a, this.b); // 0.1
    },
    get mean(): number {
      return uniformMean(this.a, this.b); // 10
    },
    get variance(): number {
      return uniformVariance(this.a, this.b); // 8.3333
    },
    get sd(): number {
      return uniformSd(this.a, this.b); // 2.88675 ≈ 2.887
    },
    get pBetween8And12(): number {
      return uniformProb(this.a, this.b, 8, 12); // 0.40
    },
    get pLess7(): number {
      return uniformProb(this.a, this.b, this.a, 7); // 0.20
    },
  },

  // Exponential Distribution Sample: Kedatangan pengunjung website
  exponentialArrivals: {
    title: 'Waktu Antar Kedatangan Pengunjung Website',
    variableName: 'Waktu Antar Kedatangan (X, menit)',
    lambda: 3, // 3 pengunjung per menit
    get mean(): number {
      return 1 / this.lambda; // 0.3333 menit (20 detik)
    },
    get pLessHalf(): number {
      return exponentialCdf(0.5, this.lambda); // 1 - e^(-1.5) ≈ 0.7769
    },
    get pGreater1(): number {
      return 1 - exponentialCdf(1.0, this.lambda); // e^(-3) ≈ 0.0498
    },
    get pdfAt0(): number {
      return exponentialPdf(0, this.lambda); // 3
    },
  },
};
