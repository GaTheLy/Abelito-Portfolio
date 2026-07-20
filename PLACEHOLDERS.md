# PLACEHOLDERS.md

The single checklist of every piece of placeholder content in the site. Work
through it before launch. Every item is marked in-code with `TODO_ABELITO:`
(grep for it: `grep -rn TODO_ABELITO app components lib`).

**What is _not_ here (intentionally real, do not change):** route names, agent
names (Builder / Creator / Hobbyist / Origin), nav labels, block-type labels,
project slugs (`datasaur`, `riset`, `manna`, and future `kinetixpro`, `katrol`),
the design tokens/palette, and the site title (`Abelito Visese — AI/ML Engineer`).

Legend for "Type": **prose** = writing · **data** = structured values ·
**media** = image/embed · **logic** = stub code to replace in a later milestone.

---

> **Architecture note:** hybrid model. Each section is a shared component in
> `components/sections/` (BuilderSection, CreatorSection, HobbyistSection,
> OriginSection, ConnectSection, CaseStudy) used by BOTH the real route page
> (`app/<section>/…`) and the home conversation (rendered as an embedded page
> response). So each piece of section copy lives in ONE place —
> `components/sections/*` — and appears on the page and in the chat.

## Global (`app/layout.tsx`)

| Location | Type | What's placeholder | Real content needed |
|---|---|---|---|
| `app/layout.tsx` — `metadata.description` | prose | Generic SEO/social description | One real ~150-char description of the site |

## Greeting / entry (`components/orchestrator/Orchestrator.tsx`)

| Location | Type | What's placeholder | Real content needed |
|---|---|---|---|
| Greeting subline ("Skip the menus…") | prose | Placeholder creative copy | Final greeting subline (headline is a time-based greeting — real) |
| `CHIPS[]` prompts | data | Chip labels + the prompt text each routes with | Confirm/adjust wording (labels fine; prompts feed the router) |

## Builder — listing + case studies (`components/sections/BuilderSection.tsx` + `lib/projects.ts`)

| Location | Type | What's placeholder | Real content needed |
|---|---|---|---|
| Builder title "Things I've built." (`BuilderSection.tsx`) | prose | Placeholder title | Real Builder section title |
| Builder intro | prose | Reuses the agent `description` string | Real Builder intro (or refine the shared description) |

### Case-study content (`content/projects/*.mdx`)

Case studies are now authored as MDX with the block array in frontmatter
(validated by `velite.config.ts`). Edit `content/projects/{datasaur,riset,manna}.mdx`.
All three are **fully placeholder** except their slugs.

| Field (per project) | Type | What's placeholder | Real content needed |
|---|---|---|---|
| `title` | prose | Capitalized slug | Real project title |
| `tagline` | prose | "Placeholder tagline…" | Real one-line tagline |
| `overview` / `role` / `problem` / `approach` bodies | prose | Lorem ipsum (`LOREM`) | Real case-study writing per block |
| `architecture.image` / `.caption` | media | `"TODO_ABELITO: architecture diagram"` text shown in a placeholder box | Real diagram asset + caption (render becomes `<img>` when real) |
| `results.metrics[]` | data | Round fake numbers (`92%`, `3x`, `120ms`, `+40%`, `−35%`, `88%`, `2.4x`) | Real metrics (label + value + optional delta) |
| `stack.tags[]` | data | Generic tech names (TypeScript, Python, PyTorch, …) | Real stack per project |
| `timeline.entries[]` (datasaur) | data + prose | Placeholder dates + lorem | Real timeline |
| `demo.embedUrl` (riset) | media | `"TODO_ABELITO: demo embed"` text in a placeholder box | Real embed URL (render becomes `<iframe>`/video when real) |
| `retrospective.quote` (datasaur, manna) | prose | Lorem | Real pull-quote |

> Block **sets/order per project are a real design choice** (they demonstrate the
> dynamic contents rail) — keep them varied, but the block _contents_ above are placeholder.

## Creator / Hobbyist / Origin / Connect (each in its own `components/sections/*Section.tsx`)

| Section (file) | Type | What's placeholder | Real content needed |
|---|---|---|---|
| Creator — title (`CreatorSection.tsx`) | prose | Placeholder title (intro reuses agent description) | Real Creator positioning (the @abelitovisese brand) |
| Creator — `items[]` (4) | data + prose | "Placeholder series / Placeholder format · 0 posts" | Real content pieces (title, format, link) |
| Hobbyist — title (`HobbyistSection.tsx`) | prose | Placeholder title (intro reuses agent description) | Real Hobbyist positioning |
| Hobbyist — `items[]` (4) | data + prose | "Placeholder interest · placeholder note" | Real interests (cars, investing, curiosities) |
| Origin — headline + 3 paragraphs (`OriginSection.tsx`) | prose | Lorem ipsum (rendered in the reserved serif) | The real personal narrative, in Abelito's own voice |
| Connect — intro line (`ConnectSection.tsx`) | prose | "The direct ways to reach me." | Confirm/replace |
| Connect — `links[]` | data | `href` + values are `placeholder@example.com` / `#` / `@placeholder` | Real contact details + resume PDF |

## Fallback response (`ResponseView.tsx` → `FallbackSection`)

No placeholder _content_ — copy is intentionally real (the system being honest
about low confidence). Its chips mirror the greeting chips; keep them in sync.

---

## Tunable / stubbed logic (not "content", but tracked here)

| Location | Status | What it is | Note |
|---|---|---|---|
| `lib/orchestrator/agents.ts` — `examples[]` | tunable | Per-agent routing corpus (NOT displayed) — embedded for semantic routing | Add/edit phrases to steer what questions land where; re-check `SEMANTIC_THRESHOLD` after big changes |
| `lib/orchestrator/agents.ts` — `description` | tunable | User-facing intro copy, also embedded for routing | Refine wording; affects both display and routing |
| `lib/orchestrator/embed.ts` — `SEMANTIC_THRESHOLD` | tunable | Cosine cutoff (0.40, calibrated) below which prompts go to fallback | Raise if routing is too eager, lower if too shy |
| `lib/orchestrator/classify.ts` | live fallback | Keyword router — used when the embedding model isn't ready/available | Not a placeholder; keep it working |
| `content/projects/*.mdx` | ✅ M2 done | Case studies now authored in MDX (Velite-validated); `lib/projects.ts` is a thin adapter | Replace the placeholder frontmatter with real content |
