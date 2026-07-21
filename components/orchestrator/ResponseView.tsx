"use client";

import Link from "next/link";
import BuilderSection from "@/components/sections/BuilderSection";
import CreatorSection from "@/components/sections/CreatorSection";
import HobbyistSection from "@/components/sections/HobbyistSection";
import OriginSection from "@/components/sections/OriginSection";
import ConnectSection from "@/components/sections/ConnectSection";
import BlockRenderer from "@/components/blocks/BlockRenderer";
import { getProject } from "@/lib/projects";
import { agentById, type AgentId } from "@/lib/orchestrator/agents";
import { useOrchestrator, type Citation, type View } from "./context";

// Responses are plain AI-formatted content (no browser-frame embed). Where a
// real page exists, a subtle "open full page ↗" link points to it.
export default function ResponseView({ view }: { view: View }) {
  switch (view.kind) {
    case "agent":
      return (
        <div>
          <AgentSection agentId={view.agentId} />
          <FullPageLink path={`/${view.agentId}`} />
        </div>
      );
    case "chunk":
      return <ChunkResponse slug={view.slug} index={view.index} />;
    case "connect":
      return (
        <div>
          <ConnectSection />
          <FullPageLink path="/connect" />
        </div>
      );
    case "answer":
      return <AnswerResponse text={view.text} citations={view.citations} />;
    case "fallback":
      return <FallbackSection q={view.q} />;
  }
}

// A grounded Tier-2 answer: prose synthesized only from the cited sections,
// with links to each so the visitor can verify and dive in.
function AnswerResponse({ text, citations }: { text: string; citations: Citation[] }) {
  const { open } = useOrchestrator();
  return (
    <div>
      <p className="max-w-prose leading-relaxed text-foreground/90">{text}</p>
      {citations.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-muted">
            From Abelito’s work
          </p>
          <div className="flex flex-wrap gap-2">
            {citations.map((c, i) => (
              <button
                key={`${c.label}-${i}`}
                type="button"
                onClick={() => open(c.target, c.label)}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {c.label} ↗
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AgentSection({ agentId }: { agentId: AgentId }) {
  switch (agentId) {
    case "builder":
      return <BuilderSection />;
    case "creator":
      return <CreatorSection />;
    case "hobbyist":
      return <HobbyistSection />;
    case "origin":
      return <OriginSection />;
  }
}

// One chunk (block) of a case study, with a compact project header for context.
function ChunkResponse({ slug, index }: { slug: string; index: number }) {
  const project = getProject(slug);
  if (!project) return <FallbackSection q={slug} />;
  const block = project.blocks[index];
  if (!block) return null;
  const agent = agentById(project.agent);

  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <span
          className={`inline-block rounded-sm px-2 py-0.5 font-mono text-xs uppercase tracking-wider text-white ${agent.accent.bg}`}
        >
          {agent.name}
        </span>
        <span className="text-sm font-medium tracking-tight">{project.title}</span>
      </div>
      <BlockRenderer block={block} index={index} />
      <FullPageLink path={`/builder/${slug}`} />
    </div>
  );
}

function FullPageLink({ path }: { path: string }) {
  return (
    <p className="mt-6">
      <Link
        href={path}
        className="font-mono text-xs text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        open full page ↗
      </Link>
    </p>
  );
}

const fallbackChips = [
  { label: "Show me your ML projects", prompt: "show me your ai and ml engineering projects" },
  { label: "What do you create?", prompt: "your content brand and videos" },
  { label: "Cars or investing?", prompt: "cars investing and hobbies" },
  { label: "Who are you?", prompt: "who are you, tell me your story" },
];

function FallbackSection({ q }: { q: string }) {
  const { ask } = useOrchestrator();
  return (
    <div className="max-w-prose">
      <h2 className="text-xl font-semibold tracking-tight">I wasn’t sure where to send you.</h2>
      <p className="mt-2 text-muted">
        I couldn’t match{q ? <> “<span className="text-foreground">{q}</span>”</> : " that"} to a
        section confidently, so I won’t guess. Try rephrasing, or pick a direction:
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {fallbackChips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            onClick={() => ask(chip.prompt)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
