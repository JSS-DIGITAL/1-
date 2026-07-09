"use client";

import type { ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "quiet" | "destructive";

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-accent-ink font-medium hover:brightness-110 disabled:opacity-35 disabled:cursor-not-allowed",
  ghost: "border border-line text-ink hover:bg-surface-2 disabled:opacity-35",
  quiet: "text-muted hover:text-ink",
  destructive: "border border-destructive/60 text-destructive hover:bg-destructive/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`rounded-[var(--radius-sm)] px-5 py-2.5 text-[0.9375rem] transition-[background-color,color,border-color,filter] duration-[var(--dur-fast)] ${buttonStyles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Card({
  children,
  className = "",
  rule = false,
}: {
  children: ReactNode;
  className?: string;
  /** Teacher evaluation cards carry a 2px accent left rule. */
  rule?: boolean;
}) {
  return (
    <div
      className={`rounded-[var(--radius)] border border-line bg-surface p-[var(--pad-card)] ${
        rule ? "border-l-2 border-l-accent" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`type-label text-muted ${className}`}>{children}</div>;
}

export function Chip({
  children,
  tone = "line",
  className = "",
}: {
  children: ReactNode;
  tone?: "line" | "accent";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-sm)] border px-2 py-0.5 text-[0.75rem] ${
        tone === "accent" ? "border-accent/50 text-accent" : "border-line text-muted"
      } ${className}`}
    >
      {children}
    </span>
  );
}

export function StatTile({
  label,
  value,
  detail,
  children,
}: {
  label: string;
  value: string;
  detail?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="type-mono text-[1.75rem] leading-none text-ink">{value}</div>
      {detail && <div className="text-[0.8125rem] text-muted">{detail}</div>}
      {children}
    </Card>
  );
}

/** Review progress: one segment per question, labeled by ID. */
export function ProgressSegments({
  ids,
  current,
}: {
  ids: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemax={ids.length}>
      {ids.map((id, i) => (
        <div key={`${id}-${i}`} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={`h-[3px] w-full rounded-full ${
              i < current ? "bg-accent" : i === current ? "bg-accent/70" : "bg-line"
            }`}
          />
          <span
            className={`type-mono text-[0.625rem] ${i === current ? "text-accent" : "text-muted/60"}`}
          >
            {id}
          </span>
        </div>
      ))}
    </div>
  );
}

export function PercentGlyph({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-label="1%">
      <circle cx="9.5" cy="9.5" r="4.6" stroke="var(--accent)" strokeWidth="2.4" />
      <circle cx="22.5" cy="22.5" r="4.6" stroke="var(--accent)" strokeWidth="2.4" />
      <path d="M25 6 L7 26" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** The compounding motif: a line that bends slightly upward. */
export function CompoundRule({ className = "" }: { className?: string }) {
  return (
    <svg className={`block w-full ${className}`} height="14" preserveAspectRatio="none" viewBox="0 0 100 14">
      <path d="M0 12 Q 60 12 100 2" stroke="var(--accent)" strokeWidth="1.5" fill="none" opacity="0.7" />
    </svg>
  );
}
