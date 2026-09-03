"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { hasChatPanel } from "@/content/case-studies";
import TopBar from "./TopBar";
import ChatPanel from "./chat/ChatPanel";
import MobileSheet from "./chat/MobileSheet";

/**
 * The app frame. Mounted once in the root layout so the chat panel never
 * remounts on navigation — that persistence is the entire premise of the design
 * (read on the left, ask on the right, both at once).
 *
 * Pages are passed through as `children` and stay server components.
 */
export default function Shell({
  children,
  docCount,
}: {
  children: React.ReactNode;
  /** Derived on the server from content/corpus.ts — the chat header states the
   *  real number rather than a hardcoded claim. */
  docCount: number;
}) {
  const pathname = usePathname();
  const scrollRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

  /**
   * Whether the chat panel is open. `null` means "nobody has said" — and the
   * default is then a media query, not a measurement in an effect. That is the
   * whole reason for the three-state: reading `window.innerWidth` on mount would
   * render the panel expanded on the server and collapse it a frame later, which
   * flashes on exactly the narrow screens the default exists to help.
   *
   * So: CSS decides until the visitor decides, and once they have, nothing
   * overrides them — resizing included.
   *
   * `none` is a separate state from `closed` on purpose: both hide the panel and
   * widen the page, but `closed` leaves the pill as the way back in and `none`
   * does not, because on those routes there is deliberately no chat to reopen.
   * Keeping them distinct is what lets ChatPanel stay mounted everywhere, so the
   * panel slides away on navigation instead of blinking out of existence.
   */
  const [choice, setChoice] = useState<boolean | null>(null);
  const panel = !hasChatPanel(pathname)
    ? "none"
    : choice === null
      ? "auto"
      : choice
        ? "open"
        : "closed";

  // Route change resets the content scroll. Asking no longer does: the answer
  // now appends inside the panel's own scroller, so moving the page underneath
  // it would scroll away whatever the reader was looking at.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    // Exactly the viewport, always. It used to carry a 820px minimum height on
    // desktop, which on any laptop shorter than that pushed the top bar and the
    // ask bar out of view — everything inside scrolls on its own, so the floor
    // bought nothing and cost the two things you always want reachable.
    <div className="flex h-dvh flex-col overflow-hidden">
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <TopBar />

      <div
        className="shell-body flex min-h-0 flex-1"
        data-mode={isHome ? "full" : "rail"}
        data-panel={panel}
      >
        <main
          id="content"
          ref={scrollRef}
          data-page-scroll
          className="min-w-0 flex-1 overflow-y-auto"
        >
          {children}
        </main>

        <ChatPanel docCount={docCount} onToggle={setChoice} />
      </div>

      <MobileSheet />
    </div>
  );
}
