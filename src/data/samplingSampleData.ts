// =========================================================================
// SAMPLING DISTRIBUTIONS SAMPLE DATA & MATHEMATICAL HELPERS
// =========================================================================
import { normalCdf } from './continuousSampleData';

/**
 * Population Mean mu = sum(X_i) / N
 */
export function populationMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

/**
 * Population Standard Deviation sigma = sqrt( sum((X_i - mu)^2) / N )
 * Note: divides by N (population), NOT n - 1 (sample).
 */
export function populationSd(values: number[]): number {
  if (values.length === 0) return 0;
  const mu = populationMean(values);
  const ss = values.reduce((s, v) => s + (v - mu) * (v - mu), 0);
  return Math.sqrt(ss / values.length);
}

/**
 * Standard Error of the Mean: sigma_xbar = sigma / sqrt(n)
 */
export function standardErrorMean(sigma: number, n: number): number {
  if (n <= 0) return 0;
  return sigma / Math.sqrt(n);
}

/**
 * Z for the sampling distribution of the mean:
 * Z = (xbar - mu) / (sigma / sqrt(n))
 */
export function zSampleMean(xbar: number, mu: number, sigma: number, n: number): number {
  const se = standardErrorMean(sigma, n);
  if (se === 0) return 0;
  return (xbar - mu) / se;
}

/**
 * Finding xbar for the sampling distribution of the mean:
 * xbar = mu + Z * sigma / sqrt(n)
 */
export function xbarFromZ(mu: number, z: number, sigma: number, n: number): number {
  return mu + z * standardErrorMean(sigma, n);
}

/**
 * Sample proportion p = X / n
 */
export function sampleProportion(x: number, n: number): number {
  if (n <= 0) return 0;
  return x / n;
}

/**
 * Standard Error of the Proportion: sigma_p = sqrt( pi * (1 - pi) / n )
 * pi here is the POPULATION PROPORTION, not the constant 3.14159.
 */
export function standardErrorProportion(pi: number, n: number): number {
  if (n <= 0 || pi < 0 || pi > 1) return 0;
  return Math.sqrt((pi * (1 - pi)) / n);
}

/**
 * Z for the sampling distribution of the proportion:
 * Z = (p - pi) / sqrt( pi * (1 - pi) / n )
 */
export function zSampleProportion(p: number, pi: number, n: number): number {
  const se = standardErrorProportion(pi, n);
  if (se === 0) return 0;
  return (p - pi) / se;
}

/**
 * Deterministic seeded PRNG (mulberry32) so CLT simulations render
 * identically on every visit instead of jumping around on re-render.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// =========================================================================
// VERIFIED SAMPLE DATASETS
// =========================================================================

export const samplingSampleData = {
  // Populasi kecil (N = 4): jumlah typo laporan mingguan 4 mahasiswa magang.
  // Semua 4^2 = 16 kemungkinan sampel n = 2 (dengan pengembalian).
  typoPopulation: {
    title: 'Jumlah Typo Laporan Mingguan 4 Mahasiswa Magang',
    names: ['Ani', 'Budi', 'Citra', 'Dodi'],
    values: [3, 2, 1, 4],
    n: 2,
    get mu(): number {
      return populationMean(this.values); // 2.5
    },
    get sigma(): number {
      return populationSd(this.values); // sqrt(1.25) ≈ 1.1180
    },
    get allSamples(): { pair: [number, number]; mean: number }[] {
      const out: { pair: [number, number]; mean: number }[] = [];
      for (const a of this.values) {
        for (const b of this.values) {
          out.push({ pair: [a, b], mean: (a + b) / 2 });
        }
      }
      return out; // 16 samples
    },
    get meanOfSampleMeans(): number {
      return populationMean(this.allSamples.map((s) => s.mean)); // 2.5 (= mu, unbiased)
    },
    get sdOfSampleMeans(): number {
      return populationSd(this.allSamples.map((s) => s.mean)); // ≈ 0.7906
    },
    get standardError(): number {
      return standardErrorMean(this.sigma, this.n); // 1.1180 / sqrt(2) ≈ 0.7906
    },
  },

  // Berat kemasan beras: populasi normal, mu = 368 g, sigma = 15 g, n = 25
  riceFill: {
    title: 'Berat Isi Kemasan Beras',
    variableName: 'Berat Kemasan (gram)',
    mu: 368,
    sigma: 15,
    n: 25,
    get se(): number {
      return standardErrorMean(this.sigma, this.n); // 3
    },
    get zIndividual365(): number {
      return (365 - this.mu) / this.sigma; // -0.20
    },
    get pIndividualLess365(): number {
      return normalCdf(this.zIndividual365); // 0.4207
    },
    get zMean365(): number {
      return zSampleMean(365, this.mu, this.sigma, this.n); // -1.00
    },
    get pMeanLess365(): number {
      return normalCdf(this.zMean365); // 0.1587
    },
    get interval95(): [number, number] {
      return [
        xbarFromZ(this.mu, -1.96, this.sigma, this.n), // 362.12
        xbarFromZ(this.mu, 1.96, this.sigma, this.n), // 373.88
      ];
    },
  },

  // Proporsi mahasiswa yang memilih kuliah hybrid: pi = 0.50, n = 100
  hybridPreference: {
    title: 'Proporsi Mahasiswa yang Memilih Kuliah Hybrid',
    pi: 0.5,
    n: 100,
    exampleX: 58,
    get p(): number {
      return sampleProportion(this.exampleX, this.n); // 0.58
    },
    get se(): number {
      return standardErrorProportion(this.pi, this.n); // 0.05
    },
    get z(): number {
      return zSampleProportion(this.p, this.pi, this.n); // 1.60
    },
    get pGreater058(): number {
      return 1 - normalCdf(this.z); // 1 - 0.9452 = 0.0548
    },
  },
};
