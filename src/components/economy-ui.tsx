"use client";

// Economy surfaces. Premium casino: tense, sharp, mono — payoffs are stated,
// never cheered. No exclamation marks anywhere in this file.

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import type { Bounty, RankInfo, ResolveResult, Seal, SealRarity } from "@/lib/types";
import { Button, Card, Label } from "./ui";
import { CountUp } from "./charts";

// Seal metals — fixed hexes, validated ≥4.5:1 on both mode surfaces.
export const SEAL_COLORS: Record<SealRarity, string> = {
  standard: "#9ba1a6", // silver
  brass: "#b08a50", // bronze
  ember: "#d3ae64", // gold
  oxblood: "#c27a93", // obsidian sheen
};

export const SEAL_NAMES: Record<SealRarity, string> = {
  standard: "silver",
  brass: "bronze",
  ember: "gold",
  oxblood: "obsidian",
};

export function SealStamp({ seal, size = 40 }: { seal: Seal; size?: number }) {
  const c = SEAL_COLORS[seal.rarity];
  return (
    <span title={seal.label} className="inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-label={seal.label}>
        <circle cx="20" cy="20" r="17" fill="none" stroke={c} strokeWidth="2" opacity="0.9" />
        <circle cx="20" cy="20" r="13" fill="none" stroke={c} strokeWidth="0.8" opacity="0.5" />
        <circle cx="14.5" cy="14.5" r="3" stroke={c} strokeWidth="1.8" fill="none" />
        <circle cx="25.5" cy="25.5" r="3" stroke={c} strokeWidth="1.8" fill="none" />
        <path d="M27 12 L13 28" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function BalanceTicker({ balance, label = "balance" }: { balance: number; label?: string }) {
  const prev = useRef(balance);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    if (prev.current === balance) return;
    prev.current = balance;
    const t0 = setTimeout(() => setPulse(true), 0);
    const t1 = setTimeout(() => setPulse(false), 950);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [balance]);
  return (
    <div>
      <Label>{label}</Label>
      <div className={`type-mono mt-1 text-[2rem] leading-none text-gold ${pulse ? "gold-pulse" : ""}`}>
        <CountUp to={balance} /> <span className="text-[0.875rem] text-muted">bp</span>
      </div>
    </div>
  );
}

export function MomentumMeter({ chain, momentum }: { chain: number; momentum: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label>momentum</Label>
        <span className="type-mono text-[0.8125rem] text-gold">×{momentum.toFixed(1)}</span>
      </div>
      <div className="mt-2 flex gap-1" aria-label={`${chain} kept promises in a row`}>
        {Array.from({ length: 10 }, (_, i) => {
          const filled = i < Math.min(chain, 10);
          const newest = filled && i === Math.min(chain, 10) - 1;
          return (
            <span
              key={i}
              className={`h-3 w-3 -skew-x-12 rounded-[2px] ${filled ? "bg-gold" : "bg-line"} ${newest ? "pop" : ""}`}
            />
          );
        })}
      </div>
      <p className="mt-1.5 text-[0.6875rem] text-muted">
        {chain === 0 ? "broken — rebuild it with a kept promise" : `${chain} kept ${chain === 1 ? "promise" : "promises"} running`}
      </p>
    </div>
  );
}

export function BountyCard({ bounty }: { bounty: Bounty }) {
  const killed = bounty.status === "killed";
  return (
    <Card rule className={killed ? "opacity-75" : ""}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Label>{killed ? "bounty collected" : "open bounty"}</Label>
          <p className="type-display mt-1.5 text-[1.0625rem] leading-snug">{bounty.text}</p>
          <p className="type-mono mt-1.5 text-[0.6875rem] text-muted">
            flagged {bounty.count}× · last seen {bounty.lastSeen}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className={`type-mono text-[1.25rem] ${killed ? "text-muted line-through" : "text-gold"}`}>
            100
          </span>
          <span className="type-mono ml-1 text-[0.6875rem] text-muted">bp</span>
          {killed && (
            <div className="type-mono mt-1 rotate-[-4deg] rounded-[2px] border border-accent px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.2em] text-accent">
              dead
            </div>
          )}
        </div>
      </div>
      {!killed && (
        <p className="mt-3 border-t border-line pt-2.5 text-[0.75rem] text-muted">
          Kill condition: no recurrence for 14 days. Corrections are the weapon.
        </p>
      )}
    </Card>
  );
}

export function RankBadge({ rank, balance }: { rank: RankInfo; balance: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="type-display text-[1.0625rem]">{rank.name}</span>
        {rank.next && (
          <span className="type-mono text-[0.6875rem] text-muted">
            {balance} / {rank.next.min} bp → {rank.next.name}
          </span>
        )}
      </div>
      <div className="mt-2 h-[4px] w-full rounded-full bg-line">
        <div className="h-full rounded-full bg-gold" style={{ width: `${rank.progress * 100}%` }} />
      </div>
    </div>
  );
}

/** The bet resolves — the day's sharpest beat. Requires a deliberate Collect. */
export function ResolveCard({
  result,
  balanceAfter,
  onCollect,
  line,
}: {
  result: ResolveResult;
  balanceAfter: number;
  onCollect: () => void;
  /** Optional hard line — shown on failed verdicts only. */
  line?: string;
}) {
  const reduced = usePrefersReduced();
  const verdictTone =
    result.outcome === "executed" ? "text-accent border-accent" : "text-muted border-line";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-5" role="dialog" aria-modal="true">
      <motion.div
        initial={reduced ? false : { opacity: 0, rotateX: 60, scale: 0.94 }}
        animate={{ opacity: 1, rotateX: 0, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
        style={{ transformPerspective: 900 }}
        className="w-full max-w-sm rounded-[var(--radius)] border border-line bg-surface p-6"
      >
        <div className="type-mono text-center text-[0.6875rem] uppercase tracking-[0.3em] text-muted">
          the bet resolves
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[0.8125rem] text-muted">you called</span>
          <span className="type-mono text-[1.0625rem] text-ink">{result.confidence}/10</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-[0.8125rem] text-muted">the verdict</span>
          <span
            className={`type-mono rotate-[-2deg] rounded-[3px] border px-2.5 py-1 text-[0.75rem] uppercase tracking-[0.2em] ${verdictTone}`}
          >
            {result.outcome}
          </span>
        </div>

        <div className="type-mono mt-5 space-y-1.5 border-t border-line pt-4 text-[0.8125rem]">
          <Row label="execution" value={`+${result.executionPay}`} />
          <Row label="calibration" value={`+${result.calibrationBonus}`} />
          <Row label="momentum" value={`×${result.momentum.toFixed(1)}`} />
        </div>

        <div className="mt-4 border-t border-line pt-4 text-center">
          <span className="type-mono text-[2.25rem] leading-none text-gold">
            +<CountUp to={result.total} duration={900} />
          </span>
          <span className="type-mono ml-1.5 text-[0.875rem] text-muted">bp</span>
          <div className="type-mono mt-2 text-[0.6875rem] text-muted">
            balance {balanceAfter} bp
          </div>
        </div>

        {line && (
          <p className="type-mono mt-4 border-t border-line pt-3 text-center text-[0.75rem] text-muted">
            {line}
          </p>
        )}

        <Button className="mt-5 w-full" onClick={onCollect}>
          Collect
        </Button>
      </motion.div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  );
}

const SEAL_ODDS: Record<SealRarity, string> = {
  standard: "70% draw",
  brass: "20% draw",
  ember: "8% draw",
  oxblood: "2% draw",
};

/** The day's seal, revealed on the commit screen. Rare metals get a moment. */
export function SealReveal({ seal }: { seal: Seal }) {
  const reduced = usePrefersReduced();
  const rare = seal.rarity !== "standard";
  return (
    <motion.div
      initial={reduced || !rare ? false : { opacity: 0, rotateY: 90, scale: 1.2 }}
      animate={{ opacity: 1, rotateY: 0, scale: 1 }}
      transition={{ delay: 0.5, duration: 0.45, ease: [0.2, 0.9, 0.3, 1.2] }}
      style={{ transformPerspective: 700 }}
      className="mt-5 flex items-center justify-center gap-3"
    >
      <span className={rare ? "gold-pulse" : ""}>
        <SealStamp seal={seal} size={rare ? 44 : 30} />
      </span>
      <span className="text-left">
        <span
          className="type-mono block text-[0.6875rem] uppercase tracking-[0.2em]"
          style={{ color: SEAL_COLORS[seal.rarity] }}
        >
          {SEAL_NAMES[seal.rarity]} seal
        </span>
        <span className="type-mono block text-[0.625rem] text-muted">{SEAL_ODDS[seal.rarity]}</span>
      </span>
    </motion.div>
  );
}

/** Rank-up takeover — the one loud moment. Gold on black, no confetti. */
export function RankUpTakeover({ rank, onContinue }: { rank: RankInfo; onContinue: () => void }) {
  const reduced = usePrefersReduced();
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/85 px-6" role="dialog" aria-modal="true">
      <div className="text-center">
        <motion.svg
          width="130"
          height="130"
          viewBox="0 0 120 120"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          aria-hidden
        >
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="2.5"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <circle cx="47" cy="47" r="7" stroke="var(--gold)" strokeWidth="2.5" fill="none" />
          <circle cx="73" cy="73" r="7" stroke="var(--gold)" strokeWidth="2.5" fill="none" />
          <line x1="76" y1="44" x2="44" y2="76" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
        </motion.svg>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.6, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: -2 }}
          transition={{ delay: reduced ? 0 : 0.55, duration: 0.2, ease: [0.2, 0.9, 0.3, 1.35] }}
          className="mt-6"
        >
          <div className="type-mono text-[0.6875rem] uppercase tracking-[0.35em] text-muted">rank attained</div>
          <div className="type-display mt-2 text-[2.5rem] leading-none" style={{ color: "var(--gold)" }}>
            {rank.name}
          </div>
        </motion.div>

        <motion.p
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.9 }}
          className="type-mono mt-3 text-[0.75rem] text-muted"
        >
          earned, not given
        </motion.p>

        <Button className="mt-7" onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}
