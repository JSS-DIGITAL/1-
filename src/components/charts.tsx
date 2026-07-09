"use client";

// Hand-drawn SVG instruments. Rules applied throughout (dataviz method):
// single hue + neutral per chart, 2px lines, thin marks with rounded data-ends,
// mono tabular axis text in ink tokens (never series color), direct labels,
// one axis, hover tooltips on the primary charts, no decorative charts.

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function Sparkline({
  data,
  width = 120,
  height = 34,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return <div className="type-mono text-[0.6875rem] text-muted">no data yet</div>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * (width - 6) + 3,
    height - 5 - ((v - min) / span) * (height - 10),
  ]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg width={width} height={height} className="block" aria-hidden>
      <path d={`${d} L${lx} ${height - 2} L3 ${height - 2} Z`} fill="var(--accent)" opacity="0.08" />
      <path d={d} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r="3" fill="var(--accent)" />
    </svg>
  );
}

export function DensityStrip({ days }: { days: { date: string; kind: "full" | "mvd" | "none" }[] }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label="record density, last 30 days">
      {days.map((d) => (
        <span
          key={d.date}
          title={`${d.date}: ${d.kind === "none" ? "no record" : d.kind === "mvd" ? "minimum day" : "full review"}`}
          className={`h-4 w-[7px] rounded-[2px] ${
            d.kind === "full" ? "bg-accent" : d.kind === "mvd" ? "border border-accent/70 bg-transparent" : "bg-line"
          }`}
        />
      ))}
    </div>
  );
}

export function CalibrationPlot({
  points,
  width = 340,
  height = 220,
}: {
  points: { conf: number; n: number; actual: number }[];
  width?: number;
  height?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const pad = { l: 36, r: 12, t: 12, b: 30 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const x = (conf: number) => pad.l + (conf / 10) * iw;
  const y = (rate: number) => pad.t + (1 - rate) * ih;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label="Calibration: predicted confidence vs actual completion rate">
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={width - pad.r} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 8} y={y(g) + 3.5} textAnchor="end" className="type-mono" fontSize="10" fill="var(--muted)">
              {Math.round(g * 100)}%
            </text>
          </g>
        ))}
        {[0, 5, 10].map((c) => (
          <text key={c} x={x(c)} y={height - 10} textAnchor="middle" className="type-mono" fontSize="10" fill="var(--muted)">
            {c}
          </text>
        ))}
        {/* the diagonal: perfect calibration */}
        <line x1={x(0)} y1={y(0)} x2={x(10)} y2={y(1)} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        <text x={x(6.4)} y={y(0.56)} className="type-mono" fontSize="9.5" fill="var(--muted)" transform={`rotate(-33 ${x(6.4)} ${y(0.56)})`}>
          perfectly calibrated
        </text>
        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(p.conf)}
            cy={y(p.actual)}
            r={Math.max(4, Math.min(9, 3 + p.n * 0.6))}
            fill="var(--accent)"
            opacity={hover === i ? 1 : 0.75}
            stroke="var(--bg)"
            strokeWidth="2"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
      {hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-1.5 text-[0.75rem]"
          style={{
            left: `${(x(points[hover].conf) / width) * 100}%`,
            top: `${(y(points[hover].actual) / height) * 100}%`,
            transform: "translate(-50%, -130%)",
          }}
        >
          <span className="type-mono">said {points[hover].conf}/10 · landed {Math.round(points[hover].actual * 100)}% · n={points[hover].n}</span>
        </div>
      )}
      <div className="mt-1 text-center text-[0.6875rem] text-muted">confidence called (0–10) → share actually executed</div>
    </div>
  );
}

export function RecurrenceBars({ items }: { items: { text: string; count: number }[] }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2.5">
      {items.slice(0, 5).map((it) => (
        <div key={it.text} title={`${it.text}: flagged ${it.count}×`}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate text-[0.8125rem] text-ink">{it.text}</span>
            <span className="type-mono shrink-0 text-[0.75rem] text-muted">{it.count}×</span>
          </div>
          <div className="h-[6px] w-full rounded-full bg-line/50">
            <div
              className={`h-full rounded-full ${it.count >= 3 ? "bg-accent" : "bg-muted/60"}`}
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompoundCurve({
  curve,
  ideal,
  width = 340,
  height = 190,
}: {
  curve: number[];
  ideal: number[];
  width?: number;
  height?: number;
}) {
  const pad = { l: 42, r: 12, t: 12, b: 24 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const all = [...curve, ...ideal, 1];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const x = (i: number, len: number) => pad.l + (i / Math.max(len - 1, 1)) * iw;
  const y = (v: number) => pad.t + (1 - (v - min) / span) * ih;
  const path = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? "M" : "L"}${x(i, arr.length).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="block w-full" role="img" aria-label="Compounding curve: your executed days vs the ideal 1% curve">
        {[1, 1.2, 1.4].filter((g) => g <= max).map((g) => (
          <g key={g}>
            <line x1={pad.l} x2={width - pad.r} y1={y(g)} y2={y(g)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 8} y={y(g) + 3.5} textAnchor="end" className="type-mono" fontSize="10" fill="var(--muted)">
              ×{g.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={path(ideal)} stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="4 4" fill="none" opacity="0.55" />
        <path d={`${path(curve)} L${x(curve.length - 1, curve.length)} ${y(min)} L${pad.l} ${y(min)} Z`} fill="var(--accent)" opacity="0.07" />
        <path d={path(curve)} stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
        {curve.length > 0 && (
          <circle cx={x(curve.length - 1, curve.length)} cy={y(curve[curve.length - 1])} r="3.5" fill="var(--accent)" />
        )}
      </svg>
      <div className="mt-1 flex items-center justify-center gap-4 text-[0.6875rem] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-4 bg-accent" /> your curve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-[2px] w-4 border-t border-dashed border-muted" /> ideal 1%/day
        </span>
      </div>
    </div>
  );
}

export function CountUp({ to, decimals = 0, duration = 700 }: { to: number; decimals?: number; duration?: number }) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (reduced) return; // render path shows the final value directly
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration, reduced]);
  const shown = reduced ? to : v;
  return <span className="type-mono">{shown.toFixed(decimals)}</span>;
}
