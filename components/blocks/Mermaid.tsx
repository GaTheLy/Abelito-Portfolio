"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { MermaidKind } from "@/lib/blocks";

/** Palette-matched theme. Mermaid's `base` theme is the only one that honours
 *  themeVariables, so everything is set explicitly here rather than tweaked off
 *  a preset. Values come from README §Design tokens. */
const THEME = {
  background: "#FDFCF8",
  primaryColor: "#F7F5EF",
  primaryBorderColor: "#17160F",
  primaryTextColor: "#17160F",
  lineColor: "#B3AC9A",
  secondaryColor: "#EAF0EC",
  tertiaryColor: "#EDE9DF",
  fontFamily: "var(--font-jetbrains-mono), ui-monospace, monospace",
  fontSize: "11px",
} as const;

/** Node classes the authored diagrams use, so content doesn't repeat them.
 *  `emphasis` = the interesting step, `terminal` = the output, `draft` = a
 *  not-yet-real stage (dashed amber, same language as the page callouts). */
const CLASSDEFS = [
  "classDef emphasis fill:#EAF0EC,stroke:#1E4D3B,color:#1E4D3B",
  "classDef terminal fill:#1E4D3B,stroke:#1E4D3B,color:#F7F5EF",
  "classDef draft fill:#FFF6D8,stroke:#C9B96B,color:#8A7A32,stroke-dasharray:4 3",
].join("\n");

interface Props {
  kind: MermaidKind;
  code: string;
  alt: string;
  /** False while the block is still streaming in. Mermaid source is invalid
   *  until complete — rendering a half-arrived graph throws. */
  complete?: boolean;
}

type State =
  | { status: "pending" }
  | { status: "ok"; svg: string }
  | { status: "failed" };

export default function Mermaid({ kind, code, alt, complete = true }: Props) {
  const [state, setState] = useState<State>({ status: "pending" });
  const reactId = useId();
  // Mermaid needs a DOM-id-safe string; React's useId contains colons.
  const domId = useRef(`mmd-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`);

  useEffect(() => {
    if (!complete) return;
    let cancelled = false;

    (async () => {
      // Dynamic import: mermaid is ~1MB and most routes have no diagram.
      const { default: mermaid } = await import("mermaid");

      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: THEME,
        // Model output reaches this renderer. `strict` makes mermaid sanitize
        // its own SVG output and disables click/script directives.
        securityLevel: "strict",
        flowchart: { curve: "linear", padding: 14 },
      });

      const source = `${kind}\n${CLASSDEFS}\n${code}`;

      try {
        // parse() throws on bad syntax — check before render so a malformed
        // graph never leaves a half-built SVG in the DOM.
        await mermaid.parse(source);
        const { svg } = await mermaid.render(domId.current, source);
        if (!cancelled) setState({ status: "ok", svg });
      } catch {
        if (!cancelled) setState({ status: "failed" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, code, complete]);

  return (
    <figure className="m-0 overflow-hidden rounded-md border border-divider bg-raised-alt2">
      <figcaption className="flex items-center justify-between border-b border-border-faint bg-bar px-3 py-[7px]">
        <span className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase">
          Mermaid · {kind}
        </span>
        <span className="font-mono text-[9px] text-ink-faintest uppercase">
          {state.status === "ok" ? "Rendered" : state.status === "failed" ? "Source" : "…"}
        </span>
      </figcaption>

      {state.status === "ok" ? (
        <div
          role="img"
          aria-label={alt}
          className="mermaid-figure overflow-x-auto px-4 py-4"
          // Mermaid returns an SVG string; there is no node API. Sanitized by
          // mermaid itself under securityLevel:"strict", and the source is
          // schema-constrained before it ever gets here.
          dangerouslySetInnerHTML={{ __html: state.svg }}
        />
      ) : state.status === "failed" ? (
        // Degrade to readable source rather than a blank panel.
        <pre className="t-code m-0 overflow-x-auto bg-ink px-4 py-3.5 text-code-fg">
          {`${kind}\n${code}`}
        </pre>
      ) : (
        <div className="px-4 py-8 text-center font-mono text-[9.5px] tracking-[0.06em] text-ink-faintest">
          {complete ? "RENDERING DIAGRAM…" : "WAITING FOR THE FULL DIAGRAM…"}
        </div>
      )}
    </figure>
  );
}
