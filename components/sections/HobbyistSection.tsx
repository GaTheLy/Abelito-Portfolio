import AgentPageHeader from "@/components/AgentPageHeader";
import { agentById } from "@/lib/orchestrator/agents";

// TODO_ABELITO: DEMO content — replace with the real interests.
const items = [
  { title: "Manual-only garage", meta: "Cars · project-car log" },
  { title: "Index-and-chill", meta: "Investing · long-term portfolio notes" },
  { title: "Why does that work?", meta: "Curiosity · explainer threads" },
  { title: "Track days", meta: "Cars · lap-time diary" },
];

// Shared body for /hobbyist AND the hobbyist conversation response.
export default function HobbyistSection() {
  return (
    <div>
      {/* TODO_ABELITO: real Hobbyist title */}
      <AgentPageHeader
        agentId="hobbyist"
        title="Cars, investing & curiosity."
        intro={agentById("hobbyist").description}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-border border-l-2 border-l-hobbyist bg-card p-5">
            <h3 className="font-medium tracking-tight">{item.title}</h3>
            <p className="mt-1 text-sm text-muted">{item.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
