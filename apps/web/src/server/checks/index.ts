import type { CheckResult, SiteData } from "./types";
import { normalizeUrl, gatherSiteData } from "./utils";
import { runMachineAccessChecks } from "./machine-access";
import { runContentChecks } from "./content";
import { runStructureChecks } from "./structure";
import { runEntityChecks } from "./entities";
import { runTrustChecks } from "./trust";
import { runConversationalChecks } from "./conversational";
import { runCrawlPermissionChecks } from "./crawl-permissions";
import { runExtractabilityChecks } from "./extractability";
import { runAuthorityChecks } from "./authority";
import { runTechnicalChecks } from "./technical";
import { runAgentReadinessChecks } from "./agent-readiness";

export type { CheckResult, SiteData };

export async function runAllChecks(website: string): Promise<{ checks: CheckResult[]; siteData: SiteData }> {
  const baseUrl = normalizeUrl(website);
  const siteData = await gatherSiteData(baseUrl);

  const syncChecks: CheckResult[] = [
    ...runMachineAccessChecks(siteData),
    ...runContentChecks(siteData),
    ...runStructureChecks(siteData),
    ...runEntityChecks(siteData),
    ...runTrustChecks(siteData),
    ...runConversationalChecks(siteData),
    ...runCrawlPermissionChecks(siteData),
    ...runExtractabilityChecks(siteData),
    ...runAuthorityChecks(),
    ...runTechnicalChecks(siteData),
  ];

  const agentChecks = await runAgentReadinessChecks(siteData);

  return {
    checks: [...syncChecks, ...agentChecks],
    siteData,
  };
}

export async function calculateScore(checks: CheckResult[]): Promise<number> {
  const autoChecks = checks.filter((c) => c.type === "AUTO");
  if (autoChecks.length === 0) return 0;

  const totalScore = autoChecks.reduce((sum, c) => sum + c.score, 0);
  const totalPenalty = checks.reduce((sum, c) => sum + c.penalty, 0);
  const maxScore = autoChecks.length * 100;

  return Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100) + totalPenalty));
}
