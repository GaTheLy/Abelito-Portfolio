import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import AskButton from "@/components/ui/AskButton";
import { inline } from "@/lib/inline";
import { roles, education, honours } from "@/content/work";
import type { TopicId } from "@/content/answers";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Eighteen months across Datasaur, KinetixPro, Axrail and the Apple Developer Academy — and what each one changed.",
};

export default function WorkPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="/ Work"
        title="Four rooms, four different ways to be wrong."
        standfirst="Eighteen months, three organisations and one academy — each one taught me a different failure mode. Here's what I actually did, and what each place changed about how I build."
      />

      <div>
        {roles.map((role) => (
          <section
            key={role.company}
            className="grid grid-cols-1 gap-4 lg:grid-cols-[172px_1fr] lg:gap-8 border-t border-divider py-7"
          >
            <div>
              <div
                className={`font-mono text-[9.5px] font-bold tracking-[0.1em] uppercase ${
                  role.current ? "text-vermilion" : "text-ink-label"
                }`}
              >
                {role.dates}
              </div>
              <div className="mt-2 text-[12px]/[1.5] text-ink-faint">{role.place}</div>
              {role.note ? (
                <div className="mt-2 text-[11.5px]/[1.5] text-ink-faint italic">{role.note}</div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="t-h2 m-0 text-ink">{role.company}</h2>
                <span className="text-[13px] text-ink-muted">{role.title}</span>
              </div>

              {role.intro ? (
                <p className="mt-3.5 mb-0 max-w-[64ch] text-[15px]/[1.7] text-ink-body">
                  {role.intro}
                </p>
              ) : null}

              {role.bullets ? (
                <ul className="mt-3.5 mb-0 flex max-w-[64ch] list-disc flex-col gap-3 pl-5 text-[15px]/[1.7] text-ink-body">
                  {role.bullets.map((bullet, i) => (
                    <li key={i}>{inline(bullet)}</li>
                  ))}
                </ul>
              ) : null}

              {role.tags ? (
                <ul className="mt-4 flex list-none flex-wrap gap-[7px] p-0">
                  {role.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-sm border border-divider bg-raised px-[11px] py-1.5 font-mono text-[10.5px] text-ink-body"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}

              {role.products ? (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {role.products.map((product) =>
                    product.href ? (
                      <Link
                        key={product.name}
                        href={product.href}
                        className="rounded-lg border border-divider bg-raised px-3.5 py-3.5 transition-colors hover:border-green"
                      >
                        <ProductBody {...product} cta="Case study →" />
                      </Link>
                    ) : (
                      <AskButton
                        key={product.name}
                        topic={product.ask as TopicId}
                        className="rounded-lg border border-divider bg-raised px-3.5 py-3.5 text-left transition-colors hover:border-green"
                      >
                        <ProductBody {...product} cta="Ask the chat →" />
                      </AskButton>
                    ),
                  )}
                </div>
              ) : null}

              {role.changed ? (
                <blockquote className="mt-5 mb-0 border-l-2 border-green pl-[15px]">
                  <p className="t-quote-sm m-0 max-w-[58ch] text-ink-body">
                    <span className="font-mono text-[9.5px] tracking-[0.1em] text-ink-label uppercase">
                      What it changed:{" "}
                    </span>
                    {role.changed}
                  </p>
                </blockquote>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-11 grid grid-cols-1 gap-10 lg:grid-cols-2 border-t border-divider pt-7">
        <section>
          <span className="t-label text-ink-label">Education &amp; certification</span>
          <div className="mt-4 flex flex-col gap-4">
            {education.map((item) => (
              <div key={item.title}>
                <div className="text-[13.5px] font-semibold text-ink">{item.title}</div>
                <div className="mt-1 text-[13px]/[1.5] text-ink-body">{item.line}</div>
                {item.note ? (
                  <div className="mt-1 font-mono text-[10.5px]/[1.5] text-ink-faint">
                    {item.note}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>

        <section>
          <span className="t-label text-ink-label">Honours</span>
          <div className="mt-4 flex flex-col gap-4">
            {honours.map((item) => (
              <div key={item.title}>
                <div className="text-[13.5px] font-semibold text-ink">{item.title}</div>
                <div className="mt-1 text-[13px]/[1.5] text-ink-body">{item.line}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-divider bg-well px-[15px] py-3.5">
            <p className="m-0 text-[12.5px]/[1.55] text-ink-body">Want the one-page version?</p>
            <Link
              href="/connect"
              className="t-chip mt-2.5 inline-block rounded-pill bg-green px-3 py-[7px] text-surface transition-colors hover:bg-green-dark"
            >
              Résumé &amp; contact →
            </Link>
          </div>
        </section>
      </div>
    </Page>
  );
}

function ProductBody({ name, blurb, cta }: { name: string; blurb: string; cta: string }) {
  return (
    <>
      <div className="text-[13px] font-semibold text-ink">{name}</div>
      <p className="mt-1.5 mb-2.5 text-[11.5px]/[1.5] text-ink-muted">{blurb}</p>
      <span className="font-mono text-[9px] tracking-[0.08em] text-green uppercase">{cta}</span>
    </>
  );
}
