import { Concept } from '../types';

export const statisticsConcepts: Concept[] = [
  {
    id: 'variabel-kategorikal-numerik',
    title: 'Variabel Kategorikal vs Numerik',
    summary:
      'Variabel kategorikal mengelompokkan data ke dalam label atau kategori kualitas (seperti jenis kelamin atau nama jurusan) dan tidak bisa dijumlahkan secara matematis. Sedangkan variabel numerik memuat angka kuantitatif yang merepresentasikan jumlah atau besaran terukur yang dapat dihitung rata-ratanya.',
    formula: 'Kategorikal = Label/Kategori | Numerik = Angka Kuantitatif',
    example:
      'Pilihan sistem operasi (macOS, Windows, Linux) adalah variabel kategorikal. Durasi baterai laptop dalam jam (misal 8,5 jam) adalah variabel numerik.',
    binusContext:
      'Penting di Bab 3 metodologi skripsi BINUS saat menentukan jenis pengujian statistik deskriptif dan operasionalisasi variabel penelitian.',
  },
  {
    id: 'variabel-diskrit-kontinu',
    title: 'Variabel Diskrit vs Kontinu',
    summary:
      'Data diskrit adalah data numerik yang diperoleh dari hasil mencacah atau menghitung dengan bilangan bulat utuh tanpa pecahan. Sebaliknya, data kontinu diperoleh dari hasil mengukur alat ukur dan dapat bernilai pecahan atau desimal tak hingga.',
    formula: 'Diskrit: Nilai bulat terpisah {0, 1, 2, ...} | Kontinu: Rentang bilangan riil [a, b]',
    example:
      'Jumlah mata kuliah yang diambil semester ini (misal: 6 mata kuliah) adalah diskrit. Waktu tempuh perjalanan ke kampus BINUS Anggrek (misal: 34,75 menit) adalah kontinu.',
    binusContext:
      'Sering diujikan pada mata kuliah Computational Statistics dan Business Statistics mahasiswa School of Computer Science & Business School BINUS.',
  },
  {
    id: 'skala-pengukuran',
    title: 'Skala Pengukuran (Nominal, Ordinal, Interval, Rasio)',
    summary:
      'Empat tingkat pengukuran data: Nominal sekadar label pembeda tanpa urutan; Ordinal memiliki tingkatan peringkat urutan; Interval memiliki jarak sama tanpa nol mutlak; Rasio memiliki jarak pasti dan nol mutlak (angka 0 berarti ketiadaan nilai).',
    formula: 'Hierarki: Nominal → Ordinal (Ranking) → Interval (Jarak Setara) → Rasio (Nol Mutlak)',
    example:
      'Nominal: Asal kampus BINUS (Kemanggisan, Alam Sutera, Bekasi). Ordinal: Skala kepuasan Likert 1-5 bintang. Interval: Suhu ruangan lab (22°C). Rasio: Pendapatan bulanan startup (Rp 0 = tidak ada uang).',
    binusContext:
      'Fondasi wajib di Bab 3 skripsi kuantitatif BINUS untuk menentukan apakah uji statistik menggunakan parametrik atau non-parametrik.',
  },
  {
    id: 'mean',
    title: 'Mean (Rata-rata Hitung)',
    summary:
      'Mean adalah titik keseimbangan nilai numerik yang dihitung dengan menjumlahkan seluruh data lalu membaginya dengan total banyaknya observasi (n). Mean sangat sensitif terhadap nilai pencilan ekstrem (outlier).',
    formula: 'x̄ = (∑ xᵢ) / n',
    example:
      'Jika nilai UTS dari 5 mahasiswa adalah 70, 75, 80, 85, dan 90, maka mean = (400) / 5 = 80.',
    binusContext:
      'Digunakan di laporan analisis data bisnis dan visualisasi ringkasan demografi responden skripsi mahasiswa BINUS.',
  },
  {
    id: 'median',
    title: 'Median (Nilai Tengah)',
    summary:
      'Median adalah nilai yang tepat berada di posisi tengah setelah data diurutkan dari terkecil ke terbesar. Keunggulan utama median adalah tahan terhadap pencilan ekstrem sehingga sangat cocok mendeskripsikan data yang menceng.',
    formula: 'Posisi Median = (n + 1) / 2 untuk data tunggal terurut',
    example:
      'Gaji tim developer: 5jt, 6jt, 7jt, 8jt, 90jt (CEO). Meannya 23,2jt (terdistorsi outlier CEO), namun mediannya 7jt (jauh lebih realistis mewakili tim).',
    binusContext:
      'Metode wajib di Business Statistics BINUS ketika menganalisis daya beli konsumen, lama tunggu aplikasi, atau harga properti.',
  },
  {
    id: 'modus',
    title: 'Modus (Nilai Paling Sering Muncul)',
    summary:
      'Modus adalah kategori atau nilai numerik dengan frekuensi kemunculan tertinggi dalam kumpulan data. Modus adalah satu-satunya ukuran pemusatan yang dapat diterapkan pada data nominal kategorik.',
    formula: 'Modus = Nilai dengan frekuensi f tertinggi',
    example:
      'Dari 100 mahasiswa BINUS yang memesan makan siang, 62 memilih Nasi Ayam Geprek. Modusnya adalah menu Nasi Ayam Geprek.',
    binusContext:
      'Sering digunakan mahasiswa Information Systems dan Marketing dalam evaluasi preferensi fitur aplikasi atau user behavior.',
  },
  {
    id: 'varians-sampel',
    title: 'Varians Sampel (s²) & Derajat Kebebasan (n - 1)',
    summary:
      'Varians mengukur rata-rata kuadrat selisih tiap titik data dari nilai mean. Pembagian dengan derajat kebebasan (n - 1) disebut koreksi Bessel untuk mencegah perkiraan yang terlalu rendah (bias) terhadap populasi sebenarnya.',
    formula: 's² = ∑ (xᵢ - x̄)² / (n - 1)',
    example:
      'Jika deviasi kuadrat terkumpul adalah 52 dari 5 sampel, varians sampel = 52 / (5 - 1) = 13 unit².',
    binusContext:
      'Kunci perhitungan manual dan pembacaan output SPSS / R dalam praktikum statistika laboratorium BINUS.',
  },
  {
    id: 'standar-deviasi',
    title: 'Standar Deviasi (Simpangan Baku)',
    summary:
      'Standar deviasi adalah akar kuadrat dari varians, yang mengembalikan satuan dispersi kembali ke satuan awal data penelitian. Semakin kecil standar deviasi, semakin homogen dan rapat data di sekitar nilai rata-rata.',
    formula: 's = √(s²) = √[ ∑ (xᵢ - x̄)² / (n - 1) ]',
    example:
      'Bila varians durasi belajar adalah 6,25 jam kuadrat, maka standar deviasinya s = √6,25 = 2,5 jam.',
    binusContext:
      'Wajib dilaporkan bersama nilai mean pada tabel statistik deskriptif Bab 4 skripsi BINUS University.',
  },
  {
    id: 'z-score-distribusi-normal',
    title: 'Z-Score & Distribusi Normal Standar',
    summary:
      'Z-score menunjukkan berapa standar deviasi sebuah nilai berada di atas atau di bawah mean populasi. Distribusi normal standar berbentuk kurva lonceng simetris sempurna dengan mean = 0 dan standar deviasi = 1.',
    formula: 'z = (x - μ) / σ  atau  z = (x - x̄) / s',
    example:
      'Nilai TOEFL mahasiswa x = 550, dengan rata-rata kampus μ = 500 dan simpangan baku σ = 25. Maka z = (550 - 500) / 25 = +2,0 (berada 2 standar deviasi di atas rata-rata).',
    binusContext:
      'Pondasi penting mata kuliah Computational Statistics dan machine learning (feature scaling/standardization) di School of Computer Science BINUS.',
  },
  {
    id: 'hipotesis-nol-alternatif',
    title: 'Hipotesis Nol (H0) vs Hipotesis Alternatif (H1)',
    summary:
      'Hipotesis Nol (H0) mengasumsikan tidak ada pengaruh, perbedaan, atau perubahan yang signifikan secara statistik. Hipotesis Alternatif (H1 atau Ha) adalah dugaan peneliti yang ingin dibuktikan keberadaannya melalui data empiris.',
    formula: 'H0: μ₁ = μ₂ (tidak ada perbedaan) vs H1: μ₁ ≠ μ₂ (ada perbedaan bermakna)',
    example:
      'H0: Fitur UI baru tidak meningkatkan durasi pemakaian aplikasi BINUSMAYA. H1: Fitur UI baru meningkatkan durasi pemakaian aplikasi secara signifikan.',
    binusContext:
      'Rancangan hipotesis penelitian yang wajib dirumuskan pada Bab 2 dan Bab 3 skripsi seluruh fakultas di BINUS.',
  },
  {
    id: 'p-value-signifikansi',
    title: 'P-Value & Tingkat Signifikansi (Alpha = 0.05)',
    summary:
      'P-value adalah peluang mendapatkan hasil seekstrem atau lebih ekstrem dari data yang diobservasi jika H0 dianggap benar. Jika p-value < 0,05 (alpha umum), maka kita menolak H0 dan menyimpulkan ada bukti signifikan secara statistik.',
    formula: 'Tolak H0 jika p-value < α (umumnya α = 0,05 atau tingkat kepercayaan 95%)',
    example:
      'Uji efektivitas metode belajar menghasilkan nilai Sig. (2-tailed) = 0,012. Karena 0,012 < 0,05, maka tolak H0: metode baru terbukti efektif.',
    binusContext:
      'Standar absolut kelulusan uji signifikansi Bab 4 hasil penelitian skripsi dan pengolahan SPSS/SmartPLS mahasiswa BINUS.',
  },
  {
    id: 'uji-t-test',
    title: 'Uji-t (t-test) Satu Sampel & Dua Sampel',
    summary:
      'Uji parametrik untuk menguji perbedaan rata-rata ketika standar deviasi populasi tidak diketahui. One-Sample t-test membandingkan mean sampel dengan nilai acuan; Independent Two-Sample membandingkan dua kelompok berbeda; Paired t-test membandingkan kondisi sebelum vs sesudah pada subjek yang sama.',
    formula: 't = (x̄ - μ₀) / (s / √n)  [One-Sample t-Test]',
    example:
      'Membandingkan rata-rata nilai IPK mahasiswa yang magang di program 3+1 Enrichment BINUS vs sebelum magang (Paired t-test).',
    binusContext:
      'Sering digunakan untuk evaluasi dampak program intervensi bisnis dan riset eksperimen komputasi BINUS.',
  },
  {
    id: 'korelasi-pearson',
    title: 'Korelasi Pearson (r)',
    summary:
      'Koefisien korelasi Pearson mengukur kekuatan dan arah hubungan linier antara dua variabel numerik kontinu. Nilai r berkisar antara -1 (korelasi negatif sempurna) hingga +1 (korelasi positif sempurna), dengan 0 berarti tidak ada hubungan linier.',
    formula: 'r = [ n(∑xy) - (∑x)(∑y) ] / √[ (n∑x² - (∑x)²)(n∑y² - (∑y)²) ]',
    example:
      'Hubungan antara jumlah jam belajar statistika per minggu dengan nilai ujian akhir memiliki r = +0,82 (hubungan positif yang kuat).',
    binusContext:
      'Uji hubungan paling umum pada Bab 4 skripsi BINUS sebelum melangkah ke pemodelan regresi.',
  },
  {
    id: 'regresi-linier-r2',
    title: 'Regresi Linier Sederhana & Koefisien Determinasi (R²)',
    summary:
      'Regresi linier memodelkan hubungan matematis antara satu variabel independen (X) untuk memprediksi variabel dependen (Y). Koefisien determinasi R² menunjukkan proporsi variasi Y yang dapat dijelaskan oleh model variabel X.',
    formula: 'Model: Ŷ = a + bX | R² = SSR / SST (rentang nilai 0 sampai 1 / 0% - 100%)',
    example:
      'Persamaan kepuasan = 20 + 0,75(kecepatan server). Nilai R² = 0,64 berarti 64% kepuasan pengguna dijelaskan oleh kecepatan server.',
    binusContext:
      'Materi pokok Business Statistics, FinTech, dan analisis skripsi kuantitatif BINUSIAN.',
  },
  {
    id: 'anova-nilai-f',
    title: 'ANOVA (Analysis of Variance) & Nilai F',
    summary:
      'Uji ANOVA digunakan untuk membandingkan rata-rata dari tiga atau lebih kelompok sampel secara simultan tanpa meningkatkan risiko error tipe I. Nilai F membandingkan variansi antar kelompok (between-groups) terhadap variansi di dalam kelompok (within-groups).',
    formula: 'F = MS_between / MS_within = (SS_between / df_between) / (SS_within / df_within)',
    example:
      'Membandingkan kepuasan pengguna aplikasi dari 3 kelompok kampus BINUS: Kemanggisan, Alam Sutera, dan Senayan.',
    binusContext:
      'Digunakan dalam praktikum riset komparatif, analisis A/B testing multi-varian, dan tesis program magister/sarjana BINUS.',
  },
  {
    id: 'uji-chi-square',
    title: 'Uji Chi-Square (Uji Independensi)',
    summary:
      'Uji non-parametrik yang digunakan untuk mengetahui apakah ada hubungan atau asosiasi yang signifikan antara dua variabel kategorik melalui tabel kontingensi baris x kolom (r x c). Uji ini membandingkan frekuensi observasi (O) dengan frekuensi ekspektasi (E).',
    formula: 'χ² = ∑ [ (O - E)² / E ]  dengan df = (baris - 1)(kolom - 1)',
    example:
      'Meneliti apakah ada hubungan antara program studi BINUS (CS vs IS vs Desain) dengan preferensi perangkat kerja (laptop Windows vs Mac).',
    binusContext:
      'Metode andalan analisis data kuesioner berskala nominal/kategorikal di Bab 4 skripsi mahasiswa BINUS.',
  },
];

export const getConceptById = (id: string): Concept | undefined => {
  return statisticsConcepts.find((c) => c.id === id);
};

export const getAllConcepts = (): Concept[] => {
  return statisticsConcepts;
};
