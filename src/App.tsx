/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ActivePage, Topic, TopicStatus, UserProfile } from './types';
import { initialUserProfile, mockTopics, theoryContents } from './data/mockData';
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

  // Sequential learning path states
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>('dasar-dasar-data');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const sortedTopics = [...mockTopics].sort((a, b) => a.order - b.order);
  const activeTopic = sortedTopics.find((t) => !completedTopicIds.includes(t.id)) || sortedTopics[0];

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const getTopicStatus = (topic: Topic): TopicStatus => {
    if (completedTopicIds.includes(topic.id)) {
      return 'selesai';
    }
    const lowerOrderTopics = mockTopics.filter((t) => t.order < topic.order);
    const allLowerCompleted = lowerOrderTopics.every((t) => completedTopicIds.includes(t.id));
    if (allLowerCompleted) {
      return 'aktif';
    }
    return 'terkunci';
  };

  const handleSelectTopic = (topicId: string) => {
    const targetTopic = mockTopics.find((t) => t.id === topicId);
    if (!targetTopic) return;
    const status = getTopicStatus(targetTopic);
    if (status === 'terkunci') {
      const prevTopic = sortedTopics.find((t) => t.order === targetTopic.order - 1);
      const prevTitle = prevTopic ? prevTopic.title : 'topik sebelumnya';
      showToast(`Satu langkah dulu ya. Selesaikan ${prevTitle} supaya materi berikutnya terasa lebih mudah.`);
      return;
    }
    setSelectedTopicId(topicId);
    if (targetTopic.contentType === 'teori') {
      setActivePage('teori');
    } else {
      setActivePage('practice');
    }
  };

  const handleOpenActiveTopic = () => {
    handleSelectTopic(activeTopic.id);
  };

  const handleAddXp = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      xp: prev.xp + amount,
    }));
    setRecentXpGained(amount);
  };

  const handleCompleteTheory = (xp: number) => {
    handleAddXp(xp);
    if (selectedTopicId && !completedTopicIds.includes(selectedTopicId)) {
      const updated = [...completedTopicIds, selectedTopicId];
      setCompletedTopicIds(updated);
      setUser((prev) => ({
        ...prev,
        masteredTopics: updated.length,
      }));
    }
  };

  const handleCompletePractice = (topicId: string) => {
    if (!completedTopicIds.includes(topicId)) {
      const updated = [...completedTopicIds, topicId];
      setCompletedTopicIds(updated);
      setUser((prev) => ({
        ...prev,
        masteredTopics: updated.length,
      }));
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
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased relative">
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
          onOpenActiveTopic={handleOpenActiveTopic}
        />
      )}

      {/* Main Pages */}
      <main className="flex-1 flex flex-col">
        {activePage === 'landing' && (
          <LandingPage
            setActivePage={setActivePage}
            onStartActiveTopic={handleOpenActiveTopic}
          />
        )}

        {activePage === 'topics' && (
          <TopicsPage
            user={user}
            setActivePage={setActivePage}
            onSelectTopic={handleSelectTopic}
            completedTopicIds={completedTopicIds}
            getTopicStatus={getTopicStatus}
            onOpenActiveTopic={handleOpenActiveTopic}
            onShowToast={showToast}
          />
        )}

        {activePage === 'practice' && (
          <PracticePage
            setActivePage={setActivePage}
            onAddXp={handleAddXp}
            selectedTopicId={selectedTopicId || activeTopic.id}
            onCompleteTopic={handleCompletePractice}
          />
        )}

        {activePage === 'teori' && (
          <TheoryPage
            theoryContent={
              theoryContents.find((t) => t.topicId === selectedTopicId) || theoryContents[0]
            }
            onComplete={handleCompleteTheory}
            setActivePage={setActivePage}
            isCompleted={Boolean(selectedTopicId && completedTopicIds.includes(selectedTopicId))}
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

      {/* Toast Notification for Locked Topic Guidance */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] px-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="bg-surface-container-highest text-on-surface border border-outline-variant/80 px-4 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-snug flex-1">
              {toastMessage}
            </p>
            <button
              onClick={() => setToastMessage(null)}
              className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors"
              aria-label="Tutup pesan"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
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
