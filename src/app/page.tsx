"use client";

// The marketing landing. Aggressive, premium, gold-and-emerald on black.
// The app lives at /today; this page's only job is to make you sign up.

import Link from "next/link";
import { CountUp } from "@/components/charts";
import { InstallApp } from "@/components/install-app";
import { Vault } from "@/components/mode-shift";
import { Label, PercentGlyph } from "@/components/ui";
import { HARD_LINES } from "@/lib/quotes";

const WALL = [
  HARD_LINES[0], // You're only cheating yourself.
  HARD_LINES[3], // You said tomorrow yesterday.
  HARD_LINES[2], // Don't spend another year doing the same sh*t.
  HARD_LINES[4], // The record doesn't lie. You might.
  HARD_LINES[6], // Nobody is coming.
  HARD_LINES[19], // Hard now, or hard forever.
  HARD_LINES[54], // It compounds either way. Choose the direction.
];

export default function Landing() {
  return (
    <div className="atmosphere min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <PercentGlyph size={26} />
            <span className="type-display text-[1.25rem]">1%</span>
          </Link>
          <nav className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-[var(--radius-sm)] border border-line px-4 py-2 text-[0.875rem] text-ink transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-[var(--radius-sm)] bg-accent px-4 py-2 text-[0.875rem] font-medium text-accent-ink hover:brightness-110"
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 opacity-[0.05] md:-right-10"
        >
          <PercentGlyph size={520} />
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-16 md:pb-28 md:pt-24">
          <p className="type-mono text-[0.75rem] uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
            the personal performance system
          </p>
          <h1 className="type-display mt-4 max-w-3xl text-[2.75rem] leading-[1.05] md:text-[4.25rem]">
            Become that 1% better.
          </h1>
          <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
            The self-coaching system that pays you to stop lying to yourself. Record the day. Seal it in the
            vault. Judge it like a coach. Bet on tomorrow — and collect when you keep your word.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/signup"
              className="rounded-[var(--radius-sm)] bg-accent px-6 py-3.5 text-[0.9375rem] font-medium text-accent-ink hover:brightness-110"
            >
              Start free
            </Link>
            <a
              href="#download"
              className="rounded-[var(--radius-sm)] border border-line px-6 py-3.5 text-[0.9375rem] text-ink transition-colors duration-[var(--dur-fast)] hover:bg-surface-2"
            >
              Download the app
            </a>
          </div>
          <div className="mt-12 border-l-2 pl-4" style={{ borderColor: "var(--gold)" }}>
            <div className="type-mono text-[0.8125rem] text-muted">1.01^365 =</div>
            <div className="type-mono text-[2.5rem] leading-tight" style={{ color: "var(--gold)" }}>
              <CountUp to={37.78} decimals={2} duration={1400} />
            </div>
            <div className="mt-1 text-[0.8125rem] text-muted">
              One percent a day is 37× in a year — and 1% is the{" "}
              <span className="text-ink">floor, not the ceiling</span>. Zero percent a day is another year.
            </div>
          </div>
        </div>
      </section>

      {/* The loop */}
      <section className="border-t border-line bg-surface/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <Label>The loop</Label>
          <h2 className="type-display mt-2 max-w-2xl text-[1.9rem] leading-tight md:text-[2.5rem]">
            You are both the student and the teacher.
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <div className="type-mono text-[0.75rem]" style={{ color: "var(--gold)" }}>01</div>
              <h3 className="type-display mt-2 text-[1.25rem]">The Student records.</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                What you did. What you dodged. The real numbers. No limit on the writing, no mercy on the
                facts. Three minutes on a bad day, the full debrief when you have more.
              </p>
            </div>
            <div>
              <div className="type-mono text-[0.75rem]" style={{ color: "var(--gold)" }}>02</div>
              <h3 className="type-display mt-2 text-[1.25rem]">The record is sealed.</h3>
              <div className="mt-3 origin-left scale-75">
                <Vault reduced />
              </div>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                Locked. Permanent. Only what is written exists — flattering yourself by omission costs you.
              </p>
            </div>
            <div>
              <div className="type-mono text-[0.75rem]" style={{ color: "var(--gold)" }}>03</div>
              <h3 className="type-display mt-2 text-[1.25rem]">The Teacher judges.</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">
                Read your own day like a coach reads a report. Name the one weakness. Issue one order for
                tomorrow: when, where, what. Then stake your confidence on it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The wager */}
      <section className="border-t border-line">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Label>The wager</Label>
            <h2 className="type-display mt-2 text-[1.9rem] leading-tight md:text-[2.5rem]">
              Your word becomes a bet.
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-muted">
              Call your confidence, 0 to 10. Tomorrow the verdict lands and the bet resolves. Honest calls
              earn the most — overconfidence and sandbagging both lose. Keep your promises and the multiplier
              climbs. Your balance compounds in basis points, like it should.
            </p>
            <p className="type-mono mt-4 text-[0.8125rem]" style={{ color: "var(--gold)" }}>
              bp balance · momentum chain · weakness bounties · rare seals · ranks
            </p>
          </div>
          {/* Static resolve mock */}
          <div className="mx-auto w-full max-w-sm rounded-[14px] border border-line bg-surface p-6">
            <div className="type-mono text-center text-[0.6875rem] uppercase tracking-[0.3em] text-muted">
              the bet resolves
            </div>
            <div className="mt-5 flex items-center justify-between text-[0.8125rem]">
              <span className="text-muted">you called</span>
              <span className="type-mono text-ink">6/10</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[0.8125rem]">
              <span className="text-muted">the verdict</span>
              <span className="type-mono rotate-[-2deg] rounded-[3px] border border-accent px-2.5 py-1 text-[0.75rem] uppercase tracking-[0.2em] text-accent">
                executed
              </span>
            </div>
            <div className="type-mono mt-5 space-y-1.5 border-t border-line pt-4 text-[0.8125rem]">
              <div className="flex justify-between"><span className="text-muted">execution</span><span className="text-ink">+15</span></div>
              <div className="flex justify-between"><span className="text-muted">calibration</span><span className="text-ink">+8</span></div>
              <div className="flex justify-between"><span className="text-muted">momentum</span><span className="text-ink">×1.5</span></div>
            </div>
            <div className="mt-4 border-t border-line pt-4 text-center">
              <span className="type-mono text-[2.25rem] leading-none" style={{ color: "var(--gold)" }}>+35</span>
              <span className="type-mono ml-1.5 text-[0.875rem] text-muted">bp</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hard-lines wall */}
      <section className="border-t border-line bg-black/40">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <Label>No motivation. Standards.</Label>
          <div className="mt-8 space-y-6">
            {WALL.map((line, i) => (
              <p
                key={line}
                className={`type-display leading-tight ${
                  i % 3 === 0 ? "text-[1.9rem] md:text-[2.75rem]" : "text-[1.375rem] text-muted md:text-[1.75rem]"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Two speeds */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <Label>Two speeds</Label>
          <h2 className="type-display mt-2 text-[1.9rem] leading-tight md:text-[2.5rem]">
            Three minutes, or the full debrief.
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-[14px] border border-line bg-surface p-6">
              <h3 className="type-display text-[1.25rem]">The minimum day</h3>
              <p className="type-mono mt-1 text-[0.75rem]" style={{ color: "var(--gold)" }}>~3 minutes</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                Did you do it, one completed thing, tomorrow&apos;s order, your stake. A thin record beats no
                record — the system still pays.
              </p>
            </div>
            <div className="rounded-[14px] border border-line bg-surface p-6">
              <h3 className="type-display text-[1.25rem]">The full debrief</h3>
              <p className="type-mono mt-1 text-[0.75rem]" style={{ color: "var(--gold)" }}>~7 minutes</p>
              <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                The complete record: outputs, numbers, what you avoided, the conditions, the diagnosis. For
                the ones who like the writing. Unlimited length. Everything counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The arsenal — the moat, said out loud. */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-6xl px-5 py-16 md:py-24">
          <Label>The whole arsenal</Label>
          <h2 className="type-display mt-2 max-w-2xl text-[1.9rem] leading-tight md:text-[2.5rem]">
            Everything the other apps have. Around the one loop they don&apos;t.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Measurable goals", "Targets with progress bars, per area — not vibes"],
              ["Weekly debrief", "The ledger counts, you rule. Twelve minutes, once a week"],
              ["Focus missions", "A timer that generates tonight's evidence"],
              ["1% Coach", "Your repeat offenders, surfaced before you excuse them"],
              ["Fuel community", "Motivation you save, pin, and share — founder-reviewed"],
              ["Momentum shields", "Insure the chain with earned bp. Casino rules"],
              ["Trophies & PRs", "The only leaderboard is your previous self"],
              ["Integrations", "Apple Health, Calendar, Notion, Zapier — coming"],
            ].map(([name, desc]) => (
              <div key={name} className="rounded-[14px] border border-line bg-surface p-5">
                <h3 className="type-display text-[1.0625rem]">{name}</h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download */}
      <section id="download" className="border-t border-line bg-surface/40">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div>
            <Label>Take it with you</Label>
            <h2 className="type-display mt-2 text-[1.9rem] leading-tight md:text-[2.5rem]">
              The review fits in one hand.
            </h2>
            <ul className="mt-5 space-y-2.5 text-[0.9375rem] text-muted">
              <li className="flex gap-2.5"><span style={{ color: "var(--gold)" }}>—</span> One question at a time, built for thumbs</li>
              <li className="flex gap-2.5"><span style={{ color: "var(--gold)" }}>—</span> A daily push at 21:00 that calls you out if the record is empty</li>
              <li className="flex gap-2.5"><span style={{ color: "var(--gold)" }}>—</span> The vault, the bets, the whole economy — offline-ready</li>
            </ul>
            <div className="mt-7">
              <InstallApp />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="type-mono rounded-[var(--radius-sm)] border border-line px-5 py-3 text-[0.8125rem] text-muted">
                 App Store
              </span>
              <span className="type-mono rounded-[var(--radius-sm)] border border-line px-5 py-3 text-[0.8125rem] text-muted">
                ▷ Google Play
              </span>
            </div>
            <p className="type-mono mt-3 text-[0.6875rem] text-muted/70">
              installable today from your browser — stores coming later
            </p>
            <Link
              href="/signup"
              className="mt-5 inline-block rounded-[var(--radius-sm)] bg-accent px-6 py-3 text-[0.9375rem] font-medium text-accent-ink hover:brightness-110"
            >
              Use it in the browser now
            </Link>
          </div>
          {/* Phone frame */}
          <div className="mx-auto w-[240px] rounded-[36px] border-2 border-line bg-bg p-3 shadow-2xl">
            <div className="rounded-[26px] border border-line bg-surface p-4">
              <div className="type-mono text-[0.5625rem] uppercase tracking-[0.2em] text-muted">balance</div>
              <div className="type-mono mt-1 text-[1.5rem]" style={{ color: "var(--gold)" }}>
                1 735 <span className="text-[0.6875rem] text-muted">bp</span>
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`h-2 w-2 -skew-x-12 rounded-[1px] ${i < 6 ? "" : "bg-line"}`} style={i < 6 ? { background: "var(--gold)" } : undefined} />
                ))}
              </div>
              <div className="mt-4 rounded-[10px] border-l-2 border-accent bg-surface-2 p-3">
                <div className="type-mono text-[0.5625rem] uppercase tracking-[0.15em] text-muted">the standing mission</div>
                <p className="type-display mt-1 text-[0.8125rem] leading-snug text-ink">
                  Call the three largest prospects before opening email
                </p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5">
                <span className="rounded-[8px] bg-accent py-2 text-center text-[0.625rem] font-medium text-accent-ink">Yes — begin review</span>
                <span className="rounded-[8px] border border-line py-2 text-center text-[0.625rem] text-muted">No — begin review</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
          <p className="type-display text-[1.125rem] italic text-muted">
            &ldquo;This is the year, or it&apos;s another year.&rdquo;
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[0.8125rem] text-muted hover:text-ink">Log in</Link>
            <Link href="/signup" className="text-[0.8125rem] text-muted hover:text-ink">Sign up</Link>
            <span className="type-mono text-[0.75rem] text-muted/60">© 1%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
