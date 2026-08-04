import AgentPageHeader from "@/components/AgentPageHeader";
import { agentById } from "@/lib/orchestrator/agents";

// TODO_ABELITO: DEMO content — replace with the real content pieces.
const items = [
  { title: "Building in Public", meta: "YouTube series · 12 videos" },
  { title: "ML Paper Walkthroughs", meta: "Short-form · 30 clips" },
  { title: "From Zero to Shipped", meta: "Blog series · 8 posts" },
  { title: "Ask an AI Engineer", meta: "Live Q&A · monthly" },
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
