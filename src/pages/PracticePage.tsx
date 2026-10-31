import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivePage, DifficultyTier, PracticeQuestion, Topic, TopicStatus, UserProfile } from '../types';
import { mockTopics } from '../data/mockData';
import { getConceptById } from '../data/concepts';
import { checkPracticeAnswer, loadPracticeSet, TIER_ORDER, TIER_LABEL, TIER_XP, UNLOCK_HARDEST_AT } from '../data/practice';
import { ConceptModal } from '../components/ConceptModal';
import { PomodoroButton } from '../components/PomodoroButton';
import { RichText } from '../components/RichText';
import type { SavedAnswer } from '../lib/account';

interface PracticePageProps {
  setActivePage: (page: ActivePage) => void;
  onAddXp?: (amount: number) => void;
  /** Topic to open first (usually the topic the student is on). */
  initialTopicId: string;
  onTopicChange?: (topicId: string) => void;
  getTopicStatus?: (topic: Topic) => TopicStatus;
  adminUnlockAll?: boolean;
  user?: UserProfile;
  /** Signed in: the student's answers from the database (then nothing is kept in this browser). */
  accountAnswers?: Record<string, SavedAnswer>;
  onAnswer?: (questionId: string, answer: SavedAnswer) => void;
}

// ---------------------------------------------------------------- saved progress
// Guests' answers are kept in this browser so they can leave and continue later.
// Signed-in students' answers are saved by the server (see accountAnswers).
const STORAGE_KEY = 'ngerti.practice.v1';

interface SavedState {
  answers: Record<string, SavedAnswer>;
  /** Question ids that already gave XP (XP is awarded once per question). */
  xpAwarded: string[];
}

function readSaved(): SavedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { answers: {}, xpAwarded: [] };
    const parsed = JSON.parse(raw) as Partial<SavedState>;
    return { answers: parsed.answers ?? {}, xpAwarded: parsed.xpAwarded ?? [] };
  } catch {
    return { answers: {}, xpAwarded: [] };
  }
}

function writeSaved(state: SavedState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* penyimpanan diblokir: progres tetap berjalan selama halaman terbuka */
  }
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const HINT_COOLDOWN_SECONDS = 20;
const QUESTIONS_PER_TOPIC = 40;

const TIER_RULE: Record<DifficultyTier, string> = {
  mudah: 'Rumus & petunjuk langsung terlihat.',
  sedang: 'Petunjuk bisa dibuka, rumus diingat mandiri.',
  sulit: `Petunjuk terbuka setelah ${HINT_COOLDOWN_SECONDS} detik (Clue Cooldown).`,
  sangat_sulit: 'Tanpa rumus dan petunjuk.',
};

const TIER_DOT: Record<DifficultyTier, string> = {
  mudah: 'bg-primary-container',
  sedang: 'bg-secondary-container',
  sulit: 'bg-secondary',
  sangat_sulit: 'bg-error',
};

export const PracticePage: React.FC<PracticePageProps> = ({
  setActivePage,
  onAddXp,
  initialTopicId,
  onTopicChange,
  getTopicStatus,
  adminUnlockAll = false,
  user,
  accountAnswers,
  onAnswer,
}) => {
  const sortedTopics = useMemo(() => [...mockTopics].sort((a, b) => a.order - b.order), []);
  const isTopicOpen = (t: Topic) => !getTopicStatus || getTopicStatus(t) !== 'terkunci';

  const [topicId, setTopicId] = useState<string>(initialTopicId);
  const [questions, setQuestions] = useState<PracticeQuestion[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState<number>(0);
  // Answer keys and explanations come from the server after checking (POST /api/practice/check).
  const [feedback, setFeedback] = useState<Record<string, { answer: number; explanation: string }>>({});
  const [checking, setChecking] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackRetry, setFeedbackRetry] = useState<number>(0);
  const [tier, setTier] = useState<DifficultyTier>('mudah');
  const [index, setIndex] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [saved, setSaved] = useState<SavedState>(() =>
    accountAnswers
      ? {
          answers: accountAnswers,
          xpAwarded: Object.keys(accountAnswers).filter((id) => accountAnswers[id].correct),
        }
      : readSaved()
  );
  const [hintOpen, setHintOpen] = useState<boolean>(false);
  const [hintReadyAt, setHintReadyAt] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const [conceptModalId, setConceptModalId] = useState<string | null>(null);
  const [conceptModalOpen, setConceptModalOpen] = useState<boolean>(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [topicPickerOpen, setTopicPickerOpen] = useState<boolean>(false);
  // Height of the question card before moving on. Holding it stops the page from jumping up when the
  // next question is shorter than the one with its explanation open; released on "Cek Jawaban".
  const cardRef = useRef<HTMLElement>(null);
  const [heldCardHeight, setHeldCardHeight] = useState<number | null>(null);

  const topic = sortedTopics.find((t) => t.id === topicId) ?? sortedTopics[0];

  // Per-topic progress from saved answers. Question ids start with "T<topic order>-", so no topic file has to load.
  const topicProgress = useMemo(() => {
    const byOrder: Record<number, { answered: number; correct: number }> = {};
    for (const [id, a] of Object.entries(saved.answers)) {
      const order = Number(/^T(\d+)-/.exec(id)?.[1]);
      if (!order) continue;
      const p = (byOrder[order] ??= { answered: 0, correct: 0 });
      p.answered++;
      if (a.correct) p.correct++;
    }
    return byOrder;
  }, [saved.answers]);
  const overall = {
    answered: Object.values(topicProgress).reduce((s, p) => s + p.answered, 0),
    total: sortedTopics.length * QUESTIONS_PER_TOPIC,
  };

  // Load the question set from the backend whenever the topic changes (or on "Coba lagi")
  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setLoadError(null);
    loadPracticeSet(topicId)
      .then((qs) => {
        if (!cancelled) setQuestions(qs);
      })
      .catch((err: unknown) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Soal belum bisa dimuat.');
      });
    return () => {
      cancelled = true;
    };
  }, [topicId, reloadKey]);

  useEffect(() => {
    if (!accountAnswers) writeSaved(saved);
  }, [saved, accountAnswers]);

  const tierQuestions = useMemo(() => (questions ?? []).filter((q) => q.tier === tier), [questions, tier]);
  const current: PracticeQuestion | undefined = tierQuestions[index];
  const currentSaved = current ? saved.answers[current.id] : undefined;
  const checked = Boolean(currentSaved);
  const currentFeedback = current ? feedback[current.id] : undefined;
  // Correct option: from the server once known; before that, a correct saved answer already tells us.
  const answerIndex = currentFeedback?.answer ?? (currentSaved?.correct ? currentSaved.selected : undefined);

  useEffect(() => {
    if (!current || !currentSaved || feedback[current.id]) return;
    let cancelled = false;
    setFeedbackError(null);
    checkPracticeAnswer(current.id, currentSaved.selected)
      .then((r) => {
        if (!cancelled) setFeedback((f) => ({ ...f, [r.questionId]: { answer: r.answer, explanation: r.explanation } }));
      })
      .catch((err: unknown) => {
        if (!cancelled) setFeedbackError(err instanceof Error ? err.message : 'Pembahasan belum bisa dimuat.');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, currentSaved?.selected, feedbackRetry]);

  const statsFor = (t: DifficultyTier) => {
    const qs = (questions ?? []).filter((q) => q.tier === t);
    const answered = qs.filter((q) => saved.answers[q.id]);
    return { total: qs.length, answered: answered.length, correct: answered.filter((q) => saved.answers[q.id].correct).length };
  };
  const sulitStats = statsFor('sulit');
  const hardestUnlocked = adminUnlockAll || sulitStats.correct >= UNLOCK_HARDEST_AT;
  const tierStats = statsFor(tier);

  // Reset per-question UI when the question changes
  useEffect(() => {
    setSelected(currentSaved ? currentSaved.selected : null);
    setCheckError(null);
    setHintOpen(tier === 'mudah');
    setHintReadyAt(Date.now() + HINT_COOLDOWN_SECONDS * 1000);
    setNow(Date.now());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, tier]);

  // Clue cooldown ticker (Sulit tier only)
  const cooldownLeft = Math.max(0, Math.ceil((hintReadyAt - now) / 1000));
  useEffect(() => {
    if (tier !== 'sulit' || cooldownLeft === 0) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [tier, cooldownLeft]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  };

  const openConcept = (id?: string) => {
    setConceptModalId(id ?? null);
    setConceptModalOpen(true);
  };

  const chooseTopic = (t: Topic) => {
    if (!isTopicOpen(t)) {
      showToast(`Topik "${t.title}" masih terkunci. Selesaikan topik sebelumnya dulu ya.`);
      return;
    }
    setTopicId(t.id);
    onTopicChange?.(t.id);
    setTopicPickerOpen(false);
    setHeldCardHeight(null);
    setTier('mudah');
    setIndex(0);
    setShowSummary(false);
  };

  const chooseTier = (t: DifficultyTier) => {
    if (t === 'sangat_sulit' && !hardestUnlocked) {
      showToast(
        `Jawab benar minimal ${UNLOCK_HARDEST_AT} dari 10 soal tingkat Sulit untuk membuka tantangan Sangat Sulit (saat ini ${sulitStats.correct}/10).`
      );
      return;
    }
    setTier(t);
    setIndex(0);
    setHeldCardHeight(null);
    setShowSummary(false);
  };

  // Keeps the current scroll position so the student stays at the question card.
  const goTo = (i: number) => {
    setHeldCardHeight(cardRef.current?.offsetHeight ?? null);
    setIndex(i);
    setShowSummary(false);
  };

  const checkAnswer = async () => {
    if (!current || selected === null || checked || checking) return;
    const question = current;
    const choice = selected;
    const xp = TIER_XP[tier];
    setChecking(true);
    setCheckError(null);
    try {
      const result = await checkPracticeAnswer(question.id, choice);
      setFeedback((f) => ({ ...f, [question.id]: { answer: result.answer, explanation: result.explanation } }));
      setHeldCardHeight(null);
      // Signed in, the server decides the XP (once per question); otherwise this browser does.
      const gained = result.xpAwarded ?? (result.correct && !saved.xpAwarded.includes(question.id) ? xp : 0);
      const awarded = gained > 0;
      if (awarded) onAddXp?.(gained);
      const answer = { selected: choice, correct: result.correct };
      onAnswer?.(question.id, answer);
      setSaved((prev) => ({
        answers: { ...prev.answers, [question.id]: answer },
        xpAwarded: awarded && !prev.xpAwarded.includes(question.id) ? [...prev.xpAwarded, question.id] : prev.xpAwarded,
      }));
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : 'Jawaban belum bisa diperiksa. Coba lagi.');
    } finally {
      setChecking(false);
    }
  };

  const next = () => {
    const nextOpen = tierQuestions.findIndex((q, i) => i > index && !saved.answers[q.id]);
    const anyOpen = tierQuestions.findIndex((q) => !saved.answers[q.id]);
    if (nextOpen !== -1) goTo(nextOpen);
    else if (anyOpen !== -1) goTo(anyOpen);
    else setShowSummary(true);
  };

  const resetTier = () => {
    setSaved((prev) => {
      const answers = { ...prev.answers };
      tierQuestions.forEach((q) => delete answers[q.id]);
      return { ...prev, answers };
    });
    goTo(0);
  };

  const nextTier = TIER_ORDER[TIER_ORDER.indexOf(tier) + 1] as DifficultyTier | undefined;
  const concept = current?.conceptId ? getConceptById(current.conceptId) : undefined;
  const showFormula = tier === 'mudah' && Boolean(current?.formula);
  const hintAvailable = Boolean(current?.hint) && tier !== 'sangat_sulit' && (tier !== 'sulit' || cooldownLeft === 0);

  // ---------------------------------------------------------------- help panel (shared by desktop & mobile)
  const helpPanel = (
    <div className="space-y-4">
      {concept && (
        <div className="bg-surface-container-low/70 border border-outline-variant/60 rounded-xl p-4 space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wide">Konsep yang Diuji</span>
          <h3 className="text-sm font-bold text-on-surface">{concept.title}</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">{concept.summary}</p>
          <button
            type="button"
            onClick={() => openConcept(concept.id)}
            className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest border border-primary/30 text-primary hover:bg-primary hover:text-on-primary text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Pelajari Konsep</span>
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-primary">functions</span>
            <span>Panduan Rumus</span>
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container-low px-1.5 py-0.5 rounded">{TIER_LABEL[tier]}</span>
        </div>
        {showFormula ? (
          <div className="font-code-formula text-sm text-primary bg-surface-container-low/80 p-3 rounded-lg border border-outline-variant/50 overflow-x-auto">
            {current?.formula}
          </div>
        ) : (
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {tier === 'mudah'
              ? 'Soal ini tidak memakai rumus khusus. Fokus pada konsepnya.'
              : 'Rumus ditutup di tingkat ini agar kamu melatih ingatan dan intuisi secara mandiri.'}
          </p>
        )}
      </div>

      <div className="space-y-2 pt-1 border-t border-surface-container">
        <span className="text-xs font-semibold text-on-surface flex items-center gap-1.5 pt-2">
          <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
            lightbulb
          </span>
          <span>Petunjuk</span>
        </span>
        {tier === 'sangat_sulit' ? (
          <p className="text-xs text-on-surface-variant">Tingkat Sangat Sulit tidak menyediakan petunjuk. Kamu pasti bisa!</p>
        ) : !current?.hint ? (
          <p className="text-xs text-on-surface-variant">Soal ini tidak memiliki petunjuk tambahan.</p>
        ) : !hintAvailable ? (
          <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
            <span>Petunjuk terbuka dalam {cooldownLeft} detik. Coba pikirkan dulu ya.</span>
          </p>
        ) : hintOpen ? (
          <div className="bg-secondary-fixed/30 border border-secondary-fixed-dim/60 rounded-xl p-3 text-xs text-on-secondary-fixed leading-relaxed">
            <RichText text={current.hint} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setHintOpen(true)}
            className="w-full py-2 px-3 rounded-lg bg-secondary-fixed/40 border border-secondary-fixed-dim text-on-secondary-fixed text-xs font-semibold hover:bg-secondary-fixed transition-colors"
          >
            Buka Petunjuk
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => openConcept()}
        className="w-full py-2.5 px-4 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary text-xs font-semibold transition-colors flex items-center justify-between border border-outline-variant/60"
      >
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-primary">search</span>
          <span>Cari Istilah di Glosarium</span>
        </span>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {toast && (
        <aside role="status" className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-[calc(100%-2rem)] md:w-96">
          <div className="bg-surface-container-lowest border border-primary/40 rounded-xl p-4 shadow-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">info</span>
            <div className="flex-1 text-sm text-on-surface leading-relaxed">{toast}</div>
            <button onClick={() => setToast(null)} className="text-outline hover:text-on-surface" aria-label="Tutup notifikasi">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </aside>
      )}

      {/* Header */}
      <nav aria-label="Navigasi Latihan" className="bg-surface-container-lowest border-b border-outline-variant/50 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActivePage('landing')}
              className="flex items-center gap-1.5 text-primary font-semibold text-lg hover:opacity-90 transition-opacity shrink-0"
            >
              <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm">N</span>
              <span className="sr-only sm:not-sr-only">Ngerti</span>
            </button>
            <span className="hidden md:inline text-outline-variant">/</span>
            <div className="hidden md:flex items-center gap-1.5 text-sm text-on-surface-variant font-medium min-w-0">
              <button onClick={() => setActivePage('topics')} className="hover:text-primary transition-colors">
                Topik
              </button>
              <span className="text-outline-variant text-xs">›</span>
              <span className="text-primary font-semibold whitespace-nowrap">Latihan Mandiri</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
            <button
              type="button"
              onClick={() => openConcept(current?.conceptId)}
              aria-label="Glosarium Istilah"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg border border-primary/30 bg-primary-fixed/30 text-primary text-xs font-semibold hover:bg-primary-fixed transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span className="hidden lg:inline">Glosarium Istilah</span>
            </button>
            <div
              aria-label={`Streak ${user?.streakDays ?? 5} hari`}
              className="flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-base sm:text-lg font-bold select-none shrink-0"
            >
              <span className="leading-none">🔥</span>
              <span className="leading-none">{user?.streakDays ?? 5}</span>
            </div>
            <div
              aria-label={`Total ${user?.xp ?? 0} XP`}
              className="flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-full bg-primary-fixed/40 text-primary text-base sm:text-lg font-bold select-none shrink-0"
            >
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                stars
              </span>
              <span className="leading-none whitespace-nowrap">{user?.xp ?? 0} XP</span>
            </div>
            <PomodoroButton />
            <button
              onClick={() => setActivePage('topics')}
              aria-label="Keluar Sesi"
              className="flex items-center gap-1 text-on-surface-variant hover:text-primary px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors text-sm font-medium"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">close</span>
              <span className="hidden lg:inline">Keluar Sesi</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8 flex flex-col lg:flex-row lg:items-start gap-6">
        {/* Topic selector: compact list on the left (desktop), collapsible on smaller screens */}
        <section
          aria-label="Pilih topik latihan"
          className="w-full lg:w-60 xl:w-64 shrink-0 lg:sticky lg:top-24 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3 card-calm-shadow"
        >
          <div className="px-1.5 pb-3 border-b border-surface-container">
            <h1 className="text-base font-bold text-on-surface tracking-tight">Latihan Mandiri</h1>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${(overall.answered / overall.total) * 100}%` }}
                />
              </div>
              <span className="text-xs text-on-surface-variant whitespace-nowrap tabular-nums">
                {overall.answered}/{overall.total} dijawab
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTopicPickerOpen((o) => !o)}
            aria-expanded={topicPickerOpen}
            aria-controls="topic-list"
            className="lg:hidden w-full mt-2 flex items-center gap-2.5 px-2 py-2 rounded-lg bg-primary-fixed/40 text-left"
          >
            <span className="w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center justify-center shrink-0">
              {topic.order}
            </span>
            <span className="flex-1 min-w-0 text-sm font-semibold text-primary truncate">{topic.title}</span>
            <span className="flex items-center text-xs font-semibold text-primary shrink-0">
              <span>{topicPickerOpen ? 'Tutup' : 'Ganti topik'}</span>
              <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                {topicPickerOpen ? 'expand_less' : 'expand_more'}
              </span>
            </span>
          </button>

          <ul id="topic-list" className={`${topicPickerOpen ? 'flex' : 'hidden'} lg:flex flex-col gap-0.5 mt-2`}>
            {sortedTopics.map((t) => {
              const open = isTopicOpen(t);
              const active = t.id === topicId;
              const p = topicProgress[t.order] ?? { answered: 0, correct: 0 };
              const done = p.answered >= QUESTIONS_PER_TOPIC;
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => chooseTopic(t)}
                    aria-pressed={active}
                    aria-label={`Topik ${t.order}: ${t.title}. ${
                      open ? `${p.answered} dari ${QUESTIONS_PER_TOPIC} soal dijawab, ${p.correct} benar` : 'Terkunci'
                    }`}
                    title={t.title}
                    className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                      active
                        ? 'bg-primary-fixed/40'
                        : open
                          ? 'hover:bg-surface-container-low'
                          : 'hover:bg-surface-container-low/60'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center shrink-0 ${
                        active || done
                          ? 'bg-primary text-on-primary'
                          : open
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {!open ? (
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">lock</span>
                      ) : done ? (
                        <span aria-hidden="true" className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        t.order
                      )}
                    </span>
                    <span
                      className={`flex-1 min-w-0 text-sm leading-snug line-clamp-2 ${
                        active ? 'font-semibold text-primary' : open ? 'text-on-surface' : 'text-on-surface-variant'
                      }`}
                    >
                      {t.title}
                    </span>
                    {open && (
                      <span className={`text-xs tabular-nums shrink-0 ${active ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}>
                        {p.answered}/{QUESTIONS_PER_TOPIC}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
          {/* Tier selector */}
          <section
            aria-label="Pilih tingkat kesulitan"
            className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 sm:p-5 card-calm-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Pilih tingkat kesulitan soal</span>
              <span className="text-xs text-primary flex items-center gap-1 font-medium">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  spa
                </span>
                <span>Bebas cemas: pilih tingkat sesuai kesiapanmu</span>
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {TIER_ORDER.map((t) => {
                const st = statsFor(t);
                const locked = t === 'sangat_sulit' && !hardestUnlocked;
                const active = t === tier;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => chooseTier(t)}
                    aria-pressed={active}
                    className={`text-left rounded-lg p-3 flex flex-col gap-1 transition-all ${
                      active
                        ? 'border-2 border-primary bg-primary-fixed/20 shadow-xs'
                        : locked
                          ? 'border border-outline-variant/60 bg-surface-container-low'
                          : 'border border-outline-variant bg-surface-container-lowest hover:border-primary'
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-semibold flex items-center gap-1.5 ${locked ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                        {locked ? (
                          <span className="material-symbols-outlined text-[16px]">lock</span>
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full ${TIER_DOT[t]}`} />
                        )}
                        <span>{TIER_LABEL[t]}</span>
                      </span>
                      <span className={`text-xs font-mono font-semibold ${active ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {locked ? `${sulitStats.correct}/${UNLOCK_HARDEST_AT}` : `${st.correct}/${st.total || 10}`}
                      </span>
                    </span>
                    <span className="text-xs text-on-surface-variant leading-snug">
                      {locked ? `Benar ${UNLOCK_HARDEST_AT}/10 di Sulit untuk membuka.` : TIER_RULE[t]}
                    </span>
                    <span className="text-xs text-primary font-medium">+{TIER_XP[t]} XP per soal benar</span>
                  </button>
                );
              })}
            </div>
          </section>

          {loadError ? (
            <div role="alert" className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-8 text-center space-y-3">
              <span aria-hidden="true" className="material-symbols-outlined text-[32px] text-outline">cloud_off</span>
              <p className="text-sm font-semibold text-on-surface">Soal belum bisa dimuat</p>
              <p className="text-sm text-on-surface-variant max-w-md mx-auto">{loadError}</p>
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Coba lagi</span>
              </button>
            </div>
          ) : !questions ? (
            <div className="flex items-center justify-center py-20" role="status">
              <span className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <span className="sr-only">Memuat soal…</span>
            </div>
          ) : !current ? (
            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-8 text-center text-sm text-on-surface-variant">
              Soal untuk topik ini belum tersedia.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8 flex flex-col gap-6 w-full min-w-0">
                {/* Progress rail */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant/40">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {tierQuestions.map((q, i) => {
                      const a = saved.answers[q.id];
                      const isActive = i === index && !showSummary;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          onClick={() => goTo(i)}
                          aria-label={`Soal ${i + 1}${a ? (a.correct ? ', benar' : ', belum tepat') : ''}`}
                          aria-current={isActive ? 'step' : undefined}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                            isActive ? 'ring-4 ring-primary-fixed/50 ' : ''
                          }${
                            a
                              ? a.correct
                                ? 'bg-primary text-on-primary'
                                : 'bg-error-container text-on-error-container border border-error/40'
                              : isActive
                                ? 'bg-primary-container text-on-primary'
                                : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                          }`}
                        >
                          {a ? <span className="material-symbols-outlined text-[16px]">{a.correct ? 'check' : 'close'}</span> : i + 1}
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">timer</span>
                    <span>
                      {tierStats.answered}/{tierStats.total} dijawab • {tierStats.correct} benar
                    </span>
                  </span>
                </div>

                {showSummary ? (
                  /* Tier summary */
                  <article className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-6 sm:p-8 card-calm-shadow space-y-5 text-center">
                    <span className="text-4xl" aria-hidden="true">
                      {tierStats.correct >= 8 ? '🌟' : tierStats.correct >= 5 ? '👍' : '🌱'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
                      {tierStats.correct} dari {tierStats.total} benar di tingkat {TIER_LABEL[tier]}
                    </h2>
                    <p className="text-sm text-on-surface-variant max-w-lg mx-auto leading-relaxed">
                      {tierStats.correct >= 8
                        ? 'Luar biasa! Pemahamanmu di tingkat ini sudah sangat kuat.'
                        : tierStats.correct >= 5
                          ? 'Bagus! Baca lagi pembahasan soal yang belum tepat, lalu coba ulangi.'
                          : 'Tidak apa-apa. Salah adalah bagian dari belajar. Baca ulang materinya, lalu coba lagi dengan tenang.'}
                    </p>
                    {tier === 'sulit' && !adminUnlockAll && (
                      <p className="text-sm font-semibold text-primary">
                        {sulitStats.correct >= UNLOCK_HARDEST_AT
                          ? 'Tantangan Sangat Sulit sudah terbuka!'
                          : `Butuh ${UNLOCK_HARDEST_AT - sulitStats.correct} jawaban benar lagi untuk membuka Sangat Sulit.`}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={resetTier}
                        className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-low flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">replay</span>
                        <span>Ulangi Tingkat Ini</span>
                      </button>
                      {nextTier && (
                        <button
                          type="button"
                          onClick={() => chooseTier(nextTier)}
                          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center gap-1.5"
                        >
                          <span>Lanjut ke {TIER_LABEL[nextTier]}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </article>
                ) : (
                  /* Question card */
                  <article
                    ref={cardRef}
                    style={heldCardHeight ? { minHeight: heldCardHeight } : undefined}
                    className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl p-5 sm:p-8 card-calm-shadow flex flex-col gap-6 w-full"
                  >
                    <div className="flex flex-col gap-1.5 border-b border-surface-container-high pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {topic.title} • {TIER_LABEL[tier]}
                        </span>
                        <span className="text-xs text-on-surface-variant font-code-formula">{current.id}</span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-on-surface tracking-tight">
                        Soal {index + 1} dari {tierQuestions.length}
                      </h2>
                    </div>

                    <div className="bg-surface-bright p-4 sm:p-6 rounded-xl border border-outline-variant/50 space-y-3">
                      <p className="text-base text-on-surface leading-relaxed whitespace-pre-line">
                        <RichText text={current.prompt} />
                      </p>
                      {current.data && (
                        <pre className="text-sm font-code-formula text-on-surface bg-surface-container-lowest border border-outline-variant/60 rounded-lg p-3 overflow-x-auto whitespace-pre">
                          {current.data}
                        </pre>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <span id="answer-label" className="text-sm font-semibold text-on-surface">
                        Pilih jawabanmu:
                      </span>
                      <div role="radiogroup" aria-labelledby="answer-label" className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                        {current.options.map((opt, i) => {
                          const isSel = selected === i;
                          const isAnswer = i === answerIndex;
                          let tone = isSel
                            ? 'border-2 border-primary bg-primary-fixed/20 ring-2 ring-primary/20'
                            : 'border border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-surface-bright';
                          if (checked) {
                            tone = isAnswer
                              ? 'border-2 border-primary bg-primary-fixed/30'
                              : isSel
                                ? 'border-2 border-error bg-error-container/50'
                                : 'border border-outline-variant/60 bg-surface-container-lowest opacity-75';
                          }
                          return (
                            <button
                              key={i}
                              type="button"
                              role="radio"
                              aria-checked={isSel}
                              disabled={checked || checking}
                              onClick={() => setSelected(i)}
                              className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all w-full disabled:cursor-default ${tone}`}
                            >
                              <span
                                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${
                                  checked && isAnswer
                                    ? 'bg-primary text-on-primary'
                                    : checked && isSel
                                      ? 'bg-error text-white'
                                      : isSel
                                        ? 'bg-primary text-on-primary'
                                        : 'border border-outline-variant text-on-surface-variant'
                                }`}
                              >
                                {checked && isAnswer ? (
                                  <span className="material-symbols-outlined text-[16px]">check</span>
                                ) : checked && isSel ? (
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                ) : (
                                  OPTION_LABELS[i]
                                )}
                              </span>
                              <span className={`text-sm leading-relaxed ${isSel && !checked ? 'font-semibold text-primary' : 'text-on-surface'}`}>
                                <RichText text={opt} />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {checked && currentSaved && (
                      <div
                        role="status"
                        className={`rounded-xl p-4 sm:p-5 space-y-2 border ${
                          currentSaved.correct ? 'bg-primary-fixed/20 border-primary-fixed-dim' : 'bg-secondary-fixed/30 border-secondary-fixed-dim'
                        }`}
                      >
                        <p
                          className={`text-sm font-bold flex items-center gap-2 ${
                            currentSaved.correct ? 'text-primary' : 'text-on-secondary-fixed'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{currentSaved.correct ? 'celebration' : 'psychology'}</span>
                          <span>
                            {currentSaved.correct
                              ? `Tepat!${saved.xpAwarded.includes(current.id) ? ` +${TIER_XP[tier]} XP` : ''}`
                              : answerIndex !== undefined
                                ? `Belum tepat. Jawaban yang benar adalah ${OPTION_LABELS[answerIndex]}.`
                                : 'Belum tepat.'}
                          </span>
                        </p>
                        {currentFeedback ? (
                          <div className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
                            <span className="font-semibold">Pembahasan: </span>
                            <RichText text={currentFeedback.explanation} />
                          </div>
                        ) : feedbackError ? (
                          <p className="text-sm text-on-surface-variant flex flex-wrap items-center gap-2">
                            <span>Pembahasan belum bisa dimuat.</span>
                            <button
                              type="button"
                              onClick={() => setFeedbackRetry((n) => n + 1)}
                              className="font-semibold text-primary underline underline-offset-2"
                            >
                              Coba lagi
                            </button>
                          </p>
                        ) : (
                          <p className="text-sm text-on-surface-variant">Memuat pembahasan…</p>
                        )}
                      </div>
                    )}

                    {checkError && (
                      <p role="alert" className="text-sm text-error flex items-start gap-1.5">
                        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error</span>
                        <span>{checkError}</span>
                      </p>
                    )}

                    <div className="mt-auto flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-surface-container-high">
                      <button
                        type="button"
                        onClick={() => goTo(index - 1)}
                        disabled={index === 0}
                        className="px-5 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-surface-container disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Sebelumnya</span>
                      </button>
                      {!checked ? (
                        <button
                          type="button"
                          onClick={checkAnswer}
                          disabled={selected === null || checking}
                          aria-busy={checking}
                          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {checking ? (
                            <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">fact_check</span>
                          )}
                          <span>{checking ? 'Memeriksa…' : 'Cek Jawaban'}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={next}
                          className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <span>{tierStats.answered === tierStats.total ? 'Lihat Ringkasan' : 'Soal Berikutnya'}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </article>
                )}

                {/* Mobile help */}
                <div className="xl:hidden bg-surface-container-lowest border border-outline-variant/70 rounded-xl overflow-hidden card-calm-shadow">
                  <button
                    type="button"
                    onClick={() => setMobileHelpOpen(!mobileHelpOpen)}
                    aria-expanded={mobileHelpOpen}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-on-surface font-semibold text-sm">
                      <span className="material-symbols-outlined text-primary text-[20px]">help</span>
                      <span>Panel Bantuan, Rumus &amp; Petunjuk</span>
                    </span>
                    <span className="material-symbols-outlined text-outline">{mobileHelpOpen ? 'expand_less' : 'expand_more'}</span>
                  </button>
                  {mobileHelpOpen && <div className="p-4 pt-0 border-t border-surface-container">{helpPanel}</div>}
                </div>
              </div>

              {/* Desktop help */}
              <aside className="hidden xl:flex xl:col-span-4 sticky top-24 flex-col gap-4">
                <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-2xl p-5 card-calm-shadow space-y-4">
                  <div className="flex items-center gap-2 border-b border-surface-container pb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">menu_book</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-on-surface">Panel Bantuan</h2>
                      <span className="text-xs text-on-surface-variant">{TIER_RULE[tier]}</span>
                    </div>
                  </div>
                  {helpPanel}
                </div>
                <div className="bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl p-4 text-center space-y-1">
                  <span className="text-xs text-primary font-semibold flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span>Ritme Belajar Tenang</span>
                  </span>
                  <p className="text-xs text-on-surface-variant leading-snug">
                    Salah langkah adalah bagian alami dari proses paham. Tidak ada pengurangan XP.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <ConceptModal isOpen={conceptModalOpen} onClose={() => setConceptModalOpen(false)} initialConceptId={conceptModalId} />
    </div>
  );
};
