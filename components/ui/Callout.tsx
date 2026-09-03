/** The dashed amber panel. Used wherever the site is being visibly honest that
 *  something is drafted, inferred, or waiting on real material. These are
 *  supposed to be conspicuous — don't style them down. */
export default function Callout({
  label = "Needs your input",
  children,
  className = "",
}: {
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-dashed border-amber-border bg-amber-fill px-4 py-3.5 ${className}`}
    >
      <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-amber-ink uppercase">
        {label}
      </span>
      <p className="mt-2 mb-0 max-w-[76ch] text-[12.5px]/[1.6] text-amber-ink-deep">{children}</p>
    </div>
  );
}
