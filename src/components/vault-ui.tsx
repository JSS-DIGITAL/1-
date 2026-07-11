"use client";

// Vault Game surfaces: the loot reveal, rarity chrome, streak pips, and the
// Archive (sealed records as TOP-SECRET dossiers inside the open door).
// Rarity colors are loot-only — never UI semantics (DESIGN_SYSTEM.md §8h).

import { useState } from "react";
import { motion } from "framer-motion";
import { RARITIES, type VaultItem } from "@/lib/vault";
import type { DayRecord } from "@/lib/types";
import { useApp } from "@/lib/store";
import { CountUp } from "./charts";
import { Button, Label } from "./ui";

export function RarityChip({ rarity }: { rarity: VaultItem["rarity"] }) {
  const r = RARITIES[rarity];
  return (
    <span
      className="type-mono inline-block rounded-full border px-3 py-0.5 text-[0.625rem] uppercase tracking-[0.3em]"
      style={{ borderColor: r.color, color: r.color }}
    >
      {r.name}
    </span>
  );
}

/** Seven pips to the Master Vault. */
export function StreakPips({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`${streak} of 7 consecutive opens`}>
      {Array.from({ length: 7 }, (_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full"
          style={{
            background: i < streak ? "var(--gold)" : "transparent",
            border: `1px solid ${i < streak ? "var(--gold)" : "var(--line)"}`,
          }}
        />
      ))}
    </div>
  );
}

/** Full-screen loot reveal — glow scales with the tier. */
export function LootReveal({ item, onCollect }: { item: VaultItem; onCollect: () => void }) {
  const r = RARITIES[item.rarity];
  const big = item.rarity === "legendary" || item.rarity === "mythic";
  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/80 px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-label={`Vault reward: ${item.name}`}
    >
      <motion.div
        initial={{ scale: 0.6, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="w-full max-w-sm rounded-[var(--radius-md)] border-2 bg-surface p-7 text-center"
        style={{
          borderColor: r.color,
          boxShadow: `0 0 ${big ? 80 : 40}px ${r.glow}, inset 0 0 ${big ? 46 : 22}px ${r.glow}`,
        }}
      >
        <RarityChip rarity={item.rarity} />
        <h2 className="type-display mt-4 text-[1.6rem] leading-tight" style={{ color: r.color }}>
          {item.name}
        </h2>
        {item.kind === "bp" && item.bp !== undefined && (
          <p className="type-mono mt-3 text-[1.75rem]" style={{ color: "var(--gold)" }}>
            +<CountUp to={item.bp} /> bp
          </p>
        )}
        <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">{item.desc}</p>
        <p className="type-mono mt-4 text-[0.6875rem] text-muted/70">
          {item.kind === "bp" && "logged to the ledger · source: vault"}
          {item.kind === "accent" && "equip it in Settings → accents"}
          {item.kind === "sealskin" && "displayed on your vault shelf"}
          {item.kind === "feature" && "active everywhere, immediately"}
          {item.kind === "archive" && (item.permanent ? "the archive never closes for you again" : "the archive stands open until midnight")}
        </p>
        <Button className="mt-6 w-full" onClick={onCollect}>
          Collect
        </Button>
      </motion.div>
    </motion.div>
  );
}

/** The Archive: sealed records as dossiers inside the open vault. */
export function ArchiveDossiers() {
  const { records, areas } = useApp();
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="w-full">
      <Label className="mb-2">The archive — only what is written exists</Label>
      <div className="grid max-h-[420px] gap-2 overflow-y-auto pr-1">
        {sorted.map((rec) => (
          <Dossier key={`${rec.date}-${rec.areaId}`} rec={rec} areaName={areas.find((a) => a.id === rec.areaId)?.name ?? "—"} />
        ))}
        {sorted.length === 0 && <p className="text-[0.8125rem] text-muted">Nothing sealed yet. The vault waits.</p>}
      </div>
    </div>
  );
}

function Dossier({ rec, areaName }: { rec: DayRecord; areaName: string }) {
  const [open, setOpen] = useState(false);
  const prose = Object.entries(rec.answers)
    .filter(([k, v]) => (k.startsWith("SP") || k.startsWith("TP")) && v.kind === "text" && v.value.trim())
    .slice(0, 3);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="rounded-[6px] border px-4 py-3 text-left"
      style={{
        background: "linear-gradient(180deg, #d9cfae 0%, #bdb28c 100%)",
        borderColor: "#141210",
        boxShadow: "0 6px 14px rgba(0,0,0,0.45)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className="type-mono text-[0.625rem] font-bold uppercase tracking-[0.3em]"
          style={{ color: "#8e1420" }}
        >
          Top Secret
        </span>
        <span className="type-mono text-[0.6875rem]" style={{ color: "#4f4a39" }}>
          {rec.date} · {areaName} · {rec.kind === "mvd" ? "minimum" : "full"}
        </span>
      </div>
      {rec.weakness && (
        <p className="mt-1.5 text-[0.8125rem] font-medium" style={{ color: "#2a2618" }}>
          Weakness on file: {rec.weakness.text} ({rec.weakness.recurrence})
        </p>
      )}
      {open && (
        <div className="mt-2 space-y-1.5 border-t pt-2" style={{ borderColor: "#a2966f" }}>
          {prose.map(([k, v]) => (
            <p key={k} className="text-[0.75rem] leading-snug" style={{ color: "#3a3524" }}>
              {v.kind === "text" ? v.value : ""}
            </p>
          ))}
          {prose.length === 0 && (
            <p className="text-[0.75rem] italic" style={{ color: "#6b6248" }}>
              A thin record — anchors only.
            </p>
          )}
        </div>
      )}
      <p className="type-mono mt-1.5 text-[0.5625rem] uppercase tracking-[0.2em]" style={{ color: "#6b6248" }}>
        {open ? "close file" : "open file"} · seal: {rec.seal?.label ?? "standard"}
      </p>
    </button>
  );
}
