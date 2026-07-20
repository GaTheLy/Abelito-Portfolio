import { blockLabel, type Block } from "@/lib/blocks";

// Renders one block. The wrapping <section> carries the anchor id
// (`${type}-${index}`) that the contents rail links to.
export default function BlockRenderer({ block, index }: { block: Block; index: number }) {
  return (
    <section id={`${block.type}-${index}`} className="scroll-mt-24">
      {block.type !== "retrospective" && (
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted">
          {blockLabel[block.type]}
        </h2>
      )}
      <Body block={block} />
    </section>
  );
}

function Body({ block }: { block: Block }) {
  switch (block.type) {
    case "overview":
    case "role":
    case "problem":
    case "approach":
      return <p className="max-w-2xl leading-relaxed text-foreground/90">{block.body}</p>;

    case "architecture":
      // Placeholder box, not a broken <img> — real asset comes later.
      return (
        <figure>
          <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-card">
            <span className="font-mono text-xs text-muted">{block.image}</span>
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-sm text-muted">{block.caption}</figcaption>
          )}
        </figure>
      );

    case "results":
      return (
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {block.metrics.map((m) => (
            <div key={m.label} className="rounded-md border border-border bg-card p-4">
              <dt className="text-sm text-muted">{m.label}</dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight">{m.value}</dd>
              {/* Muted (not the low-contrast accent) so it passes AA; the +/− sign
                  carries the direction, not colour alone. */}
              {m.delta && <dd className="mt-0.5 text-sm font-medium text-muted">{m.delta}</dd>}
            </div>
          ))}
        </dl>
      );

    case "stack":
      return (
        <ul className="flex flex-wrap gap-2">
          {block.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm border border-border px-2 py-1 font-mono text-xs text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>
      );

    case "demo":
      // Placeholder box, not a broken <iframe>.
      return (
        <div className="flex aspect-video w-full items-center justify-center rounded-md border border-dashed border-border bg-card">
          <span className="font-mono text-xs text-muted">{block.embedUrl}</span>
        </div>
      );

    case "timeline":
      return (
        <ol className="space-y-4 border-l border-border pl-6">
          {block.entries.map((e, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-7 top-1.5 h-2 w-2 rounded-full bg-builder" />
              <p className="font-mono text-xs text-muted">{e.date}</p>
              <p className="mt-1 text-foreground/90">{e.text}</p>
            </li>
          ))}
        </ol>
      );

    case "retrospective":
      return (
        <blockquote className="border-l-2 border-builder pl-6 font-voice text-xl italic leading-relaxed text-foreground/90">
          “{block.quote}”
        </blockquote>
      );
  }
}
