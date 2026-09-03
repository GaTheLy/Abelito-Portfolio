import { z } from "zod";
import { TOPIC_IDS } from "../content/answers.ts";

// ─────────────────────────────────────────────────────────────────────────────
// The block system. One schema, three consumers:
//
//   1. the nine authored chat answers (content/answer-blocks.ts)
//   2. the LLM's structured output (app/api/ask/route.ts)
//   3. the four case-study bodies (content/case-studies.ts)
//
// Because it is a Zod schema and not just a TS type, the same definition
// validates model output at runtime and generates the JSON schema the model is
// constrained to. Keeping them in one place is the whole point — an LLM answer
// and a hand-written one must be indistinguishable to the renderer.
//
// `text` fields carry light inline markup, rendered by lib/inline.tsx:
//   **bold**   *italic*   `code`
// Deliberately not full markdown — the design only ever uses these three, and a
// markdown parser would be a dependency plus an XSS surface for model output.
// ─────────────────────────────────────────────────────────────────────────────

/** Graph types we have themed. Constraining the model to this enum is what
 *  keeps generated diagrams inside the house style. */
export const MERMAID_KINDS = ["flowchart TB", "flowchart LR", "sequenceDiagram"] as const;
export type MermaidKind = (typeof MERMAID_KINDS)[number];

const heading = z.object({
  type: z.literal("heading"),
  text: z.string(),
});

const text = z.object({
  type: z.literal("text"),
  md: z.string(),
});

const list = z.object({
  type: z.literal("list"),
  ordered: z.boolean().default(false),
  items: z.array(z.string()).min(1),
});

const code = z.object({
  type: z.literal("code"),
  /** Shown in the caption bar, e.g. "PYTHON · eval/run.py". */
  caption: z.string(),
  code: z.string(),
});

const table = z.object({
  type: z.literal("table"),
  columns: z.array(
    z.object({
      label: z.string(),
      align: z.enum(["left", "right"]).default("left"),
    }),
  ),
  rows: z.array(
    z.object({
      cells: z.array(z.string()),
      /** Green-tinted row — the recommended option, the shipped variant. */
      highlight: z.boolean().default(false),
    }),
  ),
  /** Caveat bar under the table. Used to be honest about unmeasured numbers. */
  footnote: z.string().optional(),
});

const mermaid = z.object({
  type: z.literal("mermaid"),
  kind: z.enum(MERMAID_KINDS),
  /** Mermaid source, without the leading graph-type line — the renderer
   *  prepends `kind` so the two can never disagree. */
  code: z.string(),
  /** Text description. Required, not optional: an SVG of boxes is opaque to a
   *  screen reader and this is the only thing it gets. */
  alt: z.string(),
});

/** A figure. With `src` it renders the image; without one it renders the
 *  design's dashed well — the same honest gap as `callout`, saying exactly what
 *  Abelito still has to supply. Drop the file in /public and set `src`. */
const image = z.object({
  type: z.literal("image"),
  /** Path under /public, e.g. "/assets/traffic/confusion-matrix.png". */
  src: z.string().optional(),
  /** Caption bar when filled, and the brief for the slot when empty. */
  caption: z.string(),
  /** Alt text. Falls back to the caption — never to nothing. */
  alt: z.string().optional(),
  /** CSS aspect-ratio, so the slot reserves the shape the image will take. */
  ratio: z.string().default("16 / 9"),
});

const metrics = z.object({
  type: z.literal("metrics"),
  items: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        /** The headline metric, rendered in accent green. At most one. */
        lead: z.boolean().default(false),
      }),
    )
    .min(2)
    .max(4),
});

const lesson = z.object({
  type: z.literal("lesson"),
  text: z.string(),
  /** Vermilion rule instead of green — reserved for the sharpest point. */
  emphasis: z.boolean().default(false),
});

/** Key/value rows — the `rate` answer's commitment table, and case-study meta
 *  strips. Distinct from `table`: no column headers, the key column is a fixed
 *  narrow mono label. */
const keyvalue = z.object({
  type: z.literal("keyvalue"),
  rows: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .min(1),
});

const followups = z.object({
  type: z.literal("followups"),
  /** Eyebrow above the chips. "NEXT" unless something else fits better. */
  label: z.string().default("NEXT"),
  items: z
    .array(
      z.object({
        label: z.string(),
        /** Opens another chat answer. */
        topic: z.enum(TOPIC_IDS).optional(),
        /** …or navigates. Exactly one of `topic` / `href` should be set; an
         *  item with neither is skipped by the renderer rather than throwing,
         *  so a malformed model response degrades quietly. */
        href: z.string().optional(),
        /** Solid green fill — a call to action, not a question. */
        cta: z.boolean().default(false),
        /** Green outline rather than neutral — the obvious next question. */
        primary: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(4),
});

/** Technology chip row. Case studies build this from the project record's
 *  `stack` — README is explicit that there must not be a second list. */
const stack = z.object({
  type: z.literal("stack"),
  tags: z.array(z.string()).min(1),
});

/** Horizontal phase timeline — a hairline with a dot per column. Used on Home
 *  ("THE ROUTE HERE") and in every case study's TIMELINE section. */
const timeline = z.object({
  type: z.literal("timeline"),
  entries: z
    .array(
      z.object({
        label: z.string(),
        text: z.string(),
        /** Vermilion dot + label — "you are here". */
        current: z.boolean().default(false),
      }),
    )
    .min(2),
});

/** Dashed amber panel. The design uses this to be visibly honest about content
 *  that is drafted, inferred, or still needs the user's real material. Keep
 *  them until the content behind them is confirmed — that's the point. */
const callout = z.object({
  type: z.literal("callout"),
  label: z.string().default("NEEDS YOUR INPUT"),
  text: z.string(),
});

const cards = z.object({
  type: z.literal("cards"),
  columns: z.union([z.literal(2), z.literal(3)]).default(2),
  items: z.array(
    z.object({
      /** Small mono eyebrow — a date, or a verdict like "GENUINELY STRONG". */
      label: z.string().optional(),
      title: z.string().optional(),
      /** One entry per line. A single-element array is a plain paragraph; more
       *  than one renders as the design's `·`-prefixed list. */
      body: z.array(z.string()).default([]),
      tone: z.enum(["good", "warn", "neutral", "placeholder"]).default("neutral"),
    }),
  ),
});

export const blockSchema = z.discriminatedUnion("type", [
  heading,
  text,
  list,
  code,
  table,
  keyvalue,
  mermaid,
  image,
  metrics,
  stack,
  timeline,
  callout,
  lesson,
  followups,
  cards,
]);

export type Block = z.infer<typeof blockSchema>;

/** What the rail beside a case study is allowed to say. There is no room in
 *  340px for a table or a diagram, and a rail answer is a paragraph, not a
 *  dossier — so the model is constrained to prose rather than trusted to
 *  restrain itself. A subset of blockSchema, so the renderer needs no second
 *  path and the client keeps its `Block[]` type. */
export const proseSchema = z.discriminatedUnion("type", [text, list]);

export function isProse(block: Block): boolean {
  return block.type === "text" || block.type === "list";
}

/** Keep only what the rail renders. Used for the authored fallbacks, which are
 *  written rich and must be narrowed before they reach a 340px column. */
export function proseOnly(blocks: Block[]): Block[] {
  return blocks.filter(isProse);
}
export type BlockType = Block["type"];

/** Authoring shape — fields with defaults are optional here. Content modules
 *  write `BlockInput` and run it through `parseBlocks`, so every hand-written
 *  answer is validated against the same schema the model is held to. */
export type BlockInput = z.input<typeof blockSchema>;

/** Validate authored content at module load. A typo becomes a build failure
 *  rather than a broken panel in production. */
export function parseBlocks(blocks: BlockInput[]): Block[] {
  return blocks.map((block) => blockSchema.parse(block));
}

/** What the model is asked to produce. `topic` drives the IN FOCUS dossier and
 *  picks the authored answer if anything downstream fails. */
export const answerSchema = z.object({
  topic: z.enum(TOPIC_IDS),
  blocks: z.array(blockSchema).min(1),
});

export type Answer = z.infer<typeof answerSchema>;

/** Human labels for case-study section rails. Derived from the block array, so
 *  a case study's contents list can never drift from its content. */
export const blockLabel: Record<BlockType, string> = {
  heading: "Overview",
  text: "Notes",
  list: "Details",
  code: "Code",
  table: "Comparison",
  keyvalue: "Details",
  mermaid: "Architecture",
  image: "Figure",
  metrics: "Results",
  stack: "Stack",
  timeline: "Timeline",
  callout: "Note",
  lesson: "Lesson",
  followups: "Next",
  cards: "Breakdown",
};
