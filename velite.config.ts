import { defineConfig, defineCollection, s } from "velite";

// Zod schema mirroring lib/blocks.ts (Block union) and lib/projects.ts (Project).
// Velite validates each content file against this at build time and emits typed
// data to .velite/, which lib/projects.ts re-exports. Keep this in sync with
// lib/blocks.ts (the hand-written types stay the canonical TS source).
const block = s.discriminatedUnion("type", [
  s.object({ type: s.literal("overview"), body: s.string() }),
  s.object({ type: s.literal("role"), body: s.string() }),
  s.object({ type: s.literal("problem"), body: s.string() }),
  s.object({ type: s.literal("approach"), body: s.string() }),
  s.object({ type: s.literal("architecture"), image: s.string(), caption: s.string().optional() }),
  s.object({
    type: s.literal("results"),
    metrics: s.array(s.object({ label: s.string(), value: s.string(), delta: s.string().optional() })),
  }),
  s.object({ type: s.literal("stack"), tags: s.array(s.string()) }),
  s.object({ type: s.literal("demo"), embedUrl: s.string() }),
  s.object({
    type: s.literal("timeline"),
    entries: s.array(s.object({ date: s.string(), text: s.string() })),
  }),
  s.object({ type: s.literal("retrospective"), quote: s.string() }),
]);

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.mdx",
  schema: s.object({
    slug: s.string(),
    title: s.string(),
    tagline: s.string(),
    agent: s.literal("builder"),
    blocks: s.array(block),
  }),
});

export default defineConfig({
  collections: { projects },
});
