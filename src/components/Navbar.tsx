import React, { useState, useEffect, useRef } from 'react';
import { ActivePage, UserProfile } from '../types';
import { PomodoroButton } from './PomodoroButton';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  user: UserProfile;
  onOpenAuth: () => void;
  signedIn?: boolean;
  onSignOut?: () => void;
  recentXpGained?: number;
  recentXpKey?: number;
  onOpenActiveTopic?: () => void;
  onOpenPractice?: () => void;
}

/** Wait for the page transition before showing gained XP. */
const XP_POP_DELAY_MS = 500;
/** How long the "+N XP" badge stays before fading. */
const XP_POP_HOLD_MS = 3000;
/** Duration of the total XP count-up. */
const XP_COUNT_MS = 900;

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  user,
  onOpenAuth,
  signedIn = false,
  onSignOut,
  recentXpGained = 0,
  recentXpKey = 0,
  onOpenActiveTopic,
  onOpenPractice,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Close the notification box on a click/tap outside it (bell included in the wrapper) or Escape.
  useEffect(() => {
    if (!showNotifications) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!notificationsRef.current?.contains(e.target as Node)) setShowNotifications(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowNotifications(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showNotifications]);

  // Transient XP popup state. The popup waits for the page transition to finish, then the
  // total counts up and the "+N XP" badge stays long enough to be noticed.
  const [visibleXp, setVisibleXp] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [xpBump, setXpBump] = useState<boolean>(false);
  const popTimersRef = useRef<number[]>([]);

  const clearPopTimers = () => {
    popTimersRef.current.forEach((t) => window.clearTimeout(t));
    popTimersRef.current = [];
  };
  useEffect(() => clearPopTimers, []);

  // Keyed on recentXpKey only: App resets recentXpGained to 0 later, which must not cancel the popup.
  useEffect(() => {
    if (!recentXpKey || recentXpGained <= 0) return;
    clearPopTimers();
    const at = (ms: number, fn: () => void) => popTimersRef.current.push(window.setTimeout(fn, ms));
    at(XP_POP_DELAY_MS, () => {
      setVisibleXp(recentXpGained);
      setIsFadingOut(false);
      setXpBump(true);
    });
    at(XP_POP_DELAY_MS + 600, () => setXpBump(false));
    at(XP_POP_DELAY_MS + XP_POP_HOLD_MS, () => setIsFadingOut(true));
    at(XP_POP_DELAY_MS + XP_POP_HOLD_MS + 400, () => setVisibleXp(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentXpKey]);

  // Total XP counts up to the new value instead of jumping. When the navbar mounts right after
  // XP was earned on a page without it (e.g. finishing a theory topic), it starts from the old total.
  const [shownXp, setShownXp] = useState<number>(() => user.xp - (recentXpGained > 0 ? recentXpGained : 0));
  const shownXpRef = useRef(shownXp);
  useEffect(() => {
    const from = shownXpRef.current;
    const to = user.xp;
    if (from === to) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      shownXpRef.current = to;
      setShownXp(to);
      return;
    }
    const start = performance.now() + XP_POP_DELAY_MS;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / XP_COUNT_MS));
      const value = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      shownXpRef.current = value;
      setShownXp(value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [user.xp]);

  return (
    <header
      className="bg-surface-container-lowest border-b border-outline-variant/60 sticky top-0 z-40 shadow-xs"
      // Own view-transition layer so the header stays put while the page below animates.
      style={{ viewTransitionName: 'site-header' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Brand & Nav Items */}
        <div className="flex items-center gap-6 md:gap-2 lg:gap-8">
          <button
            onClick={() => setActivePage('landing')}
            className="flex items-center gap-2 text-primary font-semibold text-lg md:text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </span>
            {/* Di layar sempit wordmark disembunyikan secara visual supaya ruang header cukup, tetap terbaca pembaca layar. */}
            <span className="sr-only xl:not-sr-only">Ngerti</span>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2.5 lg:gap-6 text-sm font-medium text-on-surface-variant">
            <button
              onClick={() => setActivePage('landing')}
              className={`pb-1 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activePage === 'landing'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Beranda
            </button>
            <button
              onClick={() => setActivePage('topics')}
              className={`pb-1 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activePage === 'topics'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Topik Belajar
            </button>
            <button
              onClick={() => (onOpenPractice ? onOpenPractice() : setActivePage('practice'))}
              className={`pb-1 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activePage === 'practice'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Latihan Mandiri
            </button>
            <button
              onClick={() => setActivePage('leaderboard')}
              className={`pb-1 whitespace-nowrap transition-colors duration-200 border-b-2 ${
                activePage === 'leaderboard'
                  ? 'text-primary border-primary font-semibold'
                  : 'border-transparent hover:text-primary'
              }`}
            >
              Leaderboard
            </button>
          </nav>
        </div>

        {/* Right Section: Streak, XP, Notifications, User */}
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3.5">
          {/* Streak Indicator Pill: Only flame and number */}
          <div
            aria-label={`Streak ${user.streakDays} hari`}
            className="flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed-variant text-base lg:text-lg font-bold select-none shrink-0"
          >
            <span className="text-lg lg:text-xl leading-none">🔥</span>
            <span className="leading-none">{user.streakDays}</span>
          </div>

          {/* XP Indicator Pill & Popup */}
          <div className="relative shrink-0">
            <div
              aria-label={`Total ${user.xp} XP`}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 sm:py-1.5 rounded-full text-primary text-base lg:text-lg font-bold transition-colors duration-500 ${
                xpBump ? 'xp-bump bg-primary-fixed' : 'bg-primary-fixed/40'
              }`}
            >
              <span
                className="material-symbols-outlined text-primary text-[20px] lg:text-[24px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </span>
              <span className="leading-none tabular-nums">{shownXp} XP</span>
            </div>

            {/* XP-Gain Popup */}
            {visibleXp !== null && (
              <div
                role="status"
                aria-live="polite"
                className={`xp-float-in pointer-events-none absolute left-1/2 top-full mt-2 z-50 px-3 py-1 rounded-xl bg-primary text-on-primary font-bold text-xs sm:text-sm shadow-md shadow-primary/25 whitespace-nowrap transition-opacity duration-400 ${
                  isFadingOut ? 'opacity-0' : 'opacity-100'
                }`}
              >
                +{visibleXp} XP
              </div>
            )}
          </div>

          {/* Pomodoro Timer */}
          <PomodoroButton />

          {/* Notification Button (disembunyikan hanya di layar < 340px agar avatar tidak terdorong keluar) */}
          <div ref={notificationsRef} className="relative shrink-0 max-[339px]:hidden">
            <button
              aria-label="Notifikasi"
              aria-expanded={showNotifications}
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
                    <p>
                      {user.streakDays > 0
                        ? `Streak ${user.streakDays} harimu aktif! Luangkan 3 menit santai sebelum 23.59 untuk menjaga ritme.`
                        : 'Mulai ritme belajarmu hari ini: satu materi atau beberapa soal sudah cukup.'}
                    </p>
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

          {/* User Profile Mini Avatar & Login Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActivePage('profile')}
              title={`Profil: ${user.name}`}
              aria-label="Buka profil"
              className={`w-9 h-9 rounded-full text-on-primary flex items-center justify-center font-semibold text-xs tracking-wider transition-all shadow-xs ${
                activePage === 'profile'
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-lowest'
                  : 'ring-2 ring-primary-fixed-dim/40 hover:ring-primary'
              }`}
              style={{ backgroundColor: user.avatarColor }}
            >
              <span>{user.initials}</span>
            </button>

            <button
              onClick={signedIn ? onSignOut : onOpenAuth}
              className="hidden lg:inline-flex text-xs md:text-sm font-medium text-on-surface-variant hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              {signedIn ? 'Keluar' : 'Masuk'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
