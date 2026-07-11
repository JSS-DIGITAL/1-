"use client";

// The Vault Room (QUESTION_FRAMEWORK.md §12.10) — the sealed vault, live.
// Anyone can grab the wheel: it budges against real resistance, snaps back,
// DENIED. Sealing a record earns a skill-crack attempt (20s, three hidden
// sweet spots); a day of honest acts earns the three combination digits and
// the high loot table. Seven consecutive opens arm the Master Vault.

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, type MotionValue } from "framer-motion";
import { Shell } from "@/components/shell";
import { EtchedDial, MetalDefs, pt } from "@/components/mode-shift";
import { ArchiveDossiers, LootReveal, StreakPips } from "@/components/vault-ui";
import { skillTargets, RARITIES, VAULT_LOOT, type VaultItem } from "@/lib/vault";
import { dayOffset } from "@/lib/mock";
import { useApp } from "@/lib/store";
import { Button, Card, Chip, Label } from "@/components/ui";

const CX = 240;
const CY = 205;
const ERR_RED = "#FF4D42";

type RoomMode = "idle" | "skill" | "dial" | "open";

const norm = (a: number) => ((a % 360) + 360) % 360;
const angDist = (a: number, b: number) => {
  const d = Math.abs(norm(a) - norm(b));
  return Math.min(d, 360 - d);
};

export default function VaultRoomPage() {
  const { vault, spendVaultAttempt, openVault } = useApp();
  const today = dayOffset(0);
  const openedToday = vault.lastOpen === today;
  const digitsReady = vault.digits.seal && vault.digits.candor && vault.digits.calibration;
  const archiveOpen = vault.archiveUntil === today || vault.unlocks.includes("archive-perm");

  const [mode, setMode] = useState<RoomMode>("idle");
  const [loot, setLoot] = useState<VaultItem | null>(null);
  const [deniedKey, setDeniedKey] = useState(0);
  const [glow, setGlow] = useState(0);
  const [catches, setCatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [targets, setTargets] = useState<number[]>([]);

  const wheelRot = useMotionValue(0);
  const accRef = useRef(0);
  const holdRef = useRef(0);
  const modeRef = useRef<RoomMode>("idle");
  const targetIdxRef = useRef(0);
  const keyDenyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  modeRef.current = mode;

  const deny = useCallback(() => {
    animate(wheelRot, 0, { type: "spring", stiffness: 380, damping: 15 });
    accRef.current = 0;
    setDeniedKey((k) => k + 1);
  }, [wheelRot]);

  const win = useCallback(
    (m: "skill" | "combination" | "master") => {
      const item = openVault(m);
      if (!item) {
        // Guarded out (already opened today, master not armed): clean refusal.
        setMode("idle");
        setGlow(0);
        deny();
        return;
      }
      setLoot(item);
      setMode("open");
      setGlow(0);
      animate(wheelRot, 0, { duration: 0.4 });
      accRef.current = 0;
    },
    [openVault, wheelRot, deny]
  );

  // Sweet-spot detection: sampled — holding still fires no pan events.
  useEffect(() => {
    if (mode !== "skill" && mode !== "dial") return;
    const iv = setInterval(() => {
      const target = targets[targetIdxRef.current];
      if (target === undefined) return;
      const dist = angDist(wheelRot.get(), target);
      setGlow(Math.max(0, 1 - dist / 30));
      if (dist <= 8) {
        holdRef.current += 80;
        if (holdRef.current >= 400) {
          holdRef.current = 0;
          const next = targetIdxRef.current + 1;
          setCatches(next);
          if (next >= 3) {
            win(modeRef.current === "dial" ? "combination" : "skill");
          } else {
            targetIdxRef.current = next;
          }
        }
      } else {
        holdRef.current = 0;
      }
    }, 80);
    return () => clearInterval(iv);
  }, [mode, targets, win, wheelRot]);

  // The 20-second skill clock.
  useEffect(() => {
    if (mode !== "skill") return;
    if (timeLeft <= 0) {
      setMode("idle");
      setGlow(0);
      deny();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, timeLeft, deny]);

  const startSkill = () => {
    if (openedToday || !spendVaultAttempt()) return;
    setTargets(skillTargets());
    targetIdxRef.current = 0;
    holdRef.current = 0;
    setCatches(0);
    setTimeLeft(20);
    setMode("skill");
  };

  const startDial = () => {
    if (openedToday || !digitsReady) return;
    setTargets(vault.digitValues.map((d) => d * 36));
    targetIdxRef.current = 0;
    holdRef.current = 0;
    setCatches(0);
    setMode("dial");
  };

  const doorOpen = mode === "open";
  const gameOn = mode === "skill" || mode === "dial";

  return (
    <Shell>
      <div className="flex items-end justify-between gap-4">
        <div>
          <Label>The vault</Label>
          <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">Try the wheel.</h1>
        </div>
        <div className="text-right">
          <Label className="mb-1">Master vault</Label>
          <StreakPips streak={vault.streak} />
        </div>
      </div>
      <p className="mt-2 max-w-xl text-[0.875rem] text-muted">
        Sealing a record earns a crack attempt. An honest day earns the combination — and the combination
        opens the better table. Seven opens in a row arm the Master Vault.
      </p>

      {/* The room */}
      <div
        className="relative mt-6 overflow-hidden rounded-[var(--radius-md)] border border-line"
        style={{ background: "radial-gradient(85% 75% at 50% 30%, #141b23 0%, #0a0e13 55%, #05070a 100%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 140px 40px rgba(0,0,0,0.7)" }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-xl flex-col items-center px-4 py-8">
          <motion.div
            key={`shudder-${deniedKey}`}
            animate={deniedKey > 0 ? { x: [0, -7, 6, -4, 2, 0] } : { x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            tabIndex={0}
            role="application"
            aria-label="The vault wheel. Left and right arrows rotate it (hold Shift for speed); hold it steady where the marker burns to catch a sweet spot."
            className="rounded-[var(--radius-md)] outline-none focus-visible:ring-1 focus-visible:ring-accent/50"
            onKeyDown={(e) => {
              if (mode === "open") return;
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const step = (e.key === "ArrowRight" ? 3 : -3) * (e.shiftKey ? 5 : 1);
              accRef.current += step;
              if (gameOn) wheelRot.set(accRef.current);
              else {
                wheelRot.set(22 * Math.tanh(accRef.current / 60));
                if (keyDenyTimer.current) clearTimeout(keyDenyTimer.current);
                keyDenyTimer.current = setTimeout(() => {
                  if (Math.abs(wheelRot.get()) > 5) deny();
                }, 500);
              }
            }}
          >
            <InteractiveVaultSvg
              wheelRot={wheelRot}
              accRef={accRef}
              mode={mode}
              glow={glow}
              catches={catches}
              doorOpen={doorOpen}
              onDeny={deny}
              archiveGlow={archiveOpen || doorOpen}
            />
          </motion.div>

          {/* DENIED stamp */}
          {deniedKey > 0 && (
            <motion.div
              key={`denied-${deniedKey}`}
              initial={{ opacity: 0, scale: 2.2, rotate: -10 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [2.2, 1, 1, 1], rotate: -6 }}
              transition={{ duration: 1.1, times: [0, 0.15, 0.75, 1] }}
              className="type-mono pointer-events-none absolute top-[38%] rounded-[3px] border-2 px-4 py-1 text-[0.9375rem] font-bold uppercase tracking-[0.4em]"
              style={{ borderColor: ERR_RED, color: ERR_RED }}
              aria-hidden
            >
              Denied
            </motion.div>
          )}

          {/* Game HUD */}
          {gameOn && (
            <div className="type-mono mt-4 flex items-center gap-5 text-[0.75rem] text-muted">
              <span>
                catches <span className="text-ink">{catches}/3</span>
              </span>
              {mode === "skill" && (
                <span>
                  clock <span style={{ color: timeLeft <= 5 ? ERR_RED : "var(--ink)" }}>{timeLeft}s</span>
                </span>
              )}
              {mode === "dial" && (
                <span>
                  dial to <span style={{ color: "var(--gold)" }}>{vault.digitValues[catches] ?? "—"}</span>
                </span>
              )}
              <span className="text-muted/70">hold the wheel steady when the marker burns</span>
            </div>
          )}

          {/* Controls */}
          {mode === "idle" && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {openedToday ? (
                <Chip tone="accent">cracked today — the vault re-seals at midnight</Chip>
              ) : (
                <>
                  <Button onClick={startSkill} disabled={vault.attempts <= 0} variant="ghost">
                    Attempt the crack · {vault.attempts} left
                  </Button>
                  <Button onClick={startDial} disabled={!digitsReady}>
                    Dial the combination
                  </Button>
                </>
              )}
              {vault.masterAvailable && (
                <Button onClick={() => win("master")}>
                  <span style={{ color: "var(--gold)" }}>Open the Master Vault</span>
                </Button>
              )}
            </div>
          )}
          {doorOpen && (
            <Button className="mt-5" variant="ghost" onClick={() => setMode("idle")}>
              Step back
            </Button>
          )}

          {/* Tonight's digits */}
          <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2">
            <DigitPip label="Seal digit" hint="seal today's record" earned={vault.digits.seal} value={vault.digitValues[0]} />
            <DigitPip label="Candor digit" hint="name a real avoidance" earned={vault.digits.candor} value={vault.digitValues[1]} />
            <DigitPip label="Calibration digit" hint="land the wager within ±2" earned={vault.digits.calibration} value={vault.digitValues[2]} />
          </div>
        </div>
      </div>

      {/* The archive */}
      {(archiveOpen || doorOpen) && (
        <Card className="mt-[var(--gap)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Chip tone="accent">
              {vault.unlocks.includes("archive-perm") ? "archive key held — always open" : "open until midnight"}
            </Chip>
            <span className="type-mono text-[0.6875rem] text-muted">only you hold this door</span>
          </div>
          <ArchiveDossiers />
        </Card>
      )}

      {/* Collection shelf */}
      {vault.unlocks.length > 0 && (
        <Card className="mt-[var(--gap)]">
          <Label className="mb-2">The shelf — vault exclusives</Label>
          <div className="flex flex-wrap gap-2">
            {vault.unlocks.map((id) => (
              <ShelfItem key={id} id={id} />
            ))}
          </div>
        </Card>
      )}

      {loot && <LootReveal item={loot} onCollect={() => setLoot(null)} />}
    </Shell>
  );
}

function DigitPip({ label, hint, earned, value }: { label: string; hint: string; earned: boolean; value: number }) {
  return (
    <div
      className={`rounded-[var(--radius-sm)] border px-3 py-2.5 text-center ${
        earned ? "border-accent bg-accent/10" : "border-line bg-surface-2"
      }`}
    >
      <div className="type-mono text-[1.25rem]" style={{ color: earned ? "var(--gold)" : "var(--muted)" }}>
        {earned ? value : "?"}
      </div>
      <div className="type-mono mt-0.5 text-[0.5625rem] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-0.5 text-[0.625rem] text-muted/70">{earned ? "earned" : hint}</div>
    </div>
  );
}

function ShelfItem({ id }: { id: string }) {
  const found = VAULT_LOOT.find((i) => i.id === id);
  if (!found) return null;
  const r = RARITIES[found.rarity];
  return (
    <span
      className="type-mono rounded-full border px-3 py-1 text-[0.6875rem]"
      style={{ borderColor: r.color, color: r.color }}
      title={found.desc}
    >
      {found.name}
    </span>
  );
}

/** The interactive vault: v3 door art with a live, grabbable wheel. */
function InteractiveVaultSvg({
  wheelRot,
  accRef,
  mode,
  glow,
  catches,
  doorOpen,
  onDeny,
  archiveGlow,
}: {
  wheelRot: MotionValue<number>;
  accRef: React.MutableRefObject<number>;
  mode: RoomMode;
  glow: number;
  catches: number;
  doorOpen: boolean;
  onDeny: () => void;
  archiveGlow: boolean;
}) {
  const p = "vr";
  const gameOn = mode === "skill" || mode === "dial";

  return (
    <svg viewBox="0 0 480 420" style={{ width: "min(88vw, 460px)", height: "auto" }} aria-label="The vault — grab the wheel">
      <MetalDefs p={p} />

      {/* Wall plate */}
      <rect x="42" y="14" width="396" height="382" rx="20" fill={`url(#${p}-steelV)`} stroke="#0a0c0f" strokeWidth="3" />
      <rect x="42" y="14" width="396" height="382" rx="20" fill="none" stroke="#69727c" strokeWidth="1" opacity="0.25" />
      <rect x="42" y="14" width="396" height="382" rx="20" filter={`url(#${p}-brush)`} fill="#ffffff" opacity="0.9" />
      {[
        [64, 36],
        [416, 36],
        [64, 374],
        [416, 374],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="6" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="1.5" />
          <circle cx={x - 1.6} cy={y - 1.6} r="1.6" fill="#b9c1ca" opacity="0.8" />
        </g>
      ))}

      {/* Hinge column */}
      <rect x="18" y="80" width="30" height="252" rx="8" fill={`url(#${p}-steelSoft)`} stroke="#0a0c0f" strokeWidth="2.5" />
      {[102, 190, 278].map((y) => (
        <g key={y}>
          <rect x="10" y={y} width="46" height="40" rx="9" fill={`url(#${p}-steelV)`} stroke="#0a0c0f" strokeWidth="2" filter={`url(#${p}-soft)`} />
          <rect x="14" y={y + 4} width="38" height="4" rx="2" fill="#7d8791" opacity="0.45" />
        </g>
      ))}

      {/* Interior — archive glow when the door is open for you */}
      <circle cx={CX} cy={CY} r="130" fill={`url(#${p}-interior)`} stroke="#07090b" strokeWidth="7" />
      {archiveGlow && (
        <>
          <circle cx={CX} cy={CY} r="104" fill={`url(#${p}-glow)`} opacity="0.9" />
          {/* The stack inside */}
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={CX - 44 + i * 6}
              y={CY - 6 + i * 12}
              width="88"
              height="10"
              rx="2"
              fill={`url(#${p}-paper)`}
              stroke="#141210"
              strokeWidth="0.8"
              opacity={0.95 - i * 0.15}
            />
          ))}
        </>
      )}

      {/* The door */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}
        initial={false}
        animate={doorOpen ? { x: 118, scaleX: 0.26, opacity: 0.96 } : { x: 0, scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
      >
        {/* Piston bolts: retract in groups as catches land */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
          <g key={a} transform={`rotate(${a} ${CX} ${CY})`}>
            <motion.rect
              x={CX - 9}
              width="18"
              height="36"
              rx="7"
              fill={`url(#${p}-spoke)`}
              stroke="#0b0d10"
              strokeWidth="1.5"
              initial={false}
              animate={{ y: doorOpen || i < catches * 3 ? 84 : 42 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            />
          </g>
        ))}

        <circle cx={CX} cy={CY} r="151" fill="none" stroke="#0a0c0f" strokeWidth="7" />
        <circle cx={CX} cy={CY} r="146" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="13" />
        <circle cx={CX} cy={CY} r="138" fill={`url(#${p}-face)`} stroke="#0e1114" strokeWidth="2" filter={`url(#${p}-drop)`} />
        <circle cx={CX} cy={CY} r="138" filter={`url(#${p}-brush)`} fill="#ffffff" />
        <circle cx={CX} cy={CY} r="112" fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.3" />
        <circle cx={CX} cy={CY} r="90" fill="none" stroke="#000000" strokeWidth="1" opacity="0.25" />

        {Array.from({ length: 16 }, (_, i) => {
          const a = i * 22.5;
          const [x, y] = pt(CX, CY, 126, a);
          return (
            <g key={a}>
              <circle cx={x} cy={y} r="4.6" fill={`url(#${p}-hub)`} stroke="#0d1013" strokeWidth="1.2" />
              <circle cx={+(x - 1.4).toFixed(3)} cy={+(y - 1.4).toFixed(3)} r="1.3" fill="#c3cbd4" opacity="0.75" />
            </g>
          );
        })}

        <circle cx={CX} cy={CY} r="80" fill="none" stroke="#101318" strokeWidth="10" opacity="0.85" />

        {/* The marker: burns as the wheel nears a sweet spot */}
        <g opacity={gameOn ? 1 : 0.35}>
          <path d={`M ${CX - 8} ${CY - 96} L ${CX + 8} ${CY - 96} L ${CX} ${CY - 82} Z`} fill="#1a1e23" stroke="#0b0d10" strokeWidth="1" />
          <path
            d={`M ${CX - 8} ${CY - 96} L ${CX + 8} ${CY - 96} L ${CX} ${CY - 82} Z`}
            fill={mode === "dial" ? "var(--gold)" : "#ffd76a"}
            opacity={gameOn ? glow : 0}
          />
        </g>

        {/* The wheel — live rotation, grabbable */}
        <motion.g style={{ rotate: wheelRot, transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx={CX} cy={CY} r="64" fill="none" stroke="#0c0e11" strokeWidth="17" />
          <circle cx={CX} cy={CY} r="64" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="13" />
          {[0, 72, 144, 216, 288].map((a) => (
            <g key={a} transform={`rotate(${a} ${CX} ${CY})`}>
              <rect x={CX - 7} y={CY - 64} width="14" height="48" rx="7" fill={`url(#${p}-spoke)`} stroke="#0b0d10" strokeWidth="1.5" />
              <rect x={CX - 1.5} y={CY - 61} width="3" height="42" rx="1.5" fill="#cfd6dd" opacity="0.3" />
              <circle cx={CX} cy={CY - 64} r="8.5" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="1.5" />
            </g>
          ))}
          <circle cx={CX} cy={CY} r="24" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="2.5" filter={`url(#${p}-soft)`} />
          <ellipse cx={CX - 7} cy={CY - 8} rx="9" ry="6" fill="#dbe1e8" opacity="0.28" />
          <circle cx={CX} cy={CY} r="9" fill={`url(#${p}-steelSoft)`} stroke="#0b0d10" strokeWidth="1.5" />
        </motion.g>

        <EtchedDial cx={168} cy={128} p={p} spinning={false} locked={false} />
        <EtchedDial cx={312} cy={282} p={p} spinning={false} locked={false} />

        {/* Grab surface */}
        {!doorOpen && (
          <motion.circle
            cx={CX}
            cy={CY}
            r="76"
            fill="transparent"
            style={{ touchAction: "none", cursor: "grab" }}
            onPan={(_, info) => {
              accRef.current += info.delta.x * 0.55;
              if (gameOn) {
                wheelRot.set(accRef.current);
              } else {
                // Idle: real resistance — it budges, it does not turn.
                wheelRot.set(22 * Math.tanh(accRef.current / 60));
              }
            }}
            onPanEnd={() => {
              if (!gameOn) {
                if (Math.abs(wheelRot.get()) > 5) onDeny();
                else {
                  accRef.current = 0;
                  wheelRot.set(0);
                }
              }
            }}
          />
        )}
      </motion.g>

      {/* Floor */}
      <ellipse cx={CX} cy="404" rx="200" ry="13" fill="#000000" opacity="0.55" />
      <ellipse cx={CX} cy="402" rx="150" ry="8" fill={`url(#${p}-glow)`} opacity="0.3" />
    </svg>
  );
}
