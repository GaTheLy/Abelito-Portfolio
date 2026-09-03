"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FOCUS, QLABEL, MOST_ASKED, WELCOME } from "@/content/answers";
import Transcript from "./Transcript";
import ChatInput from "./ChatInput";
import { useChat } from "./context";

/**
 * The chat below `lg`, where there is no room for a second column.
 *
 * A collapsed bar is pinned to the bottom of every page; tapping it opens a
 * sheet with the full transcript. The sheet is a native <dialog> opened with
 * showModal(), which gives focus trapping, Esc-to-close and inertness for the
 * rest of the page for free — no focus-trap library.
 *
 * Framer Motion handles the one thing CSS can't: drag-to-dismiss with velocity.
 */
export default function MobileSheet() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Whether the sheet is the active chat surface at all.
  //
  // This CANNOT be left to `lg:hidden`. A <dialog> opened with showModal() is
  // promoted to the top layer and makes the rest of the document inert even
  // when an ancestor is display:none — so on desktop the sheet was opening
  // invisibly on the first answer and freezing the whole page. The CSS hides
  // it; only this stops it opening.
  const [isSheet, setIsSheet] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => {
      setIsSheet(mq.matches);
      // Resizing past lg while open would leave an invisible modal behind.
      if (!mq.matches) setOpen(false);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const { turns, started, ask, reset } = useChat();

  // The sheet is titled by whatever was asked last.
  const focus = FOCUS[turns[turns.length - 1]?.topic ?? "rag"];

  // Drive the native dialog from React state, and keep them in sync when the
  // browser closes it for us (Esc, backdrop).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && isSheet && !dialog.open) dialog.showModal();
    if ((!open || !isSheet) && dialog.open) dialog.close();
  }, [open, isSheet]);

  // A new answer (from a chip somewhere in the page) should surface the sheet.
  // Adjusted during render rather than in an effect — React's documented
  // pattern for reacting to a changed value, and it avoids the extra paint.
  const [seenTurns, setSeenTurns] = useState(turns.length);
  if (turns.length !== seenTurns) {
    setSeenTurns(turns.length);
    if (isSheet && turns.length > 0) setOpen(true);
  }

  return (
    <div className="lg:hidden">
      {/* Collapsed bar — always reachable, never covers content because Page
          reserves bottom padding for it. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-divider bg-canvas px-4 py-3 text-left"
      >
        <span
          aria-hidden
          className="block size-[7px] flex-none rounded-full bg-green"
        />
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-faint">
          Ask me anything about my work…
        </span>
        <span className="t-chip flex-none rounded-pill bg-green px-3 py-1.5 text-surface">
          Chat
        </span>
      </button>

      {/* Rendered only when the sheet is the active surface. The guards above
          would be enough, but not existing above `lg` makes the freeze
          structurally impossible rather than merely prevented. The collapsed
          bar stays CSS-hidden so it still server-renders without a flash. */}
      {isSheet ? (
        <dialog
          ref={dialogRef}
          onClose={() => setOpen(false)}
          aria-label="Ask about my work"
          className="m-0 mt-auto max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/40"
        >
          <AnimatePresence>
            {open ? (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 32, stiffness: 320 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0, bottom: 0.5 }}
                // Dismiss on a decisive flick OR a long drag — velocity alone
                // makes a small fast swipe work, distance covers a slow one.
                onDragEnd={(_, info) => {
                  if (info.velocity.y > 500 || info.offset.y > 160)
                    setOpen(false);
                }}
                className="flex h-[85vh] w-full flex-col rounded-t-2xl border-t border-divider bg-surface"
              >
                <div className="flex flex-none items-center justify-between gap-3 border-b border-divider px-4 pt-2 pb-3">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-2 mx-auto h-1 w-9 rounded-full bg-border-input"
                  />
                  <span className="mt-3 min-w-0 flex-1 truncate text-[12.5px] font-semibold text-ink">
                    {started ? focus.title : "Ask about Abelito"}
                  </span>
                  {started ? (
                    <button
                      type="button"
                      onClick={reset}
                      className="mt-3 flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase"
                    >
                      New chat
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-3 flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase"
                  >
                    Close
                  </button>
                </div>

                <Transcript turns={turns} className="px-4 pt-4 pb-2">
                  {started ? null : (
                    <p className="m-0 text-[13.5px]/[1.65] text-ink-body">{WELCOME}</p>
                  )}

                  <div className="mt-1 flex flex-wrap gap-[7px] pb-2">
                    <span className="self-center font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
                      {started ? "Try" : "Start with"}
                    </span>
                    {MOST_ASKED.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => ask(id)}
                        className="t-chip rounded-pill border border-border-input bg-raised-alt2 px-[11px] py-1.5 text-ink"
                      >
                        {QLABEL[id]}
                      </button>
                    ))}
                  </div>
                </Transcript>

                <ChatInput />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </dialog>
      ) : null}
    </div>
  );
}
