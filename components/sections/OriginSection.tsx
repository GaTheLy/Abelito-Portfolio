// Shared body for /origin AND the origin conversation response. The reserved
// voice serif, no agent pill — this is Abelito's own voice, not the system.
export default function OriginSection() {
  return (
    <div className="font-voice">
      <p className="font-sans text-xs uppercase tracking-widest text-muted">Origin</p>
      {/* TODO_ABELITO: DEMO narrative — generic placeholder, not real biography.
          Replace with the real personal story, in your own voice. */}
      <h1 className="mt-6 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
        The person behind the work.
      </h1>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground/90">
        <p>
          I started where a lot of engineers start — taking things apart to see how they worked,
          then getting impatient to build my own. Somewhere along the way that curiosity pointed
          itself at language and machine learning, and it hasn’t really let go since.
        </p>
        <p>
          What I care about most isn’t the model — it’s the system around it: the interface, the
          feedback loop, the small decisions that make something people actually keep using. Most
          of the work I’m proud of looks quiet from the outside and took a lot of iterations to
          get there.
        </p>
        <p>
          Away from the screen it’s cars, markets, and an endless list of “wait, why does that
          work?” questions — the same curiosity, pointed somewhere new.
        </p>
      </div>
    </div>
  );
}
