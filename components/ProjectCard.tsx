"use client";

import Link from "next/link";
import { useContext } from "react";
import { overviewIndex, type Project } from "@/lib/projects";
import { OrchestratorContext } from "./orchestrator/context";

// Dual behaviour: inside the conversation it opens the case study as the next
// response (embed); on a real page it's a normal route link. Same look either way.
export default function ProjectCard({ project }: { project: Project }) {
  const api = useContext(OrchestratorContext);
  const className =
    "block w-full rounded-md border border-border border-l-2 border-l-builder bg-card p-5 text-left transition-colors hover:border-foreground/30";
  const inner = (
    <>
      <h3 className="font-medium tracking-tight">{project.title}</h3>
      <p className="mt-1 text-sm text-muted">{project.tagline}</p>
    </>
  );

  if (api) {
    return (
      <button
        type="button"
        onClick={() =>
          api.open({ kind: "chunk", slug: project.slug, index: overviewIndex(project) }, project.title)
        }
        className={className}
      >
        {inner}
      </button>
    );
  }
  return (
    <Link href={`/builder/${project.slug}`} className={className}>
      {inner}
    </Link>
  );
}
