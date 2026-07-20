import Link from "next/link";
import PageContainer from "@/components/PageContainer";

export default function NotFound() {
  return (
    <PageContainer>
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">This page doesn’t exist.</h1>
        <p className="mt-3 text-muted">The address you tried isn’t part of the site.</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:border-foreground/30"
        >
          Back to the orchestrator
        </Link>
      </div>
    </PageContainer>
  );
}
