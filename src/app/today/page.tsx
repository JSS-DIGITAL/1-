"use client";

// The command centre (moved from / — the root is now the marketing landing).
// The standing mission with its did-you-do-it check is the most important
// widget in the app: answering it starts the review with S1 pre-armed.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, CompoundRule, Label, StatTile } from "@/components/ui";
import { DensityStrip, Sparkline } from "@/components/charts";
import {
  BalanceTicker,
  BountyCard,
  GripDial,
  MomentumMeter,
  ObjectivesStrip,
  RankBadge,
  ShieldCard,
} from "@/components/economy-ui";
import { candorForQuestion } from "@/lib/economy";
import { daysSinceBackup } from "@/lib/persist";
import { dayOffset } from "@/lib/mock";
import { useAnalytics, useApp, useAreaSeries, useEconomy, useHardLine, useYesterdayMission } from "@/lib/store";

export default function TodayPage() {
  const router = useRouter();
  const { areas, todayDone, setPendingS1, missions, prefs, records, shieldHeld, buyShield, weeklyDone, vault } =
    useApp();
  const standing = useYesterdayMission();
  const analytics = useAnalytics();
  const econ = useEconomy();
  const dashLine = useHardLine("dash");
  const openBounty = econ.bounties.find((b) => b.status === "open");
  const simple = prefs.density === "simple";
  const today = new Date();

  // Daily objectives, derived straight from today's data.
  const todayISO = dayOffset(0);
  const todayRecord = records.find((r) => r.date === todayISO);
  const objResolved = missions.some((m) => m.date === todayISO && Boolean(m.outcome));
  const objSealed = Boolean(todayRecord);
  const objAvoided = todayRecord
    ? candorForQuestion("S4", todayRecord.answers, todayRecord.kind) > 0
    : false;

  const answerMission = (v: boolean) => {
    setPendingS1(v);
    router.push("/review");
  };

  const tomorrow = missions[missions.length - 1];
  const standingArea = areas.find((a) => a.id === standing?.areaId);

  return (
    <Shell>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <Label>Today</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">
            {today.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long" })}
          </h1>
          <p className="type-mono mt-1.5 text-[0.75rem] text-muted">You, versus your previous self.</p>
        </div>
        {todayDone && <Chip tone="accent">+0.01 filed</Chip>}
      </div>

      <FirstRunPrimer />
      <BackupNudge />

      {/* The economy strip: balance, rank, momentum, grip, shield, PRs. */}
      <Card className="mt-6 grid gap-6 md:grid-cols-3">
        <div>
          <BalanceTicker balance={econ.balance} />
          <p className="type-mono mt-2 text-[0.625rem] text-muted">
            best day {econ.prs.bestDayBp} bp · longest chain {econ.prs.longestChain}
          </p>
          {econ.nextRankGap !== null && econ.nextRankGap <= 60 && (
            <p className="type-mono mt-1 text-[0.6875rem]" style={{ color: "var(--gold)" }}>
              −{econ.nextRankGap} bp to {econ.rank.next?.name}
            </p>
          )}
        </div>
        <RankBadge rank={econ.rank} balance={econ.balance} />
        <MomentumMeter chain={econ.chain} momentum={econ.momentum} />
        <GripDial grip={econ.grip} />
        <ShieldCard held={shieldHeld} balance={econ.balance} onBuy={buyShield} />
        <div>
          <Label>Weekly debrief</Label>
          {weeklyDone ? (
            <p className="type-mono mt-2 text-[0.75rem]" style={{ color: "var(--gold)" }}>
              week stamped
            </p>
          ) : (
            <Link href="/weekly" className="type-mono mt-2 inline-block text-[0.75rem] text-accent underline">
              close the week · +25 bp
            </Link>
          )}
        </div>
      </Card>

      {/* Daily objectives — the quest strip. */}
      <Card className="mt-[var(--gap)]">
        <ObjectivesStrip resolved={objResolved} sealed={objSealed} avoided={objAvoided} />
      </Card>

      {/* The vault teaser — tonight's combination progress. */}
      <Card className="mt-[var(--gap)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Label>The vault</Label>
            <div className="flex items-center gap-2" aria-label="Combination digits earned">
              {[vault.digits.seal, vault.digits.candor, vault.digits.calibration].map((earned, i) => (
                <span
                  key={i}
                  className="type-mono grid h-7 w-7 place-items-center rounded-full border text-[0.75rem]"
                  style={{
                    borderColor: earned ? "var(--gold)" : "var(--line)",
                    color: earned ? "var(--gold)" : "var(--muted)",
                  }}
                >
                  {earned ? vault.digitValues[i] : "?"}
                </span>
              ))}
            </div>
            <span className="type-mono text-[0.6875rem] text-muted">
              {vault.attempts} crack attempt{vault.attempts === 1 ? "" : "s"} banked
              {vault.masterAvailable ? " · MASTER VAULT ARMED" : ` · streak ${vault.streak}/7`}
            </span>
          </div>
          <Link href="/vault" className="type-mono text-[0.75rem] underline decoration-dotted underline-offset-2 hover:text-ink" style={{ color: "var(--gold)" }}>
            the vault is waiting →
          </Link>
        </div>
      </Card>

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.6fr_1fr]">
        {!todayDone && standing ? (
          <Card rule className="flex flex-col">
            <div className="flex items-center justify-between gap-3">
              <Label>The standing mission</Label>
              <span className="type-mono text-[0.75rem] text-muted">
                stake riding: <span className="text-accent">{standing.confidence}/10</span>
              </span>
            </div>
            <div className="type-mono mt-3 flex items-center gap-3 text-[0.75rem] text-accent">
              <span>{standing.when}</span>
              <span className="text-muted">·</span>
              <span>{standing.where}</span>
              <span className="text-muted">·</span>
              <span className="text-muted">{standingArea?.name}</span>
            </div>
            <p className="type-display mt-2 text-[1.375rem] leading-snug md:text-[1.6rem]">{standing.what}</p>
            {standing.ifThen && <p className="mt-2 text-[0.8125rem] text-muted">{standing.ifThen}</p>}
            <div className="mt-5 border-t border-line pt-4">
              <div className="mb-2.5 flex items-baseline justify-between gap-3">
                <Label>Did you do it?</Label>
                <span className="type-mono text-[0.6875rem] text-muted">the bet resolves at review</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => answerMission(true)}>Yes — begin review</Button>
                <Button variant="ghost" onClick={() => answerMission(false)}>
                  No — begin review
                </Button>
              </div>
            </div>
          </Card>
        ) : !todayDone ? (
          <Card className="flex flex-col items-start justify-center gap-3">
            <Label>No standing mission</Label>
            <p className="type-display text-[1.375rem]">Run today&apos;s review to set one.</p>
            <Button onClick={() => router.push("/review")}>Begin review</Button>
          </Card>
        ) : (
          <Card rule className="flex flex-col">
            <Label>Tomorrow&apos;s order</Label>
            <div className="type-mono mt-3 flex items-center gap-3 text-[0.75rem] text-accent">
              <span>{tomorrow?.when}</span>
              <span className="text-muted">·</span>
              <span>{tomorrow?.where}</span>
            </div>
            <p className="type-display mt-2 text-[1.375rem] leading-snug">{tomorrow?.what}</p>
            <p className="type-mono mt-4 text-[0.75rem] text-muted">
              stake placed: {tomorrow?.confidence}/10 — it meets tomorrow&apos;s binary
            </p>
          </Card>
        )}

        {!simple && (
          <div className="grid grid-cols-2 gap-[var(--gap)] lg:grid-cols-1">
            <StatTile
              label="Missions executed · 30d"
              value={`${Math.round(analytics.completion * 100)}%`}
              detail={`${analytics.judgedCount} judged missions on record`}
            />
            <StatTile
              label="Calibration error"
              value={analytics.calibrationError.toFixed(2)}
              detail="0 = your word is data"
            />
          </div>
        )}
      </div>

      {/* The hard line — loud, where it can't be missed. Pinned Fuel wins. */}
      {prefs.hardLines && (
        <blockquote className="mx-auto mt-8 max-w-2xl text-center">
          <p className="type-display text-[1.5rem] italic leading-snug md:text-[1.9rem]">
            &ldquo;{dashLine}&rdquo;
          </p>
          <footer className="type-mono mt-2 text-[0.75rem]" style={{ color: "var(--gold)" }}>
            — 1%
          </footer>
        </blockquote>
      )}

      {openBounty && (
        <div className="mt-8">
          <BountyCard bounty={openBounty} />
        </div>
      )}

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] md:grid-cols-3">
        {areas.map((a) => (
          <AreaTile key={a.id} id={a.id} name={a.name} goal={a.goal} metric={a.metrics[0]} />
        ))}
        <Link
          href="/areas?new=1"
          className="grid min-h-24 place-items-center rounded-[var(--radius)] border border-dashed border-line text-[0.875rem] text-muted transition-colors duration-[var(--dur-fast)] hover:border-muted hover:text-ink"
        >
          + New area
        </Link>
      </div>

      {!simple && (
        <Card className="mt-[var(--gap)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Label className="mb-2">Record density · 30 days</Label>
              <DensityStrip days={analytics.density} />
            </div>
            <div className="flex items-center gap-4 text-[0.6875rem] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-3 w-[6px] rounded-[2px] bg-accent" /> full</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-[6px] rounded-[2px] border border-accent/70" /> minimum</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-[6px] rounded-[2px] bg-line" /> none</span>
            </div>
            {!todayDone && <Button onClick={() => router.push("/review")}>Begin review</Button>}
          </div>
          <CompoundRule className="mt-5 opacity-40" />
        </Card>
      )}

      {simple && !todayDone && (
        <div className="mt-[var(--gap)]">
          <Button className="w-full md:w-auto" onClick={() => router.push("/review")}>
            Begin review
          </Button>
        </div>
      )}
    </Shell>
  );
}

function AreaTile({
  id,
  name,
  goal,
  metric,
}: {
  id: string;
  name: string;
  goal: string;
  metric: { key: string; label: string; unit: string };
}) {
  const series = useAreaSeries(id, metric.key);
  const last = series[series.length - 1];
  return (
    <Link href="/areas" className="block">
      <Card className="transition-colors duration-[var(--dur-fast)] hover:border-muted">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="type-display truncate text-[1.0625rem]">{name}</h3>
            <p className="mt-0.5 truncate text-[0.75rem] text-muted">{goal}</p>
          </div>
          {last !== undefined && (
            <span className="type-mono shrink-0 text-[0.9375rem] text-ink">
              {last}
              <span className="ml-1 text-[0.6875rem] text-muted">{metric.unit}</span>
            </span>
          )}
        </div>
        <div className="mt-3">
          <Sparkline data={series.slice(-20)} width={200} height={30} />
        </div>
      </Card>
    </Link>
  );
}

/** One-time primer for a brand-new record — three steps, then it's gone. */
function FirstRunPrimer() {
  const { records } = useApp();
  const router = useRouter();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(records.length === 0 && window.localStorage.getItem("one-percent-primer-done") !== "1");
  }, [records.length]);
  if (!show) return null;
  const dismiss = () => {
    window.localStorage.setItem("one-percent-primer-done", "1");
    setShow(false);
  };
  return (
    <Card rule className="mt-6">
      <div className="flex items-start justify-between gap-3">
        <Label>How 1% works — 30 seconds</Label>
        <button onClick={dismiss} className="type-mono text-[0.6875rem] text-muted underline hover:text-ink">
          got it — don&apos;t show again
        </button>
      </div>
      <ol className="mt-3 grid gap-3 md:grid-cols-3">
        <li className="text-[0.875rem] leading-relaxed text-muted">
          <span className="type-mono text-accent">01 · record.</span> Tonight, the Student writes what
          actually happened — facts, numbers, what you dodged. No limits, no judgement.
        </li>
        <li className="text-[0.875rem] leading-relaxed text-muted">
          <span className="type-mono text-accent">02 · seal.</span> The record locks into the vault —
          permanent. Only what is written exists.
        </li>
        <li className="text-[0.875rem] leading-relaxed text-muted">
          <span className="type-mono text-accent">03 · judge.</span> The Teacher reads it like a coach:
          one weakness, one mission for tomorrow, one stake on your word.
        </li>
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={() => router.push("/review")}>Start tonight&apos;s review</Button>
        <span className="type-mono text-[0.6875rem] text-muted">~3 minutes on the minimum day</span>
      </div>
    </Card>
  );
}

/** Storage-eviction insurance: nudge when the backup is stale. */
function BackupNudge() {
  const { records } = useApp();
  const [days, setDays] = useState<number | null | undefined>(undefined);
  useEffect(() => {
    setDays(daysSinceBackup());
  }, []);
  if (records.length < 3 || days === undefined || (days !== null && days < 14)) return null;
  return (
    <Link
      href="/settings"
      className="type-mono mt-4 block rounded-[var(--radius-sm)] border border-dashed border-line px-4 py-2 text-center text-[0.6875rem] text-muted hover:text-ink"
    >
      {days === null ? "no backup taken yet" : `last backup ${days} days ago`} — export one in Settings →
    </Link>
  );
}
