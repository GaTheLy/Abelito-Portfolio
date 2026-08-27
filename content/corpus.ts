import type { Block } from "../lib/blocks.ts";
import { TOPIC_IDS, QLABEL, FOCUS } from "./answers.ts";
import { answerBlocks } from "./answer-blocks.ts";
import { projects } from "./projects.ts";
import { caseStudies } from "./case-studies.ts";
import { roles, education, honours } from "./work.ts";
import { essays } from "./writing.ts";
import { formats, HANDLE } from "./creator.ts";
import { contacts } from "./connect.ts";
import {
  chapters,
  turns,
  interests,
  people,
  beliefs,
  going,
  rightNow,
} from "./about.ts";

// The chat's knowledge base, DERIVED from the same content the pages render.
//
// This is the load-bearing decision of the whole AI layer: content is authored
// once, and the corpus is generated from it. "Grounded in 40+ docs" is then
// literally true, and the chat can never quietly drift from what the site says.
// Adding a project or rewriting a case study updates the chat for free.
//
// Server-only — this module is imported by app/api/ask/route.ts and nothing else.

/** Flatten a rendered block back to plain text for the model to read. */
function blockToText(block: Block): string {
  switch (block.type) {
    case "heading":
      return block.text;
    case "text":
      return block.md;
    case "list":
      return block.items.map((i) => `- ${i}`).join("\n");
    case "code":
      return `${block.caption}\n${block.code}`;
    case "table":
      return [
        block.columns.map((c) => c.label).join(" | "),
        ...block.rows.map((r) => r.cells.join(" | ")),
        block.footnote ?? "",
      ]
        .filter(Boolean)
        .join("\n");
    case "keyvalue":
      return block.rows.map((r) => `${r.key}: ${r.value}`).join("\n");
    case "mermaid":
      return `Diagram (${block.kind}): ${block.alt}`;
    case "metrics":
      return block.items.map((m) => `${m.value} — ${m.label}`).join("; ");
    case "stack":
      return `Stack: ${block.tags.join(", ")}`;
    case "timeline":
      return block.entries.map((e) => `${e.label}: ${e.text}`).join("\n");
    case "callout":
      return `[${block.label}] ${block.text}`;
    case "lesson":
      return `Lesson: ${block.text}`;
    case "followups":
      return "";
    case "cards":
      return block.items
        .map((c) => [c.label, c.title, ...c.body].filter(Boolean).join(" — "))
        .join("\n");
  }
}

interface Doc {
  id: string;
  title: string;
  body: string;
}

function buildDocs(): Doc[] {
  const docs: Doc[] = [];

  // — Projects ————————————————————————————————————————————————
  for (const p of projects) {
    docs.push({
      id: `project:${p.slug}`,
      title: `${p.name} (${p.cat}, ${p.year})`,
      body: [
        p.blurb,
        `Headline metric: ${p.metric}.`,
        `Stack: ${p.stack.join(", ")}.`,
        p.deep
          ? `Has a full case study at /projects/${p.slug}.`
          : "No case study — answer from this summary.",
        `Related keywords: ${p.keys}`,
      ].join("\n"),
    });
  }

  // — Case studies, section by section ————————————————————————
  for (const study of caseStudies) {
    for (const section of study.sections) {
      docs.push({
        id: `case:${study.slug}:${section.label.toLowerCase().replace(/\s+/g, "-")}`,
        title: `${study.h1} — ${section.label}`,
        body: section.blocks.map(blockToText).filter(Boolean).join("\n"),
      });
    }
    docs.push({
      id: `case:${study.slug}:summary`,
      title: `${study.h1} — summary`,
      body: [study.standfirst, ...study.meta.map((m) => `${m.key}: ${m.value}`)].join("\n"),
    });
  }

  // — Work history ————————————————————————————————————————————
  for (const role of roles) {
    docs.push({
      id: `work:${role.company.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${role.company} — ${role.title} (${role.dates})`,
      body: [
        role.place,
        role.note,
        role.intro,
        ...(role.bullets ?? []),
        ...(role.products ?? []).map((p) => `${p.name}: ${p.blurb}`),
        role.changed ? `What it changed: ${role.changed}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }

  docs.push({
    id: "work:education",
    title: "Education and certification",
    body: education.map((e) => [e.title, e.line, e.note].filter(Boolean).join(" — ")).join("\n"),
  });
  docs.push({
    id: "work:honours",
    title: "Honours and competitions",
    body: honours.map((h) => `${h.title}: ${h.line}`).join("\n"),
  });

  // — About ————————————————————————————————————————————————————
  for (const chapter of chapters) {
    docs.push({
      id: `about:${chapter.eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: `About — ${chapter.title}`,
      body: [
        ...chapter.paragraphs,
        ...(chapter.cards ?? []).map((c) => `${c.label} — ${c.title}: ${c.body}`),
        chapter.pullquote ?? "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  }
  docs.push({
    id: "about:turns",
    title: "About — the three turns that changed how he builds",
    body: turns.map((t) => `${t.title}: ${t.body}`).join("\n"),
  });
  docs.push({
    id: "about:interests",
    title: "About — interests outside work",
    body: interests
      .filter((i) => !i.open)
      .map((i) => `${i.title} (${i.tag}): ${i.body}`)
      .join("\n"),
  });
  docs.push({ id: "about:people", title: "About — the people", body: people.paragraphs.join("\n") });
  docs.push({
    id: "about:beliefs",
    title: "About — what he believes",
    body: beliefs.map((b) => `${b.title}: ${b.body}`).join("\n"),
  });
  docs.push({
    id: "about:ambitions",
    title: "About — where he's going (DRAFT, not yet confirmed by Abelito)",
    body: [
      going.title,
      ...going.horizons.map((h) => `${h.label} — ${h.title}: ${h.body}`),
      `Wants to be known for: ${going.knownFor}`,
      `Not chasing: ${going.notChasing}`,
    ].join("\n"),
  });
  docs.push({
    id: "about:right-now",
    title: "About — what he's doing right now (as of Aug 2026)",
    body: rightNow.map((r) => `${r.key}: ${r.body}`).join("\n"),
  });

  // — Writing, creator, contact ————————————————————————————————
  docs.push({
    id: "writing:index",
    title: "Essays",
    body: essays
      .map((e) => `${e.title} [${e.status}]: ${e.blurb} (tags: ${e.tags.join(", ")})`)
      .join("\n"),
  });
  docs.push({
    id: "creator:index",
    title: `TikTok channel ${HANDLE}`,
    body: formats.map((f) => `${f.title}: ${f.body}`).join("\n"),
  });
  docs.push({
    id: "connect:index",
    title: "Contact details",
    body: contacts.map((c) => `${c.key}: ${c.value} (${c.tag})`).join("\n"),
  });

  // — The authored answers: tone, stance, and the house diagram style ————
  for (const topic of TOPIC_IDS) {
    docs.push({
      id: `answer:${topic}`,
      title: `Canonical answer — "${QLABEL[topic]}" (topic id: ${topic})`,
      body: [
        `In focus: ${FOCUS[topic].title} — ${FOCUS[topic].description}`,
        ...answerBlocks[topic].map(blockToText).filter(Boolean),
      ].join("\n"),
    });
  }

  return docs;
}

export const docs: Doc[] = buildDocs();

/** The whole corpus as one string, ready to be prompt-cached. */
export const corpus: string = docs
  .map((d) => `### ${d.title}\n[${d.id}]\n${d.body}`)
  .join("\n\n---\n\n");

/** Honest count for the "GROUNDED IN N DOCS" label in the chat header. */
export const docCount = docs.length;

/** Two authored diagrams shown to the model as worked examples, so generated
 *  mermaid comes back in the house style instead of freehand. */
export const diagramExamples: string = caseStudies
  .slice(0, 2)
  .flatMap((study) =>
    study.sections
      .flatMap((s) => s.blocks)
      .filter((b) => b.type === "mermaid")
      .map((b) => (b.type === "mermaid" ? `kind: ${b.kind}\n${b.code}` : "")),
  )
  .join("\n\n");
