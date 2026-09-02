"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WELCOME, MOST_ASKED, QLABEL } from "@/content/answers";
import { answerBlocks } from "@/content/answer-blocks";
import BlockList from "@/components/blocks/BlockList";
import { useChat } from "./context";
import type { TopicId } from "@/content/answers";

/** Home only, 704px. The transcript: what was asked before, the question, and
 *  the answer. Follow-ups come from the answer's own `followups` block, which
 *  the API guarantees is present, so there is no separate suggestion rail. */
export default function FullMode() {
  const { topic, question, trail, blocks, streaming, error, answerSeq, started, ask } =
    useChat();

  // `blocks === null` means "no generated answer" — serve the authored one.
  // That is the offline path, the fallback path, and the guardrail path.
  const shown = blocks ?? answerBlocks[topic];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Transcript */}
      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-[18px] pb-2">
        {!started ? (
          <Welcome onAsk={ask} />
        ) : (
          <>
          {trail.length > 0 ? (
            <div className="flex flex-col gap-[5px] border-b border-dashed border-divider pb-1">
              <span className="font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
                Earlier
              </span>
              {trail.map((item, i) => (
                <div key={i} className="py-0.5 text-[11.5px]/[1.4] text-ink-faint">
                  {item}
                </div>
              ))}
            </div>
          ) : null}

          <div className="animate-rise max-w-[86%] self-end rounded-[13px_13px_3px_13px] bg-ink px-3.5 py-2.5 text-[13px]/[1.45] text-surface">
            {question}
          </div>

          <div className="flex gap-[11px]">
            <span
              aria-hidden
              className="block size-[22px] flex-none rounded-xs bg-green text-center font-mono text-[9.5px]/[22px] font-bold text-canvas"
            >
              A
            </span>
            {/* aria-live so a screen reader hears streamed answers arrive. */}
            <div
              aria-live="polite"
              aria-busy={streaming}
              className="flex min-w-0 flex-1 flex-col gap-3"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={answerSeq}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.34, ease: [0.2, 0.7, 0.3, 1] }}
                >
                  <BlockList blocks={shown} variant="chat" complete={!streaming} />
                </motion.div>
              </AnimatePresence>

              {streaming ? (
                <span className="animate-caret inline-block h-3.5 w-[7px] bg-green" aria-hidden />
              ) : null}

              {error ? (
                <p className="m-0 rounded-sm border border-amber-border bg-amber-fill px-3 py-2 font-mono text-[9.5px]/[1.5] text-amber-ink-deep">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The opening state, before anything has been asked. Replaces what used to be
 *  a pre-answered question the visitor never typed. */
function Welcome({ onAsk }: { onAsk: (topic: TopicId) => void }) {
  return (
    <div className="flex gap-[11px]">
      <span
        aria-hidden
        className="block size-[22px] flex-none rounded-xs bg-green text-center font-mono text-[9.5px]/[22px] font-bold text-canvas"
      >
        A
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-3.5">
        <p className="m-0 text-[13.5px]/[1.65] text-ink-body">{WELCOME}</p>
        <div className="flex flex-col gap-1.5">
          {MOST_ASKED.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onAsk(id)}
              className="rounded-[6px] border border-divider bg-raised-alt2 px-3 py-[9px] text-left text-[12.5px] font-medium text-ink transition-colors hover:border-green"
            >
              {QLABEL[id]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
