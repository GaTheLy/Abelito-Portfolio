import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import AskButton from "@/components/ui/AskButton";
import Callout from "@/components/ui/Callout";
import { essays, needsUrls } from "@/content/writing";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on retrieval that can be checked, evaluation that survives real users, and the parts of ML engineering nobody puts in the tutorial.",
};

export default function WritingPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="/ Writing"
        title="Things I only understood after writing them down."
        standfirst="Essays live off-site, where the readers already are. Short version of what I write about: retrieval that can be checked, evaluation that survives contact with a real user, and the parts of ML engineering nobody puts in the tutorial."
      />

      {needsUrls ? (
        <Callout className="mb-8">
          Send me the real Medium / Substack URLs and titles and I&apos;ll wire these up. Until
          then each essay offers the chat or its case study instead of a dead link.
        </Callout>
      ) : null}

      <div>
        {essays.map((essay) => (
          <article
            key={essay.title}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_148px] lg:gap-8 border-t border-divider py-6"
          >
            <div className="min-w-0">
              <h2 className="t-essay m-0 max-w-[34ch] text-ink">
                {essay.url ? (
                  <a href={essay.url} className="hover:text-green">
                    {essay.title}
                  </a>
                ) : (
                  essay.title
                )}
              </h2>
              <p className="mt-2.5 mb-3 max-w-[64ch] text-[13.5px]/[1.6] text-ink-body">
                {essay.blurb}
              </p>
              <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {essay.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-divider bg-raised px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-ink-label uppercase"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <span className="font-mono text-[9px] tracking-[0.08em] text-ink-faint uppercase">
                {essay.status}
              </span>
              {essay.action.href ? (
                <Link
                  href={essay.action.href}
                  className="t-chip rounded-pill border border-border-input bg-raised-alt px-[11px] py-1.5 text-ink-body transition-colors hover:border-green"
                >
                  {essay.action.label}
                </Link>
              ) : (
                <AskButton
                  topic={essay.action.topic!}
                  className="t-chip rounded-pill border border-border-input bg-raised-alt px-[11px] py-1.5 text-ink-body transition-colors hover:border-green"
                >
                  {essay.action.label}
                </AskButton>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-divider bg-well px-5 py-4">
        <p className="m-0 max-w-[56ch] text-[13.5px]/[1.6] text-ink-body">
          The chat on the right has read all of it. If you&apos;d rather ask than read, ask —
          you&apos;ll get the same argument, shorter.
        </p>
        <AskButton
          topic="evals"
          className="t-chip flex-none rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
        >
          Ask about evaluation →
        </AskButton>
      </div>
    </Page>
  );
}
