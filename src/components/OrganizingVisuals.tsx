import React, { useState } from 'react';

// =========================================================================
// 1. TABEL RINGKASAN & TABEL KONTINGENSI VISUAL
// =========================================================================
export const TabelRingkasanKontingensiVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'kontingensi'>('ringkasan');
  const [displayMode, setDisplayMode] = useState<'semua' | 'frekuensi' | 'persen'>('semua');
  const [contingencyMode, setContingencyMode] = useState<'frekuensi' | 'persen-total' | 'persen-baris' | 'persen-kolom'>('frekuensi');

  const summaryData = [
    { metode: 'E-Wallet (GoPay, OVO, ShopeePay)', f: 80, pct: 40.0, color: 'bg-teal-500' },
    { metode: 'Transfer Virtual Account', f: 50, pct: 25.0, color: 'bg-emerald-500' },
    { metode: 'Kartu Kredit / Debit Online', f: 40, pct: 20.0, color: 'bg-blue-500' },
    { metode: 'Bayar di Tempat (COD)', f: 30, pct: 15.0, color: 'bg-amber-500' },
  ];
  const totalN = 200;

  // Contingency 2x4 matrix: Customer Type x Payment Method
  // Baris: Pelanggan Baru (n=100), Pelanggan Setia (n=100)
  const contingencyData = {
    metode: ['E-Wallet', 'Virtual Account', 'Kartu Kredit', 'COD'],
    rows: [
      { tipe: 'Pelanggan Baru', values: [50, 15, 10, 25], total: 100 },
      { tipe: 'Pelanggan Setia', values: [30, 35, 30, 5], total: 100 },
    ],
    colTotals: [80, 50, 40, 30],
    grandTotal: 200,
  };

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('ringkasan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ringkasan'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tabel Ringkasan (1 Variabel)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kontingensi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kontingensi'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tabel Kontingensi (2 Variabel)
          </button>
        </div>

        {activeTab === 'ringkasan' ? (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-on-surface-variant font-medium text-[11px] mr-1">Tampilkan:</span>
            {(['semua', 'frekuensi', 'persen'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDisplayMode(m)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium text-[11px] transition-colors ${
                  displayMode === m
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {m === 'semua' ? 'Semua' : m === 'frekuensi' ? 'Jumlah (f)' : 'Persen (%)'}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1 text-xs">
            <span className="text-on-surface-variant font-medium text-[11px] mr-1">Nilai Sel:</span>
            {[
              { id: 'frekuensi', label: 'Jumlah (f)' },
              { id: 'persen-total', label: '% Total' },
              { id: 'persen-baris', label: '% Baris' },
              { id: 'persen-kolom', label: '% Kolom' },
            ].map((cm) => (
              <button
                key={cm.id}
                onClick={() => setContingencyMode(cm.id as any)}
                className={`px-2 py-1 rounded-md font-medium text-[11px] transition-colors ${
                  contingencyMode === cm.id
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {cm.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CONTENT: TABEL RINGKASAN */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface font-semibold border-b border-outline-variant/60">
                  <th className="py-2.5 px-3.5">Metode Pembayaran (Variabel Kategorikal)</th>
                  {(displayMode === 'semua' || displayMode === 'frekuensi') && (
                    <th className="py-2.5 px-3 text-right">Frekuensi (f)</th>
                  )}
                  {(displayMode === 'semua' || displayMode === 'persen') && (
                    <th className="py-2.5 px-3 text-right">Persentase (%)</th>
                  )}
                  <th className="py-2.5 px-3">Proporsi Visual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {summaryData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-2.5 px-3.5 font-medium text-on-surface flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.color}`} />
                      <span>{row.metode}</span>
                    </td>
                    {(displayMode === 'semua' || displayMode === 'frekuensi') && (
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{row.f}</td>
                    )}
                    {(displayMode === 'semua' || displayMode === 'persen') && (
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-primary">
                        {row.pct.toFixed(1)}%
                      </td>
                    )}
                    <td className="py-2.5 px-3 min-w-[120px]">
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full ${row.color} rounded-full`}
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Total Row */}
                <tr className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/80">
                  <td className="py-2.5 px-3.5">Total Sampel (n)</td>
                  {(displayMode === 'semua' || displayMode === 'frekuensi') && (
                    <td className="py-2.5 px-3 text-right font-mono">{totalN}</td>
                  )}
                  {(displayMode === 'semua' || displayMode === 'persen') && (
                    <td className="py-2.5 px-3 text-right font-mono text-primary">100.0%</td>
                  )}
                  <td className="py-2.5 px-3 text-[11px] text-on-surface-variant font-normal">
                    Lengkap &amp; Tuntas (100%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-start gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
              calculate
            </span>
            <span>
              <strong>Cara hitung persentase:</strong> Persentase E-Wallet = (80 / 200) × 100% = <strong>40.0%</strong>. Setiap baris mewakili kategori mutually exclusive.
            </span>
          </div>
        </div>
      )}

      {/* CONTENT: TABEL KONTINGENSI */}
      {activeTab === 'kontingensi' && (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface font-semibold border-b border-outline-variant/60">
                  <th rowSpan={2} className="py-3 px-3 text-left border-r border-outline-variant/40">
                    Tipe Pelanggan (Baris)
                  </th>
                  <th colSpan={4} className="py-2 px-3 border-b border-outline-variant/40">
                    Metode Pembayaran (Kolom)
                  </th>
                  <th rowSpan={2} className="py-3 px-3 bg-primary-fixed/20 text-primary border-l border-outline-variant/40">
                    Total Baris
                  </th>
                </tr>
                <tr className="bg-surface-container-low/70 text-on-surface-variant text-[11px] border-b border-outline-variant/60">
                  {contingencyData.metode.map((m, i) => (
                    <th key={i} className="py-1.5 px-2.5 font-medium">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {contingencyData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-surface-container-low/40">
                    <td className="py-2.5 px-3 text-left font-bold text-on-surface border-r border-outline-variant/40">
                      {row.tipe}
                    </td>
                    {row.values.map((val, cIdx) => {
                      let cellText = `${val}`;
                      if (contingencyMode === 'persen-total') {
                        cellText = `${((val / contingencyData.grandTotal) * 100).toFixed(1)}%`;
                      } else if (contingencyMode === 'persen-baris') {
                        cellText = `${((val / row.total) * 100).toFixed(1)}%`;
                      } else if (contingencyMode === 'persen-kolom') {
                        cellText = `${((val / contingencyData.colTotals[cIdx]) * 100).toFixed(1)}%`;
                      }

                      return (
                        <td key={cIdx} className="py-2.5 px-2.5 font-mono">
                          <span className={`px-2 py-0.5 rounded ${val >= 35 ? 'bg-primary-fixed/40 font-bold text-primary' : ''}`}>
                            {cellText}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 font-mono font-bold text-primary border-l border-outline-variant/40 bg-surface-container-low/40">
                      {contingencyMode === 'persen-baris'
                        ? '100.0%'
                        : contingencyMode === 'persen-total'
                        ? `${((row.total / contingencyData.grandTotal) * 100).toFixed(1)}%`
                        : row.total}
                    </td>
                  </tr>
                ))}
                {/* Total Column Row */}
                <tr className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/80">
                  <td className="py-2.5 px-3 text-left border-r border-outline-variant/40">Total Kolom</td>
                  {contingencyData.colTotals.map((cTot, cIdx) => (
                    <td key={cIdx} className="py-2.5 px-2.5 font-mono">
                      {contingencyMode === 'persen-kolom'
                        ? '100.0%'
                        : contingencyMode === 'persen-total'
                        ? `${((cTot / contingencyData.grandTotal) * 100).toFixed(1)}%`
                        : cTot}
                    </td>
                  ))}
                  <td className="py-2.5 px-3 font-mono text-primary border-l border-outline-variant/40 bg-primary-fixed/20">
                    {contingencyMode === 'frekuensi' ? contingencyData.grandTotal : '100.0%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <span className="material-symbols-outlined text-[15px]">info</span>
              <span>Intisari Tabel Kontingensi:</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              {contingencyMode === 'persen-baris' &&
                '💡 Persentase Baris: Memperlihatkan bahwa 50% Pelanggan Baru memakai E-Wallet, sedangkan Pelanggan Setia lebih banyak memakai Virtual Account (35%) dan Kartu Kredit (30%).'}
              {contingencyMode === 'persen-kolom' &&
                '💡 Persentase Kolom: Dari semua pengguna COD (n=30), sebanyak 83.3% adalah Pelanggan Baru! Sangat relevan untuk strategi manajemen risiko bisnis.'}
              {contingencyMode === 'persen-total' &&
                '💡 Persentase Total: 25% dari total seluruh transaksi adalah Pelanggan Baru yang menggunakan E-Wallet (50 dari 200).'}
              {contingencyMode === 'frekuensi' &&
                '💡 Angka mutlak amatan pada tiap sel. Klik opsi "% Baris" atau "% Kolom" di atas untuk melihat perbandingan proporsional.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. BAR CHART & PIE CHART VISUAL
// =========================================================================
export const BarPieChartVisual: React.FC = () => {
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [activeItem, setActiveItem] = useState<number | null>(null);

  const categories = [
    { label: 'Asus', count: 45, pct: 30.0, color: '#0d9488', degrees: 108 },
    { label: 'Lenovo', count: 40, pct: 26.7, color: '#14b8a6', degrees: 96 },
    { label: 'Apple (Mac)', count: 35, pct: 23.3, color: '#0284c7', degrees: 84 },
    { label: 'HP', count: 20, pct: 13.3, color: '#f59e0b', degrees: 48 },
    { label: 'Lainnya', count: 10, pct: 6.7, color: '#6b7280', degrees: 24 },
  ];

  // Cumulative angles for SVG pie chart rendering
  let cumulativeAngle = 0;
  const pieSlices = categories.map((cat) => {
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + cat.degrees;
    cumulativeAngle = endAngle;

    // Convert polar coordinates to Cartesian for SVG path
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    const x1 = 100 + 80 * Math.cos(startRad);
    const y1 = 100 + 80 * Math.sin(startRad);
    const x2 = 100 + 80 * Math.cos(endRad);
    const y2 = 100 + 80 * Math.sin(endRad);
    const largeArcFlag = cat.degrees > 180 ? 1 : 0;
    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return { ...cat, path, startAngle, endAngle };
  });

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              chartType === 'bar'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bar_chart</span>
            <span>Diagram Batang (Bar Chart)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              chartType === 'pie'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">pie_chart</span>
            <span>Diagram Lingkaran (Pie Chart)</span>
          </button>
        </div>

        <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline">
          Data: Merek Laptop 150 Mahasiswa
        </span>
      </div>

      {/* BAR CHART VIEW */}
      {chartType === 'bar' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span className="font-semibold text-on-surface">Sumbu Y: Persentase (%) / Frekuensi (n)</span>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Ada celah spasi antarbatang (variabel kategorikal terpisah)
              </span>
            </div>

            {/* Inline SVG Bar Chart with Y-Axis and numerical geometry */}
            <div className="w-full relative">
              <svg
                viewBox="0 0 540 260"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-auto overflow-visible select-none"
              >
                {/* Horizontal Gridlines & Y-Axis */}
                {[0, 10, 20, 30, 35].map((val) => {
                  const baseline = 210;
                  const usableH = 180;
                  const maxV = 35;
                  const y = baseline - (val / maxV) * usableH;
                  return (
                    <g key={val}>
                      <line
                        x1="45"
                        y1={y}
                        x2="520"
                        y2={y}
                        stroke="#cbd5e1"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                        opacity={val === 0 ? 0 : 0.7}
                      />
                      <text
                        x="38"
                        y={y + 4}
                        textAnchor="end"
                        fontSize="10"
                        fill="#64748b"
                        className="font-mono font-medium"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* Baseline (X-Axis) */}
                <line x1="42" y1="210" x2="525" y2="210" stroke="#475569" strokeWidth="1.5" />

                {/* Bars */}
                {categories.map((cat, idx) => {
                  const barWidth = 52;
                  const slotWidth = (520 - 45) / categories.length; // 95
                  const centerX = 45 + (idx + 0.5) * slotWidth;
                  const barHeight = (cat.pct / 35) * 180;
                  const x = centerX - barWidth / 2;
                  const y = 210 - barHeight;
                  const isHovered = activeItem === idx;

                  return (
                    <g
                      key={cat.label}
                      className="cursor-pointer group"
                      onMouseEnter={() => setActiveItem(idx)}
                      onMouseLeave={() => setActiveItem(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="4"
                        fill={cat.color}
                        opacity={activeItem === null || isHovered ? 1 : 0.65}
                        className="transition-all duration-200 hover:brightness-110"
                      />
                      {/* Top value label */}
                      <text
                        x={centerX}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#0f172a"
                        className="font-mono"
                      >
                        {cat.pct.toFixed(1)}%
                      </text>
                      {/* Category Label below X-axis */}
                      <text
                        x={centerX}
                        y="228"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#334155"
                      >
                        {cat.label}
                      </text>
                      <text
                        x={centerX}
                        y="242"
                        textAnchor="middle"
                        fontSize="9"
                        fill="#64748b"
                        className="font-medium"
                      >
                        n = {cat.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
              lightbulb
            </span>
            <span>
              <strong>Kaidah Kunci:</strong> Pada diagram batang data kategorikal, terdapat jeda kosong (spasi) yang jelas antarbatang untuk menegaskan bahwa setiap kategori berdiri sendiri dan bukan deretan angka kontinu.
            </span>
          </div>
        </div>
      )}

      {/* PIE CHART VIEW */}
      {chartType === 'pie' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-4 rounded-2xl bg-surface-container-low/60 border border-outline-variant/40">
          {/* SVG Pie */}
          <div className="md:col-span-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                {pieSlices.map((slice, idx) => (
                  <path
                    key={slice.label}
                    d={slice.path}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-105 origin-center"
                    onMouseEnter={() => setActiveItem(idx)}
                    onMouseLeave={() => setActiveItem(null)}
                  />
                ))}
                {/* Center circle for subtle donut look */}
                <circle cx="100" cy="100" r="30" fill="currentColor" className="text-surface-container-lowest" />
              </svg>
            </div>
            <span className="text-[11px] text-on-surface-variant mt-2 font-medium">
              Total 1 Lingkaran = 360° (100%)
            </span>
          </div>

          {/* Slices Breakdown / Legend */}
          <div className="md:col-span-6 space-y-2">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
              Konversi Sudut Derajat:
            </h4>
            <div className="space-y-1.5">
              {categories.map((cat, idx) => {
                const isHovered = activeItem === idx;
                return (
                  <div
                    key={cat.label}
                    onMouseEnter={() => setActiveItem(idx)}
                    onMouseLeave={() => setActiveItem(null)}
                    className={`p-2 rounded-xl border transition-all flex items-center justify-between text-xs cursor-pointer ${
                      isHovered
                        ? 'bg-surface-container-lowest border-primary shadow-xs'
                        : 'bg-surface-container-low border-outline-variant/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-on-surface">{cat.label}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-on-surface-variant">{cat.pct.toFixed(1)}%</span>
                      <span className="font-bold text-primary">
                        {(cat.pct * 3.6).toFixed(0)}°
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-on-surface-variant pt-2 leading-relaxed">
              <strong>Rumus sudut:</strong> Sudut = (Persentase / 100) × 360°. Misalnya Asus: 30% × 360° = 108°.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 3. PARETO CHART VISUAL (80/20 ANALYSIS)
// =========================================================================
export const ParetoChartVisual: React.FC = () => {
  const [show80Cutoff, setShow80Cutoff] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const paretoData = [
    { defect: 'Kemasan Rusak', f: 84, pct: 42.0, cumPct: 42.0 },
    { defect: 'Pengiriman Terlambat', f: 60, pct: 30.0, cumPct: 72.0 },
    { defect: 'Barang Tidak Sesuai', f: 30, pct: 15.0, cumPct: 87.0 },
    { defect: 'Respon CS Lambat', f: 16, pct: 8.0, cumPct: 95.0 },
    { defect: 'Kesalahan Invoice', f: 10, pct: 5.0, cumPct: 100.0 },
  ];
  const maxF = 100;

  return (
    <div className="space-y-4">
      {/* Top Banner and Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div>
          <div className="text-xs font-bold text-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">troubleshoot</span>
            <span>Analisis Pareto: Keluhan Pengiriman (Total n = 200)</span>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Batang terurut menurun (sumbu kiri) dipadu garis persentase kumulatif (sumbu kanan).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShow80Cutoff((prev) => !prev)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            show80Cutoff
              ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200'
              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {show80Cutoff ? 'check_box' : 'check_box_outline_blank'}
          </span>
          <span>Garis 80% (Vital Few)</span>
        </button>
      </div>

      {/* SVG Pareto Chart with dual axes */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
        <div className="relative h-64 sm:h-72 w-full">
          {/* SVG Canvas */}
          <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((level) => {
              const y = 200 - (level / 100) * 180;
              return (
                <g key={level}>
                  <line x1="35" y1={y} x2="465" y2={y} stroke="#94a3b8" strokeDasharray="3 3" opacity="0.3" />
                  {/* Left Axis label (f) */}
                  <text x="30" y={y + 3} textAnchor="end" fontSize="9" fill="#64748b">
                    {(level * maxF) / 100}
                  </text>
                  {/* Right Axis label (%) */}
                  <text x="470" y={y + 3} textAnchor="start" fontSize="9" fill="#0d9488">
                    {level}%
                  </text>
                </g>
              );
            })}

            {/* 80% Cut-off Line */}
            {show80Cutoff && (
              <g>
                <line
                  x1="35"
                  y1={200 - (80 / 100) * 180}
                  x2="465"
                  y2={200 - (80 / 100) * 180}
                  stroke="#e11d48"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <text x="250" y={200 - (80 / 100) * 180 - 6} textAnchor="middle" fontSize="10" fill="#e11d48" fontWeight="bold">
                  Batas 80% (Prinsip Pareto)
                </text>
              </g>
            )}

            {/* Bars for Each Category */}
            {paretoData.map((d, i) => {
              const barWidth = 56;
              const x = 55 + i * 82;
              const barHeight = (d.f / maxF) * 180;
              const y = 200 - barHeight;
              const isVitalFew = i < 2; // Kemasan Rusak & Pengiriman Terlambat

              return (
                <g
                  key={d.defect}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx="4"
                    fill={isVitalFew ? '#0e7c63' : '#64748b'}
                    opacity={hoveredIdx === null || hoveredIdx === i ? 0.9 : 0.4}
                    className="transition-all"
                  />
                  {/* Bar Value Top */}
                  <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
                    {d.f}
                  </text>
                  {/* Category Name Bottom */}
                  <text
                    x={x + barWidth / 2}
                    y="216"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#334155"
                    className="font-medium"
                  >
                    {d.defect.length > 12 ? d.defect.substring(0, 11) + '..' : d.defect}
                  </text>
                </g>
              );
            })}

            {/* Cumulative Percentage Polygon Line */}
            {(() => {
              const points = paretoData.map((d, i) => {
                const x = 55 + i * 82 + 28;
                const y = 200 - (d.cumPct / 100) * 180;
                return `${x},${y}`;
              });

              return (
                <g>
                  <polyline
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2.5"
                    points={points.join(' ')}
                  />
                  {paretoData.map((d, i) => {
                    const cx = 55 + i * 82 + 28;
                    const cy = 200 - (d.cumPct / 100) * 180;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="4.5" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0284c7">
                          {d.cumPct.toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      {/* Explanatory takeaway */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs space-y-1">
          <div className="font-bold text-teal-800 dark:text-teal-200 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Vital Few (20% Penyebab Kunci)</span>
          </div>
          <p className="text-teal-900/80 dark:text-teal-200/80 text-[11px] leading-relaxed">
            Hanya dengan menyelesaikan 2 masalah pertama (<strong>Kemasan Rusak &amp; Pengiriman Terlambat</strong>), perusahaan sudah menuntaskan <strong>72.0%</strong> dari seluruh keluhan pelanggan!
          </p>
        </div>

        <div className="p-3 bg-surface-container-low border border-outline-variant/50 rounded-xl text-xs space-y-1">
          <div className="font-bold text-on-surface flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">checklist</span>
            <span>Trivial Many (Masalah Sisa)</span>
          </div>
          <p className="text-on-surface-variant text-[11px] leading-relaxed">
            3 kategori sisanya hanya menyumbang 28.0% keluhan. Diagram Pareto memastikan tim bisnis tidak membuang energi berlebih pada faktor-faktor minor terlebih dahulu.
          </p>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. SIDE-BY-SIDE BAR CHART VISUAL
// =========================================================================
export const SideBySideBarVisual: React.FC = () => {
  const [metric, setMetric] = useState<'percent' | 'count'>('percent');

  const groups = [
    {
      media: 'Video Interaktif',
      y1: { count: 60, pct: 60 },
      y4: { count: 30, pct: 30 },
    },
    {
      media: 'E-Book / Modul Teks',
      y1: { count: 25, pct: 25 },
      y4: { count: 45, pct: 45 },
    },
    {
      media: 'Diskusi Forum / Kelompok',
      y1: { count: 15, pct: 15 },
      y4: { count: 25, pct: 25 },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-on-surface">Pilihan Media Belajar:</span>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-teal-600" />
              <span className="font-medium text-on-surface">Tahun 1 (Freshmen)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-blue-600" />
              <span className="font-medium text-on-surface">Tahun 4 (Senior)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setMetric('percent')}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
              metric === 'percent'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Persentase Kelompok (%)
          </button>
          <button
            onClick={() => setMetric('count')}
            className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition-colors ${
              metric === 'count'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            Jumlah Mahasiswa (n)
          </button>
        </div>
      </div>

      {/* Chart Visual - Inline SVG */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
        <div className="w-full relative">
          <svg
            viewBox="0 0 640 360"
            preserveAspectRatio="xMidYMid meet"
            className="w-full h-auto overflow-visible select-none"
          >
            {/* Horizontal Gridlines & Y-Axis Ticks */}
            {[0, 10, 20, 30, 40, 50, 60, 70].map((val) => {
              const baseline = 290;
              const usableHeight = 260;
              const maxVal = 70;
              const y = baseline - (val / maxVal) * usableHeight;
              const leftMargin = 60;
              const rightMargin = 600;

              return (
                <g key={val}>
                  <line
                    x1={leftMargin}
                    y1={y}
                    x2={rightMargin}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                    opacity={val === 0 ? 0 : 0.7}
                  />
                  <text
                    x={leftMargin - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="#64748b"
                    className="font-mono font-medium"
                  >
                    {val}
                    {metric === 'percent' ? '%' : ''}
                  </text>
                </g>
              );
            })}

            {/* Baseline (X-Axis solid line) */}
            <line
              x1={56}
              y1={290}
              x2={608}
              y2={290}
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* Clustered Bars for Each Category */}
            {groups.map((g, idx) => {
              const clusterCenters = [160, 330, 500];
              const center = clusterCenters[idx];
              const barWidth = 36;
              const barGap = 4;
              const baseline = 290;
              const usableHeight = 260;
              const maxVal = 70;

              const val1 = metric === 'percent' ? g.y1.pct : g.y1.count;
              const val2 = metric === 'percent' ? g.y4.pct : g.y4.count;

              const barH1 = (val1 / maxVal) * usableHeight;
              const bar1X = center - barWidth - barGap / 2;
              const bar1Y = baseline - barH1;

              const barH2 = (val2 / maxVal) * usableHeight;
              const bar2X = center + barGap / 2;
              const bar2Y = baseline - barH2;

              return (
                <g key={g.media}>
                  {/* BAR 1: Tahun 1 (Teal #0d9488) */}
                  <g className="cursor-pointer group">
                    <rect
                      x={bar1X}
                      y={bar1Y}
                      width={barWidth}
                      height={barH1}
                      rx="3"
                      fill="#0d9488"
                      className="transition-all duration-200 hover:brightness-110"
                    />
                    {/* Value label above Bar 1: dark teal, high contrast */}
                    <text
                      x={bar1X + barWidth / 2}
                      y={bar1Y - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#0f766e"
                      className="font-mono"
                    >
                      {val1}
                      {metric === 'percent' ? '%' : ''}
                    </text>
                  </g>

                  {/* BAR 2: Tahun 4 (Royal Blue #2563eb) */}
                  <g className="cursor-pointer group">
                    <rect
                      x={bar2X}
                      y={bar2Y}
                      width={barWidth}
                      height={barH2}
                      rx="3"
                      fill="#2563eb"
                      className="transition-all duration-200 hover:brightness-110"
                    />
                    {/* Value label above Bar 2: dark blue, high contrast */}
                    <text
                      x={bar2X + barWidth / 2}
                      y={bar2Y - 6}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#1d4ed8"
                      className="font-mono"
                    >
                      {val2}
                      {metric === 'percent' ? '%' : ''}
                    </text>
                  </g>

                  {/* Category Label Below Baseline */}
                  <text
                    x={center}
                    y={315}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="600"
                    fill="#334155"
                  >
                    {g.media}
                  </text>
                  <text
                    x={center}
                    y={332}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                    className="font-medium"
                  >
                    n = 100 mhs / angkatan
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
          insights
        </span>
        <span>
          <strong>Wawasan:</strong> Mahasiswa tahun pertama lebih dominan menyukai video interaktif (60%), sementara mahasiswa tingkat akhir bergeser lebih banyak membaca e-book teks dan berdiskusi untuk persiapan skripsi.
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// 5. STEM-AND-LEAF DISPLAY VISUAL
// =========================================================================
export const StemAndLeafVisual: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(3);
  const [selectedLeaf, setSelectedLeaf] = useState<{ stem: number; leaf: number } | null>({
    stem: 7,
    leaf: 5,
  });

  const rawData = [72, 65, 84, 52, 75, 91, 68, 78, 48, 80, 64, 75, 89, 57, 98, 71, 82, 87, 61, 95];
  const sortedData = [...rawData].sort((a, b) => a - b);

  const stemLeafMap: Record<number, number[]> = {
    4: [8],
    5: [2, 7],
    6: [1, 4, 5, 8],
    7: [1, 2, 5, 5, 8],
    8: [0, 2, 4, 7, 9],
    9: [1, 5, 8],
  };

  return (
    <div className="space-y-4">
      {/* Step Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="text-xs font-bold text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">account_tree</span>
          <span>Transformasi: Nilai Ujian 20 Mahasiswa</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setStep(1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              step === 1 ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            1. Data Mentah
          </button>
          <button
            onClick={() => setStep(2)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              step === 2 ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            2. Susunan Terurut
          </button>
          <button
            onClick={() => setStep(3)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              step === 3 ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            3. Stem-and-Leaf
          </button>
        </div>
      </div>

      {/* STEP 1: RAW DATA */}
      {step === 1 && (
        <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-3">
          <div className="text-xs font-semibold text-on-surface flex items-center justify-between">
            <span>20 Angka Nilai Ujian (Belum Terurut):</span>
            <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Sulit melihat bentuk sebaran dan rentang nilai
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {rawData.map((num, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/60 font-mono text-xs font-bold text-on-surface shadow-2xs"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: ORDERED ARRAY */}
      {step === 2 && (
        <div className="p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-on-surface">Data Terurut (Ordered Array): Min = 48 s/d Max = 98</span>
            <span className="font-mono text-primary font-bold">Range = 98 - 48 = 50</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedData.map((num, i) => (
              <span
                key={i}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold shadow-2xs ${
                  i === 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : i === sortedData.length - 1
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-surface-container-lowest border border-outline-variant/60 text-on-surface'
                }`}
              >
                {num}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Data sudah terurut, namun jika jumlah amatan mencapai ratusan, daftar angka panjang ini tetap sulit dicerna tanpa perangkuman visual.
          </p>
        </div>
      )}

      {/* STEP 3: STEM AND LEAF DISPLAY */}
      {step === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-on-surface pb-1 border-b border-outline-variant">
              <span className="w-16">Batang (Stem)</span>
              <span className="flex-1 pl-4">Daun (Leaves)</span>
            </div>

            <div className="space-y-1 font-mono text-sm">
              {Object.entries(stemLeafMap).map(([stemStr, leaves]) => {
                const stemNum = parseInt(stemStr, 10);
                return (
                  <div key={stemNum} className="flex items-center py-1 hover:bg-surface-container rounded-lg px-1">
                    <span className="w-16 font-bold text-primary text-center bg-primary-fixed/30 py-0.5 rounded">
                      {stemNum}
                    </span>
                    <span className="text-outline-variant px-3 font-light text-base">|</span>
                    <div className="flex flex-wrap items-center gap-2 pl-1">
                      {leaves.map((leaf, lIdx) => {
                        const isSelected = selectedLeaf?.stem === stemNum && selectedLeaf?.leaf === leaf;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => setSelectedLeaf({ stem: stemNum, leaf })}
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs transition-transform ${
                              isSelected
                                ? 'bg-primary text-on-primary ring-2 ring-primary/40 scale-110'
                                : 'bg-surface-container-lowest text-on-surface hover:bg-primary-fixed/40'
                            }`}
                          >
                            {leaf}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key / Legend */}
            <div className="mt-3 pt-3 border-t border-surface-container flex items-center justify-between text-xs">
              <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-2.5 py-1 rounded-md border border-outline-variant/60 font-mono font-bold text-primary">
                Kunci: 7 | 5 = 75
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Klik salah satu digit daun di atas
              </span>
            </div>
          </div>

          {/* Interactive Inspection Card */}
          <div className="md:col-span-5 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-[17px]">search</span>
              <span>Pemeriksaan Titik Data</span>
            </div>

            {selectedLeaf ? (
              <div className="space-y-2 text-xs">
                <div className="text-2xl font-bold font-mono text-on-surface">
                  Nilai: {selectedLeaf.stem * 10 + selectedLeaf.leaf}
                </div>
                <div className="space-y-1 text-on-surface-variant text-[11px] leading-relaxed">
                  <div>
                    • <strong>Digit Batang (Stem):</strong> {selectedLeaf.stem} (Puluhan = {selectedLeaf.stem * 10})
                  </div>
                  <div>
                    • <strong>Digit Daun (Leaf):</strong> {selectedLeaf.leaf} (Satuan = {selectedLeaf.leaf})
                  </div>
                  <div className="pt-1 text-teal-800 dark:text-teal-300 font-medium">
                    Nilai data asli tetap utuh 100%! Jika layar dimiringkan 90° ke kiri, deretan daun membentuk histogram kurva lonceng.
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 6. DISTRIBUSI FREKUENSI & KELAS INTERVAL VISUAL
// =========================================================================
export const DistribusiFrekuensiVisual: React.FC = () => {
  const [numClasses, setNumClasses] = useState<number>(5);

  // Range = 320 - 120 = 200
  // n = 50 amatan waktu layanan tiket
  const classConfigs: Record<
    number,
    {
      width: number;
      classes: { interval: string; min: number; max: number; mid: number; f: number; cumF: number }[];
    }
  > = {
    4: {
      width: 50,
      classes: [
        { interval: '120 s/d < 170', min: 120, max: 170, mid: 145, f: 10, cumF: 10 },
        { interval: '170 s/d < 220', min: 170, max: 220, mid: 195, f: 22, cumF: 32 },
        { interval: '220 s/d < 270', min: 220, max: 270, mid: 245, f: 12, cumF: 44 },
        { interval: '270 s/d < 320', min: 270, max: 320, mid: 295, f: 6, cumF: 50 },
      ],
    },
    5: {
      width: 40,
      classes: [
        { interval: '120 s/d < 160', min: 120, max: 160, mid: 140, f: 7, cumF: 7 },
        { interval: '160 s/d < 200', min: 160, max: 200, mid: 180, f: 18, cumF: 25 },
        { interval: '200 s/d < 240', min: 200, max: 240, mid: 220, f: 14, cumF: 39 },
        { interval: '240 s/d < 280', min: 240, max: 280, mid: 260, f: 7, cumF: 46 },
        { interval: '280 s/d < 320', min: 280, max: 320, mid: 300, f: 4, cumF: 50 },
      ],
    },
    6: {
      width: 35,
      classes: [
        { interval: '120 s/d < 155', min: 120, max: 155, mid: 137.5, f: 6, cumF: 6 },
        { interval: '155 s/d < 190', min: 155, max: 190, mid: 172.5, f: 15, cumF: 21 },
        { interval: '190 s/d < 225', min: 190, max: 225, mid: 207.5, f: 14, cumF: 35 },
        { interval: '225 s/d < 260', min: 225, max: 260, mid: 242.5, f: 8, cumF: 43 },
        { interval: '260 s/d < 295', min: 260, max: 295, mid: 277.5, f: 5, cumF: 48 },
        { interval: '295 s/d < 330', min: 295, max: 330, mid: 312.5, f: 2, cumF: 50 },
      ],
    },
  };

  const currentCfg = classConfigs[numClasses];
  const totalN = 50;

  return (
    <div className="space-y-4">
      {/* Dynamic Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div>
          <span className="text-xs font-bold text-on-surface">Data: Waktu Layanan Tiket (n = 50 amatan)</span>
          <p className="text-[11px] text-on-surface-variant font-mono">
            Nilai Min = 120 detik, Nilai Maks = 320 detik (Range = 200 detik)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-on-surface-variant font-medium">Pilih Jumlah Kelas (k):</span>
          <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl">
            {[4, 5, 6].map((k) => (
              <button
                key={k}
                onClick={() => setNumClasses(k)}
                className={`w-8 h-7 rounded-lg text-xs font-bold transition-all ${
                  numClasses === k
                    ? 'bg-primary text-on-primary shadow-2xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Math Banner */}
      <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-primary">
          Perhitungan Lebar Kelas: w = Range / k = 200 / {numClasses} = {currentCfg.width} detik
        </span>
        <span className="text-[11px] text-on-surface-variant">
          Semua kelas memiliki interval sama tanpa jeda kosong
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/60">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low text-on-surface font-semibold border-b border-outline-variant/60">
              <th className="py-2.5 px-3">Interval Kelas</th>
              <th className="py-2.5 px-3 text-center">Titik Tengah (Xi)</th>
              <th className="py-2.5 px-3 text-right">Frekuensi (f)</th>
              <th className="py-2.5 px-3 text-right">Frekuensi Relatif</th>
              <th className="py-2.5 px-3 text-right">Persentase (%)</th>
              <th className="py-2.5 px-3 text-right">Kumulatif (f)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {currentCfg.classes.map((cls, idx) => (
              <tr key={idx} className="hover:bg-surface-container-low/50">
                <td className="py-2 px-3 font-mono font-medium text-on-surface">{cls.interval}</td>
                <td className="py-2 px-3 font-mono text-center text-primary font-semibold">{cls.mid}</td>
                <td className="py-2 px-3 font-mono text-right font-bold text-on-surface">{cls.f}</td>
                <td className="py-2 px-3 font-mono text-right text-on-surface-variant">
                  {(cls.f / totalN).toFixed(2)}
                </td>
                <td className="py-2 px-3 font-mono text-right text-primary font-bold">
                  {((cls.f / totalN) * 100).toFixed(1)}%
                </td>
                <td className="py-2 px-3 font-mono text-right text-on-surface-variant font-semibold">
                  {cls.cumF}
                </td>
              </tr>
            ))}
            <tr className="bg-surface-container-low font-bold text-on-surface border-t-2 border-outline-variant/80">
              <td className="py-2 px-3">Total (n)</td>
              <td className="py-2 px-3 text-center">-</td>
              <td className="py-2 px-3 text-right font-mono">{totalN}</td>
              <td className="py-2 px-3 text-right font-mono">1.00</td>
              <td className="py-2 px-3 text-right font-mono text-primary">100.0%</td>
              <td className="py-2 px-3 text-right font-mono">{totalN}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// =========================================================================
// 7. HISTOGRAM & FREQUENCY POLYGON VISUAL
// =========================================================================
export const HistogramPolygonVisual: React.FC = () => {
  const [viewMode, setViewMode] = useState<'both' | 'hist' | 'polygon'>('both');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const classes = [
    { label: '120-160', mid: 140, f: 7, pct: 14 },
    { label: '160-200', mid: 180, f: 18, pct: 36 },
    { label: '200-240', mid: 220, f: 14, pct: 28 },
    { label: '240-280', mid: 260, f: 7, pct: 14 },
    { label: '280-320', mid: 300, f: 4, pct: 8 },
  ];
  const maxF = 20;

  return (
    <div className="space-y-4">
      {/* Toggle Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'both' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Kombinasi (Histogram + Poligon)
          </button>
          <button
            onClick={() => setViewMode('hist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'hist' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Hanya Histogram
          </button>
          <button
            onClick={() => setViewMode('polygon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'polygon' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Hanya Poligon
          </button>
        </div>

        <span className="text-[11px] text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
          Batang saling menempel tanpa celah (data kontinu)
        </span>
      </div>

      {/* SVG Canvas for Histogram & Polygon */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
        <div className="relative h-64 sm:h-72 w-full">
          <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
            {/* Grid Lines */}
            {[0, 5, 10, 15, 20].map((val) => {
              const y = 200 - (val / maxF) * 180;
              return (
                <g key={val}>
                  <line x1="40" y1={y} x2="480" y2={y} stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.6" />
                  <text x="35" y={y + 3} textAnchor="end" fontSize="9" fill="#64748b">
                    {val}
                  </text>
                </g>
              );
            })}

            {/* HISTOGRAM BARS (Touching each other, 80px width each) */}
            {(viewMode === 'both' || viewMode === 'hist') &&
              classes.map((c, i) => {
                const barWidth = 80;
                const x = 50 + i * barWidth;
                const barHeight = (c.f / maxF) * 180;
                const y = 200 - barHeight;
                const isHovered = hoveredIdx === i;

                return (
                  <g
                    key={c.label}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill={isHovered ? '#0d9488' : '#14b8a6'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      opacity={0.85}
                    />
                    <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a">
                      f = {c.f}
                    </text>
                    {/* Class boundary mark */}
                    <text x={x} y="214" textAnchor="middle" fontSize="8" fill="#64748b">
                      {120 + i * 40}
                    </text>
                  </g>
                );
              })}

            {/* End boundary label for last bar */}
            <text x={50 + 5 * 80} y="214" textAnchor="middle" fontSize="8" fill="#64748b">
              320
            </text>

            {/* FREQUENCY POLYGON LINE */}
            {(viewMode === 'both' || viewMode === 'polygon') && (() => {
              // Points: includes anchor 0 on left midpoint (100) and right midpoint (340)
              const barWidth = 80;
              const leftAnchor = `10,200`;
              const classPoints = classes.map((c, i) => {
                const cx = 50 + i * barWidth + barWidth / 2;
                const cy = 200 - (c.f / maxF) * 180;
                return `${cx},${cy}`;
              });
              const rightAnchor = `${50 + 5 * barWidth + 40},200`;
              const allPoints = [leftAnchor, ...classPoints, rightAnchor].join(' ');

              return (
                <g>
                  <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={allPoints} />
                  {classes.map((c, i) => {
                    const cx = 50 + i * barWidth + barWidth / 2;
                    const cy = 200 - (c.f / maxF) * 180;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="4" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx} y="228" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7">
                          M={c.mid}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
          tips_and_updates
        </span>
        <span>
          <strong>Perhatikan:</strong> Garis poligon biru terhubung tepat di puncak titik tengah (midpoint) tiap batang, dan kedua ujung garis ditutup turun ke frekuensi 0 pada sumbu horizontal.
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// 8. OGIVE CURVE VISUAL (CUMULATIVE PERCENTAGE POLYGON)
// =========================================================================
export const OgiveCurveVisual: React.FC = () => {
  const [selectedQuartile, setSelectedQuartile] = useState<'q1' | 'median' | 'q3' | null>('median');

  const ogivePoints = [
    { xVal: 120, cumPct: 0 },
    { xVal: 160, cumPct: 14 },
    { xVal: 200, cumPct: 50 },
    { xVal: 240, cumPct: 78 },
    { xVal: 280, cumPct: 92 },
    { xVal: 320, cumPct: 100 },
  ];

  return (
    <div className="space-y-4">
      {/* Quartile Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <span className="text-xs font-bold text-on-surface">Cari Nilai Posisi Persentil:</span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedQuartile('q1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedQuartile === 'q1' ? 'bg-primary text-on-primary shadow-2xs' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            Kuartil 1 (Q1: 25%)
          </button>
          <button
            onClick={() => setSelectedQuartile('median')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedQuartile === 'median' ? 'bg-primary text-on-primary shadow-2xs' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            Median (Q2: 50%)
          </button>
          <button
            onClick={() => setSelectedQuartile('q3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedQuartile === 'q3' ? 'bg-primary text-on-primary shadow-2xs' : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            Kuartil 3 (Q3: 75%)
          </button>
        </div>
      </div>

      {/* SVG Canvas for Ogive */}
      <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
        <div className="relative h-64 sm:h-72 w-full">
          <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
            {/* Grid lines (0% to 100%) */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const y = 200 - (pct / 100) * 180;
              return (
                <g key={pct}>
                  <line x1="45" y1={y} x2="465" y2={y} stroke="#cbd5e1" strokeDasharray="3 3" opacity="0.6" />
                  <text x="40" y={y + 3} textAnchor="end" fontSize="9" fill="#64748b">
                    {pct}%
                  </text>
                </g>
              );
            })}

            {/* Ogive Line */}
            {(() => {
              const svgPts = ogivePoints.map((pt, i) => {
                const x = 50 + i * 80;
                const y = 200 - (pt.cumPct / 100) * 180;
                return `${x},${y}`;
              });

              return (
                <g>
                  <polyline fill="none" stroke="#0e7c63" strokeWidth="3" points={svgPts.join(' ')} />
                  {ogivePoints.map((pt, i) => {
                    const cx = 50 + i * 80;
                    const cy = 200 - (pt.cumPct / 100) * 180;
                    return (
                      <g key={i}>
                        <circle cx={cx} cy={cy} r="4.5" fill="#0e7c63" stroke="#ffffff" strokeWidth="2" />
                        <text x={cx} y="214" textAnchor="middle" fontSize="9" fill="#334155" fontWeight="bold">
                          {pt.xVal}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}

            {/* Quartile Guide Lines */}
            {selectedQuartile === 'median' && (() => {
              const y50 = 200 - (50 / 100) * 180;
              const x50 = 50 + 2 * 80; // at 200
              return (
                <g>
                  <line x1="45" y1={y50} x2={x50} y2={y50} stroke="#e11d48" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1={x50} y1={y50} x2={x50} y2="200" stroke="#e11d48" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx={x50} cy={y50} r="6" fill="#e11d48" />
                  <text x={x50 + 8} y={y50 - 8} fontSize="10" fontWeight="bold" fill="#e11d48">
                    Median = 200 detik
                  </text>
                </g>
              );
            })()}

            {selectedQuartile === 'q1' && (() => {
              const y25 = 200 - (25 / 100) * 180;
              const x25 = 50 + 1 * 80 + 24; // ~172
              return (
                <g>
                  <line x1="45" y1={y25} x2={x25} y2={y25} stroke="#0284c7" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1={x25} y1={y25} x2={x25} y2="200" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx={x25} cy={y25} r="6" fill="#0284c7" />
                  <text x={x25 + 8} y={y25 - 8} fontSize="10" fontWeight="bold" fill="#0284c7">
                    Q1 ≈ 172 detik (25%)
                  </text>
                </g>
              );
            })()}

            {selectedQuartile === 'q3' && (() => {
              const y75 = 200 - (75 / 100) * 180;
              const x75 = 50 + 2 * 80 + 72; // ~236
              return (
                <g>
                  <line x1="45" y1={y75} x2={x75} y2={y75} stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <line x1={x75} y1={y75} x2={x75} y2="200" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx={x75} cy={y75} r="6" fill="#d97706" />
                  <text x={x75 + 8} y={y75 - 8} fontSize="10" fontWeight="bold" fill="#d97706">
                    Q3 ≈ 236 detik (75%)
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>
      </div>

      <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
          insights
        </span>
        <span>
          <strong>Keunggulan Kurva Ogive:</strong> Memberikan jawaban instan untuk pertanyaan seperti <em>&ldquo;Berapa persentase tiket yang selesai dalam waktu kurang dari 200 detik?&rdquo;</em> (Jawab: tepat 50%).
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// 9. SCATTER PLOT & TIME SERIES PLOT VISUAL
// =========================================================================
export const ScatterTimeSeriesVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scatter' | 'timeseries'>('scatter');
  const [scatterType, setScatterType] = useState<'positif' | 'negatif' | 'nol'>('positif');

  const positiveScatter = [
    { x: 1, y: 55 }, { x: 2, y: 60 }, { x: 2.5, y: 68 }, { x: 3, y: 70 },
    { x: 3.5, y: 75 }, { x: 4, y: 82 }, { x: 5, y: 88 }, { x: 6, y: 95 },
  ];

  const negativeScatter = [
    { x: 1, y: 92 }, { x: 2, y: 85 }, { x: 3, y: 76 }, { x: 4, y: 68 },
    { x: 5, y: 58 }, { x: 6, y: 48 }, { x: 7, y: 40 }, { x: 8, y: 32 },
  ];

  const zeroScatter = [
    { x: 1, y: 70 }, { x: 2, y: 45 }, { x: 2.5, y: 88 }, { x: 3.5, y: 55 },
    { x: 4, y: 90 }, { x: 5, y: 65 }, { x: 5.5, y: 40 }, { x: 6.5, y: 75 },
  ];

  const timeSeriesData = [
    { bulan: 'Jan', val: 420 },
    { bulan: 'Feb', val: 460 },
    { bulan: 'Mar', val: 450 },
    { bulan: 'Apr', val: 510 },
    { bulan: 'Mei', val: 540 },
    { bulan: 'Jun', val: 580 },
    { bulan: 'Jul', val: 620 },
    { bulan: 'Agu', val: 610 },
    { bulan: 'Sep', val: 680 },
    { bulan: 'Okt', val: 720 },
    { bulan: 'Nov', val: 750 },
    { bulan: 'Des', val: 820 },
  ];

  const currentPoints =
    scatterType === 'positif' ? positiveScatter : scatterType === 'negatif' ? negativeScatter : zeroScatter;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setActiveTab('scatter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scatter' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Diagram Pencar (Scatter Plot)
          </button>
          <button
            onClick={() => setActiveTab('timeseries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timeseries' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Grafik Runtun Waktu (Time Series)
          </button>
        </div>

        {activeTab === 'scatter' && (
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setScatterType('positif')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                scatterType === 'positif' ? 'bg-teal-600 text-white' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              Korelasi Positif (+)
            </button>
            <button
              onClick={() => setScatterType('negatif')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                scatterType === 'negatif' ? 'bg-rose-600 text-white' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              Korelasi Negatif (-)
            </button>
            <button
              onClick={() => setScatterType('nol')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                scatterType === 'nol' ? 'bg-amber-600 text-white' : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              Tanpa Hubungan (0)
            </button>
          </div>
        )}
      </div>

      {/* SCATTER PLOT VIEW */}
      {activeTab === 'scatter' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
            <div className="relative h-60 w-full">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Axes */}
                <line x1="40" y1="180" x2="480" y2="180" stroke="#64748b" strokeWidth="2" />
                <line x1="40" y1="20" x2="40" y2="180" stroke="#64748b" strokeWidth="2" />

                <text x="260" y="205" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155">
                  Variabel X: Jam Belajar Mandiri per Minggu
                </text>
                <text x="25" y="100" textAnchor="middle" transform="rotate(-90 25 100)" fontSize="10" fontWeight="bold" fill="#334155">
                  Variabel Y: Nilai Ujian
                </text>

                {/* Points */}
                {currentPoints.map((pt, idx) => {
                  const cx = 40 + (pt.x / 8) * 420;
                  const cy = 180 - (pt.y / 100) * 150;
                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="6"
                      fill={scatterType === 'positif' ? '#0d9488' : scatterType === 'negatif' ? '#e11d48' : '#d97706'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  );
                })}

                {/* Trendline */}
                {scatterType === 'positif' && (
                  <line x1="80" y1="160" x2="440" y2="40" stroke="#0d9488" strokeWidth="2" strokeDasharray="5 5" />
                )}
                {scatterType === 'negatif' && (
                  <line x1="80" y1="40" x2="440" y2="160" stroke="#e11d48" strokeWidth="2" strokeDasharray="5 5" />
                )}
              </svg>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant">
            {scatterType === 'positif' &&
              '📈 Korelasi Positif: Titik-titik condong naik dari kiri bawah ke kanan atas. Semakin banyak jam belajar, semakin tinggi nilai ujian.'}
            {scatterType === 'negatif' &&
              '📉 Korelasi Negatif: Titik-titik condong turun dari kiri atas ke kanan bawah. Hubungan berlawanan arah.'}
            {scatterType === 'nol' &&
              '⚪ Tanpa Korelasi: Titik-titik tersebar acak tanpa pola garis yang jelas. Tidak ada asosiasi linear antarkedua variabel.'}
          </div>
        </div>
      )}

      {/* TIME SERIES VIEW */}
      {activeTab === 'timeseries' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-6 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60">
            <div className="relative h-60 w-full">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                {[400, 600, 800].map((val) => {
                  const y = 180 - ((val - 350) / 500) * 150;
                  return (
                    <g key={val}>
                      <line x1="35" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <text x="30" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Line chart connecting points */}
                {(() => {
                  const pts = timeSeriesData.map((d, i) => {
                    const cx = 45 + i * 38;
                    const cy = 180 - ((d.val - 350) / 500) * 150;
                    return `${cx},${cy}`;
                  });

                  return (
                    <g>
                      <polyline fill="none" stroke="#0e7c63" strokeWidth="2.5" points={pts.join(' ')} />
                      {timeSeriesData.map((d, i) => {
                        const cx = 45 + i * 38;
                        const cy = 180 - ((d.val - 350) / 500) * 150;
                        return (
                          <g key={i}>
                            <circle cx={cx} cy={cy} r="4" fill="#0e7c63" stroke="#ffffff" strokeWidth="2" />
                            <text x={cx} y="196" textAnchor="middle" fontSize="8" fill="#475569" fontWeight="bold">
                              {d.bulan}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 text-xs text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
              trending_up
            </span>
            <span>
              <strong>Runtun Waktu (Time Series):</strong> Menampilkan data sepanjang garis waktu berurutan untuk mendeteksi tren kenaikan konsisten serta lonjakan musiman di akhir tahun.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 10. MISLEADING GRAPHS VS ETHICAL VISUALS
// =========================================================================
export const MisleadingGraphsVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'checklist'>('comparison');

  return (
    <div className="space-y-4">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'comparison' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Bandingkan Sumbu Terpotong (Truncated Axis)
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'checklist' ? 'bg-surface-container-lowest text-primary shadow-2xs' : 'text-on-surface-variant'
            }`}
          >
            Checklist Grafik Etis
          </button>
        </div>

        <span className="text-[11px] text-on-surface-variant font-medium hidden sm:inline">
          Kaidah Integritas Visual Data
        </span>
      </div>

      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* BAD: Truncated Y-Axis */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-rose-200 dark:border-rose-800">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  <span>Grafik Menyesatkan (Manipulatif)</span>
                </div>
                <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">
                  Sumbu Mulai 98
                </span>
              </div>

              {/* Chart */}
              <div className="h-44 flex items-end justify-center gap-8 pt-4 pb-2 border-b-2 border-rose-300 dark:border-rose-800 relative">
                {/* Product A */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold font-mono text-on-surface mb-1">100 unit</span>
                  <div className="w-14 bg-rose-400 rounded-t h-10" />
                  <span className="text-xs font-bold text-on-surface-variant mt-2">Produk A</span>
                </div>
                {/* Product B */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold font-mono text-rose-700 dark:text-rose-300 mb-1">
                    105 unit
                  </span>
                  <div className="w-14 bg-rose-600 rounded-t h-36" />
                  <span className="text-xs font-bold text-on-surface-variant mt-2">Produk B</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-100/60 dark:bg-rose-900/40 text-[11px] text-rose-900 dark:text-rose-200 leading-relaxed">
                ⚠️ <strong>Ilusi Palsu:</strong> Memotong sumbu Y di angka 98 membuat Produk B tampak <strong>3.5 kali lebih tinggi</strong> dari Produk A, padahal selisih aslinya hanya 5%!
              </div>
            </div>

            {/* GOOD: Full Axis from 0 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border-2 border-teal-300 dark:border-teal-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-teal-200 dark:border-teal-800">
                <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-200 font-bold text-xs uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Grafik Etis &amp; Objektif</span>
                </div>
                <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-mono font-bold">
                  Sumbu Mulai 0
                </span>
              </div>

              {/* Chart */}
              <div className="h-44 flex items-end justify-center gap-8 pt-4 pb-2 border-b-2 border-teal-300 dark:border-teal-800 relative">
                {/* Product A */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold font-mono text-on-surface mb-1">100 unit</span>
                  <div className="w-14 bg-teal-500 rounded-t h-32" />
                  <span className="text-xs font-bold text-on-surface-variant mt-2">Produk A</span>
                </div>
                {/* Product B */}
                <div className="flex flex-col items-center">
                  <span className="text-xs font-bold font-mono text-teal-800 dark:text-teal-200 mb-1">
                    105 unit
                  </span>
                  <div className="w-14 bg-teal-700 rounded-t h-34" />
                  <span className="text-xs font-bold text-on-surface-variant mt-2">Produk B</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-teal-100/60 dark:bg-teal-900/40 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
                ✅ <strong>Proporsi Jujur:</strong> Ketika sumbu Y dimulai dari nol, pembaca langsung memahami bahwa penjualan Produk A dan B sebenarnya setara dan selisihnya tipis.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-3">
          <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
            5 Pedoman Integritas Visual Menurut Standar Statistik:
          </h4>
          <div className="space-y-2.5">
            {[
              {
                num: 1,
                title: 'Mulai Sumbu Vertikal dari Nol',
                desc: 'Khususnya pada diagram batang (bar chart), jangan memotong sumbu vertikal agar rasio panjang batang mencerminkan rasio data yang sebenarnya.',
              },
              {
                num: 2,
                title: 'Gunakan Skala Linier yang Seragam',
                desc: 'Jarak antara angka 10 ke 20 harus sama dengan jarak antara 20 ke 30 pada diagram linier.',
              },
              {
                num: 3,
                title: 'Hindari Perspektif 3D yang Menipu (Chartjunk)',
                desc: 'Efek 3D pada diagram batang atau pie chart membuat irisan di depan terlihat lebih besar daripada irisan di belakang karena ilusi optik kedalaman.',
              },
              {
                num: 4,
                title: 'Cantumkan Judul, Label Sumbu, dan Satuan',
                desc: 'Sumbu tanpa satuan (misal Rupiah, Jam, atau Persen) membuat pembaca bingung atau keliru menafsirkan besaran.',
              },
              {
                num: 5,
                title: 'Sertakan Ukuran Sampel (n) dan Sumber Data',
                desc: 'Persentase 100% dari 2 responden memiliki bobot keandalan yang sangat berbeda dengan 100% dari 2.000 responden.',
              },
            ].map((item) => (
              <div key={item.num} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.num}
                </span>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-on-surface">{item.title}</div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
