# CLAUDE.md — abelitovisese.com

Persistent context for Claude Code. Read in full before changing anything. If a
prompt conflicts with this file, ask before proceeding.

## What this is

A chat-native portfolio for Abelito Faleyrio Visese, AI Engineer at Datasaur.
Multi-page site on the left, a **persistent chat** on the right that answers
questions about his work. Audience: recruiters, hiring managers, founders
looking to contract. Desktop-first, with a mobile bottom sheet.

Built from the Claude Design handoff, kept verbatim in the `README.md`
appendix — that spec is the authority on colour, type, spacing and copy.

The original `.dc.html` prototypes are deliberately **not** in this repo (they
live in `~/Downloads/design_handoff_chat_portfolio/`). They are design-tool
output: if you ever consult them, read them for structure and values only —
never port `support.js` or the `<sc-if>` / `{{ }}` template syntax.

The v1 in git history (oxblood/cream, "orchestrator agents", Velite) is
deliberately replaced. Don't reintroduce its patterns.

## Rules that are load-bearing

**Never put a raw hex or one-off font shorthand in a component.** Every colour,
type role and radius is a token in `app/globals.css`. Add a token rather than an
inline value.

**Content lives in `content/`, never in JSX.** Pages import typed data. This
isn't style — `content/corpus.ts` derives the chat's entire knowledge base from
those modules, so copy written directly into a component is invisible to the
chat and the site starts lying about itself.

**One list, one source.** A case study's STACK renders `project.stack` from the
record. Every count on `/projects` is derived. If you find yourself typing a
number that exists elsewhere, derive it.

**`content/` and `lib/` use relative imports with explicit `.ts` extensions.**
That's what lets the pure data + logic layer run under bare `node --test` with
no loader and no test framework. `app/` and `components/` use the `@/` alias
normally. Don't "tidy" the extensions away.

**The chat panel must stay in the root layout.** Moving it into a page would
remount it on every navigation and destroy the premise of the design. It renders
only on `/` and `/projects/<slug>` — `hasChatPanel()` in
`content/case-studies.ts` is the one source for that, read by Shell, ChatPanel
and TopBar. Don't inline a second copy of the check.

**The collapse default is a media query, not an effect.** Shell sets
`data-panel="auto"` until the visitor toggles; `app/globals.css` decides from
1400px which of the panel and the pill is visible. Both are always in the DOM,
and so is ChatPanel — on a route with no chat the state is `none` (panel and pill
both hidden), which is what lets it animate away instead of unmounting.
Measuring the viewport on mount instead would flash the expanded panel on every
narrow screen — the case the default exists for.

**The collapse is a drawer, and the page moves with it.** The panel slides out by
`--panel-w` with a matching negative margin; `visibility`, not `display`, is the
endpoint, because `display` cannot animate. The page's own widths
(`--page-wide`, `--case-measure`, `--case-gutter`) are registered with
`@property` purely so they can be transitioned on the same curve — drop the
registration and the column snaps mid-slide. If you add another width that
changes with the panel, register and transition it too.

**The transcript accumulates.** `components/chat/context.tsx` holds `turns`, and
`components/chat/Transcript.tsx` renders them for all three surfaces (full, rail,
sheet). Don't reintroduce a single-answer state or the old "EARLIER" ghost trail
— a chat that replaces itself was the thing that read as broken. `reset()` is the
"New chat" button; a change of `scope` starts a new session on its own.

## The block system

`lib/blocks.ts` is a Zod discriminated union rendered by
`components/blocks/BlockList.tsx`. One schema, three consumers:

1. the nine authored chat answers (`content/answer-blocks.ts`)
2. the LLM's structured output (`app/api/ask/route.ts`)
3. the four case-study bodies (`content/case-studies.ts`)

Adding a block type means: schema entry → `BlockList` case → `blockLabel` entry
→ `blockToText` in `content/corpus.ts`. All four, or something silently breaks.

Authored content is parsed through `parseBlocks` at module load, so a malformed
block fails the build rather than the page.

## The chat's guarantees — do not weaken these

**`rate`, `good` and `datasaur` never reach the model.** They're hard-routed in
`app/api/ask/route.ts` via `GUARDED`. Refusing to invent a rate, being straight
about a two-month stint, and admitting what's still early are product decisions.
They must not depend on a model complying. Do not "simplify" this into a prompt
instruction.

**The site works with no credential.** Every failure path — missing key, 402,
429, 503, unparseable output, mid-stream cut — lands on the authored answer plus
an honest note. Never add a path that shows an error instead of an answer.

**The case-study rail is scoped, and that is enforced structurally.** Beside
`/projects/<slug>` the chat sends `scope`, and `app/api/ask/route.ts` narrows the
knowledge base to that project's docs and swaps `blockSchema` for `proseSchema`.
Both halves matter: the narrow corpus is why an off-topic question has nothing to
answer from, and the narrow schema is why a table can't land in a 340px column.
Don't demote either to a prompt instruction. Chat history is keyed by scope for
the same reason. This deliberately diverges from the handoff — README §How the
chat answers records why.

**Blocks stream complete, one per NDJSON line** (`output: "array"` +
`elementStream`). This is why the client never parses partial JSON and why
mermaid always gets finished source. Don't switch to object streaming.

## Honesty conventions

The design is deliberately conspicuous about what isn't real yet: dashed amber
callouts (`components/ui/Callout.tsx`, the `callout` block) and empty figure
wells (`ImageSlot`, reached from content by an `image` block with no `src`). **Keep
them until the content behind them is confirmed.** Removing a callout without
supplying the material is the one change that makes this site dishonest.

The About prose and the "where I'm going" aspirations are a *reconstruction of
Abelito's voice*, not his words. Their banners stay until he rewrites them.

Never invent a metric, a date, an employer or a claim. If content is missing,
add a callout.

## Commands

```bash
npm run dev      # localhost:3000
npm run lint
npm test         # node --test, no framework, no network
npm run build
npm run models   # list AI Gateway slugs (needs a credential)
```

Run `npm test` after touching `content/answers.ts` (the MATCH order is
load-bearing and easy to break), `content/projects.ts`, or `lib/blocks.ts`.

## Conventions

- TypeScript strict; no `any` without a comment explaining why.
- Real `<Link>`/`<a>` for navigation; `<button>` only for actions.
- Accessibility is not optional here: skip link, `:focus-visible` rings,
  `aria-live` on the streaming answer, `alt` on every diagram.
- Comments explain *why*, not what. The codebase leans terse; match it.

## Regenerating the hero cut-out

`public/assets/abel-2-cutout.webp` is derived from `abel-2.jpeg`. If the photo
changes, regenerate rather than hand-editing — the important parts are *seeding
the flood fill from the frame edges* (so white motifs inside the batik survive,
being enclosed by dark pattern) and *trimming to the bounding box* (so a width
class sizes the figure, not a box with dead margin):

```python
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
src = Image.open("public/assets/abel-2.jpeg").convert("RGB")
w, h = src.size
work = src.copy()
for seed in [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2)]:
    ImageDraw.floodfill(work, seed, (255,0,255), thresh=28)
arr = np.array(work)
bg = (arr[:,:,0]==255) & (arr[:,:,1]==0) & (arr[:,:,2]==255)
a = Image.fromarray(np.where(bg,0,255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.8))
out = src.copy(); out.putalpha(a); out = out.crop(out.getbbox())
out.save("public/assets/abel-2-cutout.webp", quality=88, method=6)
```

Requires a photo on a plain, near-uniform background. If a future photo isn't,
this won't work and the figure needs cutting out by hand.
