"use client";

// The Vault Seal — the signature moment, now mechanical. ~1.65s, tap-to-skip,
// static under reduced motion. Timeline: locking ring rotates with a hard stop
// and bolts extend (0.25–0.9s) → temperature inversion (~0.6s) → SEALED stamp
// slams (0.85s) → the line rises (1.08s) → auto-continue (1.65s).

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import { useApp } from "@/lib/store";
import { MODE_SHIFT_LINE } from "@/lib/framework";
import { Button } from "./ui";

const BOLT_ANGLES = [0, 60, 120, 180, 240, 300];

export function Vault({ reduced }: { reduced: boolean }) {
  return (
    <motion.svg
      width="150"
      height="150"
      viewBox="0 0 120 120"
      initial={reduced ? false : { scale: 0.96, opacity: 0.4 }}
      animate={reduced ? {} : { scale: [0.96, 1, 1.045, 1], opacity: 1 }}
      transition={{ duration: 0.9, times: [0, 0.55, 0.75, 1], ease: "easeOut" }}
      aria-label="Record sealed in the vault"
    >
      {/* Outer door ring */}
      <circle cx="60" cy="60" r="55" stroke="var(--line)" strokeWidth="2.5" fill="none" />
      <circle cx="60" cy="60" r="47" stroke="var(--line)" strokeWidth="1" fill="none" opacity="0.6" />

      {/* Bolts: extend from the mechanism into the door frame */}
      {BOLT_ANGLES.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x1 = 60 + Math.cos(rad) * 40;
        const y1 = 60 + Math.sin(rad) * 40;
        const x2 = 60 + Math.cos(rad) * 54;
        const y2 = 60 + Math.sin(rad) * 54;
        return (
          <motion.line
            key={a}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.45 + i * 0.05, duration: 0.22, ease: "easeOut" }}
          />
        );
      })}

      {/* Locking ring: hard rotation with a heavy stop */}
      <motion.g
        style={{ transformOrigin: "60px 60px" }}
        initial={reduced ? { rotate: 70 } : { rotate: 0 }}
        animate={{ rotate: 70 }}
        transition={{ delay: 0.22, duration: 0.5, ease: [0.6, 0.04, 0.2, 1.08] }}
      >
        <circle cx="60" cy="60" r="34" stroke="var(--ink)" strokeWidth="2.5" fill="none" />
        {BOLT_ANGLES.map((a) => {
          const rad = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={60 + Math.cos(rad) * 22}
              y1={60 + Math.sin(rad) * 22}
              x2={60 + Math.cos(rad) * 34}
              y2={60 + Math.sin(rad) * 34}
              stroke="var(--ink)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>

      {/* The % mark at the hub */}
      <circle cx="53" cy="53" r="4.5" stroke="var(--accent)" strokeWidth="2.2" fill="none" />
      <circle cx="67" cy="67" r="4.5" stroke="var(--accent)" strokeWidth="2.2" fill="none" />
      <line x1="69" y1="51" x2="51" y2="69" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
    </motion.svg>
  );
}

export function ModeShift({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReduced();
  const { setMode } = useApp();
  const [stage, setStage] = useState<"vault" | "stamp" | "line">(reduced ? "line" : "vault");
  const doneRef = useRef(onDone);
  const finished = useRef(false);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    doneRef.current();
  }, []);

  useEffect(() => {
    if (reduced) {
      setMode("teacher", false);
      return;
    }
    const t0 = setTimeout(() => setMode("teacher"), 600);
    const t1 = setTimeout(() => setStage("stamp"), 850);
    const t2 = setTimeout(() => setStage("line"), 1080);
    const t3 = setTimeout(() => finish(), 1650);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced, setMode, finish]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg px-6"
      onClick={reduced ? undefined : () => {
        setMode("teacher", false);
        finish();
      }}
      role={reduced ? undefined : "button"}
      aria-label={reduced ? undefined : "Skip transition"}
    >
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <Vault reduced={Boolean(reduced)} />

        {(stage === "stamp" || stage === "line") && (
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 1.5, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: -3 }}
            transition={{ duration: 0.18, ease: [0.2, 0.9, 0.3, 1.4] }}
            className="type-mono mt-6 inline-block rounded-[3px] border-2 border-accent px-4 py-1.5 text-[0.8125rem] uppercase tracking-[0.35em] text-accent"
          >
            Sealed
          </motion.div>
        )}

        {stage === "line" && (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="type-display mt-6 text-[1.5rem] leading-snug text-ink md:text-[1.9rem]"
          >
            {MODE_SHIFT_LINE}
          </motion.p>
        )}

        {reduced ? (
          <div className="mt-8">
            <Button onClick={finish}>Enter evaluation</Button>
          </div>
        ) : (
          <p className="type-mono mt-8 text-[0.6875rem] text-muted/70">tap to enter evaluation</p>
        )}
      </div>
    </div>
  );
}
