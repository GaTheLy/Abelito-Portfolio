"use client";

import type { RailContext } from "@/lib/rail";
import { useChat } from "./context";

/** The persistent ask bar. Present in both panel modes and in the mobile sheet.
 *  A real <form>, so Enter submits without a keydown handler.
 *
 *  `scope` is set only beside a case study: it bounds the answer to that
 *  project and keeps it in the rail instead of navigating Home. */
export default function ChatInput({ scope = null }: { scope?: RailContext | null }) {
  const { draft, setDraft, submit, streaming } = useChat();
  const about = scope ? scope.name : "Abelito";

  return (
    <div className="flex-none border-t border-divider bg-canvas px-4 pt-3 pb-3.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft, scope?.slug);
        }}
        className="ask-bar flex items-center gap-2.5 rounded-[9px] border border-border-input bg-raised-alt2 px-3.5 py-[9px]"
      >
        <input
          // No id: this renders twice on a phone (panel + sheet) and nothing
          // referenced it — a duplicate id for no caller.
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Ask about ${about}…`}
          // The visible label is gone, so the input still needs a name.
          aria-label={`Ask about ${about}`}
          autoComplete="off"
          className="ask-field min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={streaming || !draft.trim()}
          className="t-chip rounded-pill bg-green px-3 py-1.5 text-surface transition-colors hover:bg-green-dark disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>

      <p className="mt-2 mb-0 px-0.5 font-mono text-[9.5px]/[1.5] text-ink-faint">
        {scope
          ? "Answers here come from this case study alone, as prose. For anything wider, use the chat on the home page."
          : "Answers come from an LLM grounded in a knowledge base of my work. Rate, availability and self-assessment are answered from my own words, never generated."}
      </p>
    </div>
  );
}
