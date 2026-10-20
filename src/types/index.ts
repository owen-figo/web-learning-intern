export type ActivePage = 'landing' | 'topics' | 'practice' | 'profile' | 'auth' | 'teori' | 'leaderboard';

export interface LeaderboardEntry {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  xp: number;
  weeklyXp: number;
}

export type DifficultyTier = 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit';

export type TopicStatus = 'selesai' | 'aktif' | 'terkunci';

export interface Concept {
  id: string;
  title: string;
  summary: string;
  formula?: string;
  example?: string;
  binusContext?: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;
  topicId: string;
  topicName: string;
  code: string;
  title: string;
  narrative: string;
  dataHighlight?: string;
  conceptId?: string;
  conceptIds?: string[];
  formulaGuide?: {
    formula: string;
    note: string;
  };
  options: ChoiceOption[];
  correctOptionId: string;
  hintStep1?: string;
  reflectionQuestion: string;
  reflectionConfirmationText: string;
  reflectionRecalculateText: string;
  positiveFeedback: {
    title: string;
    description: string;
    bonusXp: number;
  };
}

export interface TheoryExample {
  label: string;
  text: string;
}

export interface HowToMakeStep {
  step: number;
  title: string;
  instruction: string;
}

export interface FormulaSymbol {
  symbol: string;
  meaning: string;
}

export interface FormulaItem {
  label?: string;
  formula: string;
  note?: string;
  symbols?: FormulaSymbol[];
}

export interface CalculationStep {
  step: number;
  title: string;
  instruction: string;
  subSteps?: string[];
  substituted?: string;
}

export interface SummaryTableRow {
  ukuran: string;
  sampel: string;
  populasi?: string;
  catatan?: string;
}

export interface TheorySection {
  id: string;
  heading: string;
  group?: string;
  body: string;
  points?: string[];
  formula?: string;
  formulaNote?: string;
  formulaSymbols?: FormulaSymbol[];
  formulas?: FormulaItem[];
  stepsLabel?: string;
  howToMake?: {
    title?: string;
    steps: HowToMakeStep[];
  };
  steps?: CalculationStep[];
  examples?: TheoryExample[];
  terms?: { term: string; definition: string; example?: string }[];
  scenario?: string;
  visualStage?: number;
  summaryTable?: {
    columns: string[];
    rows: SummaryTableRow[];
  };
  visualType?:
    | 'jenis-variabel'
    | 'skala-pengukuran'
    | 'populasi-sampel'
    | 'metode-sampling'
    | 'jenis-error-sampling'
    | 'tabel-ringkasan-kontingensi'
    | 'bar-pie-chart'
    | 'pareto-chart'
    | 'side-by-side-bar'
    | 'stem-and-leaf'
    | 'distribusi-frekuensi'
    | 'histogram-polygon'
    | 'ogive-curve'
    | 'scatter-timeseries'
    | 'misleading-graphs'
    | 'mean-median-mode'
    | 'geometric-mean'
    | 'range'
    | 'variance-sd'
    | 'coefficient-of-variation'
    | 'z-score'
    | 'skewness'
    | 'kurtosis'
    | 'quartiles-iqr'
    | 'five-number-summary'
    | 'boxplot'
    | 'population-measures'
    | 'covariance'
    | 'correlation'
    | 'probability-scale'
    | 'jenis-probabilitas'
    | 'sample-space'
    | 'contingency-probability'
    | 'conditional-probability'
    | 'decision-tree'
    | 'independence'
    | 'multiplication-rule'
    | 'discrete-distribution'
    | 'binomial-conditions'
    | 'combination'
    | 'binomial-distribution'
    | 'binomial-mean-sd'
    | 'poisson-distribution'
    | 'poisson-area'
    | 'hypergeometric'
    | 'continuous-vs-discrete'
    | 'pdf-area'
    | 'normal-pdf'
    | 'z-transformation'
    | 'uniform-pdf'
    | 'uniform-stats'
    | 'exponential-pdf'
    | string;
}

export interface TheoryContent {
  topicId: string;
  topicTitle: string;
  estimatedReadMinutes: number;
  completionXp: number;
  sections: TheorySection[];
}

export interface Topic {
  id: string;
  order: number;
  category: 'statistika';
  subCategory?: 'deskriptif' | 'inferensial';
  title: string;
  badge: string;
  badgeType: 'skripsi' | 'fondasi' | 'praktikum' | 'hubungan' | 'logika' | 'lanjutan';
  description: string;
  progressPercent: number;
  progressLabel: string;
  unlockedTiers?: DifficultyTier[];
  modulesCount: number;
  iconName: string;
  statusAction: 'lanjut' | 'pelajari' | 'mulai' | 'ulang';
  excelSpssAvailable?: boolean;
  thesisTag?: string;
  contentType?: 'practice' | 'teori';
}

export interface BadgeItem {
  id: string;
  title: string;
  description: string;
  reward: string;
  icon: string;
  unlocked: boolean;
  bgClass?: string;
}

export interface LearningSession {
  id: string;
  title: string;
  timeAgo: string;
  questionsCompleted: number;
  tag: string;
  tagType: 'rileks' | 'baik' | 'diulang';
  icon: string;
}

export interface UserProfile {
  name: string;
  initials: string;
  avatarColor: string;
  university: string;
  major: string;
  verified: boolean;
  streakDays: number;
  personalRecordStreak: number;
  xp: number;
  weeklyXp?: number;
  level: number;
  maxLevel: number;
  levelTitle: string;
  nextLevelTitle: string;
  levelProgressPercent: number;
  questionsDone: number;
  selfCheckPercentage: number;
  masteredTopics: number;
  totalTopics: number;
  understandingScore: number;
}
