"use client";

import Link from "next/link";
import type { Block } from "@/lib/blocks";
import { inline } from "@/lib/inline";
import { useChat } from "@/components/chat/context";
import Mermaid from "./Mermaid";
import CodeBlock from "./CodeBlock";

/** Chat answers run tighter than page bodies — 13.5px vs 15px, 21px metric
 *  numerals vs 26px. The only axis on which the two contexts differ. */
export type BlockVariant = "chat" | "page";

interface Props {
  blocks: Block[];
  variant?: BlockVariant;
  /** False while the answer is still streaming — passed to Mermaid so it waits
   *  for complete source before trying to parse. */
  complete?: boolean;
}

export default function BlockList({ blocks, variant = "chat", complete = true }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {blocks.map((block, i) => (
        <BlockView
          key={i}
          block={block}
          variant={variant}
          // Only the last block can be mid-stream.
          complete={complete || i < blocks.length - 1}
        />
      ))}
    </div>
  );
}

function BlockView({
  block,
  variant,
  complete,
}: {
  block: Block;
  variant: BlockVariant;
  complete: boolean;
}) {
  const body = variant === "chat" ? "text-[13.5px]/[1.65]" : "text-[15px]/[1.68]";

  switch (block.type) {
    case "heading":
      return (
        <h3 className="m-0 text-[16px]/[1.3] font-semibold tracking-[-0.015em] text-ink">
          {block.text}
        </h3>
      );

    case "text":
      return <p className={`m-0 ${body} text-ink-body`}>{inline(block.md)}</p>;

    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`m-0 flex list-outside flex-col gap-2 pl-5 ${body} text-ink-body ${
            block.ordered ? "list-decimal" : "list-disc"
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </List>
      );
    }

    case "code":
      return <CodeBlock caption={block.caption} code={block.code} />;

    case "table":
      return (
        <div className="overflow-hidden rounded-md border border-divider bg-raised-alt2">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="bg-bar">
                  {block.columns.map((col, i) => (
                    <th
                      key={i}
                      scope="col"
                      className={`border-b border-divider px-3 py-2 font-mono text-[9px] font-bold tracking-[0.1em] text-ink-label uppercase ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr
                    key={r}
                    className={row.highlight ? "bg-green-tint text-green" : undefined}
                  >
                    {row.cells.map((cell, c) => (
                      <td
                        key={c}
                        className={`border-b border-divider-soft px-3 py-[9px] last:border-b-0 ${
                          block.columns[c]?.align === "right"
                            ? "text-right font-mono text-[11px]"
                            : ""
                        } ${c === 0 ? "font-semibold" : row.highlight ? "" : "text-ink-muted"}`}
                      >
                        {inline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.footnote ? (
            <p className="m-0 border-t border-divider bg-bar px-3 py-[7px] font-mono text-[9.5px] text-ink-faint">
              {block.footnote}
            </p>
          ) : null}
        </div>
      );

    case "keyvalue":
      return (
        <dl className="m-0 grid grid-cols-[96px_1fr] overflow-hidden rounded-md border border-divider bg-raised-alt2 text-[12.5px]/[1.5]">
          {block.rows.map((row, i) => {
            const last = i === block.rows.length - 1;
            const edge = last ? "" : "border-b border-divider-soft";
            return (
              <div key={i} className="contents">
                <dt
                  className={`px-3 py-2.5 font-mono text-[9.5px] tracking-[0.06em] text-ink-label uppercase ${edge}`}
                >
                  {row.key}
                </dt>
                <dd className={`m-0 px-3 py-2.5 text-ink-body ${edge}`}>{inline(row.value)}</dd>
              </div>
            );
          })}
        </dl>
      );

    case "mermaid":
      return (
        <Mermaid kind={block.kind} code={block.code} alt={block.alt} complete={complete} />
      );

    case "metrics":
      return (
        // auto-fit rather than a fixed count: four numerals stay on one row at
        // full width and reflow to two on a phone, with no breakpoint to keep
        // in sync with the item count. The 1px gaps over a divider-coloured
        // background ARE the rules — per-cell borders can't know which cell
        // ends a wrapped row.
        <div className="grid gap-px overflow-hidden rounded-md border border-divider bg-divider [grid-template-columns:repeat(auto-fit,minmax(110px,1fr))]">
          {block.items.map((item, i) => (
            <div key={i} className="bg-raised-alt2 px-3.5 py-3.5">
              <div
                className={`${
                  variant === "chat" ? "text-[21px]" : "text-[26px]"
                } leading-none tracking-[-0.035em] ${item.lead ? "text-green" : "text-ink"}`}
              >
                {item.value}
              </div>
              <div className="mt-1.5 font-mono text-[9px]/[1.4] tracking-[0.02em] text-ink-label uppercase">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      );

    case "stack":
      return (
        <ul className="m-0 flex list-none flex-wrap gap-[7px] p-0">
          {block.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-sm border border-divider bg-raised px-[11px] py-1.5 font-mono text-[10.5px] text-ink-body"
            >
              {tag}
            </li>
          ))}
        </ul>
      );

    case "timeline":
      return (
        <div className="relative">
          {/* The connecting hairline only makes sense while the phases sit in
              one row — it's hidden once they stack. */}
          <div
            aria-hidden
            className="absolute top-[7px] right-0 left-0 h-px bg-divider max-md:hidden"
          />
          <ol
            className="relative m-0 grid list-none gap-5 p-0 max-md:!grid-cols-1 [grid-template-columns:repeat(var(--phases),minmax(0,1fr))]"
            style={{ "--phases": block.entries.length } as React.CSSProperties}
          >
            {block.entries.map((entry, i) => (
              <li key={i}>
                <span
                  aria-hidden
                  className={`mb-3.5 block size-[9px] rounded-full ${
                    entry.current ? "bg-vermilion" : "bg-border-input"
                  }`}
                />
                <div
                  className={`font-mono text-[9.5px] font-bold tracking-[0.1em] uppercase ${
                    entry.current ? "text-vermilion" : "text-ink-label"
                  }`}
                >
                  {entry.label}
                </div>
                <p className="mt-1.5 mb-0 text-[12.5px]/[1.55] text-ink-muted">{entry.text}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case "callout":
      return (
        <div className="rounded-md border border-dashed border-amber-border bg-amber-fill px-4 py-3">
          <span className="font-mono text-[9px] font-bold tracking-[0.14em] text-amber-ink uppercase">
            {block.label}
          </span>
          <p className="mt-1.5 mb-0 text-[12.5px]/[1.55] text-amber-ink-deep">
            {inline(block.text)}
          </p>
        </div>
      );

    case "lesson":
      return (
        <blockquote
          className={`m-0 border-l-2 py-0.5 pl-3.5 ${
            block.emphasis ? "border-vermilion" : "border-green"
          }`}
        >
          <p
            className={`m-0 font-editorial ${
              variant === "chat" ? "text-[14.5px]/[1.6]" : "text-[17px]/[1.65]"
            } text-ink-body`}
          >
            {inline(block.text)}
          </p>
        </blockquote>
      );

    case "followups":
      return <Followups block={block} />;

    case "cards":
      return (
        <div
          className="grid gap-3 max-md:!grid-cols-1 [grid-template-columns:repeat(var(--cards),minmax(0,1fr))]"
          style={{ "--cards": block.columns } as React.CSSProperties}
        >
          {block.items.map((item, i) => (
            <Card key={i} {...item} />
          ))}
        </div>
      );
  }
}

function Card({
  label,
  title,
  body,
  tone,
}: Extract<Block, { type: "cards" }>["items"][number]) {
  if (tone === "placeholder") {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed border-border-input bg-well p-3.5 text-center font-mono text-[9.5px] tracking-[0.06em] text-ink-faint">
        {body.join(" ")}
      </div>
    );
  }

  const shell =
    tone === "good"
      ? "border-green bg-green-tint"
      : "border-divider bg-raised-alt2";
  const labelColor =
    tone === "good" ? "text-green" : tone === "warn" ? "text-vermilion" : "text-ink-label";
  const bodyColor = tone === "good" ? "text-green-ink" : "text-ink-muted";
  const bullets = body.length > 1;

  return (
    <div className={`rounded-md border p-3.5 ${shell}`}>
      {label ? (
        <span
          className={`font-mono text-[9px] font-bold tracking-[0.14em] uppercase ${labelColor}`}
        >
          {label}
        </span>
      ) : null}
      {title ? (
        <div className={`text-[13px] font-semibold text-ink ${label ? "mt-2.5" : ""}`}>
          {title}
        </div>
      ) : null}
      {body.length > 0 ? (
        <div
          className={`flex flex-col gap-[7px] ${label || title ? "mt-2.5" : ""} ${
            bullets ? "text-[12.5px]/[1.5]" : "text-[11.5px]/[1.5]"
          } ${bodyColor}`}
        >
          {body.map((line, i) => (
            <span key={i}>{bullets ? `· ${line}` : inline(line)}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Followups({ block }: { block: Extract<Block, { type: "followups" }> }) {
  const { ask } = useChat();

  return (
    <div className="flex flex-wrap items-center gap-[7px]">
      <span className="self-center font-mono text-[9px] tracking-[0.12em] text-ink-faintest uppercase">
        {block.label}
      </span>

      {block.items.map((item, i) => {
        const chip = item.cta
          ? "bg-green text-surface px-[13px] py-[7px] hover:bg-green-dark"
          : item.primary
            ? "border border-green bg-surface text-green px-[11px] py-1.5 hover:bg-green-tint"
            : "border border-border-input bg-surface text-ink-body px-[11px] py-1.5 hover:border-green";

        const className = `t-chip rounded-pill transition-colors ${chip}`;

        if (item.href) {
          return (
            <Link key={i} href={item.href} className={className}>
              {item.label}
            </Link>
          );
        }

        if (item.topic) {
          const topic = item.topic;
          return (
            <button key={i} type="button" onClick={() => ask(topic, item.label)} className={className}>
              {item.label}
            </button>
          );
        }

        // Neither target — skip rather than render a dead control.
        return null;
      })}
    </div>
  );
}
