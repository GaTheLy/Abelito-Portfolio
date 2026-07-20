"use client";

// In-browser semantic routing — progressive enhancement over the keyword map.
// Lazily loads a ~23MB embedding model (all-MiniLM-L6-v2) from the HF Hub and
// classifies intent by cosine similarity against each agent's description. If
// anything fails (no WebGPU/WASM, offline, blocked), callers fall back to the
// keyword classifier, so the site always works.

import { agents, type AgentId } from "./agents";
import type { RouteResult } from "./classify";

// Max cosine (over an agent's routing phrases) below this → not confident
// enough; route to the honest fallback. ponytail: calibration knob. Calibrated
// against the real model: correct routes score ~0.56–1.0, noise ~0.17–0.31, so
// 0.40 sits in the gap. Re-check if you change the routing corpus in agents.ts.
export const SEMANTIC_THRESHOLD = 0.4;

type Embedder = (text: string) => Promise<Float32Array>;

let readyPromise: Promise<Embedder | null> | null = null;
// Each agent gets multiple vectors (description + example phrases); a query's
// score for an agent is the max similarity over them.
let agentVectors: { id: AgentId; vecs: Float32Array[] }[] | null = null;

async function init(): Promise<Embedder | null> {
  try {
    // Dynamic import keeps the heavy library out of the initial bundle and off
    // the server — it only loads in the browser when routing is first used.
    const { pipeline, env } = await import("@huggingface/transformers");
    env.allowLocalModels = false; // fetch from the HF Hub, nothing bundled locally

    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const embed: Embedder = async (text) => {
      const output = await extractor(text, { pooling: "mean", normalize: true });
      return output.data as Float32Array;
    };

    // Precompute agent vectors once (description + routing examples).
    const vectors: { id: AgentId; vecs: Float32Array[] }[] = [];
    for (const agent of agents) {
      const phrases = [agent.description, ...agent.examples];
      const vecs: Float32Array[] = [];
      for (const phrase of phrases) vecs.push(await embed(phrase));
      vectors.push({ id: agent.id, vecs });
    }
    agentVectors = vectors;
    return embed;
  } catch {
    return null;
  }
}

// Start loading in the background; safe to call repeatedly.
export function warmupEmbedder(): void {
  if (!readyPromise) readyPromise = init();
}

function cosine(a: Float32Array, b: Float32Array): number {
  // Vectors are L2-normalized, so cosine similarity == dot product.
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

// A semantic RouteResult, or null if the model isn't ready / failed to load.
export async function classifyBySemantics(text: string): Promise<RouteResult | null> {
  if (!readyPromise) readyPromise = init();
  const embed = await readyPromise;
  if (!embed || !agentVectors) return null;

  const q = await embed(text);
  let bestId: AgentId | null = null;
  let bestScore = -Infinity;
  for (const { id, vecs } of agentVectors) {
    // Agent score = best-matching phrase for this agent.
    const score = Math.max(...vecs.map((v) => cosine(q, v)));
    if (score > bestScore) {
      bestScore = score;
      bestId = id;
    }
  }

  const confidence = Math.max(0, bestScore);
  if (!bestId || confidence < SEMANTIC_THRESHOLD) {
    return { route: "/fallback", agentId: null, confidence, method: "semantic" };
  }
  return { route: `/${bestId}`, agentId: bestId, confidence, method: "semantic" };
}
