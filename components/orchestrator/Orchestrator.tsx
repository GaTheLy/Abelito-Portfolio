"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { classify } from "@/lib/orchestrator/classify";
import { classifyBySemantics, warmupEmbedder } from "@/lib/orchestrator/embed";
import { getProject, overviewIndex, projects } from "@/lib/projects";
import { blockLabel, blockQuestion } from "@/lib/blocks";
import type { AgentId } from "@/lib/orchestrator/agents";
import ResponseView from "./ResponseView";
import { OrchestratorContext, type FollowUp, type OrchestratorApi, type View } from "./context";

// The routing readout shows briefly before each response reveals — a real value,
// a real pause. This is the "AI responding" beat, CSS-only (Framer arrives M5).
const REVEAL_MS = 650;

interface Turn {
  id: number;
  userText: string; // the prompt bubble
  view: View | null; // null while the router is still classifying ("routing…")
  caption: string; // routing readout kept above the response
  followUps: FollowUp[]; // suggested next steps rendered as buttons
}

// Question-phrased so it's obvious the box takes plain-language questions.
const CHIPS: { label: string; prompt: string }[] = [
  { label: "Show me your ML projects", prompt: "show me your ai and ml engineering projects" },
  { label: "What do you create?", prompt: "your content brand and videos" },
  { label: "Cars or investing?", prompt: "cars investing and hobbies" },
  { label: "Who are you?", prompt: "who are you, tell me your story" },
];

// Gentle cross-links keep non-project responses conversational without chunking.
const AGENT_FOLLOWUPS: Record<AgentId, FollowUp[]> = {
  builder: [], // project cards are the actions here
  creator: [{ label: "What has he built?", view: { kind: "agent", agentId: "builder" } }],
  hobbyist: [{ label: "Who is he, really?", view: { kind: "agent", agentId: "origin" } }],
  origin: [{ label: "See what he's built", view: { kind: "agent", agentId: "builder" } }],
};

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function captionFor(view: View): string {
  switch (view.kind) {
    case "agent":
      return `→ ${view.agentId}`;
    case "chunk": {
      const block = getProject(view.slug)?.blocks[view.index];
      return `→ ${view.slug}${block ? ` · ${blockLabel[block.type].toLowerCase()}` : ""}`;
    }
    case "connect":
      return "→ connect";
    case "fallback":
      return "no match";
  }
}

export default function Orchestrator() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [revealingId, setRevealingId] = useState<number | null>(null);
  // Time-based greeting is computed after mount to avoid a hydration mismatch.
  const [greeting, setGreeting] = useState("Hello there");
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);
  // Which chunks the visitor has already seen, per project — so follow-ups don't
  // re-offer them. Conversation memory, kept in a ref (not render state).
  const seen = useRef<Map<string, Set<number>>>(new Map());

  const busy = revealingId !== null;

  // Time-of-day is a client-only value; reading it post-mount is the correct use
  // of an effect here — it avoids an SSR hydration mismatch on the greeting.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setGreeting(timeGreeting()), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, revealingId]);

  // Start downloading the embedding model in the background so the first ask is
  // already semantic. Harmless if it fails — keyword routing covers it.
  useEffect(() => warmupEmbedder(), []);

  // Next-chunk suggestions for a project, excluding chunks already seen. When a
  // project is exhausted, suggest other projects instead.
  const recsForProject = useCallback((slug: string): FollowUp[] => {
    const project = getProject(slug);
    if (!project) return [];
    const seenSet = seen.current.get(slug) ?? new Set<number>();
    const remaining = project.blocks
      .map((block, index) => ({ block, index }))
      .filter(({ index }) => !seenSet.has(index));
    if (remaining.length === 0) {
      return projects
        .filter((p) => p.slug !== slug)
        .slice(0, 3)
        .map((p) => ({ label: `See ${p.title}`, view: { kind: "chunk", slug: p.slug, index: overviewIndex(p) } }));
    }
    return remaining.slice(0, 3).map(({ block, index }) => ({
      label: blockQuestion[block.type],
      view: { kind: "chunk", slug, index },
    }));
  }, []);

  const followUpsFor = useCallback(
    (view: View): FollowUp[] => {
      switch (view.kind) {
        case "chunk": {
          const set = seen.current.get(view.slug) ?? new Set<number>();
          set.add(view.index);
          seen.current.set(view.slug, set);
          return recsForProject(view.slug);
        }
        case "agent":
          return AGENT_FOLLOWUPS[view.agentId];
        default:
          return [];
      }
    },
    [recsForProject],
  );

  const respond = useCallback((userText: string, view: View, caption: string, followUps: FollowUp[]) => {
    const id = nextId.current++;
    setTurns((prev) => [...prev, { id, userText, view, caption, followUps }]);
    setRevealingId(id);
    window.setTimeout(() => setRevealingId((cur) => (cur === id ? null : cur)), REVEAL_MS);
  }, []);

  const ask = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;

      // Phase 1: show the prompt + a live "routing…" beat immediately.
      const id = nextId.current++;
      setTurns((prev) => [
        ...prev,
        { id, userText: trimmed, view: null, caption: "routing…", followUps: [] },
      ]);
      setRevealingId(id);

      // Phase 2: real classification — semantic if the model is ready, else keyword.
      let r = null;
      try {
        r = await classifyBySemantics(trimmed);
      } catch {
        r = null;
      }
      if (!r) r = classify(trimmed);

      const c = r.confidence.toFixed(2);
      const view: View = r.agentId
        ? { kind: "agent", agentId: r.agentId }
        : { kind: "fallback", q: trimmed, confidence: r.confidence };
      const caption = r.agentId ? `→ ${r.agentId} · ${c} · ${r.method}` : `no match · ${c} · ${r.method}`;
      const followUps = followUpsFor(view);

      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, view, caption, followUps } : t)));
      // Brief reveal beat so the readout is visible even when classification is instant.
      window.setTimeout(() => setRevealingId((cur) => (cur === id ? null : cur)), REVEAL_MS);
    },
    [busy, followUpsFor],
  );

  const open = useCallback(
    (view: View, label: string) => {
      if (busy) return;
      respond(label, view, captionFor(view), followUpsFor(view));
    },
    [busy, respond, followUpsFor],
  );

  // A prompt submitted from another page's nav lands here as ?q — ask it once.
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      ask(q);
      window.history.replaceState(null, "", "/");
    }
  }, [ask]);

  const api: OrchestratorApi = useMemo(() => ({ ask, open }), [ask, open]);
  const reset = useCallback(() => {
    setTurns([]);
    setRevealingId(null);
    seen.current = new Map();
  }, []);

  const started = turns.length > 0;

  return (
    <OrchestratorContext.Provider value={api}>
      <div className="flex min-h-0 flex-1 flex-col">
        {!started ? (
          // Empty state — an obvious chat composer, like a fresh assistant screen.
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10 text-center">
            <div className="w-full max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-widest text-muted">
                <span aria-hidden className="text-hobbyist">
                  ✳
                </span>{" "}
                the orchestrator
              </p>
              <h1 className="mt-6 font-voice text-4xl tracking-tight sm:text-5xl">{greeting}.</h1>
              {/* TODO_ABELITO: refine the greeting subline copy */}
              <p className="mt-4 text-muted">
                Ask me anything about Abelito — his work, his content, or who he is. Type a message
                below and I’ll take you right to it.
              </p>
              <div className="mt-8">
                <InputBar
                  variant="hero"
                  disabled={busy}
                  onSubmit={ask}
                  placeholder="Message the orchestrator…"
                />
              </div>
              <p className="mt-2 text-xs text-muted">Press Enter to send</p>
              <div className="mt-8">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">Try asking</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      disabled={busy}
                      onClick={() => ask(chip.prompt)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                    >
                      “{chip.label}”
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Conversation — responses stack, composer docks at the bottom.
          <>
            <div
              ref={scrollRef}
              aria-live="polite"
              aria-label="Conversation"
              className="flex-1 overflow-y-auto px-6 py-8"
            >
              <div className="mx-auto max-w-6xl space-y-10">
                {turns.map((turn) => (
                  <TurnView
                    key={turn.id}
                    turn={turn}
                    revealing={turn.id === revealingId}
                    busy={busy}
                    onOpen={open}
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-border px-6 py-4">
              <div className="mx-auto flex max-w-6xl items-center gap-3">
                <div className="flex-1">
                  <InputBar
                    variant="docked"
                    disabled={busy}
                    onSubmit={ask}
                    placeholder="Message the orchestrator…"
                  />
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="shrink-0 font-mono text-xs text-muted transition-colors hover:text-foreground"
                >
                  new chat
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </OrchestratorContext.Provider>
  );
}

function TurnView({
  turn,
  revealing,
  busy,
  onOpen,
}: {
  turn: Turn;
  revealing: boolean;
  busy: boolean;
  onOpen: (view: View, label: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <p className="max-w-md rounded-2xl rounded-br-sm border border-border bg-card px-4 py-2 text-sm">
          {turn.userText}
        </p>
      </div>
      <div className="flex gap-3">
        <span aria-hidden className="mt-1 select-none text-hobbyist">
          ✳
        </span>
        <div className="min-w-0 flex-1">
          {turn.view && !revealing ? (
            <div className="animate-readout">
              <p className="mb-4 font-mono text-xs text-muted">{turn.caption}</p>
              <ResponseView view={turn.view} />
              {turn.followUps.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {turn.followUps.map((fu) => (
                    <button
                      key={fu.label}
                      type="button"
                      disabled={busy}
                      onClick={() => onOpen(fu.view, fu.label)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/30 hover:text-foreground disabled:opacity-50"
                    >
                      {fu.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="animate-pulse font-mono text-xs text-muted">routing…</p>
          )}
        </div>
      </div>
    </div>
  );
}

function InputBar({
  variant,
  disabled,
  onSubmit,
  placeholder,
}: {
  variant: "hero" | "docked";
  disabled: boolean;
  onSubmit: (text: string) => void;
  placeholder: string;
}) {
  // Local input state so typing never re-renders the conversation thread.
  const [text, setText] = useState("");
  const hero = variant === "hero";
  const canSend = !!text.trim() && !disabled;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSubmit(text.trim());
        setText("");
      }}
      className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-card transition-colors focus-within:border-foreground/40 ${
        hero ? "px-5 py-4" : "px-4 py-2.5"
      }`}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        aria-label="Message the orchestrator"
        placeholder={placeholder}
        className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted ${
          hero ? "text-base" : "text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Send"
        disabled={!canSend}
        className={`grid shrink-0 place-items-center rounded-full bg-foreground text-background transition-opacity disabled:opacity-30 ${
          hero ? "h-9 w-9" : "h-7 w-7"
        }`}
      >
        <span aria-hidden className={hero ? "text-base" : "text-sm"}>
          ↑
        </span>
      </button>
    </form>
  );
}
