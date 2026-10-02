import React, { useState } from 'react';
import { ActivePage, Topic, UserProfile } from '../types';
import { mockTopics } from '../data/mockData';

interface TopicsPageProps {
  user: UserProfile;
  setActivePage: (page: ActivePage) => void;
  onSelectTopic?: (topicId: string) => void;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  user,
  setActivePage,
  onSelectTopic,
}) => {
  const [filter, setFilter] = useState<'all' | 'statistika' | 'kalkulus_aljabar' | 'active'>('all');

  const filteredTopics = mockTopics.filter((topic: Topic) => {
    if (filter === 'statistika') return topic.category === 'statistika';
    if (filter === 'kalkulus_aljabar') return topic.category === 'kalkulus_aljabar';
    if (filter === 'active') return topic.progressPercent > 0 && topic.progressPercent < 100;
    return true;
  });

  const handleTopicAction = (topic: Topic) => {
    if (onSelectTopic) onSelectTopic(topic.id);
    if (topic.contentType === 'teori') {
      setActivePage('teori');
    } else {
      setActivePage('practice');
    }
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
      {/* Reassuring Hero / Greeting Banner */}
      <section className="mb-8 md:mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-lowest to-surface-container-low border border-outline-variant/60 p-6 sm:p-8 md:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary-fixed/50 text-on-primary-fixed text-xs font-medium mb-3">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>Ruang Belajar Tenang</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-on-surface tracking-tight mb-2">
              Halo {user.name.split(' ')[0]}, mau eksplorasi topik apa hari ini?
            </h1>
            <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
              Nikmati prosesnya tanpa terburu-buru. Pahami konsep inti langkah demi langkah, tanpa rasa cemas rumus rumit.
            </p>
          </div>
          {/* Subtle Decorative Accents */}
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none hidden md:flex items-center pr-10">
            <span className="text-primary font-code-formula text-[140px] select-none font-light">∑</span>
          </div>
        </div>
      </section>

      {/* Filter Pills Navigation Section */}
      <section className="mb-8">
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-outline-variant/30">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              filter === 'all'
                ? 'bg-surface-container-lowest text-primary border border-primary/40 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">category</span>
            <span>Semua Topik</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('statistika')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              filter === 'statistika'
                ? 'bg-surface-container-lowest text-primary border border-primary/40 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
            }`}
          >
            Statistika
          </button>

          <button
            type="button"
            onClick={() => setFilter('kalkulus_aljabar')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
              filter === 'kalkulus_aljabar'
                ? 'bg-surface-container-lowest text-primary border border-primary/40 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
            }`}
          >
            Kalkulus &amp; Aljabar
          </button>

          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
              filter === 'active'
                ? 'bg-surface-container-lowest text-primary border border-primary/40 shadow-xs'
                : 'bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container border border-transparent'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
            <span>Sedang Dipelajari</span>
          </button>
        </div>
      </section>

      {/* Topics Bento / Rich Card Grid (6 Cards) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredTopics.map((topic) => (
          <article
            key={topic.id}
            onClick={() => handleTopicAction(topic)}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:border-primary-container transition-all duration-200 card-gentle cursor-pointer"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[26px]">{topic.iconName}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface-variant text-xs border border-outline-variant/40 font-medium">
                  {topic.badge}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-on-surface mb-1.5">
                {topic.title}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant mb-4 leading-relaxed">
                {topic.description}
              </p>

              {/* Progress Component */}
              <div className="mb-4 bg-surface-container-low/70 rounded-lg p-3 border border-outline-variant/30">
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="text-on-surface-variant">Progres Pemahaman</span>
                  <span className={topic.progressPercent > 0 ? 'text-primary font-semibold' : 'text-outline'}>
                    {topic.progressPercent === 0 ? '0% (Belum dimulai)' : `${topic.progressPercent}%`}
                  </span>
                </div>
                <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.progressPercent > 0 ? 'bg-primary-container' : 'bg-outline-variant'
                    }`}
                    style={{ width: `${topic.progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
                  <span
                    className="material-symbols-outlined text-[16px] text-primary"
                    style={{ fontVariationSettings: topic.progressPercent === 90 ? "'FILL' 1" : undefined }}
                  >
                    {topic.progressPercent === 90 ? 'verified' : 'check_circle'}
                  </span>
                  <span>{topic.progressLabel}</span>
                </div>
              </div>

              {/* Difficulty Level Badges */}
              <div className="mb-4">
                <p className="text-xs text-outline mb-1.5 font-medium">Tingkatan Kesulitan:</p>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {/* Mudah */}
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed/40 text-on-primary-fixed font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    Mudah {topic.progressPercent === 0 ? '(Siap)' : ''}
                  </span>

                  {/* Sedang */}
                  {topic.unlockedTiers.includes('sedang') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-fixed/50 text-on-secondary-fixed-variant font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Sedang
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-outline">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Sedang
                    </span>
                  )}

                  {/* Sulit */}
                  {topic.unlockedTiers.includes('sulit') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-error-container/60 text-on-error-container font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      Sulit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-outline">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Sulit
                    </span>
                  )}

                  {/* Sangat Sulit */}
                  {topic.unlockedTiers.includes('sangat_sulit') ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-fixed/40 text-on-primary-fixed font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                      Sangat Sulit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-outline">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Sangat Sulit
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              {topic.contentType === 'teori' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicAction(topic);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.99]"
                >
                  <span>Baca Materi Teori</span>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </button>
              ) : topic.statusAction === 'lanjut' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicAction(topic);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-[0.99]"
                >
                  <span>Lanjut Belajar</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              ) : topic.statusAction === 'ulang' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicAction(topic);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors border border-outline-variant/50"
                >
                  <span>Ulang Kuis &amp; Refleksi</span>
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                </button>
              ) : topic.statusAction === 'mulai' ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicAction(topic);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors border border-outline-variant/50"
                >
                  <span>Mulai Topik Ini</span>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTopicAction(topic);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors border border-outline-variant/50"
                >
                  <span>Pelajari Konsep</span>
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* Non-Intrusive Daily Practice Banner */}
      <section className="mb-10">
        <div className="rounded-xl bg-surface-container-low border border-outline-variant/70 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-full bg-secondary-fixed/50 flex-shrink-0 flex items-center justify-center text-on-secondary-fixed-variant">
              <span className="material-symbols-outlined text-[24px]">timer</span>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-on-surface">Butuh penyegaran cepat?</h3>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Coba Latihan Harian 5 menit untuk menjaga pemahamanmu tanpa tekanan nilai.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('practice')}
            className="flex-shrink-0 w-full sm:w-auto px-5 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary border border-primary/30 text-xs sm:text-sm font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>Latihan Harian (5 Menit)</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      </section>
    </div>
  );
};
