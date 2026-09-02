"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QLABEL, routeQuestion, type TopicId } from "@/content/answers";
import type { Block } from "@/lib/blocks";

/** Chat state, mounted once in the root layout so the panel survives every
 *  route change. README §State is the contract this implements. */
interface ChatValue {
  /** Current answer's topic — drives IN FOCUS and the authored fallback. */
  topic: TopicId;
  /** Question text shown in the dark user bubble. */
  question: string;
  /** Last 3 previous questions, shown as the "EARLIER" trail. */
  trail: string[];
  /** Uncommitted chat input. */
  draft: string;
  /** LLM-generated blocks for the current answer. `null` means "use the
   *  authored blocks for `topic`" — the offline and fallback path. */
  blocks: Block[] | null;
  streaming: boolean;
  error: string | null;
  /** Monotonic id — bumped on every answer so the page scroll can reset. */
  answerSeq: number;
  /** False until the first question. Drives the panel's opening state. */
  started: boolean;

  setDraft: (value: string) => void;
  /** Open a topic directly (chip click). Navigates Home: rail mode has no
   *  transcript, and the rich blocks need the full 704px. */
  ask: (topic: TopicId, label?: string) => void;
  /** Submit free text. Routes by keyword, then asks the API for a real answer. */
  submit: (text: string) => void;
}

const ChatContext = createContext<ChatValue | null>(null);

export function useChat(): ChatValue {
  const value = useContext(ChatContext);
  if (!value) throw new Error("useChat must be used inside <ChatProvider>");
  return value;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [topic, setTopic] = useState<TopicId>("rag");
  // Empty until the visitor actually asks — the panel opens on a welcome,
  // not on an answer to a question nobody asked.
  const [question, setQuestion] = useState<string>("");
  const [trail, setTrail] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [blocks, setBlocks] = useState<Block[] | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answerSeq, setAnswerSeq] = useState(0);

  /** Conversation memory sent to the API so follow-ups inherit context. */
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  /** Lets a new question cancel the one still streaming. */
  const inflight = useRef<AbortController | null>(null);

  /** Shared by both entry points: push the outgoing question onto the trail,
   *  set the new one, clear the draft, go Home. */
  const open = useCallback(
    (next: TopicId, label: string) => {
      inflight.current?.abort();
      // Filter: the opening state has no question, and a blank trail entry
      // would render as an empty row under EARLIER.
      setTrail((prev) => [...prev, question].filter(Boolean).slice(-3));
      setTopic(next);
      setQuestion(label);
      setDraft("");
      setError(null);
      setAnswerSeq((n) => n + 1);
      router.push("/");
    },
    [question, router],
  );

  const ask = useCallback(
    (next: TopicId, label?: string) => {
      // A chip is a known topic — serve the authored blocks directly. No API
      // call, no latency, no cost.
      setBlocks(null);
      setStreaming(false);
      open(next, label ?? QLABEL[next]);
    },
    [open],
  );

  const submit = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // Route optimistically so IN FOCUS and the fallback answer are correct
      // from the first frame; the server re-routes authoritatively.
      open(routeQuestion(trimmed), trimmed);
      setBlocks([]);
      setStreaming(true);

      const controller = new AbortController();
      inflight.current = controller;

      void (async () => {
        try {
          const res = await fetch("/api/ask", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ question: trimmed, history: history.current }),
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

              if (event.type === "meta" && event.topic) setTopic(event.topic);
              else if (event.type === "block" && event.block) {
                collected.push(event.block);
                setBlocks([...collected]);
              } else if (event.type === "error" && event.message) setError(event.message);
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
          // Network died before the route could answer. `blocks: null` puts the
          // authored answer back on screen.
          setBlocks(null);
          setError("Couldn't reach the chat — showing my written answer instead.");
        } finally {
          if (inflight.current === controller) {
            inflight.current = null;
            setStreaming(false);
          }
        }
      })();
    },
    [open],
  );

  const value = useMemo<ChatValue>(
    () => ({
      topic,
      question,
      trail,
      draft,
      blocks,
      streaming,
      error,
      answerSeq,
      started: answerSeq > 0,
      setDraft,
      ask,
      submit,
    }),
    [topic, question, trail, draft, blocks, streaming, error, answerSeq, ask, submit],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
