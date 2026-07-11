"use client";

// First impression. The compounding fact is the brand's opening argument.

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

export default function LoginPage() {
  const router = useRouter();
  const { setAccount, loadDemo } = useApp();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const logIn = () => {
    const e = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setErr("Enter the email you registered with.");
      return;
    }
    void registerSignup({ email: e, source: "login" });
    setAccount({ email: e, since: new Date().toISOString().slice(0, 10) });
    router.push("/today");
  };

  const tryFree = () => {
    window.sessionStorage.setItem(GUEST_FLAG, "1");
    window.location.href = "/today";
  };

  return (
    <div className="atmosphere grid min-h-dvh place-items-center px-4 py-10">
      <div className="grid w-full max-w-4xl items-center gap-10 md:grid-cols-2">
        <div>
          <PercentGlyph size={40} />
          <h1 className="type-display mt-6 text-[3rem] leading-none md:text-[3.5rem]">1%</h1>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            Student records reality. Teacher evaluates the record. One correction, one mission, every day.
          </p>
          <div className="mt-8 border-l-2 border-accent pl-4">
            <div className="type-mono text-[0.8125rem] text-muted">1.01^365 =</div>
            <div className="type-mono text-[2.25rem] leading-tight text-ink">
              <CountUp to={37.78} decimals={2} duration={1400} />
            </div>
            <div className="mt-1 text-[0.8125rem] text-muted">
              A day is worth one percent. The year does the rest.
            </div>
          </div>
          <p className="type-mono mt-6 text-[0.8125rem] text-ink/80">&ldquo;{hardLine("login")}&rdquo;</p>
        </div>

        <div className="rounded-[var(--radius)] border border-line bg-surface p-[var(--pad-card)]">
          <Label>Enter the system</Label>
          <div className="mt-4 space-y-3">
            <input
              className={fieldCls}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              onKeyDown={(e) => e.key === "Enter" && logIn()}
            />
            <input
              className={`${fieldCls} opacity-45`}
              type="password"
              placeholder="Password — not needed yet"
              disabled
              autoComplete="off"
            />
            <p className="type-mono -mt-1 text-[0.625rem] text-muted/70">
              no password yet — your record lives on this device. moving devices? restore your backup in
              Settings → data.
            </p>
            {err && (
              <p className="text-[0.75rem]" style={{ color: "#FF4D42" }} role="alert">
                {err}
              </p>
            )}
            <Button className="w-full" onClick={logIn}>
              Enter the system
            </Button>
            <Button variant="ghost" className="w-full" onClick={tryFree}>
              Try it free — nothing saves
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                loadDemo();
                router.push("/today");
              }}
            >
              Continue with the demo record
            </Button>
          </div>
          <p className="mt-4 text-center text-[0.8125rem] text-muted">
            New here?{" "}
            <Link href="/signup" className="text-accent underline">
              Sign up
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
