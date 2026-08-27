"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FOCUS, QLABEL, MOST_ASKED } from "@/content/answers";
import { answerBlocks } from "@/content/answer-blocks";
import BlockList from "@/components/blocks/BlockList";
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
  const { topic, question, blocks, streaming, error, answerSeq, ask } = useChat();

  const shown = blocks ?? answerBlocks[topic];
  const focus = FOCUS[topic];

  // Drive the native dialog from React state, and keep them in sync when the
  // browser closes it for us (Esc, backdrop).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // A new answer (from a chip somewhere in the page) should surface the sheet.
  // Adjusted during render rather than in an effect — React's documented
  // pattern for reacting to a changed value, and it avoids the extra paint.
  const [seenSeq, setSeenSeq] = useState(answerSeq);
  if (answerSeq !== seenSeq) {
    setSeenSeq(answerSeq);
    setOpen(true);
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
        <span aria-hidden className="block size-[7px] flex-none rounded-full bg-green" />
        <span className="min-w-0 flex-1 truncate text-[13px] text-ink-faint">
          Ask me anything about my work…
        </span>
        <span className="t-chip flex-none rounded-pill bg-green px-3 py-1.5 text-surface">
          Chat
        </span>
      </button>

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
                if (info.velocity.y > 500 || info.offset.y > 160) setOpen(false);
              }}
              className="flex h-[85vh] w-full flex-col rounded-t-2xl border-t border-divider bg-surface"
            >
              <div className="flex flex-none items-center justify-between border-b border-divider px-4 pt-2 pb-3">
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-2 mx-auto h-1 w-9 rounded-full bg-border-input"
                />
                <span className="mt-3 text-[12.5px] font-semibold text-ink">{focus.title}</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-3 font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase"
                >
                  Close
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-2">
                <div className="mb-3.5 max-w-[86%] self-end rounded-[13px_13px_3px_13px] bg-ink px-3.5 py-2.5 text-[13px]/[1.45] text-surface">
                  {question}
                </div>

                <div aria-live="polite" aria-busy={streaming}>
                  <BlockList blocks={shown} variant="chat" complete={!streaming} />
                </div>

                {error ? (
                  <p className="mt-3 mb-0 rounded-sm border border-amber-border bg-amber-fill px-3 py-2 font-mono text-[9.5px]/[1.5] text-amber-ink-deep">
                    {error}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-[7px] pb-2">
                  <span className="self-center font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
                    Try
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
              </div>

              <ChatInput />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </dialog>
    </div>
  );
}
