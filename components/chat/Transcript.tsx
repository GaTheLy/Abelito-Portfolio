"use client";

import { useEffect, useRef } from "react";
import BlockList from "@/components/blocks/BlockList";
import { answerBlocks } from "@/content/answer-blocks";
import type { Turn } from "./context";

/**
 * The conversation, oldest first — one scroller, shared by all three chat
 * surfaces so they can't drift apart.
 *
 * `rail` is the 340px case-study column: no avatar tile, tighter bubbles, and
 * the answers arriving there are prose only (see the `scope` arm of
 * app/api/ask/route.ts), so nothing needs the width.
 */
export default function Transcript({
  turns,
  variant = "full",
  className = "",
  children,
}: {
  turns: Turn[];
  variant?: "full" | "rail";
  className?: string;
  /** Rendered under the last answer — the follow-on chips, the CTA. */
  children?: React.ReactNode;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  // Follow the answer down, but only while the reader is actually at the
  // bottom — yanking someone back mid-scroll is worse than not following.
  const pinned = useRef(true);

  const last = turns[turns.length - 1];
  const tick = `${turns.length}:${last?.blocks?.length ?? 0}:${last?.streaming}`;
  useEffect(() => {
    const el = scroller.current;
    if (el && pinned.current) el.scrollTop = el.scrollHeight;
  }, [tick]);

  const rail = variant === "rail";

  return (
    <div
      ref={scroller}
      onScroll={(e) => {
        const el = e.currentTarget;
        pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      }}
      className={`flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto ${className}`}
    >
      {turns.map((turn) => (
        <div key={turn.id} className="animate-rise flex flex-col gap-3">
          <div
            className={`max-w-[88%] self-end rounded-[13px_13px_3px_13px] bg-ink text-surface ${
              rail ? "px-3 py-2 text-[12.5px]/[1.45]" : "px-3.5 py-2.5 text-[13px]/[1.45]"
            }`}
          >
            {turn.question}
          </div>

          <div className={rail ? "" : "flex gap-[11px]"}>
            {rail ? null : (
              <span
                aria-hidden
                className="block size-[22px] flex-none rounded-xs bg-green text-center font-mono text-[9.5px]/[22px] font-bold text-canvas"
              >
                A
              </span>
            )}
            {/* aria-live so a screen reader hears streamed answers arrive. */}
            <div
              aria-live="polite"
              aria-busy={turn.streaming}
              className="flex min-w-0 flex-1 flex-col gap-3"
            >
              {/* `blocks === null` means "no generated answer" — serve the
                  authored one. That is the chip path, the offline path and the
                  fallback path. */}
              <BlockList
                blocks={turn.blocks ?? answerBlocks[turn.topic]}
                variant="chat"
                complete={!turn.streaming}
              />

              {turn.streaming ? (
                <span className="animate-caret inline-block h-3.5 w-[7px] bg-green" aria-hidden />
              ) : null}

              {turn.error ? (
                <p className="m-0 rounded-sm border border-amber-border bg-amber-fill px-3 py-2 font-mono text-[9.5px]/[1.5] text-amber-ink-deep">
                  {turn.error}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {children}
    </div>
  );
}
