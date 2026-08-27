"use client";

import { Fragment, useState } from "react";

// Minimal highlighter — comments, strings, keywords, matching the four colours
// the design specifies (README §Answer rendering). A real highlighter (Shiki,
// Prism) is hundreds of kilobytes for a handful of short snippets, and the
// design only ever shows three token classes. If the site grows a real code
// section with many languages, swap this for Shiki then.
//
// ponytail: single combined regex, so keywords inside strings or comments are
// never re-matched. Covers Python/JS/TS keywords — extend the list if a snippet
// in another language shows up.

const TOKEN =
  /(#[^\n]*|\/\/[^\n]*|"[^"\n]*"|'[^'\n]*'|`[^`\n]*`|\b(?:for|in|if|elif|else|def|class|return|import|from|while|with|as|not|and|or|None|True|False|lambda|try|except|finally|yield|await|async|const|let|var|function|new|await|export|default|interface|type)\b)/g;

function highlight(code: string): React.ReactNode {
  return code.split(TOKEN).map((part, i) => {
    if (!part) return null;

    if (part.startsWith("#") || part.startsWith("//")) {
      return (
        <span key={i} className="text-code-comment">
          {part}
        </span>
      );
    }

    if (/^["'`]/.test(part)) {
      return (
        <span key={i} className="text-code-string">
          {part}
        </span>
      );
    }

    if (i % 2 === 1) {
      return (
        <span key={i} className="text-code-keyword">
          {part}
        </span>
      );
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function CodeBlock({ caption, code }: { caption: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context, permissions). The code is visible
      // and selectable either way — nothing to recover.
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-divider">
      <div className="flex items-center justify-between border-b border-divider bg-bar px-3 py-[7px]">
        <span className="font-mono text-[9px] tracking-[0.1em] text-ink-label uppercase">
          {caption}
        </span>
        <button
          type="button"
          onClick={copy}
          className="font-mono text-[9px] text-ink-faintest uppercase transition-colors hover:text-green"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="t-code m-0 overflow-x-auto bg-ink px-4 py-4 text-code-fg">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
