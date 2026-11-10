import React from 'react';
import { ActivePage } from '../types';
import { theoryContents } from '../data/theoryContents';
import { TheoryPage } from './TheoryPage';
import type { DailyCheckResult } from '../components/DailyExercise';

// Entry point for the reading page. App.tsx lazy-loads this file, so the
// reading page and all topic content download together, only when needed.
interface TheoryRouteProps {
  topicId: string | null;
  onComplete: (xp: number) => void;
  setActivePage: (page: ActivePage) => void;
  isCompleted?: boolean;
  initialSectionId?: string | null;
  userId?: string | null;
  onDailyResult?: (result: DailyCheckResult & { selected: number }) => void;
}

export const TheoryRoute: React.FC<TheoryRouteProps> = ({ topicId, ...rest }) => (
  <TheoryPage theoryContent={theoryContents.find((t) => t.topicId === topicId) || theoryContents[0]} {...rest} />
);
