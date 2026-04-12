import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionWithChecks } from "@/server/services/submission";
import { ResultsView } from "./results-view";

interface DbCheck {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string | null;
}

/**
 * Server-side gating: free users only get top 3 blockers + 1 quick fix
 * with full data. All other checks are stripped to pass/fail only (no
 * details), so nothing leaks to the client.
 *
 * Prioritization: top 3 blockers come from SEMI (LLM) checks first
 * (higher value, more impressive). Quick fix comes from AUTO checks
 * (easy win the user can act on immediately).
 */
function gateChecksForFree(checks: DbCheck[]) {
  const isSemi = (c: DbCheck) => c.description.includes("— SEMI");
  const failed = checks.filter((c) => !c.passed);

  const failedSemi = failed.filter(isSemi);
  const failedAuto = failed.filter((c) => !isSemi(c));

  // Top 3 blockers: prioritize SEMI, fill remainder with AUTO
  const topBlockers = [...failedSemi, ...failedAuto].slice(0, 3);
  // Quick fix: first AUTO failure not already in blockers
  const blockerIds = new Set(topBlockers.map((c) => c.id));
  const quickFix = failedAuto.find((c) => !blockerIds.has(c.id));

  const revealedIds = new Set([
    ...blockerIds,
    ...(quickFix ? [quickFix.id] : []),
  ]);

  return checks.map((c) => {
    if (revealedIds.has(c.id)) {
      return { ...c, revealed: true as const };
    }
    // Strip details for locked checks, keep only pass/fail and name
    return {
      id: c.id,
      name: c.name,
      description: "",
      passed: c.passed,
      details: null,
      revealed: false as const,
    };
  });
}

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await getSubmissionWithChecks(id);

  if (!submission || submission.status !== "completed") {
    notFound();
  }

  const isPro = submission.pro ?? false;
  const checks = isPro
    ? submission.checks.map((c) => ({ ...c, revealed: true as const }))
    : gateChecksForFree(submission.checks);

  // Category config: points + which composite score it feeds
  // Visibility = can AI find and read you? (infrastructure)
  // Discoverability = will AI recommend you? (content + authority)
  const categoryConfig: Record<string, { label: string; maxPts: number; composite: "visibility" | "discoverability" }> = {
    A: { label: "Machine access",      maxPts: 15, composite: "visibility" },
    B: { label: "Content clarity",     maxPts: 20, composite: "discoverability" },
    C: { label: "Structure",           maxPts: 15, composite: "visibility" },
    D: { label: "Entities & schema",   maxPts: 15, composite: "discoverability" },
    E: { label: "Trust signals",       maxPts: 15, composite: "discoverability" },
    F: { label: "Conversational fit",  maxPts: 20, composite: "discoverability" },
    G: { label: "Crawl permissions",   maxPts: 10, composite: "visibility" },
    H: { label: "Extractability",      maxPts: 10, composite: "visibility" },
    I: { label: "Authority signals",   maxPts: 10, composite: "discoverability" },
    J: { label: "Technical perf.",     maxPts: 10, composite: "visibility" },
    K: { label: "Agent readiness",     maxPts: 10, composite: "discoverability" },
  };

  const categoryScores = Object.entries(categoryConfig).map(([cat, cfg]) => {
    const catChecks = submission.checks.filter((c) =>
      c.description.includes(`Category ${cat}`)
    );
    const passed = catChecks.filter((c) => c.passed).length;
    const total = catChecks.length;
    const earned = total > 0 ? Math.round((passed / total) * cfg.maxPts) : 0;
    return { category: cat, label: cfg.label, earned, maxPts: cfg.maxPts, composite: cfg.composite };
  });

  // Composite scores from meaningful category groupings
  const visibilityCats = categoryScores.filter((c) => c.composite === "visibility");
  const discoverabilityCats = categoryScores.filter((c) => c.composite === "discoverability");

  const sumScore = (cats: typeof categoryScores) => {
    const earned = cats.reduce((sum, c) => sum + c.earned, 0);
    const max = cats.reduce((sum, c) => sum + c.maxPts, 0);
    return max > 0 ? Math.round((earned / max) * 100) : 0;
  };

  const totalChecks = submission.checks.length;

  const clientData = {
    id: submission.id,
    website: submission.website,
    score: submission.score,
    pro: isPro,
    email: submission.email,
    checks,
    stats: {
      totalChecks,
      totalPassed: submission.checks.filter((c) => c.passed).length,
      visibilityScore: sumScore(visibilityCats),
      discoverabilityScore: sumScore(discoverabilityCats),
      categoryScores,
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">AI ✓</span>
          </Link>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Scan another site
          </Link>
        </div>
      </nav>

      <ResultsView submission={clientData} />
    </main>
  );
}
