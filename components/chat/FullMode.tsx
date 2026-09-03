"use client";

import { WELCOME, MOST_ASKED, QLABEL } from "@/content/answers";
import Transcript from "./Transcript";
import { useChat } from "./context";
import type { TopicId } from "@/content/answers";

/** Home only, 704px. The transcript accumulates: every question and answer
 *  stays, oldest first, and the panel scrolls. "New chat" in the panel header
 *  clears it. Follow-ups come from each answer's own `followups` block, which
 *  the API guarantees is present, so there is no separate suggestion rail. */
export default function FullMode() {
  const { turns, started, ask } = useChat();

  return started ? (
    <Transcript turns={turns} className="px-5 pt-[18px] pb-2" />
  ) : (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-[18px] pb-2">
      <Welcome onAsk={ask} />
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
