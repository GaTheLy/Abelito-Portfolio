"use client";

import type { TopicId } from "@/content/answers";
import { useChat } from "@/components/chat/context";

/** Opens a chat answer from anywhere in the page content. Navigates Home,
 *  because the rich blocks need the full 704px panel. */
export default function AskButton({
  topic,
  label,
  children,
  className,
}: {
  topic: TopicId;
  /** Question text for the user bubble. Defaults to the topic's own label. */
  label?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { ask } = useChat();
  return (
    <button type="button" onClick={() => ask(topic, label)} className={className}>
      {children}
    </button>
  );
}
