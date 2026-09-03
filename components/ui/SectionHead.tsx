import Link from "next/link";

/** The recurring section header: a mono label, a hairline that eats the
 *  remaining width, and an optional text link on the right. */
export default function SectionHead({
  label,
  href,
  action,
}: {
  label: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-[22px] flex items-center gap-3.5">
      <span className="t-label flex-none text-ink-label">{label}</span>
      <span aria-hidden className="h-px flex-1 bg-divider" />
      {href && action ? (
        <Link href={href} className="t-ui flex-none text-ink-muted hover:text-green">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
