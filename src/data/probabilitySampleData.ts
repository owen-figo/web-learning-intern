// Shared sample data for "Probabilitas Dasar"

export interface ContingencyCell {
  rutinLolos: number; // Rutin & ≥70
  rutinGagal: number; // Rutin & <70
  tidakRutinLolos: number; // Tidak Rutin & ≥70
  tidakRutinGagal: number; // Tidak Rutin & <70
}

export const tableASampleData: ContingencyCell = {
  rutinLolos: 90,
  rutinGagal: 30,
  tidakRutinLolos: 20,
  tidakRutinGagal: 60,
};

export const tableBSampleData: ContingencyCell = {
  rutinLolos: 66,
  rutinGagal: 54,
  tidakRutinLolos: 44,
  tidakRutinGagal: 36,
};

export interface DecisionTreeNode {
  id: string;
  label: string;
  type: 'root' | 'marginal' | 'conditional' | 'leaf';
  probability?: number;
  probFormula?: string;
  pathProb?: number;
  description?: string;
  children?: DecisionTreeNode[];
}

export const tableADecisionTree: DecisionTreeNode = {
  id: 'root',
  label: '200 Mahasiswa',
  type: 'root',
  children: [
    {
      id: 'branch-rutin',
      label: 'Belajar Rutin',
      type: 'marginal',
      probability: 0.60,
      probFormula: 'P(Rutin) = 120 / 200 = 0.60',
      description: 'Peluang marginal mahasiswa belajar rutin',
      children: [
        {
          id: 'leaf-rutin-lolos',
          label: 'Nilai ≥ 70',
          type: 'leaf',
          probability: 0.75,
          probFormula: 'P(≥70 | Rutin) = 90 / 120 = 0.75',
          pathProb: 0.45,
          description: 'P(Rutin and ≥70) = 0.60 × 0.75 = 0.45 (90/200)',
        },
        {
          id: 'leaf-rutin-gagal',
          label: 'Nilai < 70',
          type: 'leaf',
          probability: 0.25,
          probFormula: 'P(<70 | Rutin) = 30 / 120 = 0.25',
          pathProb: 0.15,
          description: 'P(Rutin and <70) = 0.60 × 0.25 = 0.15 (30/200)',
        },
      ],
    },
    {
      id: 'branch-tidak-rutin',
      label: 'Tidak Rutin',
      type: 'marginal',
      probability: 0.40,
      probFormula: 'P(Tidak Rutin) = 80 / 200 = 0.40',
      description: 'Peluang marginal mahasiswa tidak rutin belajar',
      children: [
        {
          id: 'leaf-tidak-lolos',
          label: 'Nilai ≥ 70',
          type: 'leaf',
          probability: 0.25,
          probFormula: 'P(≥70 | Tidak Rutin) = 20 / 80 = 0.25',
          pathProb: 0.10,
          description: 'P(Tidak Rutin and ≥70) = 0.40 × 0.25 = 0.10 (20/200)',
        },
        {
          id: 'leaf-tidak-gagal',
          label: 'Nilai < 70',
          type: 'leaf',
          probability: 0.75,
          probFormula: 'P(<70 | Tidak Rutin) = 60 / 80 = 0.75',
          pathProb: 0.30,
          description: 'P(Tidak Rutin and <70) = 0.40 × 0.75 = 0.30 (60/200)',
        },
      ],
    },
  ],
};

export const coinTossDecisionTree: DecisionTreeNode = {
  id: 'coin-root',
  label: 'Lemparan Koin 2x',
  type: 'root',
  children: [
    {
      id: 'coin-toss1-k',
      label: 'Lemparan 1: Kepala (K)',
      type: 'marginal',
      probability: 0.50,
      probFormula: 'P(K₁) = 0.50',
      description: 'Peluang lemparan pertama muncul Kepala',
      children: [
        {
          id: 'coin-leaf-kk',
          label: 'Lemparan 2: Kepala (K)',
          type: 'leaf',
          probability: 0.50,
          probFormula: 'P(K₂ | K₁) = 0.50 = P(K₂)',
          pathProb: 0.25,
          description: 'P(K₁ and K₂) = 0.50 × 0.50 = 0.25',
        },
        {
          id: 'coin-leaf-kb',
          label: 'Lemparan 2: Buntut (B)',
          type: 'leaf',
          probability: 0.50,
          probFormula: 'P(B₂ | K₁) = 0.50 = P(B₂)',
          pathProb: 0.25,
          description: 'P(K₁ and B₂) = 0.50 × 0.50 = 0.25',
        },
      ],
    },
    {
      id: 'coin-toss1-b',
      label: 'Lemparan 1: Buntut (B)',
      type: 'marginal',
      probability: 0.50,
      probFormula: 'P(B₁) = 0.50',
      description: 'Peluang lemparan pertama muncul Buntut',
      children: [
        {
          id: 'coin-leaf-bk',
          label: 'Lemparan 2: Kepala (K)',
          type: 'leaf',
          probability: 0.50,
          probFormula: 'P(K₂ | B₁) = 0.50 = P(K₂)',
          pathProb: 0.25,
          description: 'P(B₁ and K₂) = 0.50 × 0.50 = 0.25',
        },
        {
          id: 'coin-leaf-bb',
          label: 'Lemparan 2: Buntut (B)',
          type: 'leaf',
          probability: 0.50,
          probFormula: 'P(B₂ | B₁) = 0.50 = P(B₂)',
          pathProb: 0.25,
          description: 'P(B₁ and B₂) = 0.50 × 0.50 = 0.25',
        },
      ],
    },
  ],
};

export const diceSampleSpace = [
  { value: 1, isEven: false, greaterThan3: false },
  { value: 2, isEven: true, greaterThan3: false },
  { value: 3, isEven: false, greaterThan3: false },
  { value: 4, isEven: true, greaterThan3: true },
  { value: 5, isEven: false, greaterThan3: true },
  { value: 6, isEven: true, greaterThan3: true },
];
