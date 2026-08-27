"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import TopBar from "./TopBar";
import ChatPanel from "./chat/ChatPanel";
import MobileSheet from "./chat/MobileSheet";
import { useChat } from "./chat/context";

/**
 * The app frame. Mounted once in the root layout so the chat panel never
 * remounts on navigation — that persistence is the entire premise of the design
 * (read on the left, ask on the right, both at once).
 *
 * Pages are passed through as `children` and stay server components.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { answerSeq } = useChat();
  const scrollRef = useRef<HTMLElement>(null);

  const isHome = pathname === "/";

  // README §State: "any route change resets the content scroll" and "any ask()
  // … resets the content scroll". Both, in one effect.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname, answerSeq]);

  return (
    // min-h only applies once the two-column layout is in play — on a phone the
    // shell is exactly the viewport and the page scrolls inside it.
    <div className="flex h-dvh flex-col overflow-hidden lg:min-h-[820px]">
      <a href="#content" className="skip-link">
        Skip to content
      </a>

      <TopBar />

      <div className="shell-body flex min-h-0 flex-1" data-mode={isHome ? "full" : "rail"}>
        <main
          id="content"
          ref={scrollRef}
          data-page-scroll
          className="min-w-0 flex-1 overflow-y-auto"
        >
          {children}
        </main>

        <ChatPanel />
      </div>

      <MobileSheet />
    </div>
  );
}
