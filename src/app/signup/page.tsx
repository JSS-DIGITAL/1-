"use client";

// Mock signup — mirrors the login card. No account is created.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CountUp } from "@/components/charts";
import { hardLine } from "@/lib/quotes";
import { Button, Label, PercentGlyph } from "@/components/ui";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="atmosphere grid min-h-dvh place-items-center px-4 py-10">
      <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-2">
        <div>
          <PercentGlyph size={40} />
          <h1 className="type-display mt-6 text-[2.5rem] leading-tight md:text-[3rem]">
            Day one starts tonight.
          </h1>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Record the day, seal it, judge it, place your first stake. Seven minutes — or three, on the
            minimum day.
          </p>
          <div className="mt-8 border-l-2 pl-4" style={{ borderColor: "var(--gold)" }}>
            <div className="type-mono text-[0.8125rem] text-muted">1.01^365 =</div>
            <div className="type-mono text-[2.25rem] leading-tight" style={{ color: "var(--gold)" }}>
              <CountUp to={37.78} decimals={2} duration={1400} />
            </div>
          </div>
          <p className="type-mono mt-6 text-[0.8125rem] text-ink/80">&ldquo;{hardLine("signup")}&rdquo;</p>
        </div>

        <div className="rounded-[var(--radius)] border border-line bg-surface p-[var(--pad-card)]">
          <Label>Create your account</Label>
          <div className="mt-4 space-y-3">
            <input
              className={fieldCls}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <input
              className={fieldCls}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              onKeyDown={(e) => e.key === "Enter" && router.push("/today")}
            />
            <Button className="w-full" onClick={() => router.push("/today")}>
              Start free
            </Button>
          </div>
          <p className="mt-4 text-center text-[0.8125rem] text-muted">
            Already in the system?{" "}
            <Link href="/login" className="text-accent underline">
              Log in
            </Link>
          </p>
          <p className="type-mono mt-4 text-[0.6875rem] text-muted/70">
            prototype — no account is created, nothing leaves this device
          </p>
        </div>
      </div>
    </div>
  );
}
