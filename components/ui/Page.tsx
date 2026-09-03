/** Page shell. `animate-rise` is the shared page-transition fade from
 *  README §Motion.
 *
 *  Every page is held to `--case-column` — the same contents-gutter + gap +
 *  measure column the case study reads in. That token is derived from
 *  `--case-gutter` and `--case-measure`, both registered with `@property` and
 *  transitioned in app/globals.css, so the column widens and narrows on the
 *  same curve as the chat drawer instead of snapping mid-slide.
 *
 *  The outer div keeps `--page-wide` as the padding box; the inner div is the
 *  reading column. The case study nests its own identical max-width, which is
 *  now a no-op rather than a second source of truth.
 *
 *  The horizontal padding steps down below `xl`: at 1024–1279 the full 56px
 *  gutters were costing the content column more than they bought it. */
export default function Page({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`animate-rise mx-auto max-w-[var(--page-wide)] px-5 pt-8 pb-24 lg:px-9 lg:pt-12 lg:pb-20 xl:px-14 ${className}`}
    >
      <div className="mx-auto w-full max-w-[var(--case-column)]">{children}</div>
    </div>
  );
}
