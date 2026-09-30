import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Right-side interactive mini simulation
  const [selectedDemoChoice, setSelectedDemoChoice] = useState<number>(75);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(name || (tab === 'signup' ? 'Mahasiswa Ngerti' : undefined));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-0 md:p-6 animate-in fade-in">
      <div className="min-h-screen md:min-h-0 md:max-h-[95vh] w-full max-w-6xl bg-surface-container-lowest md:rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row relative">
        {/* Left Side: Auth Form */}
        <section className="w-full lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-surface-container-lowest overflow-y-auto">
          <div>
            {/* Top Bar: Logo & Return */}
            <header className="flex items-center justify-between pb-6 sm:pb-8">
              <div className="flex items-center gap-2 text-primary font-semibold text-lg md:text-xl tracking-tight">
                <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    eco
                  </span>
                </span>
                <span>Ngerti</span>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Kembali ke Beranda</span>
              </button>
            </header>

            {/* Form Core Container */}
            <div className="max-w-[420px] mx-auto w-full pt-1 pb-4">
              {/* Tab Switcher */}
              <div className="bg-surface-container-low p-1 rounded-xl flex items-center mb-6 border border-outline-variant/40" role="tablist">
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium text-center transition-all ${
                    tab === 'login'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Masuk (Log In)
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium text-center transition-all ${
                    tab === 'signup'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Daftar Akun Baru (Sign-up)
                </button>
              </div>

              {/* Title Section */}
              {tab === 'login' ? (
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container text-primary text-xs font-medium mb-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span>Ruang Belajar Mandiri</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                    Selamat Datang Kembali di Ruang Belajar Tenangmu
                  </h1>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Lanjutkan belajar statistika dan matematika tanpa rasa terburu-buru atau dihakimi.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant text-xs font-medium mb-2.5">
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      spa
                    </span>
                    <span>Mulai Langkah Pertama</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight mb-1.5">
                    Mulai Perjalanan Belajar Tanpa Tekanan
                  </h1>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Buat akun dalam hitungan detik. Kami siapkan materi bertahap yang ramah pemula.
                  </p>
                </div>
              )}

              {/* Google Social Button */}
              <button
                type="button"
                onClick={() => {
                  onSuccess('Rian Ardiansyah');
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs sm:text-sm font-medium transition-all active:scale-[0.99] mb-4 group"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                  <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" fill="#34A853"></path>
                  <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                  <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
                </svg>
                <span className="group-hover:text-primary transition-colors">Lanjutkan dengan Google</span>
              </button>

              {/* Divider */}
              <div className="relative flex py-2 items-center mb-4">
                <div className="flex-grow border-t border-outline-variant/60"></div>
                <span className="flex-shrink mx-3 text-xs text-outline">atau masuk lebih cepat dengan</span>
                <div className="flex-grow border-t border-outline-variant/60"></div>
              </div>

              {/* Form elements */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {tab === 'signup' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-on-surface mb-1">
                      Nama Panggilan
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Ardi atau Rania"
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-outline/70 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-on-surface mb-1">
                    Alamat Email Mahasiswa
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@kampus.ac.id atau email pribadi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-outline/70 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs sm:text-sm font-medium text-on-surface">
                      Kata Sandi
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Tautan pemulihan kata sandi telah dikirimkan ke email terdaftar.')}
                        className="text-xs text-primary hover:underline"
                      >
                        Lupa kata sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={tab === 'signup' ? 'Minimal 8 karakter yang aman' : 'Masukkan kata sandi akunmu'}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-outline/70 border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary bg-surface-container-lowest pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-outline hover:text-on-surface p-0.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {tab === 'signup' && (
                  <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/60 flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                    <span className="text-secondary text-base flex-shrink-0 mt-0.5">💡</span>
                    <p>
                      <strong className="text-on-surface font-medium">Tanpa tes diagnostik dadakan</strong>, tanpa peringkat publik. Kamu belajar sepenuhnya sesuai ritme dan kesiapanmu.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 sm:py-3 px-6 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs sm:text-sm font-semibold transition-all duration-200 card-calm-shadow active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    <span>{tab === 'login' ? 'Masuk ke Ruang Belajar' : 'Daftar & Mulai Belajar Gratis'}</span>
                    <span className="material-symbols-outlined text-[18px]">
                      {tab === 'login' ? 'arrow_forward' : 'favorite'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Left Footer */}
          <footer className="pt-4 border-t border-outline-variant/40 flex flex-wrap items-center justify-between text-xs text-outline gap-2 max-w-[420px] mx-auto w-full">
            <span>© 2025 Ngerti</span>
            <div className="flex items-center gap-3">
              <span className="hover:text-primary cursor-pointer">Privasi</span>
              <span>•</span>
              <span className="hover:text-primary cursor-pointer">Bantuan Belajar</span>
            </div>
          </footer>
        </section>

        {/* Right Side: Calming Teal Interactive Panel */}
        <aside className="w-full lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-[#0E7C63] via-[#09624e] to-[#044234] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Bell Curve Graphic */}
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-white/[0.04] blur-2xl pointer-events-none"></div>
          <div className="absolute -left-20 bottom-10 w-80 h-80 rounded-full bg-[#E7A33E]/10 blur-3xl pointer-events-none"></div>
          <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern-modal" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern-modal)" />
            <path d="M 0 500 C 150 500 200 220 350 220 C 500 220 550 500 700 500" fill="none" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
          </svg>

          {/* Header & Quote */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-on-primary-container text-xs font-medium mb-4 shadow-sm">
              <span>🌿 Belajar Santai &amp; Terarah</span>
            </div>
            <blockquote className="text-base sm:text-xl font-medium leading-relaxed tracking-tight text-white mb-6">
              “Matematika bukan tentang siapa yang paling cepat, tapi siapa yang menikmati proses memahaminya.”
            </blockquote>

            {/* Interactive Live Preview Card */}
            <div className="bg-surface-container-lowest text-on-surface rounded-2xl p-5 sm:p-6 card-float border border-white/20 max-w-lg transition-transform hover:-translate-y-0.5 duration-300">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span className="text-xs text-outline font-medium">Coba Intip Cara Kami Belajar:</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary text-xs font-semibold">
                  Statistika Deskriptif
                </span>
              </div>

              <div className="mb-3.5">
                <div className="text-xs sm:text-sm text-primary font-semibold mb-1">
                  Topik: Median Data Ganjil
                </div>
                <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                  Nilai kuis 5 mahasiswa: <span className="font-code-formula text-xs bg-surface-container px-2 py-0.5 rounded text-primary font-semibold">[60, 70, 75, 80, 90]</span>. Berapakah nilai tengahnya (median)?
                </p>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-3 gap-2 mb-3.5">
                <button
                  type="button"
                  onClick={() => setSelectedDemoChoice(70)}
                  className={`py-2 px-2.5 rounded-lg border text-center font-code-formula text-xs sm:text-sm transition-all ${
                    selectedDemoChoice === 70
                      ? 'border-2 border-primary bg-primary-fixed/30 font-bold text-primary'
                      : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  70
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDemoChoice(75)}
                  className={`py-2 px-2.5 rounded-lg border-2 text-center font-code-formula text-xs sm:text-sm font-bold flex items-center justify-center gap-1 shadow-xs transition-all ${
                    selectedDemoChoice === 75
                      ? 'border-primary bg-on-primary-container/30 text-primary'
                      : 'border-outline-variant/60 text-on-surface-variant'
                  }`}
                >
                  <span>75</span>
                  {selectedDemoChoice === 75 && (
                    <span className="material-symbols-outlined text-[15px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDemoChoice(80)}
                  className={`py-2 px-2.5 rounded-lg border text-center font-code-formula text-xs sm:text-sm transition-all ${
                    selectedDemoChoice === 80
                      ? 'border-2 border-primary bg-primary-fixed/30 font-bold text-primary'
                      : 'border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  80
                </button>
              </div>

              {/* Trik Cepat Ngerti */}
              <div className="p-3 rounded-xl bg-[#FEF6EB] border border-[#FCDCB2] mb-3 text-xs">
                <div className="flex items-center gap-1.5 text-secondary font-semibold mb-1">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    lightbulb
                  </span>
                  <span>Trik Cepat Ngerti:</span>
                </div>
                <p className="text-on-secondary-container leading-relaxed">
                  Urutkan data dari terkecil ke terbesar, lalu ambil posisi tepat di tengah <span className="font-code-formula text-[11px] bg-white/70 px-1 py-0.5 rounded">[(5 + 1) ÷ 2 = posisi ke-3]</span>! Selesai dalam 3 detik tanpa rumus rumit.
                </p>
              </div>

              {/* Feedback */}
              <div className="flex items-center gap-2 text-primary text-xs font-medium bg-surface-container-low px-3 py-2 rounded-lg">
                <span>🎯</span>
                <span>
                  {selectedDemoChoice === 75
                    ? 'Tepat sekali! Konsep sesimpel ini yang selalu kita bongkar bareng di Ngerti.'
                    : 'Hampir tepat! Data ke-3 dari [60, 70, 75, 80, 90] adalah 75.'}
                </span>
              </div>
            </div>
          </div>

          {/* Testimonial & Social Proof */}
          <div className="relative z-10 pt-6 mt-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 max-w-lg mb-4">
              <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-inner">
                SN
              </div>
              <div>
                <p className="text-xs text-white/95 italic leading-snug">
                  “Dulu selalu mual tiap lihat rumus regresi. Di Ngerti dijelasin pakai bahasa manusia.”
                </p>
                <span className="text-[11px] text-on-primary-container font-medium block mt-0.5">
                  — Siti N., Mahasiswi Manajemen
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/75">
              <span className="material-symbols-outlined text-[16px] text-primary-fixed">school</span>
              <span>Bergabung bersama 2.400+ mahasiswa dari UI, ITB, UGM, Unair, dan kampus lainnya.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
