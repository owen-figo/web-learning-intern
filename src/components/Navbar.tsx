import React, { useState } from 'react';
import { ActivePage, UserProfile } from '../types';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  recentXpGained?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  user,
  onOpenAuth,
  recentXpGained = 25,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/60 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Brand & Nav Items */}
        <div className="flex items-center gap-6 md:gap-8">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2 text-primary font-semibold text-lg md:text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </span>
            <span>Ngerti</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-on-surface-variant">
            <button
              onClick={() => setActivePage('topics')}
              className={`pb-1 transition-colors duration-200 border-b-2 ${
                activePage === 'topics'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Topik Belajar
            </button>
            <button
              onClick={() => setActivePage('practice')}
              className={`pb-1 transition-colors duration-200 border-b-2 ${
                activePage === 'practice'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Latihan Mandiri
            </button>
            <button
              onClick={() => setActivePage('profile')}
              className={`pb-1 transition-colors duration-200 border-b-2 ${
                activePage === 'profile'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Profil
            </button>
            <button
              onClick={() => setActivePage('landing')}
              className={`pb-1 transition-colors duration-200 border-b-2 ${
                activePage === 'landing'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Tentang
            </button>
          </nav>
        </div>

        {/* Right Section: Streak, XP, Notifications, User */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Streak Indicator Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-xs sm:text-sm font-medium">
            <span className="text-base select-none">🔥</span>
            <span className="font-semibold">Streak {user.streakDays} Hari</span>
          </div>

          {/* XP Indicator Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-fixed/40 text-primary text-xs sm:text-sm font-medium transition-all duration-300">
            <span
              className="material-symbols-outlined text-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              stars
            </span>
            <span className="font-semibold">{user.xp} XP</span>
            {recentXpGained > 0 && (
              <span className="text-[11px] bg-primary-container text-on-primary px-1.5 py-0.5 rounded-full animate-gentle-pulse font-code-formula">
                +{recentXpGained} XP
              </span>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              aria-label="Notifikasi"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setUnreadNotifications(false);
              }}
              className="relative p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadNotifications && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-secondary"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <span className="text-sm font-semibold text-on-surface">Pemberitahuan</span>
                  <span className="text-xs text-primary font-medium">Semua Rileks</span>
                </div>
                <div className="space-y-3 pt-3">
                  <div className="p-2.5 rounded-lg bg-surface-container-low/60 text-xs text-on-surface-variant space-y-1">
                    <p className="font-medium text-on-surface flex items-center gap-1">
                      <span>🌿</span> Pengingat Tanpa Beban
                    </p>
                    <p>Streak 5 harimu aktif! Luangkan 3 menit santai sebelum 23.59 untuk menjaga ritme.</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-primary-fixed/20 text-xs text-on-surface-variant space-y-1">
                    <p className="font-medium text-primary flex items-center gap-1">
                      <span>⭐</span> Pencapaian Baru Terbuka
                    </p>
                    <p>Lencana &apos;Konsisten 5 Hari&apos; berhasil kamu raih!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Mini Avatar or Login Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivePage('profile')}
              title={`Profil: ${user.name}`}
              className="w-9 h-9 rounded-full text-on-primary flex items-center justify-center font-semibold text-xs tracking-wider ring-2 ring-primary-fixed-dim/40 hover:ring-primary transition-all shadow-xs"
              style={{ backgroundColor: user.avatarColor }}
            >
              <span>{user.initials}</span>
            </button>

            <button
              onClick={onOpenAuth}
              className="hidden lg:inline-flex text-xs md:text-sm font-medium text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              Masuk
            </button>
            <button
              onClick={() => setActivePage('practice')}
              className="hidden sm:inline-flex bg-primary text-on-primary hover:bg-primary-container px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all shadow-xs active:scale-95"
            >
              Mulai Belajar Santai
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
