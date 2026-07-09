"use client";

// Focus mission — a timer that generates evidence. Finish a session and it
// waits in S1's evidence field at tonight's review.

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import { useApp, useYesterdayMission } from "@/lib/store";

export default function FocusPage() {
  const router = useRouter();
  const { addFocusLog, focusLogs } = useApp();
  const standing = useYesterdayMission();
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [logged, setLogged] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    interval.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => {
      if (interval.current) clearInterval(interval.current);
    };
  }, [running]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const minutes = Math.max(1, Math.round(seconds / 60));

  const finish = () => {
    setRunning(false);
    addFocusLog(minutes, standing?.what ?? "unassigned block");
    setLogged(true);
  };

  return (
    <Shell>
      <Label>Focus mission</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">Run the mission.</h1>

      <div className="mx-auto mt-8 max-w-md">
        <Card className="text-center">
          {standing ? (
            <>
              <Label>The standing mission</Label>
              <p className="type-display mt-2 text-[1.125rem] leading-snug">{standing.what}</p>
              <p className="type-mono mt-1 text-[0.75rem] text-accent">
                {standing.when} · {standing.where}
              </p>
            </>
          ) : (
            <p className="text-[0.875rem] text-muted">No standing mission — the block still counts.</p>
          )}

          <div className="type-mono mt-8 text-[4rem] leading-none tabular-nums" style={{ color: "var(--gold)" }}>
            {mm}:{ss}
          </div>

          {logged ? (
            <div className="mt-8">
              <Chip tone="accent">evidence logged · {minutes} min</Chip>
              <p className="mt-3 text-[0.8125rem] text-muted">
                It will be waiting in the evidence field at tonight&apos;s review.
              </p>
              <Button className="mt-5" onClick={() => router.push("/today")}>
                Return to the system
              </Button>
            </div>
          ) : (
            <div className="mt-8 flex justify-center gap-2">
              {!running ? (
                <Button onClick={() => setRunning(true)}>{seconds === 0 ? "Start the block" : "Resume"}</Button>
              ) : (
                <Button variant="ghost" onClick={() => setRunning(false)}>
                  Pause
                </Button>
              )}
              {seconds > 0 && (
                <Button variant="ghost" onClick={finish}>
                  Finish — log as evidence
                </Button>
              )}
            </div>
          )}
        </Card>

        {focusLogs.length > 0 && !logged && (
          <p className="type-mono mt-4 text-center text-[0.6875rem] text-muted">
            {focusLogs.length} session{focusLogs.length === 1 ? "" : "s"} logged today
          </p>
        )}
      </div>
    </Shell>
  );
}
