"use client";

// Mock signup — mirrors the login card. No account is created.

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CountUp } from "@/components/charts";
import { hardLine } from "@/lib/quotes";
import { registerSignup } from "@/lib/signup";
import { GUEST_FLAG, useApp } from "@/lib/store";
import { Button, Label, PercentGlyph } from "@/components/ui";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent";

export default function SignupPage() {
  const router = useRouter();
  const { setAccount } = useApp();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const createAccount = () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setErr("A real email is the whole account — check it.");
      return;
    }
    // Fire-and-forget: failures queue on-device and retry next load.
    void registerSignup({ email: e, name: name.trim() || undefined, source: "signup" });
    setAccount({ email: e, name: name.trim() || undefined, since: new Date().toISOString().slice(0, 10) });
    router.push("/today");
  };

  const tryFree = () => {
    window.sessionStorage.setItem(GUEST_FLAG, "1");
    // Full reload so the store boots in guest mode (blank, non-persisting).
    window.location.href = "/today";
  };

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
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <input
              className={fieldCls}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && createAccount()}
            />
            <input
              className={`${fieldCls} opacity-45`}
              type="password"
              placeholder="Password — not needed yet"
              disabled
              autoComplete="off"
            />
            <p className="type-mono -mt-1 text-[0.625rem] text-muted/70">
              no password yet — your record stays on this device. real login + sync is coming.
            </p>
            {err && (
              <p className="text-[0.75rem]" style={{ color: "#FF4D42" }} role="alert">
                {err}
              </p>
            )}
            <Button className="w-full" onClick={createAccount}>
              Create account — your record saves on this device
            </Button>
            <Button variant="ghost" className="w-full" onClick={tryFree}>
              Try it free — nothing saves
            </Button>
          </div>
          <p className="mt-4 text-center text-[0.8125rem] text-muted">
            Already in the system?{" "}
            <Link href="/login" className="text-accent underline">
              Log in
            </Link>
          </p>
          <p className="type-mono mt-4 text-[0.6875rem] text-muted/70">
            your entries never leave this device — only your email joins the 1% list
          </p>
        </div>
      </div>
    </div>
  );
}
