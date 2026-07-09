"use client";

// The signature moment. ≤1.2s, tap-to-skip, static under reduced motion.
// Timeline: seal stamp (0–300ms) → temperature inversion via data-mode flip
// (~250ms, tokens crossfade) → the line rises (420ms+) → auto-continue (1200ms).

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { usePrefersReduced } from "@/lib/use-reduced";
import { useApp } from "@/lib/store";
import { MODE_SHIFT_LINE } from "@/lib/framework";
import { Button } from "./ui";

export function ModeShift({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReduced();
  const { setMode } = useApp();
  const [stage, setStage] = useState<"seal" | "line">(reduced ? "line" : "seal");
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
    const t1 = setTimeout(() => setMode("teacher"), 250);
    const t2 = setTimeout(() => setStage("line"), 420);
    const t3 = setTimeout(() => finish(), 1200);
    return () => {
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
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.26 }}
          className="type-mono mx-auto inline-block rounded-[3px] border border-accent px-3 py-1 text-[0.6875rem] uppercase tracking-[0.3em] text-accent"
        >
          Sealed
        </motion.div>

        {stage === "line" && (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42 }}
            className="type-display mt-7 text-[1.6rem] leading-snug text-ink md:text-[2rem]"
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
