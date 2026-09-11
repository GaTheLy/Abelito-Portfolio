---
name: add-content
description: "Add or update a project's content on abelitovisese.com — the projects.ts record, the case study, and everything downstream that derives from them. Use when the user says /add-content, /update-content, or asks to add, write, fill in, revise or correct the content for a project or case study on this portfolio."
argument-hint: "[project-name-or-slug]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - AskUserQuestion
---

# add-content

`$ARGUMENTS` names the project. Resolve it to a slug in `content/projects.ts`.
Existing slug → **update** path. No match → **add** path. Say which one you took.

Everything below is content-layer work. `app/` and `components/` are not edited
by this skill; if the content needs a block type that doesn't exist yet, stop
and say so rather than reaching into the renderer.

## 0 · Get the source material first

Never write from inference. Ask for the deck, README, repo, notes or screenshots
before drafting. If the user says "here's the detail" without attaching it, look
for it (`~/Downloads`, the repo) and confirm what you found before using it.

For anything the source doesn't cover, do **not** fill the gap with plausible
prose. Either leave it out, or write a `callout` block:

```ts
{ type: "callout", label: "CONFIRM", text: "…what you need from him." }
```

If the new material **contradicts** what the site already says (a demo described
as a client engagement, a metric that turns out to be estimated, a changed city
or stack), stop and surface the conflict before editing. That contradiction will
also live in About, Home and the chat answers — see §4.

## 1 · `content/projects.ts` — the record

This is the source of truth. Every count on `/projects`, the Home grid, and the
case study's STACK chips derive from it. Never write a second copy of any of it.

```ts
{
  slug, name,
  cat: one of CATEGORIES (not "All"),
  year,
  meta: "2025 · CLIENT PROJECT",   // small-caps line under the title
  badge: "REAL CLIENT",            // short, honest — it is a claim
  deep: true,                      // only if a case study exists
  blurb,                           // 1–2 sentences, the card
  stack: [...],                    // THE list. STACK renders exactly this.
  metric: "~80% admin cut",        // one number, from the source
  keys: "…",                       // never displayed; search keywords only
}
```

`LAUNCH_WIP` at the top of the file hides a slug in production
(`NEXT_PUBLIC_LAUNCH_MODE=1`). Add the slug there if the content isn't confirmed.

## 2 · `content/case-studies.ts` — the study

Section labels are enforced by `lib/site.test.ts`. Fixed order:

```
OVERVIEW → MY ROLE → PROBLEM → APPROACH → ARCHITECTURE → RESULTS
  → [one optional honesty section] → STACK → TIMELINE → LESSON
```

The first six and the last are asserted exactly. STACK **must** be
`stackSection(slug)` — a hand-written tag list fails the test. The optional
honesty section (`WHAT BROKE`, `WHAT'S WEAK`) goes immediately before STACK.

Also required on the record:

- `h1` — an argument, not a title. A sentence with a verb.
- `standfirst` — the claim, in one or two sentences.
- `meta` — exactly 4 scan cells. Must **not** repeat role or stack; those have
  their own sections.
- `questions` — 3, each `topic` a real `TopicId` from `content/answers.ts`.
- `related` — 2, no duplicate labels, and each `href` either
  `/projects/<real-slug>` or `/projects?q=<query matching exactly one project>`.

### Choosing blocks

Full list in `lib/blocks.ts`. Reach for, in this order:

| Need | Block |
|---|---|
| A flow, a pipeline, a request path | `mermaid` (`flowchart LR/TB`, `sequenceDiagram`) |
| A comparison, options, before/after | `table` (`footnote` for unmeasured numbers) |
| Named facts | `keyvalue` |
| Headline numbers | `metrics` (2–4 items, at most one `lead`) |
| Phases | `timeline` (`current: true` on where he is) |
| A screenshot he still has to supply | `image` with **no** `src` |
| 2-3 shots that belong side by side | `figures` (items share the `image` shape; give them one `ratio` so the row sits level) |

`mermaid` and `table` are preferred over a screenshot wherever the content is
structural — they are themed, searchable, and land in the chat corpus as text.
Every `mermaid` needs `alt`; it is the only thing a screen reader gets.

An `image` block with no `src` renders the dashed figure well. Its `caption` is
the brief for the slot — write what the picture must show, and set `ratio` to the
shape it will take. When the file lands in `/public/assets/<slug>/`, add `src`.

`md` fields take `**bold**`, `*italic*` and `` `code` `` only. Not markdown.

## 3 · Verify

```bash
npm test          # section order, stack derivation, topic routing, links
npm run lint
npm run build
```

`parseBlocks` runs at module load, so a malformed block is a build failure, not a
broken panel. Fix it here, not in the renderer.

## 4 · Sweep what derives from it

`content/corpus.ts` builds the chat's knowledge base from these modules, so a
claim left stale elsewhere becomes something the chat says out loud. After
editing, grep the project's own words and check every hit:

```bash
grep -rn "<slug>\|<distinctive phrase>" content/ app/ README.md
```

- `content/answers.ts` — `QLABEL`, `FOCUS` and the `MATCH` regex for the topic.
  MATCH order is load-bearing; `npm test` asserts every topic still reaches
  itself.
- `content/answer-blocks.ts` — the authored answer that serves as the offline
  and fallback response. Must not outlive the case study it summarises.
- `content/home.ts` — `proof` stats.
- `content/about.ts` — the chapters. These are a *reconstruction of his voice*;
  if new material makes a chapter false, flag it and propose a rewrite rather
  than silently rewriting his story.
- `README.md` — the project table and the honesty-audit table.

For a **new** topic id, all of `TOPIC_IDS`, `QLABEL`, `FOCUS`, `MATCH` and
`answerBlocks` must be updated together, or `npm test` fails.

## 5 · Report

Say what changed, what you left as a `callout` because it wasn't in the source,
and what image slots are waiting for a file. Don't commit unless asked.
