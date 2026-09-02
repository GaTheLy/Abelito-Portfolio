import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

// Which model the chat talks to, decided in one place.
//
// Priority is deliberate: a direct Google key wins over the Vercel AI Gateway.
// The gateway's free tier refuses Anthropic models outright and rate-limits the
// rest to roughly two requests before throttling, which isn't enough for a
// visitor asking a few questions. A personal Google AI key has its own, far
// larger free quota and doesn't expire every 24 hours the way an OIDC token
// does.
//
// The gateway path stays because it costs nothing to keep and is the better
// option the moment there are credits on it — provider failover, spend
// tracking and per-user limits all come free there.

export interface Resolved {
  model: LanguageModel;
  /** Shown in logs and the /api/ask response so the source is never a guess. */
  provider: "google" | "gateway";
  id: string;
}

/** Null means no credential at all — the caller serves authored answers. */
export function resolveModel(): Resolved | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const id = process.env.AI_MODEL ?? "gemini-2.5-flash";
    return { model: google(id), provider: "google", id };
  }

  if (process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN) {
    // Plain "provider/model" strings route through the gateway automatically.
    const id = process.env.AI_MODEL ?? "zai/glm-5.3-flash";
    return { model: id, provider: "gateway", id };
  }

  return null;
}
