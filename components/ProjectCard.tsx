import Link from "next/link";
import type { Project } from "@/content/projects";

const SHELL =
  "flex flex-col gap-2.5 rounded-lg border border-divider bg-raised px-[21px] py-5 text-left transition-colors hover:border-green";

/**
 * One card, two surfaces. On Home it shows the metric and a short stack line;
 * on /projects it shows the full CTA. All projects are case studies now — every
 * card is a real Link.
 */
export default function ProjectCard({
  project,
  variant = "index",
}: {
  project: Project;
  variant?: "feature" | "index";
}) {
  return (
    <Link href={`/projects/${project.slug}`} className={SHELL}>
      <div className="flex items-start justify-between gap-3">
        <span className="t-card-title text-ink">{project.name}</span>
        <span className="mt-0.5 flex-none font-mono text-[9.5px] tracking-[0.08em] text-green uppercase">
          {project.badge}
        </span>
      </div>

      {variant === "index" ? (
        <span className="font-mono text-[9.5px] tracking-[0.08em] text-ink-faint uppercase">
          {project.meta}
        </span>
      ) : null}

      <p className="m-0 text-[13.5px]/[1.55] text-ink-body">{project.blurb}</p>

      {variant === "index" ? (
        <>
          <span className="font-mono text-[9.5px]/[1.5] text-ink-faint">
            {project.stack.join(" · ")}
          </span>
          <span className="mt-0.5 font-mono text-[10px] tracking-[0.06em] text-ink-label uppercase">
            {project.metric} · Read the case study →
          </span>
        </>
      ) : (
        <div className="mt-0.5 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.04em] text-ink-label uppercase">
          <span>{project.metric}</span>
          <span className="text-right">{project.stack.slice(0, 3).join(" · ")}</span>
        </div>
      )}
    </Link>
  );
}
