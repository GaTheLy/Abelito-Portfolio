import { projects } from "@/lib/projects";
import { agents, type AgentId } from "@/lib/orchestrator/agents";
import { blockLabel, type Block } from "@/lib/blocks";
import { rank, tokenize, type Unit } from "./retrieve-core";

export { MIN_SCORE } from "./retrieve-core";

// Narrowed target type for consumers (core keeps agentId loose to stay
// dependency-free; here the ids are known-valid AgentIds).
export type NavTarget =
  | { kind: "chunk"; slug: string; index: number }
  | { kind: "agent"; agentId: AgentId }
  | { kind: "connect" };

export interface Retrieved {
  target: NavTarget;
  label: string;
  score: number;
}

// Curated navigational keywords per section — folded in as high-weight terms so
// "your projects" → builder, "who are you" → origin, etc.
const AGENT_KEYWORDS: Record<AgentId, string[]> = {
  builder: [
    "ai", "ml", "llm", "nlp", "engineer", "engineering", "build", "built",
    "code", "coding", "project", "projects", "model", "models", "data",
    "system", "systems", "software", "technical", "backend",
  ],
  creator: [
    "content", "video", "videos", "youtube", "brand", "creator", "social",
    "post", "posts", "audience", "teach", "teaching", "instagram", "tiktok", "channel",
  ],
  hobbyist: [
    "car", "cars", "invest", "investing", "stock", "stocks", "finance", "money",
    "hobby", "hobbies", "curious", "curiosity", "drive", "driving", "obsessed",
  ],
  origin: [
    "who", "yourself", "story", "person", "personal", "life", "journey",
    "origin", "background", "about", "self", "bio",
  ],
};

function blockText(block: Block): string {
  switch (block.type) {
    case "overview":
    case "role":
    case "problem":
    case "approach":
      return block.body;
    case "architecture":
      return block.caption ?? "";
    case "results":
      return block.metrics.map((m) => `${m.label} ${m.value} ${m.delta ?? ""}`).join(" ");
    case "stack":
      return block.tags.join(" ");
    case "demo":
      return "demo video";
    case "timeline":
      return block.entries.map((e) => `${e.date} ${e.text}`).join(" ");
    case "retrospective":
      return block.quote;
  }
}

function blockTerms(block: Block): string[] {
  const terms = [block.type, ...tokenize(blockLabel[block.type])];
  if (block.type === "stack") terms.push(...block.tags.map((t) => t.toLowerCase()));
  return terms;
}

// Built once at module load from the Velite content + agents (~30 small units).
const index: Unit[] = (() => {
  const units: Unit[] = [];
  for (const project of projects) {
    const names = [...tokenize(project.title), project.slug];
    project.blocks.forEach((block, i) => {
      units.push({
        target: { kind: "chunk", slug: project.slug, index: i },
        label: `${project.title} · ${blockLabel[block.type]}`,
        names,
        terms: blockTerms(block),
        text: `${project.title} ${project.tagline} ${blockText(block)}`,
      });
    });
  }
  for (const agent of agents) {
    units.push({
      target: { kind: "agent", agentId: agent.id },
      label: agent.name,
      names: [agent.id, ...tokenize(agent.name)],
      terms: AGENT_KEYWORDS[agent.id],
      text: `${agent.description} ${agent.examples.join(" ")}`,
    });
  }
  units.push({
    target: { kind: "connect" },
    label: "Connect",
    names: ["connect", "contact"],
    terms: ["email", "resume", "linkedin", "github", "reach", "hire"],
    text: "connect contact email resume linkedin github twitter instagram reach out hire get in touch",
  });
  return units;
})();

// Rank every addressable unit against free-text; best matches first.
export function retrieve(query: string, k = 4): Retrieved[] {
  return rank(query, index, k) as Retrieved[];
}
