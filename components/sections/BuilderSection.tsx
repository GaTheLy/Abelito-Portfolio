import AgentPageHeader from "@/components/AgentPageHeader";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import { agentById } from "@/lib/orchestrator/agents";

// Shared body for /builder AND the builder conversation response.
export default function BuilderSection() {
  return (
    <div>
      {/* TODO_ABELITO: real Builder title */}
      <AgentPageHeader agentId="builder" title="Things I've built." intro={agentById("builder").description} />
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
