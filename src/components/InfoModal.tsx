import React from 'react';

interface InfoModalProps {
  type: 'privacy' | 'help' | null;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-surface-container-lowest border border-outline-variant/80 rounded-2xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <span className="material-symbols-outlined">
              {type === 'privacy' ? 'security' : 'help_outline'}
            </span>
            <span className="text-base text-on-surface">
              {type === 'privacy' ? 'Komitmen Privasi & Keamanan' : 'Pusat Bantuan Belajar'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="py-4 text-xs sm:text-sm text-on-surface-variant space-y-3 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                <strong>Data Belajarmu Milikmu Sepenuhnya:</strong> Ngerti tidak menjual data mahasiswa atau membagikan riwayat latihanmu ke pihak ketiga.
              </p>
              <p>
                Tidak ada algoritma pemeringkat publik atau papan peringkat kompetitif yang mempermalukan siapa pun. Latihan dan refleksi yang kamu lakukan disimpan secara pribadi.
              </p>
              <div className="p-3 bg-surface-container-low rounded-xl text-xs text-outline">
                Sesuai standar perlindungan data pribadi dan kebebasan akademik mahasiswa Indonesia.
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>Ada materi yang bikin bingung?</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li>Gunakan <strong>Panduan Rumus Terbuka</strong> di tiap soal jika lupa formula.</li>
                <li>Aktifkan <strong>Petunjuk Langkah 1</strong> untuk dekomposisi data tanpa bocoran jawaban.</li>
                <li>Tiap kesalahan adalah peluang refleksi berharga (+10 XP bonus refleksi!).</li>
              </ul>
              <p className="pt-2 text-xs">
                Butuh diskusi atau request modul baru? Hubungi tim pendamping via surel: <code>halo@ngerti.id</code>
              </p>
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-medium hover:bg-primary/90"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
