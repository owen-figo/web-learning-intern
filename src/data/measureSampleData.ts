// Sample data and shared statistical calculations for "Ukuran Deskriptif Numerik"

export interface DataPoint {
  id: string;
  value: number;
}

// Dataset A: "Waktu tempuh ke kampus (menit)", n = 7
// 12, 15, 18, 20, 20, 25, 30
export const datasetA = {
  name: 'Waktu tempuh ke kampus (menit)',
  unit: 'menit',
  n: 7,
  rawValues: [12, 15, 18, 20, 20, 25, 30],
  expected: {
    mean: 20,
    median: 20,
    mode: 20,
    range: 18,
    sumSquaredDeviations: 218,
    sampleVariance: 36.33,
    sampleSd: 6.03,
    cv: 30.14,
    zOf30: 1.66,
    zOf12: -1.33,
    populationVariance: 31.14,
    populationSd: 5.58,
  },
  deviations: [
    { x: 12, dev: -8, devSq: 64 },
    { x: 15, dev: -5, devSq: 25 },
    { x: 18, dev: -2, devSq: 4 },
    { x: 20, dev: 0, devSq: 0 },
    { x: 20, dev: 0, devSq: 0 },
    { x: 25, dev: 5, devSq: 25 },
    { x: 30, dev: 10, devSq: 100 },
  ],
};

// Dataset B: "Waktu mengerjakan tugas (menit)", n = 11
// 12, 15, 18, 20, 22, 25, 27, 30, 34, 40, 55
export const datasetB = {
  name: 'Waktu mengerjakan tugas (menit)',
  unit: 'menit',
  n: 11,
  rawValues: [12, 15, 18, 20, 22, 25, 27, 30, 34, 40, 55],
  expected: {
    xSmallest: 12,
    q1: 18, // 3rd value (pos (11+1)/4 = 3)
    median: 25, // 6th value (pos (11+1)/2 = 6)
    q3: 34, // 9th value (pos 3(11+1)/4 = 9)
    xLargest: 55,
    iqr: 16, // 34 - 18
    mean: 27.09, // 298 / 11
    skewness: 'right-skewed (Mean > Median)',
  },
};

// Growth rates: +10%, -5%, +20% over 3 years
export const growthRatesData = {
  rates: [0.10, -0.05, 0.20],
  rateLabels: ['+10%', '-5%', '+20%'],
  years: 3,
  expected: {
    arithmeticMean: 8.33,
    geometricMean: 7.84,
    product: 1.254,
  },
};

// CV Comparison: Tinggi Badan vs Berat Badan
export const cvComparisonData = {
  tinggi: {
    name: 'Tinggi Badan',
    mean: 165,
    sd: 6,
    unit: 'cm',
    cv: 3.64,
  },
  berat: {
    name: 'Berat Badan',
    mean: 60,
    sd: 9,
    unit: 'kg',
    cv: 15.00,
  },
};

// Z-Score Bell Curve Demo
export const zScoreDemoData = {
  name: 'Nilai Ujian Statistika',
  mean: 70,
  sd: 10,
  unit: 'poin',
};

// Covariance and Correlation Data: Jam Belajar (X) vs Nilai Ujian (Y)
export const studyExamData = {
  pairs: [
    { id: 1, x: 3, y: 55 },
    { id: 2, x: 5, y: 60 },
    { id: 3, x: 6, y: 58 },
    { id: 4, x: 8, y: 66 },
    { id: 5, x: 10, y: 70 },
    { id: 6, x: 12, y: 72 },
    { id: 7, x: 14, y: 75 },
    { id: 8, x: 15, y: 78 },
    { id: 9, x: 17, y: 80 },
    { id: 10, x: 20, y: 85 },
    { id: 11, x: 22, y: 83 },
    { id: 12, x: 25, y: 90 },
  ],
  n: 12,
  expected: {
    meanX: 13.08,
    meanY: 72.67,
    covXY: 77.49,
    sdX: 7.15,
    sdY: 11.08,
    r: 0.98,
  },
};
