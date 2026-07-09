"use client";

// Fuel — the motivation tab. A community feed (founder-reviewed), a private
// collection, and a pin that overrides today's hard line everywhere.

import { useState } from "react";
import { Shell } from "@/components/shell";
import { Button, Card, Chip, Label } from "@/components/ui";
import { useApp } from "@/lib/store";
import type { MotivationItem } from "@/lib/types";

type Tab = "feed" | "mine" | "submit" | "review";

const fieldCls =
  "w-full rounded-[var(--radius-sm)] border border-line bg-surface-2 px-3 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted/50 focus:border-accent min-h-[4rem] resize-none";

export default function FuelPage() {
  const { fuel, savedFuelIds, saveFuel, addFuel, approveFuel, rejectFuel, pinLine, pinnedLine } = useApp();
  const [tab, setTab] = useState<Tab>("feed");
  const [draft, setDraft] = useState("");
  const [share, setShare] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const feed = fuel.filter((i) => i.visibility === "public").sort((a, b) => b.saves - a.saves);
  const mine = fuel.filter((i) => i.source === "user" || savedFuelIds.includes(i.id));
  const pending = fuel.filter((i) => i.visibility === "pending");

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "feed", label: "Feed" },
    { id: "mine", label: "Mine", badge: mine.length },
    { id: "submit", label: "Submit" },
    { id: "review", label: "Review", badge: pending.length },
  ];

  return (
    <Shell>
      <Label>Fuel</Label>
      <h1 className="type-display mt-1 text-[1.75rem] md:text-[2.25rem]">
        Motivation, on the record.
      </h1>
      <p className="mt-2 max-w-xl text-[0.875rem] text-muted">
        Save what hits. Pin one as today&apos;s line — it takes over the whole app. Share yours with the
        community; public lines go live after founder review.
      </p>

      <div className="mt-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-[var(--radius-sm)] border px-4 py-2 text-[0.8125rem] transition-colors duration-[var(--dur-fast)] ${
              tab === t.id ? "border-accent bg-accent/10 text-ink" : "border-line text-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="type-mono ml-1.5 text-[0.6875rem]" style={{ color: "var(--gold)" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 grid max-w-2xl gap-3">
        {tab === "feed" &&
          feed.map((item) => (
            <FuelCard key={item.id} item={item}>
              <button
                onClick={() => saveFuel(item.id)}
                disabled={savedFuelIds.includes(item.id)}
                className="type-mono text-[0.6875rem] text-muted hover:text-ink disabled:opacity-50"
              >
                {savedFuelIds.includes(item.id) ? "saved" : "save to mine"}
              </button>
              <PinButton item={item} pinned={pinnedLine === item.text} onPin={pinLine} />
            </FuelCard>
          ))}

        {tab === "mine" && (
          <>
            {mine.length === 0 && (
              <Card>
                <p className="text-[0.875rem] text-muted">
                  Nothing saved yet. Raid the feed, or write your own in Submit.
                </p>
              </Card>
            )}
            {mine.map((item) => (
              <FuelCard key={item.id} item={item}>
                {item.visibility === "pending" && <Chip>pending review</Chip>}
                {item.visibility === "private" && item.source === "user" && <Chip>private</Chip>}
                <PinButton item={item} pinned={pinnedLine === item.text} onPin={pinLine} />
              </FuelCard>
            ))}
            {pinnedLine && (
              <button onClick={() => pinLine(null)} className="type-mono text-left text-[0.6875rem] text-muted underline hover:text-ink">
                unpin today&apos;s line
              </button>
            )}
          </>
        )}

        {tab === "submit" && (
          <Card>
            <Label className="mb-2">Your line</Label>
            <textarea
              className={fieldCls}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Terse. True. The kind of line you'd want thrown back at you on a weak day."
            />
            <label className="mt-3 flex items-center gap-2 text-[0.8125rem] text-muted">
              <input
                type="checkbox"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
                className="size-4 accent-[var(--accent)]"
              />
              Share with the community — goes live after founder review
            </label>
            {submitted && (
              <p className="type-mono mt-3 text-[0.75rem]" style={{ color: "var(--gold)" }}>
                filed{share ? " — awaiting review" : " — private"}
              </p>
            )}
            <Button
              className="mt-4"
              disabled={!draft.trim()}
              onClick={() => {
                addFuel(draft, share);
                setDraft("");
                setSubmitted(true);
              }}
            >
              {share ? "Submit for review" : "Keep it private"}
            </Button>
          </Card>
        )}

        {tab === "review" && (
          <>
            <p className="type-mono text-[0.6875rem] uppercase tracking-[0.2em] text-muted">
              founder review · prototype shows the queue openly
            </p>
            {pending.length === 0 && (
              <Card>
                <p className="text-[0.875rem] text-muted">Queue is clear.</p>
              </Card>
            )}
            {pending.map((item) => (
              <FuelCard key={item.id} item={item}>
                <button
                  onClick={() => approveFuel(item.id)}
                  className="type-mono rounded-[var(--radius-sm)] border border-accent px-3 py-1 text-[0.6875rem] text-accent"
                >
                  approve
                </button>
                <button
                  onClick={() => rejectFuel(item.id)}
                  className="type-mono rounded-[var(--radius-sm)] border border-line px-3 py-1 text-[0.6875rem] text-muted"
                >
                  keep private
                </button>
              </FuelCard>
            ))}
          </>
        )}
      </div>
    </Shell>
  );
}

function FuelCard({ item, children }: { item: MotivationItem; children: React.ReactNode }) {
  return (
    <Card>
      <p className="type-display text-[1.125rem] italic leading-snug">&ldquo;{item.text}&rdquo;</p>
      <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
        <span className="type-mono text-[0.6875rem] text-muted">{item.author}</span>
        {item.visibility === "public" && (
          <span className="type-mono text-[0.6875rem]" style={{ color: "var(--gold)" }}>
            {item.saves} saves
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">{children}</span>
      </div>
    </Card>
  );
}

function PinButton({
  item,
  pinned,
  onPin,
}: {
  item: MotivationItem;
  pinned: boolean;
  onPin: (text: string | null) => void;
}) {
  return (
    <button
      onClick={() => onPin(pinned ? null : item.text)}
      className={`type-mono text-[0.6875rem] ${pinned ? "" : "text-muted hover:text-ink"}`}
      style={pinned ? { color: "var(--gold)" } : undefined}
    >
      {pinned ? "pinned — today's line" : "pin as today's line"}
    </button>
  );
}
