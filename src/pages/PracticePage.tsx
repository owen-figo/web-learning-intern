import React, { useState, useEffect } from 'react';
import { ActivePage, DifficultyTier, Question, Concept, UserProfile } from '../types';
import { sampleQuestions } from '../data/mockData';
import { getConceptById, getAllConcepts } from '../data/concepts';
import { ConceptModal } from '../components/ConceptModal';

interface PracticePageProps {
  setActivePage: (page: ActivePage) => void;
  onAddXp?: (amount: number) => void;
  selectedTopicId?: string;
  onCompleteTopic?: (topicId: string) => void;
  user?: UserProfile;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  setActivePage,
  onAddXp,
  selectedTopicId = 'mendefinisikan-mengumpulkan-data',
  onCompleteTopic,
  user,
}) => {
  const activeTopicQuestions = sampleQuestions.filter((q) => q.topicId === selectedTopicId);
  const questionsToUse = activeTopicQuestions.length > 0
    ? activeTopicQuestions
    : sampleQuestions.filter((q) => q.topicId === 'statistika-deskriptif');

  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('mudah');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    questionsToUse[0]?.options[0]?.id || 'opt-a'
  );
  const [reflectionConfirmed, setReflectionConfirmed] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(true);
  const [xpBonusClaimed, setXpBonusClaimed] = useState<boolean>(false);
  const [completedQuestions, setCompletedQuestions] = useState<number[]>([]);

  // Concept Modal State
  const [activeConceptModalId, setActiveConceptModalId] = useState<string | null>(null);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);

  // Mobile Bantuan Accordion
  const [mobileBantuanOpen, setMobileBantuanOpen] = useState<boolean>(false);

  // Inline Notification Toast (replaces window.alert)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const qList = sampleQuestions.filter((q) => q.topicId === selectedTopicId);
    const targetList = qList.length > 0 ? qList : sampleQuestions;
    setCurrentQuestionIndex(0);
    const targetQ = targetList[0];
    if (targetQ) {
      setSelectedOptionId(targetQ.options[0]?.id || 'opt-a');
    }
    setReflectionConfirmed(false);
    setCompletedQuestions([]);
    setXpBonusClaimed(false);
  }, [selectedTopicId]);

  const currentQ: Question = questionsToUse[currentQuestionIndex] || questionsToUse[0];
  const isCorrect = selectedOptionId === currentQ.correctOptionId;

  // Retrieve matching concept
  const relatedConcept: Concept | undefined = currentQ.conceptId
    ? getConceptById(currentQ.conceptId)
    : undefined;

  const handleOpenConcept = (conceptId?: string) => {
    setActiveConceptModalId(conceptId || 'variabel-kategorikal-numerik');
    setIsConceptModalOpen(true);
  };

  const handleSelectOption = (optId: string) => {
    setSelectedOptionId(optId);
  };

  const handleConfirmReflection = () => {
    setReflectionConfirmed(true);
    if (!xpBonusClaimed && onAddXp) {
      onAddXp(currentQ.positiveFeedback.bonusXp);
      setXpBonusClaimed(true);
    }
  };

  const handleNextQuestion = () => {
    if (!completedQuestions.includes(currentQuestionIndex)) {
      setCompletedQuestions([...completedQuestions, currentQuestionIndex]);
    }
    if (onAddXp) {
      onAddXp(35);
    }
    if (currentQuestionIndex < questionsToUse.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOptionId(questionsToUse[nextIndex].options[0].id);
      setReflectionConfirmed(false);
      setXpBonusClaimed(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (onCompleteTopic && selectedTopicId) {
        onCompleteTopic(selectedTopicId);
      }
      setActivePage('topics');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedOptionId(questionsToUse[prevIndex].correctOptionId);
      setReflectionConfirmed(true);
      setXpBonusClaimed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Toast Notification Container */}
      {toastMessage && (
        <aside
          role="status"
          className="fixed top-20 right-4 sm:right-6 md:right-8 z-50 max-w-sm w-[calc(100%-2rem)] md:w-96 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="bg-surface-container-lowest border border-primary/40 rounded-xl p-4 shadow-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
            <div className="flex-1 text-xs sm:text-sm text-on-surface leading-relaxed">
              {toastMessage}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-outline hover:text-on-surface"
              aria-label="Tutup notifikasi"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </aside>
      )}

      {/* Distraction-Free Header Breadcrumb Bar */}
      <nav
        aria-label="Navigasi Latihan"
        className="bg-surface-container-lowest border-b border-outline-variant/50 sticky top-0 z-30 shadow-xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('landing')}
              className="flex items-center gap-1.5 text-primary font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">
                N
              </span>
              <span>Ngerti</span>
            </button>
            <span className="text-outline-variant">/</span>
            <div className="hidden md:flex items-center gap-1.5 text-xs sm:text-sm text-on-surface-variant font-medium">
              <button onClick={() => setActivePage('topics')} className="hover:text-primary transition-colors">
                Topik
              </button>
              <span className="text-outline-variant text-xs">›</span>
              <button onClick={() => setActivePage('topics')} className="hover:text-primary transition-colors">
                {currentQ.topicName}
              </button>
              <span className="text-outline-variant text-xs">›</span>
              <span className="text-primary font-semibold">Latihan Mandiri</span>
            </div>
          </div>

          {/* Gamification Chips & Glosarium Shortcut */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={() => handleOpenConcept(currentQ.conceptId)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary-fixed/30 text-primary text-xs font-semibold hover:bg-primary-fixed hover:border-primary transition-colors"
              title="Buka Glosarium Istilah Statistika"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Glosarium Istilah</span>
            </button>

            {/* Streak Indicator Pill */}
            <div
              aria-label={`Streak ${user?.streakDays ?? 5} hari`}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-base sm:text-lg font-bold select-none shrink-0"
            >
              <span className="text-lg sm:text-xl leading-none">🔥</span>
              <span className="leading-none">{user?.streakDays ?? 5}</span>
            </div>

            {/* XP Indicator Pill */}
            <div
              aria-label={`Total ${user?.xp ?? 120} XP`}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-primary-fixed/40 text-primary text-base sm:text-lg font-bold select-none shrink-0"
            >
              <span
                className="material-symbols-outlined text-primary text-[20px] sm:text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span className="leading-none">{user?.xp ?? 120} XP</span>
            </div>
            <button
              onClick={() => setActivePage('topics')}
              className="flex items-center gap-1 text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-xs sm:text-sm font-medium"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              <span className="hidden sm:inline">Keluar Sesi</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container - Widened to max-w-7xl to line up with navbar */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 flex flex-col gap-6">
        {/* Tier Level Selector for Questions (Bebas Cemas) */}
        <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 sm:p-5 card-calm-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Pilih tingkat kesulitan soal:
            </span>
            <span className="text-xs text-primary flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
              <span>Bebas cemas: pilih tingkat sesuai kesiapan mentalmu saat berlatih</span>
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {/* Tier 1: Mudah (Active default) */}
            <div
              onClick={() => setSelectedTier('mudah')}
              className={`rounded-lg p-3 flex flex-col cursor-pointer transition-all ${
                selectedTier === 'mudah'
                  ? 'border-2 border-primary bg-primary-fixed/20 shadow-xs'
                  : 'border border-outline-variant/60 bg-surface-container-lowest hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-semibold text-primary flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                  <span>Mudah</span>
                </span>
                {selectedTier === 'mudah' ? (
                  <span className="text-[11px] text-primary font-medium bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-2xs">
                    Aktif
                  </span>
                ) : (
                  <span className="text-[11px] text-outline">Terbuka</span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant leading-snug">
                Rumus lengkap &amp; uraian variabel terpandu.
              </p>
            </div>

            {/* Tier 2: Sedang (Unlocked) */}
            <div
              onClick={() => setSelectedTier('sedang')}
              className={`rounded-lg p-3 flex flex-col cursor-pointer transition-all ${
                selectedTier === 'sedang'
                  ? 'border-2 border-primary bg-primary-fixed/20 shadow-xs'
                  : 'border border-outline-variant/60 bg-surface-container-lowest hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-on-surface flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                  <span>Sedang</span>
                </span>
                {selectedTier === 'sedang' ? (
                  <span className="text-[11px] text-primary font-medium bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-2xs">
                    Aktif
                  </span>
                ) : (
                  <span className="text-[11px] text-outline">Terbuka</span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant leading-snug">
                Variabel terlihat, rumus diingat mandiri.
              </p>
            </div>

            {/* Tier 3: Sulit (Unlocked) */}
            <div
              onClick={() => setSelectedTier('sulit')}
              className={`rounded-lg p-3 flex flex-col cursor-pointer transition-all ${
                selectedTier === 'sulit'
                  ? 'border-2 border-primary bg-primary-fixed/20 shadow-xs'
                  : 'border border-outline-variant/60 bg-surface-container-lowest hover:border-outline'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-on-surface flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                  <span>Sulit</span>
                </span>
                {selectedTier === 'sulit' ? (
                  <span className="text-[11px] text-primary font-medium bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-2xs">
                    Aktif
                  </span>
                ) : (
                  <span className="text-[11px] text-outline">Terbuka</span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-on-surface-variant leading-snug">
                Petunjuk bertahap (Clue Cooldown).
              </p>
            </div>

            {/* Tier 4: Sangat Sulit (Locked) */}
            <div
              onClick={() =>
                showToast(
                  'Selesaikan latihan tingkat Sulit dengan akurasi 80% untuk membuka tantangan Sangat Sulit.'
                )
              }
              className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-3 flex flex-col opacity-75 cursor-pointer hover:border-outline transition-all"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs sm:text-sm font-medium text-outline flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>Sangat Sulit</span>
                </span>
                <span className="text-[11px] text-outline">Terkunci</span>
              </div>
              <p className="text-[11px] sm:text-xs text-outline leading-snug">
                Raih 80% di tingkat Sulit untuk membuka tantangan.
              </p>
            </div>
          </div>
        </section>

        {/* Two-Column Responsive Grid Layout:
            - Left Column (lg:col-span-8, ~65%): Question Card, Options, Reflection, Navigation
            - Right Column (lg:col-span-4, ~35%): Sticky Bantuan Panel with Formula, Clue, and Concept Explainer
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: QUESTION CONTENT (65%) */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full">
            {/* Progress Indicator Rail */}
            <div className="flex items-center justify-between px-2 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm font-medium text-on-surface-variant">Langkah Soal:</span>
                <div className="flex items-center gap-2">
                  {questionsToUse.map((_, idx) => {
                    const isCompleted = completedQuestions.includes(idx);
                    const isActive = currentQuestionIndex === idx;

                    return (
                      <React.Fragment key={idx}>
                        {idx > 0 && (
                          <div
                            className={`w-3 sm:w-5 h-0.5 ${
                              isCompleted || isActive ? 'bg-primary-fixed' : 'bg-outline-variant/60'
                            }`}
                          ></div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentQuestionIndex(idx);
                            setSelectedOptionId(questionsToUse[idx].options[0].id);
                            setReflectionConfirmed(false);
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/40 shadow-sm'
                              : isCompleted
                              ? 'bg-primary-fixed text-primary'
                              : 'border border-outline-variant text-outline hover:border-primary'
                          }`}
                          title={`Soal ${idx + 1}`}
                        >
                          {isCompleted ? (
                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                          ) : (
                            idx + 1
                          )}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-outline font-medium">
                <span className="material-symbols-outlined text-base">timer</span>
                <span>Santai, tanpa batas waktu</span>
              </div>
            </div>

            {/* Main Question Interactive Bento Card */}
            <article className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 sm:p-8 card-calm-shadow flex flex-col gap-6 w-full">
              {/* Question Meta Header with Concept Link */}
              <div className="flex flex-col gap-2 border-b border-surface-container-high pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                      Latihan Konsep Dasar
                    </span>
                    {relatedConcept && (
                      <button
                        type="button"
                        onClick={() => handleOpenConcept(relatedConcept.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-primary text-[11px] font-medium hover:bg-primary-fixed transition-colors"
                        title="Klik untuk membaca penjelasan konsep ini"
                      >
                        <span className="material-symbols-outlined text-[13px]">school</span>
                        <span>{relatedConcept.title}</span>
                        <span className="material-symbols-outlined text-[12px]">info</span>
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-on-surface-variant font-code-formula">{currentQ.code}</span>
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-on-surface tracking-tight">
                  {currentQ.title}
                </h1>
              </div>

              {/* Natural Indonesian Question Narrative */}
              <div className="bg-surface-bright p-5 sm:p-6 rounded-xl border border-outline-variant/50">
                <p className="text-sm sm:text-base text-on-surface leading-relaxed">
                  {currentQ.narrative}
                </p>
                {relatedConcept && (
                  <div className="mt-3 pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                    <span className="text-xs text-outline">
                      Bingung dengan istilah soal ini?
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenConcept(relatedConcept.id)}
                      className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">help</span>
                      <span>Buka Penjelasan: {relatedConcept.title}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Multiple Choice Options Grid - Full width of column, 2 cols on md+ */}
              <div className="flex flex-col gap-3">
                <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center justify-between">
                  <span>Pilih Opsi Jawabanmu:</span>
                  <span className="text-xs text-outline font-normal">Pilih satu yang paling tepat</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 w-full">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.id)}
                        className={`flex items-start justify-between p-4 rounded-xl cursor-pointer transition-all w-full ${
                          isSelected
                            ? 'border-2 border-primary bg-primary-fixed/20 shadow-xs ring-2 ring-primary/20'
                            : 'border border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-bright'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 pr-2">
                          <span
                            className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold mt-0.5 ${
                              isSelected
                                ? 'bg-primary text-on-primary'
                                : 'border border-outline-variant text-on-surface-variant'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isSelected ? 'font-semibold text-primary' : 'text-on-surface'
                            }`}
                          >
                            {opt.text}
                          </span>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center mt-1 ${
                            isSelected
                              ? 'bg-primary text-on-primary'
                              : 'border-2 border-outline-variant'
                          }`}
                        >
                          {isSelected && (
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                              check
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reflective Step: 'Cek Jawabanmu' */}
              <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-on-surface font-semibold text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-primary text-lg">psychology</span>
                  <span>Refleksi Sebelum Konfirmasi:</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {currentQ.reflectionQuestion}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmReflection}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      reflectionConfirmed
                        ? 'bg-surface-container-lowest border-2 border-primary text-primary shadow-xs'
                        : 'bg-surface-container-lowest border border-outline-variant hover:border-primary text-on-surface-variant'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-base"
                      style={{ fontVariationSettings: reflectionConfirmed ? "'FILL' 1" : undefined }}
                    >
                      check_circle
                    </span>
                    <span>{currentQ.reflectionConfirmationText}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReflectionConfirmed(false)}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/80 text-on-surface-variant hover:text-on-surface text-xs sm:text-sm"
                  >
                    <span className="material-symbols-outlined text-base text-outline">refresh</span>
                    <span>{currentQ.reflectionRecalculateText}</span>
                  </button>
                </div>
              </div>

              {/* Positive Reinforcement Banner */}
              {reflectionConfirmed && isCorrect && (
                <div className="bg-primary-fixed/20 border border-primary-fixed-dim rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
                  <span className="text-xl select-none">🌟</span>
                  <div className="text-xs sm:text-sm text-on-surface space-y-1">
                    <p className="font-semibold text-primary">{currentQ.positiveFeedback.title}</p>
                    <p className="text-on-surface-variant leading-relaxed">
                      {currentQ.positiveFeedback.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Navigation Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={handlePrevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-lg border border-outline-variant/80 text-on-surface-variant text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    currentQuestionIndex === 0
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  <span>Kembali ke Soal Sebelumnya</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>
                    {currentQuestionIndex < questionsToUse.length - 1
                      ? 'Lanjut ke Soal Berikutnya'
                      : 'Selesaikan Topik Ini'}
                  </span>
                  <span className="text-xs bg-on-primary/20 px-2 py-0.5 rounded-full font-code-formula">
                    +35 XP
                  </span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </article>

            {/* Mobile & Tablet: Expandable Bantuan Section (lg:hidden) */}
            <div className="lg:hidden bg-surface-container-lowest border border-outline-variant/70 rounded-xl overflow-hidden card-calm-shadow">
              <button
                type="button"
                onClick={() => setMobileBantuanOpen(!mobileBantuanOpen)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
              >
                <div className="flex items-center gap-2.5 text-on-surface font-semibold text-sm">
                  <span className="material-symbols-outlined text-primary text-xl">help</span>
                  <span>Panel Bantuan, Rumus &amp; Konsep Terkait</span>
                </div>
                <span className="material-symbols-outlined text-outline">
                  {mobileBantuanOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {mobileBantuanOpen && (
                <div className="p-4 pt-0 border-t border-surface-container space-y-4">
                  {/* Mobile Concept Card */}
                  {relatedConcept && (
                    <div className="bg-primary-fixed/20 border border-primary/25 rounded-xl p-4 space-y-2 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                          Konsep yang Diuji
                        </span>
                        <span className="text-[11px] text-outline">Bahasa Manusia</span>
                      </div>
                      <h3 className="text-sm font-bold text-on-surface">{relatedConcept.title}</h3>
                      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                        {relatedConcept.summary}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenConcept(relatedConcept.id)}
                        className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest border border-primary/30 text-primary hover:bg-primary hover:text-on-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        <span>Pelajari Konsep Lengkap</span>
                      </button>
                    </div>
                  )}

                  {/* Mobile Formula / Guide */}
                  {currentQ.formulaGuide && selectedTier !== 'sulit' && (
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60 space-y-2">
                      <span className="text-xs font-semibold text-on-surface block">
                        Panduan Rumus ({selectedTier === 'mudah' ? 'Tingkat Mudah' : 'Tingkat Sedang'})
                      </span>
                      <div className="font-code-formula text-sm text-primary p-2.5 bg-surface-container-lowest rounded border border-outline-variant/40">
                        {currentQ.formulaGuide.formula}
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        {currentQ.formulaGuide.note}
                      </p>
                    </div>
                  )}

                  {/* Mobile Hint Step */}
                  {currentQ.hintStep1 && (
                    <div className="bg-secondary-fixed/30 border border-secondary-fixed-dim/60 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-secondary font-semibold text-xs">
                        <span className="material-symbols-outlined text-base">lightbulb</span>
                        <span>Petunjuk Langkah:</span>
                      </div>
                      <p className="text-xs text-on-secondary-fixed-variant leading-relaxed">
                        {currentQ.hintStep1}
                      </p>
                    </div>
                  )}

                  {/* Mobile Glossary Shortcut */}
                  <button
                    type="button"
                    onClick={() => handleOpenConcept()}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container border border-outline-variant/80 text-on-surface-variant hover:text-primary text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    <span>Buka Glosarium 16 Konsep Statistika</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY BANTUAN PANEL (lg:col-span-4, ~35%) */}
          <aside className="hidden lg:flex lg:col-span-4 sticky top-24 flex-col gap-4">
            {/* Panel Header Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-5 card-calm-shadow space-y-4">
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">Panel Bantuan &amp; Konsep</h2>
                    <span className="text-[11px] text-outline">Panduan belajar tanpa tekanan</span>
                  </div>
                </div>
              </div>

              {/* 1. Related Concept Card */}
              {relatedConcept ? (
                <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                      Konsep yang Diuji
                    </span>
                    <span className="text-[10px] text-primary bg-primary-fixed/40 px-2 py-0.5 rounded-full font-medium">
                      Penting
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-on-surface leading-snug">
                    {relatedConcept.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {relatedConcept.summary}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleOpenConcept(relatedConcept.id)}
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest border border-primary/30 text-primary hover:bg-primary hover:text-on-primary text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    <span>Pelajari Konsep: {relatedConcept.title.split(' ')[0]}</span>
                  </button>
                </div>
              ) : (
                <div className="bg-surface-container-low/50 border border-outline-variant/40 rounded-xl p-3 text-xs text-outline text-center">
                  Konsep umum statistika deskriptif
                </div>
              )}

              {/* 2. Formula & Variables for Current Tier */}
              {selectedTier !== 'sulit' && currentQ.formulaGuide ? (
                <div className="space-y-2 pt-1 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">functions</span>
                      <span>Panduan Rumus Terbuka</span>
                    </span>
                    <span className="text-[10px] text-outline bg-surface-container-low px-1.5 py-0.5 rounded">
                      {selectedTier === 'mudah' ? 'Tingkat Mudah' : 'Tingkat Sedang'}
                    </span>
                  </div>

                  <div className="font-code-formula text-xs text-primary bg-surface-container-low/80 p-3 rounded-lg border border-outline-variant/50 leading-relaxed overflow-x-auto">
                    {currentQ.formulaGuide.formula}
                  </div>

                  <div className="text-[11px] text-on-surface-variant bg-surface-container-low/40 p-2.5 rounded-lg border-l-2 border-primary leading-relaxed">
                    <strong className="text-on-surface">Catatan Penenang:</strong> {currentQ.formulaGuide.note}
                  </div>
                </div>
              ) : selectedTier === 'sulit' ? (
                <div className="space-y-1.5 pt-1 border-t border-surface-container">
                  <span className="text-xs font-semibold text-on-surface block">
                    Mode Latihan Sulit (Mandiri)
                  </span>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Rumus ditutup agar kamu melatih intuisi statistik secara mandiri. Gunakan petunjuk di bawah jika memerlukan arahan langkah.
                  </p>
                </div>
              ) : null}

              {/* 3. Clue / Hint Step */}
              {currentQ.hintStep1 && (
                <div className="space-y-2 pt-1 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        lightbulb
                      </span>
                      <span>Petunjuk Langkah 1</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-[11px] text-primary hover:underline font-medium"
                    >
                      {showHint ? 'Sembunyikan' : 'Buka'}
                    </button>
                  </div>

                  {showHint && (
                    <div className="bg-secondary-fixed/20 border border-secondary-fixed-dim/50 rounded-xl p-3 text-xs text-on-secondary-fixed-variant leading-relaxed animate-in fade-in">
                      {currentQ.hintStep1}
                    </div>
                  )}
                </div>
              )}

              {/* 4. Full Statistics Glossary Button */}
              <div className="pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => handleOpenConcept()}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary text-xs font-semibold transition-colors flex items-center justify-between border border-outline-variant/60"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">search</span>
                    <span>Cari Istilah di Glosarium (16 Konsep)</span>
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Reassurance Badge */}
            <div className="bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl p-4 text-center space-y-1">
              <span className="text-xs text-primary font-semibold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
                <span>Ritme Belajar Tenang</span>
              </span>
              <p className="text-[11px] text-outline leading-snug">
                Salah langkah adalah bagian alami dari proses paham. Tidak ada nilai merah atau pengurangan XP.
              </p>
            </div>
          </aside>
        </div>

        {/* Quiet Reassurance Footer Note */}
        <div className="text-center text-xs text-outline flex items-center justify-center gap-1.5 py-4">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <span>Belajar dengan tempo pribadimu. Setiap konsep di Ngerti dijelaskan dengan bahasa manusia.</span>
        </div>
      </main>

      {/* Concept Explainer Modal / Glossary Browser */}
      <ConceptModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        initialConceptId={activeConceptModalId}
      />
    </div>
  );
};
