import type { Metadata } from "next";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import ImageSlot from "@/components/ui/ImageSlot";
import AskButton from "@/components/ui/AskButton";
import { inline } from "@/lib/inline";
import {
  DRAFT_NOTICE,
  photoSlots,
  chapters,
  turns,
  interests,
  people,
  beliefs,
  going,
  rightNow,
  RIGHT_NOW_UPDATED,
} from "@/content/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "Where I'm from, what I'm curious about when nobody's paying me, and the people who made me better at this than I'd have managed alone.",
};

export default function AboutPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="/ About"
        title="The part of me that isn't a job title."
        standfirst="Everything else on this site is evidence. This page is context — where I'm from, what I'm curious about when nobody's paying me, and the people who made me better at this than I'd have managed alone."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {photoSlots.map((slot) => (
          <ImageSlot key={slot.prompt} ratio={slot.ratio} prompt={slot.prompt} />
        ))}
      </div>

      <Callout label="Draft — your voice, my reconstruction" className="mt-8">
        {inline(DRAFT_NOTICE)}
      </Callout>

      {chapters.map((chapter) => (
        <section key={chapter.eyebrow} className="mt-11">
          <SectionHead label={chapter.eyebrow} />
          <h2 className="t-h2 mt-0 mb-5 max-w-[24ch] text-ink">{chapter.title}</h2>

          {chapter.imageSlot ? (
            <div className="grid grid-cols-1 gap-9 lg:grid-cols-[1fr_260px]">
              <Prose paragraphs={chapter.paragraphs} />
              <ImageSlot
                ratio={chapter.imageSlot.ratio}
                prompt={chapter.imageSlot.prompt}
                className="self-start"
              />
            </div>
          ) : chapter.twoColumn ? (
            <div className="columns-1 gap-10 lg:columns-2 [column-rule:1px_solid_var(--color-divider)]">
              {chapter.paragraphs.map((p, i) => (
                <p key={i} className="mt-0 mb-4 text-[15px]/[1.72] text-ink-body">
                  {inline(p)}
                </p>
              ))}
            </div>
          ) : (
            <Prose paragraphs={chapter.paragraphs} />
          )}

          {chapter.cards ? (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              {chapter.cards.map((card) => (
                <div key={card.title} className="rounded-lg border border-divider bg-raised p-5">
                  <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-green uppercase">
                    {card.label}
                  </span>
                  <h3 className="mt-3 mb-2 text-[15px] font-semibold tracking-[-0.015em] text-ink">
                    {card.title}
                  </h3>
                  <p className="m-0 text-[12.5px]/[1.6] text-ink-body">{card.body}</p>
                </div>
              ))}
            </div>
          ) : null}

          {chapter.pullquote ? (
            <blockquote className="mt-6 mb-0 border-l-2 border-green pl-[18px]">
              <p className="m-0 max-w-[58ch] font-editorial text-[19px]/[1.55] text-ink-body">
                {chapter.pullquote}
              </p>
            </blockquote>
          ) : null}
        </section>
      ))}

      <section className="mt-11">
        <SectionHead label="The three turns" />
        <p className="mt-0 mb-6 font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
          Moments that changed how I build
        </p>
        <ol className="m-0 flex list-none flex-col gap-0 p-0">
          {turns.map((turn, i) => (
            <li
              key={turn.title}
              className="grid grid-cols-[64px_1fr] gap-6 border-t border-divider py-6"
            >
              <span className="font-editorial text-[26px] leading-none font-light text-vermilion">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mt-0 mb-2 text-[17px] font-semibold tracking-[-0.015em] text-ink">
                  {turn.title}
                </h3>
                <p className="m-0 max-w-[64ch] text-[14.5px]/[1.68] text-ink-body">
                  {inline(turn.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-11">
        <SectionHead label="What I'm into" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {interests.map((item) => (
            <div
              key={item.title}
              className={`rounded-lg border p-5 ${
                item.open
                  ? "border-dashed border-amber-border bg-amber-fill"
                  : "border-divider bg-raised"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="m-0 text-[17px] font-semibold tracking-[-0.015em] text-ink">
                  {item.title}
                </h3>
                <span
                  className={`font-mono text-[9px] tracking-[0.12em] uppercase ${
                    item.open ? "text-amber-ink" : "text-ink-faint"
                  }`}
                >
                  {item.tag}
                </span>
              </div>
              <p
                className={`mt-2.5 mb-0 text-[13px]/[1.65] ${
                  item.open ? "text-amber-ink-deep" : "text-ink-body"
                }`}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-11">
        <SectionHead label="The people" />
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-[1fr_240px]">
          <div>
            <Prose paragraphs={people.paragraphs} />
            <Callout label="Your space" className="mt-4">
              {people.prompt}
            </Callout>
          </div>
          <ImageSlot ratio="1/1" prompt="Your people" className="self-start" />
        </div>
      </section>

      <section className="mt-11">
        <SectionHead label="What I believe" />
        <p className="mt-0 mb-5 font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
          Earned, not read
        </p>
        <div className="grid grid-cols-1 gap-x-10 border-t md:grid-cols-2 border-divider">
          {beliefs.map((belief) => (
            <div key={belief.title} className="border-b border-divider py-5">
              <h3 className="mt-0 mb-2 text-[14.5px] font-semibold text-ink">{belief.title}</h3>
              <p className="m-0 text-[13px]/[1.6] text-ink-body">{belief.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-11">
        <SectionHead label="Where I'm going" />
        <Callout label="Your ambitions — my draft" className="mb-6">
          These are inferred from our conversation, not dictated by you. Rewrite them before
          launch — this is the section a reader will quote back at you in an interview.
        </Callout>
        <h2 className="t-h2 mt-0 mb-6 max-w-[24ch] text-ink">{going.title}</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {going.horizons.map((h) => (
            <div key={h.label} className="rounded-lg border border-divider bg-raised p-5">
              <span className="font-mono text-[9px] font-bold tracking-[0.12em] text-green uppercase">
                {h.label}
              </span>
              <h3 className="mt-3 mb-2 text-[15px] font-semibold tracking-[-0.015em] text-ink">
                {h.title}
              </h3>
              <p className="m-0 text-[12.5px]/[1.6] text-ink-body">{h.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-divider bg-well p-5">
            <span className="t-label text-ink-label">What I want to be known for</span>
            <p className="t-quote-sm mt-2.5 mb-0 text-ink-body">{going.knownFor}</p>
          </div>
          <div className="rounded-lg border border-divider bg-well p-5">
            <span className="t-label text-ink-label">What I&apos;m not chasing</span>
            <p className="t-quote-sm mt-2.5 mb-0 text-ink-body">{going.notChasing}</p>
          </div>
        </div>
      </section>

      <section className="mt-11">
        <div className="mb-[22px] flex items-center gap-3.5">
          <span className="t-label flex-none text-ink-label">Right now</span>
          <span aria-hidden className="h-px flex-1 bg-divider" />
          <span className="flex-none font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
            {RIGHT_NOW_UPDATED}
          </span>
        </div>
        <dl className="m-0 grid grid-cols-[104px_1fr] border-t border-divider">
          {rightNow.map((row) => (
            <div key={row.key} className="contents">
              <dt className="border-b border-divider py-4 font-mono text-[9.5px] tracking-[0.1em] text-ink-label uppercase">
                {row.key}
              </dt>
              <dd className="m-0 border-b border-divider py-4 text-[13.5px]/[1.65] text-ink-body">
                {inline(row.body)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-9 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-divider bg-well px-5 py-4">
        <p className="m-0 max-w-[60ch] text-[13.5px]/[1.6] text-ink-body">
          If any of this is more interesting to you than the case studies, that&apos;s a good sign —
          say hello. The chat will also answer the questions I&apos;d rather you asked me directly.
        </p>
        <AskButton
          topic="good"
          className="t-chip flex-none rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
        >
          Am I actually good? →
        </AskButton>
      </div>
    </Page>
  );
}

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="flex max-w-[68ch] flex-col gap-4">
      {paragraphs.map((p, i) => (
        <p key={i} className="m-0 text-[15px]/[1.72] text-ink-body">
          {inline(p)}
        </p>
      ))}
    </div>
  );
}
