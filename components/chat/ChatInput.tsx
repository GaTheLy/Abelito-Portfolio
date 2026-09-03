"use client";

import { useRef, useCallback } from "react";
import type { RailContext } from "@/lib/rail";
import { useChat } from "./context";

/** The persistent ask bar. Present in both panel modes and in the mobile sheet.
 *
 *  Uses a <textarea> so the field grows with the user's input (up to 8 lines),
 *  then scrolls vertically. Enter submits; Shift+Enter inserts a newline.
 *
 *  `scope` is set only beside a case study: it bounds the answer to that
 *  project and keeps it in the rail instead of navigating Home. */
export default function ChatInput({ scope = null }: { scope?: RailContext | null }) {
  const { draft, setDraft, submit, streaming } = useChat();
  const about = scope ? scope.name : "Abelito";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const grow = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setDraft(e.target.value);
      grow();
    },
    [setDraft, grow],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!streaming && draft.trim()) submit(draft, scope?.slug);
      }
    },
    [draft, scope, streaming, submit],
  );

  return (
    <div className="flex-none border-t border-divider bg-canvas px-4 pt-3 pb-3.5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft, scope?.slug);
        }}
        className="ask-bar flex items-end gap-2.5 rounded-[9px] border border-border-input bg-raised-alt2 px-3.5 py-[9px]"
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Ask about ${about}…`}
          aria-label={`Ask about ${about}`}
          autoComplete="off"
          // max-h-[10rem] ≈ 8 lines; overflow-y-auto scrolls beyond that.
          // resize-none hides the drag handle; the field self-sizes via grow().
          className="ask-field max-h-[10rem] min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent text-[13px] leading-[1.5] text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={streaming || !draft.trim()}
          className="t-chip mb-px flex-none rounded-pill bg-green px-3 py-1.5 text-surface transition-colors hover:bg-green-dark disabled:opacity-40"
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>

      <p className="mt-2 mb-0 px-0.5 font-mono text-[9.5px]/[1.5] text-ink-faint">
        Answers come from an LLM grounded in a knowledge base of my work. Rate, availability and
        self-assessment are answered from my own words, never generated.
      </p>
    </div>
  );
}
