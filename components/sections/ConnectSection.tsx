// Shared body for /connect AND the connect conversation response. Plainest
// section — no cleverness. All values placeholder per the content policy.
// TODO_ABELITO: replace every href + display value with real contact details.
const links = [
  { label: "Email", value: "placeholder@example.com", href: "mailto:placeholder@example.com" },
  { label: "Resume", value: "Download (PDF)", href: "#" },
  { label: "LinkedIn", value: "linkedin.com/in/placeholder", href: "#" },
  { label: "GitHub", value: "github.com/placeholder", href: "#" },
  { label: "X / Twitter", value: "@placeholder", href: "#" },
  { label: "Instagram", value: "@abelitovisese", href: "#" },
];

export default function ConnectSection() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Connect</h1>
      {/* TODO_ABELITO: real one-line intro */}
      <p className="mt-3 text-muted">The direct ways to reach me.</p>
      <dl className="mt-8 divide-y divide-border border-y border-border">
        {links.map((link) => (
          <div key={link.label} className="flex items-center justify-between py-4">
            <dt className="text-sm text-muted">{link.label}</dt>
            <dd>
              <a href={link.href} className="text-foreground underline-offset-4 hover:underline">
                {link.value}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
