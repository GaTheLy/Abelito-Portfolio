import Link from "next/link";
import Image from "next/image";
import SectionHead from "@/components/ui/SectionHead";
import ProjectCard from "@/components/ProjectCard";
import { projects, caseStudySlugs } from "@/content/projects";
import { BYLINE, HEADLINE, STANDFIRST, proof, routeRows, skills } from "@/content/home";

const PILLARS = [
  {
    label: "WRITING",
    body: "Essays on Medium — personal rather than technical, and synced automatically.",
    action: "Read the essays →",
    href: "/writing",
  },
  {
    label: "CREATOR",
    body: "Breaking down AI on TikTok as @abelitovisese.",
    action: "See the channel →",
    href: "/creator",
  },
  {
    label: "ABOUT ME",
    body: "Where I'm from, what I'm into, and the people behind the work.",
    action: "The personal story →",
    href: "/about",
  },
];

// Home is two stacked bands rather than one padded column, because the second
// band carries its own tint edge-to-edge. Horizontal padding therefore lives on
// each band, not on the page wrapper.
const PAD = "px-5 lg:px-8 xl:px-11";

export default function HomePage() {
  const featured = caseStudySlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="animate-rise mx-auto max-w-[860px] pb-20">
      {/* ── Band 1: byline, headline, actions, proof ─────────────────────── */}
      <div className={`${PAD} pt-8 lg:pt-11`}>
        <div className="mb-5 flex items-center gap-3">
          <p className="m-0 font-mono text-[10.5px]/[1.5] tracking-[0.1em] text-ink-faint uppercase">
            {BYLINE[0]}
            <br />
            {BYLINE[1]}
          </p>
        </div>

        <h1 className="t-h1-home m-0 mb-[18px] max-w-[19ch] text-ink">{HEADLINE}</h1>

        <p className="mt-0 mb-[22px] max-w-[62ch] text-[16.5px]/[1.58] text-ink-body">
          {STANDFIRST}
        </p>

        <div className="mb-6 flex flex-wrap gap-2.5">
          <Link
            href="/connect"
            className="rounded-pill bg-green px-[19px] py-[11px] text-[13.5px] font-medium text-surface transition-colors hover:bg-green-dark"
          >
            Book 20 minutes
          </Link>
          <Link
            href="/projects"
            className="rounded-pill border border-border-input bg-raised px-[19px] py-[11px] text-[13.5px] font-medium text-ink transition-colors hover:border-green"
          >
            See the projects
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 border-t border-divider pt-5 md:grid-cols-4">
          {proof.map((item) => (
            <div key={item.value}>
              <div className="text-[28px] leading-none tracking-[-0.035em] text-green">
                {item.value}
              </div>
              <p className="mt-2 mb-0 font-mono text-[10.5px]/[1.4] whitespace-pre-line text-ink-label">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Band 2: the route rail, with the figure standing in it ───────── */}
      <div
        className={`mt-[26px] grid items-stretch gap-[30px] border-t border-divider bg-well ${PAD} pt-[26px] lg:grid-cols-[minmax(0,460px)_1fr]`}
      >
        <div className="relative z-[2] flex flex-col gap-[22px] pb-[30px]">
          <div>
            <div className="mb-3.5 flex items-baseline gap-3">
              <span className="font-mono text-[9.5px] font-bold tracking-[0.18em] text-ink-label uppercase">
                The route here
              </span>
              <span aria-hidden className="block h-px flex-1 bg-divider" />
              <span className="font-mono text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">
                Latest first
              </span>
            </div>

            <div className="relative">
              {/* The thread runs behind the dots, stopping short at both ends so
                  it reads as a rail rather than a border. */}
              <span
                aria-hidden
                className="absolute top-3.5 bottom-5 left-[3px] w-px bg-border-input"
              />
              <ol className="relative m-0 flex list-none flex-col p-0">
                {routeRows.map((row) => (
                  <li
                    key={row.org}
                    className="grid grid-cols-[8px_92px_1fr] items-baseline gap-x-4 border-b border-divider py-[17px] last:border-b-0"
                  >
                    <span
                      aria-hidden
                      className={`block size-[7px] self-center rounded-full ${
                        row.current ? "bg-vermilion" : "bg-border-input"
                      }`}
                    />
                    <span
                      className={`font-mono text-[9px] font-bold tracking-[0.12em] uppercase ${
                        row.current ? "text-vermilion" : "text-ink-label"
                      }`}
                    >
                      {row.date}
                    </span>
                    <span className="text-[13px]/[1.45] text-ink">
                      <strong className="font-semibold">{row.org}</strong> — {row.what}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] tracking-[0.06em] text-ink-faint uppercase">
                Showing {routeRows.length} most recent
              </span>
              <Link href="/work" className="t-ui text-green hover:text-green-dark">
                Full history →
              </Link>
            </div>
          </div>

          <ul className="m-0 flex list-none flex-wrap gap-[7px] p-0">
            {skills.map((skill) => (
              <li
                key={skill}
                className="rounded-xs border border-divider bg-surface px-[9px] py-[5px] font-mono text-[10px] text-ink-label"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>

        {/* Standing in the band, flush with its bottom edge. The drop-shadow
            follows the silhouette rather than a box — only possible because the
            asset has real alpha. Hidden below lg, where the band is one column
            and a 300px figure would just push the rail off screen. */}
        <Image
          src="/assets/abel-2-cutout.webp"
          alt="Abelito Visese, arms folded, in a batik shirt"
          width={750}
          height={1275}
          priority
          sizes="(max-width: 1559px) 300px, 400px"
          className="h-auto self-end justify-self-end max-lg:hidden lg:mr-[-14px] lg:w-[300px] min-[1560px]:w-[400px]"
          style={{ filter: "drop-shadow(-18px 10px 26px rgba(23,22,15,.16))" }}
        />
      </div>

      {/* ── Below the fold ───────────────────────────────────────────────── */}
      <section className={`${PAD} mt-11`}>
        <SectionHead label="Four I'd show you first" href="/projects" action="All nine →" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {featured.map((project) => (
            <ProjectCard key={project.slug} project={project} variant="feature" />
          ))}
        </div>
      </section>

      <section
        className={`${PAD} mt-11 grid grid-cols-1 gap-9 border-t border-divider pt-7 md:grid-cols-3`}
      >
        {PILLARS.map((pillar) => (
          <div key={pillar.label}>
            <span className="t-label text-ink-label">{pillar.label}</span>
            <p className="mt-2.5 mb-3 text-[13.5px]/[1.55] text-ink-body">{pillar.body}</p>
            <Link href={pillar.href} className="t-ui text-green hover:text-green-dark">
              {pillar.action}
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
