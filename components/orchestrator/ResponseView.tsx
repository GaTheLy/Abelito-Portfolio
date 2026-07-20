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
import { useOrchestrator, type View } from "./context";

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
    case "fallback":
      return <FallbackSection q={view.q} confidence={view.confidence} />;
  }
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
  if (!project) return <FallbackSection q={slug} confidence={0} />;
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

function FallbackSection({ q, confidence }: { q: string; confidence: number }) {
  const { ask } = useOrchestrator();
  return (
    <div className="max-w-prose">
      <h2 className="text-xl font-semibold tracking-tight">I wasn’t sure where to send you.</h2>
      <p className="mt-2 text-muted">
        Your request didn’t match a section with enough confidence
        {q ? <> for <span className="text-foreground">“{q}”</span></> : null} (score{" "}
        <span className="font-mono text-foreground">{confidence.toFixed(2)}</span>), so I won’t
        guess. Try rephrasing, or pick a direction:
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
