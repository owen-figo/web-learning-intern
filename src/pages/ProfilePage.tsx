import React, { useState } from 'react';
import { UserProfile, BadgeItem, LearningSession } from '../types';
import { mockBadges, mockLearningSessions } from '../data/mockData';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateUser }) => {
  const [showToast, setShowToast] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [whatsappPing, setWhatsappPing] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempInitials, setTempInitials] = useState(user.initials);
  const [savePrefNotice, setSavePrefNotice] = useState(false);

  const colors = [
    { name: 'Teal', hex: '#0e7c63' },
    { name: 'Warm Amber', hex: '#e7a33e' },
    { name: 'Sage', hex: '#729b79' },
    { name: 'Navy', hex: '#2c3e50' },
    { name: 'Terracotta', hex: '#c86452' },
  ];

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateUser({ name: tempName.trim() });
    }
    if (tempInitials.trim()) {
      onUpdateUser({ initials: tempInitials.trim().substring(0, 2).toUpperCase() });
    }
    setIsEditingName(false);
  };

  const handleSavePreferences = () => {
    setSavePrefNotice(true);
    setTimeout(() => setSavePrefNotice(false), 3000);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10 space-y-8 relative">
      {/* Gentle Floating Notification Toast */}
      {showToast && (
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
                🌿 Streak 5 harimu aktif! Luangkan 3 menit santai sebelum jam 23.59 untuk menjaga ritme belajar.
              </p>
            </div>
            <button
              aria-label="Tutup pemberitahuan"
              onClick={() => setShowToast(false)}
              className="absolute top-2.5 right-2.5 text-outline hover:text-on-surface p-1 rounded-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
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
                onClick={() => setIsEditingName(true)}
                title="Ubah Inisial & Nama"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary shadow-xs transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">palette</span>
              </button>
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
                  {user.name}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-outline hover:text-primary rounded transition-colors"
                  title="Ubah Nama"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>

              <p className="text-xs sm:text-sm text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-[18px]">school</span>
                <span>
                  {user.major} • {user.university}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span>Akun Terverifikasi BINUS</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs">
                  <span className="material-symbols-outlined text-[16px] text-secondary">energy_savings_leaf</span>
                  <span>Ritme Belajar Stabil</span>
                </span>
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

            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <span className="material-symbols-outlined text-[16px]">edit_note</span>
              <span>Ubah Inisial</span>
            </button>
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
              <span className="material-symbols-outlined text-tertiary text-2xl">explore</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Streak */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Ritme Harian</span>
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed/40 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">{user.streakDays} Hari</div>
            <div className="text-xs text-outline mt-1">
              Rekor pribadi: {user.personalRecordStreak} hari
            </div>
          </div>

          {/* Card 2: Total Soal */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Latihan Mandiri</span>
              <div className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">assignment</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">{user.questionsDone} Soal</div>
            <div className="text-xs text-outline mt-1">
              {user.selfCheckPercentage}% proses cek mandiri
            </div>
          </div>

          {/* Card 3: Topik Dikuasai */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Topik Dikuasai</span>
              <div className="w-9 h-9 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">menu_book</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">
              {user.masteredTopics} / {user.totalTopics} Topik
            </div>
            <div className="text-xs text-outline mt-1">
              Distribusi Normal &amp; Regresi
            </div>
          </div>

          {/* Card 4: Pemahaman Konsep */}
          <div className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-5 card-calm-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-on-surface-variant font-medium">Pemahaman Konsep</span>
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">adjust</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-on-surface">{user.understandingScore}%</div>
            <div className="text-xs text-outline mt-1">
              Evaluasi tanpa tekanan nilai
            </div>
          </div>
        </div>
      </section>

      {/* BADGES & ACHIEVEMENTS GRID */}
      <section className="bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-surface-container pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface">
              Koleksi Pencapaian &amp; Hadiah Kosmetik
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              Kumpulkan pengingat perjalanan belajarmu dalam nuansa yang menenangkan.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-outline font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> 4 Terbuka
            <span className="w-2.5 h-2.5 rounded-full bg-outline-variant ml-2"></span> 3 Terkunci
          </div>
        </div>

        {/* Badges Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {mockBadges.map((badge: BadgeItem) => (
            <div
              key={badge.id}
              className={`rounded-xl p-5 flex flex-col justify-between transition-colors border ${
                badge.unlocked
                  ? 'border-primary-fixed-dim/60 bg-surface-container-low/40 hover:border-primary'
                  : 'border-outline-variant/40 bg-surface-container-lowest opacity-80 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-xs ${
                      badge.unlocked
                        ? `${badge.bgClass || 'bg-primary-fixed'} text-primary`
                        : 'bg-surface-container text-outline'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[26px]"
                      style={{ fontVariationSettings: badge.unlocked ? "'FILL' 1" : undefined }}
                    >
                      {badge.icon}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      badge.unlocked
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'bg-surface-container text-outline'
                    }`}
                  >
                    {badge.unlocked ? 'Terbuka' : 'Terkunci'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-on-surface mb-1">
                  {badge.title}
                </h3>
                <p className={`text-xs leading-relaxed ${badge.unlocked ? 'text-on-surface-variant' : 'text-outline'}`}>
                  {badge.description}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t flex items-center gap-1.5 text-xs font-medium ${
                  badge.unlocked
                    ? 'border-outline-variant/40 text-primary'
                    : 'border-surface-container text-outline'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {badge.unlocked ? 'redeem' : 'lock'}
                </span>
                <span>{badge.reward}</span>
              </div>
            </div>
          ))}

          {/* Encouraging Upcoming Slot */}
          <div className="border border-dashed border-outline-variant rounded-xl p-5 flex flex-col items-center justify-center text-center bg-surface-container-low/20">
            <span className="material-symbols-outlined text-outline text-[32px] mb-2">hourglass_top</span>
            <span className="text-xs sm:text-sm font-semibold text-on-surface">Tantangan Baru Segera Hadir</span>
            <p className="text-xs text-outline mt-1">Fokus pada proses belajarmu saat ini.</p>
          </div>
        </div>
      </section>

      {/* BOTTOM GRID: PREFERENSI & RIWAYAT SESI */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preferensi Pengingat Santai (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
              <h2 className="text-base sm:text-lg font-bold text-on-surface">Preferensi Pengingat Santai</h2>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pilih bagaimana kamu ingin disapa. Kami berjanji tidak akan mengirim pesan yang menuntut atau membuat cemas.
            </p>

            <div className="mt-5 space-y-3.5">
              {/* Email Reminder */}
              <label className="flex items-start justify-between p-3.5 rounded-xl border border-outline-variant/60 hover:bg-surface-container-low/30 cursor-pointer transition-colors">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-xl">mail</span>
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
                  <span className="material-symbols-outlined text-primary mt-0.5 text-xl">chat</span>
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

          <div className="pt-4 border-t border-surface-container flex items-center justify-between">
            <button
              onClick={() => alert('Data latihan sesi lokal telah disegarkan.')}
              className="text-xs text-outline hover:text-error transition-colors"
            >
              Hapus Data Belajar
            </button>
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

        {/* Riwayat Sesi Belajar (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant/70 rounded-xl p-6 sm:p-8 card-calm-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">history</span>
                <h2 className="text-base sm:text-lg font-bold text-on-surface">Riwayat Sesi Belajar</h2>
              </div>
              <button
                onClick={() => alert('Semua riwayat latihan mandiri tersimpan secara lokal dan otomatis.')}
                className="text-xs text-primary hover:underline font-medium"
              >
                Lihat Semua
              </button>
            </div>

            {/* Session List */}
            <div className="space-y-3">
              {mockLearningSessions.map((session: LearningSession) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-low/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        session.tagType === 'rileks'
                          ? 'bg-primary-fixed/40 text-primary'
                          : session.tagType === 'baik'
                          ? 'bg-secondary-fixed/40 text-secondary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{session.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-on-surface">{session.title}</h4>
                      <p className="text-xs text-outline">{session.timeAgo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.tagType === 'rileks'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : session.tagType === 'baik'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {session.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Encouraging Footer Note */}
          <div className="mt-5 pt-3 border-t border-surface-container flex items-center gap-2 text-xs text-outline">
            <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
            <span>Setiap sesi disimpan otomatis. Kamu bisa berhenti dan lanjut kapan saja tanpa takut kehilangan kemajuan.</span>
          </div>
        </div>
      </section>
    </div>
  );
};
