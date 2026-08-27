"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FOCUS, QLABEL, SUGGESTED } from "@/content/answers";
import { answerBlocks } from "@/content/answer-blocks";
import BlockList from "@/components/blocks/BlockList";
import { useChat } from "./context";

/** Home only, 704px. The full transcript experience: a dossier that follows the
 *  conversation, the question, the answer, and somewhere to go next. */
export default function FullMode() {
  const { topic, question, trail, blocks, streaming, error, answerSeq, ask } = useChat();

  const focus = FOCUS[topic];
  // `blocks === null` means "no generated answer" — serve the authored one.
  // That is the offline path, the fallback path, and the guardrail path.
  const shown = blocks ?? answerBlocks[topic];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* IN FOCUS — a mini dossier keyed off the answer's topic. This is what
          stops the left column feeling static while someone chats. */}
      <div className="flex-none border-b border-divider bg-well px-5 pt-3.5 pb-[15px]">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-green uppercase">
            In focus
          </span>
          <span className="font-mono text-[9px] tracking-[0.06em] text-ink-faint uppercase">
            Follows the chat
          </span>
        </div>
        <div className="text-[15px]/[1.2] font-medium tracking-[-0.015em] text-ink">
          {focus.title}
        </div>
        <p className="mt-1.5 mb-0 text-[12.5px]/[1.5] text-ink-body">{focus.description}</p>
        <dl className="mt-2.5 grid grid-cols-[52px_1fr] gap-x-[11px] gap-y-[5px] text-[11.5px]/[1.4]">
          <dt className="pt-0.5 font-mono text-[9.5px] text-ink-label">{focus.k1}</dt>
          <dd className="m-0">{focus.v1}</dd>
          <dt className="pt-0.5 font-mono text-[9.5px] text-ink-label">{focus.k2}</dt>
          <dd className="m-0">{focus.v2}</dd>
        </dl>
      </div>

      {/* Transcript */}
      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-5 pt-[18px] pb-2">
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

        <div className="flex flex-wrap gap-[7px] pt-1 pb-1.5">
          <span className="self-center font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
            Try
          </span>
          {SUGGESTED.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => ask(id)}
              className="t-chip rounded-pill border border-border-input bg-raised-alt2 px-[11px] py-1.5 text-ink transition-colors hover:border-green"
            >
              {QLABEL[id]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
