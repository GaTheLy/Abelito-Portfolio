import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Page from "@/components/ui/Page";
import BlockList from "@/components/blocks/BlockList";
import AskButton from "@/components/ui/AskButton";
import { caseStudies, caseStudyBySlug, nextCaseStudy } from "@/content/case-studies";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) return {};
  return { title: study.h1.replace(/[.”"]+$/, ""), description: study.standfirst };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudyBySlug(slug);
  if (!study) notFound();

  const next = nextCaseStudy(slug);

  return (
    <Page className="!pt-10">
      <Link
        href="/projects"
        className="mb-5 inline-block font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase hover:text-green"
      >
        ← / Projects / {slug.replace(/-/g, "-")}
      </Link>

      <h1 className="t-h1-case m-0 mb-[18px] max-w-[20ch] text-ink">{study.h1}</h1>
      <p className="t-standfirst mt-0 mb-[26px] max-w-[60ch] text-ink-body">{study.standfirst}</p>

      {/* Scan layer only — deliberately does not repeat role or stack. */}
      <dl className="mb-[34px] grid grid-cols-2 gap-5 border-y md:grid-cols-4 border-divider py-[18px]">
        {study.meta.map((cell) => (
          <div key={cell.key}>
            <dt className="font-mono text-[9.5px] tracking-[0.1em] text-ink-label uppercase">
              {cell.key}
            </dt>
            <dd className="m-0 mt-1.5 text-[13px]/[1.45] text-ink">{cell.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[106px_1fr] lg:gap-6">
        {study.sections.map((section) => (
          <div key={section.label} className="contents">
            <h2 className="t-label m-0 pt-[5px] text-ink-label">{section.label}</h2>
            <div className="max-w-[64ch] min-w-0">
              <BlockList blocks={section.blocks} variant="page" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-11 flex items-center justify-between gap-5 border-t border-divider pt-6">
        <div className="min-w-0">
          <div className="font-mono text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">
            Next case study
          </div>
          <Link
            href={`/projects/${next.slug}`}
            className="mt-[7px] block text-[17px] font-semibold tracking-[-0.015em] text-ink hover:text-green"
          >
            {next.h1.replace(/[.]$/, "")} →
          </Link>
        </div>
        <AskButton
          topic={study.questions[0].topic}
          label={study.questions[0].label}
          className="t-ui flex-none rounded-pill border border-green bg-raised px-4 py-[9px] text-green transition-colors hover:bg-green-tint"
        >
          {study.questions[0].label} →
        </AskButton>
      </div>
    </Page>
  );
}
