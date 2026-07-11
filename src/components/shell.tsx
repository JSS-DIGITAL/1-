"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { PercentGlyph } from "./ui";

const NAV = [
  { href: "/today", label: "Today" },
  { href: "/areas", label: "Areas" },
  { href: "/vault", label: "Vault" },
  { href: "/history", label: "History" },
  { href: "/analytics", label: "Analytics" },
  { href: "/motivation", label: "Fuel" },
  { href: "/settings", label: "Settings" },
];

export const MODE_BANNER = { student: "student · record", teacher: "teacher · judge" } as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, isGuest } = useApp();

  return (
    <div className="atmosphere min-h-dvh">
      {/* The spine — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col items-center border-r border-line bg-bg/70 py-5 backdrop-blur md:flex">
        <Link href="/today" aria-label="1% — Today">
          <PercentGlyph />
        </Link>
        <nav className="mt-10 flex flex-col items-center gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`type-label w-full px-2 py-3 text-center transition-colors duration-[var(--dur-fast)] ${
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

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/90 backdrop-blur md:hidden">
        {NAV.map((n) => {
          const active = pathname === n.href;
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex-1 py-3 text-center text-[0.625rem] font-semibold uppercase tracking-[0.1em] ${
                active ? "text-accent" : "text-muted/70"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
