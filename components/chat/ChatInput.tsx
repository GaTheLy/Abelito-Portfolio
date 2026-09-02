"use client";

import { useChat } from "./context";

/** The persistent ask bar. Present in both panel modes, and (later) in the
 *  mobile sheet. A real <form>, so Enter submits without a keydown handler. */
export default function ChatInput() {
  const { draft, setDraft, submit, streaming } = useChat();

  return (
    <div className="flex-none border-t border-divider bg-canvas px-4 pt-3 pb-3.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
        className="ask-bar flex items-center gap-2.5 rounded-[9px] border border-border-input bg-raised-alt2 px-3.5 py-[9px]"
      >
        <input
          id="chat-ask"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about Abelito…"
          // The visible label is gone, so the input still needs a name.
          aria-label="Ask about Abelito"
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
        Answers come from an LLM grounded in a knowledge base of my work. Rate,
        availability and self-assessment are answered from my own words, never generated.
      </p>
    </div>
  );
}
