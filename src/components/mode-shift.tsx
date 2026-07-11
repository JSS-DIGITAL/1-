"use client";

// The Vault Seal v3 — the signature moment as forced theatre (~6.5s), now in
// machined steel. A sealed letter is locked into a bank vault: letter →
// insertion → door slam + rumble → wheel ballet → piston bolts + clunk →
// VAULTED badge → the line → the blood gate. No skip (founder ruling: the
// wait is the mental reset between modes) and no compressed cut — one ritual,
// every day, both paths. The temperature inversion fires at the user's click:
// the button bleeds until blood floods the screen. Static under reduced motion.

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import { useApp } from "@/lib/store";
import { MODE_SHIFT_LINE } from "@/lib/framework";

type Stage =
  | "letter"
  | "insert"
  | "slam"
  | "wheels"
  | "lock"
  | "badge"
  | "line"
  | "ready"
  | "drip"
  | "flood";

const ORDER: Stage[] = ["letter", "insert", "slam", "wheels", "lock", "badge", "line", "ready", "drip", "flood"];

const FULL_TIMELINE: [number, Stage][] = [
  [1100, "insert"],
  [1900, "slam"],
  [2400, "wheels"],
  [4600, "lock"],
  [5100, "badge"],
  [5350, "line"],
  [5900, "ready"],
];

// Blood is local and explicit: the app is still Student-emerald when the gate
// appears, so --accent is unusable — and gold stays money-only.
const BLOOD = "#a11220";
const BLOOD_DEEP = "#6f0a12";
const BLOOD_DARK = "#43060b";

const DRIPS = [
  { left: "9%", w: 5, h: 96, delay: 0 },
  { left: "24%", w: 3, h: 54, delay: 0.09 },
  { left: "40%", w: 7, h: 134, delay: 0.04 },
  { left: "57%", w: 4, h: 72, delay: 0.16 },
  { left: "72%", w: 8, h: 150, delay: 0.1 },
  { left: "88%", w: 3, h: 62, delay: 0.2 },
];

/** Trig helper — coordinates rounded, or SSR/client float drift breaks hydration. */
export function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [+(cx + Math.cos(rad) * r).toFixed(3), +(cy + Math.sin(rad) * r).toFixed(3)];
}

const CX = 240;
const CY = 205;

/** Shared metal defs. Ids are prefixed per instance to avoid collisions. */
export function MetalDefs({ p }: { p: string }) {
  return (
    <defs>
      <linearGradient id={`${p}-steelV`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4c545c" />
        <stop offset="0.5" stopColor="#2c3138" />
        <stop offset="1" stopColor="#191d22" />
      </linearGradient>
      <linearGradient id={`${p}-steelSoft`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3d444b" />
        <stop offset="1" stopColor="#20242a" />
      </linearGradient>
      <linearGradient id={`${p}-spoke`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#616a73" />
        <stop offset="0.5" stopColor="#3b4249" />
        <stop offset="1" stopColor="#22262c" />
      </linearGradient>
      <linearGradient id={`${p}-bezel`} x1="0" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor="#79828c" />
        <stop offset="0.45" stopColor="#3a4047" />
        <stop offset="1" stopColor="#101317" />
      </linearGradient>
      <radialGradient id={`${p}-face`} cx="0.38" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#525a63" />
        <stop offset="0.45" stopColor="#383e45" />
        <stop offset="0.8" stopColor="#24282e" />
        <stop offset="1" stopColor="#181c21" />
      </radialGradient>
      <radialGradient id={`${p}-hub`} cx="0.38" cy="0.32" r="0.9">
        <stop offset="0" stopColor="#79828c" />
        <stop offset="0.6" stopColor="#3c434a" />
        <stop offset="1" stopColor="#1e2227" />
      </radialGradient>
      <radialGradient id={`${p}-interior`} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0" stopColor="#101214" />
        <stop offset="0.7" stopColor="#08090b" />
        <stop offset="1" stopColor="#040506" />
      </radialGradient>
      <radialGradient id={`${p}-glow`} cx="0.5" cy="0.5" r="0.5">
        {/* Warm-neutral light — deliberately NOT the gold token (gold = money only). */}
        <stop offset="0" stopColor="#e8dcc4" stopOpacity="0.5" />
        <stop offset="0.55" stopColor="#e8dcc4" stopOpacity="0.14" />
        <stop offset="1" stopColor="#e8dcc4" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${p}-paper`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2d7b8" />
        <stop offset="1" stopColor="#b3a783" />
      </linearGradient>
      <radialGradient id={`${p}-wax`} cx="0.35" cy="0.3" r="0.9">
        <stop offset="0" stopColor="#b32036" />
        <stop offset="0.7" stopColor="#7c1120" />
        <stop offset="1" stopColor="#530a13" />
      </radialGradient>
      <filter id={`${p}-brush`} x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.55" numOctaves="2" result="n" />
        <feColorMatrix
          in="n"
          type="matrix"
          values="0 0 0 0 0.75  0 0 0 0 0.8  0 0 0 0 0.86  0 0 0 0.05 0"
          result="tint"
        />
        <feComposite in="tint" in2="SourceGraphic" operator="in" />
      </filter>
      <filter id={`${p}-drop`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.6" />
      </filter>
      <filter id={`${p}-soft`} x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000000" floodOpacity="0.5" />
      </filter>
    </defs>
  );
}

export function EtchedDial({
  cx,
  cy,
  p,
  spinning,
  locked,
}: {
  cx: number;
  cy: number;
  p: string;
  spinning: boolean;
  locked: boolean;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="24" fill={`url(#${p}-steelSoft)`} stroke="#0c0e11" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="20" fill={`url(#${p}-face)`} stroke="#545c64" strokeWidth="0.8" opacity="0.9" />
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={locked ? { rotate: -1780 } : spinning ? { rotate: -1800 } : { rotate: 0 }}
        transition={
          locked
            ? { type: "spring", stiffness: 600, damping: 16 }
            : { duration: 2.1, ease: [0.25, 0.1, 0.15, 1] }
        }
      >
        {Array.from({ length: 12 }, (_, i) => {
          const a = i * 30;
          const [x1, y1] = pt(cx, cy, 13, a);
          const [x2, y2] = pt(cx, cy, 18, a);
          return (
            <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a7afb8" strokeWidth={i % 3 === 0 ? 2 : 1} opacity="0.55" />
          );
        })}
        <circle cx={cx} cy={cy} r="5" fill={`url(#${p}-hub)`} stroke="#0c0e11" strokeWidth="1" />
      </motion.g>
    </g>
  );
}

/** The vault scene — machined steel on a mounted wall plate. */
function VaultScene({ stage, reduced }: { stage: Stage; reduced: boolean }) {
  const p = "v3";
  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s);
  const doorOpen = !reduced && !reached("slam");
  const spinning = reached("wheels") && !reached("lock");
  const locked = reached("lock") || reduced;

  return (
    <motion.svg
      viewBox="0 0 480 470"
      style={{ width: "min(88vw, 480px)", height: "auto" }}
      aria-label="The record, sealed into the vault"
      animate={
        reduced
          ? {}
          : stage === "slam"
            ? { x: [0, -8, 7, -5, 4, -2, 0], y: [0, 4, -3, 2, -1, 1, 0] }
            : stage === "lock"
              ? { x: [0, -4, 3, -1, 0], y: [0, 2, -1, 0, 0] }
              : { x: 0, y: 0 }
      }
      transition={{ duration: stage === "slam" ? 0.55 : 0.4, ease: "easeOut" }}
    >
      <MetalDefs p={p} />

      {/* Wall plate the door is mounted on */}
      <rect x="42" y="18" width="396" height="380" rx="20" fill={`url(#${p}-steelV)`} stroke="#0a0c0f" strokeWidth="3" />
      <rect x="42" y="18" width="396" height="380" rx="20" fill="none" stroke="#69727c" strokeWidth="1" opacity="0.25" />
      <rect x="42" y="18" width="396" height="380" rx="20" filter={`url(#${p}-brush)`} fill="#ffffff" opacity="0.9" />
      {[
        [64, 40],
        [416, 40],
        [64, 376],
        [416, 376],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="6" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="1.5" />
          <circle cx={x - 1.6} cy={y - 1.6} r="1.6" fill="#b9c1ca" opacity="0.8" />
        </g>
      ))}

      {/* Hinge column */}
      <rect x="18" y="82" width="30" height="252" rx="8" fill={`url(#${p}-steelSoft)`} stroke="#0a0c0f" strokeWidth="2.5" />
      {[104, 192, 280].map((y) => (
        <g key={y}>
          <rect x="10" y={y} width="46" height="40" rx="9" fill={`url(#${p}-steelV)`} stroke="#0a0c0f" strokeWidth="2" filter={`url(#${p}-soft)`} />
          <rect x="14" y={y + 4} width="38" height="4" rx="2" fill="#7d8791" opacity="0.45" />
        </g>
      ))}

      {/* The dark interior — visible while the door hangs open */}
      <circle cx={CX} cy={CY} r="130" fill={`url(#${p}-interior)`} stroke="#07090b" strokeWidth="7" />
      <circle cx={CX} cy={CY} r="121" fill="none" stroke="#3a4046" strokeWidth="1" opacity="0.35" />
      {!reduced && (
        <motion.circle
          cx={CX}
          cy={CY}
          r="104"
          fill={`url(#${p}-glow)`}
          animate={{ opacity: reached("slam") ? 0 : reached("insert") ? 0.95 : 0.45 }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* The sealed letter — rises, then slides into the dark */}
      {!reduced && !reached("slam") && (
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          initial={{ y: 84, opacity: 0 }}
          animate={
            reached("insert")
              ? { y: -210, scale: 0.3, opacity: [1, 1, 0.9, 0] }
              : { y: 0, opacity: 1 }
          }
          transition={
            reached("insert")
              ? { duration: 0.8, ease: [0.5, 0, 0.7, 0.4], times: [0, 0.6, 0.85, 1] }
              : { duration: 0.9, ease: [0.16, 1, 0.3, 1] }
          }
        >
          <rect x="165" y="372" width="150" height="86" rx="8" fill={`url(#${p}-paper)`} stroke="#141210" strokeWidth="1.5" filter={`url(#${p}-soft)`} />
          <path d="M165 375 L240 431 L315 375 Z" fill="#000000" opacity="0.13" />
          <path d="M165 374 L240 430 L315 374" fill="none" stroke="#8d8264" strokeWidth="1.5" />
          <text
            x="240"
            y="401"
            textAnchor="middle"
            fontSize="14"
            fontWeight="800"
            letterSpacing="5"
            fill="#8e1420"
            opacity="0.85"
            transform="rotate(-6 240 401)"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            TOP SECRET
          </text>
          <circle cx="240" cy="430" r="13" fill={`url(#${p}-wax)`} stroke="#3f0810" strokeWidth="1" />
          <ellipse cx="236" cy="426" rx="4.5" ry="3" fill="#e08a97" opacity="0.5" />
          <text
            x="240"
            y="452"
            textAnchor="middle"
            fontSize="8.5"
            letterSpacing="4"
            fill="#4f4a39"
            style={{ fontFamily: "var(--font-mono, monospace)" }}
          >
            SEALED
          </text>
        </motion.g>
      )}

      {/* The door: hangs open edge-on, slams to identity */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}
        initial={false}
        animate={doorOpen ? { x: 118, scaleX: 0.26, opacity: 0.96 } : { x: 0, scaleX: 1, opacity: 1 }}
        transition={doorOpen ? { duration: 0 } : { duration: 0.12, ease: [0.9, 0, 1, 1] }}
      >
        {/* Piston bolts — under the disk, sliding out into the frame gap at lock */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
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
              animate={{ y: locked ? 42 : 84 }}
              transition={{ type: "spring", stiffness: 500, damping: 22, delay: reduced ? 0 : (a / 45) * 0.03 }}
            />
          </g>
        ))}

        {/* Bezel + disk */}
        <circle cx={CX} cy={CY} r="151" fill="none" stroke="#0a0c0f" strokeWidth="7" />
        <circle cx={CX} cy={CY} r="146" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="13" />
        <circle cx={CX} cy={CY} r="138" fill={`url(#${p}-face)`} stroke="#0e1114" strokeWidth="2" filter={`url(#${p}-drop)`} />
        <circle cx={CX} cy={CY} r="138" filter={`url(#${p}-brush)`} fill="#ffffff" />

        {/* Etch rings */}
        <circle cx={CX} cy={CY} r="112" fill="none" stroke="#000000" strokeWidth="1.5" opacity="0.3" />
        <circle cx={CX} cy={CY} r="110" fill="none" stroke="#8b949e" strokeWidth="0.8" opacity="0.18" />
        <circle cx={CX} cy={CY} r="90" fill="none" stroke="#000000" strokeWidth="1" opacity="0.25" />

        {/* Rivet ring */}
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

        {/* Wheel recess */}
        <circle cx={CX} cy={CY} r="80" fill="none" stroke="#101318" strokeWidth="10" opacity="0.85" />
        <circle cx={CX} cy={CY} r="86" fill="none" stroke="#5a626b" strokeWidth="1" opacity="0.25" />

        {/* The wheel: torus + capsule spokes + domed hub */}
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            locked
              ? { rotate: reduced ? 70 : 1250 }
              : spinning
                ? { rotate: [0, 400, 370, 860, 830, 1260] }
                : { rotate: 0 }
          }
          transition={
            locked
              ? { type: "spring", stiffness: 650, damping: 17 }
              : { duration: 2.15, times: [0, 0.3, 0.38, 0.68, 0.75, 1], ease: "easeInOut" }
          }
        >
          <circle cx={CX} cy={CY} r="64" fill="none" stroke="#0c0e11" strokeWidth="17" />
          <circle cx={CX} cy={CY} r="64" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="13" />
          <circle cx={CX} cy={CY} r="64" fill="none" stroke="#9aa3ad" strokeWidth="1.6" opacity="0.35" strokeDasharray="70 332" strokeDashoffset="30" />
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

        {/* Auxiliary dials — counter-spin, faster */}
        <EtchedDial cx={168} cy={128} p={p} spinning={spinning} locked={locked} />
        <EtchedDial cx={312} cy={282} p={p} spinning={spinning} locked={locked} />
      </motion.g>

      {/* Impact: flash ring + dust burst on the slam */}
      {!reduced && stage === "slam" && (
        <>
          <motion.circle
            cx={CX}
            cy={CY}
            r="146"
            fill="none"
            stroke="#cfd6dd"
            strokeWidth="3"
            initial={{ opacity: 0.4, scale: 0.98 }}
            animate={{ opacity: 0, scale: 1.05 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {[15, 70, 130, 200, 260, 320].map((a) => {
            const [x, y] = pt(CX, CY, 150, a);
            const [tx, ty] = pt(CX, CY, 178, a);
            return (
              <motion.circle
                key={a}
                r="2.4"
                fill="#b9c1ca"
                initial={{ cx: x, cy: y, opacity: 0.7 }}
                animate={{ cx: tx, cy: ty, opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
              />
            );
          })}
        </>
      )}

      {/* Floor: horizon + light puddle + soft reflection */}
      <ellipse cx={CX} cy="452" rx="200" ry="14" fill="#000000" opacity="0.55" />
      <ellipse cx={CX} cy="450" rx="150" ry="9" fill={`url(#${p}-glow)`} opacity="0.35" />
      <rect x="0" y="446" width="480" height="1.5" fill="#39414a" opacity="0.35" />
    </motion.svg>
  );
}

/** Static locked-vault glyph — kept for the landing page ("The record is sealed"). */
export function Vault({ reduced: _reduced = true }: { reduced?: boolean }) {
  const p = "lv";
  return (
    <svg width="150" height="150" viewBox="0 0 300 300" aria-label="Record sealed in the vault">
      <MetalDefs p={p} />
      <circle cx="150" cy="150" r="128" fill="none" stroke="#0a0c0f" strokeWidth="6" />
      <circle cx="150" cy="150" r="124" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="11" />
      <circle cx="150" cy="150" r="117" fill={`url(#${p}-face)`} stroke="#0e1114" strokeWidth="2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <g key={a} transform={`rotate(${a} 150 150)`}>
          <rect x="142" y="18" width="16" height="26" rx="6" fill={`url(#${p}-spoke)`} stroke="#0b0d10" strokeWidth="1.5" />
        </g>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = i * 30;
        const [x, y] = pt(150, 150, 104, a);
        return <circle key={a} cx={x} cy={y} r="4" fill={`url(#${p}-hub)`} stroke="#0d1013" strokeWidth="1" />;
      })}
      <circle cx="150" cy="150" r="66" fill="none" stroke="#101318" strokeWidth="8" opacity="0.85" />
      <g transform="rotate(20 150 150)">
        <circle cx="150" cy="150" r="52" fill="none" stroke="#0c0e11" strokeWidth="14" />
        <circle cx="150" cy="150" r="52" fill="none" stroke={`url(#${p}-bezel)`} strokeWidth="10" />
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a} 150 150)`}>
            <rect x="144" y="98" width="12" height="40" rx="6" fill={`url(#${p}-spoke)`} stroke="#0b0d10" strokeWidth="1.2" />
            <circle cx="150" cy="98" r="7" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="150" cy="150" r="19" fill={`url(#${p}-hub)`} stroke="#0b0d10" strokeWidth="2" />
        <ellipse cx="144" cy="143" rx="7" ry="4.5" fill="#dbe1e8" opacity="0.28" />
      </g>
    </svg>
  );
}

export function ModeShift({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReduced();
  const { setMode } = useApp();
  const [stage, setStage] = useState<Stage>("letter");
  const [floodCenter, setFloodCenter] = useState<{ x: number; y: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const doneRef = useRef(onDone);
  const finished = useRef(false);
  const bleedTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    doneRef.current();
  }, []);

  const reached = (s: Stage) => ORDER.indexOf(stage) >= ORDER.indexOf(s);

  // The cinematic timeline. No skip — the wait is part of the ritual.
  useEffect(() => {
    if (reduced) {
      setStage("ready");
      return;
    }
    const timers = FULL_TIMELINE.map(([ms, s]) => setTimeout(() => setStage(s), ms));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const timers = bleedTimers.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  // The gate: the button bleeds, the flood covers, the Teacher room is under it.
  const beginBleed = () => {
    if (stage !== "ready") return;
    if (reduced) {
      setMode("teacher", false);
      finish();
      return;
    }
    const rect = btnRef.current?.getBoundingClientRect();
    setFloodCenter(
      rect
        ? { x: Math.round(rect.left + rect.width / 2), y: Math.round(rect.top + rect.height / 2) }
        : { x: Math.round(window.innerWidth / 2), y: Math.round(window.innerHeight * 0.7) }
    );
    setStage("drip");
    bleedTimers.current.push(
      setTimeout(() => setStage("flood"), 600),
      setTimeout(() => setMode("teacher", false), 600 + 550),
      setTimeout(() => finish(), 600 + 750 + 150)
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden px-6"
      style={{
        background: "radial-gradient(85% 70% at 50% 30%, #141b23 0%, #0a0e13 52%, #05070a 100%)",
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 180px 60px rgba(0,0,0,0.75)" }}
        aria-hidden
      />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        <VaultScene stage={stage} reduced={Boolean(reduced)} />

        {reached("badge") && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 2.8, y: -160, rotate: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.16, ease: [0.2, 0.9, 0.3, 1.4] }}
            className="type-mono mt-4 inline-block rounded-[3px] border-2 border-accent px-5 py-1.5 text-[0.875rem] uppercase tracking-[0.35em] text-accent"
            style={{ boxShadow: "inset 0 0 0 3px var(--bg), inset 0 0 0 4px var(--accent)" }}
          >
            Vaulted
          </motion.div>
        )}

        {reached("line") && (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="type-display mt-5 text-[1.4rem] leading-snug text-ink md:text-[1.75rem]"
          >
            {MODE_SHIFT_LINE}
          </motion.p>
        )}

        {reached("ready") && (
          <motion.button
            ref={btnRef}
            type="button"
            onClick={beginBleed}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, scale: reached("drip") ? 1.05 : 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="relative mt-8 rounded-[var(--radius-sm)] px-8 py-3.5 text-[0.9375rem] font-semibold tracking-wide outline-none focus-visible:ring-2"
            style={{
              background: `linear-gradient(180deg, ${BLOOD} 0%, ${BLOOD_DEEP} 100%)`,
              color: "#ffe7e7",
              boxShadow: `0 0 26px ${BLOOD}55, inset 0 1px 0 #ffffff1c`,
            }}
          >
            Enter Teacher Mode
            {/* The bleed: drips run from under the button */}
            {reached("drip") && !reduced && (
              <span className="pointer-events-none absolute inset-x-0 top-full block" aria-hidden>
                {DRIPS.map((d, i) => (
                  <motion.span
                    key={i}
                    className="absolute top-0 block rounded-b-full"
                    style={{
                      left: d.left,
                      width: d.w,
                      background: `linear-gradient(180deg, ${BLOOD_DEEP} 0%, ${BLOOD} 100%)`,
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: d.h }}
                    transition={{ delay: d.delay, duration: 0.6, ease: [0.6, 0.05, 0.9, 0.4] }}
                  />
                ))}
              </span>
            )}
          </motion.button>
        )}
      </div>

      {/* The flood: blood covers the screen; the Teacher room waits beneath. */}
      {stage === "flood" && floodCenter && (
        <>
          <motion.div
            className="fixed inset-0 z-[60]"
            style={{
              background: `radial-gradient(130% 130% at 50% 32%, ${BLOOD} 0%, ${BLOOD_DEEP} 58%, ${BLOOD_DARK} 100%)`,
              opacity: 0.9,
            }}
            initial={{ clipPath: `circle(0% at ${floodCenter.x}px ${floodCenter.y}px)` }}
            animate={{ clipPath: `circle(150% at ${floodCenter.x}px ${floodCenter.y}px)` }}
            transition={{ duration: 0.85, ease: [0.7, 0, 0.84, 0] }}
            aria-hidden
          />
          <motion.div
            className="fixed inset-0 z-[61]"
            style={{
              background: `radial-gradient(120% 120% at 50% 40%, ${BLOOD} 0%, ${BLOOD_DEEP} 62%, ${BLOOD_DARK} 100%)`,
            }}
            initial={{ clipPath: `circle(0% at ${floodCenter.x}px ${floodCenter.y}px)` }}
            animate={{ clipPath: `circle(150% at ${floodCenter.x}px ${floodCenter.y}px)` }}
            transition={{ delay: 0.1, duration: 0.75, ease: [0.7, 0, 0.84, 0] }}
            aria-hidden
          />
        </>
      )}
    </motion.div>
  );
}
