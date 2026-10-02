/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActivePage, UserProfile } from './types';
import { initialUserProfile, theoryContents } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { TopicsPage } from './pages/TopicsPage';
import { PracticePage } from './pages/PracticePage';
import { ProfilePage } from './pages/ProfilePage';
import { TheoryPage } from './pages/TheoryPage';
import { AuthModal } from './components/AuthModal';
import { FormulaModal } from './components/FormulaModal';
import { InfoModal } from './components/InfoModal';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'help' | null>(null);
  const [recentXpGained, setRecentXpGained] = useState<number>(25);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('dasar-dasar-data');
  const [completedTheoryTopics, setCompletedTheoryTopics] = useState<string[]>([]);

  const handleAddXp = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
    setRecentXpGained(amount);
  };

  const handleCompleteTheory = (xp: number) => {
    handleAddXp(xp);
    if (!completedTheoryTopics.includes(selectedTopicId)) {
      setCompletedTheoryTopics((prev) => [...prev, selectedTopicId]);
    }
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const handleAuthSuccess = (name?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      const initials = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : name.substring(0, 2).toUpperCase();
      setUser((prev) => ({
        ...prev,
        name: name,
        initials: initials,
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased">
      {/* 
        Standard Top Navigation Bar:
        Shown on Landing, Topics, and Profile views.
        Practice mode and Theory mode have their own dedicated distraction-free navigation bars.
      */}
      {activePage !== 'practice' && activePage !== 'teori' && (
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          recentXpGained={recentXpGained}
        />
      )}

      {/* Main Pages */}
      <main className="flex-1 flex flex-col">
        {activePage === 'landing' && (
          <LandingPage
            setActivePage={setActivePage}
            onAddXp={handleAddXp}
          />
        )}

        {activePage === 'topics' && (
          <TopicsPage
            user={user}
            setActivePage={setActivePage}
            onSelectTopic={(topicId) => {
              setSelectedTopicId(topicId);
            }}
          />
        )}

        {activePage === 'practice' && (
          <PracticePage
            setActivePage={setActivePage}
            onAddXp={handleAddXp}
            selectedTopicId={selectedTopicId}
          />
        )}

        {activePage === 'teori' && (
          <TheoryPage
            theoryContent={
              theoryContents.find((t) => t.topicId === selectedTopicId) || theoryContents[0]
            }
            onComplete={handleCompleteTheory}
            setActivePage={setActivePage}
            isCompleted={completedTheoryTopics.includes(selectedTopicId)}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Shared Footer (Shown on landing, topics, profile, practice) */}
      {activePage !== 'teori' && (
        <Footer
          setActivePage={setActivePage}
          onOpenFormula={() => setIsFormulaOpen(true)}
          onOpenPrivacy={() => setInfoModalType('privacy')}
          onOpenHelp={() => setInfoModalType('help')}
        />
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <FormulaModal
        isOpen={isFormulaOpen}
        onClose={() => setIsFormulaOpen(false)}
      />

      <InfoModal
        type={infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
}
