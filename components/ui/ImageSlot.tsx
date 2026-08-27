/** A photo that doesn't exist yet. The design specifies these dashed wells
 *  rather than stock imagery — a visible gap is more honest than a filler photo,
 *  and it tells Abelito exactly what to supply. */
export default function ImageSlot({
  ratio,
  prompt,
  className = "",
}: {
  ratio: string;
  prompt: string;
  className?: string;
}) {
  return (
    <div
      style={{ aspectRatio: ratio }}
      className={`flex w-full flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-border-input bg-well px-4 text-center ${className}`}
    >
      <span className="font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
        Image slot
      </span>
      <span className="text-[12px]/[1.5] text-ink-faint">{prompt}</span>
    </div>
  );
}
