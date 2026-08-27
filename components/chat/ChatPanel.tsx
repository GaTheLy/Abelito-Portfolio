"use client";

import { usePathname } from "next/navigation";
import { railContext } from "@/content/case-studies";
import FullMode from "./FullMode";
import RailMode from "./RailMode";
import ChatInput from "./ChatInput";

/**
 * The defining component. Two modes, driven purely by route:
 *   Home  → full mode, 704px, transcript + IN FOCUS dossier
 *   else  → rail mode, 340px, page-aware context
 *
 * Mounted from Shell (and therefore the root layout), so it never remounts —
 * the conversation survives navigation.
 */
export default function ChatPanel() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <aside
      aria-label="Ask about my work"
      className="shell-panel flex min-h-0 flex-col border-l border-divider bg-surface"
    >
      <div className="flex flex-none items-center justify-between border-b border-divider bg-raised px-5 pt-[15px] pb-3.5">
        <div className="flex items-center gap-[9px]">
          <span aria-hidden className="block size-[7px] rounded-full bg-green" />
          <span className="text-[12.5px] font-semibold text-ink">Ask me anything</span>
        </div>
        <span className="font-mono text-[9.5px] tracking-[0.06em] text-ink-faint uppercase">
          Grounded in 40+ docs
        </span>
      </div>

      {isHome ? <FullMode /> : <RailMode context={railContext(pathname)} />}

      <ChatInput />
    </aside>
  );
}
