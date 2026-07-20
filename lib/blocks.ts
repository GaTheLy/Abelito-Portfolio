// The case-study block system. A project is a sequence of these blocks, in any
// order; the contents rail and page body are generated from whichever are
// present. This mirrors the CLAUDE.md Velite schema shape — in M2 the same
// `Block` type is produced by Velite from MDX, so page code won't change.

export type Block =
  | { type: "overview"; body: string }
  | { type: "role"; body: string }
  | { type: "problem"; body: string }
  | { type: "approach"; body: string }
  | { type: "architecture"; image: string; caption?: string }
  | { type: "results"; metrics: { label: string; value: string; delta?: string }[] }
  | { type: "stack"; tags: string[] }
  | { type: "demo"; embedUrl: string }
  | { type: "timeline"; entries: { date: string; text: string }[] }
  | { type: "retrospective"; quote: string };

export type BlockType = Block["type"];

// Single source of truth for the human labels used by the contents rail and
// block headings. Do not hardcode these anywhere else.
export const blockLabel: Record<BlockType, string> = {
  overview: "Overview",
  role: "My Role",
  problem: "Problem",
  approach: "Approach",
  architecture: "Architecture",
  results: "Results",
  stack: "Stack",
  demo: "Demo",
  timeline: "Timeline",
  retrospective: "Retrospective",
};

// Question-phrased labels for the conversation's "next chunk" follow-up buttons.
export const blockQuestion: Record<BlockType, string> = {
  overview: "Start with the overview",
  role: "What was your role?",
  problem: "What problem did it solve?",
  approach: "What was your approach?",
  architecture: "How’s it built?",
  results: "What were the results?",
  stack: "What’s the tech stack?",
  demo: "Can I see a demo?",
  timeline: "How did it unfold?",
  retrospective: "Any reflections?",
};
