import type { TopicId } from "./answers.ts";

// Essays live off-site. Until the real URLs arrive, each entry offers the chat
// or the related case study instead of a dead link — see `needsUrls` below.

export interface Essay {
  title: string;
  blurb: string;
  tags: string[];
  status: "EXTERNAL · MEDIUM" | "DRAFT";
  /** Real permalink. Missing for every entry until Abelito supplies them. */
  url?: string;
  /** The offer made in place of the link. */
  action: { label: string; topic?: TopicId; href?: string };
}

export const essays: Essay[] = [
  {
    title: "A vibe check is not an eval",
    blurb:
      "Why I freeze a 15-question benchmark before touching a prompt, what RAGAS catches that reading answers doesn't, and the three failure modes that look identical from the outside.",
    tags: ["EVALUATION", "RAG"],
    status: "EXTERNAL · MEDIUM",
    action: { label: "Ask instead →", topic: "evals" },
  },
  {
    title: "Dense search knows what you meant. BM25 knows what you typed.",
    blurb:
      "A practical case for hybrid retrieval, written after watching a pure-vector index confidently miss the exact model name a question was about. Includes what Reciprocal Rank Fusion is actually doing.",
    tags: ["RETRIEVAL", "RRF"],
    status: "EXTERNAL · MEDIUM",
    action: { label: "Ask instead →", topic: "rag" },
  },
  {
    title: "The chatbot was easy. The state machine took three weeks.",
    blurb:
      "What building a real client's WhatsApp booking agent taught me about conversations that pause for two days, and why a human should still approve the money.",
    tags: ["AGENTS", "CLIENT WORK"],
    status: "EXTERNAL · MEDIUM",
    action: { label: "Case study →", href: "/projects/manna" },
  },
  {
    title: "Latency is a product decision",
    blurb:
      'Testers called the same model "smart" at two seconds and "broken" at six. On optimising the thing around the model instead of the model.',
    tags: ["ML ENGINEERING"],
    status: "DRAFT",
    action: { label: "The project →", href: "/projects/talkative" },
  },
];

/** True while any essay is missing its real permalink — drives the amber
 *  callout. It disappears on its own once the URLs are filled in. */
export const needsUrls = essays.some((e) => !e.url);
