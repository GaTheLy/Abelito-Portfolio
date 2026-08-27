/** The standard page opening: a mono breadcrumb eyebrow, an editorial H1, and
 *  a standfirst. Case studies use their own (wider H1, meta strip). */
export default function PageHeader({
  eyebrow,
  title,
  standfirst,
}: {
  eyebrow: string;
  title: string;
  standfirst: string;
}) {
  return (
    <header className="mb-9">
      <p className="mt-0 mb-5 font-mono text-[10.5px] tracking-[0.1em] text-ink-faint uppercase">
        {eyebrow}
      </p>
      <h1 className="t-h1-page m-0 max-w-[20ch] text-ink">{title}</h1>
      <p className="t-standfirst mt-[18px] mb-0 max-w-[62ch] text-ink-body">{standfirst}</p>
    </header>
  );
}
