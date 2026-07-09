"use client";

// One input per answer shape (QUESTION_FRAMEWORK.md §0 vocabulary).
// The control IS the constraint: vague answers must not fit.

import { useState } from "react";
import type { AnswerShape, AnswerValue, MetricDef } from "@/lib/types";
import { Label } from "./ui";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

/* Prose fields auto-grow with no cap — the box itself says so. */
const proseCls = `${fieldCls} min-h-[3rem] resize-none`;

function NoLimit() {
  return <p className="type-mono mt-1 text-[0.625rem] text-muted/70">no limit — say all of it</p>;
}

export function ShapeInput({
  shape,
  value,
  onChange,
  metrics,
  prevValues,
}: {
  shape: AnswerShape;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  metrics?: MetricDef[];
  prevValues?: Record<string, number>;
}) {
  switch (shape.kind) {
    case "binary":
      return <BinaryInput value={value} onChange={onChange} evidence={shape.evidence} />;
    case "enum":
      return <EnumInput value={value} onChange={onChange} options={shape.options} note={shape.note} />;
    case "scale":
      return <ScaleInput value={value} onChange={onChange} />;
    case "count":
      return <CountInput value={value} onChange={onChange} metrics={metrics ?? []} prevValues={prevValues} />;
    case "list":
      return <ListInput value={value} onChange={onChange} max={shape.max} />;
    case "line":
      return <LineInput value={value} onChange={onChange} secondPrompt={shape.secondPrompt} />;
    case "text":
      return <TextInput value={value} onChange={onChange} />;
    case "mission":
      return <MissionInput value={value} onChange={onChange} />;
  }
}

export function isAnswered(shape: AnswerShape, v: AnswerValue | undefined): boolean {
  if (!v) return false;
  switch (v.kind) {
    case "binary":
      return shape.kind === "binary" && (!shape.evidence || Boolean(v.evidence?.trim()));
    case "enum":
      return Boolean(v.value) && (shape.kind !== "enum" || !shape.note || Boolean(v.note?.trim()));
    case "scale":
      return v.value >= 0;
    case "count":
      return Object.keys(v.values).length > 0;
    case "list":
      return v.items.length > 0;
    case "line":
      return v.value.trim().length > 0;
    case "text":
      return v.value.trim().length > 0;
    case "mission":
      return Boolean(v.when.trim() && v.where.trim() && v.what.trim());
  }
}

function BinaryInput({
  value,
  onChange,
  evidence,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  evidence?: boolean;
}) {
  const v = value?.kind === "binary" ? value : undefined;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {([true, false] as const).map((b) => (
          <button
            key={String(b)}
            type="button"
            onClick={() => onChange({ kind: "binary", value: b, evidence: v?.evidence })}
            className={`rounded-[var(--radius-sm)] border py-3.5 text-[0.9375rem] font-medium transition-colors duration-[var(--dur-fast)] ${
              v?.value === b
                ? "border-accent bg-accent text-accent-ink"
                : "border-line bg-surface-2 text-ink hover:border-muted"
            }`}
          >
            {b ? "Yes" : "No"}
          </button>
        ))}
      </div>
      {evidence && v && (
        <div className="rise">
          <Label className="mb-1.5">The evidence</Label>
          <textarea
            className={proseCls}
            value={v.evidence ?? ""}
            onChange={(e) => onChange({ ...v, evidence: e.target.value })}
            placeholder={v.value ? "What would an outside audit accept?" : "What was true instead?"}
            rows={1}
          />
          <NoLimit />
        </div>
      )}
    </div>
  );
}

function EnumInput({
  value,
  onChange,
  options,
  note,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  options: string[];
  note?: boolean;
}) {
  const v = value?.kind === "enum" ? value : undefined;
  return (
    <div className="space-y-4">
      {note && (
        <div>
          <Label className="mb-1.5">The weakness — from the record</Label>
          <textarea
            className={proseCls}
            value={v?.note ?? ""}
            onChange={(e) => onChange({ kind: "enum", value: v?.value ?? "", note: e.target.value })}
            placeholder="Named precisely, not a theory about character"
            rows={1}
          />
          <NoLimit />
        </div>
      )}
      <div className={`grid gap-2 ${options.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange({ kind: "enum", value: o, note: v?.note })}
            className={`rounded-[var(--radius-sm)] border py-3 text-[0.875rem] font-medium capitalize transition-colors duration-[var(--dur-fast)] ${
              v?.value === o
                ? "border-accent bg-accent text-accent-ink"
                : "border-line bg-surface-2 text-ink hover:border-muted"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScaleInput({
  value,
  onChange,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  const v = value?.kind === "scale" ? value.value : undefined;
  return (
    <div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ kind: "scale", value: n })}
            className={`type-mono rounded-[var(--radius-sm)] border py-2.5 text-[0.8125rem] transition-colors duration-[var(--dur-fast)] ${
              v === n
                ? "border-accent bg-accent font-medium text-accent-ink"
                : "border-line bg-surface-2 text-ink hover:border-muted"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[0.6875rem] text-muted">
        <span>certain miss</span>
        <span>certain completion</span>
      </div>
    </div>
  );
}

function CountInput({
  value,
  onChange,
  metrics,
  prevValues,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  metrics: MetricDef[];
  prevValues?: Record<string, number>;
}) {
  const v = value?.kind === "count" ? value.values : {};
  const set = (key: string, n: number | undefined) => {
    const next = { ...v };
    if (n === undefined || Number.isNaN(n)) delete next[key];
    else next[key] = n;
    onChange({ kind: "count", values: next });
  };
  return (
    <div className="space-y-3">
      {metrics.map((m) => (
        <div key={m.key} className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[0.875rem] text-ink">{m.label}</div>
            {prevValues?.[m.key] !== undefined && (
              <div className="type-mono text-[0.6875rem] text-muted">last: {prevValues[m.key]}</div>
            )}
          </div>
          {/* Standalone width — fieldCls carries w-full, which buries the label. */}
          <input
            type="number"
            inputMode="numeric"
            className="type-mono w-28 shrink-0 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-right text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent"
            value={v[m.key] ?? ""}
            onChange={(e) => set(m.key, e.target.value === "" ? undefined : Number(e.target.value))}
            placeholder="0"
          />
          <span className="type-mono w-10 shrink-0 text-[0.75rem] text-muted">{m.unit}</span>
        </div>
      ))}
    </div>
  );
}

function ListInput({
  value,
  onChange,
  max,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  max: number;
}) {
  const items = value?.kind === "list" ? value.items : [];
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t || items.length >= max) return;
    onChange({ kind: "list", items: [...items, t] });
    setDraft("");
  };
  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2 text-[0.875rem]"
            >
              <span className="min-w-0 truncate">{it}</span>
              <button
                type="button"
                aria-label={`Remove ${it}`}
                onClick={() => onChange({ kind: "list", items: items.filter((_, x) => x !== i) })}
                className="text-muted hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length < max && (
        <div className="flex gap-2">
          <input
            className={fieldCls}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder="An artifact, a number, a submission"
            maxLength={90}
          />
          <button
            type="button"
            onClick={add}
            disabled={!draft.trim()}
            className="rounded-[var(--radius-sm)] border border-line px-4 text-[0.875rem] text-ink hover:bg-surface-2 disabled:opacity-35"
          >
            Add
          </button>
        </div>
      )}
      <div className="type-mono text-[0.6875rem] text-muted">
        {items.length}/{max}
      </div>
    </div>
  );
}

function LineInput({
  value,
  onChange,
  secondPrompt,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  secondPrompt?: string;
}) {
  const v = value?.kind === "line" ? value : { kind: "line" as const, value: "", second: "" };
  return (
    <div className="space-y-3">
      <div>
        <textarea
          className={proseCls}
          value={v.value}
          onChange={(e) => onChange({ ...v, value: e.target.value })}
          placeholder="Start with the truth. Keep going."
          rows={1}
        />
        <NoLimit />
      </div>
      {secondPrompt && (
        <div>
          <Label className="mb-1.5">{secondPrompt}</Label>
          <textarea
            className={proseCls}
            value={v.second ?? ""}
            onChange={(e) => onChange({ ...v, second: e.target.value })}
            placeholder="The replacement behaviour"
            rows={1}
          />
        </div>
      )}
    </div>
  );
}

function TextInput({
  value,
  onChange,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  const v = value?.kind === "text" ? value.value : "";
  return (
    <div>
      <textarea
        className={`${proseCls} min-h-24`}
        value={v}
        onChange={(e) => onChange({ kind: "text", value: e.target.value })}
        placeholder="Facts only. As long as it needs to be."
        rows={3}
      />
      <NoLimit />
    </div>
  );
}

function MissionInput({
  value,
  onChange,
}: {
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  const v = value?.kind === "mission" ? value : { kind: "mission" as const, when: "", where: "", what: "" };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1.5">When</Label>
          <input
            className={`${fieldCls} type-mono`}
            value={v.when}
            onChange={(e) => onChange({ ...v, when: e.target.value })}
            placeholder="6:00"
            maxLength={24}
          />
        </div>
        <div>
          <Label className="mb-1.5">Where</Label>
          <input
            className={fieldCls}
            value={v.where}
            onChange={(e) => onChange({ ...v, where: e.target.value })}
            placeholder="desk"
            maxLength={40}
          />
        </div>
      </div>
      <div>
        <Label className="mb-1.5">What — verifiable by a witness</Label>
        <input
          className={fieldCls}
          value={v.what}
          onChange={(e) => onChange({ ...v, what: e.target.value })}
          placeholder="Call the three largest prospects before opening email"
          maxLength={140}
        />
      </div>
    </div>
  );
}
