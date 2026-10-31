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

/** 'terbuka' = would be locked, but opened by the admin unlock-all switch. */
export type TopicStatus = 'selesai' | 'aktif' | 'terbuka' | 'terkunci';

export interface Concept {
  id: string;
  title: string;
  summary: string;
  formula?: string;
  example?: string;
  binusContext?: string;
}

/** One Latihan Mandiri question (multiple choice, 4 options shown as A–D). */
export interface PracticeQuestion {
  /** e.g. 'T3-L04' = topic 3, tier Sulit (L), question 4 */
  id: string;
  topicId: string;
  tier: DifficultyTier;
  /** Question text; supports **bold** and line breaks. */
  prompt: string;
  /** Optional data block (table, list of values), shown in monospace. */
  data?: string;
  options: string[];
  hint?: string;
  formula?: string;
  /** Optional link to a glossary concept in data/concepts.ts. */
  conceptId?: string;
  // The answer key and worked solution stay on the server; see PracticeCheckResult.
}

/** Response of POST /api/practice/check. */
export interface PracticeCheckResult {
  questionId: string;
  correct: boolean;
  /** Index (0–3) of the correct option. */
  answer: number;
  /** Worked solution shown after checking the answer. */
  explanation: string;
  /** Only for signed-in students: XP the server awarded for this answer (0 if none). */
  xpAwarded?: number;
}

export interface TheoryExample {
  label: string;
  text: string;
}

/** Picture shown under a step card; `type` is a key in components/StepVisuals.tsx. */
export interface StepVisualRef {
  type: string;
  step: number;
}

export interface HowToMakeStep {
  step: number;
  title: string;
  instruction: string;
  stepVisual?: StepVisualRef;
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
  stepVisual?: StepVisualRef;
}

export interface HowToMakeGroup {
  title: string;
  icon?: string;
  steps: CalculationStep[];
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
  howToMakeGroups?: HowToMakeGroup[];
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
    | 'sampling-distribution-concept'
    | 'standard-error-mean'
    | 'central-limit-theorem'
    | 'sample-mean-z'
    | 'sample-mean-interval'
    | 'sample-proportion'
    | 'proportion-z'
    | 'ci-coverage'
    | 'ci-sigma-known'
    | 't-distribution'
    | 'ci-sigma-unknown'
    | 'ci-proportion'
    | 'sample-size-mean'
    | 'sample-size-proportion'
    | string;
}

export interface TheoryContent {
  topicId: string;
  topicTitle: string;
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
  /** Reading time shown on the topic card and the reading page. */
  estimatedReadMinutes?: number;
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
  /** Reminder preferences on the profile page. */
  emailDigest?: boolean;
  whatsappPing?: boolean;
}
