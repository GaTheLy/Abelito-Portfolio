import { blockLabel, type Block } from "@/lib/blocks";

// Generated entirely from the blocks present, in order. Anchor ids use the
// block's index so duplicate block types stay unique. Matches BlockRenderer.
export default function ContentsRail({ blocks }: { blocks: Block[] }) {
  return (
    <nav aria-label="Contents" className="sticky top-24 hidden self-start lg:block">
      <p className="font-mono text-xs uppercase tracking-widest text-muted">Contents</p>
      <ol className="mt-4 space-y-2 text-sm">
        {blocks.map((block, i) => (
          <li key={`${block.type}-${i}`}>
            <a
              href={`#${block.type}-${i}`}
              className="text-muted transition-colors hover:text-foreground"
            >
              {blockLabel[block.type]}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
