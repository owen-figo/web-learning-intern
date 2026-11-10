import { TheoryContent } from '../types';

// Reading material for chapter 9 (Fundamentals of Hypothesis Testing: One-Sample Tests) and
// chapter 10 (Two-Sample Tests), from the course document "Materi Website".
// Every number in the worked examples is recomputed in the visuals (components/HypothesisVisuals.tsx);
// if you change one here, change it there too.

export const hypothesisTestingContent: TheoryContent = {
  topicId: 'uji-hipotesis-satu-sampel',
  topicTitle: 'Fundamentals of Hypothesis Testing: One-Sample Tests',
  completionXp: 15,
  sections: [
    {
      id: 'ht-1-hipotesis',
      heading: 'The Null and Alternative Hypotheses',
      group: 'Hypothesis Testing Concepts',
      body: '**Hypothesis testing** adalah metode statistik inferensial untuk **menguji suatu pernyataan atau dugaan mengenai population parameter** berdasarkan informasi dari **sample**. Pada **one-sample test**, hasil dari satu sampel dibandingkan dengan **nilai tertentu** yang telah ditetapkan atau diasumsikan untuk populasi (misalnya target pabrik 368 gram).\n\n**Null hypothesis (H₀)** adalah pernyataan awal bahwa parameter populasi **sama dengan nilai tertentu atau tidak berubah**. H₀ menggambarkan **status quo** dan selalu memuat tanda sama dengan (=, ≤, atau ≥).\n\n**Alternative hypothesis (H₁)** adalah kebalikan dari H₀: ada **perbedaan, peningkatan, atau penurunan**. H₁ biasanya adalah hal yang ingin dibuktikan peneliti, dan baru diterima jika data memberi cukup bukti untuk **menolak H₀**.\n\nAnalogi pengadilan: terdakwa dianggap tidak bersalah (H₀) sampai bukti cukup kuat. Jika bukti kurang, keputusannya "**tidak menolak H₀**", bukan "H₀ terbukti benar".',
      points: [
        'Hypothesis testing menguji klaim tentang parameter populasi (μ atau π), bukan tentang statistik sampel.',
        'H₀ adalah status quo dan selalu memuat tanda =, ≤, atau ≥.',
        'H₁ adalah lawan H₀ dan memuat tanda ≠, <, atau >.',
        'Keputusan hanya dua: tolak H₀, atau tidak tolak H₀. Kita tidak pernah "membuktikan" H₀ benar.',
      ],
      formula: 'H₀: μ = μ₀   |   H₁: μ ≠ μ₀',
      formulaSymbols: [
        { symbol: 'H₀', meaning: 'Null hypothesis (status quo)' },
        { symbol: 'H₁', meaning: 'Alternative hypothesis (yang ingin dibuktikan)' },
        { symbol: 'μ', meaning: 'Mean populasi yang sebenarnya (tidak diketahui)' },
        { symbol: 'μ₀', meaning: 'Nilai yang dihipotesiskan, misalnya target 368 g' },
      ],
      stepsLabel: 'Cara menyusun hipotesis',
      steps: [
        {
          step: 1,
          title: 'Tentukan Parameter yang Diuji',
          instruction: 'Apakah klaimnya tentang rata-rata (μ) atau proporsi (π)?',
          substituted: 'Pabrik mengklaim rata-rata berat beras per kemasan 368 g → parameter μ.',
        },
        {
          step: 2,
          title: 'Tulis H₀ sebagai Status Quo',
          instruction: 'H₀ menyatakan parameter sama dengan nilai klaim.',
          substituted: 'H₀: μ = 368 (mesin bekerja sesuai target).',
        },
        {
          step: 3,
          title: 'Tulis H₁ sesuai Pertanyaan Penelitian',
          instruction: 'Gunakan ≠ jika hanya ingin tahu "berbeda atau tidak", < atau > jika arah perubahannya sudah ditentukan.',
          substituted: 'Manajer ingin tahu apakah beratnya berbeda (lebih atau kurang) → H₁: μ ≠ 368.',
        },
      ],
      visualType: 'hypothesis-setup',
    },
    {
      id: 'ht-2-type-errors',
      heading: 'Type I and Type II Errors',
      group: 'Hypothesis Testing Concepts',
      body: 'Karena keputusan diambil dari sampel, selalu ada kemungkinan **keputusan keliru**. Ada dua jenis kesalahan:\n\n• **Type I error (α)**: **menolak H₀ padahal H₀ sebenarnya benar**. Disebut juga **false alarm**. Contoh: mesin sebenarnya sudah tepat 368 g, tetapi kita menyimpulkan mesin bermasalah lalu menghentikan produksi.\n• **Type II error (β)**: **tidak menolak H₀ padahal H₀ sebenarnya salah**. Disebut juga **missed opportunity**. Contoh: mesin sebenarnya sudah melenceng, tetapi kita menganggapnya baik-baik saja.\n\nProbabilitas yang berkaitan:\n• **Level of significance (α)**: probabilitas Type I error, ditentukan peneliti sebelum menguji (biasanya 0.01, 0.05, atau 0.10).\n• **β risk**: probabilitas Type II error.\n• **Confidence coefficient (1 − α)**: probabilitas tidak menolak H₀ ketika H₀ benar.\n• **Power of a statistical test (1 − β)**: probabilitas menolak H₀ ketika H₀ salah, yaitu kemampuan uji "menangkap" perbedaan yang memang ada.\n\nα dan β saling tarik-menarik: memperkecil α (lebih ketat) membuat β membesar, jika ukuran sampel tetap. Cara menurunkan keduanya sekaligus adalah **memperbesar n**.',
      points: [
        'Type I error = menolak H₀ yang benar (false alarm); peluangnya α.',
        'Type II error = tidak menolak H₀ yang salah (missed opportunity); peluangnya β.',
        'Confidence coefficient = 1 − α; power = 1 − β.',
        'Dengan n tetap, α yang lebih kecil membuat β lebih besar. Memperbesar n menurunkan β tanpa menaikkan α.',
      ],
      formula: 'α = P(menolak H₀ | H₀ benar)   |   β = P(tidak menolak H₀ | H₀ salah)   |   Power = 1 − β',
      formulaSymbols: [
        { symbol: 'α', meaning: 'Level of significance = peluang Type I error' },
        { symbol: 'β', meaning: 'β risk = peluang Type II error' },
        { symbol: '1 − α', meaning: 'Confidence coefficient' },
        { symbol: '1 − β', meaning: 'Power of the test' },
      ],
      summaryTable: {
        columns: ['Keputusan', 'H₀ benar', 'H₀ salah'],
        rows: [
          { ukuran: 'Tidak tolak H₀', sampel: 'Benar (peluang 1 − α)', populasi: 'Type II error (peluang β)' },
          { ukuran: 'Tolak H₀', sampel: 'Type I error (peluang α)', populasi: 'Benar (power, peluang 1 − β)' },
        ],
      },
      visualType: 'type-errors',
    },
    {
      id: 'ht-3-critical-value',
      heading: 'Test Statistic, Critical Value, and Rejection Region',
      group: 'Hypothesis Testing Concepts',
      body: 'Untuk memutuskan, hasil sampel diubah menjadi **test statistic** (misalnya Z_STAT atau t_STAT), yaitu jarak antara statistik sampel dan nilai hipotesis, diukur dalam satuan standard error.\n\nSampling distribution dari test statistic dibagi menjadi dua daerah:\n• **Rejection region** (daerah penolakan): nilai-nilai yang sangat jarang muncul jika H₀ benar. Luas totalnya sama dengan **α**.\n• **Nonrejection region** (daerah penerimaan): nilai-nilai yang wajar jika H₀ benar.\n\n**Critical value** adalah **nilai batas** yang memisahkan kedua daerah tersebut. Jika test statistic jatuh di rejection region, **H₀ ditolak**; jika jatuh di nonrejection region, **H₀ tidak ditolak**.\n\nPada uji dua sisi (H₁: μ ≠ μ₀), α dibagi dua ke kedua ekor, sehingga critical value-nya ±Z_α/2. Untuk α = 0.05 → ±1.96.',
      points: [
        'Test statistic mengukur seberapa jauh hasil sampel dari nilai H₀, dalam satuan standard error.',
        'Critical value memisahkan rejection region dan nonrejection region.',
        'Luas rejection region = α. Pada uji dua sisi, masing-masing ekor berluas α/2.',
        'Critical value Z untuk uji dua sisi: α = 0.10 → ±1.645, α = 0.05 → ±1.96, α = 0.01 → ±2.576.',
      ],
      formulas: [
        {
          label: 'Aturan keputusan uji dua sisi',
          formula: 'Tolak H₀ jika Z_STAT < −Z_α/2   atau   Z_STAT > Z_α/2',
          symbols: [
            { symbol: 'Z_STAT', meaning: 'Test statistic yang dihitung dari sampel' },
            { symbol: 'Z_α/2', meaning: 'Critical value dengan luas ekor atas α/2' },
          ],
        },
      ],
      visualType: 'critical-region',
    },
    {
      id: 'ht-4-z-test-mean',
      heading: 'Z Test for the Mean (σ Known): The Six-Step Approach',
      group: 'Testing the Mean',
      body: '**Z test for the mean** digunakan untuk menguji population mean ketika **population standard deviation (σ) diketahui**. Test statistic-nya adalah Z_STAT = (x̄ − μ) / (σ / √n).\n\nPengujian dengan **critical value approach** mengikuti **enam langkah**:\n1. **State the hypotheses**: tentukan H₀ dan H₁.\n2. **Select the level of significance**: tentukan α (0.01, 0.05, atau 0.10).\n3. **Determine the appropriate test statistic**: pilih Z-test (σ diketahui) atau t-test (σ tidak diketahui).\n4. **Determine the critical value**: berdasarkan α dan jenis uji (satu atau dua sisi).\n5. **State the decision rule**: tentukan rejection region dan nonrejection region.\n6. **Make a decision and interpret**: hitung test statistic, bandingkan dengan critical value, lalu simpulkan dalam bahasa masalahnya.\n\nLangkah 1 sampai 5 dilakukan **sebelum** melihat data, agar keputusan tidak dipengaruhi hasil sampel.',
      points: [
        'Z-test dipakai jika σ populasi diketahui.',
        'Langkah 1–5 ditetapkan sebelum data dikumpulkan; langkah 6 menghitung dan memutuskan.',
        'Kesimpulan ditulis dalam bahasa masalah, misalnya "tidak ada bukti bahwa rata-rata berat berbeda dari 368 g".',
      ],
      formula: 'Z_STAT = (x̄ − μ) / (σ / √n)   (9.1)',
      formulaSymbols: [
        { symbol: 'x̄', meaning: 'Sample mean' },
        { symbol: 'μ', meaning: 'Hypothesized population mean (nilai pada H₀)' },
        { symbol: 'σ', meaning: 'Population standard deviation (diketahui)' },
        { symbol: 'n', meaning: 'Sample size' },
      ],
      stepsLabel: 'Contoh: enam langkah uji Z',
      steps: [
        {
          step: 1,
          title: 'State the Hypotheses',
          instruction: 'Tulis H₀ dan H₁ untuk klaim pabrik.',
          substituted: 'H₀: μ = 368 g; H₁: μ ≠ 368 g (uji dua sisi).',
        },
        {
          step: 2,
          title: 'Select the Level of Significance',
          instruction: 'Tetapkan α sebelum melihat data.',
          substituted: 'α = 0.05.',
        },
        {
          step: 3,
          title: 'Determine the Test Statistic',
          instruction: 'σ diketahui dari data historis mesin, jadi pakai Z-test.',
          substituted: 'σ = 15 g, n = 25 → Z_STAT = (x̄ − 368) / (15 / √25).',
        },
        {
          step: 4,
          title: 'Determine the Critical Value',
          instruction: 'Uji dua sisi dengan α = 0.05 → luas α/2 = 0.025 di tiap ekor.',
          substituted: 'Critical value = ±1.96.',
        },
        {
          step: 5,
          title: 'State the Decision Rule',
          instruction: 'Tentukan kapan H₀ ditolak.',
          substituted: 'Tolak H₀ jika Z_STAT < −1.96 atau Z_STAT > 1.96; selain itu, tidak tolak H₀.',
        },
        {
          step: 6,
          title: 'Make a Decision and Interpret',
          instruction: 'Hitung Z_STAT dari sampel, bandingkan, lalu simpulkan.',
          substituted: 'x̄ = 372.5 → Z_STAT = (372.5 − 368) / 3 = 1.50. Karena −1.96 < 1.50 < 1.96, H₀ tidak ditolak: tidak ada bukti bahwa rata-rata berat berbeda dari 368 g.',
        },
      ],
      visualType: 'z-test-mean',
    },
    {
      id: 'ht-5-p-value',
      heading: 'The p-Value Approach',
      group: 'Testing the Mean',
      body: '**p-value** adalah **probabilitas memperoleh test statistic yang sama atau lebih ekstrem** dibandingkan hasil sampel, **dengan asumsi H₀ benar**. p-value juga disebut **observed level of significance**.\n\nSemakin kecil p-value, semakin "aneh" hasil sampel jika H₀ benar, sehingga semakin kuat bukti untuk menolak H₀.\n\n**Decision rule**:\n• Jika **p-value < α**, maka **reject H₀**.\n• Jika **p-value ≥ α**, maka **do not reject H₀**.\n\nPada uji dua sisi, "lebih ekstrem" berarti di kedua arah, sehingga p-value = 2 × luas ekor di luar |Z_STAT|. Kelebihan p-value: pembaca bisa langsung menilai keputusan untuk α berapa pun, tanpa mencari critical value.',
      points: [
        'p-value = peluang hasil seekstrem ini (atau lebih) jika H₀ benar.',
        'p-value < α → tolak H₀; p-value ≥ α → tidak tolak H₀.',
        'Uji dua sisi: p-value = 2 × luas satu ekor.',
        'Critical value approach dan p-value approach selalu memberi keputusan yang sama.',
      ],
      formulas: [
        {
          label: 'p-value uji dua sisi',
          formula: 'p-value = 2 × P(Z ≥ abs(Z_STAT))',
        },
        {
          label: 'Decision rule',
          formula: 'p-value < α → tolak H₀   |   p-value ≥ α → tidak tolak H₀',
        },
      ],
      stepsLabel: 'Contoh: keputusan dengan p-value',
      steps: [
        {
          step: 1,
          title: 'Hitung Test Statistic',
          instruction: 'Gunakan data contoh beras.',
          substituted: 'Z_STAT = (372.5 − 368) / (15 / √25) = 1.50.',
        },
        {
          step: 2,
          title: 'Cari Luas Ekor',
          instruction: 'Cari P(Z ≥ 1.50) dari tabel normal standar.',
          substituted: 'P(Z ≥ 1.50) = 1 − 0.9332 = 0.0668.',
        },
        {
          step: 3,
          title: 'Kalikan Dua untuk Uji Dua Sisi',
          instruction: 'Hasil seekstrem ini bisa terjadi di ekor kiri maupun kanan.',
          substituted: 'p-value = 2 × 0.0668 = 0.1336.',
        },
        {
          step: 4,
          title: 'Bandingkan dengan α',
          instruction: 'Terapkan decision rule.',
          substituted: '0.1336 ≥ 0.05 → tidak tolak H₀, sama dengan keputusan critical value approach.',
        },
      ],
      visualType: 'p-value',
    },
    {
      id: 'ht-6-t-test-mean',
      heading: 't Test of Hypothesis for the Mean (σ Unknown)',
      group: 'Testing the Mean',
      body: '**t-test** digunakan untuk menguji population mean ketika **population standard deviation (σ) tidak diketahui** dan harus **diestimasi menggunakan sample standard deviation (S)**. Ini kasus yang paling sering terjadi dalam praktik.\n\nTest statistic t_STAT mengikuti **distribusi t** dengan **degrees of freedom (df) = n − 1**. Degrees of freedom dipakai untuk menentukan critical value pada tabel t.\n\n**Asumsi t-test**:\n• Data berasal dari **random sample**.\n• Populasi diasumsikan **berdistribusi normal**.\n• σ tidak diketahui dan diestimasi dengan S.\n\nJika sample size tidak terlalu kecil dan populasi tidak terlalu skewed, distribusi t tetap memberikan pendekatan yang baik terhadap sampling distribution of the mean (berkat Central Limit Theorem).\n\nDengan **critical value approach**, t_STAT dibandingkan dengan critical t-value berdasarkan α dan df.',
      points: [
        'σ tidak diketahui → ganti dengan S dan gunakan distribusi t.',
        'Degrees of freedom df = n − 1 menentukan critical value di tabel t.',
        'Asumsi: random sample dan populasi kira-kira normal (atau n cukup besar).',
        'Critical t lebih besar daripada critical Z untuk α yang sama, terutama pada n kecil.',
      ],
      formula: 't_STAT = (x̄ − μ) / (S / √n)   (9.2)',
      formulaSymbols: [
        { symbol: 'x̄', meaning: 'Sample mean' },
        { symbol: 'μ', meaning: 'Hypothesized population mean' },
        { symbol: 'S', meaning: 'Sample standard deviation' },
        { symbol: 'n', meaning: 'Sample size; df = n − 1' },
      ],
      stepsLabel: 'Contoh: rata-rata nilai faktur',
      steps: [
        {
          step: 1,
          title: 'Hipotesis dan α',
          instruction: 'Bagian keuangan menyatakan rata-rata nilai faktur Rp120 ribu. Auditor ingin tahu apakah berbeda.',
          substituted: 'H₀: μ = 120; H₁: μ ≠ 120 (ribu rupiah), α = 0.05.',
        },
        {
          step: 2,
          title: 'Statistik Sampel',
          instruction: 'Ambil sampel acak faktur; σ tidak diketahui.',
          substituted: 'n = 12, x̄ = 112.85, S = 20.80.',
        },
        {
          step: 3,
          title: 'Critical Value',
          instruction: 'df = n − 1, luas ekor atas α/2 = 0.025.',
          substituted: 'df = 11 → t_α/2 = 2.2010. Tolak H₀ jika t_STAT < −2.2010 atau t_STAT > 2.2010.',
        },
        {
          step: 4,
          title: 'Hitung t_STAT',
          instruction: 'Hitung standard error S / √n, lalu t_STAT.',
          substituted: 'S / √n = 20.80 / 3.4641 = 6.0044 → t_STAT = (112.85 − 120) / 6.0044 = −1.19.',
        },
        {
          step: 5,
          title: 'Keputusan dan Interpretasi',
          instruction: 'Bandingkan t_STAT dengan critical value.',
          substituted: '−2.2010 < −1.19 < 2.2010 → tidak tolak H₀. Tidak ada bukti bahwa rata-rata nilai faktur berbeda dari Rp120 ribu.',
        },
      ],
      visualType: 't-test-mean',
    },
    {
      id: 'ht-7-one-tail',
      heading: 'One-Tail Tests',
      group: 'Testing the Mean',
      body: '**One-tail test** digunakan ketika **alternative hypothesis menunjukkan arah tertentu**: apakah parameter populasi **lebih besar** atau **lebih kecil** dari nilai yang dihipotesiskan.\n\n**1. Right-tailed test (upper-tail test)**: menguji apakah parameter **lebih besar** dari nilai tertentu. H₀: μ ≤ μ₀ dan H₁: μ > μ₀. **Rejection region berada di sebelah kanan** distribusi.\n\n**2. Left-tailed test (lower-tail test)**: menguji apakah parameter **lebih kecil** dari nilai tertentu. H₀: μ ≥ μ₀ dan H₁: μ < μ₀. **Rejection region berada di sebelah kiri** distribusi.\n\nPada one-tail test, **seluruh α berada di satu ekor**, sehingga critical value-nya lebih kecil (misalnya Z_α = 1.645 untuk α = 0.05, dibanding 1.96 pada uji dua sisi).\n\n**Decision rule**:\n• Right-tailed: reject H₀ jika test statistic **lebih besar dari positive critical value**.\n• Left-tailed: reject H₀ jika test statistic **lebih kecil dari negative critical value**.\n• Dengan p-value: reject H₀ jika p-value < α (p-value dihitung hanya di satu ekor).\n\nPerbedaan utama dengan **two-tail test**: one-tail hanya menguji **satu arah perubahan**, sedangkan two-tail menguji apakah ada perbedaan **tanpa menentukan arah**.',
      points: [
        'Right-tailed: H₁: μ > μ₀, rejection region di kanan.',
        'Left-tailed: H₁: μ < μ₀, rejection region di kiri.',
        'Seluruh α ada di satu ekor, jadi critical value lebih dekat ke 0 daripada uji dua sisi.',
        'Arah uji ditentukan dari pertanyaan penelitian sebelum melihat data, bukan dari hasil sampel.',
      ],
      formulas: [
        {
          label: 'Left-tailed (lower-tail) test',
          formula: 'H₀: μ ≥ μ₀   |   H₁: μ < μ₀   |   Tolak H₀ jika t_STAT < −t_α',
        },
        {
          label: 'Right-tailed (upper-tail) test',
          formula: 'H₀: μ ≤ μ₀   |   H₁: μ > μ₀   |   Tolak H₀ jika t_STAT > t_α',
        },
      ],
      stepsLabel: 'Contoh: uji sisi kiri isi botol',
      steps: [
        {
          step: 1,
          title: 'Hipotesis Satu Arah',
          instruction: 'Lembaga konsumen menduga isi botol minuman kurang dari 600 ml yang tertera di label.',
          substituted: 'H₀: μ ≥ 600; H₁: μ < 600 (left-tailed), α = 0.05.',
        },
        {
          step: 2,
          title: 'Critical Value di Satu Ekor',
          instruction: 'Seluruh α = 0.05 diletakkan di ekor kiri; df = n − 1.',
          substituted: 'n = 25 → df = 24 → −t_α = −1.7109. Tolak H₀ jika t_STAT < −1.7109.',
        },
        {
          step: 3,
          title: 'Hitung t_STAT',
          instruction: 'Gunakan statistik sampel.',
          substituted: 'x̄ = 596, S = 10 → S / √n = 10 / 5 = 2 → t_STAT = (596 − 600) / 2 = −2.00.',
        },
        {
          step: 4,
          title: 'Keputusan',
          instruction: 'Bandingkan dengan critical value di ekor kiri.',
          substituted: '−2.00 < −1.7109 → tolak H₀. Ada bukti bahwa rata-rata isi botol kurang dari 600 ml.',
        },
      ],
      visualType: 'one-tail-test',
    },
    {
      id: 'ht-8-z-test-proportion',
      heading: 'Z Test of Hypothesis for the Proportion',
      group: 'Testing the Proportion',
      body: '**Z-test for the proportion** digunakan untuk menguji **population proportion (π)**, yaitu proporsi populasi yang memiliki karakteristik tertentu. Pengujian ini melibatkan **categorical variable** dengan dua kemungkinan hasil:\n• **Success**: individu atau objek yang **memiliki** karakteristik tertentu.\n• **Failure**: individu atau objek yang **tidak memiliki** karakteristik tersebut.\n\n**Population proportion** adalah fraksi atau persentase populasi yang termasuk kategori success. **Sample proportion** dihitung dengan p = X / n.\n\nTest statistic Z_STAT mendekati distribusi normal standar jika **X dan (n − X) masing-masing minimal 5**. Seperti pada mean, hipotesisnya bisa dua sisi (π ≠ π₀), sisi kanan (π > π₀), atau sisi kiri (π < π₀).',
      points: [
        'Dipakai untuk data kategorikal dua hasil (success / failure).',
        'p = X / n adalah sample proportion; π adalah nilai proporsi pada H₀.',
        'Syarat: X ≥ 5 dan n − X ≥ 5.',
        'Standard error di penyebut memakai π dari H₀, bukan p.',
      ],
      formulas: [
        {
          label: 'Z Test for the Proportion (9.3)',
          formula: 'Z_STAT = (p − π) / √[ π(1 − π) / n ]',
          symbols: [
            { symbol: 'p', meaning: 'Sample proportion = X / n' },
            { symbol: 'π', meaning: 'Hypothesized population proportion (nilai pada H₀)' },
            { symbol: 'n', meaning: 'Sample size' },
          ],
        },
        {
          label: 'Sample proportion',
          formula: 'p = X / n',
          symbols: [{ symbol: 'X', meaning: 'Banyaknya success dalam sampel' }],
        },
      ],
      stepsLabel: 'Contoh: proporsi pengguna e-wallet',
      steps: [
        {
          step: 1,
          title: 'Hipotesis',
          instruction: 'Sebuah laporan menyebut separuh mahasiswa membayar di kantin memakai e-wallet. Kita uji klaim tersebut.',
          substituted: 'H₀: π = 0.50; H₁: π ≠ 0.50, α = 0.05 → critical value ±1.96.',
        },
        {
          step: 2,
          title: 'Hitung p dan Periksa Syarat',
          instruction: 'Hitung sample proportion, lalu pastikan X ≥ 5 dan n − X ≥ 5.',
          substituted: 'n = 400, X = 230 → p = 230 / 400 = 0.575. X = 230 ≥ 5 dan n − X = 170 ≥ 5 ✓.',
        },
        {
          step: 3,
          title: 'Hitung Standard Error dan Z_STAT',
          instruction: 'Gunakan π dari H₀ di dalam akar.',
          substituted: '√(0.50 × 0.50 / 400) = 0.025 → Z_STAT = (0.575 − 0.50) / 0.025 = 3.00.',
        },
        {
          step: 4,
          title: 'Keputusan',
          instruction: 'Bandingkan dengan critical value (atau hitung p-value).',
          substituted: '3.00 > 1.96 → tolak H₀ (p-value = 0.0027). Proporsi pengguna e-wallet berbeda dari 50%, dan datanya menunjukkan lebih tinggi.',
        },
      ],
      visualType: 'z-test-proportion',
    },
    {
      id: 'ht-9-rangkuman',
      heading: 'Summary: Choosing a One-Sample Test',
      group: 'Summary of Hypothesis Testing',
      body: 'Semua uji satu sampel mengikuti logika yang sama: hitung **test statistic** = (statistik sampel − nilai H₀) / standard error, lalu bandingkan dengan **critical value** atau hitung **p-value**. Yang berbeda hanyalah jenis data dan informasi yang tersedia.',
      points: [
        'Data numerik, σ diketahui → Z test for the mean.',
        'Data numerik, σ tidak diketahui → t test for the mean dengan df = n − 1.',
        'Data kategorikal (success/failure) → Z test for the proportion, syarat X ≥ 5 dan n − X ≥ 5.',
        'Arah H₁ menentukan letak rejection region: ≠ (dua ekor), > (ekor kanan), < (ekor kiri).',
      ],
      summaryTable: {
        columns: ['Kasus', 'Test Statistic', 'Critical Value', 'Catatan'],
        rows: [
          {
            ukuran: 'Mean, σ diketahui',
            sampel: 'Z_STAT = (x̄ − μ) / (σ / √n)',
            populasi: '±Z_α/2 (dua sisi) atau Z_α (satu sisi)',
            catatan: 'Contoh: berat beras, σ dari data historis mesin.',
          },
          {
            ukuran: 'Mean, σ tidak diketahui',
            sampel: 't_STAT = (x̄ − μ) / (S / √n)',
            populasi: '±t_α/2 atau t_α, dengan df = n − 1',
            catatan: 'Asumsi: random sample, populasi kira-kira normal.',
          },
          {
            ukuran: 'Proporsi',
            sampel: 'Z_STAT = (p − π) / √[π(1 − π) / n]',
            populasi: '±Z_α/2 atau Z_α',
            catatan: 'Syarat X ≥ 5 dan n − X ≥ 5.',
          },
        ],
      },
      visualType: 'test-chooser',
    },
  ],
};

export const twoSampleContent: TheoryContent = {
  topicId: 'uji-dua-sampel',
  topicTitle: 'Two-Sample Tests',
  completionXp: 15,
  sections: [
    {
      id: 'ts-1-independent-related',
      heading: 'Independent and Related Samples',
      group: 'Two-Sample Test Concepts',
      body: '**Two-sample test** adalah metode statistik inferensial untuk **membandingkan dua sampel dari dua populasi**, untuk mengetahui apakah terdapat **perbedaan yang signifikan** antara population means atau population proportions.\n\nLangkah pertama selalu menentukan **jenis sampelnya**:\n• **Independent samples**: dua sampel yang **dipilih secara random dan independen dari dua populasi berbeda**. Anggota sampel pertama **tidak berhubungan atau berpasangan** dengan anggota sampel kedua. Contoh: nilai ujian kelas A dibandingkan dengan nilai kelas B.\n• **Related samples**: dua sampel yang **memiliki hubungan atau pasangan** antara setiap observasinya. Contoh paling umum adalah pengukuran **sebelum dan sesudah** suatu perlakuan (before-and-after) pada orang yang sama, atau dua hal yang dicocokkan (matched) berdasarkan karakteristik tertentu.\n\nJenis sampel menentukan uji yang dipakai: independent → **pooled-variance t test**; related → **paired t test**.',
      points: [
        'Two-sample test membandingkan dua populasi: apakah selisih mean-nya nol atau tidak.',
        'Independent samples: tidak ada pasangan antar anggota kedua sampel.',
        'Related samples: setiap observasi di sampel 1 punya pasangan di sampel 2 (misalnya sebelum-sesudah).',
        'Salah memilih jenis sampel membuat kesimpulan bisa keliru.',
      ],
      visualType: 'independent-vs-related',
    },
    {
      id: 'ts-2-pooled-t-test',
      heading: 'Pooled-Variance t Test for the Difference Between Two Means',
      group: 'Comparing Two Independent Means',
      body: '**Pooled-variance t test** digunakan untuk membandingkan dua population means dari **dua populasi independen** ketika:\n• Kedua sampel dipilih secara **random dan independen**.\n• Kedua populasi diasumsikan **berdistribusi normal**.\n• Kedua populasi memiliki **equal variances** (varians yang sama).\n\nJika populasi tidak terlalu berbeda dari distribusi normal, pooled-variance t test tetap dapat digunakan, terutama ketika sample size cukup besar.\n\nKarena variansnya dianggap sama, kedua varians sampel **digabung (pooled)** menjadi satu estimasi S²_p, rata-rata tertimbang dengan bobot degrees of freedom masing-masing.\n\n**Hipotesis**:\n• H₀: μ₁ − μ₂ = 0 (tidak terdapat perbedaan mean).\n• H₁: μ₁ − μ₂ ≠ 0 (terdapat perbedaan mean).\n\nt_STAT mengikuti distribusi t dengan **df = n₁ + n₂ − 2**. **Decision rule**: bandingkan t_STAT dengan critical t-value, atau gunakan p-value: jika p-value < α, reject H₀; jika p-value ≥ α, do not reject H₀.',
      points: [
        'Syarat: dua sampel random dan independen, populasi normal, varians sama.',
        'S²_p adalah rata-rata tertimbang dari S²₁ dan S²₂.',
        'df = n₁ + n₂ − 2.',
        'H₀: μ₁ − μ₂ = 0; H₁: μ₁ − μ₂ ≠ 0 (atau satu arah jika pertanyaannya berarah).',
      ],
      formulas: [
        {
          label: 'Pooled-Variance t Test (10.1)',
          formula: 't_STAT = [(x̄₁ − x̄₂) − (μ₁ − μ₂)] / √[ S²_p (1/n₁ + 1/n₂) ]',
          symbols: [
            { symbol: 'x̄₁, x̄₂', meaning: 'Mean sampel dari populasi 1 dan 2' },
            { symbol: 'μ₁ − μ₂', meaning: 'Selisih mean menurut H₀ (biasanya 0)' },
            { symbol: 'n₁, n₂', meaning: 'Ukuran sampel 1 dan 2' },
          ],
        },
        {
          label: 'Pooled variance',
          formula: 'S²_p = [(n₁ − 1)S²₁ + (n₂ − 1)S²₂] / [(n₁ − 1) + (n₂ − 1)]',
          symbols: [
            { symbol: 'S²₁, S²₂', meaning: 'Varians sampel 1 dan 2' },
            { symbol: 'S²_p', meaning: 'Pooled variance' },
          ],
        },
        {
          label: 'Degrees of freedom',
          formula: 'df = n₁ + n₂ − 2',
        },
      ],
      stepsLabel: 'Contoh: penjualan di dua jenis rak',
      steps: [
        {
          step: 1,
          title: 'Hipotesis dan α',
          instruction: 'Sebuah minimarket membandingkan penjualan minuman (kaleng per minggu) di rak biasa dan di rak ujung lorong, masing-masing di 10 toko.',
          substituted: 'H₀: μ₁ − μ₂ = 0; H₁: μ₁ − μ₂ ≠ 0, α = 0.05.',
        },
        {
          step: 2,
          title: 'Statistik Kedua Sampel',
          instruction: 'Hitung mean dan standar deviasi masing-masing sampel.',
          substituted: 'Rak biasa: n₁ = 10, x̄₁ = 50.3, S₁ = 18.7264. Rak ujung: n₂ = 10, x̄₂ = 72.0, S₂ = 12.5433.',
        },
        {
          step: 3,
          title: 'Hitung Pooled Variance',
          instruction: 'Gabungkan kedua varians dengan bobot df.',
          substituted: 'S²_p = (9 × 350.6778 + 9 × 157.3333) / 18 = 254.0056.',
        },
        {
          step: 4,
          title: 'Hitung t_STAT',
          instruction: 'Hitung standard error selisih mean, lalu t_STAT.',
          substituted: '√[254.0056 × (1/10 + 1/10)] = 7.1275 → t_STAT = (50.3 − 72.0) / 7.1275 = −3.04.',
        },
        {
          step: 5,
          title: 'Keputusan',
          instruction: 'df = n₁ + n₂ − 2, bandingkan dengan critical t.',
          substituted: 'df = 18 → ±2.1009. Karena −3.04 < −2.1009, tolak H₀: rata-rata penjualan di kedua rak berbeda (rak ujung lorong lebih tinggi).',
        },
      ],
      visualType: 'pooled-t-test',
    },
    {
      id: 'ts-3-ci-difference',
      heading: 'Confidence Interval Estimate for the Difference Between Two Means',
      group: 'Comparing Two Independent Means',
      body: 'Selain menguji, kita juga bisa **mengestimasi besarnya selisih** μ₁ − μ₂ dengan confidence interval. Rumusnya mengikuti pola yang sama dengan bab Confidence Interval: **point estimate ± critical value × standard error**, dengan point estimate (x̄₁ − x̄₂) dan critical value t_α/2 pada df = n₁ + n₂ − 2.\n\nInterval ini berhubungan langsung dengan uji dua sisi: jika interval (1 − α) **tidak memuat 0**, maka H₀: μ₁ − μ₂ = 0 **ditolak** pada level α. Jika interval memuat 0, H₀ tidak ditolak.\n\nKeunggulan interval: selain tahu "ada perbedaan", kita juga tahu **seberapa besar** perbedaannya.',
      points: [
        'Interval untuk μ₁ − μ₂ = (x̄₁ − x̄₂) ± t_α/2 × standard error.',
        'df = n₁ + n₂ − 2, sama seperti pooled-variance t test.',
        'Interval tidak memuat 0 → selisih signifikan (tolak H₀ pada uji dua sisi).',
      ],
      formula: '(x̄₁ − x̄₂) ± t_α/2 · √[ S²_p (1/n₁ + 1/n₂) ]   (10.2)',
      formulaSymbols: [
        { symbol: 'x̄₁ − x̄₂', meaning: 'Point estimate selisih mean' },
        { symbol: 't_α/2', meaning: 'Critical value t dengan df = n₁ + n₂ − 2' },
        { symbol: 'S²_p', meaning: 'Pooled variance' },
      ],
      stepsLabel: 'Contoh: lanjutan data rak',
      steps: [
        {
          step: 1,
          title: 'Point Estimate',
          instruction: 'Hitung selisih kedua mean sampel.',
          substituted: 'x̄₁ − x̄₂ = 50.3 − 72.0 = −21.7.',
        },
        {
          step: 2,
          title: 'Margin of Error',
          instruction: 'Kalikan critical value dengan standard error selisih.',
          substituted: 't_α/2 = 2.1009 (df = 18), standard error = 7.1275 → margin of error = 2.1009 × 7.1275 = 14.97.',
        },
        {
          step: 3,
          title: 'Bentuk Interval dan Interpretasikan',
          instruction: 'Kurangkan dan tambahkan margin of error.',
          substituted: '−21.7 ± 14.97 → −36.67 ≤ μ₁ − μ₂ ≤ −6.73. Interval tidak memuat 0, jadi rak ujung lorong menjual 6.7 sampai 36.7 kaleng lebih banyak per minggu (kepercayaan 95%).',
        },
      ],
      visualType: 'ci-difference',
    },
    {
      id: 'ts-4-paired-t-test',
      heading: 'Comparing the Means of Two Related Populations: The Paired t Test',
      group: 'Comparing Two Related Means',
      body: '**Comparing means of two related populations** digunakan untuk menguji apakah terdapat perbedaan signifikan antara dua population means yang **saling berhubungan**.\n\n**Paired t test** menguji **mean difference** dari dua populasi yang berhubungan. Caranya: hitung **selisih (D) setiap pasangan observasi**, lalu uji apakah rata-rata selisih tersebut (D̄) berbeda dari 0. Dengan kata lain, dua sampel berpasangan diubah menjadi **satu sampel selisih**, lalu diuji seperti t-test satu sampel dengan df = n − 1 (n = banyaknya pasangan).\n\n**Hipotesis**:\n• H₀: μ_D = 0 (tidak terdapat perbedaan mean).\n• H₁: μ_D ≠ 0 (terdapat perbedaan mean).\n\n**Decision rule** (uji dua sisi):\n• Reject H₀ jika t_STAT **lebih besar dari upper-tail critical value**.\n• Reject H₀ jika t_STAT **lebih kecil dari lower-tail critical value**.\n• Jika tidak berada pada rejection region, do not reject H₀.\n\nKenapa tidak memakai pooled t test? Pada data berpasangan, perbedaan antar individu (ada yang memang pintar, ada yang tidak) ikut "terhapus" saat dihitung selisihnya, sehingga paired t test jauh lebih **peka** terhadap efek perlakuan.',
      points: [
        'Related samples → hitung selisih D tiap pasangan, lalu uji apakah μ_D = 0.',
        'n adalah banyaknya pasangan; df = n − 1.',
        'D̄ adalah rata-rata selisih dan S_D adalah standar deviasi selisih.',
        'Paired t test lebih peka daripada pooled t test untuk data sebelum-sesudah karena variasi antar individu dihilangkan.',
      ],
      formulas: [
        {
          label: 'Paired t Test for the Mean Difference (10.3)',
          formula: 't_STAT = (D̄ − μ_D) / (S_D / √n)',
          symbols: [
            { symbol: 'D̄', meaning: 'Rata-rata selisih pasangan' },
            { symbol: 'μ_D', meaning: 'Mean difference menurut H₀ (biasanya 0)' },
            { symbol: 'S_D', meaning: 'Standar deviasi selisih' },
            { symbol: 'n', meaning: 'Banyaknya pasangan; df = n − 1' },
          ],
        },
        {
          label: 'Mean dan standar deviasi selisih',
          formula: 'D̄ = ΣDᵢ / n   |   S_D = √[ Σ(Dᵢ − D̄)² / (n − 1) ]',
        },
      ],
      stepsLabel: 'Contoh: nilai sebelum dan sesudah pelatihan',
      steps: [
        {
          step: 1,
          title: 'Hipotesis',
          instruction: 'Enam mahasiswa mengikuti tes sebelum dan sesudah pelatihan statistika. Apakah ada perubahan nilai?',
          substituted: 'H₀: μ_D = 0; H₁: μ_D ≠ 0, α = 0.05.',
        },
        {
          step: 2,
          title: 'Hitung Selisih Setiap Pasangan',
          instruction: 'D = nilai sesudah − nilai sebelum untuk setiap mahasiswa.',
          substituted: 'Sebelum: 62, 70, 58, 75, 66, 71. Sesudah: 68, 74, 61, 80, 65, 78. D: 6, 4, 3, 5, −1, 7.',
        },
        {
          step: 3,
          title: 'Hitung D̄ dan S_D',
          instruction: 'Hitung rata-rata dan standar deviasi dari D.',
          substituted: 'D̄ = 24 / 6 = 4.0. Σ(Dᵢ − D̄)² = 40 → S_D = √(40 / 5) = 2.8284.',
        },
        {
          step: 4,
          title: 'Hitung t_STAT',
          instruction: 'Bagi D̄ dengan standard error S_D / √n.',
          substituted: 'S_D / √n = 2.8284 / 2.4495 = 1.1547 → t_STAT = 4.0 / 1.1547 = 3.46.',
        },
        {
          step: 5,
          title: 'Keputusan',
          instruction: 'df = n − 1, bandingkan dengan critical t.',
          substituted: 'df = 5 → ±2.5706. Karena 3.46 > 2.5706, tolak H₀: rata-rata nilai berubah setelah pelatihan (naik sekitar 4 poin).',
        },
      ],
      visualType: 'paired-t-test',
    },
    {
      id: 'ts-5-rangkuman',
      heading: 'Summary: Choosing a Two-Sample Test',
      group: 'Summary of Two-Sample Tests',
      body: 'Kunci memilih uji dua sampel adalah pertanyaan pertama: **apakah setiap data di sampel 1 punya pasangan di sampel 2?** Jika ya, gunakan paired t test pada selisihnya. Jika tidak, gunakan pooled-variance t test (dengan asumsi varians sama).',
      points: [
        'Dua kelompok berbeda, tanpa pasangan → pooled-variance t test, df = n₁ + n₂ − 2.',
        'Data sebelum-sesudah atau dicocokkan → paired t test pada selisih D, df = n − 1.',
        'Confidence interval selisih mean yang tidak memuat 0 berarti perbedaannya signifikan.',
        'Keputusan: tolak H₀ jika t_STAT di rejection region atau p-value < α.',
      ],
      summaryTable: {
        columns: ['Kasus', 'Test Statistic', 'Degrees of Freedom', 'Catatan'],
        rows: [
          {
            ukuran: 'Dua mean, sampel independen',
            sampel: 't_STAT = (x̄₁ − x̄₂) / √[ S²_p (1/n₁ + 1/n₂) ]',
            populasi: 'df = n₁ + n₂ − 2',
            catatan: 'Asumsi: random, independen, normal, varians sama.',
          },
          {
            ukuran: 'Selisih dua mean (interval)',
            sampel: '(x̄₁ − x̄₂) ± t_α/2 · √[ S²_p (1/n₁ + 1/n₂) ]',
            populasi: 'df = n₁ + n₂ − 2',
            catatan: 'Interval tidak memuat 0 → perbedaan signifikan.',
          },
          {
            ukuran: 'Dua mean, sampel berpasangan',
            sampel: 't_STAT = D̄ / (S_D / √n)',
            populasi: 'df = n − 1',
            catatan: 'n = banyaknya pasangan; D = selisih tiap pasangan.',
          },
        ],
      },
      visualType: 'test-chooser-two',
    },
  ],
};
