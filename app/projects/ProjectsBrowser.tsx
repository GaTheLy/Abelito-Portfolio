"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProjectCard from "@/components/ProjectCard";
import { useChat } from "@/components/chat/context";
import { routeQuestion } from "@/content/answers";
import {
  CATEGORIES,
  SORTS,
  selectProjects,
  projects,
  type Category,
  type SortId,
} from "@/content/projects";

const CHIP = "t-chip rounded-pill border px-[11px] py-1.5 transition-colors";
const ON = "border-green bg-green text-surface";
const OFF = "border-border-input bg-raised-alt text-ink-body hover:border-green";

/**
 * Search, filter and sort over the project array. Every count on the page is
 * derived — README is explicit that this list is going to grow, so nothing here
 * may be hardcoded.
 *
 * State lives in the URL (README open item 6) so a filtered view is shareable.
 */
export default function ProjectsBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const { ask } = useChat();

  const query = params.get("q") ?? "";
  const cat = (CATEGORIES.find((c) => c === params.get("cat")) ?? "All") as Category;
  const sort = (SORTS.find((s) => s.id === params.get("sort"))?.id ?? "new") as SortId;
  const deepOnly = params.get("deep") === "1";

  /** Write state to the URL. `replace` so filtering doesn't fill the back stack. */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
      const qs = next.toString();
      router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
    },
    [params, router],
  );

  const results = selectProjects({ query, cat, sort, deepOnly });
  const filtering = Boolean(query.trim()) || cat !== "All" || deepOnly;
  const sortLabel = SORTS.find((s) => s.id === sort)?.label ?? "Newest";

  const resultLabel = filtering
    ? `${results.length} ${results.length === 1 ? "project matches" : "projects match"}`
    : `All ${projects.length} projects`;

  return (
    <>
      <div className="mb-3.5 rounded-xl border border-divider bg-raised px-[18px] pt-4 pb-[15px]">
        <div className="flex items-center gap-3 rounded-lg border border-border-input bg-raised-alt px-[13px] py-2.5 focus-within:border-green">
          <label
            htmlFor="project-search"
            className="font-mono text-[9px] font-bold tracking-[0.12em] text-green uppercase"
          >
            Find
          </label>
          <input
            id="project-search"
            type="search"
            value={query}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search projects — a technology, a metric, a problem…"
            className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setParam("q", null)}
              className="font-mono text-[9px] tracking-[0.12em] text-ink-faint uppercase hover:text-green"
            >
              Clear
            </button>
          ) : null}
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Group label="Category">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => setParam("cat", c === "All" ? null : c)}
                className={`${CHIP} ${cat === c ? ON : OFF}`}
              >
                {c}
              </button>
            ))}
          </Group>

          <Group label="Sort">
            {SORTS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={sort === s.id}
                onClick={() => setParam("sort", s.id === "new" ? null : s.id)}
                className={`${CHIP} ${sort === s.id ? ON : OFF}`}
              >
                {s.label}
              </button>
            ))}
          </Group>

          {/* Kept visually apart from the sort chips on purpose — when it sat in
              that row it read as a fifth sort option. */}
          <Group label="Depth" className="ml-auto">
            <button
              type="button"
              aria-pressed={deepOnly}
              onClick={() => setParam("deep", deepOnly ? null : "1")}
              className={`${CHIP} ${deepOnly ? ON : OFF}`}
            >
              Case studies only
            </button>
          </Group>
        </div>
      </div>

      <div className="mb-3.5 flex items-center gap-3.5">
        <span className="t-label flex-none text-ink-label">{resultLabel}</span>
        <span aria-hidden className="h-px flex-1 bg-divider" />
        <span className="flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
          Sorted by {sortLabel}
        </span>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {results.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border-input px-6 py-12 text-center">
          <p className="t-standfirst m-0 text-ink">
            Nothing here matches that — which is a real answer, not a broken page.
          </p>
          <p className="mx-auto mt-2.5 mb-5 max-w-[52ch] text-[13.5px]/[1.6] text-ink-body">
            The chat searches everything on the site, not just this list — it may still know
            what you&apos;re after.
          </p>
          <div className="flex flex-wrap justify-center gap-[7px]">
            <button
              type="button"
              onClick={() => ask(routeQuestion(query), query.trim() || undefined)}
              className="t-chip rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
            >
              Ask the chat instead →
            </button>
            <button
              type="button"
              onClick={() => router.replace("/projects", { scroll: false })}
              className="t-chip rounded-pill border border-border-input bg-raised-alt px-[13px] py-[7px] text-ink-body transition-colors hover:border-green"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Group({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-ink-label uppercase">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
