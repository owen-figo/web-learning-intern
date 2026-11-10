import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { authApi } from '../lib/auth';
import { RichText } from './RichText';

// Latihan Harian at the end of a reading page: 5 questions from the chapter's Latihan Soal, a new set
// every day (midnight WIB), no difficulty levels. Questions come from GET /api/daily/[topicId] without
// answers; each answer is checked by POST /api/daily/check (XP and streak like Latihan Mandiri).
// Today's progress is kept in this browser so the card shows where the student left off.

interface DailyQuestion {
  id: string;
  prompt: string;
  data?: string;
  options: string[];
}

interface DailyResult {
  selected: number;
  correct: boolean;
  answer: number;
  explanation: string;
}

export interface DailyCheckResult {
  questionId: string;
  correct: boolean;
  answer: number;
  explanation: string;
  xpAwarded?: number;
  streakDays?: number;
}

interface DailyExerciseProps {
  topicId: string;
  /** Questions per day: 5 on the reading page, 10 in Latihan Mandiri (the 5 are part of the 10). */
  count?: number;
  /** Signed-in student's id: today's progress is kept per account. */
  userId?: string | null;
  /** After each checked answer (XP, streak and saved answers in the app). */
  onResult?: (result: DailyCheckResult & { selected: number }) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const storageKey = (userId: string | null | undefined, topicId: string) => `ngerti.daily.v1:${userId ?? 'tamu'}:${topicId}`;

function readSaved(key: string, date: string): Record<string, DailyResult> {
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) ?? 'null') as { date?: string; results?: Record<string, DailyResult> } | null;
    return saved?.date === date && saved.results ? saved.results : {};
  } catch {
    return {};
  }
}

function writeSaved(key: string, date: string, results: Record<string, DailyResult>) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ date, results }));
  } catch {
    /* penyimpanan diblokir: progres hari ini tetap berjalan selama halaman terbuka */
  }
}

const formatDate = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

export const DailyExercise: React.FC<DailyExerciseProps> = ({ topicId, count = 5, userId, onResult }) => {
  const [set, setSet] = useState<{ date: string; total: number; questions: DailyQuestion[] } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [results, setResults] = useState<Record<string, DailyResult>>({});
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [xpToday, setXpToday] = useState(0);

  const key = storageKey(userId, topicId);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    api<{ date: string; total: number; questions: DailyQuestion[] }>(`/api/daily/${topicId}?count=${count}`)
      .then((res) => {
        if (cancelled) return;
        const saved = readSaved(key, res.date);
        setSet(res);
        setResults(saved);
        // Continue at the first question not answered yet (or the summary when all are done).
        const firstOpen = res.questions.findIndex((q) => !saved[q.id]);
        setIndex(firstOpen === -1 ? res.questions.length : firstOpen);
      })
      .catch((err) => !cancelled && setLoadError(err instanceof Error ? err.message : 'Latihan harian belum bisa dimuat.'));
    return () => {
      cancelled = true;
    };
  }, [topicId, count, key, reloadKey]);

  if (loadError) {
    return (
      <section className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-on-surface-variant">{loadError}</p>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-3 py-1.5 rounded-lg text-sm font-semibold text-primary hover:bg-surface-container-low"
        >
          Coba lagi
        </button>
      </section>
    );
  }
  // Topics without Latihan Soal have no daily exercise.
  if (!set || set.questions.length === 0) return null;

  const questions = set.questions;
  const done = index >= questions.length;
  const current = done ? null : questions[index];
  const result = current ? results[current.id] : undefined;
  const correctCount = questions.filter((q) => results[q.id]?.correct).length;

  const goTo = (i: number) => {
    setIndex(i);
    setPicked(null);
    setCheckError(null);
  };

  const check = async () => {
    if (!current || picked === null || checking) return;
    setChecking(true);
    setCheckError(null);
    try {
      const res = await authApi<DailyCheckResult>('/api/daily/check', {
        method: 'POST',
        body: JSON.stringify({ questionId: current.id, selected: picked }),
      });
      const result = { selected: picked, correct: res.correct, answer: res.answer, explanation: res.explanation };
      setResults((prev) => ({ ...prev, [current.id]: result }));
      // Merge with what is stored: the reading page (5) and Latihan Mandiri (10) share today's progress.
      writeSaved(key, set.date, { ...readSaved(key, set.date), [current.id]: result });
      if (res.xpAwarded) setXpToday((x) => x + (res.xpAwarded ?? 0));
      onResult?.({ ...res, selected: picked });
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : 'Jawaban belum bisa diperiksa. Coba lagi.');
    } finally {
      setChecking(false);
    }
  };

  const optionClass = (i: number) => {
    if (!result) {
      return picked === i
        ? 'border-primary bg-primary-fixed/30 text-on-surface ring-2 ring-primary/30'
        : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary/60 hover:bg-primary-fixed/10';
    }
    if (i === result.answer) return 'border-primary bg-primary-fixed/40 text-on-primary-fixed-variant font-semibold';
    if (i === result.selected) return 'border-error/50 bg-error-container/50 text-on-error-container';
    return 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant opacity-70';
  };

  return (
    <section
      id="latihan-harian"
      aria-labelledby="daily-heading"
      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-5 sm:p-7 shadow-xs space-y-5 scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-surface-container">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>event_available</span>
          </span>
          <div>
            <span className="text-xs font-bold tracking-wider uppercase text-secondary">Latihan Harian</span>
            <h2 id="daily-heading" className="text-lg sm:text-xl font-bold text-on-surface tracking-tight leading-snug">
              {questions.length} soal untuk hari ini
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Dari {set.total} soal latihan bab ini. Soal baru setiap hari pukul 00.00 WIB.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant text-xs font-medium capitalize">
          {formatDate(set.date)}
        </span>
      </div>

      {/* Progress: one step per question; answered ones can be reopened */}
      <ol className="flex items-center gap-1.5" aria-label="Progres latihan hari ini">
        {questions.map((q, i) => {
          const r = results[q.id];
          return (
            <li key={q.id} className="flex-1">
              <button
                type="button"
                onClick={() => (r || i === questions.findIndex((x) => !results[x.id]) ? goTo(i) : undefined)}
                aria-label={`Soal ${i + 1}${r ? (r.correct ? ', benar' : ', belum tepat') : ''}`}
                aria-current={i === index ? 'step' : undefined}
                className={`block w-full h-2 rounded-full transition-colors ${
                  r ? (r.correct ? 'bg-primary' : 'bg-secondary-container') : i === index ? 'bg-primary/35' : 'bg-surface-container-high'
                } ${i === index ? 'ring-2 ring-offset-2 ring-offset-surface-container-lowest ring-primary/40' : ''}`}
              />
            </li>
          );
        })}
        <li className="pl-2 text-xs text-on-surface-variant tabular-nums whitespace-nowrap">
          {questions.filter((q) => results[q.id]).length}/{questions.length}
        </li>
      </ol>

      {current ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-primary">
              Soal {index + 1} dari {questions.length}
            </span>
            <p className="text-base sm:text-lg text-on-surface leading-relaxed">
              <RichText text={current.prompt} />
            </p>
            {current.data && (
              <pre className="text-xs sm:text-sm font-code-formula text-on-surface bg-surface-container-low border border-outline-variant/60 rounded-lg p-3 overflow-x-auto whitespace-pre">
                {current.data}
              </pre>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Pilihan jawaban">
            {current.options.map((option, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={(result ? result.selected : picked) === i}
                disabled={Boolean(result) || checking}
                onClick={() => setPicked(i)}
                className={`flex items-start gap-3 text-left px-3.5 py-3 rounded-xl border text-sm sm:text-[15px] transition-colors disabled:cursor-default ${optionClass(i)}`}
              >
                <span className="w-6 h-6 rounded-md bg-surface-container text-on-surface-variant text-xs font-bold flex items-center justify-center shrink-0 mt-px">
                  {result && i === result.answer ? (
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>check</span>
                  ) : (
                    OPTION_LABELS[i]
                  )}
                </span>
                <span className="leading-relaxed">{option}</span>
              </button>
            ))}
          </div>

          {result ? (
            <div className="space-y-3">
              <div
                aria-live="polite"
                className={`rounded-xl p-3.5 border text-sm space-y-1 ${
                  result.correct ? 'bg-primary-fixed/25 border-primary/30' : 'bg-secondary-fixed/40 border-secondary/30'
                }`}
              >
                <p className={`font-bold ${result.correct ? 'text-primary' : 'text-on-secondary-fixed-variant'}`}>
                  {result.correct ? 'Tepat!' : `Belum tepat. Jawabannya ${OPTION_LABELS[result.answer]}.`}
                </p>
                <p className="text-on-surface-variant leading-relaxed">
                  <RichText text={result.explanation} />
                </p>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = questions.findIndex((q, i) => i > index && !results[q.id]);
                    const firstOpen = questions.findIndex((q) => !results[q.id]);
                    goTo(nextOpen !== -1 ? nextOpen : firstOpen !== -1 ? firstOpen : questions.length);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors"
                >
                  {questions.every((q) => results[q.id]) ? 'Lihat hasil hari ini' : 'Soal berikutnya'}
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-error min-h-4" role="alert">
                {checkError}
              </p>
              <button
                type="button"
                onClick={check}
                disabled={picked === null || checking}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checking ? 'Memeriksa…' : 'Periksa jawaban'}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Summary once all of today's questions are answered */
        <div className="space-y-4">
          <div className="rounded-2xl bg-primary-fixed/25 border border-primary/20 p-5 flex flex-wrap items-center gap-4">
            <span className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 30, fontVariationSettings: "'FILL' 1" }}>task_alt</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-on-surface">
                {correctCount} dari {questions.length} benar
              </p>
              <p className="text-sm text-on-surface-variant">
                {correctCount === questions.length
                  ? 'Sempurna! Latihan hari ini selesai.'
                  : 'Latihan hari ini selesai. Yang belum tepat sudah ada pembahasannya, jadi tetap belajar.'}{' '}
                Kembali besok untuk {questions.length} soal baru.
              </p>
            </div>
            {xpToday > 0 && (
              <span className="px-3 py-1 rounded-full bg-primary text-on-primary text-sm font-bold">+{xpToday} XP</span>
            )}
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {questions.map((q, i) => {
              const r = results[q.id];
              return (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    className="w-full flex items-start gap-2.5 text-left p-3 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low/60 transition-colors"
                  >
                    <span
                      className={`material-symbols-outlined shrink-0 ${r?.correct ? 'text-primary' : 'text-secondary'}`}
                      style={{ fontSize: 20 }}
                    >
                      {r?.correct ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-xs sm:text-sm text-on-surface-variant line-clamp-2">
                      <span className="font-semibold text-on-surface">Soal {i + 1}.</span> {q.prompt.replace(/\*\*/g, '')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};
