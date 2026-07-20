"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

// Persistent, minimal nav. These are real routing links (revision #1).
// /origin isn't listed — it stays reachable via the orchestrator (prompt) and
// the "open ↗" on its embedded response.
const NAV = [
  { href: "/builder", label: "builder" },
  { href: "/creator", label: "creator" },
  { href: "/hobbyist", label: "hobbyist" },
  { href: "/connect", label: "connect" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === "/";
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          abelito<span className="text-muted">.orchestrator</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          {NAV.map((n) => {
            const active = pathname === n.href || pathname.startsWith(`${n.href}/`);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "text-foreground" : "transition-colors hover:text-foreground"}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* Chat stays reachable everywhere: on other pages, prompting drops you
            into the conversation on home. Hidden on home (big composer is there)
            and on small screens (tap the brand → home to chat) to avoid crowding. */}
        {!onHome && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = q.trim();
              if (!v) return;
              router.push(`/?q=${encodeURIComponent(v)}`);
              setQ("");
            }}
            className="ml-auto hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex"
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Ask the orchestrator"
              placeholder="Ask the orchestrator…"
              className="w-40 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted sm:w-56"
            />
            <button
              type="submit"
              aria-label="Ask"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-foreground text-background"
            >
              <span aria-hidden className="text-xs">
                ↑
              </span>
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
