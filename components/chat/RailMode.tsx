"use client";

import Link from "next/link";
import type { RailContext } from "@/lib/rail";
import Transcript from "./Transcript";
import { useChat } from "./context";

/**
 * The 340px column beside a case study, and the only route other than Home that
 * still has a panel — everywhere else it was a launcher pretending to be a chat.
 *
 * Scoped to this project: the knowledge base narrows to the page on the left,
 * the answer comes back as prose because nothing else fits in 340px, and it
 * renders here rather than throwing the reader back to Home mid-thought.
 */
export default function RailMode({ context }: { context: RailContext }) {
  const { turns, sessionScope } = useChat();
  // A conversation held on Home, or on another case study, is not a conversation
  // about this one — the rail stays empty until asked here.
  const mine = sessionScope === context.slug ? turns : [];

  return (
    <Transcript turns={mine} variant="rail" className="px-[18px] pt-[18px] pb-3">
      {/* The only furniture in the scoped rail: the ask bar below does the
          talking, and the header states the scope. */}
      <Link
        href="/connect"
        className="mt-auto border-t border-divider pt-[15px] text-[12px] text-ink-faint transition-colors hover:text-green"
      >
        Seen enough? Book 20 minutes →
      </Link>
    </Transcript>
  );
}
