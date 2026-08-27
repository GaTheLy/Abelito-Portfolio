import type { Metadata } from "next";
import Image from "next/image";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import AskButton from "@/components/ui/AskButton";
import Callout from "@/components/ui/Callout";
import { contacts, sendMe, RESUME_PATH, RESUME_AVAILABLE } from "@/content/connect";

export const metadata: Metadata = {
  title: "Connect",
  description:
    "Email afvisese@gmail.com — answered the same day, always within two. Based in Malang, Indonesia (GMT+7).",
};

export default function ConnectPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="/ Connect"
        title="The plainest page on the site."
        standfirst="No cleverness here. Email is fastest and I answer it myself — usually the same day, always within two."
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <dl className="m-0 border-t border-divider">
            {contacts.map((row) => (
              // A <div> inside a <dl> may contain ONLY dt/dd — the tag used to
              // sit beside them as a bare <span>, which is invalid markup. It
              // now lives inside the <dd>, which looks identical.
              <div
                key={row.key}
                className="grid grid-cols-[76px_1fr] items-center gap-4 border-b border-divider py-3.5 lg:grid-cols-[104px_1fr]"
              >
                <dt className="font-mono text-[9.5px] tracking-[0.1em] text-ink-label uppercase">
                  {row.key}
                </dt>
                <dd className="m-0 flex min-w-0 items-center justify-between gap-4 text-[14px] text-ink">
                  {row.href ? (
                    <a
                      href={row.href}
                      className="break-words hover:text-green"
                      {...(row.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {row.value}
                    </a>
                  ) : (
                    <span className="break-words">{row.value}</span>
                  )}
                  <span className="flex-none font-mono text-[9px] tracking-[0.08em] text-ink-faint uppercase">
                    {row.tag}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <a
              href="mailto:afvisese@gmail.com"
              className="t-ui rounded-pill bg-green px-[19px] py-[11px] text-surface transition-colors hover:bg-green-dark"
            >
              Email me
            </a>
            {RESUME_AVAILABLE ? (
              <a
                href={RESUME_PATH}
                download
                className="t-ui rounded-pill border border-border-input bg-raised px-[19px] py-[11px] text-ink transition-colors hover:border-green"
              >
                Download résumé (PDF)
              </a>
            ) : (
              <span
                aria-disabled
                className="t-ui cursor-not-allowed rounded-pill border border-dashed border-border-input bg-raised px-[19px] py-[11px] text-ink-faint"
                title="The PDF isn't in the repo yet"
              >
                Résumé (PDF) — not wired up yet
              </span>
            )}
          </div>

          {!RESUME_AVAILABLE ? (
            <Callout className="mt-4">
              Drop <code className="font-mono">Resume_Abelito_AIML_June_2026.pdf</code> into{" "}
              <code className="font-mono">public/</code> and flip{" "}
              <code className="font-mono">RESUME_AVAILABLE</code> in{" "}
              <code className="font-mono">content/connect.ts</code> — the button goes live. It
              stays visibly disabled until then rather than 404-ing a recruiter.
            </Callout>
          ) : null}

          <section className="mt-9 border-t border-divider pt-6">
            <span className="t-label text-ink-label">What&apos;s useful to send me</span>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {sendMe.map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-divider bg-raised px-4 py-4"
                >
                  <div className="text-[13.5px] font-semibold text-ink">{item.title}</div>
                  <p className="mt-2 mb-0 text-[12.5px]/[1.55] text-ink-body">{item.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-lg border border-divider bg-raised">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/assets/abel-1.png"
                alt="Abelito Visese"
                fill
                sizes="300px"
                priority
                className="object-cover"
                style={{ objectPosition: "64% 18%", filter: "grayscale(1) contrast(1.05)" }}
              />
            </div>
            <div className="px-4 py-4">
              <div className="text-[14px] font-semibold text-ink">Abelito Faleyrio Visese</div>
              <div className="mt-1 text-[12.5px]/[1.5] text-ink-body">
                AI Engineer · LLM, NLP &amp; computer vision
              </div>
              <div className="mt-2.5 font-mono text-[9px] tracking-[0.1em] text-green uppercase">
                AWS Certified Developer — Associate
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-divider bg-well px-4 py-4">
            <p className="m-0 text-[12.5px]/[1.55] text-ink-body">
              Not sure what to ask? The chat will answer the awkward ones too — rate, availability,
              and why my current role is two months old.
            </p>
            <AskButton
              topic="rate"
              className="t-chip mt-3 rounded-pill bg-green px-[13px] py-[7px] text-surface transition-colors hover:bg-green-dark"
            >
              Rate &amp; availability →
            </AskButton>
          </div>
        </aside>
      </div>
    </Page>
  );
}
