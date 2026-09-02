// The chat's nine topics. Transcribed from the design prototype
// (reference/Abelito Visese - Portfolio.dc.html) and README §The nine authored
// answers.
//
// These serve three jobs at once, which is why they live in content/ and not in
// lib/:
//   1. the offline experience when no LLM credential is configured
//   2. the fallback whenever the LLM path fails
//   3. the canonical stance + tone, fed to the model as part of the corpus
//
// Block bodies are added in `answerBlocks` (see content/answer-blocks.ts).

export const TOPIC_IDS = [
  "rag",
  "evals",
  "manna",
  "cv",
  "datasaur",
  "rate",
  "good",
  "creator",
  "fallback",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

/** Topics that must never be generated. See README §Guardrails — these are
 *  product decisions (refusing to invent a rate, being honest about a 2-month
 *  stint, admitting what's still early), not information retrieval. They are
 *  served verbatim and never reach the model. */
export const GUARDED: readonly TopicId[] = ["rate", "good", "datasaur"];

/** The question text shown in the user bubble when a topic is opened by chip
 *  rather than typed. */
export const QLABEL: Record<TopicId, string> = {
  rag: "Show me your best RAG work",
  evals: "How do you know your retrieval is any good?",
  manna: "Something you shipped for a real client",
  cv: "What's your computer vision background?",
  datasaur: "Why only 2 months at Datasaur?",
  rate: "What's your rate, and are you available?",
  good: "Are you actually good, or just early?",
  creator: "What are you making on TikTok?",
  fallback: "Write me a poem about Kubernetes",
};

/** Per-topic framing. The desktop dossier this was built for has been removed;
 *  it now titles the mobile sheet and gives the model a one-line summary of each
 *  topic in the corpus. Keyed off topic id so it stays a lookup. */
export interface Focus {
  title: string;
  description: string;
  k1: string;
  v1: string;
  k2: string;
  v2: string;
}

export const FOCUS: Record<TopicId, Focus> = {
  rag: {
    title: "Riset",
    description:
      "An AI research agent that reads arXiv and AI news, scores what's worth covering, and drafts the angle.",
    k1: "STATUS",
    v1: "In progress · self-directed",
    k2: "STACK",
    v2: "Python · Claude API · FAISS · BM25 · MCP",
  },
  evals: {
    title: "Evaluation practice",
    description:
      "How I decide whether a retrieval change actually helped — across every project here.",
    k1: "TOOLS",
    v1: "RAGAS · DeepEval · LLM-judge rubric",
    k2: "SEEN IN",
    v2: "Riset · Manna · the Axrail agent",
  },
  manna: {
    title: "Manna Cooking Studio",
    description:
      "A WhatsApp agent that took over a cooking school's booking desk. My first paying client.",
    k1: "ROLE",
    v1: "Sole engineer, end to end",
    k2: "STACK",
    v2: "TypeScript · Gemini · ChromaDB · Baileys",
  },
  cv: {
    title: "Computer vision",
    description:
      "Four years of pointing models at cameras — traffic, sport, gyms, factory floors.",
    k1: "RANGE",
    v1: "YOLO11 → YOLO26 · SAM 3 · CoreML",
    k2: "BEST",
    v2: "97.4% congestion accuracy at 14.4ms",
  },
  datasaur: {
    title: "Datasaur",
    description:
      "AI Engineer on LLM and NLP systems since June 2026. Kept high-level here on purpose.",
    k1: "BEFORE",
    v1: "KinetixPro · Axrail · Apple Academy",
    k2: "DEPTH",
    v2: "Happy to go deeper on a call",
  },
  rate: {
    title: "Working together",
    description:
      "Open to full-time remote and to scoped contract builds. Straight answers, no dance.",
    k1: "BASED",
    v1: "Malang, Indonesia · GMT+7",
    k2: "NOTICE",
    v2: "Let's talk specifics on a call",
  },
  good: {
    title: "The honest assessment",
    description: "What I'm genuinely strong at, and what I'm still early on.",
    k1: "STRONG",
    v1: "Retrieval, agent tooling, CV pipelines",
    k2: "EARLY",
    v2: "Team scale, long-horizon ownership",
  },
  creator: {
    title: "@abelitovisese",
    description:
      "AI explained on TikTok — how RAG works, this week in AI, and the real day-to-day of the job.",
    k1: "PLATFORM",
    v1: "TikTok · short form",
    k2: "FED BY",
    v2: "Riset, my own research agent",
  },
  fallback: {
    title: "Off the map",
    description: "That one isn't in my knowledge base. Here's what I can do instead.",
    k1: "BETTER",
    v1: "Ask about a project or a metric",
    k2: "OR",
    v2: "Take it to email — I answer",
  },
};

/** Ordered keyword routing — free text is lowercased and tested against this
 *  list, first match wins, else `fallback`.
 *
 *  Order is load-bearing, and `evals` deliberately goes FIRST: measurement
 *  intent is more specific than subject matter. "How do you know your retrieval
 *  is any good?" and "tell me about RAGAS" are questions about evaluation that
 *  happen to contain retrieval words — with `rag` first they both landed on the
 *  wrong answer. lib/site.test.ts asserts every topic still reaches itself, so
 *  re-run it after any reorder. */
export const MATCH: readonly (readonly [RegExp, TopicId])[] = [
  [
    /eval|ragas|benchmark|measur|regress|judge|accura(cy|te)|hallucinat|\btest\b|how do you know|how do you measure|prove it/,
    "evals",
  ],
  [/rag|retriev|riset|arxiv|hybrid|rrf|bm25|embed|vector|mcp|agent/, "rag"],
  [/manna|client|whatsapp|chatbot|booking|freelance|paid work/, "manna"],
  [/vision|yolo|cv |opencv|traffic|padel|pose|camera|detect|image/, "cv"],
  [/datasaur|2 month|two month|why only|job hop|short stint|current role/, "datasaur"],
  [
    // \brate\b, not `rate` — the bare substring also fires on "generate",
    // "iterate" and "corporate", sending ordinary questions to the rate answer.
    /\brate\b|salary|\bpay\b|cost|price|hour|availab|notice|hire|hiring|contract|relocat|remote|visa/,
    "rate",
  ],
  [/actually good|are you good|any good|weak|weakness|strength|honest|junior|senior|level/, "good"],
  [/tiktok|content|creator|video|channel|audience|social|teach/, "creator"],
];

/** Route free text to a topic. The single entry point — used by the chat input,
 *  the /projects empty state, and the API route's pre-router. */
export function routeQuestion(text: string): TopicId {
  const lower = text.toLowerCase();
  return MATCH.find(([re]) => re.test(lower))?.[1] ?? "fallback";
}

/** The four most-asked, shown in rail mode on non-case-study routes. */
export const MOST_ASKED: readonly TopicId[] = ["rag", "manna", "datasaur", "rate"];
