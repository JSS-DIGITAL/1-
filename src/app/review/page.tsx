"use client";

// The Daily Review, Framework v2: a guided self-performance audit.
// Full path = section screens (thinking triggers + free-depth prose + shaped
// anchors; anchors alone gate). Minimum day = the anchor-only per-question
// flow. Student → Seal → Mode Shift → Teacher → one order on the desk.
// Consumes QUESTION_FRAMEWORK.md §12 via src/lib/framework.ts.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import {
  customsFor,
  effectiveQuestion,
  effectiveSection,
  mvdStudentSteps,
  mvdTeacherSteps,
  REVERSE_SHIFT_LINE,
  sectionsFor,
} from "@/lib/framework";
import type { Area, AnswerValue, MissionOutcome, Question, ResolveResult, Section } from "@/lib/types";
import { useApp, useEconomy, useHardLine, useYesterdayMission } from "@/lib/store";
import { candorForQuestion, chainFrom, drawSeal, isNoneText, momentumFromChain, resolveWager } from "@/lib/economy";
import { dayOffset } from "@/lib/mock";
import { isAnswered, ShapeInput } from "@/components/inputs";
import { ModeShift } from "@/components/mode-shift";
import { RankUpTakeover, ResolveCard, SealReveal } from "@/components/economy-ui";
import { CountUp } from "@/components/charts";
import Link from "next/link";
import { Button, Card, Chip, CompoundRule, Label, ProgressSegments } from "@/components/ui";

type Phase = "arm" | "student" | "shift" | "teacher" | "commit";

const proseCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent min-h-24 resize-none";

// Error semantics use signal red — never the teacher ember (§9.4 separation).
const ERR_RED = "#FF4D42";

/** What the red line says when an anchor is unmet. */
const ANCHOR_MSGS: Record<string, string> = {
  S1: "Yes or no — then the proof an outsider would accept.",
  S2: "Log at least one completed thing — “none” is legal.",
  S3: "Enter today's numbers.",
  S4: "Name the avoidance — or write “none”.",
  S5: "State the condition and its effect.",
  ST1: "Reconstruct the timeline — facts only.",
  T1: "Rule on it — verdict, then the audit call.",
  T2: "Point at a line in the record — or write “none”.",
  T3: "Name the weakness and tag its recurrence.",
  T4: "When, where, what — all three.",
  T5: "Place the stake.",
  T6: "Name the break point: “If X, then Y.”",
  TR: "Pick the number and write the why — it's worthless without it.",
};
const PROSE_MSG = "Write it — or write “none”. Blanks don't exist in the record.";

/** The red requirement line, shown only after a blocked attempt. */
function ReqLine({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 text-[0.75rem] font-medium" style={{ color: ERR_RED }} role="alert">
      {msg}
    </p>
  );
}

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
  // Blocked-attempt state: red guidance appears only after the user tries.
  const [attempted, setAttempted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
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

  const area = areas.find((a) => a.id === areaId) ?? areas[0];

  // Full path: section screens. Minimum day: anchor-only steps.
  const sections = useMemo(
    () => sectionsFor(phase === "teacher" ? "teacher" : "student").map((s) => effectiveSection(s, area)),
    [phase, area]
  );
  const mvdSteps = useMemo(
    () => (phase === "teacher" ? mvdTeacherSteps(hasMission) : mvdStudentSteps(hasMission)),
    [phase, hasMission]
  );
  const total = mvd ? mvdSteps.length : sections.length;

  /** A section's live anchors: S1 needs a standing mission, S3 needs metrics,
   *  ST1 fires inside Intentions vs Reality when S1 = no. */
  const anchorsOf = (sec: Section): string[] => {
    let ids = sec.anchors.filter((id) => {
      if (id === "S1") return hasMission;
      if (id === "S3") return (area?.metrics.length ?? 0) > 0;
      return true;
    });
    if (sec.id === "sec-s2" && hasMission && s1No) ids = [...ids, "ST1"];
    return ids;
  };

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

  const section: Section | undefined = !mvd ? sections[idx] : undefined;
  const mvdId = mvd ? mvdSteps[idx] : undefined;
  // MVD renders S2 as its one-line variant (framework §5, S2-lite).
  const mvdQuestion: Question | undefined = (() => {
    if (!mvdId) return undefined;
    const q = effectiveQuestion(mvdId, area);
    if (q && mvdId === "S2")
      return { ...q, prompt: "One completed thing today.", hint: "“Nothing” is a legal, recorded answer.", shape: { kind: "line" } };
    return q;
  })();

  // Requirements: anchors + section prose + custom questions. Nothing stays
  // blank — an explicit "none" is the legal skip, and none-moments are tracked.
  const gateIds = mvd ? (mvdQuestion ? [mvdQuestion.id] : []) : section ? anchorsOf(section) : [];
  const textOk = (id: string) => {
    const v = answers[id];
    return (v?.kind === "text" || v?.kind === "line") && v.value.trim().length > 0;
  };
  const requirements: { id: string; msg: string }[] = [];
  if (mvd && mvdQuestion) {
    if (!isAnswered(mvdQuestion.shape, answers[mvdQuestion.id]))
      requirements.push({ id: mvdQuestion.id, msg: ANCHOR_MSGS[mvdQuestion.id] ?? "Required — the record can't seal without it." });
  } else if (section) {
    for (const id of gateIds) {
      const q = effectiveQuestion(id, area);
      if (q && !isAnswered(q.shape, answers[id]))
        requirements.push({ id, msg: ANCHOR_MSGS[id] ?? "Required — the record can't seal without it." });
    }
    if (!textOk(section.proseId)) requirements.push({ id: section.proseId, msg: PROSE_MSG });
    const secCustoms =
      section.id === "sec-s7" || section.id === "sec-t6" ? customsFor(area, phase === "teacher" ? "teacher" : "student") : [];
    for (const c of secCustoms) {
      if (!textOk(c.id)) requirements.push({ id: c.id, msg: PROSE_MSG });
    }
  }
  const errors: Record<string, string> = attempted
    ? Object.fromEntries(requirements.map((r) => [r.id, r.msg]))
    : {};

  const next = () => {
    // Blocked: show the red guidance, shake, and take them to the first gap.
    if (requirements.length > 0) {
      setAttempted(true);
      setShakeKey((k) => k + 1);
      const first = requirements[0];
      document
        .querySelector(`[data-req-id="${first.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setAttempted(false);
    setDir(1);

    // Micro-pay: candor crumbs pulse as the Student advances — anchors only.
    // Visible money, not new money — crumbs sum into the sealed total.
    if (phase === "student") {
      const bp = gateIds.reduce((s, id) => s + candorForQuestion(id, answers, mvd ? "mvd" : "full"), 0);
      if (bp > 0) setCrumb({ bp, key: Date.now() });
    }

    // T1 answered: the bet resolves — the Teacher is the payer.
    if (phase === "teacher" && gateIds.includes("T1") && standing) {
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

    if (idx < total - 1) {
      setIdx(idx + 1);
      setAttempted(false);
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
    setAttempted(false);
    setDir(-1);
    setIdx(idx - 1);
  };

  const setAnswer = (id: string, v: AnswerValue) => setAnswers((a) => ({ ...a, [id]: v }));
  const clearAnswer = (id: string) =>
    setAnswers((a) => {
      const nextA = { ...a };
      delete nextA[id];
      return nextA;
    });

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
          <p className="mt-2 text-[0.8125rem] text-muted">
            The more seriously you analyse yourself, the more valuable the outcome becomes.
          </p>
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
                  Full audit
                  <span className="type-mono block text-[0.6875rem] text-muted">
                    as deep as you&apos;re willing to go — effort in, insight out
                  </span>
                </button>
                <button
                  onClick={() => setMvd(true)}
                  className={`rounded-[var(--radius-sm)] border px-3 py-3 text-[0.875rem] ${
                    mvd ? "border-accent bg-accent/10 text-ink" : "border-line bg-surface-2 text-muted"
                  }`}
                >
                  Minimum day
                  <span className="type-mono block text-[0.6875rem] text-muted">
                    the minimum honest record — beats no record
                  </span>
                </button>
              </div>
            </div>
            <Button className="w-full" onClick={begin}>
              Begin review
            </Button>
          </Card>
        </div>
      )}

      {(phase === "student" || phase === "teacher") && (
        <div className={`mx-auto ${phase === "teacher" ? "max-w-xl lg:max-w-5xl" : "max-w-xl"}`}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <Label>
              {phase === "student" ? "student · record" : "teacher · judge"} · {area.name}
            </Label>
            <button onClick={() => router.push("/today")} className="text-[0.75rem] text-muted underline hover:text-ink">
              exit — draft is kept
            </button>
          </div>
          <ProgressSegments
            ids={mvd ? mvdSteps : sections.map((_, i) => `${i + 1}`)}
            current={idx}
          />

          <div
            className={
              phase === "teacher"
                ? "lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-8"
                : ""
            }
          >
            {phase === "teacher" && (
              <div className="lg:sticky lg:top-6">
                <SealedRecord answers={answers} area={area} mvd={mvd} />
              </div>
            )}

            <div>
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={mvd ? mvdId : section?.id}
                  custom={dir}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, x: 28 * dir }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, x: -28 * dir }}
                  transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                  className="mt-8"
                >
                  {mvd && mvdQuestion && (
                    <MvdStep
                      question={mvdQuestion}
                      answers={answers}
                      setAnswer={setAnswer}
                      area={area}
                      prevS3={prevS3}
                      focusLogs={focusLogs}
                      reduced={reduced}
                      errors={errors}
                    />
                  )}

                  {!mvd && section && (
                    <SectionScreen
                      section={section}
                      anchors={anchorsOf(section)}
                      answers={answers}
                      setAnswer={setAnswer}
                      clearAnswer={clearAnswer}
                      area={area}
                      prevS3={prevS3}
                      focusLogs={focusLogs}
                      reduced={reduced}
                      phase={phase}
                      errors={errors}
                    />
                  )}
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
                {/* Always clickable: a blocked click explains itself in red. */}
                <motion.div
                  key={shakeKey}
                  animate={shakeKey > 0 && !reduced ? { x: [0, -7, 6, -4, 3, 0] } : { x: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <Button onClick={next} className="min-w-44">
                    {phase === "student" && idx === total - 1
                      ? "Seal the record"
                      : phase === "teacher" && idx === total - 1
                        ? "Commit mission"
                        : "Next"}
                  </Button>
                </motion.div>
              </div>
              {attempted && requirements.length > 0 && (
                <p className="mt-3 text-right text-[0.75rem]" style={{ color: ERR_RED }}>
                  {`${requirements.length} ${requirements.length === 1 ? "thing" : "things"} missing — nothing stays blank. Write it, or write "none".`}
                </p>
              )}
              {phase === "teacher" && (
                <p className="type-mono mt-4 text-center text-[0.6875rem] text-muted/70">
                  the record is sealed — evaluation only
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* The blood-covered overlay crossfades out over the already-red Teacher room. */}
      <AnimatePresence>
        {phase === "shift" && (
          <ModeShift key="shift" onDone={() => { setIdx(0); setPhase("teacher"); }} />
        )}
      </AnimatePresence>

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

// ---- The section screen: triggers think, prose records, anchors gate ----

function SectionScreen({
  section,
  anchors,
  answers,
  setAnswer,
  clearAnswer,
  area,
  prevS3,
  focusLogs,
  reduced,
  phase,
  errors,
}: {
  section: Section;
  anchors: string[];
  answers: Record<string, AnswerValue>;
  setAnswer: (id: string, v: AnswerValue) => void;
  clearAnswer: (id: string) => void;
  area: Area;
  prevS3?: Record<string, number>;
  focusLogs: { minutes: number }[];
  reduced: boolean;
  phase: "student" | "teacher";
  errors: Record<string, string>;
}) {
  const prose = answers[section.proseId];
  const proseValue = prose?.kind === "text" ? prose.value : "";
  // The user's own questions live in Handoff (student) / Final Verdict (teacher).
  const customs =
    section.id === "sec-s7" || section.id === "sec-t6" ? customsFor(area, phase) : [];

  return (
    <div>
      <span className="type-mono text-[0.6875rem] text-accent">{section.name}</span>
      <h2 className="type-display mt-2 text-[1.45rem] leading-snug md:text-[1.75rem]">
        {section.goal}
      </h2>
      <p className="mt-2 text-[0.8125rem] text-muted">{section.purpose}</p>

      {/* Anchors first: the required spine of the record. */}
      {anchors.map((id) => (
        <AnchorBlock
          key={id}
          id={id}
          answers={answers}
          setAnswer={setAnswer}
          area={area}
          prevS3={prevS3}
          focusLogs={focusLogs}
          reduced={reduced}
          error={errors[id]}
        />
      ))}

      {/* The thinking triggers: prompts, not fields. */}
      <div className="mt-7">
        <p className="type-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
          think through — answer any, all, or none
        </p>
        <ul className="mt-2 space-y-1.5">
          {section.triggers.map((t) => (
            <li key={t} className="flex gap-2 text-[0.8125rem] leading-snug text-muted">
              <span className="text-accent/70">—</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <Benchmark text={section.example} reduced={reduced} />
      </div>

      <div className="mt-4" data-req-id={section.proseId}>
        <textarea
          className={proseCls}
          value={proseValue}
          onChange={(e) => setAnswer(section.proseId, { kind: "text", value: e.target.value })}
          placeholder={section.placeholder}
          rows={3}
        />
        <p className="type-mono mt-1 text-[0.625rem] text-muted/70">
          no limit — say all of it. nothing stays blank: write it, or write &ldquo;none&rdquo;.
        </p>
        <ReqLine msg={errors[section.proseId]} />
      </div>

      {section.cause && (
        <CausePicker
          cause={section.cause}
          value={answers[section.cause.id]}
          setAnswer={setAnswer}
          clearAnswer={clearAnswer}
        />
      )}

      {customs.map((c) => {
        const q = effectiveQuestion(c.id, area);
        if (!q) return null;
        return (
          <div key={c.id} className="mt-7 border-t border-line pt-5" data-req-id={c.id}>
            <div className="flex items-center gap-2">
              <span className="type-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
                your question
              </span>
            </div>
            <p className="mt-1.5 text-[1rem] font-medium text-ink">{q.prompt}</p>
            {q.hint && <p className="mt-1 text-[0.8125rem] text-muted">{q.hint}</p>}
            <Benchmark text={q.example} reduced={reduced} />
            <div className="mt-3">
              <ShapeInput
                shape={q.shape}
                value={answers[c.id]}
                onChange={(v) => setAnswer(c.id, v)}
              />
            </div>
            <ReqLine msg={errors[c.id]} />
          </div>
        );
      })}
    </div>
  );
}

/** One required anchor inside a section: prompt, hint, shaped input, chrome. */
function AnchorBlock({
  id,
  answers,
  setAnswer,
  area,
  prevS3,
  focusLogs,
  reduced,
  error,
}: {
  id: string;
  answers: Record<string, AnswerValue>;
  setAnswer: (id: string, v: AnswerValue) => void;
  area: Area;
  prevS3?: Record<string, number>;
  focusLogs: { minutes: number }[];
  reduced: boolean;
  error?: string;
}) {
  const q = effectiveQuestion(id, area);
  if (!q) return null;
  return (
    <div className="mt-7" data-req-id={id}>
      <div className="flex items-center gap-3">
        <span className="type-mono text-[0.6875rem] text-accent">{q.id}</span>
        {q.id === "T5" && (
          <span className="type-mono rounded-[3px] border border-accent/60 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
            the wager
          </span>
        )}
        {q.id === "TR" && (
          <span className="type-mono rounded-[3px] border border-accent/60 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
            execution rating
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[1.0625rem] font-medium leading-snug text-ink">{q.prompt}</p>
      {q.hint && <p className="mt-1 text-[0.8125rem] text-muted">{q.hint}</p>}
      <Benchmark text={q.example} reduced={reduced} />
      <div className="mt-3">
        <ShapeInput
          shape={q.shape}
          value={answers[q.id]}
          onChange={(v) => setAnswer(q.id, v)}
          metrics={area.metrics}
          prevValues={prevS3}
        />
      </div>
      <ReqLine msg={error} />
      {q.id === "T5" && (
        <p className="type-mono mt-3 text-[0.6875rem] text-muted">
          this call is your stake — it resolves at tomorrow&apos;s verdict. honest is the best play.
        </p>
      )}
      {q.id === "S1" && <FocusEvidenceChips answers={answers} setAnswer={setAnswer} focusLogs={focusLogs} />}
      {q.id === "T3" && <CoachChips answers={answers} setAnswer={setAnswer} />}
    </div>
  );
}

/** Minimum day: the old one-question-per-view flow, anchors only. */
function MvdStep({
  question,
  answers,
  setAnswer,
  area,
  prevS3,
  focusLogs,
  reduced,
  errors,
}: {
  question: Question;
  answers: Record<string, AnswerValue>;
  setAnswer: (id: string, v: AnswerValue) => void;
  area: Area;
  prevS3?: Record<string, number>;
  focusLogs: { minutes: number }[];
  reduced: boolean;
  errors: Record<string, string>;
}) {
  return (
    <div data-req-id={question.id}>
      <div className="flex items-center gap-3">
        <span className="type-mono text-[0.6875rem] text-accent">{question.id}</span>
        {question.id === "T5" && (
          <span className="type-mono rounded-[3px] border border-accent/60 px-1.5 py-0.5 text-[0.5625rem] uppercase tracking-[0.25em] text-accent">
            the wager
          </span>
        )}
      </div>
      <h2 className="type-display mt-2 text-[1.45rem] leading-snug md:text-[1.75rem]">
        {question.prompt}
      </h2>
      {question.hint && <p className="mt-2 text-[0.8125rem] text-muted">{question.hint}</p>}
      <Benchmark text={question.example} reduced={reduced} />
      <div className="mt-6">
        <ShapeInput
          shape={question.shape}
          value={answers[question.id]}
          onChange={(v) => setAnswer(question.id, v)}
          metrics={area.metrics}
          prevValues={prevS3}
        />
      </div>
      <ReqLine msg={errors[question.id]} />
      {question.id === "T5" && (
        <p className="type-mono mt-3 text-[0.6875rem] text-muted">
          this call is your stake — it resolves at tomorrow&apos;s verdict. honest is the best play.
        </p>
      )}
      {question.id === "S1" && <FocusEvidenceChips answers={answers} setAnswer={setAnswer} focusLogs={focusLogs} />}
    </div>
  );
}

/** Founder-authored benchmark answer, tap-to-reveal. Static under reduced motion. */
function Benchmark({ text, reduced }: { text?: string; reduced: boolean }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        aria-expanded={open}
      >
        {open ? "hide the benchmark" : "see the benchmark"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="mt-2 border-l-2 border-accent/40 pl-3 text-[0.8125rem] italic leading-relaxed text-muted">
              e.g. — {text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Optional one-tap cause. Tapping the selected chip clears it — never gates. */
function CausePicker({
  cause,
  value,
  setAnswer,
  clearAnswer,
}: {
  cause: NonNullable<Section["cause"]>;
  value: AnswerValue | undefined;
  setAnswer: (id: string, v: AnswerValue) => void;
  clearAnswer: (id: string) => void;
}) {
  const selected = value?.kind === "enum" ? value.value : undefined;
  return (
    <div className="mt-5">
      <p className="type-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted">
        {cause.prompt} <span className="normal-case tracking-normal">(optional)</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {cause.options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() =>
              selected === o ? clearAnswer(cause.id) : setAnswer(cause.id, { kind: "enum", value: o })
            }
            className={`rounded-full border px-3 py-1 text-[0.75rem] capitalize transition-colors duration-[var(--dur-fast)] ${
              selected === o
                ? "border-accent bg-accent/10 text-ink"
                : "border-line text-muted hover:border-muted hover:text-ink"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function FocusEvidenceChips({
  answers,
  setAnswer,
  focusLogs,
}: {
  answers: Record<string, AnswerValue>;
  setAnswer: (id: string, v: AnswerValue) => void;
  focusLogs: { minutes: number }[];
}) {
  if (focusLogs.length === 0) return null;
  const s1 = answers.S1;
  if (s1?.kind !== "binary") return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {focusLogs.slice(-3).map((log, i) => (
        <button
          key={i}
          type="button"
          onClick={() =>
            setAnswer("S1", { ...s1, evidence: `focus session · ${log.minutes} min · logged in app` })
          }
          className="type-mono rounded-full border px-3 py-1 text-[0.6875rem]"
          style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
        >
          use: focus session · {log.minutes} min
        </button>
      ))}
    </div>
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
  setAnswer,
}: {
  answers: Record<string, AnswerValue>;
  setAnswer: (id: string, v: AnswerValue) => void;
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
              setAnswer("T3", { kind: "enum", value: t3?.kind === "enum" ? t3.value : "", note: b.text })
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

/** The Student's sealed record, re-presented to the Teacher as a report:
 *  section prose, anchors, and the user's own questions — the whole file. */
function SealedRecord({
  answers,
  area,
  mvd,
}: {
  answers: Record<string, AnswerValue>;
  area: Area;
  mvd: boolean;
}) {
  const [open, setOpen] = useState(true);
  const rows: { label: string; value: string }[] = [];

  const anchorRow = (id: string) => {
    const v = answers[id];
    if (!v) return;
    if (id === "S1" && v.kind === "binary")
      rows.push({ label: "Mission claim", value: `${v.value ? "Done" : "Not done"} — ${v.evidence ?? "no evidence"}` });
    if (id === "S2" && v.kind === "list") rows.push({ label: "Completed", value: v.items.join(" · ") });
    if (id === "S2" && v.kind === "line") rows.push({ label: "Completed", value: v.value });
    if (id === "S3" && v.kind === "count")
      rows.push({ label: "Numbers", value: Object.entries(v.values).map(([k, n]) => `${k} ${n}`).join(" · ") });
    if (id === "S4" && v.kind === "line")
      rows.push({ label: "Avoided", value: `${v.value}${v.second ? ` → instead: ${v.second}` : ""}` });
    if (id === "S5" && v.kind === "line") rows.push({ label: "Conditions", value: v.value });
  };

  if (mvd) {
    anchorRow("S1");
    anchorRow("S2");
  } else {
    for (const sec of sectionsFor("student")) {
      for (const id of sec.anchors) anchorRow(id);
      if (sec.id === "sec-s2") {
        const st1 = answers.ST1;
        if (st1?.kind === "text" && st1.value.trim()) rows.push({ label: "Miss timeline", value: st1.value });
      }
      const prose = answers[sec.proseId];
      if (prose?.kind === "text" && prose.value.trim())
        rows.push({ label: effectiveSection(sec, area).name, value: prose.value });
      if (sec.cause) {
        const c = answers[sec.cause.id];
        if (c?.kind === "enum" && c.value) rows.push({ label: "Cause named", value: c.value });
      }
    }
    for (const c of customsFor(area, "student")) {
      const v = answers[c.id];
      if ((v?.kind === "line" || v?.kind === "text") && v.value.trim())
        rows.push({ label: c.prompt.slice(0, 40), value: v.value });
    }
  }

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
        <div className="mt-3 max-h-[70vh] space-y-2.5 overflow-y-auto border-t border-line pt-3">
          {rows.map((r, i) => (
            <div key={`${r.label}-${i}`} className="grid grid-cols-[92px_1fr] gap-3 text-[0.8125rem]">
              <span className="type-mono text-muted">{r.label}</span>
              <span className={`whitespace-pre-wrap ${isNoneText(r.value) ? "text-muted" : "text-ink"}`}>
                {r.value}
                {isNoneText(r.value) && (
                  <span className="type-mono ml-2 text-[0.625rem] uppercase tracking-[0.15em] text-muted/60">
                    · none — tracked
                  </span>
                )}
              </span>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-[0.8125rem] text-muted">A thin record. Judge what is written — nothing else exists.</p>
          )}
        </div>
      )}
    </Card>
  );
}

/** Reverse shift: the mission remains — and the day's earnings are stated. */
function CommitScreen({ answers, onDone }: { answers: Record<string, AnswerValue>; onDone: () => void }) {
  const { ledger, prefs } = useApp();
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
        <SealReveal
          seal={
            prefs.customSealLabel?.trim()
              ? { ...drawSeal(today), label: prefs.customSealLabel.trim() }
              : drawSeal(today)
          }
        />
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
