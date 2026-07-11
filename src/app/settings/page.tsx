"use client";

// Settings — the token architecture made visible: mode preview, accent swaps
// inside contrast guardrails, question-set preferences, export stub.

import { useRef, useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, Label } from "@/components/ui";
import { InstallApp } from "@/components/install-app";
import { RankBadge } from "@/components/economy-ui";
import { RANKS } from "@/lib/economy";
import { ACCENT_PRESETS, useApp, useEconomy } from "@/lib/store";
import { daysSinceBackup, markBackupNow } from "@/lib/persist";
import { RARITIES, VAULT_ACCENTS, VAULT_LOOT } from "@/lib/vault";
import type { Mode } from "@/lib/types";

const MODE_BG: Record<Mode, string> = { student: "#0a0c0b", teacher: "#0d0a0b" };

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
  const { mode, setMode, accents, setAccent, prefs, setPrefs, vault, loadDemo, wipeAll, importData, exportSnapshot, account, records } = useApp();
  const econ = useEconomy();
  const [dataMsg, setDataMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const exportData = () => {
    // The full device state — this file IS the backup, nothing missing.
    const blob = new Blob([JSON.stringify(exportSnapshot(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "one-percent-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    markBackupNow();
    setDataMsg("backup exported — keep it somewhere safe.");
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const ok = importData(JSON.parse(await file.text()));
      setDataMsg(ok ? "backup restored — everything is back on the books." : "that file isn't a 1% backup.");
    } catch {
      setDataMsg("that file isn't a 1% backup.");
    }
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
              {/* Vault exclusives — won at the vault, never bought. */}
              {VAULT_ACCENTS.filter((va) => va.mode === m).map((va) => {
                const owned = vault.unlocks.includes(va.itemId);
                const active = accents[m].accent === va.pair.accent;
                const rarity = VAULT_LOOT.find((i) => i.id === va.itemId)?.rarity ?? "common";
                return (
                  <button
                    key={va.itemId}
                    onClick={() => owned && setAccent(m, { ...va.pair, rankReq: 0 })}
                    disabled={!owned}
                    className={`flex items-center gap-2.5 rounded-[var(--radius-sm)] border px-3 py-2 text-[0.8125rem] transition-colors duration-[var(--dur-fast)] ${
                      active ? "border-accent" : "border-line hover:border-muted"
                    } ${owned ? "" : "opacity-40"}`}
                    style={owned ? { borderColor: RARITIES[rarity].color } : undefined}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: va.pair.accent }} />
                    <span className="text-ink">{va.pair.name}</span>
                    <span className="type-mono text-[0.6875rem]" style={{ color: RARITIES[rarity].color }}>
                      {owned ? RARITIES[rarity].name.toLowerCase() : "crack the vault"}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}

        {vault.unlocks.includes("feat-seal-label") && (
          <Card>
            <Label className="mb-3">The Signet — legendary vault unlock</Label>
            <p className="mb-3 text-[0.8125rem] text-muted">
              Your words, pressed into every seal from tonight on.
            </p>
            <input
              className="w-full max-w-xs rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent"
              placeholder="e.g. Sealed by the operator"
              maxLength={32}
              value={prefs.customSealLabel ?? ""}
              onChange={(e) => setPrefs({ customSealLabel: e.target.value })}
            />
          </Card>
        )}

        <Card>
          <Label className="mb-3">Experience</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            Two speeds, one system. Simple keeps the essentials and defaults to the minimum day; Operator
            shows every instrument.
          </p>
          <div className="grid max-w-xs grid-cols-2 gap-2">
            {(["simple", "operator"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setPrefs({ density: d })}
                className={`rounded-[var(--radius-sm)] border py-2.5 text-[0.875rem] capitalize transition-colors duration-[var(--dur-fast)] ${
                  prefs.density === d
                    ? "border-accent bg-accent text-accent-ink font-medium"
                    : "border-line bg-surface-2 text-ink"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

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
              label="Hard lines"
              detail="Aggressive one-liners in the chrome. Never inside questions or payouts"
              value={prefs.hardLines}
              onChange={(v) => setPrefs({ hardLines: v })}
            />
            <PrefRow
              label="Daily push"
              detail="Calls you out if the record is empty (stub in the prototype)"
              value={prefs.dailyPush}
              onChange={(v) => setPrefs({ dailyPush: v })}
            />
            {prefs.dailyPush && (
              <div className="flex items-center justify-between gap-4 pl-4">
                <span className="text-[0.75rem] text-muted">Reminder time</span>
                <input
                  type="time"
                  value={prefs.pushTime}
                  onChange={(e) => setPrefs({ pushTime: e.target.value })}
                  className="type-mono rounded-[var(--radius-sm)] border border-line bg-surface-2 px-2 py-1 text-[0.8125rem] text-ink outline-none focus:border-accent"
                />
              </div>
            )}
            <PrefRow
              label="Mode-shift sound"
              detail="Off by default; the shift is visual"
              value={prefs.sound}
              onChange={(v) => setPrefs({ sound: v })}
            />
          </div>
        </Card>

        <Card>
          <Label className="mb-3">Integrations</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            Auto-fill the scoreboard from where the numbers already live.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Apple Health", "Google Calendar", "Notion export", "Zapier"].map((n) => (
              <span key={n} className="type-mono rounded-full border border-line px-3 py-1.5 text-[0.6875rem] text-muted">
                {n} · coming
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <Label className="mb-3">Install</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            1% installs like a real app — full screen, its own icon, works offline.
          </p>
          <InstallApp />
        </Card>

        <Card>
          <Label className="mb-3">Data</Label>
          <p className="mb-3 text-[0.8125rem] text-muted">
            The record belongs to you — it lives on this device only. The export is your backup: take one
            before long absences (phone browsers can evict storage after weeks of disuse) or before
            switching devices.
            {account && (
              <span className="type-mono mt-1 block text-[0.6875rem] text-muted/80">
                registered: {account.email} · sync is coming — until then the backup file moves devices
              </span>
            )}
          </p>
          {records.length > 0 &&
            (() => {
              const d = daysSinceBackup();
              if (d !== null && d < 14) return null;
              return (
                <p className="type-mono mb-3 text-[0.75rem]" style={{ color: "var(--gold)" }}>
                  ⚠ {d === null ? "no backup taken yet" : `last backup ${d} days ago`} — your record deserves one.
                </p>
              );
            })()}
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={exportData}>
              Export backup
            </Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              Import backup
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm("Load the demo world? Your current data will be replaced — export first if it matters.")) {
                  loadDemo();
                  setDataMsg("demo world loaded.");
                }
              }}
            >
              Load demo data
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm("Wipe everything on this device? This cannot be undone — export first if it matters.")) {
                  wipeAll();
                  setDataMsg("clean slate. day one starts now.");
                }
              }}
            >
              <span style={{ color: "#FF4D42" }}>Wipe everything</span>
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              onImportFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {dataMsg && <p className="type-mono mt-3 text-[0.75rem] text-muted">{dataMsg}</p>}
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
