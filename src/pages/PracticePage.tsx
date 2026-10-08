import React, { useState, useEffect } from 'react';
import { ActivePage, DifficultyTier, Question } from '../types';
import { sampleQuestions } from '../data/mockData';

interface PracticePageProps {
  setActivePage: (page: ActivePage) => void;
  onAddXp?: (amount: number) => void;
  selectedTopicId?: string;
  onCompleteTopic?: (topicId: string) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  setActivePage,
  onAddXp,
  selectedTopicId = 'dasar-dasar-data',
  onCompleteTopic,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Distraction-Free Header Breadcrumb Bar */}
      <nav aria-label="Navigasi Latihan" className="bg-surface-container-lowest border-b border-outline-variant/50 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
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

          {/* Live Gamification Tickers & Safe Exit */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs sm:text-sm font-medium">
              <span className="text-base select-none">🔥</span>
              <span className="font-semibold">Streak 5 Hari</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed/40 text-primary text-xs sm:text-sm font-medium">
              <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <span className="font-semibold">120 XP</span>
              <span className="text-xs bg-primary-container text-on-primary px-1.5 py-0.5 rounded-full animate-gentle-pulse font-code-formula">
                +25 XP
              </span>
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

      {/* Focused Canvas Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 flex flex-col gap-6">
        {/* Tier Level Selector (Low-Anxiety Scaffolding) */}
        <section className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 sm:p-5 card-calm-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Pilih tingkat kesulitan
            </span>
            <span className="text-xs text-primary flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
              <span>Bebas cemas: pilih tingkat sesuai kesiapan mentalmu</span>
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
              onClick={() => alert('Selesaikan latihan tingkat Sulit dengan akurasi 80% untuk membuka tantangan Sangat Sulit.')}
              className="rounded-lg border border-outline-variant/40 bg-surface-container-low/60 p-3 flex flex-col opacity-75 cursor-not-allowed"
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

        {/* Progress Indicator Rail */}
        <div className="flex items-center justify-between px-2">
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
                        className={`w-3 sm:w-4 h-0.5 ${
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-container text-on-primary ring-4 ring-primary-fixed/40 shadow-sm'
                          : isCompleted
                          ? 'bg-primary-fixed text-primary'
                          : 'border border-outline-variant text-outline'
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
        <article className="bg-surface-container-lowest border border-outline-variant/80 rounded-xl p-6 md:p-8 card-calm-shadow flex flex-col gap-6">
          {/* Question Meta Header */}
          <div className="flex flex-col gap-1 border-b border-surface-container-high pb-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                Latihan Konsep Dasar
              </span>
              <span className="text-xs text-on-surface-variant font-code-formula">{currentQ.code}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-on-surface">
              {currentQ.title}
            </h1>
          </div>

          {/* Natural Indonesian Question Narrative */}
          <div className="bg-surface-bright p-5 rounded-lg border border-outline-variant/40">
            <p className="text-sm sm:text-base text-on-surface leading-relaxed">
              {currentQ.narrative}
            </p>
          </div>

          {/* Formula Breakdown Box (Visible in Mudah & Sedang) */}
          {selectedTier !== 'sulit' && currentQ.formulaGuide && (
            <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs sm:text-sm">
                  <span className="material-symbols-outlined text-lg">menu_book</span>
                  <span>Panduan Rumus Terbuka ({selectedTier === 'mudah' ? 'Tingkat Mudah' : 'Tingkat Sedang'})</span>
                </div>
                <span className="text-xs text-on-surface-variant bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/40">
                  Bebas hafalan
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/40">
                <div className="font-code-formula text-base sm:text-lg text-primary tracking-wide">
                  {currentQ.formulaGuide.formula.includes('/') ? (
                    <div className="flex items-center">
                      <span>s² = </span>
                      <span className="inline-block text-center align-middle mx-2">
                        <span className="block border-b border-on-surface-variant px-1 font-medium text-sm sm:text-base">
                          Σ (xᵢ - x̄)²
                        </span>
                        <span className="block text-xs font-medium">n - 1</span>
                      </span>
                    </div>
                  ) : (
                    <span>{currentQ.formulaGuide.formula}</span>
                  )}
                </div>
                <div className="text-xs text-on-surface-variant border-l-2 border-primary-container pl-3 py-0.5 leading-relaxed">
                  <p>
                    <strong className="text-on-surface">Catatan Penenang:</strong> {currentQ.formulaGuide.note}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Multiple Choice Options Grid */}
          <div className="flex flex-col gap-3">
            <label className="text-xs sm:text-sm font-semibold text-on-surface">Pilih Opsi Jawabanmu:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOptionId === opt.id;
                const isCurrentCorrect = opt.id === currentQ.correctOptionId;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'border-2 border-primary-container bg-primary-fixed/20 shadow-xs ring-2 ring-primary-container/20'
                        : 'border border-outline-variant/60 bg-surface-container-lowest hover:border-primary-container hover:bg-surface-bright'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                          isSelected
                            ? 'bg-primary-container text-on-primary'
                            : 'border border-outline-variant text-on-surface-variant'
                        }`}
                      >
                        {opt.label}
                      </span>
                      <span
                        className={`font-code-formula text-sm sm:text-base ${
                          isSelected ? 'font-semibold text-primary' : 'text-on-surface'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-primary-container text-on-primary'
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

          {/* Hint Box (Warm Amber Hospitality) */}
          {showHint && currentQ.hintStep1 && (
            <div className="bg-secondary-fixed/30 border border-secondary-fixed-dim/60 rounded-xl p-4 flex items-start gap-3">
              <span
                className="material-symbols-outlined text-secondary text-xl mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lightbulb
              </span>
              <div className="flex-1 text-xs text-on-secondary-fixed-variant space-y-1">
                <p className="font-semibold text-on-secondary-fixed">Petunjuk Langkah 1:</p>
                <p className="leading-relaxed">{currentQ.hintStep1}</p>
              </div>
            </div>
          )}

          {/* Reflective Step: 'Cek Jawabanmu' */}
          <div className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-on-surface font-semibold text-xs sm:text-sm">
              <span className="material-symbols-outlined text-primary text-lg">psychology</span>
              <span>Refleksi Sebelum Konfirmasi:</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {currentQ.reflectionQuestion}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmReflection}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
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
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest border border-outline-variant/80 text-on-surface-variant hover:text-on-surface text-xs sm:text-sm"
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
              <div className="text-xs text-on-surface space-y-1">
                <p className="font-semibold text-primary">{currentQ.positiveFeedback.title}</p>
                <p className="text-on-surface-variant leading-relaxed">
                  {currentQ.positiveFeedback.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Navigation Footer */}
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
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-medium transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Lanjut ke Soal Berikutnya</span>
              <span className="text-xs bg-on-primary/20 px-2 py-0.5 rounded-full font-code-formula">
                +35 XP
              </span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </article>

        {/* Quiet Reassurance Footer Note */}
        <div className="text-center text-xs text-outline flex items-center justify-center gap-1.5 pb-6">
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            favorite
          </span>
          <span>Belajar dengan tempo pribadimu. Salah langkah adalah bagian alami dari proses paham.</span>
        </div>
      </main>
    </div>
  );
};
