/** Page shell. Two widths in the design: 860px on Home, 1000px everywhere
 *  else. `animate-rise` is the shared page-transition fade from README §Motion. */
export default function Page({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`animate-rise max-w-[1000px] px-5 pt-8 pb-24 lg:px-14 lg:pt-12 lg:pb-15 ${className}`}>{children}</div>
  );
}
