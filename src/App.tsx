/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy, useState, useEffect, useRef } from 'react';
import { ActivePage, Topic, TopicStatus, UserProfile } from './types';
import { initialUserProfile, mockTopics, mockLeaderboardEntries } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { TopicsPage } from './pages/TopicsPage';
import { AuthModal } from './components/AuthModal';
import { FormulaModal } from './components/FormulaModal';
import { InfoModal } from './components/InfoModal';

// Pages other than the landing and topic list are code-split: they download on first visit.
const PracticePage = lazy(() => import('./pages/PracticePage').then((m) => ({ default: m.PracticePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const TheoryRoute = lazy(() => import('./pages/TheoryRoute').then((m) => ({ default: m.TheoryRoute })));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage })));

// Admin "buka semua topik" switch. Front-end only: it changes what this browser
// shows, it is not access control. The switch is shown when the page is opened
// with ?admin in the URL (or once admin mode has been turned on in this browser).
const ADMIN_UNLOCK_KEY = 'ngerti.adminUnlockAll';

function readAdminUnlock(): boolean {
  try {
    return window.localStorage.getItem(ADMIN_UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function writeAdminUnlock(on: boolean) {
  try {
    if (on) window.localStorage.setItem(ADMIN_UNLOCK_KEY, '1');
    else window.localStorage.removeItem(ADMIN_UNLOCK_KEY);
  } catch {
    /* penyimpanan diblokir: mode admin tetap berlaku sampai halaman dimuat ulang */
  }
}

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [user, setUser] = useState<UserProfile>(initialUserProfile);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState<boolean>(false);
  const [infoModalType, setInfoModalType] = useState<'privacy' | 'help' | null>(null);
  const [recentXpGained, setRecentXpGained] = useState<number>(0);
  const [recentXpKey, setRecentXpKey] = useState<number>(0);
  const recentXpTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sequential learning path states
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(
    'mendefinisikan-mengumpulkan-data'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [adminUnlockAll, setAdminUnlockAll] = useState<boolean>(readAdminUnlock);
  const [showAdminSwitch] = useState<boolean>(
    () => readAdminUnlock() || new URLSearchParams(window.location.search).has('admin')
  );

  const toggleAdminUnlock = () => {
    setAdminUnlockAll((prev) => {
      writeAdminUnlock(!prev);
      return !prev;
    });
  };

  const sortedTopics = [...mockTopics].sort((a, b) => a.order - b.order);
  const activeTopic = sortedTopics.find((t) => !completedTopicIds.includes(t.id)) || sortedTopics[0];

  useEffect(() => {
    return () => {
      if (recentXpTimerRef.current) {
        clearTimeout(recentXpTimerRef.current);
      }
    };
  }, []);

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
    return adminUnlockAll ? 'terbuka' : 'terkunci';
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
      weeklyXp: (prev.weeklyXp ?? 50) + amount,
    }));

    if (recentXpTimerRef.current) {
      clearTimeout(recentXpTimerRef.current);
    }
    setRecentXpGained(amount);
    setRecentXpKey((prev) => prev + 1);
    recentXpTimerRef.current = setTimeout(() => {
      setRecentXpGained(0);
    }, 2000);
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

  // Latihan Mandiri: open practice on the requested topic, falling back to the
  // currently selected topic and then the active (next) topic if it is locked.
  const handleOpenPractice = (topicId?: string) => {
    const isOpen = (id?: string | null) => {
      const t = id ? mockTopics.find((x) => x.id === id) : undefined;
      return Boolean(t && getTopicStatus(t) !== 'terkunci');
    };
    const target = isOpen(topicId) ? topicId! : isOpen(selectedTopicId) ? selectedTopicId! : activeTopic.id;
    setSelectedTopicId(target);
    setActivePage('practice');
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
          recentXpKey={recentXpKey}
          onOpenActiveTopic={handleOpenActiveTopic}
          onOpenPractice={() => handleOpenPractice()}
        />
      )}

      {/* Main Pages */}
      <main className="flex-1 flex flex-col">
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center py-24" role="status" aria-live="polite">
              <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <span className="sr-only">Memuat halaman…</span>
            </div>
          }
        >
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
            adminUnlockAll={adminUnlockAll}
            showAdminSwitch={showAdminSwitch}
            onToggleAdminUnlock={toggleAdminUnlock}
            onOpenActiveTopic={handleOpenActiveTopic}
            onOpenPractice={handleOpenPractice}
            onShowToast={showToast}
          />
        )}

        {activePage === 'practice' && (
          <PracticePage
            setActivePage={setActivePage}
            onAddXp={handleAddXp}
            initialTopicId={selectedTopicId || activeTopic.id}
            onTopicChange={setSelectedTopicId}
            getTopicStatus={getTopicStatus}
            adminUnlockAll={adminUnlockAll}
            user={user}
          />
        )}

        {activePage === 'teori' && (
          <TheoryRoute
            topicId={selectedTopicId}
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

        {activePage === 'leaderboard' && (
          <LeaderboardPage
            user={user}
            mockEntries={mockLeaderboardEntries}
          />
        )}
        </Suspense>
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
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <p className="text-xs sm:text-sm text-on-surface leading-snug flex-1">
              {toastMessage}
            </p>
            <button
              onClick={() => setToastMessage(null)}
              className="text-outline hover:text-on-surface p-1 rounded-lg transition-colors"
              aria-label="Tutup pesan"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
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
