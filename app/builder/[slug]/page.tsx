import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageContainer from "@/components/PageContainer";
import CaseStudy from "@/components/sections/CaseStudy";
import { getProject, projects } from "@/lib/projects";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  return project ? { title: `${project.title} — Builder` } : {};
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();
  return (
    <PageContainer>
      <CaseStudy slug={slug} />
    </PageContainer>
  );
}
