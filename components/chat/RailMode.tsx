"use client";

import Link from "next/link";
import { MOST_ASKED, QLABEL } from "@/content/answers";
import type { RailContext } from "@/lib/rail";
import { useChat } from "./context";

/** Every route except Home, 340px. No transcript — there isn't width for the
 *  rich blocks. Instead: page-aware context, the trail, and a way back.
 *  Asking anything here navigates Home and renders in full mode. */
export default function RailMode({ context }: { context: RailContext | null }) {
  const { trail, question, ask } = useChat();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-[18px] pt-[18px] pb-3">
      {context ? <CaseContext context={context} /> : <Generic />}

      {trail.length > 0 ? (
        <div className="border-t border-divider pt-[15px]">
          <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-label uppercase">
            Your trail
          </span>
          <div className="mt-2.5 flex flex-col gap-[5px]">
            {trail.map((item, i) => (
              <div key={i} className="text-[11.5px]/[1.4] text-ink-faint">
                {item}
              </div>
            ))}
            <div className="text-[11.5px]/[1.4] text-ink">{question}</div>
          </div>
          <Link
            href="/"
            className="t-chip mt-[11px] inline-block rounded-pill border border-border-input bg-raised-alt2 px-[11px] py-1.5 text-ink-body transition-colors hover:border-green"
          >
            Back to the chat →
          </Link>
        </div>
      ) : null}

      <div className="mt-auto rounded-lg border border-divider bg-well px-[15px] py-3.5">
        <p className="m-0 text-[12.5px]/[1.55] text-ink-body">
          Seen enough? The fastest route is a 20-minute call — bring the problem you need
          built.
        </p>
        <div className="mt-[11px] flex flex-wrap gap-[7px]">
          <Link
            href="/connect"
            className="t-chip rounded-pill bg-green px-3 py-[7px] text-surface transition-colors hover:bg-green-dark"
          >
            Book 20 minutes
          </Link>
          <button
            type="button"
            onClick={() => ask("rate")}
            className="t-chip rounded-pill border border-border-input bg-raised-alt2 px-3 py-[7px] text-ink-body transition-colors hover:border-green"
          >
            Rate &amp; availability
          </button>
        </div>
      </div>
    </div>
  );
}

function Generic() {
  const { ask } = useChat();

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-green uppercase">
          Ask me anything
        </span>
        <p className="mt-2.5 mb-0 text-[12.5px]/[1.55] text-ink-body">
          Read the page, or skip it and ask. Either way you get the same story — the chat is
          just faster.
        </p>
      </div>

      <div className="border-t border-divider pt-[15px]">
        <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-label uppercase">
          Most asked
        </span>
        <div className="mt-[11px] flex flex-col gap-1.5">
          {MOST_ASKED.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => ask(id)}
              className="rounded-[6px] border border-divider bg-raised-alt2 px-3 py-[9px] text-left text-[12.5px] font-medium text-ink transition-colors hover:border-green"
            >
              {QLABEL[id]}
            </button>
          ))}
        </div>
        <p className="mt-[11px] mb-0 font-mono text-[9.5px]/[1.5] text-ink-faint">
          Answers open in the full chat on the home page.
        </p>
      </div>
    </div>
  );
}

function CaseContext({ context }: { context: RailContext }) {
  const { ask } = useChat();

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-green uppercase">
          In this case study
        </span>
        <ol className="mt-2.5 mb-0 flex list-none flex-col gap-0 p-0">
          {context.sections.map((section, i) => (
            <li
              key={section}
              className={`py-[5px] text-[12px] ${
                i === 0
                  ? "border-l-2 border-green pl-2.5 font-medium text-green"
                  : "pl-3 text-ink-muted"
              }`}
            >
              {section}
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-divider pt-[15px]">
        <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-label uppercase">
          Ask about this one
        </span>
        <div className="mt-[11px] flex flex-col gap-1.5">
          {context.questions.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => ask(q.topic, q.label)}
              className="rounded-[6px] border border-divider bg-raised-alt2 px-3 py-[9px] text-left text-[12.5px] font-medium text-ink transition-colors hover:border-green"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {context.related.length > 0 ? (
        <div className="border-t border-divider pt-[15px]">
          <span className="font-mono text-[9px] font-bold tracking-[0.16em] text-ink-label uppercase">
            Same obsession
          </span>
          <div className="mt-[11px] flex flex-col gap-1.5">
            {context.related.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-[6px] border border-divider bg-raised-alt2 px-3 py-[9px] transition-colors hover:border-green"
              >
                <span className="block text-[12.5px] font-medium text-ink">{item.label}</span>
                <span className="mt-1 block text-[11px]/[1.45] text-ink-faint">{item.note}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
