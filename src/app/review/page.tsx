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
import { useApp, useEconomy, useYesterdayMission } from "@/lib/store";
import { chainFrom, momentumFromChain, resolveWager } from "@/lib/economy";
import { dayOffset } from "@/lib/mock";
import { isAnswered, ShapeInput } from "@/components/inputs";
import { ModeShift } from "@/components/mode-shift";
import { ResolveCard } from "@/components/economy-ui";
import { CountUp } from "@/components/charts";
import { Button, Card, Chip, CompoundRule, Label, ProgressSegments } from "@/components/ui";

type Phase = "arm" | "student" | "shift" | "teacher" | "commit";

export default function ReviewPage() {
  const router = useRouter();
  const reduced = usePrefersReduced();
  const { areas, records, mode, setMode, pendingS1, setPendingS1, completeToday, todayDone } = useApp();
  const standing = useYesterdayMission();

  const [phase, setPhase] = useState<Phase>("arm");
  const [areaId, setAreaId] = useState(standing?.areaId ?? areas[0]?.id ?? "a1");
  const [mvd, setMvd] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [resolveResult, setResolveResult] = useState<ResolveResult | null>(null);
  const [resolveOpen, setResolveOpen] = useState(false);
  const econ = useEconomy();
  const { missions } = useApp();

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
      }
    }

    if (idx < steps.length - 1) {
      setIdx(idx + 1);
      return;
    }
    if (phase === "student") {
      setPhase("shift");
    } else {
      completeToday({ areaId, kind: mvd ? "mvd" : "full", answers });
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
          <Button className="mt-6" onClick={() => router.push("/")}>
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
        <div className="mx-auto max-w-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <Label>
              {phase} · {area.name}
            </Label>
            <button onClick={() => router.push("/")} className="text-[0.75rem] text-muted underline hover:text-ink">
              exit — draft is kept
            </button>
          </div>
          <ProgressSegments ids={steps} current={idx} />

          {phase === "teacher" && <SealedRecord answers={answers} mvd={mvd} />}

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
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={idx === 0} className="min-w-24">
              Back
            </Button>
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
      )}

      {phase === "shift" && <ModeShift onDone={() => { setIdx(0); setPhase("teacher"); }} />}

      {resolveOpen && resolveResult && (
        <ResolveCard
          result={resolveResult}
          balanceAfter={econ.balance + resolveResult.total}
          onCollect={() => setResolveOpen(false)}
        />
      )}

      {phase === "commit" && <CommitScreen answers={answers} onDone={() => router.push("/")} />}
    </Wrap>
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
        <Label>The record{mvd ? " · minimum day" : ""}</Label>
        <span className="type-mono text-[0.6875rem] text-muted">{open ? "collapse" : "read"}</span>
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
        <div className="type-mono mt-5 flex items-center justify-center gap-4 text-[0.75rem] text-muted">
          <span>candor +{candorBp}</span>
          <span>·</span>
          <span>resolve +{resolveBp}</span>
          <span>·</span>
          <span className="text-ink">
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

