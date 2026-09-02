import { streamObject, APICallError } from "ai";
import { blockSchema } from "@/lib/blocks";
import { GUARDED, routeQuestion, type TopicId } from "@/content/answers";
import { answerBlocks } from "@/content/answer-blocks";
import { SYSTEM_PROMPT } from "@/lib/prompt";
import { resolveModel } from "@/lib/model";

// The chat's brain.
//
//   POST /api/ask  { question, history? }  →  NDJSON stream
//
// Response protocol, one JSON object per line:
//   {"type":"meta","topic":"rag"}         … first, so IN FOCUS can update
//   {"type":"block","block":{…}}          … repeated, each block complete
//   {"type":"error","message":"…"}        … optional, when something degraded
//   {"type":"done","source":"model"|"partial"|"authored"}
//
// `source` is reported at the END, never up front: until the stream finishes
// there is no honest way to say where the answer came from.
//
// Blocks stream one complete element at a time (`output: "array"` +
// `elementStream`), which is why the client never has to parse partial JSON and
// why the mermaid renderer always receives finished source.

export const runtime = "nodejs";
export const maxDuration = 30;

// ponytail: best-effort in-memory rate limit — per serverless instance, resets
// on cold start. The durable limit is configured in the Vercel AI Gateway
// dashboard (per-user RPM + daily token cap); this is just a cheap first gate
// so an obvious flood never reaches the model at all.
/** The prompt asks for 3–6 blocks; one answer came back with 133, almost all
 *  duplicate tables. A hard stop keeps a degenerate response from rendering a
 *  wall of markup and burning output tokens. */
const MAX_BLOCKS = 12;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function allow(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  return true;
}

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function cleanHistory(raw: unknown): Msg[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is Msg => {
      const role = (m as Msg)?.role;
      return (role === "user" || role === "assistant") && typeof (m as Msg)?.content === "string";
    })
    .slice(-6)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 600) }));
}



/** One JSON object per line. */
function line(value: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(value)}\n`);
}

/** Turns a failure into something honest to show the visitor. The status codes
 *  are the ones the gateway actually returns; 403 is the one you hit when the
 *  configured model isn't on your plan. */
function noteFor(failure: unknown): string {
  const { names, status } = inspect(failure);
  const named = (needle: string) => names.some((n) => n.includes(needle));

  if (named("RateLimit") || status === 429) {
    return "The chat is rate-limited right now — here's my written answer instead.";
  }
  if (named("Authentication") || named("Unauthorized") || status === 401) {
    return "The chat's credential has expired — here's my written answer instead.";
  }
  if (named("ModelNotFound") || status === 403) {
    return "The chat's model isn't available on this plan — here's my written answer instead.";
  }
  if (status === 402) return "The chat's budget is spent for now — here's my written answer instead.";
  return "The live chat is unavailable — here's my written answer instead.";
}

/**
 * Collect every error name and the first status in the chain.
 *
 * Needed because the SDK nests aggressively and inconsistently: a gateway 429
 * arrives as AI_RetryError (no status, unhelpful name) wrapping
 * GatewayRateLimitError on `lastError` — NOT on `cause`. Walking only `cause`,
 * or only reading the top-level name, collapsed every failure into the generic
 * note and hid a plain rate limit.
 */
function inspect(error: unknown, depth = 0): { names: string[]; status?: number } {
  if (!error || typeof error !== "object" || depth > 5) return { names: [] };

  const self = error as {
    name?: string;
    statusCode?: unknown;
    cause?: unknown;
    lastError?: unknown;
    errors?: unknown[];
  };
  const names = self.name ? [self.name] : [];
  let status =
    APICallError.isInstance(error)
      ? error.statusCode
      : typeof self.statusCode === "number"
        ? self.statusCode
        : undefined;

  for (const next of [self.cause, self.lastError, self.errors?.[0]]) {
    if (!next) continue;
    const found = inspect(next, depth + 1);
    names.push(...found.names);
    status ??= found.status;
  }
  return { names, status };
}

/** The authored answer for a topic, as a finished NDJSON stream. Used for the
 *  guarded topics, when there's no credential, and whenever the model path
 *  fails — the site is never without an answer. */
function authoredStream(topic: TopicId, note?: string): Response {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(line({ type: "meta", topic, source: "authored" }));
      for (const block of answerBlocks[topic]) {
        controller.enqueue(line({ type: "block", block }));
      }
      if (note) controller.enqueue(line({ type: "error", message: note }));
      controller.enqueue(line({ type: "done", source: "authored" }));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "anon";

  const body = await req.json().catch(() => null);
  const question = String(body?.question ?? "")
    .trim()
    .slice(0, 300);
  if (!question) return Response.json({ error: "empty question" }, { status: 400 });

  const topic = routeQuestion(question);

  // Guardrails are hard-routed, not prompted. Refusing to invent a rate, being
  // straight about a two-month stint, and admitting what's still early are
  // product decisions — they must not depend on the model complying, so these
  // three never reach it. README §Guardrails.
  if (GUARDED.includes(topic)) return authoredStream(topic);

  if (!allow(ip)) {
    return authoredStream(topic, "That's a lot of questions in a minute — here's the short version while the rate limit cools off.");
  }

  // No credential at all — the whole site still works, it just serves the
  // authored answers.
  const resolved = resolveModel();
  if (!resolved) return authoredStream(topic);

  const history = cleanHistory(body?.history);

  // elementStream never throws: the SDK routes errors to onError only, so
  // without this a 403 from the gateway produced an empty stream that looked
  // exactly like a model with nothing to say. Captured here, read below.
  let failure: unknown = null;

  try {
    const result = streamObject({
      model: resolved.model,
      onError: ({ error }) => {
        failure = error;
      },
      output: "array",
      schema: blockSchema,
      system: SYSTEM_PROMPT,
      messages: [...history, { role: "user" as const, content: question }],
      temperature: 0.3,
      maxOutputTokens: 2000,
      providerOptions: {
        ...resolved.options,
        // The corpus is a stable ~11k-token prefix on every request. Anthropic
        // needs this hint; Google and GLM cache implicitly. Providers that
        // don't recognise it ignore it — it's an optimisation, not a
        // requirement.
        anthropic: { cacheControl: { type: "ephemeral" } },
        gateway: { tags: ["feature:portfolio-chat"] },
      },
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // `source` is NOT claimed here — at this point nothing has been
        // generated yet, and a failed call would make the claim a lie. It is
        // emitted as a `done` line once the outcome is actually known.
        controller.enqueue(line({ type: "meta", topic }));
        let count = 0;
        let sawFollowups = false;
        try {
          for await (const element of result.elementStream) {
            // Re-validate: elementStream is already schema-shaped, but this is
            // untrusted generated content heading for a renderer.
            const parsed = blockSchema.safeParse(element);
            if (parsed.success) {
              controller.enqueue(line({ type: "block", block: parsed.data }));
              if (parsed.data.type === "followups") sawFollowups = true;
              count += 1;
              if (count >= MAX_BLOCKS) break;
            } else {
              // Kept deliberately: a dropped block is otherwise indistinguishable
              // from a model with nothing to say, which is exactly the blind spot
              // that hid the first gateway failure.
              console.error("[ask] rejected block:", JSON.stringify({
                got: (element as {type?:string})?.type,
                issues: parsed.error.issues.slice(0,3).map(i => `${i.path.join(".")}: ${i.message}`),
                raw: JSON.stringify(element).slice(0,200),
              }));
            }
          }
        } catch (error) {
          failure = error;
        }

        if (count === 0) {
          // Nothing usable came back. Serve the authored answer whole, and say
          // so — a silent swap is the one thing this must never do.
          for (const block of answerBlocks[topic]) {
            controller.enqueue(line({ type: "block", block }));
          }
          // A model that returned nothing is not the same as one that errored;
          // saying "unavailable" when the service answered fine is misleading.
          controller.enqueue(
            line({
              type: "error",
              message: failure
                ? noteFor(failure)
                : "The live chat had nothing to add here — this is my written answer.",
            }),
          );
          controller.enqueue(line({ type: "done", source: "authored" }));
        } else if (failure) {
          // Cut off mid-answer. Keep what arrived, top up from the authored one.
          for (const block of answerBlocks[topic].slice(count)) {
            controller.enqueue(line({ type: "block", block }));
          }
          controller.enqueue(
            line({ type: "error", message: "The live answer cut out — this is my written one." }),
          );
          controller.enqueue(line({ type: "done", source: "partial" }));
        } else {
          // "Never dead-end" is a design promise, so it is enforced here rather
          // than left to prompt compliance — Gemini omits the block routinely
          // however firmly it is asked. Falls back to the authored topic's own
          // follow-ups, which are already hand-written and on-topic.
          if (!sawFollowups) {
            const authored = answerBlocks[topic].find((b) => b.type === "followups");
            if (authored) controller.enqueue(line({ type: "block", block: authored }));
          }
          controller.enqueue(line({ type: "done", source: "model", via: resolved.provider }));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    // Thrown before the stream even opened.
    return authoredStream(topic, noteFor(error));
  }
}
