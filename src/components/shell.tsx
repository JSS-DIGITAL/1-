"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PercentGlyph } from "./ui";

const NAV = [
  { href: "/today", label: "Today", short: "Today" },
  { href: "/areas", label: "Areas", short: "Areas" },
  { href: "/vault", label: "Vault", short: "Vault" },
  { href: "/health", label: "Health", short: "Health" },
  { href: "/budget", label: "Budget", short: "Budget" },
  { href: "/activity", label: "Move", short: "Move" },
  { href: "/habits", label: "Habits", short: "Habits" },
  { href: "/recovery", label: "Recovery", short: "Recover" },
  { href: "/history", label: "History", short: "Past" },
  { href: "/analytics", label: "Analytics", short: "Stats" },
  { href: "/motivation", label: "Fuel", short: "Fuel" },
  { href: "/settings", label: "Settings", short: "Config" },
];

// Mobile bottom bar shows the daily-driver five (the new sections lead); the
// rest live behind "More" so nothing overflows at 375px.
const MOBILE_PRIMARY = ["/today", "/activity", "/habits", "/recovery"];
const primaryNav = NAV.filter((n) => MOBILE_PRIMARY.includes(n.href));
const moreNav = NAV.filter((n) => !MOBILE_PRIMARY.includes(n.href));

export const MODE_BANNER = { student: "student · record", teacher: "teacher · judge" } as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, isGuest } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreNav.some((n) => n.href === pathname);

  return (
    <div className="atmosphere min-h-dvh">
      {/* The spine — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center border-r border-line bg-bg/70 py-5 backdrop-blur md:flex">
        <Link href="/today" aria-label="1% — Today">
          <PercentGlyph />
        </Link>
        <nav className="mt-8 flex flex-col items-center gap-0.5">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`type-label w-full px-2 py-2.5 text-center transition-colors duration-[var(--dur-fast)] ${
                  active ? "text-accent" : "text-muted/70 hover:text-ink"
                }`}
                style={{ fontSize: "0.5625rem" }}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col items-center gap-3">
          <span
            className="type-label text-muted/60"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontSize: "0.625rem" }}
          >
            {MODE_BANNER[mode]}
          </span>
          <span className={`block h-8 w-[3px] rounded-full bg-accent`} aria-hidden />
        </div>
      </aside>

      {/* Mobile top band */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between border-b border-line bg-bg/80 px-4 backdrop-blur md:hidden">
        <Link href="/today" aria-label="1% — Today">
          <PercentGlyph size={22} />
        </Link>
        <span className="type-label text-accent" style={{ fontSize: "0.625rem" }}>
          {MODE_BANNER[mode]}
        </span>
      </header>

      <main className="px-4 pb-24 pt-6 md:ml-[76px] md:px-10 md:pb-16">
        <div className="mx-auto w-full max-w-5xl">
          {isGuest && (
            <Link
              href="/signup"
              className="type-mono mb-4 block rounded-[var(--radius-sm)] border border-dashed px-4 py-2 text-center text-[0.6875rem] transition-colors hover:text-ink"
              style={{ borderColor: "var(--gold)", color: "var(--gold)" }}
            >
              guest mode — nothing saves. create your account to keep the record →
            </Link>
          )}
          {children}
        </div>
      </main>

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <>
          <button
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-bg/60 backdrop-blur-sm md:hidden"
          />
          <div className="fixed inset-x-0 bottom-[49px] z-50 border-t border-line bg-surface px-4 pb-4 pt-3 md:hidden">
            <div className="type-label mb-2 text-muted">More</div>
            <div className="grid grid-cols-3 gap-2">
              {moreNav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setMoreOpen(false)}
                    className={`rounded-[var(--radius-sm)] border px-2 py-3 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.04em] ${
                      active ? "border-accent bg-accent/10 text-accent" : "border-line text-muted/80 hover:text-ink"
                    }`}
                  >
                    {n.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile bottom nav — five slots: four daily drivers + More */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-bg/90 backdrop-blur md:hidden">
        {primaryNav.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setMoreOpen(false)}
              className={`min-w-0 flex-1 overflow-hidden py-3 text-center text-[0.5625rem] font-semibold uppercase tracking-[0.04em] ${
                active ? "text-accent" : "text-muted/70"
              }`}
            >
              {n.short}
            </Link>
          );
        })}
        <button
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className={`min-w-0 flex-1 overflow-hidden py-3 text-center text-[0.5625rem] font-semibold uppercase tracking-[0.04em] ${
            moreOpen || moreActive ? "text-accent" : "text-muted/70"
          }`}
        >
          More
        </button>
      </nav>
    </div>
  );
}
