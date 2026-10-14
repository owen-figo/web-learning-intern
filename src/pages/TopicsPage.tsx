import React from 'react';
import { ActivePage, Topic, TopicStatus, UserProfile } from '../types';
import { mockTopics } from '../data/mockData';

interface TopicsPageProps {
  user: UserProfile;
  setActivePage: (page: ActivePage) => void;
  onSelectTopic: (topicId: string) => void;
  completedTopicIds: string[];
  getTopicStatus: (topic: Topic) => TopicStatus;
  onOpenActiveTopic: () => void;
  onShowToast: (message: string) => void;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  user,
  onSelectTopic,
  completedTopicIds,
  getTopicStatus,
  onOpenActiveTopic,
  onShowToast,
}) => {
  const sortedTopics = [...mockTopics].sort((a, b) => a.order - b.order);
  const totalTopics = sortedTopics.length;
  const completedCount = completedTopicIds.length;
  const currentStep = Math.min(completedCount + 1, totalTopics);
  const isAllCompleted = completedCount >= totalTopics;

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
      {/* Reassuring Hero / Greeting Banner */}
      <section className="mb-6 md:mb-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-lowest to-surface-container-low border border-outline-variant/60 p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Ruang Belajar Statistika BINUS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
              Halo {user.name.split(' ')[0]}, siap eksplorasi topik apa hari ini?
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Nikmati prosesnya tanpa terburu-buru. Pahami konsep inti statistika langkah demi langkah, selaras kurikulum perkuliahan di BINUS University.
            </p>
          </div>
          {/* Subtle Decorative Accents */}
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:flex items-center pr-10">
            <span className="text-primary font-code-formula text-[140px] select-none font-light">∑</span>
          </div>
        </div>
      </section>

      {/* Slim Overall Progress Header */}
      <section className="mb-8 md:mb-10">
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/60 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">route</span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">
                {isAllCompleted
                  ? 'Semua Topik Selesai!'
                  : `Langkah ${currentStep} dari ${totalTopics}`}
              </h2>
            </div>
            <span className="text-xs sm:text-sm font-medium text-on-surface-variant">
              {completedCount} dari {totalTopics} materi tuntas ({Math.round((completedCount / totalTopics) * 100)}%)
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 w-full pt-1">
            {sortedTopics.map((t, idx) => {
              const isFinished = completedTopicIds.includes(t.id);
              const isCurrent = idx === completedCount;
              return (
                <div
                  key={t.id}
                  title={`Langkah ${t.order}: ${t.title}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 ${
                    isFinished
                      ? 'bg-primary'
                      : isCurrent
                      ? 'bg-primary-container ring-2 ring-primary/40 animate-pulse'
                      : 'bg-surface-variant/80'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Guided Sequential Learning Path */}
      <section className="relative max-w-3xl mx-auto space-y-0 mb-10">
        {sortedTopics.map((topic, index) => {
          const status = getTopicStatus(topic);
          const isLast = index === sortedTopics.length - 1;
          const prevTopic = sortedTopics.find((t) => t.order === topic.order - 1);
          const prevTopicTitle = prevTopic ? prevTopic.title : 'topik sebelumnya';

          return (
            <div key={topic.id} className="relative flex items-start gap-3 sm:gap-6 pb-8 last:pb-2">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[19px] sm:left-[23px] top-12 bottom-0 w-0.5 -ml-px transition-colors duration-300 ${
                    status === 'selesai' ? 'bg-primary/50' : 'bg-outline-variant/40'
                  }`}
                />
              )}

              {/* Numbered / Check / Lock Node */}
              <div className="relative z-10 shrink-0 pt-1">
                {status === 'selesai' && (
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm ring-4 ring-primary-container/25 transition-transform"
                    title={`Langkah ${topic.order}: Selesai`}
                  >
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">check</span>
                  </div>
                )}
                {status === 'aktif' && (
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm sm:text-base shadow-md ring-4 ring-primary/30 animate-pulse transition-transform"
                    title={`Langkah ${topic.order}: Aktif`}
                  >
                    <span>{topic.order}</span>
                  </div>
                )}
                {status === 'terkunci' && (
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface-container text-outline flex items-center justify-center font-medium text-xs sm:text-sm border border-outline-variant/60"
                    title={`Langkah ${topic.order}: Terkunci`}
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                  </div>
                )}
              </div>

              {/* Topic Card */}
              <article
                onClick={() => {
                  if (status === 'terkunci') {
                    onShowToast(
                      `Satu langkah dulu ya. Selesaikan ${prevTopicTitle} supaya materi berikutnya terasa lebih mudah.`
                    );
                  } else {
                    onSelectTopic(topic.id);
                  }
                }}
                className={`flex-1 rounded-2xl p-5 sm:p-6 transition-all duration-200 select-none ${
                  status === 'selesai'
                    ? 'bg-surface-container-lowest border border-primary/25 hover:border-primary/50 hover:shadow-sm cursor-pointer'
                    : status === 'aktif'
                    ? 'bg-surface-container-lowest border-2 border-primary shadow-md ring-4 ring-primary/10 cursor-pointer'
                    : 'bg-surface-container-low/70 border border-outline-variant/40 opacity-75 cursor-not-allowed'
                }`}
              >
                <div>
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          status === 'selesai'
                            ? 'bg-primary-fixed/30 text-primary'
                            : status === 'aktif'
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">{topic.iconName}</span>
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container-low text-on-surface-variant border border-outline-variant/40">
                            {topic.subCategory === 'deskriptif'
                              ? 'Statistika Deskriptif'
                              : 'Statistika Inferensial'}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container-low text-on-surface-variant border border-outline-variant/40">
                            {topic.badge}
                          </span>
                          {topic.contentType === 'teori' && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary-fixed/30 text-primary border border-primary/20 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">schedule</span>
                              <span>~10 menit baca</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-base sm:text-lg font-bold text-on-surface">
                          {topic.order}. {topic.title}
                        </h2>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {status === 'selesai' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-fixed/40 text-primary text-xs font-semibold">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                          <span>Selesai</span>
                        </span>
                      )}
                      {status === 'aktif' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold animate-pulse">
                          <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                          <span>Langkah Aktif</span>
                        </span>
                      )}
                      {status === 'terkunci' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-outline text-xs font-medium">
                          <span className="material-symbols-outlined text-[15px]">lock</span>
                          <span>Terkunci</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Topic Description */}
                  <p className="text-xs sm:text-sm text-on-surface-variant mb-4 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Middle Section: Progress or Lock helper */}
                  {status === 'selesai' && (
                    <div className="mb-4 bg-surface-container-low/70 rounded-xl p-3 border border-outline-variant/30">
                      <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                        <span className="text-on-surface-variant">
                          {topic.contentType === 'teori' ? 'Status Bacaan' : 'Progres Pemahaman'}
                        </span>
                        <span className="text-primary font-semibold">
                          {topic.contentType === 'teori' ? 'Selesai dibaca' : '100% (Tuntas)'}
                        </span>
                      </div>
                      <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary w-full"></div>
                      </div>
                      <div className="text-xs text-primary mt-2 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>
                          {topic.contentType === 'teori'
                            ? 'Materi selesai dibaca • Bebas dibaca ulang kapan saja'
                            : 'Materi tuntas dipahami • Bebas diulang kapan saja'}
                        </span>
                      </div>
                    </div>
                  )}

                  {status === 'aktif' && (
                    <div className="mb-4 bg-surface-container-low/80 rounded-xl p-3 border border-primary/25">
                      <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                        <span className="text-on-surface-variant">
                          {topic.contentType === 'teori' ? 'Status Bacaan' : 'Fokus Belajar Saat Ini'}
                        </span>
                        <span className="text-primary font-semibold">
                          {topic.contentType === 'teori' ? 'Belum dibaca' : 'Siap dikerjakan'}
                        </span>
                      </div>
                      <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-primary w-2.5 animate-pulse"></div>
                      </div>
                      <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {topic.contentType === 'teori' ? 'menu_book' : 'play_circle'}
                        </span>
                        <span>
                          {topic.contentType === 'teori'
                            ? 'Baca seluruh materi santai tanpa kuis untuk membuka langkah berikutnya'
                            : 'Selesaikan topik ini untuk membuka langkah selanjutnya'}
                        </span>
                      </div>
                    </div>
                  )}

                  {status === 'terkunci' && (
                    <div className="mb-4 bg-surface-container/60 rounded-xl p-3 border border-outline-variant/40 flex items-center gap-2.5 text-xs text-outline font-medium">
                      <span className="material-symbols-outlined text-base text-outline shrink-0">lock</span>
                      <span>
                        Selesaikan <strong className="text-on-surface-variant font-semibold">{prevTopicTitle}</strong> dulu
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div className="pt-1">
                  {status === 'selesai' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTopic(topic.id);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary border border-primary/30 text-xs sm:text-sm font-semibold transition-colors shadow-xs active:scale-[0.99]"
                    >
                      <span className="material-symbols-outlined text-[18px]">replay</span>
                      <span>Ulangi</span>
                    </button>
                  )}

                  {status === 'aktif' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTopic(topic.id);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs sm:text-sm font-semibold transition-colors shadow-xs active:scale-[0.99]"
                    >
                      <span>
                        {topic.contentType === 'teori'
                          ? 'Baca Materi Teori'
                          : topic.progressPercent > 0
                          ? 'Lanjutkan'
                          : 'Mulai'}
                      </span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  )}

                  {status === 'terkunci' && (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-outline border border-outline-variant/30 text-xs sm:text-sm font-medium cursor-not-allowed opacity-75"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock</span>
                      <span>Terkunci</span>
                    </button>
                  )}
                </div>
              </article>
            </div>
          );
        })}
      </section>

      {/* Non-Intrusive Bottom Banner */}
      <section className="mb-10">
        <div className="rounded-xl bg-surface-container-low border border-outline-variant/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed/50 flex-shrink-0 flex items-center justify-center text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined text-[24px]">timer</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-on-surface">Butuh penyegaran bertahap?</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Lanjutkan topik aktifmu sekarang atau ulangi materi sebelumnya tanpa tekanan kompetisi.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenActiveTopic}
            className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary border border-primary/30 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Lanjut Belajar Topik Aktif</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
