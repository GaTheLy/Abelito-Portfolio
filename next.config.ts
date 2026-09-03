import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3 writes its own AGENTS.md / CLAUDE.md on dev start. This repo
  // keeps hand-written ones describing the actual architecture, so opt out
  // rather than have them overwritten every time someone runs `npm run dev`.
  agentRules: false,
};

export default nextConfig;
