import type { CheckResult, SiteData } from "./types";
import { normalizeUrl, gatherSiteData } from "../utils";
import { runAutoChecks } from "./auto";
import { runLlmChecks } from "./llm";

export type { CheckResult, SiteData };

export async function runAllChecks(website: string): Promise<{ checks: CheckResult[]; siteData: SiteData }> {
  const baseUrl = normalizeUrl(website);
  const siteData = await gatherSiteData(baseUrl);

  const [autoChecks, llmChecks] = await Promise.all([
    runAutoChecks(siteData),
    runLlmChecks(siteData),
  ]);

  const checks: CheckResult[] = [...autoChecks, ...llmChecks];

  return { checks, siteData };
}

export async function calculateScore(checks: CheckResult[]): Promise<number> {
  const autoChecks = checks.filter((c) => c.type === "AUTO");
  if (autoChecks.length === 0) return 0;

  const totalScore = autoChecks.reduce((sum, c) => sum + c.score, 0);
  const totalPenalty = checks.reduce((sum, c) => sum + c.penalty, 0);
  const maxScore = autoChecks.length * 100;

  return Math.max(0, Math.min(100, Math.round((totalScore / maxScore) * 100) + totalPenalty));
}
