import React, { useEffect, useState } from 'react';
import { signIn } from '../lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name?: string) => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-outline/70 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest transition-colors';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [showNim, setShowNim] = useState(false);
  const [email, setEmail] = useState('');
  const [nim, setNim] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const student = await signIn(email, nim);
      onSuccess(student.name);
      setNim('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Masuk gagal. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      {/* Centered Single Auth Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 p-6 sm:p-8 flex flex-col relative my-auto"
      >
        {/* Top Bar: Logo & Return */}
        <header className="flex items-center justify-between pb-6">
          <div className="flex items-center gap-2 text-primary font-semibold text-lg md:text-xl tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-xs">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                eco
              </span>
            </span>
            <span>Ngerti</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span>Kembali ke Beranda</span>
          </button>
        </header>

        {/* Title Section */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container text-primary text-xs font-medium mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            <span>Ruang Belajar Mandiri</span>
          </div>
          <h1 id="auth-title" className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
            Selamat Datang Kembali
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Masuk dengan email dan NIM yang terdaftar di kampus.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="auth-email" className="block text-xs sm:text-sm font-medium text-on-surface mb-1">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@binus.ac.id"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="auth-nim" className="block text-xs sm:text-sm font-medium text-on-surface mb-1">
              NIM <span className="font-normal text-on-surface-variant">(Nomor Induk Mahasiswa)</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="auth-nim"
                type={showNim ? 'text' : 'password'}
                inputMode="numeric"
                autoComplete="current-password"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 2701234567"
                required
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowNim(!showNim)}
                aria-label={showNim ? 'Sembunyikan NIM' : 'Tampilkan NIM'}
                className="absolute right-3 text-outline hover:text-on-surface p-0.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showNim ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs sm:text-sm text-error flex items-start gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className="w-full py-2.5 sm:py-3 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold transition-all duration-200 card-calm-shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              <span>{submitting ? 'Memeriksa…' : 'Masuk ke Ruang Belajar'}</span>
              {submitting ? (
                <span aria-hidden="true" className="w-4 h-4 rounded-full border-2 border-on-primary/30 border-t-on-primary animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              )}
            </button>
          </div>

          <p className="text-xs text-on-surface-variant text-center leading-relaxed">
            Belum bisa masuk? Pastikan email dan NIM sesuai data kampus, atau hubungi admin Ngerti.
          </p>
        </form>

        {/* Footer */}
        <footer className="pt-5 mt-4 border-t border-outline-variant/40 flex flex-wrap items-center justify-between text-xs text-outline gap-2 w-full">
          <span>© 2025 Ngerti</span>
          <div className="flex items-center gap-3">
            <span className="hover:text-primary cursor-pointer">Privasi</span>
            <span>•</span>
            <span className="hover:text-primary cursor-pointer">Bantuan Belajar</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
