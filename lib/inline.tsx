import { Fragment } from "react";

// Inline markup for block `text` fields: **bold**, *italic*, `code`.
//
// Deliberately not a markdown library. The design only ever uses these three,
// and this content includes LLM output — a real markdown parser would mean a
// dependency plus an HTML injection surface. This produces React nodes and
// never touches dangerouslySetInnerHTML, so untrusted text stays inert.

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`]+`)/g;

export function inline(text: string): React.ReactNode {
  const parts = text.split(TOKEN);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded-xs bg-well px-[5px] py-px font-mono text-[12px] text-ink"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }

    return <Fragment key={i}>{part}</Fragment>;
  });
}
