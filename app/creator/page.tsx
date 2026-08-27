import type { Metadata } from "next";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import SectionHead from "@/components/ui/SectionHead";
import AskButton from "@/components/ui/AskButton";
import Callout from "@/components/ui/Callout";
import { inline } from "@/lib/inline";
import { formats, videos, needsEmbeds, HANDLE } from "@/content/creator";

export const metadata: Metadata = {
  title: "Creator",
  description: `AI explained in sixty seconds on TikTok as ${HANDLE} — sourced by Riset, my own research agent.`,
};

export default function CreatorPage() {
  return (
    <Page>
      <PageHeader
        eyebrow={`/ Creator · ${HANDLE}`}
        title="If I can't explain it in sixty seconds, I don't understand it."
        standfirst="I break down AI on TikTok — how RAG actually works, what happened in AI this week, and the honest version of a day as an AI engineer. It started as a way to check my own understanding and turned into the reason I read papers on time."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {formats.map((format) => (
          <div key={format.title} className="rounded-lg border border-divider bg-raised px-5 py-5">
            <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-green uppercase">
              {format.n}
            </span>
            <h2 className="mt-3 mb-2 text-[17px] font-semibold tracking-[-0.015em] text-ink">
              {format.title}
            </h2>
            <p className="m-0 text-[13px]/[1.6] text-ink-body">{inline(format.body)}</p>
          </div>
        ))}
      </div>

      <section className="mt-11">
        <SectionHead label="Recent" />
        {needsEmbeds ? (
          <Callout className="mb-4">
            Drop in the real TikTok embeds — the four tiles below are placeholders sized to 9:16.
          </Callout>
        ) : null}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {videos.map((video) => (
            <div
              key={video.caption}
              className="flex aspect-[9/16] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-input bg-well px-3 text-center"
            >
              <span className="font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
                TikTok embed
              </span>
              <span className="text-[12px]/[1.5] text-ink-faint">{video.caption}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-11 grid grid-cols-1 gap-5 md:grid-cols-2 border-t border-divider pt-7">
        <div className="rounded-lg border border-divider bg-raised px-5 py-5">
          <span className="t-label text-ink-label">The pipeline behind it</span>
          <p className="mt-3 mb-4 text-[13.5px]/[1.65] text-ink-body">
            The channel and the engineering aren&apos;t separate hobbies.{" "}
            <strong className="font-semibold">Riset</strong> ingests arXiv and AI news, retrieves
            hybrid, scores what&apos;s worth covering and drafts an angle — so the thing that finds
            my content is itself a piece of my portfolio.
          </p>
          <AskButton
            topic="rag"
            className="t-chip rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
          >
            How Riset works →
          </AskButton>
        </div>

        <div className="rounded-lg border border-divider bg-well px-5 py-5">
          <span className="t-label text-ink-label">Why it exists</span>
          <p className="t-quote mt-3 mb-0 text-ink-body">
            Teaching it out loud is how I find out whether I actually understood it. The channel is
            a debugging tool that happens to have an audience.
          </p>
        </div>
      </section>
    </Page>
  );
}
