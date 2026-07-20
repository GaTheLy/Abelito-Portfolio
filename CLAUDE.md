# CLAUDE.md — abelitovisese.com

Persistent project context for Claude Code. Read this in full before making changes. If anything in a prompt conflicts with this file, ask before proceeding.

## What this project is

A storytelling-driven personal portfolio for Abelito Visese, an AI/ML engineer (LLM/NLP focus, Datasaur.ai). The site's core concept is **"the orchestrator"**: instead of a nav-first site, visitors either type a free-text prompt or tap a suggestion chip, a lightweight routing system classifies intent, shows a brief real routing readout (agent name + confidence score), then hands off to the matching section. It is a real, working small NLP system, not a themed animation — that authenticity is the entire point.

Visual language: flat, restrained, Apple-HIG-inspired minimalism. No gradients, no glow, no heavy shadows. One accent color per agent, everything else neutral.

## Tech stack

- **Framework:** Next.js 16 (App Router, TypeScript, strict mode)
- **Styling:** Tailwind CSS
- **Motion:** Framer Motion (routing reveal, agent handoff transitions only — don't animate everything)
- **Content layer:** Velite (MDX + Zod schemas → typed data at build time). Do not use Contentlayer, it is unmaintained.
- **Routing/orchestrator:** serverless route handler, embeddings-based classification (see below)
- **Deploy target:** Vercel

## Site architecture

| Route | Agent | Purpose |
|---|---|---|
| `/` | — | Entry. Prompt bar + suggestion chips. |
| `/builder` | Builder | AI/ML and engineering work. Project cards. |
| `/builder/[slug]` | Builder | Full case study. See content model below. |
| `/creator` | Creator | Content brand, @abelitovisese. |
| `/hobbyist` | Hobbyist | Cars, investing, curiosity/edutainment. |
| `/origin` | Origin | Personal narrative, own voice, editorial tone (`font-voice`, not agent-card style). |
| `/connect` | — | Resume, email, LinkedIn, socials. Plainest page on the site — no cleverness here. |
| fallback state | — | Low-confidence routing result. Shows confidence score honestly + suggestions. Not a 404 page — same system being honest about uncertainty. |

Persistent minimal nav (small, text-only) plus a prompt bar available on every page, not just `/`, so users can re-route from anywhere.

## Content model — the block system

Every case study is a sequence of reusable **blocks**, not a fixed template. A project picks which blocks it uses and in what order. The table of contents is generated from whichever blocks are present — never hand-maintained.

Block library (initial set — extend if needed, keep in a single source of truth):

- `overview`
- `role`
- `problem`
- `approach`
- `architecture` (holds a diagram/image)
- `results` (holds metrics: label + value + optional delta)
- `stack` (tag list)
- `demo` (video/embed)
- `timeline`
- `retrospective` (pull-quote style)

Velite schema sketch (adjust field names as you implement, keep the shape):

```ts
const block = z.discriminatedUnion('type', [
  z.object({ type: z.literal('overview'), body: z.string() }),
  z.object({ type: z.literal('role'), body: z.string() }),
  z.object({ type: z.literal('problem'), body: z.string() }),
  z.object({ type: z.literal('approach'), body: z.string() }),
  z.object({ type: z.literal('architecture'), image: z.string(), caption: z.string().optional() }),
  z.object({ type: z.literal('results'), metrics: z.array(z.object({ label: z.string(), value: z.string(), delta: z.string().optional() })) }),
  z.object({ type: z.literal('stack'), tags: z.array(z.string()) }),
  z.object({ type: z.literal('demo'), embedUrl: z.string() }),
  z.object({ type: z.literal('timeline'), entries: z.array(z.object({ date: z.string(), text: z.string() })) }),
  z.object({ type: z.literal('retrospective'), quote: z.string() }),
])

const project = s.object({
  slug: s.slug('projects'),
  title: s.string(),
  tagline: s.string(),
  agent: z.literal('builder'), // extend if other agents get case studies later
  blocks: z.array(block),
})
```

The contents rail renders one entry per block in `blocks`, in order, with a human label per block `type`. Do not hardcode section order or section presence anywhere in the page template.

## Orchestrator implementation

1. At build time, write a short natural-language description for each agent (`builder`, `creator`, `hobbyist`, `origin`) and precompute an embedding for each. Store as static JSON.
2. On prompt submit, a route handler embeds the user's text (Voyage AI is a reasonable default for embeddings; swap freely) and computes cosine similarity against the four agent vectors.
3. Return `{ route, confidence }`. Confidence is the actual top similarity score, not a fabricated number.
4. If the request fails (network, rate limit) or confidence is very low, fall back to a static keyword map — the site must never hard-fail on this.
5. Below a confidence threshold (pick something reasonable, e.g. 0.4), route to the fallback state instead of guessing.
6. The UI shows the routing readout briefly (agent name + confidence, monospace, small) before revealing the section — this is a real value, don't fake the delay or the number.

## Design tokens

Define these in the Tailwind config, don't scatter magic values:

- One accent color per agent (builder, creator, hobbyist share a family; origin and the orchestrator itself use a neutral/primary tone)
- Two font families: a sans for UI chrome and agent pages, a serif/voice font reserved for `/origin` only, to signal "this is personal, not a system talking"
- Spacing scale and radius scale, used consistently — no one-off pixel values in components

## Placeholder content policy — read this carefully

This build should be fully browsable end to end with placeholder content before any real writing happens. Follow these rules exactly:

- **Structural content is real, not placeholder.** Route names, nav labels, agent names, section/block type labels, and project slugs (`datasaur`, `riset`, `manna`, `kinetixpro`, `katrol`) are already decided — use them as-is.
- **Prose and data content is dummy.** Paragraph bodies, metrics values, tech stack tags, quotes, timeline entries — use realistic-length Lorem Ipsum or clearly fake placeholder data (e.g. metric value `92%` is fine as a placeholder, don't invent a specific real-sounding claim).
- **Every dummy value must be traceable.** Wrap or prefix every piece of placeholder content with the marker `TODO_ABELITO:` — in MDX body text as an inline HTML comment `<!-- TODO_ABELITO: replace with real project summary -->` directly above the placeholder paragraph, and in code/data as a `// TODO_ABELITO:` comment.
- **Maintain `PLACEHOLDERS.md` at the project root.** After scaffolding, generate this file as a table: file path, what's placeholder, what real content is needed. Update it whenever new placeholder content is added. This is the single checklist Abelito will work through before launch.
- Do not invent specific fake achievements, numbers, or claims that could be mistaken for real ones if `PLACEHOLDERS.md` is skipped — keep placeholder data obviously generic (round numbers, "Lorem ipsum" prose) rather than plausible-sounding fabrications.

## Build milestones

M0 design system → M1 static shell (all routes, placeholder content) → M2 content layer (Velite + block schema, Datasaur as reference case study) → M3 orchestrator (real embeddings routing live) → M4 remaining pages + second flagship case study → M5 motion/responsive/accessibility polish → M6 deploy to Vercel with domain.

## Conventions

- TypeScript strict mode, no `any` without a comment explaining why
- Components: one component per file, colocate small subcomponents only if truly single-use
- No inline magic colors/spacing — always go through Tailwind config tokens
- Keep the routing/orchestrator logic isolated in its own module (`lib/orchestrator/`) so the embedding provider can be swapped without touching UI code