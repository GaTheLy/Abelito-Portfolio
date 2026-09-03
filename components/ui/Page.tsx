/** Page shell. Two widths in the design: 860px on Home, 1000px everywhere
 *  else. `animate-rise` is the shared page-transition fade from README §Motion.
 *
 *  Always centred. Left-pinned is what turned a collapsed chat panel into a
 *  block of dead margin on one side only — the amount of white space was fine,
 *  its position wasn't.
 *
 *  `wide` opts into `--page-wide`, which grows to 1180px when no panel is
 *  competing for the width (app/globals.css). Only the case study takes it: it
 *  has a gutter and diagrams that can spend the room. The other pages are grids
 *  designed at 1000 and would only gain slack.
 *
 *  The horizontal padding steps down below `xl`: at 1024–1279 the full 56px
 *  gutters were costing the content column more than they bought it. */
export default function Page({
  children,
  className = "",
  wide = false,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`animate-rise mx-auto max-w-[var(--page-wide)] px-5 pt-8 pb-24 lg:px-9 lg:pt-12 lg:pb-20 xl:px-14 ${className}`}
    >
      {children}
    </div>
  );
}
