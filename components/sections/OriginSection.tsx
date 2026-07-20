// Shared body for /origin AND the origin conversation response. The reserved
// voice serif, no agent pill — this is Abelito's own voice, not the system.
export default function OriginSection() {
  return (
    <div className="font-voice">
      <p className="font-sans text-xs uppercase tracking-widest text-muted">Origin</p>
      {/* TODO_ABELITO: replace with the real personal narrative, in Abelito's voice */}
      <h1 className="mt-6 text-3xl font-normal leading-tight tracking-tight sm:text-4xl">
        A placeholder for the personal story.
      </h1>
      <div className="mt-8 space-y-6 text-lg leading-relaxed text-foreground/90">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris.
        </p>
        <p>
          Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
          voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
          cupidatat non proident.
        </p>
        <p>
          Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis
          unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
        </p>
      </div>
    </div>
  );
}
