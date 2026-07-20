import type { Block } from "./blocks";
import { projects as content } from "#content";

export interface Project {
  slug: string;
  title: string;
  tagline: string;
  agent: "builder"; // extend when other agents get case studies
  blocks: Block[];
}

// Case studies are authored in content/projects/*.mdx and validated at build
// time by Velite against velite.config.ts (which mirrors the Block schema), so
// the generated data already conforms to Project. This module is now just a
// thin adapter + helpers — page/components import from here unchanged.
export const projects: Project[] = content;

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

// The chunk a project opens with in the conversation — its overview, or the
// first block if it has none.
export function overviewIndex(project: Project): number {
  const i = project.blocks.findIndex((b) => b.type === "overview");
  return i >= 0 ? i : 0;
}
