import type { Metadata } from "next";
import { Suspense } from "react";
import Page from "@/components/ui/Page";
import PageHeader from "@/components/ui/PageHeader";
import ProjectsBrowser from "./ProjectsBrowser";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Every system I've shipped across LLMs and agents, computer vision, voice and cloud infrastructure — searchable and filterable.",
};

export default function ProjectsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="/ Projects"
        title="Everything, not just the flattering parts."
        standfirst={`${projects.length} systems across retrieval, agents, computer vision and infrastructure. Four have full case studies; the rest the chat will explain on request. Search by a technology, a metric, or the problem you actually have.`}
      />
      <Suspense fallback={null}>
        <ProjectsBrowser />
      </Suspense>
    </Page>
  );
}
