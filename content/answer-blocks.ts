import { parseBlocks, type Block, type BlockInput } from "../lib/blocks.ts";
import type { TopicId } from "./answers.ts";

// The nine authored answers, transcribed from the design prototype.
//
// These are not filler. They are the tone contract: the model is shown them as
// worked examples, three of them (rate / good / datasaur) are served verbatim
// and never generated, and all nine are the fallback when there's no LLM
// credential or the call fails. Edit the voice here and the whole chat follows.

const raw: Record<TopicId, BlockInput[]> = {
  rag: [
    { type: "heading", text: "Riset — the agent that decides what I teach next" },
    {
      type: "text",
      md: "It's my honest answer to \"best retrieval work\", because every decision in it is mine. It ingests the arXiv API and AI/ML news RSS, chunks and embeds with `bge-small`, then retrieves **hybrid** — dense through FAISS *and* sparse through BM25, fused with Reciprocal Rank Fusion.",
    },
    {
      type: "mermaid",
      kind: "flowchart TB",
      alt: "Pipeline: arXiv API and AI news RSS feed into chunking and embedding with bge-small, which fans out to FAISS dense retrieval and BM25 sparse retrieval in parallel. Both merge into RRF fusion, then a five-tool agent loop using Claude tool-use, producing a scored angle — a video worth making.",
      code: [
        "  src[\"arXiv API + AI news RSS\"] --> chunk[\"chunk + embed · bge-small\"]",
        "  chunk --> faiss[\"FAISS · dense\"]",
        "  chunk --> bm25[\"BM25 · sparse\"]",
        "  faiss --> rrf[\"RRF fusion\"]",
        "  bm25 --> rrf",
        "  rrf --> loop[\"agent loop · 5 tools · Claude tool-use\"]",
        "  loop --> out[\"scored angle → a video worth making\"]",
        "  class faiss,bm25 emphasis",
        "  class rrf terminal",
        "  class out draft",
      ].join("\n"),
    },
    {
      type: "table",
      columns: [{ label: "VARIANT" }, { label: "FAILS AT" }, { label: "VERDICT", align: "right" }],
      rows: [
        { cells: ["Dense only", "exact model names", "dropped"] },
        { cells: ["Sparse only", "paraphrased questions", "dropped"] },
        { cells: ["Hybrid + RRF", "neither, so far", "shipped"], highlight: true },
      ],
      footnote:
        "Numbers land here once the 10–15 example benchmark is final. I won't publish a score I haven't measured.",
    },
    {
      type: "lesson",
      text: "Hybrid retrieval isn't cleverness, it's humility. Dense search knows what you *meant*; BM25 knows what you *typed*. Papers need both — half the value is an exact model name.",
    },
    {
      type: "followups",
      items: [
        { label: "So how do you evaluate it?", topic: "evals", primary: true },
        { label: "RAG that shipped to a client", topic: "manna" },
      ],
    },
  ],

  evals: [
    {
      type: "text",
      md: "Because I measure it, and I keep the measurements from before I changed anything. Three things, in this order:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**A frozen benchmark first.** 10–15 real questions with known-good sources, written before any tuning. Small, but frozen — that's what makes it a baseline instead of a rationalisation.",
        "**RAGAS for what's automatable.** Faithfulness catches the answer drifting off its context; context relevance catches retrieval dragging in noise. Two different failures that look identical from outside.",
        "**An LLM judge for what isn't.** A written rubric per prompt variant, so \"is this a good explanation for a beginner?\" gets a score instead of my opinion.",
      ],
    },
    {
      type: "table",
      columns: [{ label: "FAILURE I HIT" }, { label: "CAUGHT BY" }, { label: "FIX" }],
      rows: [
        { cells: ["Confident, wrong paper", "faithfulness", "cite spans or refuse"] },
        { cells: ["Right paper, dead chunk", "ctx relevance", "re-chunk on headers"] },
        { cells: ["Fluent but too advanced", "judge rubric", "audience in the prompt"] },
      ],
    },
    {
      type: "code",
      caption: "PYTHON · eval/run.py",
      code: [
        "# frozen set, scored per variant — regressions get loud",
        "for variant in PROMPT_VARIANTS:",
        "    runs = [answer(q, variant) for q in BENCH]",
        "    scores = ragas(runs, metrics=[faithfulness, ctx_relevance])",
        '    scores["clarity"] = judge(runs, rubric=BEGINNER_RUBRIC)',
        "    report(variant, scores, baseline=BASELINE)  # diff, not absolute",
      ].join("\n"),
    },
    {
      type: "lesson",
      emphasis: true,
      text: "A vibe check is not an eval. If I can't show you a number that moved, I didn't improve anything — I just changed something.",
    },
    {
      type: "followups",
      items: [
        { label: "What's being evaluated?", topic: "rag", primary: true },
        { label: "Read the essay →", href: "/writing" },
      ],
    },
  ],

  manna: [
    { type: "heading", text: "A cooking school ran its whole business from one WhatsApp inbox" },
    {
      type: "text",
      md: "Manna Cooking Studio in Surabaya. Availability, pricing, payment proof, calendar — all of it went through one person typing replies, office hours only. Bookings died overnight.",
    },
    {
      type: "text",
      md: "I built an agent on WhatsApp with TypeScript and Baileys, Gemini for generation, and a RAG layer over ChromaDB grounded in 10+ curated studio documents — so pricing and policy answers come from *their* words. On top: a stateful booking engine that walks class → schedule → payment proof → admin verification and syncs to Google Sheets and Calendar.",
    },
    {
      type: "metrics",
      items: [
        { value: "24/7", label: "INBOUND COVERED", lead: true },
        { value: "~80%", label: "ADMIN LOAD CUT", lead: true },
        { value: "10+", label: "GROUNDING DOCS", lead: true },
      ],
    },
    {
      type: "lesson",
      text: "The model was the easy part. Nearly all the work was *state* — knowing where someone is in a booking, and what to do when they vanish for two days and come back mid-flow.",
    },
    {
      type: "followups",
      items: [
        { label: "Full case study →", href: "/projects/manna", primary: true },
        { label: "How did you stop it hallucinating?", topic: "evals" },
      ],
    },
  ],

  cv: [
    {
      type: "text",
      md: "Deeper than the LLM work, actually. I've been pointing models at cameras since university — and the lesson repeats: **the detection is rarely the hard part**.",
    },
    {
      type: "table",
      columns: [{ label: "SYSTEM" }, { label: "HARD PART" }, { label: "RESULT", align: "right" }],
      rows: [
        { cells: ["Traffic congestion", "flow, not counts", "97.5% · 18–22 FPS"], highlight: true },
        { cells: ["Padel analytics", "occlusion, identity", "YOLO26 + SAM 3"] },
        { cells: ["Cire", "cost per API call", "~80% fewer calls"] },
        { cells: ["GerakinAja", "on-device latency", "<200ms/frame"] },
        { cells: ["KinetixPro", "the labelling loop", "8 services"] },
      ],
    },
    {
      type: "lesson",
      text: "Every one of these was won somewhere other than the model: in the features, the batching, the tracker, or the humans doing the labelling.",
    },
    {
      type: "followups",
      items: [
        { label: "Open the traffic case study →", href: "/projects/traffic", primary: true },
        { label: "GerakinAja →", href: "/projects/gerakin" },
      ],
    },
  ],

  datasaur: [
    {
      type: "text",
      md: "Fair question — it's the newest line on my CV, and I'd rather answer it than let you guess.",
    },
    {
      type: "text",
      md: "I joined Datasaur in June 2026 as an AI Engineer on LLM and NLP systems. I keep the specifics light here because the work is internal — that part is a conversation, not a webpage. What matters is that the two months aren't the whole story: the eighteen before them were three different angles on shipping ML.",
    },
    {
      type: "cards",
      columns: 3,
      items: [
        {
          label: "FEB–APR 2026",
          title: "KinetixPro",
          body: ["CV active learning — 8 services, auto-labelling, GPU inference."],
        },
        {
          label: "JAN–MAR 2026",
          title: "Axrail · AWS",
          body: ["Bedrock agent with RAG, memory, MCP tools. Zero pen-test findings."],
        },
        {
          label: "FEB–DEC 2025",
          title: "Apple Academy",
          body: ["A year of shipping: voice AI, edge CV, on-device pose."],
        },
      ],
    },
    {
      type: "lesson",
      text: "Short version: I'm early, I'm not new, and I've never shipped the same kind of ML system twice.",
    },
    {
      type: "followups",
      items: [
        { label: "Book 20 minutes →", href: "/connect", cta: true },
        { label: "See the full history", href: "/work" },
      ],
    },
  ],

  rate: [
    {
      type: "text",
      md: "I won't pretend a number here is real — rate depends on scope, and anyone who quotes before hearing the problem is guessing. What I *can* be precise about:",
    },
    {
      type: "keyvalue",
      rows: [
        {
          key: "OPEN TO",
          value: "Full-time remote, and scoped contract builds (RAG, agents, CV pipelines)",
        },
        {
          key: "BASED",
          value: "Malang, Indonesia · GMT+7 · comfortable with EU and APAC overlap",
        },
        {
          key: "CURRENTLY",
          value:
            "Employed at Datasaur — so contract work is evenings and weekends, honestly scoped",
        },
        {
          key: "FASTEST",
          value: "A 20-minute call. Bring the problem; I'll tell you if I'm the wrong person",
        },
      ],
    },
    {
      type: "text",
      md: "If you need a figure before a call, email me the scope and I'll send one back the same day.",
    },
    {
      type: "followups",
      items: [{ label: "Email me the scope →", href: "/connect", cta: true }],
    },
  ],

  good: [
    { type: "text", md: "Both. Here's the version I'd give a friend." },
    {
      type: "cards",
      columns: 2,
      items: [
        {
          label: "GENUINELY STRONG",
          tone: "good",
          body: [
            "Retrieval design — hybrid, fusion, chunking that survives real queries",
            "Agent tooling: I build MCP servers, not just consume them",
            "CV pipelines end to end, including the boring ops around them",
            "Shipping. Nine systems, three organisations, one paying client",
          ],
        },
        {
          label: "STILL EARLY",
          tone: "warn",
          body: [
            "Owning a system for years, not months — I haven't yet",
            "Leading engineers. I've been led well; I haven't led",
            "Scale. My biggest traffic is thousands, not millions",
            "Saying no to interesting problems. Working on it",
          ],
        },
      ],
    },
    {
      type: "lesson",
      text: "If you need someone who has already run a platform at scale, that isn't me yet. If you need someone who will get a retrieval system from nothing to measurably working, that is exactly me.",
    },
    {
      type: "followups",
      items: [
        { label: "Show me the strong part", topic: "rag", primary: true },
        { label: "Ask me directly", href: "/connect" },
      ],
    },
  ],

  creator: [
    {
      type: "text",
      md: "I break down AI on TikTok as **@abelitovisese** — how RAG actually works, what happened in AI this week, and the honest version of a day as an AI engineer.",
    },
    {
      type: "cards",
      columns: 2,
      items: [
        {
          title: "Explainers",
          body: ["One concept, one minute. Retrieval, embeddings, why your bot lies."],
        },
        {
          title: "This week in AI",
          body: ["Sourced by Riset, my own research agent, then filtered by me."],
        },
        {
          title: "Day in the life",
          body: ["What the job is really like when the demo isn't working."],
        },
        { tone: "placeholder", body: ["[ 3 VIDEO EMBEDS ]"] },
      ],
    },
    {
      type: "lesson",
      text: "Teaching it out loud is how I find out whether I actually understood it. The channel is a debugging tool that happens to have an audience.",
    },
    {
      type: "followups",
      items: [
        { label: "Open the creator page →", href: "/creator", primary: true },
        { label: "The agent behind it", topic: "rag" },
      ],
    },
  ],

  fallback: [
    {
      type: "text",
      md: "That's outside what I know about — this chat only answers from a knowledge base about my work, and I'd rather say so than improvise something that sounds right.",
    },
    {
      type: "followups",
      label: "WHAT I CAN DO INSTEAD",
      items: [
        { label: "Any project, in depth", topic: "rag" },
        { label: "An honest self-assessment", topic: "good" },
        { label: "Rate and availability", topic: "rate" },
      ],
    },
    {
      type: "text",
      md: "And if it's a real question about me that I've failed to answer — email it. I answer those myself.",
    },
    {
      type: "followups",
      label: "OR",
      items: [{ label: "afvisese@gmail.com →", href: "/connect", cta: true }],
    },
  ],
};

/** Validated at module load — a typo in the content above fails the build. */
export const answerBlocks: Record<TopicId, Block[]> = Object.fromEntries(
  Object.entries(raw).map(([topic, blocks]) => [topic, parseBlocks(blocks)]),
) as Record<TopicId, Block[]>;
