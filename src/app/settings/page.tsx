"use client";

// Settings — the token architecture made visible: mode preview, accent swaps
// inside contrast guardrails, question-set preferences, export stub.

import { Shell } from "@/components/shell";
import { Button, Card, Label } from "@/components/ui";
import { RankBadge } from "@/components/economy-ui";
import { RANKS } from "@/lib/economy";
import { ACCENT_PRESETS, useApp, useEconomy } from "@/lib/store";
import type { Mode } from "@/lib/types";

const MODE_BG: Record<Mode, string> = { student: "#0f1411", teacher: "#150f10" };

function luminance(hex: string): number {
  const c = parseInt(hex.slice(1), 16);
  const f = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f((c >> 16) & 255) + 0.7152 * f((c >> 8) & 255) + 0.0722 * f(c & 255);
}

function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

export default function SettingsPage() {
  const { mode, setMode, accents, setAccent, prefs, setPrefs, records, missions, areas, ledger } = useApp();
  const econ = useEconomy();

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ areas, records, missions, ledger }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "one-percent-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Shell>
      <Label>Settings</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">The instrument panel.</h1>

      <div className="mt-6 grid max-w-3xl gap-[var(--gap)]">
        <Card>
          <Label className="mb-3">Rank</Label>
          <RankBadge rank={econ.rank} balance={econ.balance} />
          <p className="mt-3 text-[0.75rem] text-muted">
            Ranks unlock cosmetics only — accents and seals. Nothing about the loop is purchasable.
          </p>
        </Card>

        <Card>
          <Label className="mb-3">Mode preview</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            The whole product is two token sets on one structure. Flip them here.
          </p>
          <div className="grid max-w-xs grid-cols-2 gap-2">
            {(["student", "teacher"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-[var(--radius-sm)] border py-2.5 text-[0.875rem] capitalize transition-colors duration-[var(--dur-fast)] ${
                  mode === m ? "border-accent bg-accent text-accent-ink font-medium" : "border-line bg-surface-2 text-ink"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Card>

        {(["student", "teacher"] as Mode[]).map((m) => (
          <Card key={m}>
            <Label className="mb-3">{m} accent</Label>
            <p className="mb-3 text-[0.8125rem] text-muted">
              Swaps route through tokens with contrast guardrails — pairs under 4.5:1 against the {m} ground
              are not offered. Higher accents are earned, not bought.
            </p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_PRESETS[m].map((p) => {
                const cr = contrast(p.accent, MODE_BG[m]);
                const active = accents[m].accent === p.accent;
                const unlocked = econ.rank.index >= p.rankReq;
                const legal = cr >= 4.5 && unlocked;
                return (
                  <button
                    key={p.name}
                    onClick={() => legal && setAccent(m, p)}
                    disabled={!legal}
                    className={`flex items-center gap-2.5 rounded-[var(--radius-sm)] border px-3 py-2 text-[0.8125rem] transition-colors duration-[var(--dur-fast)] ${
                      active ? "border-accent" : "border-line hover:border-muted"
                    } ${legal ? "" : "opacity-40"}`}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: p.accent }} />
                    <span className="text-ink">{p.name}</span>
                    <span className="type-mono text-[0.6875rem] text-muted">
                      {unlocked ? `${cr.toFixed(1)}:1` : `unlocks at ${RANKS[p.rankReq].name}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}

        <Card>
          <Label className="mb-3">Question set</Label>
          <div className="space-y-3">
            <PrefRow
              label="Phrasing rotation"
              detail="Core questions keep their IDs; phrasings rotate weekly against autopilot"
              value={prefs.rotation}
              onChange={(v) => setPrefs({ rotation: v })}
            />
            <PrefRow
              label="Deep tier"
              detail="Optional SD questions, user-pulled, max twice a week"
              value={prefs.deepTier}
              onChange={(v) => setPrefs({ deepTier: v })}
            />
            <PrefRow
              label="Mode-shift sound"
              detail="Off by default; the shift is visual"
              value={prefs.sound}
              onChange={(v) => setPrefs({ sound: v })}
            />
          </div>
        </Card>

        <Card>
          <Label className="mb-3">Data</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            The record belongs to you. Export everything as JSON.
          </p>
          <Button variant="ghost" onClick={exportData}>
            Export the record
          </Button>
        </Card>
      </div>
    </Shell>
  );
}

function PrefRow({
  label,
  detail,
  value,
  onChange,
}: {
  label: string;
  detail: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line pt-3 first:border-0 first:pt-0">
      <div>
        <div className="text-[0.875rem] text-ink">{label}</div>
        <div className="text-[0.75rem] text-muted">{detail}</div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-[var(--dur-fast)] ${
          value ? "border-accent bg-accent" : "border-line bg-surface-2"
        }`}
      >
        <span
          className={`absolute top-[3px] h-4 w-4 rounded-full transition-[left] duration-[var(--dur-fast)] ${
            value ? "left-[24px] bg-accent-ink" : "left-[3px] bg-muted"
          }`}
        />
      </button>
    </div>
  );
}
