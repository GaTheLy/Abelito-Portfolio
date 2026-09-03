import type { Metadata } from "next";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import AskButton from "@/components/ui/AskButton";
import Callout from "@/components/ui/Callout";
import { fetchMediumPosts, MEDIUM_PROFILE, type MediumPost } from "@/lib/medium";
import { WRITING_INTRO, knownPosts, unwritten } from "@/content/writing";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Essays on Medium — personal rather than technical. Attachment, growing up, and the things harder to be precise about than a benchmark.",
};

// Synced from Medium's RSS feed, revalidated hourly: publishing a post updates
// the site without a deploy.
export const revalidate = 3600;

function formatDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function WritingPage() {
  const live = await fetchMediumPosts();
  // Falling back to the mirrored list keeps the page honest and working when
  // the feed is unreachable; it is never used to invent a post.
  const posts: MediumPost[] = live ?? knownPosts;

  return (
    <Page>
      <PageHeader
        eyebrow="/ Writing"
        title="Things I only understood after writing them down."
        standfirst={WRITING_INTRO}
      />

      <div className="mb-4 flex items-center gap-3.5">
        <span className="t-label flex-none text-ink-label">
          {posts.length} {posts.length === 1 ? "essay" : "essays"}
        </span>
        <span aria-hidden className="h-px flex-1 bg-divider" />
        <span className="flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
          {live ? "Synced from Medium" : "Showing last known list"}
        </span>
      </div>

      <div>
        {posts.map((post) => (
          <article
            key={post.url}
            className="grid grid-cols-1 gap-4 border-t border-divider py-6 lg:grid-cols-[1fr_148px] lg:gap-8"
          >
            <div className="min-w-0">
              <h2 className="t-essay m-0 max-w-[34ch] text-ink">
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-green"
                >
                  {post.title}
                </a>
              </h2>
              <p className="mt-2.5 mb-3 max-w-[64ch] text-[13.5px]/[1.6] text-ink-body">
                {post.excerpt}
              </p>
              {post.tags.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {post.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-sm border border-divider bg-raised px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] text-ink-label uppercase"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <span className="font-mono text-[9px] tracking-[0.08em] text-ink-faint uppercase">
                {formatDate(post.date)}
              </span>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="t-chip rounded-pill border border-border-input bg-raised-alt px-[11px] py-1.5 text-ink-body transition-colors hover:border-green"
              >
                Read on Medium →
              </a>
            </div>
          </article>
        ))}
      </div>

      {unwritten.length > 0 ? (
        <Callout label="Not written yet" className="mt-8">
          The site talks about evaluation, hybrid retrieval and the Manna state machine in a few
          places, but those essays don&apos;t exist yet — {unwritten.join(" · ")} They&apos;ll
          appear here automatically once they&apos;re published; remove them from{" "}
          <code className="font-mono">content/writing.ts</code> as they land.
        </Callout>
      ) : null}

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-divider bg-well px-5 py-4">
        <p className="m-0 max-w-[56ch] text-[13.5px]/[1.6] text-ink-body">
          The technical thinking that hasn&apos;t made it into an essay yet is all in the chat —
          ask it about evaluation or retrieval and you&apos;ll get the argument, shorter.
        </p>
        <div className="flex flex-none flex-wrap gap-2.5">
          <AskButton
            topic="evals"
            className="t-chip rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
          >
            Ask about evaluation →
          </AskButton>
          <a
            href={MEDIUM_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="t-chip rounded-pill border border-border-input bg-raised-alt px-[13px] py-[7px] text-ink-body transition-colors hover:border-green"
          >
            All on Medium →
          </a>
        </div>
      </div>
    </Page>
  );
}
