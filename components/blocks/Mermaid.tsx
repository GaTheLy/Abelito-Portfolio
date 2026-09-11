"use client";

import { useEffect, useId, useRef, useState } from "react";
import { mermaidSource, type MermaidKind } from "@/lib/blocks";

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

/** Zoom bounds for the expanded view. It fits the dialog, but never below
 *  0.85 — of the 11px theme, the site's smallest text — scrolling instead, and
 *  never blows a small diagram up past 2.5×. */
const MIN_ZOOM = 0.85;
const MAX_ZOOM = 2.5;

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

/**
 * Inline, a diagram is a preview scaled to fit its column: whatever its width,
 * all of it is visible. Reading it is one click away — the same SVG in a modal
 * <dialog> sized to the screen. Per diagram rather than a wider chat, because
 * only the diagram needs the room, and only while someone is looking at it.
 */
export default function Mermaid({ kind, code, alt, complete = true }: Props) {
  const [state, setState] = useState<State>({ status: "pending" });
  const reactId = useId();
  // Mermaid needs a DOM-id-safe string; React's useId contains colons. useId
  // is stable across renders, so a plain value — a ref can't be read in render.
  const domId = `mmd-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

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

      const source = mermaidSource(kind, code);

      try {
        // parse() throws on bad syntax — check before render so a malformed
        // graph never leaves a half-built SVG in the DOM.
        await mermaid.parse(source);
        const { svg } = await mermaid.render(domId, source);
        if (!cancelled) setState({ status: "ok", svg });
      } catch {
        if (!cancelled) setState({ status: "failed" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, code, complete, domId]);

  function expand() {
    const dialog = dialogRef.current;
    const body = bodyRef.current;
    if (!dialog || !body) return;
    dialog.showModal();
    const svg = body.querySelector("svg");
    const box = svg?.viewBox.baseVal;
    if (!svg || !box?.width) return;
    // Fit the dialog, clamped to [MIN_ZOOM, MAX_ZOOM].
    const pad = parseFloat(getComputedStyle(body).paddingLeft) * 2;
    const fit = Math.min((body.clientWidth - pad) / box.width, (body.clientHeight - pad) / box.height);
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fit));
    svg.style.maxWidth = "none";
    svg.style.width = `${Math.round(box.width * zoom)}px`;
    svg.style.height = `${Math.round(box.height * zoom)}px`;
    svg.style.margin = "auto"; // centres without clipping the start edge when it overflows
    svg.style.flexShrink = "0"; // the body is flex: without this it shrinks past MIN_ZOOM anyway
  }

  // The dialog gets its own copy. Mermaid scopes its styles and arrow markers to
  // the render id, so a verbatim copy would duplicate every id on the page.
  const expandedSvg =
    state.status === "ok" ? state.svg.replaceAll(domId, `${domId}-x`) : "";

  return (
    <figure className="m-0 overflow-hidden rounded-md border border-divider bg-raised-alt2">
      <figcaption className="flex items-center justify-between border-b border-border-faint bg-bar px-3 py-[7px]">
        <span className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase">
          Mermaid · {kind}
        </span>
        {state.status === "ok" ? (
          <button
            type="button"
            onClick={expand}
            aria-haspopup="dialog"
            className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase transition-colors hover:text-green"
          >
            Expand ↗
          </button>
        ) : (
          <span className="font-mono text-[9px] text-ink-faintest uppercase">
            {state.status === "failed" ? "Source" : "…"}
          </span>
        )}
      </figcaption>

      {state.status === "ok" ? (
        <>
          <div
            role="img"
            aria-label={alt}
            title="Expand diagram"
            // A mouse shortcut only — the Expand button is the keyboard path.
            onClick={expand}
            className="mermaid-figure cursor-zoom-in overflow-x-auto px-4 py-4"
            // Mermaid returns an SVG string; there is no node API. Sanitized by
            // mermaid itself under securityLevel:"strict", and the source is
            // schema-constrained before it ever gets here.
            dangerouslySetInnerHTML={{ __html: state.svg }}
          />
          <dialog
            ref={dialogRef}
            aria-label="Expanded diagram"
            // A click on the dialog itself, not its contents, is the backdrop.
            onClick={(e) => {
              if (e.target === e.currentTarget) e.currentTarget.close();
            }}
            className="m-auto h-[min(90vh,900px)] max-h-none w-[min(96vw,1400px)] max-w-none flex-col overflow-hidden rounded-lg border border-divider bg-raised-alt2 p-0 backdrop:bg-ink/40 open:flex"
          >
            <div className="flex flex-none items-center justify-between border-b border-border-faint bg-bar px-4 py-2.5">
              <span className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase">
                Mermaid · {kind}
              </span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase transition-colors hover:text-green"
              >
                Close · Esc
              </button>
            </div>
            <div
              ref={bodyRef}
              role="img"
              aria-label={alt}
              className="flex min-h-0 flex-1 overflow-auto p-6"
              dangerouslySetInnerHTML={{ __html: expandedSvg }}
            />
          </dialog>
        </>
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
