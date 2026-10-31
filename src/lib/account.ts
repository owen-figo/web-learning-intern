import type { UserProfile } from '../types';
import { api } from './api';
import { authApi } from './auth';

// The signed-in student's data in the database (backend routes under /api/progress and /api/profile).

export interface SavedAnswer {
  selected: number;
  correct: boolean;
}

/** GET /api/progress */
export interface AccountProgress {
  id: string;
  name: string;
  initials: string | null;
  avatarColor: string;
  xp: number;
  streakDays: number;
  bestStreak: number;
  emailDigest: boolean;
  whatsappPing: boolean;
  completedTopicIds: string[];
  answers: Record<string, SavedAnswer>;
}

export type ProfileChanges = Partial<Pick<UserProfile, 'name' | 'initials' | 'avatarColor' | 'emailDigest' | 'whatsappPing'>>;

export interface LeaderboardRow {
  rank: number;
  id: string;
  name: string;
  initials: string | null;
  avatarColor: string;
  xp: number;
}

export const loadProgress = () => authApi<AccountProgress>('/api/progress');

export const saveProfile = (changes: ProfileChanges) =>
  authApi<{ ok: true }>('/api/profile', { method: 'PATCH', body: JSON.stringify(changes) });

export const completeTopic = (topicId: string) =>
  authApi<{ topicId: string; xpAwarded: number }>('/api/progress/topics', { method: 'POST', body: JSON.stringify({ topicId }) });

export const loadLeaderboard = () => api<{ entries: LeaderboardRow[] }>('/api/leaderboard');

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.trim().slice(0, 2)).toUpperCase();
}

const TOTAL_PRACTICE_QUESTIONS = 320;

/** Profile numbers that come from the practice answers. */
export function practiceStats(answers: Record<string, SavedAnswer>): Pick<UserProfile, 'questionsDone' | 'selfCheckPercentage' | 'understandingScore'> {
  const all = Object.values(answers);
  const correct = all.filter((a) => a.correct).length;
  return {
    questionsDone: all.length,
    selfCheckPercentage: Math.round((all.length / TOTAL_PRACTICE_QUESTIONS) * 100),
    understandingScore: all.length ? Math.round((correct / all.length) * 100) : 0,
  };
}

const LEVELS = [
  { min: 0, title: 'Pemula Data' },
  { min: 100, title: 'Penjelajah Konsep' },
  { min: 300, title: 'Penyelaras Logika' },
  { min: 600, title: 'Analis Muda' },
  { min: 1000, title: 'Ahli Statistika' },
];

/** Level fields of the profile, derived from total XP. */
export function levelFor(xp: number): Pick<UserProfile, 'level' | 'maxLevel' | 'levelTitle' | 'nextLevelTitle' | 'levelProgressPercent'> {
  const i = LEVELS.reduce((found, l, idx) => (xp >= l.min ? idx : found), 0);
  const next = LEVELS[i + 1];
  return {
    level: i + 1,
    maxLevel: LEVELS.length,
    levelTitle: LEVELS[i].title,
    nextLevelTitle: next?.title ?? LEVELS[i].title,
    levelProgressPercent: next ? Math.floor(((xp - LEVELS[i].min) / (next.min - LEVELS[i].min)) * 100) : 100,
  };
}
