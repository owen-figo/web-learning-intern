import React, { useEffect, useState } from 'react';
import { UserProfile } from '../types';
import type { SavedAnswer } from '../lib/account';
import { computeAchievements, topicProgress } from '../lib/achievements';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  /** The streak (reminder toast and Ritme Harian card) is only shown to signed-in students. */
  signedIn?: boolean;
  /** The student's saved practice answers and finished topics (achievements, progress per topic). */
  answers?: Record<string, SavedAnswer>;
  completedTopicIds?: string[];
  onSignOut?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  signedIn = false,
  answers = {},
  completedTopicIds = [],
  onSignOut,
}) => {
  const achievements = computeAchievements({ answers, completedTopicIds, bestStreak: user.personalRecordStreak });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  // Earned first, then the closest to being earned.
  const sortedAchievements = [...achievements].sort(
    (x, y) => Number(y.unlocked) - Number(x.unlocked) || y.current / y.target - x.current / x.target
  );
  const topics = topicProgress(answers, completedTopicIds);
  const [showToast, setShowToast] = useState(true);
  const [emailDigest, setEmailDigest] = useState(user.emailDigest ?? true);
  const [whatsappPing, setWhatsappPing] = useState(user.whatsappPing ?? true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempInitials, setTempInitials] = useState(user.initials);
  const [savePrefNotice, setSavePrefNotice] = useState(false);

  // The account's saved preferences can arrive after this page opened.
  useEffect(() => setEmailDigest(user.emailDigest ?? true), [user.emailDigest]);
  useEffect(() => setWhatsappPing(user.whatsappPing ?? true), [user.whatsappPing]);

  const colors = [
    { name: 'Teal', hex: '#0e7c63' },
    { name: 'Warm Amber', hex: '#e7a33e' },
    { name: 'Sage', hex: '#729b79' },
    { name: 'Navy', hex: '#2c3e50' },
    { name: 'Terracotta', hex: '#c86452' },
  ];

  const openEditor = () => {
    setTempName(user.name);
    setTempInitials(user.initials);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const updated: Partial<UserProfile> = {};
    if (tempName.trim()) updated.name = tempName.trim();
    if (tempInitials.trim()) updated.initials = tempInitials.trim().substring(0, 2).toUpperCase();
    if (Object.keys(updated).length) onUpdateUser(updated);
    setIsEditingName(false);
  };

  const handleSavePreferences = () => {
    onUpdateUser({ emailDigest, whatsappPing });
    setSavePrefNotice(true);
    setTimeout(() => setSavePrefNotice(false), 3000);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-8 relative">
      {/* Gentle Floating Notification Toast */}
      {signedIn && showToast && (
        <aside
          role="status"
          className="fixed top-20 right-4 sm:right-6 md:right-8 z-50 max-w-sm w-[calc(100%-2rem)] md:w-96 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
        >
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-4 custom-floating-shadow flex items-start gap-3 relative">
            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                spa
              </span>
            </div>
            <div className="flex-1 pr-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-semibold text-primary">Pengingat Ringan</span>
                <span className="text-outline">• Tanpa Beban</span>
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                {user.streakDays > 0
                  ? `🌿 Streak ${user.streakDays} harimu aktif! Luangkan 3 menit santai sebelum jam 23.59 untuk menjaga ritme belajar.`
                  : '🌿 Mulai ritme belajarmu hari ini: satu materi atau beberapa soal sudah cukup.'}
              </p>
            </div>
            <button
              aria-label="Tutup pemberitahuan"
              onClick={() => setShowToast(false)}
              className="absolute top-2.5 right-2.5 text-outline hover:text-on-surface p-1 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </aside>
      )}

      {/* HERO SECTION: PROFILE CARD & NON-COMPETITIVE RANK */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Profile Card (7 Columns) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar Component */}
            <div className="relative group">
              <div
                className="w-20 sm:w-24 h-20 sm:h-24 rounded-full text-on-primary border-4 border-surface-container flex items-center justify-center shadow-inner transition-colors duration-200"
                style={{ backgroundColor: user.avatarColor }}
              >
                <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {user.initials}
                </span>
              </div>
              <button
                onClick={openEditor}
                title="Ubah Inisial & Nama"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">palette</span>
              </button>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                  {user.name}
                </h1>
                <button
                  onClick={openEditor}
                  className="p-1 text-outline hover:text-primary rounded transition-colors"
                  title="Ubah Nama"
                >
                  <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-[20px]">school</span>
                <span>
                  {user.major ? `${user.major} • ${user.university}` : user.university}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span>Akun Terverifikasi BINUS</span>
                </span>
                {user.streakDays >= 3 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs">
                    <span className="material-symbols-outlined text-[16px] text-secondary">energy_savings_leaf</span>
                    <span>Ritme Belajar Stabil</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Inline Palette & Initials Edit */}
          <div className="mt-6 pt-4 border-t border-surface-container flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs text-outline font-medium">Pilihan Warna Tema Avatar:</span>
              <div className="flex items-center gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    aria-label={`Warna ${c.name}`}
                    onClick={() => onUpdateUser({ avatarColor: c.hex })}
                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                      user.avatarColor === c.hex ? 'ring-2 ring-offset-2 ring-primary scale-105' : ''
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={openEditor}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Ubah Inisial</span>
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="text-xs text-on-surface-variant hover:text-error flex items-center gap-1 font-medium transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span>
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Edit Modal */}
          {isEditingName && (
            <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3">
              <span className="text-xs font-semibold text-on-surface">Sesuaikan Profil Anda</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-on-surface-variant block mb-1">Nama Tampilan</label>
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest"
                  />
                </div>
                <div>
                  <label className="text-xs text-on-surface-variant block mb-1">2 Karakter Inisial</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={tempInitials}
                    onChange={(e) => setTempInitials(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="px-3 py-1 text-xs text-on-surface-variant hover:bg-surface-container rounded"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="px-3 py-1 text-xs bg-primary text-on-primary rounded font-medium"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Personal Non-Competitive Rank Card (5 Columns) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-lowest to-surface-container-low border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-xs font-semibold tracking-wide uppercase">
                Pencapaian Belajar
              </span>
              <span className="text-xs text-outline font-medium">Level {user.level} / {user.maxLevel}</span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-[24px]">explore</span>
              <span>{user.levelTitle}</span>
            </h2>

            {/* Progress Bar within Tier */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span>Progres menuju &apos;{user.nextLevelTitle}&apos;</span>
                <span className="font-semibold text-primary">{user.levelProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${user.levelProgressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Gentle Explanatory Note */}
          <div className="mt-6 p-3.5 rounded-lg bg-surface-container-lowest border border-outline-variant/50 flex items-start gap-2.5">
            <span
              className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Tingkat ini berdasarkan pencapaian pribadi dan konsistensi belajarmu, tanpa persaingan dengan siapa pun. Kamu belajar dengan kecepatan terbaikmu sendiri.
            </p>
          </div>
        </div>
      </section>

      {/* PERSONAL STATS ROW (4 Metric Cards) */}
      <section aria-label="Statistik Belajar Pribadi">
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${signedIn ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          {/* Card 1: Streak */}
          {signedIn && (
            <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Ritme Harian</span>
                <div className="w-9 h-9 rounded-lg bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </div>
              </div>
              <div className="text-2xl font-bold text-on-surface">{user.streakDays} Hari</div>
              <div className="text-xs text-outline mt-1">
                Rekor pribadi: {user.personalRecordStreak} hari
              </div>
            </div>
          )}

          {/* Card 2: Total Soal */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Latihan Mandiri</span>
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">assignment</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">{user.questionsDone} Soal</div>
            <div className="text-xs text-outline mt-1">
              {user.selfCheckPercentage}% dari semua soal latihan
            </div>
          </div>

          {/* Card 3: Topik Dikuasai */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Topik Dikuasai</span>
              <div className="w-9 h-9 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[24px]">menu_book</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {user.masteredTopics} / {user.totalTopics} Topik
            </div>
            <div className="text-xs text-outline mt-1">
              Materi teori yang sudah tuntas
            </div>
          </div>

          {/* Card 4: Pemahaman Konsep */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Pemahaman Konsep</span>
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[24px]">adjust</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">{user.understandingScore}%</div>
            <div className="text-xs text-outline mt-1">
              Evaluasi tanpa tekanan nilai
            </div>
          </div>
        </div>
      </section>

      {/* BADGES & ACHIEVEMENTS: compact rows, earned first */}
      <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 sm:p-6 card-calm-shadow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface">Koleksi Pencapaian</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Terbuka otomatis dari latihan, bacaan, dan streak-mu.
            </p>
          </div>
          <div className="sm:w-56 shrink-0">
            <div className="flex items-baseline justify-between text-xs mb-1">
              <span className="font-semibold text-on-surface">
                <span className="tabular-nums">{unlockedCount}</span> dari <span className="tabular-nums">{achievements.length}</span> diraih
              </span>
              <span className="text-outline tabular-nums">{Math.round((unlockedCount / achievements.length) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500"
                style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {sortedAchievements.map((badge) => {
            const pct = Math.round((badge.current / badge.target) * 100);
            return (
              <li
                key={badge.id}
                title={badge.description}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                  badge.unlocked
                    ? 'border-primary-fixed-dim/60 bg-surface-container-low/50 hover:border-primary'
                    : 'border-outline-variant/40 bg-surface-container-lowest'
                }`}
              >
                <div
                  className={`relative w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${
                    badge.unlocked ? `${badge.bgClass} text-primary` : 'bg-surface-container text-outline'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: 22, fontVariationSettings: badge.unlocked ? "'FILL' 1" : undefined }}
                  >
                    {badge.icon}
                  </span>
                  {badge.unlocked ? (
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-on-primary flex items-center justify-center ring-2 ring-surface-container-lowest"
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 12 }}>check</span>
                    </span>
                  ) : (
                    <span
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface-container-high text-outline flex items-center justify-center ring-2 ring-surface-container-lowest"
                      aria-hidden="true"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 11 }}>lock</span>
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className={`text-sm font-semibold truncate ${badge.unlocked ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                      {badge.title}
                    </h3>
                    <span className={`text-[11px] font-medium tabular-nums shrink-0 ${badge.unlocked ? 'text-primary' : 'text-outline'}`}>
                      {badge.unlocked ? 'Diraih' : `${badge.current}/${badge.target}`}
                    </span>
                  </div>
                  <p className="text-xs text-outline leading-snug line-clamp-2">{badge.description}</p>
                  {!badge.unlocked && (
                    <div
                      className="mt-1.5 h-1 rounded-full bg-surface-container overflow-hidden"
                      role="progressbar"
                      aria-label={`Progres ${badge.title}`}
                      aria-valuenow={badge.current}
                      aria-valuemin={0}
                      aria-valuemax={badge.target}
                    >
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* BOTTOM GRID: PREFERENSI & RIWAYAT SESI */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preferensi Pengingat Santai (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
              <h2 className="text-lg sm:text-xl font-bold text-on-surface">Preferensi Pengingat Santai</h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pilih bagaimana kamu ingin disapa. Kami berjanji tidak akan mengirim pesan yang menuntut atau membuat cemas.
            </p>

            <div className="mt-5 space-y-3.5">
              {/* Email Reminder */}
              <label className="flex items-start justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low/30 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">mail</span>
                  <div>
                    <span className="text-xs sm:text-sm text-on-surface font-semibold block">Surel Rekap Mingguan</span>
                    <span className="text-xs text-outline">Kirimkan catatan kemajuan tiap Minggu malam.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                />
              </label>

              {/* WhatsApp Gentle Ping */}
              <label className="flex items-start justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low/30 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-[20px]">chat</span>
                  <div>
                    <span className="text-xs sm:text-sm text-on-surface font-semibold block">Sapaan WhatsApp Santai</span>
                    <span className="text-xs text-outline">Hanya satu pesan lembut jika streak-mu hampir selesai.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappPing}
                  onChange={(e) => setWhatsappPing(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                />
              </label>

              {/* Do Not Disturb Schedule */}
              <div className="p-3.5 rounded-xl bg-surface-container-low/50 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline">bedtime</span>
                  <span className="text-on-surface-variant font-medium">Mode Hening Ujian</span>
                </div>
                <span className="font-semibold text-primary">22.00 - 07.00 WIB</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container flex items-center justify-end">
            <div className="flex items-center gap-2">
              {savePrefNotice && (
                <span className="text-xs text-primary font-medium">Tersimpan!</span>
              )}
              <button
                type="button"
                onClick={handleSavePreferences}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs sm:text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs active:scale-95"
              >
                Simpan Preferensi
              </button>
            </div>
          </div>
        </div>

        {/* Progres per Topik (7 Cols): bacaan selesai dan soal latihan yang sudah dijawab */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">insights</span>
                <h2 className="text-lg sm:text-xl font-bold text-on-surface">Progres per Topik</h2>
              </div>
              <span className="text-xs text-outline">
                {topics.filter((t) => t.readingDone).length} / {topics.length} bacaan selesai
              </span>
            </div>

            <ul className="space-y-2">
              {topics.map((t) => {
                const pct = Math.round((t.answered / t.total) * 100);
                return (
                  <li
                    key={t.topicId}
                    className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low/40 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        t.readingDone ? 'bg-primary-fixed/50 text-primary' : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{t.icon}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-xs sm:text-sm text-on-surface truncate">
                          {t.order}. {t.title}
                        </h3>
                        {t.readingDone ? (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed text-[11px] font-medium">
                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>
                            Bacaan selesai
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-medium">
                            Belum dibaca
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-outline tabular-nums shrink-0 w-28 text-right">
                          {t.answered}/{t.total} soal{t.answered ? ` · ${Math.round((t.correct / t.answered) * 100)}% benar` : ''}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-5 pt-3 border-t border-surface-container flex items-center gap-2 text-xs text-outline">
            <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
            <span>Semua progres tersimpan di akunmu. Kamu bisa berhenti dan lanjut kapan saja, dari perangkat mana pun.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
