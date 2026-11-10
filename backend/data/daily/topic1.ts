import type { DailyQuestion } from './types';

// Latihan Harian, Bab 1: Defining and Collecting Data.
// The 30 Latihan Soal and explanations from the course material ("Materi Website").
// `answer` is the index (0–3) of the correct option: A = 0, B = 1, C = 2, D = 3.

const T = 'mendefinisikan-mengumpulkan-data';

export const questions: DailyQuestion[] = [
  {
    id: 'H1-01',
    topicId: T,
    prompt: 'Apa yang dimaksud dengan statistika?',
    options: [
      'Proses mengumpulkan, mengorganisasi, menganalisis, dan menginterpretasikan data',
      'Proses menghitung persamaan matematika saja',
      'Studi mengenai angka tanpa menginterpretasikan maknanya',
      'Proses memprediksi kejadian di masa depan tanpa menggunakan data',
    ],
    answer: 0,
    explanation: 'Statistika mencakup proses pengumpulan, pengorganisasian, analisis, dan interpretasi data.',
  },
  {
    id: 'H1-02',
    topicId: T,
    prompt: 'Dalam statistika, apa yang dimaksud dengan **population** (populasi)?',
    options: [
      'Sekelompok kecil individu yang dipilih dari kelompok yang lebih besar',
      'Seluruh individu atau objek yang menjadi perhatian dalam penelitian',
      'Data yang dikumpulkan dari suatu eksperimen',
      'Nilai rata-rata dari suatu sampel',
    ],
    answer: 1,
    explanation: 'Population merupakan seluruh objek atau individu yang menjadi perhatian penelitian.',
  },
  {
    id: 'H1-03',
    topicId: T,
    prompt:
      'Seorang peneliti memilih 50 mahasiswa dari sebuah universitas yang memiliki 5.000 mahasiswa untuk meneliti kebiasaan belajar. Apa yang dimaksud dengan **sample** (sampel)?',
    options: ['Seluruh mahasiswa universitas', 'Sebanyak 5.000 mahasiswa', 'Sebanyak 50 mahasiswa yang dipilih', 'Kebiasaan belajar seluruh mahasiswa'],
    answer: 2,
    explanation: 'Sample adalah sebagian populasi yang dipilih untuk diteliti, yaitu 50 mahasiswa tersebut.',
  },
  {
    id: 'H1-04',
    topicId: T,
    prompt: 'Manakah berikut ini yang merupakan contoh data **kuantitatif diskrit** (quantitative discrete)?',
    options: ['Suhu suatu ruangan', 'Tinggi badan seorang mahasiswa', 'Jumlah buku yang dimiliki seorang mahasiswa', 'Durasi sebuah panggilan telepon'],
    answer: 2,
    explanation: 'Jumlah buku merupakan data diskrit karena dapat dihitung dalam bilangan bulat.',
  },
  {
    id: 'H1-05',
    topicId: T,
    prompt: 'Manakah berikut ini yang merupakan contoh data **kualitatif** (qualitative)?',
    options: ['Pendapatan bulanan', 'Jumlah karyawan', 'Usia seseorang', 'Warna sebuah mobil'],
    answer: 3,
    explanation: 'Warna mobil merupakan data kategorikal, bukan numerik.',
  },
  {
    id: 'H1-06',
    topicId: T,
    prompt: 'Seorang peneliti memilih 30 orang pertama yang memasuki pusat perbelanjaan untuk mengikuti survei. Metode sampling apa yang digunakan?',
    options: ['Simple random sampling', 'Stratified sampling', 'Convenience sampling', 'Systematic sampling'],
    answer: 2,
    explanation: 'Convenience sampling memilih responden berdasarkan kemudahan akses.',
  },
  {
    id: 'H1-07',
    topicId: T,
    prompt: 'Seorang peneliti memilih setiap pelanggan ke-10 dari sebuah daftar pelanggan. Metode sampling apa yang digunakan?',
    options: ['Cluster sampling', 'Systematic sampling', 'Convenience sampling', 'Judgment sampling'],
    answer: 1,
    explanation: 'Systematic sampling dilakukan dengan memilih setiap anggota ke-n dari daftar.',
  },
  {
    id: 'H1-08',
    topicId: T,
    prompt: 'Skala pengukuran apa yang digunakan untuk mengelompokkan golongan darah (A, B, AB, dan O)?',
    options: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    answer: 0,
    explanation: 'Golongan darah merupakan kategori tanpa urutan tertentu, jadi berskala nominal.',
  },
  {
    id: 'H1-09',
    topicId: T,
    prompt: 'Manakah berikut ini yang merupakan contoh data **ordinal**?',
    options: ['Nomor identitas mahasiswa', 'Suhu dalam derajat Celsius', 'Tingkat kepuasan: rendah, sedang, dan tinggi', 'Jarak perjalanan dalam kilometer'],
    answer: 2,
    explanation: 'Data ordinal memiliki kategori yang dapat diurutkan, seperti rendah, sedang, tinggi.',
  },
  {
    id: 'H1-10',
    topicId: T,
    prompt: 'Apa tujuan utama dari **frequency table** (tabel frekuensi)?',
    options: [
      'Memprediksi hasil pengamatan di masa depan',
      'Mengorganisasi data dengan menunjukkan seberapa sering suatu nilai atau kategori muncul',
      'Menghitung probabilitas setiap kejadian yang mungkin terjadi',
      'Menentukan penyebab suatu fenomena',
    ],
    answer: 1,
    explanation: 'Tabel frekuensi menunjukkan seberapa sering nilai atau kategori muncul.',
  },
  {
    id: 'H1-11',
    topicId: T,
    prompt:
      'Seorang peneliti ingin mengetahui rata-rata waktu yang dihabiskan mahasiswa untuk belajar setiap hari. Peneliti memilih 100 mahasiswa secara acak dari universitas yang memiliki 2.000 mahasiswa. Apa yang dimaksud dengan **parameter** dalam penelitian tersebut?',
    options: [
      'Rata-rata waktu belajar dari 100 mahasiswa yang dipilih',
      'Rata-rata waktu belajar dari seluruh 2.000 mahasiswa',
      'Jumlah mahasiswa yang dipilih',
      'Waktu belajar dari satu mahasiswa yang dipilih secara acak',
    ],
    answer: 1,
    explanation: 'Parameter menggambarkan karakteristik seluruh populasi, yaitu rata-rata dari 2.000 mahasiswa.',
  },
  {
    id: 'H1-12',
    topicId: T,
    prompt:
      'Sebuah universitas membagi mahasiswanya menjadi tiga kelompok berdasarkan tahun akademik (tahun pertama, kedua, dan ketiga). Peneliti kemudian memilih mahasiswa secara acak dari setiap kelompok. Metode sampling apa yang digunakan?',
    options: ['Cluster sampling', 'Convenience sampling', 'Stratified sampling', 'Systematic sampling'],
    answer: 2,
    explanation: 'Stratified sampling membagi populasi menjadi beberapa strata dan mengambil sampel dari setiap strata.',
  },
  {
    id: 'H1-13',
    topicId: T,
    prompt:
      'Seorang peneliti memilih 5 kelas secara acak dari sebuah sekolah, kemudian melakukan survei kepada seluruh siswa di kelima kelas tersebut. Metode sampling apa yang digunakan?',
    options: ['Simple random sampling', 'Cluster sampling', 'Stratified sampling', 'Convenience sampling'],
    answer: 1,
    explanation: 'Cluster sampling memilih kelompok tertentu secara acak dan meneliti seluruh anggotanya.',
  },
  {
    id: 'H1-14',
    topicId: T,
    prompt:
      'Sebuah perusahaan ingin meneliti tingkat kepuasan pelanggan. Perusahaan hanya mengirimkan survei kepada pelanggan yang baru saja membeli produk dengan harga mahal. Apa masalah utama dari metode pengambilan sampel tersebut?',
    options: [
      'Sampel mungkin tidak mewakili seluruh populasi pelanggan',
      'Sampel dijamin dipilih secara acak',
      'Sampel secara otomatis menghilangkan sampling bias',
      'Sampel terlalu besar untuk dianalisis',
    ],
    answer: 0,
    explanation: 'Pemilihan pelanggan tertentu saja dapat menyebabkan sampel tidak representatif.',
  },
  {
    id: 'H1-15',
    topicId: T,
    prompt: 'Sebuah survei meminta responden menilai tingkat kepuasan menggunakan skala berikut. Skala pengukuran apa yang paling tepat digunakan?',
    data: '1 = Sangat tidak puas\n2 = Tidak puas\n3 = Netral\n4 = Puas\n5 = Sangat puas',
    options: ['Nominal', 'Ordinal', 'Interval', 'Ratio'],
    answer: 1,
    explanation: 'Tingkat kepuasan memiliki urutan, tetapi jarak antarkategorinya belum tentu sama.',
  },
  {
    id: 'H1-16',
    topicId: T,
    prompt:
      'Seorang peneliti mengumpulkan data jumlah jam belajar mahasiswa per minggu: 5, 8, 10, 10, 12. Berapa **relative frequency** (frekuensi relatif) mahasiswa yang belajar selama 10 jam per minggu?',
    options: ['0.20', '0.30', '0.40', '0.50'],
    answer: 2,
    explanation: 'Nilai 10 muncul 2 kali dari 5 data. Relative frequency = 2/5 = 0.40.',
  },
  {
    id: 'H1-17',
    topicId: T,
    prompt: 'Seorang peneliti mengumpulkan data transportasi yang paling disukai mahasiswa. Berapa persentase mahasiswa yang memilih kereta?',
    data: 'Transportasi    Frekuensi\nBus             20\nKereta          30\nSepeda motor    25\nMobil           25',
    options: ['20%', '25%', '30%', '35%'],
    answer: 2,
    explanation: 'Total = 20 + 30 + 25 + 25 = 100. Persentase = 30/100 × 100% = 30%.',
  },
  {
    id: 'H1-18',
    topicId: T,
    prompt:
      'Sebuah perusahaan farmasi melakukan eksperimen untuk menguji obat baru. Satu kelompok menerima obat tersebut, sedangkan kelompok lainnya menerima **placebo** (obat tanpa kandungan aktif). Apa tujuan utama penggunaan placebo?',
    options: [
      'Menambah jumlah peserta eksperimen',
      'Menghilangkan kebutuhan akan random assignment',
      'Mengendalikan pengaruh ekspektasi atau harapan peserta terhadap hasil eksperimen',
      'Menjamin bahwa obat tersebut akan efektif',
    ],
    answer: 2,
    explanation: 'Placebo membantu mengendalikan pengaruh ekspektasi peserta terhadap hasil.',
  },
  {
    id: 'H1-19',
    topicId: T,
    prompt: 'Manakah berikut ini yang merupakan contoh skala pengukuran **interval**?',
    options: ['Berat badan dalam kilogram', 'Suhu dalam derajat Celsius', 'Jumlah mahasiswa di dalam kelas', 'Jarak dalam meter'],
    answer: 1,
    explanation: 'Celsius memiliki jarak antarnilai yang sama, tetapi tidak memiliki nilai nol absolut (true zero).',
  },
  {
    id: 'H1-20',
    topicId: T,
    prompt:
      'Dua peneliti melakukan penelitian serupa menggunakan sampel berbeda yang dipilih secara acak dari populasi yang sama. Hasil penelitian mereka sedikit berbeda. Apa penjelasan yang paling tepat?',
    options: [
      'Salah satu peneliti pasti melakukan kesalahan',
      'Populasi langsung berubah',
      'Variasi akibat random sampling dapat menghasilkan hasil yang berbeda',
      'Statistika tidak dapat menghasilkan hasil yang konsisten',
    ],
    answer: 2,
    explanation: 'Sampel acak yang berbeda dapat menghasilkan statistik yang berbeda (sampling error).',
  },
  {
    id: 'H1-21',
    topicId: T,
    prompt:
      'Seorang peneliti ingin mengetahui rata-rata waktu pemulihan pasien yang menerima pengobatan baru. Peneliti memilih 80 pasien secara acak dari populasi 2.000 pasien. Rata-rata waktu pemulihan pasien yang dipilih adalah 12 hari. Pernyataan manakah yang benar?',
    options: [
      'Populasi adalah 80 pasien dan parameter adalah 12 hari',
      'Sampel adalah 2.000 pasien dan statistik adalah 80 pasien',
      'Sampel adalah 80 pasien dan statistik adalah 12 hari',
      'Populasi adalah 12 hari dan parameter adalah 80 pasien',
    ],
    answer: 2,
    explanation: 'Sampel terdiri dari 80 pasien dan statistiknya adalah rata-rata 12 hari.',
  },
  {
    id: 'H1-22',
    topicId: T,
    prompt:
      'Seorang peneliti ingin memperkirakan persentase mahasiswa yang menggunakan transportasi umum. Universitas memiliki 10.000 mahasiswa yang terbagi ke dalam empat fakultas. Peneliti memilih 50 mahasiswa secara acak dari setiap fakultas. Berapa total ukuran sampel dan metode sampling yang digunakan?',
    options: ['50 mahasiswa, cluster sampling', '200 mahasiswa, stratified sampling', '200 mahasiswa, systematic sampling', '400 mahasiswa, simple random sampling'],
    answer: 1,
    explanation: 'Total sampel = 4 × 50 = 200 mahasiswa, menggunakan stratified sampling (setiap fakultas adalah satu strata).',
  },
  {
    id: 'H1-23',
    topicId: T,
    prompt: 'Sebuah penelitian mencatat jumlah korban meninggal akibat gempa bumi selama lima tahun. Berapa proporsi total korban meninggal yang terjadi pada tahun ke-3?',
    data: 'Tahun   Jumlah Korban Meninggal\n1       100\n2       200\n3       300\n4       200\n5       200',
    options: ['0.20', '0.25', '0.30', '0.40'],
    answer: 2,
    explanation: 'Total = 100 + 200 + 300 + 200 + 200 = 1000. Proporsi tahun ke-3 = 300/1000 = 0.30.',
  },
  {
    id: 'H1-24',
    topicId: T,
    prompt:
      'Seorang peneliti membuat distribusi frekuensi jumlah jam belajar mingguan 100 mahasiswa. Berapa **cumulative relative frequency** (frekuensi relatif kumulatif) hingga kelas 10–15 jam?',
    data: 'Jam Belajar   Frekuensi\n0–5           20\n5–10          30\n10–15         35\n15–20         15',
    options: ['0.20', '0.30', '0.50', '0.85'],
    answer: 3,
    explanation: 'Frekuensi relatif kumulatif = (20 + 30 + 35)/100 = 0.85.',
  },
  {
    id: 'H1-25',
    topicId: T,
    prompt:
      'Seorang peneliti mencatat informasi karyawan: Employee ID (nomor identitas), Monthly Salary (gaji bulanan), Job Satisfaction Level (rendah, sedang, tinggi), dan Years of Working Experience (lama pengalaman kerja dalam tahun). Kombinasi skala pengukuran manakah yang benar?',
    options: [
      'ID: Nominal; Salary: Ratio; Satisfaction: Ordinal; Experience: Ratio',
      'ID: Ordinal; Salary: Interval; Satisfaction: Nominal; Experience: Interval',
      'ID: Ratio; Salary: Nominal; Satisfaction: Interval; Experience: Ordinal',
      'ID: Interval; Salary: Ratio; Satisfaction: Ratio; Experience: Nominal',
    ],
    answer: 0,
    explanation: 'ID hanya label (nominal), gaji dan pengalaman punya nol mutlak (ratio), sedangkan kepuasan berurutan (ordinal).',
  },
  {
    id: 'H1-26',
    topicId: T,
    prompt:
      'Sebuah perusahaan ingin menguji apakah aplikasi pembelajaran baru dapat meningkatkan nilai ujian. Kelompok A menggunakan aplikasi, sedangkan Kelompok B tidak. Namun, Kelompok A juga mendapatkan bimbingan belajar tambahan, sedangkan Kelompok B tidak. Apa masalah utama dari desain eksperimen tersebut?',
    options: [
      'Ukuran sampel pasti terlalu kecil',
      'Bimbingan belajar tambahan merupakan confounding variable (variabel perancu)',
      'Variabel respons tidak dapat diukur',
      'Eksperimen menggunakan dua kelompok yang berbeda',
    ],
    answer: 1,
    explanation: 'Bimbingan tambahan merupakan variabel perancu yang dapat memengaruhi hasil penelitian.',
  },
  {
    id: 'H1-27',
    topicId: T,
    prompt:
      'Sebuah perusahaan farmasi melakukan eksperimen terhadap 200 pasien. Setengah pasien menerima obat baru, setengah lainnya menerima placebo. Baik pasien maupun peneliti yang mengevaluasi hasil tidak mengetahui pasien mana yang menerima obat sebenarnya. Jenis desain eksperimen apa yang digunakan?',
    options: ['Observational study', 'Convenience sampling', 'Double-blind experiment', 'Systematic sampling'],
    answer: 2,
    explanation: 'Double-blind experiment membuat peserta dan peneliti sama-sama tidak mengetahui pembagian perlakuan.',
  },
  {
    id: 'H1-28',
    topicId: T,
    prompt:
      'Sebuah perusahaan melakukan survei dengan pertanyaan: "Apakah Anda tidak setuju bahwa produk baru kami yang sangat bagus lebih baik daripada produk lain yang tersedia di pasar?" Apa masalah paling signifikan dari pertanyaan tersebut?',
    options: [
      'Pertanyaan tersebut merupakan pertanyaan terbuka',
      'Pertanyaan tersebut mengandung bahasa yang menggiring dan bias (leading question)',
      'Pertanyaan tersebut menggunakan skala pengukuran ratio',
      'Pertanyaan tersebut menyediakan terlalu banyak pilihan jawaban',
    ],
    answer: 1,
    explanation: 'Pertanyaan menggunakan bahasa yang menggiring responden ke jawaban tertentu ("produk baru kami yang sangat bagus").',
  },
  {
    id: 'H1-29',
    topicId: T,
    prompt:
      'Sebuah organisasi ingin mengetahui apakah program olahraga baru dapat meningkatkan produktivitas karyawan. Karyawan dibagi secara acak menjadi dua kelompok, tetapi karyawan yang mengikuti program olahraga juga diberi insentif finansial tambahan. Produktivitas kelompok olahraga meningkat. Kesimpulan manakah yang paling tepat?',
    options: [
      'Program olahraga pasti menyebabkan peningkatan produktivitas',
      'Insentif finansial tidak memiliki pengaruh terhadap produktivitas',
      'Pengaruh olahraga tidak dapat dipisahkan dari pengaruh insentif finansial',
      'Random assignment menjamin bahwa hasil penelitian bebas dari seluruh variabel perancu',
    ],
    answer: 2,
    explanation: 'Pengaruh program olahraga tidak dapat dipisahkan dari pengaruh insentif finansial yang diberikan bersamaan.',
  },
  {
    id: 'H1-30',
    topicId: T,
    prompt:
      'Sebuah tim peneliti medis menguji obat baru pada anak-anak. Orang tua diberi tahu bahwa obat tersebut sedang diuji, tetapi tidak diberi tahu bahwa beberapa anak akan menerima placebo. Prinsip etika penelitian manakah yang paling langsung dilanggar?',
    options: ['Random sampling', 'Informed consent', 'Blinding', 'Data classification'],
    answer: 1,
    explanation: 'Informed consent mengharuskan peserta atau wali mendapatkan informasi yang memadai sebelum menyetujui penelitian.',
  },
];
