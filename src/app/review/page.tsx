"use client";

// The Daily Review: guided flow, one question per view, input matched to the
// answer shape, Student → Mode Shift → Teacher → commitment. Consumes
// QUESTION_FRAMEWORK.md via src/lib/framework.ts.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import { QUESTIONS, REVERSE_SHIFT_LINE, studentSteps, teacherSteps } from "@/lib/framework";
import type { AnswerValue, MissionOutcome, Question, ResolveResult } from "@/lib/types";
import { useApp, useEconomy, useHardLine, useYesterdayMission } from "@/lib/store";
import { candorForQuestion, chainFrom, drawSeal, momentumFromChain, resolveWager } from "@/lib/economy";
import { dayOffset } from "@/lib/mock";
import { isAnswered, ShapeInput } from "@/components/inputs";
import { ModeShift } from "@/components/mode-shift";
import { RankUpTakeover, ResolveCard, SealReveal } from "@/components/economy-ui";
import { CountUp } from "@/components/charts";
import Link from "next/link";
import { Button, Card, Chip, CompoundRule, Label, ProgressSegments } from "@/components/ui";

type Phase = "arm" | "student" | "shift" | "teacher" | "commit";

export default function ReviewPage() {
  const router = useRouter();
  const reduced = usePrefersReduced();
  const {
    areas,
    records,
    mode,
    setMode,
    pendingS1,
    setPendingS1,
    completeToday,
    todayDone,
    prefs,
    rankUp,
    clearRankUp,
  } = useApp();
  const standing = useYesterdayMission();

  const [phase, setPhase] = useState<Phase>("arm");
  const [areaId, setAreaId] = useState(standing?.areaId ?? areas[0]?.id ?? "a1");
  // Simple experience defaults to the minimum day (still switchable).
  const [mvd, setMvd] = useState(prefs.density === "simple");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [crumb, setCrumb] = useState<{ bp: number; key: number } | null>(null);
  const [showRankUp, setShowRankUp] = useState(false);
  const [shieldBurn, setShieldBurn] = useState(false);
  const econ = useEconomy();
  const { missions, shieldHeld, focusLogs } = useApp();
  const armLine = useHardLine("arm");
  const failLine = useHardLine("failed");

  const hasMission = Boolean(standing);
  const s1 = answers.S1;
  const s1No = s1?.kind === "binary" && s1.value === false;

  const sSteps = useMemo(() => studentSteps({ hasMission, s1No, mvd }), [hasMission, s1No, mvd]);
  const tSteps = useMemo(() => teacherSteps({ hasMission, mvd }), [hasMission, mvd]);
  const steps = phase === "teacher" ? tSteps : sSteps;
  const area = areas.find((a) => a.id === areaId) ?? areas[0];

  const prevS3 = useMemo(() => {
    const recs = records.filter((r) => r.areaId === areaId && r.answers.S3?.kind === "count");
    const last = recs[recs.length - 1];
    return last?.answers.S3?.kind === "count" ? last.answers.S3.values : undefined;
  }, [records, areaId]);

  const begin = () => {
    if (pendingS1 !== null && hasMission) {
      setAnswers((a) => ({ ...a, S1: { kind: "binary", value: pendingS1 } }));
      setPendingS1(null);
    }
    setIdx(0);
    setPhase("student");
    if (mode !== "student") setMode("student", false);
  };

  const currentId = steps[idx];
  const question: Question | undefined = currentId ? QUESTIONS[currentId] : undefined;
  // MVD renders S2 as its one-line variant (framework §5, S2-lite).
  const effective: Question | undefined =
    question && mvd && question.id === "S2"
      ? { ...question, prompt: "One completed thing today.", hint: "“Nothing” is a legal, recorded answer.", shape: { kind: "line" } }
      : question;

  const canNext = effective ? isAnswered(effective.shape, answers[effective.id]) : false;

  const next = () => {
    setDir(1);

    // Micro-pay: the question's candor crumb pulses as the Student advances.
    // Visible money, not new money — crumbs sum into the sealed total.
    if (phase === "student" && effective) {
      const bp = candorForQuestion(effective.id, answers, mvd ? "mvd" : "full");
      if (bp > 0) setCrumb({ bp, key: Date.now() });
    }

    // T1 answered: the bet resolves — the Teacher is the payer.
    if (phase === "teacher" && currentId === "T1" && standing) {
      const t1 = answers.T1;
      if (t1?.kind === "enum") {
        const res = resolveWager(
          standing.confidence,
          t1.value as MissionOutcome,
          momentumFromChain(chainFrom(missions))
        );
        setResolveResult(res);
        setResolveOpen(true);
        setShieldBurn(t1.value === "failed" && shieldHeld);
      }
    }

    if (idx < steps.length - 1) {
      setIdx(idx + 1);
      return;
    }
    if (phase === "student") {
      setPhase("shift");
    } else {
      completeToday({ areaId, kind: mvd ? "mvd" : "full", answers, burnShield: shieldBurn });
      setPhase("commit");
    }
  };

  const back = () => {
    if (idx === 0) return;
    setDir(-1);
    setIdx(idx - 1);
  };

  if (todayDone && phase === "arm") {
    return (
      <Wrap>
        <Card className="mx-auto max-w-md text-center">
          <Chip tone="accent">+0.01 filed</Chip>
          <p className="type-display mt-4 text-[1.375rem]">Today&apos;s review is done.</p>
          <p className="mt-2 text-[0.875rem] text-muted">The next order stands until tomorrow.</p>
          <Button className="mt-6" onClick={() => router.push("/today")}>
            Return to the system
          </Button>
        </Card>
      </Wrap>
    );
  }

  return (
    <Wrap>
      {phase === "arm" && (
        <div className="mx-auto max-w-md">
          <Label>Daily review</Label>
          <h1 className="type-display mt-2 text-[1.75rem]">Arm the loop.</h1>
          {prefs.hardLines && (
            <p className="type-display mt-3 text-[1.125rem] italic leading-snug text-ink/90">
              &ldquo;{armLine}&rdquo;
            </p>
          )}
          <CoachBrief areaId={areaId} />
          <Card className="mt-6 space-y-5">
            <div>
              <Label className="mb-2">Focus area</Label>
              <div className="grid gap-2">
                {areas.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAreaId(a.id)}
                    className={`rounded-[var(--radius-sm)] border px-4 py-3 text-left text-[0.9375rem] transition-colors duration-[var(--dur-fast)] ${
                      areaId === a.id
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-line bg-surface-2 text-muted hover:border-muted"
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
                <Link
                  href="/areas?new=1"
                  className="rounded-[var(--radius-sm)] border border-dashed border-line px-4 py-2.5 text-center text-[0.8125rem] text-muted hover:border-muted hover:text-ink"
                >
                  + add another area
                </Link>
              </div>
            </div>
            <div>
              <Label className="mb-2">Path</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMvd(false)}
                  className={`rounded-[var(--radius-sm)] border px-3 py-3 text-[0.875rem] ${
                    !mvd ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface-2 text-muted"
                  }`}
                >
                  Full review
                  <span className="type-mono block text-[0.6875rem] text-muted">~7 min</span>
                </button>
                <button
                  onClick={() => setMvd(true)}
                  className={`rounded-[var(--radius-sm)] border px-3 py-3 text-[0.875rem] ${
                    mvd ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface-2 text-muted"
                  }`}
                >
                  Minimum day
                  <span className="type-mono block text-[0.6875rem] text-muted">~3 min · thin record beats no record</span>
                </button>
              </div>
            </div>
            <Button className="w-full" onClick={begin}>
              Begin review
            </Button>
          </Card>
        </div>
      )}

      {(phase === "student" || phase === "teacher") && effective && (
        <div className={`mx-auto ${phase === "teacher" ? "max-w-xl lg:max-w-5xl" : "max-w-xl"}`}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <Label>
              {phase === "student" ? "student · record" : "teacher · judge"} · {area.name}
            </Label>
            <button onClick={() => router.push("/today")} className="text-[0.75rem] text-muted underline hover:text-ink">
              exit — draft is kept
            </button>
          </div>
          <ProgressSegments ids={steps} current={idx} />

          <div
            className={
              phase === "teacher"
                ? "lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-8"
                : ""
            }
          >
            {phase === "teacher" && (
              <div className="lg:sticky lg:top-6">
                <SealedRecord answers={answers} mvd={mvd} />
              </div>
            )}

            <div>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={effective.id}
              custom={dir}
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28 * dir }}
              transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
              className="mt-8"
            >
              <div className="flex items-center gap-3">
                <span className="type-mono text-[0.6875rem] text-accent">{effective.id}</span>
                {effective.id === "T5" && (
                  <span className="type-mono rounded-[3px] border border-accent/60 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
                    the wager
                  </span>
                )}
              </div>
              <h2 className="type-display mt-2 text-[1.45rem] leading-snug md:text-[1.75rem]">
                {effective.prompt}
              </h2>
              {effective.hint && <p className="mt-2 text-[0.8125rem] text-muted">{effective.hint}</p>}
              <div className="mt-6">
                <ShapeInput
                  shape={effective.shape}
                  value={answers[effective.id]}
                  onChange={(v) => setAnswers((a) => ({ ...a, [effective.id]: v }))}
                  metrics={area.metrics}
                  prevValues={prevS3}
                />
              </div>
              {effective.id === "T5" && (
                <p className="type-mono mt-3 text-[0.6875rem] text-muted">
                  this call is your stake — it resolves at tomorrow&apos;s verdict. honest is the best play.
                </p>
              )}
              {effective.id === "S1" && focusLogs.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {focusLogs.slice(-3).map((log, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() =>
                        setAnswers((a) => {
                          const s1 = a.S1;
                          if (s1?.kind !== "binary") return a;
                          return {
                            ...a,
                            S1: { ...s1, evidence: `focus session · ${log.minutes} min · logged in app` },
                          };
                        })
                      }
                      className="type-mono rounded-full border px-3 py-1 text-[0.6875rem]"
                      style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
                    >
                      use: focus session · {log.minutes} min
                    </button>
                  ))}
                </div>
              )}
              {effective.id === "T3" && <CoachChips answers={answers} setAnswers={setAnswers} />}
            </motion.div>
          </AnimatePresence>

          <div className="relative mt-10 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={idx === 0} className="min-w-24">
              Back
            </Button>
            {crumb && (
              <span
                key={crumb.key}
                className="crumb type-mono pointer-events-none absolute -top-6 right-2 text-[0.8125rem]"
                style={{ color: "var(--gold)" }}
                aria-hidden
              >
                +{crumb.bp} bp
              </span>
            )}
            <Button onClick={next} disabled={!canNext} className="min-w-44">
              {phase === "student" && idx === steps.length - 1
                ? "Seal the record"
                : phase === "teacher" && idx === steps.length - 1
                  ? "Commit mission"
                  : "Next"}
            </Button>
          </div>
          {phase === "teacher" && (
            <p className="type-mono mt-4 text-center text-[0.6875rem] text-muted/70">
              the record is sealed — evaluation only
            </p>
          )}
            </div>
          </div>
        </div>
      )}

      {phase === "shift" && <ModeShift onDone={() => { setIdx(0); setPhase("teacher"); }} />}

      {resolveOpen && resolveResult && (
        <ResolveCard
          result={resolveResult}
          balanceAfter={econ.balance + resolveResult.total}
          onCollect={() => setResolveOpen(false)}
          line={resolveResult.outcome === "failed" && prefs.hardLines ? failLine : undefined}
          shieldBurn={shieldBurn}
        />
      )}

      {phase === "commit" && (
        <CommitScreen
          answers={answers}
          onDone={() => (rankUp ? setShowRankUp(true) : router.push("/today"))}
        />
      )}

      {showRankUp && rankUp && (
        <RankUpTakeover
          rank={rankUp}
          onContinue={() => {
            clearRankUp();
            router.push("/today");
          }}
        />
      )}
    </Wrap>
  );
}

/** Coach · beta — deterministic rules over the record, no API. */
function CoachBrief({ areaId }: { areaId: string }) {
  const { missions, areas } = useApp();
  const judged = missions.filter((m) => m.areaId === areaId && m.outcome);
  if (judged.length === 0) return null;
  const exec = judged.filter((m) => m.outcome === "executed").length;
  const name = areas.find((a) => a.id === areaId)?.name ?? "this area";
  return (
    <p className="type-mono mt-2 text-[0.6875rem] text-muted">
      coach · beta — you&apos;re {exec}/{judged.length} on {name} in the record. call the stake honestly.
    </p>
  );
}

function CoachChips({
  answers,
  setAnswers,
}: {
  answers: Record<string, AnswerValue>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, AnswerValue>>>;
}) {
  const econ = useEconomy();
  const open = econ.bounties.filter((b) => b.status === "open").slice(0, 3);
  if (open.length === 0) return null;
  const t3 = answers.T3;
  return (
    <div className="mt-3">
      <p className="type-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
        coach · beta — your repeat offenders
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {open.map((b) => (
          <button
            key={b.text}
            type="button"
            onClick={() =>
              setAnswers((a) => ({
                ...a,
                T3: { kind: "enum", value: t3?.kind === "enum" ? t3.value : "", note: b.text },
              }))
            }
            className="rounded-full border border-line px-3 py-1 text-[0.6875rem] text-muted hover:border-accent hover:text-ink"
          >
            {b.text} · {b.count}×
          </button>
        ))}
      </div>
      {open[0] && open[0].count >= 3 && (
        <p className="type-mono mt-2 text-[0.625rem] text-muted">
          &ldquo;{open[0].text}&rdquo; has been flagged {open[0].count}× — a system change beats another
          promise.
        </p>
      )}
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="atmosphere min-h-dvh px-4 py-8 md:py-14">
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}

/** The Student's sealed record, re-presented to the Teacher as a report. */
function SealedRecord({ answers, mvd }: { answers: Record<string, AnswerValue>; mvd: boolean }) {
  const [open, setOpen] = useState(true);
  const rows: { label: string; value: string }[] = [];
  const s1 = answers.S1;
  if (s1?.kind === "binary") rows.push({ label: "Mission claim", value: `${s1.value ? "Done" : "Not done"} — ${s1.evidence ?? "no evidence"}` });
  const s2 = answers.S2;
  if (s2?.kind === "list") rows.push({ label: "Completed", value: s2.items.join(" · ") });
  if (s2?.kind === "line") rows.push({ label: "Completed", value: s2.value });
  const s3 = answers.S3;
  if (s3?.kind === "count")
    rows.push({ label: "Numbers", value: Object.entries(s3.values).map(([k, v]) => `${k} ${v}`).join(" · ") });
  const s4 = answers.S4;
  if (s4?.kind === "line") rows.push({ label: "Avoided", value: `${s4.value}${s4.second ? ` → instead: ${s4.second}` : ""}` });
  const st1 = answers.ST1;
  if (st1?.kind === "text") rows.push({ label: "Miss timeline", value: st1.value });
  const s5 = answers.S5;
  if (s5?.kind === "line") rows.push({ label: "Conditions", value: s5.value });

  return (
    <Card rule className="mt-6">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-3 text-left">
        <span className="flex items-center gap-2.5">
          <Label>The record{mvd ? " · minimum day" : ""}</Label>
          <span className="type-mono rotate-[-3deg] rounded-[2px] border border-accent px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
            sealed
          </span>
        </span>
        <span className="type-mono text-[0.6875rem] text-muted lg:hidden">{open ? "collapse" : "read"}</span>
      </button>
      {open && (
        <div className="mt-3 space-y-2.5 border-t border-line pt-3">
          {rows.map((r) => (
            <div key={r.label} className="grid grid-cols-[92px_1fr] gap-3 text-[0.8125rem]">
              <span className="type-mono text-muted">{r.label}</span>
              <span className="text-ink">{r.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/** Reverse shift: the mission remains — and the day's earnings are stated. */
function CommitScreen({ answers, onDone }: { answers: Record<string, AnswerValue>; onDone: () => void }) {
  const { ledger } = useApp();
  const t4 = answers.T4;
  const t5 = answers.T5;
  const t6 = answers.T6;
  const mission = t4?.kind === "mission" ? t4 : undefined;
  const today = dayOffset(0);
  const todays = ledger.filter((e) => e.date === today);
  const candorBp = todays.filter((e) => e.source === "candor").reduce((s, e) => s + e.bp, 0);
  const resolveBp = todays.filter((e) => e.source === "resolve").reduce((s, e) => s + e.bp, 0);
  const balance = ledger.reduce((s, e) => s + e.bp, 0);

  return (
    <div className="mx-auto max-w-md pt-8 text-center md:pt-16">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42 }}>
        <Label>{REVERSE_SHIFT_LINE}</Label>
        <Card rule className="mt-6 text-left">
          <div className="type-mono flex items-center gap-3 text-[0.75rem] text-accent">
            <span>{mission?.when}</span>
            <span className="text-muted">·</span>
            <span>{mission?.where}</span>
          </div>
          <p className="type-display mt-3 text-[1.375rem] leading-snug">{mission?.what}</p>
          {t6?.kind === "line" && t6.value && (
            <p className="mt-3 border-t border-line pt-3 text-[0.8125rem] text-muted">{t6.value}</p>
          )}
          <div className="type-mono mt-4 flex items-center justify-between text-[0.75rem] text-muted">
            <span>stake placed: {t5?.kind === "scale" ? t5.value : "—"}/10</span>
            <span className="text-accent">resolves at the next verdict</span>
          </div>
        </Card>
        <SealReveal seal={drawSeal(today)} />
        <div className="type-mono mt-5 flex items-center justify-center gap-4 text-[0.75rem] text-muted">
          <span>candor +{candorBp}</span>
          <span>·</span>
          <span>resolve +{resolveBp}</span>
          <span>·</span>
          <span style={{ color: "var(--gold)" }}>
            balance <CountUp to={balance} /> bp
          </span>
        </div>
        <CompoundRule className="mt-6 opacity-60" />
        <Button className="mt-6" onClick={onDone}>
          Return to the system
        </Button>
      </motion.div>
    </div>
  );
}

