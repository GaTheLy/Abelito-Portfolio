import Link from "next/link";
import Page from "@/components/ui/Page";

export default function NotFound() {
  return (
    <Page>
      <p className="mt-0 mb-5 font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">
        / 404
      </p>
      <h1 className="t-h1-page m-0 max-w-[18ch] text-ink">
        There&apos;s nothing at this address.
      </h1>
      <p className="t-standfirst mt-[18px] mb-7 max-w-[56ch] text-ink-body">
        Which is a real answer, not a broken page. The chat on the right knows the whole site —
        or start from one of these.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {[
          { href: "/", label: "Home" },
          { href: "/projects", label: "All projects" },
          { href: "/work", label: "Work history" },
          { href: "/connect", label: "Connect" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="t-ui rounded-pill border border-border-input bg-raised px-[19px] py-[11px] text-ink transition-colors hover:border-green"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </Page>
  );
}
