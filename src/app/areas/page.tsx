"use client";

// Improvement areas — campaigns, each with its own goal, standards and metrics.
// Each area also owns its question wording: the framework's structure (ids,
// shapes, metrics, order) is locked; the words and benchmarks are the user's.

import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Sparkline } from "@/components/charts";
import { Button, Card, Chip, Label } from "@/components/ui";
import { AREA_TEMPLATES } from "@/lib/templates";
import { useApp, useAreaSeries } from "@/lib/store";
import { MAX_CUSTOM_QUESTIONS, QUESTIONS, sectionsFor, THE_LAW } from "@/lib/framework";
import type { Area, CustomQuestion, Mode, QuestionOverride, Section } from "@/lib/types";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

export default function AreasPage() {
  const { areas, records, addArea } = useApp();
  const [adding, setAdding] = useState(false);

  // /areas?new=1 opens the form directly (the dashboard + arm-screen add links).
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("new")) return;
    const t = setTimeout(() => setAdding(true), 0);
    return () => clearTimeout(t);
  }, []);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [metric, setMetric] = useState("");

  const create = () => {
    if (!name.trim() || !goal.trim() || !metric.trim()) return;
    addArea({
      name: name.trim(),
      goal: goal.trim(),
      metrics: [{ key: metric.trim().toLowerCase().replace(/\s+/g, "_"), label: metric.trim(), unit: "" }],
      standards: [],
    });
    setName("");
    setGoal("");
    setMetric("");
    setAdding(false);
  };

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>Improvement areas</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The campaigns.</h1>
        </div>
        {!adding && (
          <Button variant="ghost" onClick={() => setAdding(true)}>
            New area
          </Button>
        )}
      </div>

      {adding && (
        <Card className="mt-6 max-w-lg space-y-3">
          <Label>New area</Label>
          <input className={fieldCls} placeholder="Name — something you perform in" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
          <input className={fieldCls} placeholder="Goal — measurable, dated" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={80} />
          <input className={fieldCls} placeholder="First metric to track (e.g. calls made)" value={metric} onChange={(e) => setMetric(e.target.value)} maxLength={30} />
          <div className="flex gap-2">
            <Button onClick={create} disabled={!name.trim() || !goal.trim() || !metric.trim()}>
              Create area
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Starter packs — one-tap areas. */}
      <div className="mt-6">
        <Label className="mb-2">Starter packs</Label>
        <div className="flex flex-wrap gap-2">
          {AREA_TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => addArea(t)}
              disabled={areas.some((a) => a.name === t.name)}
              className="rounded-full border border-line px-4 py-1.5 text-[0.8125rem] text-muted transition-colors duration-[var(--dur-fast)] hover:border-accent hover:text-ink disabled:opacity-40"
              title={t.goal}
            >
              + {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-[var(--gap)] md:grid-cols-2">
        {areas.map((a) => (
          <AreaCard key={a.id} area={a} count={records.filter((r) => r.areaId === a.id).length} />
        ))}
      </div>
    </Shell>
  );
}

function AreaCard({ area, count }: { area: Area; count: number }) {
  const [editing, setEditing] = useState(false);
  const [editingArea, setEditingArea] = useState(false);
  const series = useAreaSeries(area.id, area.metrics[0]?.key ?? "");
  const targetSeries = useAreaSeries(area.id, area.target?.metricKey ?? area.metrics[0]?.key ?? "");
  const latest = targetSeries[targetSeries.length - 1];
  const progress =
    area.target && latest !== undefined ? Math.min(1, Math.max(0, latest / area.target.value)) : null;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="type-display text-[1.375rem]">{area.name}</h2>
          <p className="mt-1 text-[0.875rem] text-muted">{area.goal}</p>
        </div>
        <Chip>
          <span className="type-mono">{count}</span>&nbsp;records
        </Chip>
      </div>

      {area.target && progress !== null && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-3">
            <Label>Target · {area.target.metricKey}</Label>
            <span className="type-mono text-[0.75rem]" style={{ color: "var(--gold)" }}>
              {latest} / {area.target.value} · {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-[5px] w-full rounded-full bg-line/60">
            <div className="h-full rounded-full" style={{ width: `${progress * 100}%`, background: "var(--gold)" }} />
          </div>
          <p className="type-mono mt-1 text-[0.625rem] text-muted">by {area.target.by}</p>
        </div>
      )}

      {area.standards.length > 0 && (
        <div className="mt-4">
          <Label className="mb-1.5">Standards</Label>
          <ul className="space-y-1 text-[0.8125rem] text-ink/90">
            {area.standards.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="text-accent">—</span> {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
        <div>
          <Label className="mb-1">{area.metrics[0]?.label}</Label>
          <Sparkline data={series.slice(-20)} width={170} height={32} />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {area.metrics.map((m) => (
            <Chip key={m.key}>{m.label}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-4 flex gap-4 border-t border-line pt-3">
        <button
          onClick={() => {
            setEditing(!editing);
            setEditingArea(false);
          }}
          className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {editing ? "close question editor" : "customize questions"}
        </button>
        <button
          onClick={() => {
            setEditingArea(!editingArea);
            setEditing(false);
          }}
          className="type-mono text-[0.6875rem] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          {editingArea ? "close area editor" : "edit area"}
        </button>
      </div>
      {editing && <QuestionEditor area={area} />}
      {editingArea && <AreaEditor area={area} />}
    </Card>
  );
}

/** Edit the campaign itself: name, goal, target, metric labels. Metric keys
 *  stay immutable so history and trends keep lining up. */
function AreaEditor({ area }: { area: Area }) {
  const { updateArea } = useApp();
  const [newMetric, setNewMetric] = useState("");

  const setMetric = (key: string, patch: Partial<{ label: string; unit: string }>) =>
    updateArea(area.id, {
      metrics: area.metrics.map((m) => (m.key === key ? { ...m, ...patch } : m)),
    });

  const addMetric = () => {
    const label = newMetric.trim();
    if (!label || area.metrics.length >= 3) return;
    const key = label.toLowerCase().replace(/\s+/g, "_");
    if (area.metrics.some((m) => m.key === key)) return;
    updateArea(area.id, { metrics: [...area.metrics, { key, label, unit: "" }] });
    setNewMetric("");
  };

  return (
    <div className="mt-3 space-y-3 rounded-[var(--radius-sm)] border border-line bg-surface-2/50 p-3">
      <div>
        <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Name</span>
        <input className={`${editFieldCls} mt-1`} value={area.name} maxLength={40} onChange={(e) => updateArea(area.id, { name: e.target.value })} />
      </div>
      <div>
        <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Goal</span>
        <input className={`${editFieldCls} mt-1`} value={area.goal} maxLength={80} onChange={(e) => updateArea(area.id, { goal: e.target.value })} />
      </div>
      <div>
        <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Metrics · labels editable, history stays aligned</span>
        <div className="mt-1 space-y-2">
          {area.metrics.map((m) => (
            <div key={m.key} className="flex gap-2">
              <input className={editFieldCls} value={m.label} maxLength={30} onChange={(e) => setMetric(m.key, { label: e.target.value })} />
              <input className={`${editFieldCls} w-20 shrink-0`} value={m.unit} maxLength={8} placeholder="unit" onChange={(e) => setMetric(m.key, { unit: e.target.value })} />
            </div>
          ))}
          {area.metrics.length < 3 && (
            <div className="flex gap-2">
              <input className={editFieldCls} value={newMetric} maxLength={30} placeholder="add a metric (e.g. calls made)" onChange={(e) => setNewMetric(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addMetric()} />
              <Button variant="ghost" onClick={addMetric} disabled={!newMetric.trim()}>
                Add
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">Target · gold bar on the card</span>
        <div className="mt-1 grid grid-cols-[1fr_90px_1fr] gap-2">
          <select
            className={editFieldCls}
            value={area.target?.metricKey ?? ""}
            onChange={(e) =>
              e.target.value
                ? updateArea(area.id, { target: { metricKey: e.target.value, value: area.target?.value ?? 10, by: area.target?.by ?? "end of month" } })
                : updateArea(area.id, { target: undefined })
            }
          >
            <option value="">no target</option>
            {area.metrics.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            className={editFieldCls}
            value={area.target?.value ?? ""}
            disabled={!area.target}
            onChange={(e) => area.target && updateArea(area.id, { target: { ...area.target, value: Number(e.target.value) || 0 } })}
          />
          <input
            className={editFieldCls}
            value={area.target?.by ?? ""}
            disabled={!area.target}
            placeholder="by when"
            maxLength={30}
            onChange={(e) => area.target && updateArea(area.id, { target: { ...area.target, by: e.target.value } })}
          />
        </div>
      </div>
    </div>
  );
}

// ---- The question editor: wording is yours, structure is locked ----

/** Soft lint on rewordings of the built-in set. Warns, never blocks —
 *  QUESTION_FRAMEWORK.md §4, in plain words. Customs are not linted. */
const LINT_RULES: { re: RegExp; msg: string }[] = [
  { re: /grat(eful|itude)/i, msg: "gratitude prompts are banned — mood regulation, not performance analysis (§4.1)" },
  { re: /\bfeel(ings?)?\b/i, msg: "feelings only count as a condition with an effect — never as the subject (§4.2)" },
  { re: /motivat/i, msg: "motivation ratings are banned — they train you to consult mood before acting (§4.3)" },
  { re: /rate (your|the|my) day|day score/i, msg: "global day scores are banned — a mood proxy wearing a number's clothes (§4.5)" },
  { re: /\bproud\b/i, msg: "comfort questions reward flattering answers — the record pays for honesty (§4)" },
  { re: /why am i\b/i, msg: "identity-directed whys point at self-worth — interrogate plans and conditions instead (§4.7)" },
];

function lintText(s: string | undefined): string | null {
  if (!s?.trim()) return null;
  for (const r of LINT_RULES) if (r.re.test(s)) return r.msg;
  return null;
}

const editFieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2.5 py-2 text-[0.8125rem] text-ink outline-none placeholder:text-muted/45 focus:border-accent";

function QuestionEditor({ area }: { area: Area }) {
  const { updateArea } = useApp();
  const [openSec, setOpenSec] = useState<string | null>(null);

  const setOverride = (key: string, field: keyof QuestionOverride, raw: string) => {
    const cur = area.overrides ?? {};
    const entry: QuestionOverride = { ...(cur[key] ?? {}) };
    if (field === "triggers") {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) delete entry.triggers;
      else entry.triggers = lines;
    } else if (raw === "") {
      delete entry[field];
    } else {
      entry[field] = raw;
    }
    const next = { ...cur };
    if (Object.keys(entry).length === 0) delete next[key];
    else next[key] = entry;
    updateArea(area.id, { overrides: next });
  };

  const resetKey = (key: string) => {
    const next = { ...(area.overrides ?? {}) };
    delete next[key];
    updateArea(area.id, { overrides: next });
  };

  return (
    <div className="mt-4 space-y-4">
      {/* The Law: wording is free, these are not. */}
      <div className="rounded-[var(--radius-sm)] border border-accent/30 bg-accent/5 p-3">
        <Label className="mb-1.5">The law — wording is yours, these are not</Label>
        <ul className="space-y-1">
          {THE_LAW.map((l) => (
            <li key={l} className="flex gap-2 text-[0.75rem] leading-snug text-ink/85">
              <span className="text-accent">—</span> {l}
            </li>
          ))}
        </ul>
      </div>

      {(["student", "teacher"] as const).map((m) => (
        <div key={m}>
          <Label className="mb-1.5">{m} sections</Label>
          <div className="space-y-1.5">
            {sectionsFor(m).map((sec) => (
              <SectionEditor
                key={sec.id}
                section={sec}
                area={area}
                open={openSec === sec.id}
                onToggle={() => setOpenSec(openSec === sec.id ? null : sec.id)}
                setOverride={setOverride}
                resetKey={resetKey}
              />
            ))}
          </div>
        </div>
      ))}

      <CustomQuestionsEditor area={area} />
    </div>
  );
}

function OverrideField({
  label,
  value,
  fallback,
  onChange,
  lint,
  textarea,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (v: string) => void;
  lint?: boolean;
  textarea?: boolean;
}) {
  const warning = lint ? lintText(value) : null;
  const props = {
    className: `${editFieldCls}${textarea ? " min-h-16 resize-none" : ""}`,
    value,
    placeholder: fallback,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };
  return (
    <div>
      <span className="type-mono text-[0.625rem] uppercase tracking-[0.15em] text-muted">{label}</span>
      <div className="mt-1">{textarea ? <textarea rows={2} {...props} /> : <input {...props} />}</div>
      {warning && (
        <p className="mt-1 text-[0.6875rem]" style={{ color: "var(--gold)" }}>
          ⚠ {warning} — saved anyway; the call is yours.
        </p>
      )}
    </div>
  );
}

function SectionEditor({
  section,
  area,
  open,
  onToggle,
  setOverride,
  resetKey,
}: {
  section: Section;
  area: Area;
  open: boolean;
  onToggle: () => void;
  setOverride: (key: string, field: keyof QuestionOverride, raw: string) => void;
  resetKey: (key: string) => void;
}) {
  const o = area.overrides?.[section.id] ?? {};
  const touched =
    Boolean(area.overrides?.[section.id]) || section.anchors.some((id) => area.overrides?.[id]);

  return (
    <div className="rounded-[var(--radius-sm)] border border-line bg-surface-2/50">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left">
        <span className="text-[0.8125rem] text-ink">
          {o.name?.trim() ? o.name : section.name}
          {touched && <span className="type-mono ml-2 text-[0.625rem] text-accent">customized</span>}
        </span>
        <span className="type-mono text-[0.6875rem] text-muted">{open ? "–" : "+"}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-line px-3 py-3">
          <OverrideField label="Section name" value={o.name ?? ""} fallback={section.name} onChange={(v) => setOverride(section.id, "name", v)} lint />
          <OverrideField label="Purpose line" value={o.purpose ?? ""} fallback={section.purpose} onChange={(v) => setOverride(section.id, "purpose", v)} lint />
          <OverrideField
            label="Thinking triggers — one per line"
            value={(o.triggers ?? []).join("\n")}
            fallback={section.triggers.join("\n")}
            onChange={(v) => setOverride(section.id, "triggers", v)}
            lint
            textarea
          />
          <OverrideField label="Benchmark example" value={o.example ?? ""} fallback={section.example ?? "shown on “see the benchmark”"} onChange={(v) => setOverride(section.id, "example", v)} textarea />

          {section.anchors.map((id) => {
            const q = QUESTIONS[id];
            const qo = area.overrides?.[id] ?? {};
            if (!q) return null;
            return (
              <div key={id} className="rounded-[var(--radius-sm)] border border-line/70 p-2.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="type-mono text-[0.625rem] text-accent">{id} · required anchor — answer type locked</span>
                  {area.overrides?.[id] && (
                    <button onClick={() => resetKey(id)} className="type-mono text-[0.625rem] text-muted underline hover:text-ink">
                      reset
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <OverrideField label="Question" value={qo.prompt ?? ""} fallback={q.prompt} onChange={(v) => setOverride(id, "prompt", v)} lint />
                  <OverrideField label="Hint" value={qo.hint ?? ""} fallback={q.hint ?? ""} onChange={(v) => setOverride(id, "hint", v)} lint />
                  <OverrideField label="Benchmark example" value={qo.example ?? ""} fallback={q.example ?? ""} onChange={(v) => setOverride(id, "example", v)} textarea />
                </div>
              </div>
            );
          })}

          {Boolean(area.overrides?.[section.id]) && (
            <button onClick={() => resetKey(section.id)} className="type-mono text-[0.6875rem] text-muted underline hover:text-ink">
              reset section to default
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CustomQuestionsEditor({ area }: { area: Area }) {
  const { updateArea, vault } = useApp();
  const customs = area.customQuestions ?? [];
  // The Third Question (epic vault unlock) raises the cap permanently.
  const cap = MAX_CUSTOM_QUESTIONS + (vault.unlocks.includes("feat-third-question") ? 1 : 0);
  const [adding, setAdding] = useState(false);
  const [cMode, setCMode] = useState<Mode>("student");
  const [prompt, setPrompt] = useState("");
  const [hint, setHint] = useState("");
  const [example, setExample] = useState("");
  const [long, setLong] = useState(false);

  const add = () => {
    if (!prompt.trim() || customs.length >= cap) return;
    const id = ["C1", "C2", "C3"].find((c) => !customs.some((q) => q.id === c)) ?? "C1";
    const q: CustomQuestion = {
      id,
      mode: cMode,
      prompt: prompt.trim(),
      hint: hint.trim() || undefined,
      example: example.trim() || undefined,
      shape: long ? { kind: "text" } : { kind: "line" },
    };
    updateArea(area.id, { customQuestions: [...customs, q] });
    setPrompt("");
    setHint("");
    setExample("");
    setAdding(false);
  };

  const remove = (id: string) =>
    updateArea(area.id, { customQuestions: customs.filter((c) => c.id !== id) });

  return (
    <div>
      <Label className="mb-1.5">
        Your questions · {customs.length}/{cap}
        {cap > MAX_CUSTOM_QUESTIONS && (
          <span className="ml-2 normal-case tracking-normal" style={{ color: "#b350f2" }}>
            · third slot unlocked at the vault
          </span>
        )}
      </Label>
      <p className="mb-2 text-[0.6875rem] text-muted">
        Asked in {`Handoff (student) or Final Verdict (teacher)`}. Never pays bp, never blocks sealing.
      </p>
      {customs.map((c) => (
        <div key={c.id} className="mb-1.5 flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line px-3 py-2">
          <span className="min-w-0 truncate text-[0.8125rem] text-ink">
            <span className="type-mono mr-2 text-[0.625rem] text-accent">{c.mode}</span>
            {c.prompt}
          </span>
          <button aria-label={`Remove ${c.prompt}`} onClick={() => remove(c.id)} className="text-muted hover:text-ink">
            ×
          </button>
        </div>
      ))}
      {!adding && customs.length < cap && (
        <button onClick={() => setAdding(true)} className="type-mono text-[0.6875rem] text-muted underline decoration-dotted hover:text-ink">
          + add a question
        </button>
      )}
      {adding && (
        <div className="space-y-2 rounded-[var(--radius-sm)] border border-line p-3">
          <div className="flex gap-2">
            {(["student", "teacher"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setCMode(m)}
                className={`rounded-full border px-3 py-1 text-[0.75rem] capitalize ${
                  cMode === m ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                }`}
              >
                {m === "student" ? "student — record it" : "teacher — judge it"}
              </button>
            ))}
          </div>
          <input className={editFieldCls} placeholder="The question" value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={160} />
          <input className={editFieldCls} placeholder="Hint (optional)" value={hint} onChange={(e) => setHint(e.target.value)} maxLength={160} />
          <input className={editFieldCls} placeholder="Benchmark example (optional)" value={example} onChange={(e) => setExample(e.target.value)} maxLength={300} />
          <div className="flex gap-2">
            {([false, true] as const).map((b) => (
              <button
                key={String(b)}
                onClick={() => setLong(b)}
                className={`rounded-full border px-3 py-1 text-[0.75rem] ${
                  long === b ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                }`}
              >
                {b ? "a few sentences" : "one line"}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <Button onClick={add} disabled={!prompt.trim()}>
              Add question
            </Button>
            <Button variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
