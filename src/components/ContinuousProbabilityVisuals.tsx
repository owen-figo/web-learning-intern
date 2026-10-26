import React, { useState } from 'react';
import {
  normalPdf,
  normalCdf,
  zScore,
  uniformPdf,
  uniformMean,
  uniformVariance,
  uniformSd,
  uniformProb,
  exponentialPdf,
  exponentialCdf,
} from '../data/continuousSampleData';
import { RichText } from './RichText';

// =========================================================================
// 1. CONTINUOUS VS DISCRETE VISUAL
// =========================================================================
export const ContinuousVsDiscreteVisual: React.FC = () => {
  const [mode, setMode] = useState<'discrete' | 'continuous'>('continuous');
  const [contPoint, setContPoint] = useState<number>(10);
  const [contLow, setContLow] = useState<number>(8);
  const [contHigh, setContHigh] = useState<number>(12);

  // Discrete data: Jumlah pesanan (0, 1, 2, 3, 4)
  const discreteData = [
    { x: 0, p: 0.1 },
    { x: 1, p: 0.25 },
    { x: 2, p: 0.35 },
    { x: 3, p: 0.2 },
    { x: 4, p: 0.1 },
  ];
  const [selectedDisc, setSelectedDisc] = useState<number>(2);

  const contProbInterval = uniformProb(5, 15, contLow, contHigh);

  return (
    <div className="space-y-4">
      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-surface-container">
        <button
          type="button"
          onClick={() => setMode('continuous')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            mode === 'continuous'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Variabel Kontinu (Diukur dalam Rentang)
        </button>
        <button
          type="button"
          onClick={() => setMode('discrete')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            mode === 'discrete'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
          }`}
        >
          Variabel Diskrit (Dicacah per Titik)
        </button>
      </div>

      {mode === 'continuous' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3">
            <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Eksperimen Waktu Tunggu Bus (Rentang 5 s/d 15 Menit):
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Variabel kontinu dapat memuat tak hingga banyaknya nilai pecahan di antara dua angka. Karena itu,{' '}
              <strong className="text-on-surface font-semibold">peluang di satu titik tepat selalu NOL</strong>, dan peluang hanya bermakna pada{' '}
              <strong className="text-primary font-semibold">luas area interval</strong>.
            </p>

            {/* Visual SVG showing single point line vs interval area */}
            <div className="relative w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
              <svg viewBox="0 0 500 180" className="w-full h-full select-none overflow-visible">
                {/* Background Box for Uniform [5, 15] */}
                {/* x: 5 -> svgX: 80, x: 15 -> svgX: 440 (scale: 360 px / 10 = 36 px/unit) */}
                <rect x="80" y="40" width="360" height="90" fill="#e6e9e8" stroke="#6e7a74" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Shaded Interval [contLow, contHigh] */}
                {(() => {
                  const x1 = 80 + (Math.max(5, contLow) - 5) * 36;
                  const x2 = 80 + (Math.min(15, contHigh) - 5) * 36;
                  const width = Math.max(0, x2 - x1);
                  return (
                    <g>
                      <rect x={x1} y="40" width={width} height="90" fill="#97f4d5" opacity="0.85" stroke="#00614d" strokeWidth="2" />
                      {width > 20 && (
                        <text
                          x={x1 + width / 2}
                          y="90"
                          textAnchor="middle"
                          fontSize="13"
                          fontWeight="bold"
                          fill="#002118"
                        >
                          Luas = {(contProbInterval * 100).toFixed(1)}%
                        </text>
                      )}
                    </g>
                  );
                })()}

                {/* Point Needle for Single Point */}
                {(() => {
                  const px = 80 + (contPoint - 5) * 36;
                  return (
                    <g>
                      <line x1={px} y1="35" x2={px} y2="130" stroke="#ba1a1a" strokeWidth="2.5" strokeDasharray="3 2" />
                      <circle cx={px} cy="35" r="4" fill="#ba1a1a" />
                      <text x={px} y="25" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ba1a1a">
                        X = {contPoint}
                      </text>
                    </g>
                  );
                })()}

                {/* Baseline Axis */}
                <line x1="50" y1="130" x2="470" y2="130" stroke="#191c1c" strokeWidth="2" />
                {[5, 7, 9, 11, 13, 15].map((tick) => {
                  const tx = 80 + (tick - 5) * 36;
                  return (
                    <g key={tick}>
                      <line x1={tx} y1="130" x2={tx} y2="136" stroke="#191c1c" strokeWidth="1.5" />
                      <text x={tx} y="150" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                        {tick} mnt
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Sliders for comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Point Slider */}
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">Uji 1 Titik Tunggal (X = c):</span>
                  <span className="font-mono font-bold text-error">X = {contPoint} menit</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="15"
                  step="0.5"
                  value={contPoint}
                  onChange={(e) => setContPoint(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="p-2 bg-error-container/40 border border-error/20 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-error flex items-center justify-between">
                    <span>P(X = {contPoint}) =</span>
                    <span className="font-mono text-sm">0.0000 (0%)</span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Lebar garis titik tunggal adalah nol (Δx = 0), sehingga tidak memiliki luas area sama sekali.
                  </p>
                </div>
              </div>

              {/* Interval Slider */}
              <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">Uji Rentang Interval (c s/d d):</span>
                  <span className="font-mono font-bold text-primary">[{contLow}, {contHigh}] mnt</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-on-surface-variant">Batas Bawah (c):</label>
                    <input
                      type="range"
                      min="5"
                      max={contHigh - 0.5}
                      step="0.5"
                      value={contLow}
                      onChange={(e) => setContLow(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant">Batas Atas (d):</label>
                    <input
                      type="range"
                      min={contLow + 0.5}
                      max="15"
                      step="0.5"
                      value={contHigh}
                      onChange={(e) => setContHigh(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>
                </div>
                <div className="p-2 bg-primary-fixed/30 border border-primary/30 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-primary flex items-center justify-between">
                    <span>P({contLow} ≤ X ≤ {contHigh}) =</span>
                    <span className="font-mono text-sm text-black font-extrabold">
                      {contProbInterval.toFixed(4)} ({(contProbInterval * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    Luas area persegi = tinggi (0.10) × lebar ({contHigh - contLow}) = {contProbInterval.toFixed(2)}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/60 space-y-3">
            <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
              Bandingkan dengan Variabel Diskrit (Jumlah Pesanan):
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Pada variabel diskrit, nilai dicacah bulat terpisah (0, 1, 2, ...). Setiap titik nilai tunggal{' '}
              <strong className="text-on-surface font-semibold">memiliki nilai peluang tersendiri P(X = x) &gt; 0</strong> yang digambarkan oleh tinggi batang.
            </p>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {discreteData.map((d) => {
                const isSel = selectedDisc === d.x;
                return (
                  <button
                    key={d.x}
                    type="button"
                    onClick={() => setSelectedDisc(d.x)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between transition-all ${
                      isSel
                        ? 'bg-primary-fixed border-2 border-primary-container shadow-xs scale-105'
                        : 'bg-surface-container-lowest border-outline-variant/60 hover:bg-surface-container-low'
                    }`}
                  >
                    <span className="text-xs text-on-surface font-mono">X = {d.x}</span>
                    <div className="w-6 bg-primary/20 rounded-t my-2 flex items-end justify-center" style={{ height: '50px' }}>
                      <div className="w-full bg-primary rounded-t transition-all" style={{ height: `${d.p * 120}px` }} />
                    </div>
                    <span className="text-sm font-bold font-mono text-black">{(d.p * 100).toFixed(0)}%</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50 text-xs flex items-center justify-between">
              <span className="text-on-surface">Peluang terpilih titik X = {selectedDisc}:</span>
              <span className="font-mono font-extrabold text-sm text-primary">
                P(X = {selectedDisc}) = {discreteData.find((d) => d.x === selectedDisc)?.p.toFixed(2)} (
                {(discreteData.find((d) => d.x === selectedDisc)!.p * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Summary Banner */}
      <div className="p-3 rounded-xl bg-secondary-fixed/40 border border-secondary-fixed-dim text-xs space-y-1">
        <div className="font-bold text-black flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
          <span>Kesimpulan Konseptual Penting:</span>
        </div>
        <p className="text-on-surface text-xs leading-relaxed">
          Pada distribusi kontinu, <strong className="font-semibold text-black">P(X = c) = 0</strong> untuk sembarang titik pasti c. Konsekuensinya, <strong className="font-semibold text-black">P(c ≤ X ≤ d) = P(c &lt; X &lt; d)</strong> karena tanda pertidaksamaan tegas maupun longgar bernilai sama persis.
        </p>
      </div>
    </div>
  );
};

// =========================================================================
// 2. PDF AREA VISUAL
// =========================================================================
export const PdfAreaVisual: React.FC = () => {
  const [cVal, setCVal] = useState<number>(60);
  const [dVal, setDVal] = useState<number>(80);

  const mu = 70;
  const sigma = 10;

  const zC = zScore(cVal, mu, sigma);
  const zD = zScore(dVal, mu, sigma);

  const cdfC = normalCdf(zC);
  const cdfD = normalCdf(zD);

  const areaBetween = Math.max(0, cdfD - cdfC);
  const areaLeft = cdfC;
  const areaRight = 1 - cdfD;

  // Build SVG path for bell curve
  const points: { x: number; y: number }[] = [];
  const svgW = 460;
  const svgH = 140;
  const minX = 40;
  const maxX = 100;

  for (let x = minX; x <= maxX; x += 1) {
    const yVal = normalPdf(x, mu, sigma);
    // map x: 40..100 -> 30..430 px
    const px = 30 + ((x - minX) / (maxX - minX)) * (svgW - 60);
    // map yVal: 0..0.045 -> 130..15 px
    const py = 130 - (yVal / 0.045) * 115;
    points.push({ x: px, y: py });
  }

  const curveD = `M ${points[0].x} ${points[0].y} ` + points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Shaded area path
  const shadedPoints = points.filter((_, idx) => {
    const actualX = minX + idx;
    return actualX >= cVal && actualX <= dVal;
  });

  let shadedPath = '';
  if (shadedPoints.length > 0) {
    const first = shadedPoints[0];
    const last = shadedPoints[shadedPoints.length - 1];
    shadedPath =
      `M ${first.x.toFixed(1)} 130 L ${first.x.toFixed(1)} ${first.y.toFixed(1)} ` +
      shadedPoints.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
      ` L ${last.x.toFixed(1)} 130 Z`;
  }

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Luas Area di Bawah Kurva Kepadatan Peluang (PDF):
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black">
            Total Luas = 1.0000 (100%)
          </span>
        </div>

        {/* Responsive Curve SVG */}
        <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 160" className="w-full h-full select-none overflow-visible">
            {/* Shaded Area between c and d */}
            {shadedPath && <path d={shadedPath} fill="#97f4d5" opacity="0.85" />}

            {/* Complete Bell Curve Line */}
            <path d={curveD} fill="none" stroke="#00614d" strokeWidth="2.5" />

            {/* Baseline */}
            <line x1="20" y1="130" x2="440" y2="130" stroke="#191c1c" strokeWidth="1.5" />

            {/* Marker c */}
            {(() => {
              const cx = 30 + ((cVal - minX) / (maxX - minX)) * (svgW - 60);
              return (
                <g>
                  <line x1={cx} y1="30" x2={cx} y2="130" stroke="#0e7c63" strokeWidth="2" strokeDasharray="3 3" />
                  <text x={cx} y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
                    c = {cVal}
                  </text>
                </g>
              );
            })()}

            {/* Marker d */}
            {(() => {
              const dx = 30 + ((dVal - minX) / (maxX - minX)) * (svgW - 60);
              return (
                <g>
                  <line x1={dx} y1="30" x2={dx} y2="130" stroke="#0e7c63" strokeWidth="2" strokeDasharray="3 3" />
                  <text x={dx} y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
                    d = {dVal}
                  </text>
                </g>
              );
            })()}

            {/* Center Area Label */}
            {(() => {
              const midX = (cVal + dVal) / 2;
              const px = 30 + ((midX - minX) / (maxX - minX)) * (svgW - 60);
              return (
                <text x={px} y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#002118">
                  {(areaBetween * 100).toFixed(1)}%
                </text>
              );
            })()}
          </svg>
        </div>

        {/* Sliders for [c, d] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Bawah (c):</span>
              <span className="font-mono font-bold text-black">{cVal}</span>
            </div>
            <input
              type="range"
              min="40"
              max={dVal - 2}
              step="1"
              value={cVal}
              onChange={(e) => setCVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Atas (d):</span>
              <span className="font-mono font-bold text-black">{dVal}</span>
            </div>
            <input
              type="range"
              min={cVal + 2}
              max="100"
              step="1"
              value={dVal}
              onChange={(e) => setDVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* 3 Result Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Sayap Kiri P(X &lt; {cVal}):</span>
            <div className="text-lg font-bold font-mono text-black">{(areaLeft * 100).toFixed(2)}%</div>
            <span className="text-xs text-on-surface-variant font-mono">P = {areaLeft.toFixed(4)}</span>
          </div>

          <div className="p-3 rounded-xl bg-primary-fixed/30 border-2 border-primary/40 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Area Tengah P({cVal} ≤ X ≤ {dVal}):</span>
            <div className="text-xl font-extrabold font-mono text-black">{(areaBetween * 100).toFixed(2)}%</div>
            <span className="text-xs text-primary font-mono font-bold">P = {areaBetween.toFixed(4)}</span>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/50 space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Sayap Kanan P(X &gt; {dVal}):</span>
            <div className="text-lg font-bold font-mono text-black">{(areaRight * 100).toFixed(2)}%</div>
            <span className="text-xs text-on-surface-variant font-mono">P = {areaRight.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 3. NORMAL PDF VISUAL
// =========================================================================
export const NormalPdfVisual: React.FC = () => {
  const [mu, setMu] = useState<number>(70);
  const [sigma, setSigma] = useState<number>(10);
  const [xVal, setXVal] = useState<number>(80);

  const z = zScore(xVal, mu, sigma);
  const exponent = -0.5 * z * z;
  const expPart = Math.exp(exponent);
  const coef = 1 / (sigma * Math.sqrt(2 * Math.PI));
  const pdfVal = normalPdf(xVal, mu, sigma);
  const pdfPeak = normalPdf(mu, mu, sigma);

  // Generate SVG curve points
  const minX = mu - 3.5 * sigma;
  const maxX = mu + 3.5 * sigma;
  const svgW = 460;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i <= 60; i++) {
    const currX = minX + (i / 60) * (maxX - minX);
    const yVal = normalPdf(currX, mu, sigma);
    const px = 30 + (i / 60) * (svgW - 60);
    const py = 130 - (yVal / 0.05) * 115;
    points.push({ x: px, y: py });
  }

  const curveD = `M ${points[0].x} ${points[0].y} ` + points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Current point coordinates
  const currPx = 30 + ((xVal - minX) / (maxX - minX)) * (svgW - 60);
  const currPy = 130 - (pdfVal / 0.05) * 115;

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Eksplorasi Kurva Densitas Normal f(X):
        </div>

        {/* SVG Bell Curve */}
        <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 160" className="w-full h-full select-none overflow-visible">
            {/* Bell Curve Line */}
            <path d={curveD} fill="none" stroke="#00614d" strokeWidth="2.5" />

            {/* Center Axis (Mean) */}
            {(() => {
              const meanPx = 30 + 0.5 * (svgW - 60);
              return (
                <g>
                  <line x1={meanPx} y1="15" x2={meanPx} y2="130" stroke="#bdc9c3" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x={meanPx} y="146" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#00614d" fontFamily="monospace">
                    μ = {mu}
                  </text>
                </g>
              );
            })()}

            {/* Test Point Needle */}
            {currPx >= 20 && currPx <= svgW - 20 && (
              <g>
                <line x1={currPx} y1={currPy} x2={currPx} y2="130" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="2 2" />
                <circle cx={currPx} cy={currPy} r="5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1.5" />
                <text x={currPx} y={Math.max(20, currPy - 8)} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ba1a1a" fontFamily="monospace">
                  f({xVal}) = {pdfVal.toFixed(4)}
                </text>
                <text x={currPx} y="146" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ba1a1a" fontFamily="monospace">
                  X = {xVal}
                </text>
              </g>
            )}

            {/* Baseline */}
            <line x1="20" y1="130" x2="440" y2="130" stroke="#191c1c" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Mean (μ):</span>
              <span className="font-mono font-bold text-black">{mu}</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={mu}
              onChange={(e) => setMu(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Standar Deviasi (σ):</span>
              <span className="font-mono font-bold text-black">{sigma}</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={sigma}
              onChange={(e) => setSigma(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Nilai Amati (X):</span>
              <span className="font-mono font-bold text-error">{xVal}</span>
            </div>
            <input
              type="range"
              min={mu - 30}
              max={mu + 30}
              step="1"
              value={xVal}
              onChange={(e) => setXVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Step-by-step substitution card */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/50 space-y-2 text-xs">
          <div className="text-xs font-bold text-black uppercase tracking-wider">
            Substitusi Rumus PDF Normal Nyata f({xVal}):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-surface-container-low rounded-lg">
              1. Skor deviasi: ({xVal} − {mu}) / {sigma} = <span className="font-bold text-black">{z.toFixed(2)}</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg">
              2. Eksponen: −½ × ({z.toFixed(2)})² = <span className="font-bold text-black">{exponent.toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg">
              3. Nilai e^eksponen: e^({exponent.toFixed(2)}) = <span className="font-bold text-black">{expPart.toFixed(4)}</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-lg">
              4. Pengali 1 / (σ√(2π)) = <span className="font-bold text-black">{coef.toFixed(5)}</span>
            </div>
          </div>
          <div className="p-3 bg-primary-fixed/25 border border-primary/30 rounded-xl flex items-center justify-between font-mono">
            <span className="text-xs font-bold text-on-surface font-sans">Kepadatan f({xVal}) =</span>
            <span className="text-base font-extrabold text-black">{pdfVal.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 4. Z-TRANSFORMATION & TABLE VISUAL
// =========================================================================
export const ZTransformationVisual: React.FC = () => {
  const [xVal, setXVal] = useState<number>(85);
  const [direction, setDirection] = useState<'less' | 'greater' | 'between'>('less');

  const mu = 70;
  const sigma = 10;

  const z = zScore(xVal, mu, sigma);
  const pLess = normalCdf(z);
  const pGreater = 1 - pLess;

  // Between 60 and 80 check
  const z60 = zScore(60, mu, sigma);
  const z80 = zScore(80, mu, sigma);
  const pBetween = normalCdf(z80) - normalCdf(z60);

  // Table excerpt around z = 1.50
  const zRow = Math.floor(Math.abs(z) * 10) / 10;
  const zCol = Math.round((Math.abs(z) - zRow) * 100);

  const tableRows = [1.3, 1.4, 1.5, 1.6];
  const tableCols = [0.0, 0.01, 0.02];

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        {/* Toggle Direction */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-surface-container">
          <button
            type="button"
            onClick={() => setDirection('less')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              direction === 'less' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface'
            }`}
          >
            P(X ≤ {xVal}) — Kumulatif Kiri
          </button>
          <button
            type="button"
            onClick={() => setDirection('greater')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              direction === 'greater' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface'
            }`}
          >
            P(X &gt; {xVal}) — Komplemen Kanan
          </button>
          <button
            type="button"
            onClick={() => setDirection('between')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              direction === 'between' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface'
            }`}
          >
            P(60 ≤ X ≤ 80) — Rentang ±1σ
          </button>
        </div>

        {/* Dual Axis Diagram */}
        <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Transformasi Sumbu Asli (X) ke Sumbu Normal Standar (Z):
          </div>

          <div className="w-full h-40 sm:h-44">
            <svg viewBox="0 0 460 140" className="w-full h-full select-none overflow-visible">
              {/* Curve fill */}
              {(() => {
                const cutoffZ = direction === 'between' ? z80 : z;
                const startZ = direction === 'between' ? z60 : -3.5;
                const pts: { x: number; y: number }[] = [];

                for (let i = 0; i <= 60; i++) {
                  const currZ = -3.5 + (i / 60) * 7.0;
                  const px = 40 + (i / 60) * 380;
                  const yVal = normalPdf(currZ, 0, 1);
                  const py = 90 - (yVal / 0.45) * 80;
                  pts.push({ x: px, y: py });
                }

                // Shaded section
                const shaded = pts.filter((_, idx) => {
                  const currZ = -3.5 + (idx / 60) * 7.0;
                  if (direction === 'less') return currZ <= cutoffZ;
                  if (direction === 'greater') return currZ >= z;
                  return currZ >= z60 && currZ <= z80;
                });

                let sPath = '';
                if (shaded.length > 0) {
                  const first = shaded[0];
                  const last = shaded[shaded.length - 1];
                  sPath =
                    `M ${first.x.toFixed(1)} 90 L ${first.x.toFixed(1)} ${first.y.toFixed(1)} ` +
                    shaded.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
                    ` L ${last.x.toFixed(1)} 90 Z`;
                }

                const fullCurve = `M ${pts[0].x} ${pts[0].y} ` + pts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

                return (
                  <g>
                    {sPath && <path d={sPath} fill="#97f4d5" opacity="0.85" />}
                    <path d={fullCurve} fill="none" stroke="#00614d" strokeWidth="2" />
                  </g>
                );
              })()}

              {/* Baseline */}
              <line x1="30" y1="90" x2="430" y2="90" stroke="#191c1c" strokeWidth="1.5" />

              {/* Dual Ticks: X (top row) & Z (bottom row) */}
              {[-3, -2, -1, 0, 1, 2, 3].map((tZ) => {
                const tx = 40 + ((tZ + 3.5) / 7.0) * 380;
                const tX = mu + tZ * sigma;
                return (
                  <g key={tZ}>
                    <line x1={tx} y1="87" x2={tx} y2="93" stroke="#191c1c" strokeWidth="1.5" />
                    <text x={tx} y="106" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#00614d" fontFamily="monospace">
                      X={tX}
                    </text>
                    <text x={tx} y="122" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                      Z={tZ >= 0 ? `+${tZ}` : tZ}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Input slider */}
        {direction !== 'between' && (
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">Ubah Nilai Ujian (X):</span>
              <span className="font-mono font-bold text-black">
                X = {xVal} (Z = +{z.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={xVal}
              onChange={(e) => setXVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}

        {/* Z-Table Lookup Excerpt */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/50 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-black uppercase tracking-wider">
              Cuplikan Normal Probability Table (Z-Table):
            </span>
            <span className="font-mono text-xs text-primary font-bold">
              Cari Z = {z.toFixed(2)} → Baris {(Math.floor(z * 10) / 10).toFixed(1)}, Kolom .0{Math.round((z * 100) % 10)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/60">
                  <th className="p-2 text-left font-bold">Z</th>
                  {tableCols.map((col) => (
                    <th key={col} className={`p-2 text-center font-bold ${col === 0.0 ? 'bg-primary-fixed/40 text-black' : ''}`}>
                      .{col.toFixed(2).split('.')[1]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => {
                  const isCurrentRow = Math.abs(row - 1.5) < 0.05;
                  return (
                    <tr key={row} className="border-b border-outline-variant/30">
                      <td className={`p-2 font-bold ${isCurrentRow ? 'bg-primary-fixed/40 text-black' : 'text-on-surface'}`}>
                        {row.toFixed(1)}
                      </td>
                      {tableCols.map((col) => {
                        const cellZ = row + col;
                        const cellProb = normalCdf(cellZ);
                        const isMatch = isCurrentRow && col === 0.0;
                        return (
                          <td
                            key={col}
                            className={`p-2 text-center transition-all ${
                              isMatch
                                ? 'bg-primary text-on-primary font-extrabold rounded shadow-2xs'
                                : 'text-on-surface'
                            }`}
                          >
                            {cellProb.toFixed(4)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Result calculation summary */}
          <div className="p-3 bg-primary-fixed/25 border-2 border-primary/30 rounded-xl space-y-1">
            <div className="text-xs font-bold text-primary uppercase">
              {direction === 'less'
                ? `P(X ≤ ${xVal}) = P(Z ≤ +${z.toFixed(2)})`
                : direction === 'greater'
                ? `P(X > ${xVal}) = 1 − P(Z ≤ +${z.toFixed(2)})`
                : `P(60 ≤ X ≤ 80) = P(−1.00 ≤ Z ≤ +1.00)`}
            </div>
            <div className="text-2xl font-extrabold font-mono text-black">
              {direction === 'less'
                ? `${pLess.toFixed(4)} (${(pLess * 100).toFixed(2)}%)`
                : direction === 'greater'
                ? `${pGreater.toFixed(4)} (${(pGreater * 100).toFixed(2)}%)`
                : `${pBetween.toFixed(4)} (${(pBetween * 100).toFixed(2)}%)`}
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {direction === 'less'
                ? `Sebesar ${(pLess * 100).toFixed(2)}% mahasiswa memperoleh nilai ujian di bawah atau sama dengan ${xVal}.`
                : direction === 'greater'
                ? `Hanya ${(pGreater * 100).toFixed(2)}% mahasiswa yang memperoleh nilai ujian lebih dari ${xVal}.`
                : `Sebesar ${(pBetween * 100).toFixed(2)}% mahasiswa berada di dalam rentang normal simetris 1 standar deviasi dari rata-rata.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 5. UNIFORM PDF VISUAL
// =========================================================================
export const UniformPdfVisual: React.FC = () => {
  const [a] = useState<number>(5);
  const [b] = useState<number>(15);
  const [cVal, setCVal] = useState<number>(8);
  const [dVal, setDVal] = useState<number>(12);

  const height = uniformPdf(a, b); // 0.1
  const width = Math.max(0, dVal - cVal);
  const prob = uniformProb(a, b, cVal, dVal);

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
            Waktu Tunggu Bus Shuttle Kampus: Uniform U({a}, {b})
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-xs font-bold text-black font-mono">
            Tinggi f(X) = 1 / ({b} − {a}) = {height.toFixed(2)}
          </span>
        </div>

        {/* SVG Diagram of Uniform Distribution */}
        <div className="w-full h-44 sm:h-48 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 150" className="w-full h-full select-none overflow-visible">
            {/* Total Box a to b */}
            {/* a=5 -> 70px, b=15 -> 390px (320px / 10 = 32px per unit) */}
            <rect x="70" y="35" width="320" height="85" fill="#f2f4f3" stroke="#6e7a74" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Shaded Box c to d */}
            {(() => {
              const x1 = 70 + (cVal - 5) * 32;
              const x2 = 70 + (dVal - 5) * 32;
              const w = Math.max(0, x2 - x1);
              return (
                <g>
                  <rect x={x1} y="35" width={w} height="85" fill="#97f4d5" opacity="0.85" stroke="#00614d" strokeWidth="2" />
                  {w > 30 && (
                    <text x={x1 + w / 2} y="82" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#002118">
                      Luas = {(prob * 100).toFixed(1)}%
                    </text>
                  )}
                </g>
              );
            })()}

            {/* Top flat line of PDF */}
            <line x1="70" y1="35" x2="390" y2="35" stroke="#00614d" strokeWidth="2.5" />

            {/* Baseline */}
            <line x1="40" y1="120" x2="420" y2="120" stroke="#191c1c" strokeWidth="1.5" />

            {/* Ticks */}
            {[5, 7, 8, 10, 12, 15].map((tick) => {
              const tx = 70 + (tick - 5) * 32;
              const isHighlight = tick === cVal || tick === dVal;
              return (
                <g key={tick}>
                  <line x1={tx} y1="117" x2={tx} y2="123" stroke="#191c1c" strokeWidth="1.5" />
                  <text
                    x={tx}
                    y="138"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={isHighlight ? '#00614d' : '#191c1c'}
                    fontFamily="monospace"
                  >
                    {tick}m
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sliders for [c, d] */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Bawah Interval (c):</span>
              <span className="font-mono font-bold text-black">{cVal} menit</span>
            </div>
            <input
              type="range"
              min="5"
              max={dVal - 1}
              step="1"
              value={cVal}
              onChange={(e) => setCVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Atas Interval (d):</span>
              <span className="font-mono font-bold text-black">{dVal} menit</span>
            </div>
            <input
              type="range"
              min={cVal + 1}
              max="15"
              step="1"
              value={dVal}
              onChange={(e) => setDVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="p-4 rounded-xl bg-primary-fixed/20 border-2 border-primary/30 space-y-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wide">
            Hasil Perhitungan Luas Area Persegi P({cVal} ≤ X ≤ {dVal}):
          </span>
          <div className="text-2xl font-extrabold font-mono text-black">
            P({cVal} ≤ X ≤ {dVal}) = {prob.toFixed(4)} ({(prob * 100).toFixed(1)}%)
          </div>
          <div className="text-xs text-on-surface-variant font-mono space-y-1">
            <div>• Tinggi kurva f(X) = 1 / ({b} − {a}) = {height.toFixed(2)}</div>
            <div>• Lebar interval ΔX = ({dVal} − {cVal}) = {width} menit</div>
            <div>• Luas = Tinggi × Lebar = {height.toFixed(2)} × {width} = {prob.toFixed(4)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 6. UNIFORM STATS VISUAL
// =========================================================================
export const UniformStatsVisual: React.FC = () => {
  const [a, setA] = useState<number>(5);
  const [b, setB] = useState<number>(15);

  const mean = uniformMean(a, b);
  const variance = uniformVariance(a, b);
  const sd = uniformSd(a, b);

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        <div className="text-xs font-bold text-on-surface uppercase tracking-wide">
          Parameter Statistik Distribusi Uniform U(a, b):
        </div>

        {/* Sliders for a and b */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Minimum (a):</span>
              <span className="font-mono font-bold text-black">{a}</span>
            </div>
            <input
              type="range"
              min="0"
              max={b - 2}
              step="1"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Batas Maksimum (b):</span>
              <span className="font-mono font-bold text-black">{b}</span>
            </div>
            <input
              type="range"
              min={a + 2}
              max="25"
              step="1"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-primary-fixed/20 border-2 border-primary/30 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">Mean / Nilai Harapan (μ):</span>
            <div className="text-2xl font-extrabold font-mono text-black">{mean.toFixed(2)}</div>
            <p className="text-xs text-on-surface-variant font-mono">μ = ({a} + {b}) / 2</p>
          </div>

          <div className="p-4 rounded-xl bg-secondary-fixed/25 border-2 border-secondary/30 space-y-1">
            <span className="text-xs font-bold text-secondary uppercase">Variansi (σ²):</span>
            <div className="text-2xl font-extrabold font-mono text-black">{variance.toFixed(3)}</div>
            <p className="text-xs text-on-surface-variant font-mono">σ² = ({b} − {a})² / 12</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-xs font-bold text-on-surface uppercase">Standar Deviasi (σ):</span>
            <div className="text-2xl font-extrabold font-mono text-black">{sd.toFixed(3)}</div>
            <p className="text-xs text-on-surface-variant font-mono">σ = √({variance.toFixed(2)})</p>
          </div>
        </div>

        {/* Visual Line showing Mean & SD spread */}
        <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-2">
          <div className="text-xs font-bold text-on-surface">Posisi Simetris Mean & Sebaran Deviasi:</div>
          <div className="relative pt-6 pb-4 px-2">
            <div className="h-2 w-full bg-surface-container-high rounded-full relative">
              {/* Bracket for [a, b] */}
              <div
                className="absolute -top-5 text-xs font-mono font-bold text-on-surface"
                style={{ left: '5%' }}
              >
                a = {a}
              </div>
              <div
                className="absolute -top-5 text-xs font-mono font-bold text-on-surface"
                style={{ right: '5%' }}
              >
                b = {b}
              </div>

              {/* Mean Pin */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10"
                style={{ left: '50%' }}
              >
                <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold shadow-xs">
                  μ
                </div>
                <span className="text-xs font-bold text-primary font-mono mt-1">
                  {mean.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 7. EXPONENTIAL PDF VISUAL
// =========================================================================
export const ExponentialPdfVisual: React.FC = () => {
  const [lambda, setLambda] = useState<number>(3); // 3 kedatangan per menit
  const [xVal, setXVal] = useState<number>(0.5); // 0.5 menit (30 detik)
  const [mode, setMode] = useState<'less' | 'greater'>('less');

  const mean = 1 / lambda;
  const pLess = exponentialCdf(xVal, lambda);
  const pGreater = 1 - pLess;

  // Build SVG exponential curve
  const points: { x: number; y: number }[] = [];
  const svgW = 460;
  const maxX = 2.0;

  for (let i = 0; i <= 60; i++) {
    const curX = (i / 60) * maxX;
    const yVal = exponentialPdf(curX, lambda);
    const px = 40 + (i / 60) * (svgW - 70);
    const py = 125 - (yVal / (lambda * 1.05)) * 100;
    points.push({ x: px, y: Math.max(15, py) });
  }

  const curveD = `M ${points[0].x} ${points[0].y} ` + points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Shaded area
  const cutPx = 40 + (Math.min(maxX, xVal) / maxX) * (svgW - 70);
  const shadedPts = points.filter((p) => (mode === 'less' ? p.x <= cutPx : p.x >= cutPx));

  let shadedPath = '';
  if (shadedPts.length > 0) {
    if (mode === 'less') {
      shadedPath =
        `M 40 125 L 40 ${points[0].y.toFixed(1)} ` +
        shadedPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${cutPx.toFixed(1)} 125 Z`;
    } else {
      shadedPath =
        `M ${cutPx.toFixed(1)} 125 ` +
        shadedPts.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
        ` L ${points[points.length - 1].x.toFixed(1)} 125 Z`;
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/60 space-y-4">
        {/* Toggle Mode */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-surface-container">
          <button
            type="button"
            onClick={() => setMode('less')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              mode === 'less' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface'
            }`}
          >
            P(X ≤ {xVal}) — Tiba Cepat (Dalam Batas Waktu)
          </button>
          <button
            type="button"
            onClick={() => setMode('greater')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              mode === 'greater' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container text-on-surface'
            }`}
          >
            P(X &gt; {xVal}) — Menunggu Lebih Lama
          </button>
        </div>

        {/* SVG Curve */}
        <div className="w-full h-44 sm:h-52 bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-2">
          <svg viewBox="0 0 460 150" className="w-full h-full select-none overflow-visible">
            {/* Shaded Area */}
            {shadedPath && <path d={shadedPath} fill="#97f4d5" opacity="0.85" />}

            {/* Decreasing Exponential Curve Line */}
            <path d={curveD} fill="none" stroke="#00614d" strokeWidth="2.5" />

            {/* Cutoff Needle */}
            <line x1={cutPx} y1="15" x2={cutPx} y2="125" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="3 3" />
            <text x={cutPx} y="142" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ba1a1a" fontFamily="monospace">
              x = {xVal} mnt
            </text>

            {/* Baseline */}
            <line x1="30" y1="125" x2="440" y2="125" stroke="#191c1c" strokeWidth="1.5" />

            {/* Ticks */}
            {[0, 0.5, 1.0, 1.5, 2.0].map((tick) => {
              const tx = 40 + (tick / maxX) * (svgW - 70);
              return (
                <g key={tick}>
                  <line x1={tx} y1="122" x2={tx} y2="128" stroke="#191c1c" strokeWidth="1.5" />
                  <text x={tx} y="142" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#191c1c" fontFamily="monospace">
                    {tick}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sliders for lambda and x */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Laju Rata-Rata Kedatangan (λ):</span>
              <span className="font-mono font-bold text-black">{lambda} orang / menit</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={lambda}
              onChange={(e) => setLambda(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/40 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-on-surface">Ambang Batas Waktu Tunggu (x):</span>
              <span className="font-mono font-bold text-error">{xVal} menit ({(xVal * 60).toFixed(0)} detik)</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.8"
              step="0.1"
              value={xVal}
              onChange={(e) => setXVal(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-primary-fixed/20 border-2 border-primary/30 space-y-1">
            <span className="text-xs font-bold text-primary uppercase">
              {mode === 'less' ? `Peluang Datang Cepat P(X ≤ ${xVal}):` : `Peluang Menunggu Lama P(X > ${xVal}):`}
            </span>
            <div className="text-2xl font-extrabold font-mono text-black">
              {mode === 'less' ? `${pLess.toFixed(4)} (${(pLess * 100).toFixed(2)}%)` : `${pGreater.toFixed(4)} (${(pGreater * 100).toFixed(2)}%)`}
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              {mode === 'less'
                ? `1 − e^(−${lambda} × ${xVal}) = 1 − e^(−${(lambda * xVal).toFixed(2)})`
                : `e^(−${lambda} × ${xVal}) = e^(−${(lambda * xVal).toFixed(2)})`}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/60 space-y-1">
            <span className="text-xs font-bold text-on-surface uppercase">Rata-Rata Waktu Antar Kedatangan (μ):</span>
            <div className="text-2xl font-extrabold font-mono text-black">
              {mean.toFixed(3)} menit
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              μ = 1 / λ = 1 / {lambda} menit = {(mean * 60).toFixed(0)} detik
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// ROUTER FOR CONTINUOUS PROBABILITY VISUALS
// =========================================================================
export const ContinuousProbabilityVisuals: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'continuous-vs-discrete':
      return <ContinuousVsDiscreteVisual />;
    case 'pdf-area':
      return <PdfAreaVisual />;
    case 'normal-pdf':
      return <NormalPdfVisual />;
    case 'z-transformation':
      return <ZTransformationVisual />;
    case 'uniform-pdf':
      return <UniformPdfVisual />;
    case 'uniform-stats':
      return <UniformStatsVisual />;
    case 'exponential-pdf':
      return <ExponentialPdfVisual />;
    default:
      return null;
  }
};
