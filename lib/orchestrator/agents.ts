// Single source of truth for agent metadata. Drives the routing readout,
// agent-page headers, and the in-browser embeddings used for real similarity
// routing — hence the natural-language `description` plus the `examples`
// routing corpus.

export type AgentId = "builder" | "creator" | "hobbyist" | "origin";

export interface Agent {
  id: AgentId;
  name: string;
  route: string;
  // Literal Tailwind classes (not composed dynamically) so the JIT scanner
  // sees them. `origin` uses the neutral tone, per CLAUDE.md.
  accent: { bg: string; text: string; border: string };
  // User-facing intro copy (shown on pages/responses).
  description: string;
  // Routing-only corpus — NOT displayed. Embedded alongside `description`; a
  // query's similarity to an agent is the max over these phrases, which routes
  // short/vague prompts far better than a single description.
  // TODO_ABELITO: tune these phrases to shift routing behavior (they're the
  // levers for "what kinds of questions land where").
  examples: string[];
}

export const agents: Agent[] = [
  {
    id: "builder",
    name: "Builder",
    route: "/builder",
    accent: { bg: "bg-builder", text: "text-builder", border: "border-builder" },
    description:
      "AI and machine learning engineering — LLMs, NLP, applied systems, and shipped products.",
    examples: [
      "machine learning and AI projects",
      "LLMs, NLP, models and data",
      "software and systems I have built",
      "what have you built",
      "your engineering and technical work",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    route: "/creator",
    accent: { bg: "bg-creator", text: "text-creator", border: "border-creator" },
    description:
      "Content, video, and the @abelitovisese brand — teaching and storytelling online.",
    examples: [
      "content creation and videos",
      "youtube channel and social media",
      "what do you post and create",
      "teaching and storytelling online",
    ],
  },
  {
    id: "hobbyist",
    name: "Hobbyist",
    route: "/hobbyist",
    accent: { bg: "bg-hobbyist", text: "text-hobbyist", border: "border-hobbyist" },
    description:
      "Cars, investing, and curiosity — edutainment and the things worth being obsessed over.",
    examples: [
      "cars and driving",
      "investing, stocks, and personal finance",
      "hobbies and curiosities",
      "things you are obsessed with",
    ],
  },
  {
    id: "origin",
    name: "Origin",
    route: "/origin",
    // Neutral tone — not one of the agent accents.
    accent: { bg: "bg-foreground", text: "text-foreground", border: "border-foreground" },
    description:
      "The personal story — who Abelito is, in his own voice, beyond the work.",
    examples: [
      "who are you as a person",
      "your personal story and background",
      "tell me about your life and journey",
      "the person behind the work",
    ],
  },
];

export function agentById(id: AgentId): Agent {
  const agent = agents.find((a) => a.id === id);
  if (!agent) throw new Error(`Unknown agent: ${id}`);
  return agent;
}
