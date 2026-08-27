"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/content/projects";
import type { TopicId } from "@/content/answers";
import { useChat } from "@/components/chat/context";

const SHELL =
  "flex flex-col gap-2.5 rounded-lg border border-divider bg-raised px-[21px] py-5 text-left transition-colors hover:border-green";

/**
 * One card, two surfaces. On Home it shows the metric and a short stack line;
 * on /projects it shows the derived CTA. Either way the destination comes from
 * the record: a case study if `deep`, otherwise a chat answer (or /work).
 */
export default function ProjectCard({
  project,
  variant = "index",
}: {
  project: Project;
  variant?: "feature" | "index";
}) {
  const router = useRouter();
  const { ask } = useChat();

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="t-card-title text-ink">{project.name}</span>
        <span
          className={`mt-0.5 flex-none font-mono text-[9.5px] tracking-[0.08em] uppercase ${
            project.deep ? "text-green" : "text-ink-faint"
          }`}
        >
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
            {project.metric} · {project.deep ? "Read the case study →" : "Ask the chat →"}
          </span>
        </>
      ) : (
        <div className="mt-0.5 flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.04em] text-ink-label uppercase">
          <span>{project.metric}</span>
          <span className="text-right">{project.stack.slice(0, 3).join(" · ")}</span>
        </div>
      )}
    </>
  );

  // A real link when there's a real destination — right-click, middle-click and
  // "open in new tab" all work, which they wouldn't on a button.
  if (project.deep) {
    return (
      <Link href={`/projects/${project.slug}`} className={SHELL}>
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={SHELL}
      onClick={() =>
        project.ask === "work" ? router.push("/work") : ask((project.ask ?? "fallback") as TopicId)
      }
    >
      {body}
    </button>
  );
}
