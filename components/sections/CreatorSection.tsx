import AgentPageHeader from "@/components/AgentPageHeader";
import { agentById } from "@/lib/orchestrator/agents";

// TODO_ABELITO: replace with real content pieces (videos, series, links).
const items = [
  { title: "Placeholder series", meta: "Placeholder format · 0 posts" },
  { title: "Placeholder series", meta: "Placeholder format · 0 posts" },
  { title: "Placeholder series", meta: "Placeholder format · 0 posts" },
  { title: "Placeholder series", meta: "Placeholder format · 0 posts" },
];

// Shared body for /creator AND the creator conversation response.
export default function CreatorSection() {
  return (
    <div>
      {/* TODO_ABELITO: real Creator title */}
      <AgentPageHeader
        agentId="creator"
        title="Content & the @abelitovisese brand."
        intro={agentById("creator").description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-border border-l-2 border-l-creator bg-card p-5">
            <h3 className="font-medium tracking-tight">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
