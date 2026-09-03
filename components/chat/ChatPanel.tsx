"use client";

import { usePathname } from "next/navigation";
import { railContext } from "@/content/case-studies";
import FullMode from "./FullMode";
import RailMode from "./RailMode";
import ChatInput from "./ChatInput";
import { useChat } from "./context";

/**
 * The defining component. It exists on exactly two kinds of route, because those
 * are the two where it is a chat rather than a launcher:
 *
 *   Home                → full mode, 704px, the whole corpus
 *   /projects/<slug>    → rail mode, 340px, scoped to that project
 *
 * Everywhere else the column was a set of chips that navigated you away — the
 * page gets the width back instead, and the top bar keeps a way in.
 *
 * Both the panel and its collapsed stand-in are always rendered; which one you
 * see is decided in CSS from `.shell-body[data-panel]` plus a media query. That
 * is what lets the default ("open above 1400px, out of the way below") cost
 * nothing at hydration — see the note in components/Shell.tsx.
 *
 * Mounted from Shell (and therefore the root layout), so it never remounts —
 * the conversation survives navigation, and on a route with no chat the panel
 * slides away (`data-panel="none"`) rather than vanishing with the old page.
 */
export default function ChatPanel({
  docCount,
  onToggle,
}: {
  docCount: number;
  /** Records an explicit choice. Once made, no media query overrides it. */
  onToggle: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const { started, reset } = useChat();

  const scope = railContext(pathname);

  return (
    <>
      <aside
        aria-label="Ask about my work"
        className="shell-panel flex min-h-0 flex-col border-l border-divider bg-surface"
      >
        <div className="flex-none border-b border-divider bg-raised px-5 pt-[13px] pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-[9px]">
              <span aria-hidden className="block size-[7px] flex-none rounded-full bg-green" />
              <span className="truncate text-[12.5px] font-semibold text-ink">
                {scope ? `Ask about ${scope.name}` : "Ask me anything"}
              </span>
            </div>
            {/* Collapse button — large enough to hit comfortably */}
            <button
              type="button"
              onClick={() => onToggle(false)}
              aria-label="Collapse chat"
              title="Collapse chat"
              className="flex-none rounded-lg p-2 text-ink-faint transition-colors hover:bg-well hover:text-green"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
                <path d="M5.5 2.5L10 7.5L5.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mt-1 flex items-baseline justify-between gap-3 pl-4">
            <span className="font-mono text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">
              {scope ? "This project only" : `Grounded in ${docCount} docs`}
            </span>
            {/* New chat only makes sense on Home — the rail starts fresh per project */}
            {!scope && started ? (
              <button
                type="button"
                onClick={reset}
                className="flex-none font-mono text-[9.5px] tracking-[0.06em] text-ink-faint uppercase transition-colors hover:text-green"
              >
                New chat
              </button>
            ) : null}
          </div>
        </div>

        {scope ? <RailMode context={scope} /> : <FullMode />}

        <ChatInput scope={scope} />
      </aside>

      {/* The collapsed state. Deliberately the same gesture as the mobile
          sheet's bar rather than a second pattern — one "there is a chat here"
          affordance, floated instead of pinned because desktop has the room. */}
      <button
        type="button"
        onClick={() => onToggle(true)}
        className="shell-pill fixed right-6 bottom-6 z-40 flex items-center gap-2.5 rounded-pill bg-green py-2.5 pr-[18px] pl-4 text-surface shadow-pill transition-colors hover:bg-green-dark max-lg:hidden"
      >
        <span aria-hidden className="block size-[7px] rounded-full bg-surface/70" />
        {/* A fixed label, not the project's name — "Traffic congestion
            detection" would make the pill a different width on every case
            study, and the header already says which project this is. */}
        <span className="t-ui">{scope ? "Ask about this project" : "Ask me anything"}</span>
      </button>
    </>
  );
}
