import React from 'react';

// Shared drawing primitives for step pictures (StepVisuals.tsx, CalcStepVisuals.tsx).
// Color rule: NEW (red) marks what the current step adds.

export const NEW = '#ba1a1a'; // highlight for what this step adds
export const INK = '#0f172a';
export const MUTED = '#334155';
export const GRID = '#cbd5e1';
export const PRIMARY = '#00614d';
export const FILL = '#0d9488';

export const Frame: React.FC<{ children: React.ReactNode; note?: string }> = ({ children, note }) => (
  <div className="p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/40 space-y-2">
    {children}
    {note && (
      <p className="text-xs text-black leading-relaxed flex items-start gap-1.5">
        <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-1" style={{ backgroundColor: NEW }} />
        <span>{note}</span>
      </p>
    )}
  </div>
);

export interface Cell {
  v: React.ReactNode;
  hl?: boolean;
}
export const MiniTable: React.FC<{ headers: Cell[]; rows: Cell[][]; footer?: Cell[] }> = ({ headers, rows, footer }) => {
  const cls = (c: Cell, base: string) => `${base} ${c.hl ? 'text-[#ba1a1a] font-bold bg-[#ffdad6]/50' : ''}`;
  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant/60 bg-surface-container-lowest">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-surface-container text-black">
            {headers.map((h, i) => (
              <th key={i} className={cls(h, 'py-1.5 px-2.5 font-bold whitespace-nowrap')}>
                {h.v}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container text-black">
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((c, ci) => (
                <td key={ci} className={cls(c, 'py-1 px-2.5 font-mono whitespace-nowrap')}>
                  {c.v}
                </td>
              ))}
            </tr>
          ))}
          {footer && (
            <tr className="bg-surface-container-low font-bold">
              {footer.map((c, ci) => (
                <td key={ci} className={cls(c, 'py-1 px-2.5 font-mono whitespace-nowrap')}>
                  {c.v}
                </td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export const c = (v: React.ReactNode, hl = false): Cell => ({ v, hl });

// Generic plot area helpers (viewBox 0 0 400 220, plot box x 50..380, y 20..180)
export const PX0 = 50;
export const PX1 = 380;
export const PY0 = 20;
export const PY1 = 180;
export const sx = (v: number, min: number, max: number) => PX0 + ((v - min) / (max - min)) * (PX1 - PX0);
export const sy = (v: number, min: number, max: number) => PY1 - ((v - min) / (max - min)) * (PY1 - PY0);

export const YAxis: React.FC<{ ticks: number[]; min: number; max: number; color?: string; fmt?: (v: number) => string; grid?: boolean; x?: number; right?: boolean }> = ({
  ticks,
  min,
  max,
  color = MUTED,
  fmt = (v) => String(v),
  grid = true,
  x = PX0,
  right = false,
}) => (
  <g>
    {ticks.map((t) => (
      <g key={t}>
        {grid && t !== min && <line x1={PX0} y1={sy(t, min, max)} x2={PX1} y2={sy(t, min, max)} stroke={GRID} strokeDasharray="3 3" />}
        <text x={right ? x + 6 : x - 6} y={sy(t, min, max) + 3.5} textAnchor={right ? 'start' : 'end'} fontSize="10" fill={color} fontFamily="monospace">
          {fmt(t)}
        </text>
      </g>
    ))}
    <line x1={x} y1={PY0 - 4} x2={x} y2={PY1} stroke={color} strokeWidth={color === NEW ? 2.5 : 1.5} />
  </g>
);

export const XBase: React.FC<{ color?: string }> = ({ color = MUTED }) => (
  <line x1={PX0} y1={PY1} x2={PX1} y2={PY1} stroke={color} strokeWidth={color === NEW ? 2.5 : 1.5} />
);

export const Svg: React.FC<{ children: React.ReactNode; h?: number }> = ({ children, h = 220 }) => (
  <svg viewBox={`0 0 400 ${h}`} className="w-full h-auto overflow-visible select-none">
    {children}
  </svg>
);

