import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Page from "@/components/ui/Page";
import BlockList from "@/components/blocks/BlockList";
import { caseStudies, caseStudyBySlug, nextCaseStudy, sectionId } from "@/content/case-studies";

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
      {/* Everything on the page shares the contents-plus-body column, so the
          headline and the section list start on the same line however wide the
          measure is. */}
      <div className="mx-auto w-full max-w-[var(--case-column)]">
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

        {/* The contents list belongs beside the thing it lists. It used to sit
            in the chat rail, where an entry could only ever be a label — here
            each one is an anchor that actually moves the reader. Plain hash
            links: a scroll-spy would need JS to tell you what you can already
            see. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[var(--case-gutter)_minmax(0,var(--case-measure))] lg:gap-14">
          <nav aria-label="Sections of this case study" className="lg:sticky lg:top-5 lg:self-start">
            <span className="t-label block text-ink-label">In this case study</span>
            <ol className="mt-3 mb-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 lg:flex-col lg:gap-0">
              {study.sections.map((section) => (
                <li key={section.label}>
                  <a
                    href={`#${sectionId(section.label)}`}
                    className="block border-l-2 border-transparent py-[5px] pl-2.5 text-[12px] text-ink-muted transition-colors hover:border-green hover:text-green"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex min-w-0 flex-col gap-9">
            {study.sections.map((section) => (
              <section
                key={section.label}
                id={sectionId(section.label)}
                // The page scrolls inside <main>, so an anchor lands flush at the
                // top of the viewport without this.
                className="scroll-mt-5"
              >
                <h2 className="t-label mt-0 mb-3 text-ink-label">{section.label}</h2>
                <BlockList blocks={section.blocks} variant="page" />
              </section>
            ))}
          </div>
        </div>

        <div className="mt-11 min-w-0 border-t border-divider pt-6">
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
      </div>
    </Page>
  );
}
