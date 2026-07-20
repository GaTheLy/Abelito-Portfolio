import { getProject } from "@/lib/projects";
import { agentById } from "@/lib/orchestrator/agents";
import ContentsRail from "@/components/blocks/ContentsRail";
import BlockRenderer from "@/components/blocks/BlockRenderer";

// Shared body for /builder/[slug] AND the case-study conversation response.
// Rail + blocks are generated from project.blocks — no fixed order/presence.
// Callers guarantee the slug exists (route page calls notFound; cards pass a
// real slug), but we guard anyway.
export default function CaseStudy({ slug }: { slug: string }) {
  const project = getProject(slug);
  if (!project) return null;
  const agent = agentById(project.agent);

  return (
    <article>
      <header className="mb-12">
        <span
          className={`inline-block rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-white ${agent.accent.bg}`}
        >
          {agent.name}
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{project.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{project.tagline}</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-[180px_1fr]">
        <ContentsRail blocks={project.blocks} />
        <div className="min-w-0 space-y-16">
          {project.blocks.map((block, i) => (
            <BlockRenderer key={`${block.type}-${i}`} block={block} index={i} />
          ))}
        </div>
      </div>
    </article>
  );
}
