import { agentById, type AgentId } from "@/lib/orchestrator/agents";

// Filled accent pill + title + intro. Shared by the agent section pages.
// White text on the accent fill keeps contrast accessible on every accent
// (including the lightest, #d53e0f); accents are never used as low-contrast
// text directly on the background.
export default function AgentPageHeader({
  agentId,
  title,
  intro,
}: {
  agentId: AgentId;
  title: string;
  intro: string;
}) {
  const agent = agentById(agentId);
  return (
    <header className="mb-12">
      <span
        className={`inline-block rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-white ${agent.accent.bg}`}
      >
        {agent.name}
      </span>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{intro}</p>
    </header>
  );
}
