import type { SavedAnswer } from './account';
import { practiceQuestionsFor, practiceTopicOf } from './practiceBank';
import { mockTopics } from '../data/mockData';

// Achievements on the profile page, earned from the student's real data: saved practice answers,
// finished topics, best streak. Question ids look like 'T3-L04' (topic 3, tier L, question 4);
// tiers: M = Mudah, S = Sedang, L = Sulit, X = Sangat Sulit.

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Tile colour once earned. */
  bgClass: string;
  current: number;
  target: number;
  unlocked: boolean;
}

/** Share of the material (topics read to the end) needed for "Siap Ujian". */
const EXAM_READY_SHARE = 0.85;

interface AchievementInput {
  answers: Record<string, SavedAnswer>;
  completedTopicIds: string[];
  bestStreak: number;
}

export function computeAchievements({ answers, completedTopicIds, bestStreak }: AchievementInput): Achievement[] {
  const entries = Object.entries(answers);
  const correct = entries.filter(([, a]) => a.correct);
  const veryHardCorrect = correct.filter(([id]) => /^T\d+-X/.test(id)).length;
  const descriptive = mockTopics.filter((t) => t.subCategory === 'deskriptif');
  const descriptiveDone = descriptive.filter((t) => completedTopicIds.includes(t.id)).length;
  // Siap Ujian: 85% of all topics read to the end, rounded up (7 of 8).
  const examReadyTarget = Math.ceil(mockTopics.length * EXAM_READY_SHARE);

  const list: Omit<Achievement, 'unlocked'>[] = [
    {
      id: 'langkah-pertama',
      title: 'Langkah Pertama',
      description: 'Jawab soal latihan pertamamu. Benar atau salah, yang penting mencoba.',
      icon: 'footprint',
      bgClass: 'bg-primary-fixed',
      current: entries.length,
      target: 1,
    },
    {
      id: 'pembaca-tekun',
      title: 'Pembaca Tekun',
      description: 'Selesaikan bacaan satu topik sampai akhir.',
      icon: 'auto_stories',
      bgClass: 'bg-primary-fixed',
      current: completedTopicIds.length,
      target: 1,
    },
    {
      id: 'teliti',
      title: 'Teliti',
      description: 'Kumpulkan 10 jawaban benar pada percobaan pertama.',
      icon: 'verified',
      bgClass: 'bg-secondary-fixed',
      current: correct.length,
      target: 10,
    },
    {
      id: 'konsisten-5',
      title: 'Konsisten 5 Hari',
      description: 'Belajar 5 hari berturut-turut, cukup satu soal atau satu materi per hari.',
      icon: 'local_fire_department',
      bgClass: 'bg-secondary-fixed/60',
      current: bestStreak,
      target: 5,
    },
    {
      id: 'rajin-berlatih',
      title: 'Rajin Berlatih',
      description: 'Jawab 50 soal Latihan Mandiri.',
      icon: 'fact_check',
      bgClass: 'bg-[#E8F5F1]',
      current: entries.filter(([id]) => practiceTopicOf(id) !== null).length,
      target: 50,
    },
    {
      id: 'sangat-sulit',
      title: 'Ketenangan Sangat Sulit',
      description: 'Jawab benar satu soal tingkat Sangat Sulit.',
      icon: 'psychology',
      bgClass: 'bg-secondary-fixed',
      current: veryHardCorrect,
      target: 1,
    },
    {
      id: 'master-deskriptif',
      title: 'Master Statistika Deskriptif',
      description: `Selesaikan bacaan ${descriptive.length} topik Statistika Deskriptif.`,
      icon: 'workspace_premium',
      bgClass: 'bg-primary-fixed',
      current: descriptiveDone,
      target: descriptive.length,
    },
    {
      id: 'siap-ujian',
      title: 'Siap Ujian',
      description: `Selesaikan ${Math.round(EXAM_READY_SHARE * 100)}% materi: bacaan ${examReadyTarget} dari ${mockTopics.length} topik.`,
      icon: 'school',
      bgClass: 'bg-secondary-fixed',
      current: completedTopicIds.filter((id) => mockTopics.some((t) => t.id === id)).length,
      target: examReadyTarget,
    },
  ];

  return list.map((a) => ({ ...a, current: Math.min(a.current, a.target), unlocked: a.current >= a.target }));
}

export interface TopicProgress {
  topicId: string;
  order: number;
  title: string;
  icon: string;
  readingDone: boolean;
  answered: number;
  correct: number;
  total: number;
}

/** Per topic: reading finished, practice questions answered and how many were right. */
export function topicProgress(answers: Record<string, SavedAnswer>, completedTopicIds: string[]): TopicProgress[] {
  return [...mockTopics]
    .sort((a, b) => a.order - b.order)
    .map((t) => {
      const mine = Object.entries(answers).filter(([id]) => practiceTopicOf(id) === t.order);
      return {
        topicId: t.id,
        order: t.order,
        title: t.title,
        icon: t.iconName,
        readingDone: completedTopicIds.includes(t.id),
        answered: mine.length,
        correct: mine.filter(([, a]) => a.correct).length,
        total: practiceQuestionsFor(t.order),
      };
    });
}
