export type ActivePage = 'landing' | 'topics' | 'practice' | 'profile' | 'auth';

export type DifficultyTier = 'mudah' | 'sedang' | 'sulit' | 'sangat_sulit';

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

export interface Topic {
  id: string;
  category: 'statistika' | 'kalkulus_aljabar';
  title: string;
  badge: string;
  badgeType: 'skripsi' | 'fondasi' | 'praktikum' | 'hubungan' | 'logika' | 'lanjutan';
  description: string;
  progressPercent: number;
  progressLabel: string;
  unlockedTiers: DifficultyTier[];
  modulesCount: number;
  iconName: string;
  statusAction: 'lanjut' | 'pelajari' | 'mulai' | 'ulang';
  excelSpssAvailable?: boolean;
  thesisTag?: string;
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
