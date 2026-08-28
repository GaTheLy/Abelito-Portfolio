# abelitovisese.com

A chat-native portfolio for **Abelito Faleyrio Visese**, AI Engineer at Datasaur.
A normal multi-page site on the left, a persistent chat on the right that can
answer anything about his work — so a recruiter can read *or* ask, and both
routes tell the same story.

Built from the Claude Design handoff — the full spec is kept verbatim in the
appendix below. The original `.dc.html` prototypes are **not** in this repo;
they live outside it (`~/Downloads/design_handoff_chat_portfolio/`), since they
are design-tool output that can't be run or built here.

## Running it

```bash
nvm use          # Node 22+
npm install
npm run dev
```

The site is **fully functional with no API key** — the chat falls back to nine
hand-authored answers, which is the complete prototype experience. Everything
below is only needed to turn on LLM-generated answers.

```bash
npm run lint     # eslint
npm test         # routing, search/sort and content integrity — no network
npm run build    # production build
npm run models   # list AI Gateway model slugs (needs a credential)
```

### Turning on the LLM

Answers are generated through the **Vercel AI Gateway**, pointed at an Anthropic
Claude model. The gateway gives OIDC auth (no API key to manage or rotate),
provider failover, budget caps and per-user rate limiting.

```bash
vercel link
# Vercel → Project → Settings → AI Gateway → enable
vercel env pull .env.local     # provisions VERCEL_OIDC_TOKEN (~24h locally)
```

Re-run the last line when the local token expires; deployed environments refresh
it automatically. As an alternative for CI or non-Vercel hosting, set
`AI_GATEWAY_API_KEY` instead.

`AI_MODEL` overrides the model (default `anthropic/claude-haiku-4.5`). Confirm
the current slug with `npm run models` rather than guessing — gateway ids use
dotted versions and the catalogue changes.

> **Before going public:** `/api/ask` is an unauthenticated endpoint. Set a
> monthly budget cap and a per-user rate limit in Vercel → AI Gateway. The route
> also has a small in-memory per-IP limiter as a first gate.

> **Note:** a `.env.example` could not be written in this environment
> (permissions). The three variables above are the whole surface.

## Architecture

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) · React 19 · TypeScript strict |
| **Styling** | Tailwind v4. Every design token lives in `app/globals.css` — no raw hex in components. Five ink/accent tokens are darkened from the spec to clear WCAG AA on 9–10.5px labels; axe reports zero A/AA violations across all routes |
| **Motion** | CSS for the two keyframes; Framer Motion only for streamed-block entrance and the mobile sheet's drag-to-dismiss |
| **Diagrams** | `mermaid`, themed to the palette, dynamically imported |
| **AI** | AI SDK v7 → Vercel AI Gateway → Claude |
| **Deploy** | Vercel |

### The shape of it

```
app/            routes; pages are server components
components/     Shell + TopBar + chat panel + block renderer
  chat/         context (state), FullMode, RailMode, MobileSheet, ChatInput
  blocks/       BlockList — one renderer for chat answers AND case-study bodies
content/        ALL copy and data, as typed TS modules
lib/            blocks.ts (the Zod schema), inline.tsx, site.test.ts
```

Three decisions carry most of the weight:

**1. The chat panel lives in the root layout.** It never remounts on navigation
— that persistence is the entire premise of the design. Pages are just
`children`.

**2. One block schema, three consumers.** `lib/blocks.ts` is a Zod discriminated
union rendered by `components/blocks/BlockList.tsx`. The same schema backs the
authored answers, the case-study bodies, and the LLM's structured output — so a
generated answer and a hand-written one are indistinguishable to the renderer,
and authored content is validated at build time.

**3. The knowledge base is derived, not written.** `content/corpus.ts` flattens
every other content module into the chat's system prompt (78 docs, ~11k tokens).
Content is authored once; the chat can never drift from what the pages say.
Adding a project updates the chat for free.

### How the chat answers

```
POST /api/ask → keyword-route the question
              → guarded topic?  serve the authored answer, never call the model
              → no credential?  serve the authored answer
              → else stream blocks (one complete block per NDJSON line)
```

**Guardrails are hard-routed, not prompted.** `rate`, `good` and `datasaur` are
product decisions — refusing to invent a rate, being straight about a two-month
stint, admitting what's still early — so they never reach the model. That
behaviour cannot depend on a model complying.

**It never hard-fails.** No credential, budget exhausted (402), rate limited
(429), provider down (503), unparseable output, or a mid-stream cut all land on
the same place: the authored answer, plus an honest note about why.

Blocks stream one *complete* element at a time (`output: "array"` +
`elementStream`), so the client never parses partial JSON and the mermaid
renderer always receives finished source.

### Responsive

Three tiers, so the desktop design is never compromised:

| Width | Layout |
|---|---|
| ≥1560px | exactly as designed — 704px chat on Home, 340px elsewhere |
| 1024–1559px | same two columns, chat clamped so the content column survives |
| <1024px | single column; the chat becomes a bottom sheet |

The sheet is a native `<dialog>` opened with `showModal()` — focus trapping,
Esc-to-close and page inertness for free.

## What still needs your material

Each of these renders as a visible dashed-amber callout until it's supplied.
That conspicuousness is deliberate — don't style it down, fill it in.

| Item | Where |
|---|---|
| Résumé PDF | drop into `public/`, flip `RESUME_AVAILABLE` in `content/connect.ts` |
| Medium / Substack URLs | `content/writing.ts` — each essay offers the chat instead of a dead link |
| TikTok embed IDs | `content/creator.ts` |
| 5 About photos | `content/about.ts` |
| **The About prose** | `content/about.ts` — chapters, the three turns, and "where I'm going" are a *draft of your voice*, reconstructed from your CV and one conversation. Dates, roles, metrics and awards are sourced; memories and motivations are not. |
| Manna "What broke" | inferred — confirm the specifics |
| Academy phase dates | Talkative and GerakinAja timelines |

**The four architecture diagrams are done.** They were only blocked when they
needed exported images; as mermaid they're authored source in
`content/case-studies.ts` and ship rendered. They still want your eye for
technical accuracy — that's a review, not a blocker.

**The hero is done too**, built to `reference/hero-4d.html`: a small circular
avatar in a two-line byline, a 56px headline, two actions, the proof strip, and
then a tinted band holding a vertical latest-first route rail with the figure
standing in it. No large portrait in the headline block.

The route rail is *derived from* `content/work.ts` (via `content/home.ts`) — add
a role and the home page updates itself.

`abel-2-cutout.webp` is generated from `abel-2.jpeg`: the background is flood-
filled from the frame edges (which protects the white motifs *inside* the batik,
since they're enclosed by dark pattern), feathered slightly, then trimmed to the
silhouette so a width class sizes the **figure**, not a box with dead margin.
154KB with real alpha — which is also what lets the `drop-shadow` follow his
outline instead of a rectangle. Regeneration recipe is in `CLAUDE.md`.

`abel-1.png` stays on `/connect`; `abel-pixelated.png` is unused if you'd rather
go playful.

---

## Appendix — the original design handoff

*Everything below is the spec this site was built from, kept verbatim as the
reference for pixel decisions and copy. Two notes when reading it: where it says
"the prototype authors nine answers by hand", that is now the fallback layer
rather than the whole chat; and its references to a `reference/` directory are
historical — those design files are no longer kept in this repo.*

## Overview

A personal portfolio site for **Abelito Faleyrio Visese**, AI Engineer at Datasaur. The premise: a normal multi-page portfolio on the left, and a **persistent chat** that can answer any question about his work on the right — so a hiring manager can either read or ask, and both routes tell the same story.

Seven routes, storytelling-first. Every project answer follows a fixed five-beat spine (Hook → Problem → How it was built → Proof → Lesson) and ends with follow-up questions rather than a dead end.

**Target audience for the site:** recruiters, hiring managers, startup founders looking to contract, potential co-founders. Desktop-first.

## About the design files

The files in `reference/` are **design references created in HTML** — prototypes showing intended look and behaviour. They are *not* production code to copy directly.

They are written as "Design Components" (`.dc.html`) — a template + logic-class format specific to the design tool they were authored in, with all styling inline. `support.js` is that tool's runtime. **Do not try to port `support.js` or the `<sc-if>` / `<sc-for>` / `{{ }}` template syntax.** Read the files for exact structure, copy, colours and spacing, then rebuild in the target stack.

The task is to **recreate these designs in a real codebase** using its established patterns. If no codebase exists yet, Next.js (App Router) + Tailwind is the natural fit — the user already owns `GaTheLy/Abelito-Portfolio`, a Next.js repo, which is the intended destination.

**Note on the existing repo:** the v1 in that repository has a different visual direction (oxblood/cream, an "orchestrator agents" concept). This design deliberately starts fresh and **replaces** that visual language. The v1 concepts worth keeping are the block-schema idea for chat answers and the MDX content structure.

## Fidelity

**High-fidelity.** Final colours, typography, spacing, copy and interaction states. Recreate pixel-accurately. Every value in this document was taken from the design files.

Two exceptions, marked in-page with dashed amber callouts:
- The About page biography, chapters and "three turns" are a *draft of the user's voice* — copy to be rewritten by him.
- The About page "Where I'm going" aspirations — same.

Placeholders needing real material are listed under **Open items**.

---

## Global shell

```
┌─────────────────────────────────────────────────────────────┐
│ Top bar — 57px, #FBFAF6, 1px bottom border #DDD8CA          │
│ [A] Abelito Visese  AI ENGINEER   nav…   MALANG · GMT+7 [Connect] │
├──────────────────────────────────┬──────────────────────────┤
│ Page content (scrolls)           │ Chat panel               │
│                                  │ (704px on Home,          │
│                                  │  340px elsewhere)        │
└──────────────────────────────────┴──────────────────────────┘
```

- Outer shell: `display:flex; flex-direction:column; height:100vh; min-height:820px; min-width:1560px; overflow:hidden; background:#F1EEE6`
- Body row: CSS grid, `grid-template-columns: minmax(0,1fr) 704px` on Home, `minmax(0,1fr) 340px` on every other route. This is the single most important behaviour in the design — see **Chat panel** below.
- Left column scrolls (`overflow-y:auto`), and **resets to `scrollTop = 0` on every route change and on every new chat answer**.
- Chat panel has `border-left:1px solid #DDD8CA; background:#F7F5EF`, never scrolls as a whole — its transcript area scrolls internally.
- `min-width:1560px` is intentional: below that the page scrolls horizontally rather than crushing the two columns. Mobile is **not designed yet** (see Open items).

### Top bar

- Logo mark: 23×23px, `border-radius:3px`, `background:#1E4D3B`, letter "A" in `700 11px/23px JetBrains Mono`, colour `#F1EEE6`, centred.
- Wordmark: `600 13.5px Space Grotesk`, `letter-spacing:-.01em`, `#17160F`. Followed by `AI ENGINEER` in `400 10px JetBrains Mono`, `letter-spacing:.06em`, `#8B8574`.
- Nav items: `500 12.5px Space Grotesk`, `padding:7px 12px`, `border-radius:5px`. Active: `background:#EDE9DF`, colour `#17160F`. Inactive: transparent, `#514C42`. Hover: `background:#EDE9DF`.
- Nav labels in order: **Home · Work · Projects · Writing · Creator · About**. The Projects item stays active for all four case-study routes.
- Right side: `MALANG · GMT+7` in `400 10px JetBrains Mono`, `.06em`, `#8B8574`; then a pill button "Connect" — `500 12.5px Space Grotesk`, `padding:8px 15px`, `border-radius:100px`, `background:#1E4D3B`, colour `#F7F5EF`, hover `#163A2C`.

---

## Routes

| Route | Nav label | Purpose |
|---|---|---|
| `/` | Home | Hero, proof metrics, career timeline, four featured projects, pillar links |
| `/work` | Work | Employment history with "what it changed", education, honours |
| `/projects` | Projects | Searchable/filterable/sortable index of all projects |
| `/projects/[slug]` | (Projects) | Full case study — 4 exist: `manna`, `traffic`, `talkative`, `gerakin` |
| `/writing` | Writing | Essay index, links out to Medium/Substack |
| `/creator` | Creator | TikTok channel, formats, video embeds |
| `/about` | About | The long personal narrative — the storytelling centrepiece |
| `/connect` | (Connect button) | Contact details, résumé download |

---

## Page: Home

`padding:44px 44px 56px; max-width:860px`

1. **Hero row** — `display:flex; gap:28px; align-items:flex-start`
   - Eyebrow: `ABELITO FALEYRIO VISESE · AI ENGINEER AT DATASAUR` — `400 10.5px JetBrains Mono`, `.1em`, `#8B8574`, `margin-bottom:16px`.
   - H1: "I build the system around the model." — `300 50px/1.03 Newsreader`, `letter-spacing:-.03em`, `max-width:15ch`.
   - Body: `400 16.5px/1.6 Space Grotesk`, `#3D3A31`, `max-width:52ch`.
   - Buttons: primary "Book 20 minutes" (`background:#1E4D3B`, `#F7F5EF`, `padding:11px 19px`, `border-radius:100px`); secondary "See the projects" and "Ask about my RAG work →" (`background:#FBFAF6`, `1px solid #CFC9B8`, hover border `#1E4D3B`).
   - **Avatar slot** — 178px wide column. A 162×162 circle, `background: radial-gradient(120% 120% at 30% 20%, #EDF2EE, #D6E1D8 58%, #BFCFC4)`, `box-shadow:0 16px 32px -18px rgba(30,77,59,.5)`, offset 14px inside a 158×158 dashed `#C6BFAD` circle outline for depth. Caption below: `3D AVATAR SLOT — DRAG A RENDER IN`, `400 9.5px/1.55 JetBrains Mono`, `#8B8574`.
     **The user wants a playful 3D render of his face here.** In production: a transparent PNG/WebP of the 3D avatar, or a `<model-viewer>`/three.js element, masked to the circle. His flat photo is used only on `/connect`.

2. **Proof strip** — 4-col grid, top border `#DDD8CA`, `padding-top:26px`. Numbers `400 30px/1 Space Grotesk`, `letter-spacing:-.035em`, `#1E4D3B`; labels `400 11px/1.4 JetBrains Mono`, `#6E6A5C`.
   `97.4%` congestion classifier, 14.4ms inference · `<2s` phoneme-level scoring · `~80%` admin work cut for a paying client · `0` critical findings, 3rd-party pen test.

3. **"THE ROUTE HERE"** — horizontal 5-column timeline. A 1px `#DDD8CA` line at `top:7px` spans the row; each column starts with a 9px dot (`#CFC9B8`, current node `#D64A2B`). Eyebrow labels `700 9.5px JetBrains Mono`, `.12em`. Nodes: Petra Christian University (2021–2025) · Apple Developer Academy (Feb–Dec 2025) · Axrail, AWS Partner (Jan–Mar 2026) · KinetixPro (Feb–Apr 2026) · **NOW** Datasaur.

4. **"FOUR I'D SHOW YOU FIRST"** — 2×2 grid of card buttons, `gap:16px`, each `1px solid #DDD8CA`, `background:#FBFAF6`, `border-radius:8px`, `padding:20px 21px`, hover border `#1E4D3B`. Title `600 16px Space Grotesk`; badge right-aligned `400 9.5px JetBrains Mono`, `.08em`; blurb `400 13.5px/1.55`; footer metrics `400 10px JetBrains Mono`, `#6E6A5C`.

5. **Pillar footer** — 3 columns: WRITING · CREATOR · ABOUT ME, each with a one-line description and a text link.

---

## Page: Work

`padding:48px 56px 60px; max-width:1000px`. H1 "Four rooms, four different ways to be wrong." (`300 46px/1.06 Newsreader`, `-.028em`).

Four role blocks, each `border-top:1px solid #DDD8CA; padding:28px 0`, laid out `grid-template-columns:172px 1fr; gap:32px`:

- **Datasaur** — Jun 2026 → now (date label in `#D64A2B`), AI Engineer. Deliberately high-level: "the work is internal."
- **KinetixPro** — Feb–Apr 2026, AI/ML Engineer Intern. Three bullets: 8-service CV active-learning monorepo (Docker Compose + NVIDIA Container Toolkit, YOLOv7 auto-labelling, continuous training, dataset QA); OpenCV/FFmpeg sampling engine off MediaMTX RTSP; GPU inference endpoints with cloud dataset sync.
- **Axrail (AWS Partner)** — Jan–Mar 2026, AWS Cloud Engineer Trainee. Four bullets: Bedrock Nova Lite + Strands Agents conversational commerce agent (KB RAG, cross-session memory, order-trend analysis, MCP tool-use, 5-iteration loop, WebSocket); AppSync/12 DynamoDB tables/5 EventBridge Lambdas timesheet automation; 11-micro-stack multi-tenant CDK platform (SSM, OpenSearch, SQS FIFO, Step Functions); security — Cognito RBAC, API GW authorizers, Bedrock Guardrails, rate limiting, **zero critical pen-test findings**.
- **Apple Developer Academy** — Feb–Dec 2025. Three product cards: Talkative, Cire, GerakinAja.

Each block closes with a "What it changed:" pull-quote — `400 14.5px/1.6 Newsreader`, `border-left:2px solid #1E4D3B`, `padding-left:15px`.

Footer: two columns — **Education & certification** (Petra CS Data Science 2021–2025, GPA 3.61 cum laude, Most Outstanding Freshman in Data Science 2022; AWS Certified Developer – Associate 2026; five DeepLearning.AI certificates 2023) and **Honours** (1st place Hackfest 2025, Ciputra University, Apr 2025 — CV pipeline for image-based semantic visual search in a B2B marketplace; 4th place Jogjakarta Finance Case Competition, UGM, May 2024 — telecom merger restructuring valuation).

---

## Page: Projects — search, filter, sort

**This page is data-driven and must stay that way.** The user's requirement: "the project page is going to grow." One array of project objects drives everything; every count on the page is derived, never hardcoded.

### Project record shape

```js
{
  slug, name, cat, year,
  meta,        // small caps line, e.g. "2025 · CLIENT PROJECT"
  badge,       // e.g. "REAL CLIENT"
  deep: true,  // has a full case study → card routes to /projects/[slug]
  ask: "rag",  // OR: no case study → card opens this chat answer ("work" = go to /work)
  blurb, stack: [], metric,
  keys         // extra search keywords, not displayed
}
```

Nine records exist. Categories: `LLM & Agents`, `Computer Vision`, `Voice & Audio`, `Cloud & Infra`.

| Project | Cat | Year | Deep | Metric |
|---|---|---|---|---|
| Manna Cooking Studio | LLM & Agents | 2025 | ✅ | ~80% admin cut |
| Traffic congestion detection | Computer Vision | 2025 | ✅ | 97.4% at 14.4ms |
| Talkative | Voice & Audio | 2025 | ✅ | <2s per utterance |
| GerakinAja | Computer Vision | 2025 | ✅ | <200ms per frame |
| Riset | LLM & Agents | 2026 | — (`ask:"rag"`) | hybrid retrieval + evals |
| Axrail commerce agent | LLM & Agents | 2026 | — (`ask:"work"`) | 0 critical pen-test findings |
| Padel court analytics | Computer Vision | 2026 | — (`ask:"cv"`) | holds identity through occlusion |
| Cire | Computer Vision | 2025 | — (`ask:"cv"`) | ~80% fewer API calls |
| CV active learning monorepo | Cloud & Infra | 2026 | — (`ask:"work"`) | 8 services, one loop |

### Controls panel

`1px solid #DDD8CA`, `border-radius:10px`, `background:#FBFAF6`, `padding:16px 18px 15px`, `margin-bottom:14px`.

1. **Search field** — `background:#FFFDF9`, `1px solid #CFC9B8`, `border-radius:8px`, `padding:10px 13px`. `FIND` label in `700 9px JetBrains Mono`, `#1E4D3B`, `.12em`. Placeholder: "Search projects — a technology, a metric, a problem…". A `CLEAR` button appears only when the query is non-empty.
   **Matching:** lowercase the query, split on whitespace, require **every** token to appear in the haystack `[name, blurb, cat, metric, keys, stack.join(" ")].join(" ").toLowerCase()`. (So "phoneme latency" → Talkative; "bm25" → Riset.)
2. **Row 2, left — CATEGORY** chips: All · LLM & Agents · Computer Vision · Voice & Audio · Cloud & Infra.
3. **Row 2, right (`margin-left:auto`) — DEPTH** label + a single "Case studies only" toggle chip. **Keep this visually separate from the sort chips** — when it sat in the sort row it read as a fifth sort option.
4. **Row 2, middle — SORT** chips: Newest · Oldest · A–Z · Most detailed.
   - `new`: `year` desc, then name asc
   - `old`: `year` asc, then name asc
   - `az`: name asc
   - `depth`: `deep` first, then `year` desc

**Chip styling** — `500 11.5px Space Grotesk`, `padding:6px 11px`, `border-radius:100px`. Selected: `background:#1E4D3B`, colour `#F7F5EF`, border `#1E4D3B`. Unselected: `background:#FFFDF9`, colour `#3D3A31`, border `#CFC9B8`.

### Results

Header row: derived label (`ALL 9 PROJECTS`, or `3 PROJECTS MATCH` / `1 PROJECT MATCHES` when any filter is active) + a hairline + `SORTED BY NEWEST`.

Cards: 2-col grid, `gap:16px`. Same card chrome as Home. Contents: name + badge (badge `#1E4D3B` if `deep`, else `#8B8574`), meta line, blurb, `stack.join(" · ")` in `400 9.5px/1.5 JetBrains Mono`, and a CTA line — uppercase `"{metric} · READ THE CASE STUDY →"` for deep records, `"{metric} · ASK THE CHAT →"` otherwise.

**Empty state** (`1px dashed #CFC9B8`, centred): "Nothing here matches that — which is a real answer, not a broken page." + "The chat searches everything on the site, not just this list…" + two buttons: **Ask the chat instead →** (routes the current query into the chat matcher, falling back to the off-topic answer) and **Reset filters**.

---

## Page: `/projects/[slug]` — case studies

`padding:40px 56px 60px; max-width:1000px`. All four share one template:

1. **Back link** — `← / PROJECTS / TRAFFIC-CONGESTION-DETECTION`, `400 10.5px JetBrains Mono`, `.1em`, `#8B8574`.
2. **H1** — `300 52px/1.04 Newsreader`, `-.03em`, `max-width:~20ch`. These are arguments, not titles: "Counting cars is not measuring traffic." / "A whole business was running out of one WhatsApp inbox." / "'Close enough' is not feedback." / "A form coach that never leaves the phone."
3. **Standfirst** — `400 17px/1.6 Newsreader`, `#3D3A31`, `max-width:60ch`.
4. **Meta strip** — 4 cells, `border-top`/`border-bottom` `#DDD8CA`, `padding:18px 0`. Labels `400 9.5px JetBrains Mono` `.1em` `#6E6A5C`; values `400 13px/1.45 Space Grotesk`.
   **Important:** this strip is a scan layer only and must NOT repeat role or stack — those have their own sections. Cells are: Traffic `CONTEXT/YEAR/WHERE/OUTCOME`; Manna `CONTEXT/CLIENT/SURFACE/OUTCOME`; Talkative & GerakinAja `CONTEXT/WHERE/DOMAIN/OUTCOME`.
5. **Body** — a two-column grid, `grid-template-columns:106px 1fr; gap:24px`. Left column is the section label (`700 9.5px JetBrains Mono`, `.14em`, `#6E6A5C`, `padding-top:5px`); right column is the content. **Section order is fixed and identical across all four:**

   `OVERVIEW → MY ROLE → PROBLEM → APPROACH → ARCHITECTURE → RESULTS → STACK → TIMELINE → LESSON`

   (Manna inserts `WHAT BROKE` between TIMELINE and LESSON.)

   - **ARCHITECTURE** — a hand-built diagram: `1px solid #DDD8CA`, `border-radius:8px`, `background:#FBFAF6`, a caption bar, then boxed nodes (`500 11px JetBrains Mono`, `padding:9px 13px`, `1px solid #17160F`, `border-radius:4px`, `background:#F7F5EF`; emphasis nodes `#1E4D3B` on `#EAF0EC`; terminal node inverted `#1E4D3B`/`#F7F5EF`) joined by 1px `#B3AC9A` lines with CSS-triangle arrowheads. Talkative's is instead a dark `#17160F` ASCII `<pre>` block. **All four are placeholders** — replace with real exported diagrams (Mermaid is fine).
   - **RESULTS** — 4-cell metric grid, `1px solid #DDD8CA`, `border-radius:8px`, dividers between cells. Numbers `400 26px/1 Space Grotesk`, `-.035em`; the headline metric in `#1E4D3B`, the rest `#17160F`.
   - **STACK** — chip row, `400 10.5px JetBrains Mono`, `padding:6px 11px`, `1px solid #DDD8CA`, `border-radius:4px`, `background:#FBFAF6`. Must match the record's `stack` — do not maintain a second list.
   - **TIMELINE** — horizontal 3–4 column phase timeline, same construction as Home's. Talkative's and GerakinAja's carry a note: "Confirm the real phase dates against your Academy cycles."
   - **LESSON** — `400 17px/1.65 Newsreader`, `border-left:2px solid #1E4D3B`, `padding-left:18px`, `max-width:58ch`.
6. **Footer** — "NEXT CASE STUDY" link (cycles through the four) + a chat CTA.

---

## Page: Writing

Essay index. Four entries, each `border-top:1px solid #DDD8CA; padding:24px 0`, `grid-template-columns:1fr 148px`. Titles `400 24px/1.25 Newsreader`; tag chips; right column shows `EXTERNAL · MEDIUM` or `DRAFT` plus an "Ask instead →" button that opens the matching chat answer.

Titles: "A vibe check is not an eval" · "Dense search knows what you meant. BM25 knows what you typed." · "The chatbot was easy. The state machine took three weeks." · "Latency is a product decision".

Carries an amber `NEEDS YOUR INPUT` callout — the real Medium/Substack URLs are missing.

---

## Page: Creator

TikTok channel — `@abelitovisese`. H1 "If I can't explain it in sixty seconds, I don't understand it."

Three format cards (Explainers · This week in AI · Day in the life), then a 4-across row of 9:16 embed placeholders (`1px dashed #CFC9B8`, `background:#EDE9DF`) — **replace with real TikTok embeds**. Footer explains that **Riset** (his research agent) sources the channel, tying the content pillar back to the engineering.

---

## Page: About — the storytelling centrepiece

`padding:48px 56px 60px; max-width:1000px`. ~5500px of scroll. This is the longest page by design; the user's brief was that it should carry the most narrative weight.

H1 "The part of me that isn't a job title."

1. **Photo strip** — 3 image slots (4:3, 3:4, 3:4) with prompts "A photo that feels like you", "Somewhere you love", "Your people".
2. **Draft banner** — dashed amber, states plainly that everything from here to the end of "The three turns" is a draft of his voice: dates/roles/metrics/awards are sourced, memories and motivations are reconstructed. **Keep this until he rewrites the prose.**
3. **CHAPTER 01 · WHERE THIS CAME FROM** — "Taking things apart, professionally." Two-column prose (`columns:2; column-gap:40px; column-rule:1px solid #DDD8CA`).
4. **CHAPTER 02 · FEB—DEC 2025** — "The year I learned to finish." Prose + a 4:5 image slot + a Newsreader pull-quote (`400 19px/1.55`, green left rule).
5. **CHAPTER 03 · THE FIRST INVOICE** — "Someone paid me, and everything got serious." (Manna, from the client's side.)
6. **CHAPTER 04 · 2026** — "Three rooms, three different ways to be wrong." Three cards: Axrail (write it down first) · KinetixPro (a dataset is a loop) · Datasaur (language, at someone else's scale). Closing pull-quote.
7. **THE THREE TURNS** — three numbered rows (`300 26px Newsreader` numerals in `#D64A2B`) of moments that changed how he builds.
8. **WHAT I'M INTO** — 2×2: Cars · Markets · Explaining things out loud · **one open amber card** he must fill in.
9. **THE PEOPLE** — friendship and the Academy cohort, plus a 1:1 image slot. Contains a bracketed prompt for a real anecdote.
10. **WHAT I BELIEVE** — six principles in a 2-col bordered list, each traceable to a real project.
11. **WHERE I'M GOING** — amber-flagged as his ambitions in draft: This year · Three years · The long bet, then "What I want to be known for" / "What I'm not chasing".
12. **RIGHT NOW** — the compact currency strip (WORKING · BUILDING · LEARNING · OPEN TO), `UPDATED AUG 2026`.

---

## Page: Connect

H1 "The plainest page on the site." Contact rows (`grid-template-columns:104px 1fr auto`): email `afvisese@gmail.com` (tagged FASTEST) · `linkedin.com/in/abelito` · `github.com/GaTheLy` · `@abelitovisese` · `+62 812-1601-7057` · Malang, East Java, Indonesia (GMT+7).

Two CTAs — "Email me" and "Download résumé (PDF)" — **currently non-functional placeholders; wire to `mailto:` and the real PDF.**

Right rail: his actual photo (`assets/abel.png`, 3:4, `object-position:64% 18%`), name, role, AWS certification line, and a card pointing at the chat for awkward questions.

---

## Chat panel

The defining component. **Two modes, driven purely by route:**

### Full mode (Home only) — 704px
- Header: green dot + "Ask me anything" + `GROUNDED IN 40+ DOCS`.
- **"IN FOCUS" panel** (`background:#EDE9DF`, bottom border) — a mini dossier that changes with the current answer: title, description, and two key/value rows. Labelled `FOLLOWS THE CHAT`. This is what stops the left column feeling static while someone chats.
- Transcript (scrolls): optional "EARLIER" trail of the last 3 questions; the user's question as a dark bubble (`background:#17160F`, `#F7F5EF`, `border-radius:13px 13px 3px 13px`, `align-self:flex-end`); then the answer, prefixed by a 22px green avatar tile.
- Suggested-question chips below the answer (8 of them).

### Rail mode (every other route) — 340px
- No transcript. Instead, **page-aware context**:
  - On a case study: an "IN THIS CASE STUDY" outline listing that page's exact sections (first item highlighted `#1E4D3B` with a 2px left rule), three questions written for *that* project, and a "SAME OBSESSION" pair of links to related builds.
  - Elsewhere: "ASK ME ANYTHING" + the four most-asked questions.
  - Plus the trail (if any) and a booking card.
- Asking anything from the rail **navigates to Home** and renders the answer in full mode — the rich blocks need the width.

### Persistent input (both modes)
Bottom bar, `border-top:1px solid #DDD8CA`, `background:#F1EEE6`, `padding:12px 16px 14px`. Field with an `ASK` label, placeholder "Type a question — markdown, tables and diagrams come back", and a Send pill. Enter submits. Below it, in `400 9.5px/1.5 JetBrains Mono`, `#8B8574`:

> "Prototype: answers are authored. In production this is a real LLM over a knowledge base of my work — same rendering, same guardrails."

### Answer rendering — the important part

The user's decision (after rejecting a draggable-canvas version): **answers render rich markdown, not plain text.** The prototype authors nine answers by hand; production replaces them with an LLM but keeps the renderer identical. Supported blocks, all present in the prototype:

- Headings, paragraphs, bold/italic, ordered and unordered lists
- Inline `code` — `400 12px JetBrains Mono` on `#EDE9DF`, `padding:1px 5px`, `border-radius:3px`
- **Fenced code blocks** — caption bar (`background:#F4F1E7`, language + COPY affordance) over a `#17160F` `<pre>`, `400 11.5px/1.75 JetBrains Mono`, text `#C9CFC6`, comments `#8B9A86`, keywords `#C9B96B`, strings `#A3C48E`
- **Tables** — `1px solid #DDD8CA`, `border-radius:7px`, header row `background:#F4F1E7` with `700 9px JetBrains Mono` `.1em` labels, body rows `400 12px Space Grotesk` divided by `#EDE9DF`, highlighted row `background:#EAF0EC` with `#1E4D3B` text. Optional footnote bar for caveats.
- **Mermaid diagrams** — rendered as real diagrams, captioned `MERMAID · FLOWCHART TB` / `RENDERED`. In production use `mermaid.js` with a theme matching the palette; the prototype fakes them with the same boxed-node construction as the case studies.
- **Metric grids** — 3–4 cells, same as case-study RESULTS
- **Blockquote pull-outs** — `400 14.5px/1.6 Newsreader`, `border-left:2px solid #1E4D3B` (or `#D64A2B` for emphasis), `padding-left:14px`
- **Follow-up chips** — every answer ends with 2–3 of them. No dead ends.

### The nine authored answers

`rag` · `evals` · `manna` · `cv` · `datasaur` · `rate` · `good` · `creator` · `fallback`.

Each has: a `QLABEL` (the question text shown in the user bubble), a `FOCUS` entry (the IN FOCUS dossier: title, description, 2 key/value pairs), and a rendered body.

**Keyword routing** — free text is lowercased and tested against an ordered regex list; first match wins, else `fallback`:

```
rag       /rag|retriev|riset|arxiv|hybrid|rrf|bm25|embed|vector|mcp|agent/
evals     /eval|ragas|benchmark|measur|test|regress|judge|accura(cy|te)|hallucinat/
manna     /manna|client|whatsapp|chatbot|booking|freelance|paid work/
cv        /vision|yolo|cv |opencv|traffic|padel|pose|camera|detect|image/
datasaur  /datasaur|2 month|two month|why only|job hop|short stint|current role/
rate      /rate|salary|pay|cost|price|hour|available|availab|notice|hire|hiring|contract|relocat|remote|visa/
good      /actually good|are you good|any good|weak|weakness|strength|honest|junior|senior|level/
creator   /tiktok|content|creator|video|channel|audience|social|teach/
```

**Guardrails — deliberate product decisions, keep them in the LLM version:**
- `datasaur` answers "why only 2 months?" head-on rather than dodging, then shows the prior 18 months as three cards.
- `rate` refuses to invent a number ("anyone who quotes before hearing the problem is guessing") and gives a precise table of what he *can* commit to.
- `good` is genuinely two-sided: a green "GENUINELY STRONG" card beside a "STILL EARLY" card that admits no long-horizon ownership, no leadership, thousands not millions of scale.
- `fallback` says "that's outside what I know about" and offers three real alternatives + email, instead of improvising.

### Production implementation notes

- Answers should come from an LLM over a knowledge base of his work (his stated preference). Have the model emit a **small typed block array** — `[{type:"text"}, {type:"table"}, {type:"mermaid"}, {type:"metrics"}, {type:"code"}, {type:"lesson"}, {type:"followups"}]` — and render each block with a component. A prose-only answer is a single `text` block, so nothing breaks. (The user already has a comparable block schema in his v1 repo.)
- Stream tokens; the layout assumes progressive rendering.
- Keep the authored answers as the fallback/seed set and as eval fixtures — they encode the tone.
- `IN FOCUS` should be driven by the answer's topic id, so it stays cheap to compute.

---

## State

| State | Type | Notes |
|---|---|---|
| `page` | `"home" \| "work" \| "projects" \| "case:<slug>" \| "writing" \| "creator" \| "about" \| "connect"` | Becomes real routes in production |
| `ans` | topic id | Current chat answer |
| `q` | string | Question text in the user bubble |
| `trail` | string[] | Last 3 previous questions |
| `draft` | string | Chat input |
| `pq` | string | Projects search query |
| `cat` | string | Category filter, default `"All"` |
| `sort` | `"new" \| "old" \| "az" \| "depth"` | Default `"new"` |
| `deep` | boolean | "Case studies only" |

Transitions worth preserving: any `ask()` sets `page = "home"`, pushes the previous question onto `trail`, clears `draft`, and resets the content scroll; any route change resets the content scroll.

---

## Design tokens

### Colour

| Token | Hex | Use |
|---|---|---|
| Canvas | `#F1EEE6` | App background, chat input bar |
| Surface | `#F7F5EF` | Chat panel background |
| Surface raised | `#FBFAF6` | Cards, top bar |
| Surface raised alt | `#FFFDF9` / `#FDFCF8` | Inputs, chips, inner cards |
| Sidebar / focus panel | `#EDE9DF` | Home hero column, IN FOCUS, image-slot wells |
| Divider | `#DDD8CA` | All 1px borders |
| Divider soft | `#EDE9DF` | Table row dividers |
| Border input | `#CFC9B8` | Inputs, unselected chips |
| Border faint | `#E6E1D4` | Inner chip borders |
| Ink | `#17160F` | Primary text, dark bubbles, code background |
| Ink body | `#3D3A31` | Body copy |
| Ink muted | `#514C42` | Secondary copy |
| Ink label | `#6E6A5C` | Section labels |
| Ink faint | `#8B8574` | Meta, captions |
| Ink faintest | `#B3AC9A` | Placeholder labels, arrows |
| Accent green | `#1E4D3B` | Primary action, metrics, active nav, rules |
| Accent green dark | `#163A2C` | Button hover |
| Accent green tint | `#EAF0EC` | Highlighted table rows, emphasis nodes |
| Accent green ink | `#20301F` | Text on green tint |
| Accent vermilion | `#D64A2B` | "Now" markers, current-phase dots, emphasis rules |
| Amber border | `#C9B96B` | Draft/needs-input callouts |
| Amber fill | `#FFF6D8` | Draft/needs-input callouts |
| Amber ink | `#8A7A32` / `#5C5220` | Draft callout label / body |
| Code fg | `#C9CFC6` | Code block text |
| Code comment | `#8B9A86` | |
| Code keyword | `#C9B96B` | |
| Code string | `#A3C48E` | |

### Type

Three families, loaded from Google Fonts:

- **Newsreader** (300/400, italic 300) — editorial headlines, standfirsts, pull-quotes, lessons. This is what makes it read as a publication rather than a SaaS page.
- **Space Grotesk** (400/500/600/700) — UI and body copy.
- **JetBrains Mono** (400/500/700) — labels, metadata, code, all-caps eyebrows.

| Role | Spec |
|---|---|
| Page H1 | `300 46px/1.06 Newsreader`, `-.028em` |
| Case-study H1 | `300 52px/1.04 Newsreader`, `-.03em` |
| Home H1 | `300 50px/1.03 Newsreader`, `-.03em` |
| Section H2 | `300 34px/1.15 Newsreader`, `-.025em` |
| Essay title | `400 24px/1.25 Newsreader`, `-.02em` |
| Standfirst | `400 17px/1.6 Newsreader` |
| Pull-quote | `400 17–19px/1.6 Newsreader` |
| Card title | `600 16–17px Space Grotesk`, `-.015em` |
| Body | `400 14.5–15px/1.65–1.72 Space Grotesk` |
| Small body | `400 13–13.5px/1.55–1.6 Space Grotesk` |
| Section label | `700 9.5px JetBrains Mono`, `.14–.18em` |
| Meta | `400 9.5–10.5px JetBrains Mono`, `.06–.1em` |
| Metric numeral | `400 26–30px/1 Space Grotesk`, `-.035em` |

Always `text-wrap: pretty` on prose.

### Spacing / shape

Page padding `44–48px 44–56px 56–60px`. Content max-width `860px` (Home) / `1000px` (everything else). Card padding `18–22px`. Grid gaps `12/16/20/24/36/40px`. Section rhythm: `22px` after a heading row, `44px` between major sections.

Radii: `3px` (inline code, logo, small chips) · `4px` (diagram nodes, stack chips) · `5px` (nav items) · `6–8px` (cards, panels) · `9–10px` (input bars, controls panel) · `100px` (pills) · `13–14px 13–14px 3px 13–14px` (chat bubbles).

Shadows are used sparingly: `0 16px 32px -18px rgba(30,77,59,.5)` on the avatar disc only.

### Motion

```css
@keyframes fu { from { opacity:0; transform:translateY(7px) } to { opacity:1; transform:none } }
.msg, .pg { animation: fu .34s/.3s cubic-bezier(.2,.7,.3,1) both }
@keyframes cr { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }  /* 1.1s steps(1) infinite — caret */
```

Page transitions and chat messages both use the same short rise-and-fade. Custom scrollbars: 9px, thumb `#D5CFBE`, transparent track.

---

## Assets

| Asset | Status |
|---|---|
| `assets/abel.png` | Real — his Datasaur profile photo. Used on `/connect`; greyscaled (`grayscale(1) contrast(1.05)`) where it appears as a portrait. |
| 3D avatar (Home hero) | **Missing.** The user asked for "something more playful, like a 3D version of my face." Currently an empty circular slot. |
| Architecture diagrams ×4 | **Placeholder.** Hand-built box diagrams / ASCII. |
| TikTok embeds ×4 | **Placeholder.** |
| About photos ×5 | **Placeholder** image slots. |
| Résumé PDF | Exists (`Resume_Abelito_AIML_June_2026.pdf`) but not wired to the download button. |

`image-slot.js` in `reference/` is the prototype's drag-and-drop placeholder component — a tool convenience, not something to port.

---

## Open items for production

1. **Mobile.** Not designed. The shell hard-floors at 1560px. Needs a decision: chat as a bottom sheet / a tab toggle / a floating dock. Worth asking the user before building.
2. **Real LLM + knowledge base**, replacing the nine authored answers — with the guardrails above preserved.
3. **Datasaur content.** Intentionally high-level; he said "high-level only, no metrics."
4. **Writing URLs** — real Medium/Substack links (he confirmed writing lives externally).
5. **Verify the inferred content.** The Manna "WHAT BROKE" section and both Academy timelines were written by inference and are flagged in-page; the About narrative and aspirations carry draft banners. All must be confirmed or rewritten before launch.
6. **`/projects` deep-linking** — search/filter/sort state should live in the URL so a filtered view is shareable.
7. **Accessibility** — the prototype uses `<button>` for navigation and semantic headings, but needs real focus-visible styles, an aria-live region for streaming answers, and a skip link.

## Files in `reference/`

| File | What it is |
|---|---|
| `Abelito Visese - Portfolio.dc.html` | **The design.** All seven routes + four case studies + the chat. |
| `Chat Portfolio Directions.dc.html` | The exploration that led here — five earlier directions (1a–1e) plus three alternative left-rail concepts (1g/1h/1i). Useful for understanding *why* the final design is shaped this way, and for the rejected options. |
| `support.js` | Design-tool runtime. **Do not port.** |
| `image-slot.js` | Prototype image placeholder. **Do not port.** |
| `assets/abel.png` | Real photo. |

Open either `.dc.html` directly in a browser to interact with it.
