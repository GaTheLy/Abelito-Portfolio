import type { Block } from "./blocks";

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  agent: "builder"; // extend when other agents get case studies
  blocks: Block[];
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO_ABELITO: EVERYTHING below (titles beyond the slug, taglines, prose,
// metrics, tags, timeline entries, quotes, image/embed references) is
// PLACEHOLDER. Slugs are final. Replace with real case-study content.
//
// In M2 this hardcoded array is replaced by Velite-generated data of the SAME
// `Project` / `Block` shape — page components import `projects` and won't change.
// ─────────────────────────────────────────────────────────────────────────────

// TODO_ABELITO: placeholder body copy — replace with real writing.
const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

export const projects: Project[] = [
  {
    slug: "datasaur", // final
    // TODO_ABELITO: real title + tagline
    title: "Datasaur",
    tagline: "Placeholder tagline for the flagship case study.",
    agent: "builder",
    // Widest block set — exercises most of the block library.
    blocks: [
      { type: "overview", body: LOREM },
      { type: "role", body: LOREM },
      { type: "problem", body: LOREM },
      { type: "approach", body: LOREM },
      { type: "architecture", image: "TODO_ABELITO: architecture diagram", caption: "TODO_ABELITO: diagram caption." },
      {
        type: "results",
        // TODO_ABELITO: placeholder metrics — obviously round, not real claims.
        metrics: [
          { label: "Placeholder metric", value: "92%", delta: "+40%" },
          { label: "Placeholder metric", value: "3x" },
          { label: "Placeholder metric", value: "120ms", delta: "−35%" },
        ],
      },
      // TODO_ABELITO: placeholder stack tags
      { type: "stack", tags: ["TypeScript", "Python", "PyTorch", "Next.js", "Postgres"] },
      {
        type: "timeline",
        // TODO_ABELITO: placeholder timeline
        entries: [
          { date: "2024 Q1", text: LOREM },
          { date: "2024 Q3", text: LOREM },
          { date: "2025 Q1", text: LOREM },
        ],
      },
      // TODO_ABELITO: placeholder pull-quote
      { type: "retrospective", quote: LOREM },
    ],
  },
  {
    slug: "riset", // final
    // TODO_ABELITO: real title + tagline
    title: "Riset",
    tagline: "Placeholder tagline for a research-flavored case study.",
    agent: "builder",
    // Different subset + order — includes a demo, no architecture/role/timeline.
    blocks: [
      { type: "overview", body: LOREM },
      { type: "problem", body: LOREM },
      { type: "approach", body: LOREM },
      { type: "demo", embedUrl: "TODO_ABELITO: demo embed" },
      {
        type: "results",
        metrics: [
          { label: "Placeholder metric", value: "88%" },
          { label: "Placeholder metric", value: "2.4x", delta: "+140%" },
        ],
      },
      { type: "stack", tags: ["Python", "Hugging Face", "FastAPI", "Docker"] },
    ],
  },
  {
    slug: "manna", // final
    // TODO_ABELITO: real title + tagline
    title: "Manna",
    tagline: "Placeholder tagline for a product-flavored case study.",
    agent: "builder",
    // Another distinct subset — ends on a retrospective, no results/timeline/demo.
    blocks: [
      { type: "overview", body: LOREM },
      { type: "role", body: LOREM },
      { type: "approach", body: LOREM },
      { type: "architecture", image: "TODO_ABELITO: architecture diagram" },
      { type: "stack", tags: ["React", "Node.js", "AWS", "Redis"] },
      { type: "retrospective", quote: LOREM },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// The chunk a project opens with in the conversation — its overview, or the
// first block if it has none.
export function overviewIndex(project: Project): number {
  const i = project.blocks.findIndex((b) => b.type === "overview");
  return i >= 0 ? i : 0;
}
