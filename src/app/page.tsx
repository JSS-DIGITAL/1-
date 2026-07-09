"use client";

// Home dashboard — the command centre. The standing mission with its
// did-you-do-it check is the most important widget in the app: answering it
// starts the review with S1 pre-armed.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, CompoundRule, Label, StatTile } from "@/components/ui";
import { DensityStrip, Sparkline } from "@/components/charts";
import { BalanceTicker, BountyCard, MomentumMeter, RankBadge } from "@/components/economy-ui";
import { useAnalytics, useApp, useAreaSeries, useEconomy, useYesterdayMission } from "@/lib/store";

export default function Dashboard() {
  const router = useRouter();
  const { areas, todayDone, setPendingS1, missions } = useApp();
  const standing = useYesterdayMission();
  const analytics = useAnalytics();
  const econ = useEconomy();
  const openBounty = econ.bounties.find((b) => b.status === "open");
  const today = new Date();

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
        </div>
        {todayDone && <Chip tone="accent">+0.01 filed</Chip>}
      </div>

      {/* The economy strip: balance, rank, momentum. */}
      <Card className="mt-6 grid gap-6 md:grid-cols-3">
        <BalanceTicker balance={econ.balance} />
        <RankBadge rank={econ.rank} balance={econ.balance} />
        <MomentumMeter chain={econ.chain} momentum={econ.momentum} />
      </Card>

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] lg:grid-cols-[1.6fr_1fr]">
        {/* The most important widget in the app */}
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
              confidence called: {tomorrow?.confidence}/10 — it meets tomorrow&apos;s binary
            </p>
          </Card>
        )}

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
      </div>

      {openBounty && (
        <div className="mt-[var(--gap)]">
          <BountyCard bounty={openBounty} />
        </div>
      )}

      <div className="mt-[var(--gap)] grid gap-[var(--gap)] md:grid-cols-3">
        {areas.map((a) => (
          <AreaTile key={a.id} id={a.id} name={a.name} goal={a.goal} metric={a.metrics[0]} />
        ))}
      </div>

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
          {!todayDone && (
            <Button onClick={() => router.push("/review")}>Begin review</Button>
          )}
        </div>
        <CompoundRule className="mt-5 opacity-40" />
      </Card>
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
