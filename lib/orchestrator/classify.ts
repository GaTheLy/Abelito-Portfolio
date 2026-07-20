// Type-only import (erased at runtime) keeps classify free of module-resolution
// deps so its self-check runs under bare Node. Agent display metadata lives in
// agents.ts; the keyword map below is classify's own concern.
import type { AgentId } from "./agents";

export interface RouteResult {
  route: string;
  agentId: AgentId | null;
  confidence: number; // 0..1 — a real value, never fabricated.
  method: "semantic" | "keyword"; // how the route was decided (shown in the readout)
}

// Below this, we don't guess — we route to the honest fallback state.
export const CONFIDENCE_THRESHOLD = 0.4;

// This keyword map is now the FALLBACK for the semantic router (see embed.ts):
// used when the embedding model hasn't loaded yet, fails, or the browser can't
// run it. Kept deliberately simple and dependency-free (its self-check runs
// under bare Node). Real semantic routing is live in embed.ts.
const keywords: Record<AgentId, string[]> = {
  builder: [
    "ai", "ml", "machine learning", "llm", "nlp", "engineer", "engineering",
    "build", "code", "project", "model", "data", "datasaur", "system",
    "software", "technical", "backend",
  ],
  creator: [
    "content", "video", "youtube", "brand", "creator", "social", "post",
    "audience", "teach", "instagram", "tiktok", "channel",
  ],
  hobbyist: [
    "car", "cars", "invest", "investing", "stock", "finance", "money", "hobby",
    "hobbies", "curious", "curiosity", "drive", "portfolio",
  ],
  origin: [
    "who", "you", "your", "yourself", "story", "person", "personal", "life",
    "about", "background", "journey", "origin",
  ],
};

export function classify(input: string): RouteResult {
  const text = input.toLowerCase();

  let best: AgentId | null = null;
  let bestScore = 0;
  for (const id of Object.keys(keywords) as AgentId[]) {
    const hits = keywords[id].filter((k) => text.includes(k)).length;
    // Crude but honest: one match clears the threshold, more matches raise
    // confidence, saturating below 1. This is deliberately not a fake number.
    const score = hits === 0 ? 0 : Math.min(0.95, 0.45 + 0.12 * hits);
    if (score > bestScore) {
      bestScore = score;
      best = id;
    }
  }

  if (!best || bestScore < CONFIDENCE_THRESHOLD) {
    return { route: "/fallback", agentId: null, confidence: bestScore, method: "keyword" };
  }
  // Invariant: each agent's route is `/${id}` (see agents.ts). Kept in sync there.
  return { route: `/${best}`, agentId: best, confidence: bestScore, method: "keyword" };
}
