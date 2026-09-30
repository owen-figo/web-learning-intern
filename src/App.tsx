/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ActivePage, UserProfile } from './types';
import { initialUserProfile } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { TopicsPage } from './pages/TopicsPage';
import { PracticePage } from './pages/PracticePage';
import { ProfilePage } from './pages/ProfilePage';
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

  const handleAddXp = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
    setRecentXpGained(amount);
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
        Practice mode has its own dedicated distraction-free breadcrumb bar as depicted in Image 1.
      */}
      {activePage !== 'practice' && (
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
            onSelectTopic={(_topicId) => {
              setActivePage('practice');
            }}
          />
        )}

        {activePage === 'practice' && (
          <PracticePage
            setActivePage={setActivePage}
            onAddXp={handleAddXp}
          />
        )}

        {activePage === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Shared Footer (Shown on all pages) */}
      <Footer
        setActivePage={setActivePage}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onOpenPrivacy={() => setInfoModalType('privacy')}
        onOpenHelp={() => setInfoModalType('help')}
      />

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
