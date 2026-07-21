"use client";

import { createContext, useContext } from "react";
import type { AgentId } from "@/lib/orchestrator/agents";
import type { NavTarget } from "@/lib/orchestrator/retrieve";

// A citation on a grounded answer — a real section the answer drew from, which
// the visitor can jump to.
export interface Citation {
  label: string;
  target: NavTarget;
}

// A "view" is what a single assistant response renders. Sections are responses
// in the conversation; a case study is delivered one chunk (block) at a time;
// an `answer` is a Tier-2 RAG response grounded in the cited sections.
export type View =
  | { kind: "agent"; agentId: AgentId }
  | { kind: "chunk"; slug: string; index: number }
  | { kind: "connect" }
  | { kind: "answer"; text: string; citations: Citation[] }
  | { kind: "fallback"; q: string; confidence: number };

export interface FollowUp {
  label: string;
  view: View;
}

export interface OrchestratorApi {
  // Free text → real classifier → response (with routing readout).
  ask: (text: string) => void;
  // Deterministic open (nav, project cards) → response, no fabricated confidence.
  open: (view: View, label: string) => void;
}

export const OrchestratorContext = createContext<OrchestratorApi | null>(null);

export function useOrchestrator(): OrchestratorApi {
  const api = useContext(OrchestratorContext);
  if (!api) throw new Error("useOrchestrator must be used within <Orchestrator>");
  return api;
}
