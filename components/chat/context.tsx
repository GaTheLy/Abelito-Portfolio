"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QLABEL, routeQuestion, type TopicId } from "@/content/answers";
import type { Block } from "@/lib/blocks";

/** One question and its answer. The transcript is a list of these — a chat
 *  accumulates, it doesn't replace itself. */
export interface Turn {
  id: number;
  question: string;
  /** Drives the authored fallback, and the mobile sheet's title. */
  topic: TopicId;
  /** `null` means "render the authored blocks for `topic`" — the chip path, the
   *  offline path and the fallback path. */
  blocks: Block[] | null;
  streaming: boolean;
  error: string | null;
}

interface ChatValue {
  /** Oldest first. Only the last one can be streaming. */
  turns: Turn[];
  /** Uncommitted chat input. */
  draft: string;
  /** The case-study slug this session is bound to, if any. Asking under a
   *  different scope starts a new session rather than continuing this one. */
  sessionScope?: string;
  /** False until the first question. Drives the panel's opening state. */
  started: boolean;
  /** True while the newest answer is still arriving. */
  streaming: boolean;

  setDraft: (value: string) => void;
  /** Open a topic directly (a chip, or an AskButton in page content). Navigates
   *  Home: those live outside the panel, and the rich blocks need the width. */
  ask: (topic: TopicId, label?: string) => void;
  /** Submit free text. Routes by keyword, then asks the API for a real answer.
   *  Answers where it was asked — every surface that can call this can render
   *  the result — so it never navigates. `scope` is a case-study slug: it bounds
   *  the answer to that project and keeps it to prose. */
  submit: (text: string, scope?: string) => void;
  /** Clear the transcript and start a fresh session. */
  reset: () => void;
}

const ChatContext = createContext<ChatValue | null>(null);

export function useChat(): ChatValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error("useChat must be used inside <ChatProvider>");
  return value;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [sessionScope, setSessionScope] = useState<string | undefined>(undefined);

  const nextId = useRef(0);
  /** Conversation memory sent to the API so follow-ups inherit context. Cleared
   *  whenever the session is, so a case-study rail neither inherits from nor
   *  leaks into the unscoped chat. */
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  /** Lets a new question cancel the one still streaming. */
  const inflight = useRef<AbortController | null>(null);

  const patch = useCallback((id: number, fields: Partial<Turn>) => {
    setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, ...fields } : t)));
  }, []);

  /** Append a turn — or start a new session with it, if the scope changed. */
  const open = useCallback(
    (turn: Omit<Turn, "id">, scope: string | undefined): number => {
      inflight.current?.abort();
      const id = (nextId.current += 1);
      const fresh = scope !== sessionScope;
      if (fresh) {
        history.current = [];
        setSessionScope(scope);
      }
      setTurns((prev) => (fresh ? [{ ...turn, id }] : [...prev, { ...turn, id }]));
      setDraft("");
      return id;
    },
    [sessionScope],
  );

  const reset = useCallback(() => {
    inflight.current?.abort();
    history.current = [];
    setTurns([]);
    setDraft("");
  }, []);

  const ask = useCallback(
    (topic: TopicId, label?: string) => {
      // A chip is a known topic — serve the authored blocks directly. No API
      // call, no latency, no cost.
      open(
        {
          question: label ?? QLABEL[topic],
          topic,
          blocks: null,
          streaming: false,
          error: null,
        },
        undefined,
      );
      router.push("/");
    },
    [open, router],
  );

  const submit = useCallback(
    (text: string, scope?: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Route optimistically so the fallback answer is correct from the first
      // frame; the server re-routes authoritatively.
      const id = open(
        {
          question: trimmed,
          topic: routeQuestion(trimmed),
          blocks: [],
          streaming: true,
          error: null,
        },
        scope,
      );

      const controller = new AbortController();
      inflight.current = controller;

      void (async () => {
        try {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ question: trimmed, history: history.current, scope }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) throw new Error(`ask failed: ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          const collected: Block[] = [];
          let buffer = "";

          // NDJSON: one complete block per line, so nothing here parses
          // partial JSON and mermaid always gets finished source.
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const raw of lines) {
              if (!raw.trim()) continue;
              let event: { type: string; topic?: TopicId; block?: Block; message?: string };
              try {
                event = JSON.parse(raw);
              } catch {
                continue; // partial or malformed line — skip it, keep reading
              }

              if (event.type === "meta" && event.topic) patch(id, { topic: event.topic });
              else if (event.type === "block" && event.block) {
                collected.push(event.block);
                patch(id, { blocks: [...collected] });
              } else if (event.type === "error" && event.message) {
                patch(id, { error: event.message });
              }
            }
          }

          history.current = [
            ...history.current,
            { role: "user" as const, content: trimmed },
            // Only the prose matters as memory — tables and diagrams would
            // bloat the context without helping a follow-up.
            {
              role: "assistant" as const,
              content: collected
                .filter((b) => b.type === "text" || b.type === "heading")
                .map((b) => (b.type === "text" ? b.md : b.type === "heading" ? b.text : ""))
                .join(" ")
                .slice(0, 600),
            },
          ].slice(-6);
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
          // Network died before the route could answer. Unscoped, `blocks: null`
          // puts the authored answer back on screen; scoped, that answer is the
          // wrong shape and possibly the wrong project — so point at the one
          // thing that is certainly right and certainly on screen.
          patch(id, {
            blocks: scope
              ? [
                  {
                    type: "text",
                    md: "I couldn't reach the chat just now — the sections on this page answer it in full.",
                  },
                ]
              : null,
            error: "Couldn't reach the chat — showing my written answer instead.",
          });
        } finally {
          if (inflight.current === controller) inflight.current = null;
          patch(id, { streaming: false });
        }
      })();
    },
    [open, patch],
  );

  const value = useMemo<ChatValue>(
    () => ({
      turns,
      draft,
      sessionScope,
      started: turns.length > 0,
      streaming: turns[turns.length - 1]?.streaming ?? false,
      setDraft,
      ask,
      submit,
      reset,
    }),
    [turns, draft, sessionScope, ask, submit, reset],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
