import { queryModel, MODELS, type ModelKey } from "../openrouter";
import { fetchUrl, extractBodyText } from "../utils";
import { prisma } from "@/lib/prisma";

const MAX_TEXT_CHARS = 6000;

// ── Types ──────────────────────────────────────────────────

interface CitedSite {
  domain: string;
  parameters: string;
}

interface QueryResult {
  model: string;
  cited: boolean;
  citedSites: CitedSite[];
  rawResponse: string;
}

interface CitationEntry {
  query: string;
  results: QueryResult[];
}

interface ImpactAnalysis {
  model: string;
  signals: string;
}

interface ModelReport {
  model: string;
  report: string;
}

interface ModelSummaries {
  impactSummaries: Record<string, string>;
  reportSummaries: Record<string, string>;
}

export interface McdaReport {
  queries: string[];
  models: { id: ModelKey; label: string }[];
  citations: CitationEntry[];
  impactAnalysis: ImpactAnalysis[];
  modelReports: ModelReport[];
  actionItems: ActionItem[];
  impactSummaries?: Record<string, string>;
  reportSummaries?: Record<string, string>;
  summary: {
    citedByCount: number;
    queryHitCount: number;
    topCompetitors: { domain: string; count: number }[];
    consensusSites: string[];
    modelGaps: { model: string; uniqueCitations: string[] }[];
    verdict: string;
  };
  generatedAt: string;
}

interface ActionItem {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  agreedByCount: number;  // how many models flagged this
  models: string[];       // which models
}

// ── Helpers ────────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
  }
}

/** Check if a response mentions the target domain */
function responseContainsDomain(response: string, targetDomain: string): boolean {
  const lower = response.toLowerCase();
  const domain = targetDomain.toLowerCase();
  // Check domain with and without www
  return lower.includes(domain) || lower.includes(`www.${domain}`);
}

/** Extract domains/sites mentioned in a citation response */
function extractCitedSites(response: string): CitedSite[] {
  const sites: CitedSite[] = [];
  const seen = new Set<string>();

  // Match URLs
  const urlRegex = /https?:\/\/[^\s),\]"'<>]+/g;
  const urls = response.match(urlRegex) || [];
  for (const url of urls) {
    const domain = extractDomain(url);
    if (!seen.has(domain)) {
      seen.add(domain);
      // Try to extract the reasoning near this URL
      const idx = response.indexOf(url);
      const context = response.slice(Math.max(0, idx - 100), Math.min(response.length, idx + 200));
      sites.push({ domain, parameters: context.trim() });
    }
  }

  return sites;
}

// ── Step 1: Generate 10 niche queries ──────────────────────

async function generateNicheQueries(websiteUrl: string, pageText: string): Promise<string[]> {
  const truncated = pageText.length > MAX_TEXT_CHARS ? pageText.slice(0, MAX_TEXT_CHARS) : pageText;

  const response = await queryModel(MODELS.gpt.id, [
    {
      role: "system",
      content: "You generate realistic search queries that people would type into AI assistants like ChatGPT or Grok. Return ONLY a JSON array of 10 strings, no other text.",
    },
    {
      role: "user",
      content: `What would you say are 10 questions people could ask ideally in ChatGPT or Grok (similar to Google) to end up on a site within the same branch like this ${websiteUrl}? Might be competitors.\n\nHere is the page content:\n${truncated}`,
    },
  ]);

  if (!response) return [];

  try {
    const match = response.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const queries = JSON.parse(match[0]);
    if (Array.isArray(queries) && queries.every((q: unknown) => typeof q === "string")) {
      return queries.slice(0, 10);
    }
  } catch { /* parse error */ }

  return [];
}

// ── Step 2: Run citation queries per model ─────────────────

async function runCitationQueries(
  queries: string[],
  modelKey: ModelKey,
): Promise<{ query: string; response: string }[]> {
  const model = MODELS[modelKey];
  const results = await Promise.all(
    queries.map(async (query) => {
      const response = await queryModel(model.id, [
        {
          role: "user",
          content: `${query}\n\nPlease provide links. For each link, provide me the parameters that made them be suggested by you.`,
        },
      ]);
      return { query, response: response || "" };
    }),
  );
  return results;
}

// ── Step 3: Impact analysis per model ──────────────────────

async function getImpactAnalysis(
  modelKey: ModelKey,
  queryResults: { query: string; response: string }[],
): Promise<string> {
  const combined = queryResults
    .map((r, i) => `Query ${i + 1}: ${r.query}\nAnswer: ${r.response}`)
    .join("\n\n---\n\n");

  // Truncate if too long
  const truncated = combined.length > 12000 ? combined.slice(0, 12000) + "\n..." : combined;

  const response = await queryModel(MODELS[modelKey].id, [
    {
      role: "system",
      content: "You are a research analyst writing a technical report. Write in a neutral, evidence-based tone. Cite specific data points from the provided answers. Do not offer to help, do not add disclaimers, do not use filler phrases. No introductions or conclusions. Just findings.",
    },
    {
      role: "user",
      content: `Analyze the following AI-generated answers for a website discoverability audit. Identify what ranking signals, content patterns, and authority indicators this AI model prioritizes when recommending sites. Structure your findings as bullet points grouped by signal type (content, technical, authority, local).\n\n${truncated}`,
    },
  ]);

  return response || "Analysis unavailable.";
}

// ── Step 4: Full suggestability report per model ───────────

async function getSuggestabilityReport(
  modelKey: ModelKey,
  websiteUrl: string,
  queryResults: { query: string; response: string }[],
): Promise<string> {
  const combined = queryResults
    .map((r, i) => `Query ${i + 1}: ${r.query}\nAnswer: ${r.response}`)
    .join("\n\n---\n\n");

  const truncated = combined.length > 12000 ? combined.slice(0, 12000) + "\n..." : combined;

  const response = await queryModel(MODELS[modelKey].id, [
    {
      role: "system",
      content: "You are a research analyst writing a technical report. Write in a neutral, evidence-based tone. Reference specific queries and responses as evidence. Do not offer to help, do not add disclaimers or sign-offs, do not use phrases like 'feel free to' or 'let me know'. No introductions. Just analysis.",
    },
    {
      role: "user",
      content: `Analyze the following 10 queries and their results for ${websiteUrl}. For each cited competitor, explain what specific signals (structured data, content depth, backlink authority, local presence, niche expertise) likely caused this model to recommend them. Then identify the gaps between ${websiteUrl} and the top-cited sites. Structure as: 1) Competitor analysis (why they were cited), 2) Gap analysis (what ${websiteUrl} lacks), 3) Signal-specific recommendations.\n\n${truncated}`,
    },
  ]);

  return response || "Report unavailable.";
}

// ── Step 5: Cross-model comparison + summary ───────────────

function buildSummary(
  citations: CitationEntry[],
  targetDomain: string,
  modelKeys: ModelKey[],
): McdaReport["summary"] {
  // Count how many models cited the target site at least once
  const modelCited = new Set<string>();
  let queryHitCount = 0;
  const competitorCounts = new Map<string, number>();
  const modelCitations = new Map<string, Set<string>>();

  for (const entry of citations) {
    let queryCited = false;
    for (const result of entry.results) {
      if (!modelCitations.has(result.model)) modelCitations.set(result.model, new Set());

      if (result.cited) {
        modelCited.add(result.model);
        queryCited = true;
      }

      for (const site of result.citedSites) {
        const d = site.domain.toLowerCase();
        if (d !== targetDomain.toLowerCase()) {
          competitorCounts.set(d, (competitorCounts.get(d) || 0) + 1);
          modelCitations.get(result.model)!.add(d);
        }
      }
    }
    if (queryCited) queryHitCount++;
  }

  // Top competitors sorted by mention count
  const topCompetitors = [...competitorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }));

  // Consensus sites: cited by 3+ models
  const allDomains = new Set<string>();
  for (const sites of modelCitations.values()) {
    for (const d of sites) allDomains.add(d);
  }
  const consensusSites = [...allDomains].filter((d) => {
    let count = 0;
    for (const sites of modelCitations.values()) {
      if (sites.has(d)) count++;
    }
    return count >= 5;
  });

  // Model-specific unique citations
  const modelGaps = modelKeys.map((key) => {
    const mySites = modelCitations.get(key) || new Set();
    const uniqueCitations = [...mySites].filter((d) => {
      let count = 0;
      for (const [k, sites] of modelCitations.entries()) {
        if (k !== key && sites.has(d)) count++;
      }
      return count === 0;
    });
    return { model: key, uniqueCitations };
  });

  return {
    citedByCount: modelCited.size,
    queryHitCount,
    topCompetitors,
    consensusSites,
    modelGaps,
    verdict: "", // filled after
  };
}

async function generateVerdict(
  websiteUrl: string,
  summary: McdaReport["summary"],
  impactAnalysis: ImpactAnalysis[],
): Promise<string> {
  const summaryText = `
Site: ${websiteUrl}
Cited by ${summary.citedByCount}/8 AI models across ${summary.queryHitCount}/10 queries.
Top competitors: ${summary.topCompetitors.slice(0, 5).map((c) => `${c.domain} (${c.count}x)`).join(", ")}
Consensus sites (cited by 3+ models): ${summary.consensusSites.join(", ") || "none"}
Model-specific signals: ${impactAnalysis.map((a) => `${a.model}: ${a.signals.slice(0, 200)}`).join(" | ")}
  `.trim();

  const response = await queryModel(MODELS.gpt.id, [
    {
      role: "system",
      content: "You write concise, actionable summaries for business owners. One paragraph, no jargon. Do not use em-dashes. Use commas or periods instead.",
    },
    {
      role: "user",
      content: `Write a one-paragraph verdict summarizing this site's AI visibility based on the multi-model citation analysis:\n\n${summaryText}`,
    },
  ]);

  return response || "Verdict unavailable.";
}

// ── Consensus action items ─────────────────────────────────

async function generateActionItems(
  websiteUrl: string,
  impactAnalysis: ImpactAnalysis[],
  modelReports: ModelReport[],
): Promise<ActionItem[]> {
  // Combine all model insights into a single prompt
  const impactSummary = impactAnalysis
    .map((ia) => `[${ia.model}] What it prioritizes:\n${ia.signals.slice(0, 600)}`)
    .join("\n\n");

  const reportSummary = modelReports
    .map((mr) => `[${mr.model}] Suggestability report:\n${mr.report.slice(0, 600)}`)
    .join("\n\n");

  const combined = `${impactSummary}\n\n---\n\n${reportSummary}`;
  const truncated = combined.length > 15000 ? combined.slice(0, 15000) + "\n..." : combined;

  const response = await queryModel(MODELS.gpt.id, [
    {
      role: "system",
      content: `You analyze multi-AI citation reports and extract actionable work items for business owners.

Return ONLY a JSON array of action items. Each item:
{
  "title": "short action title (imperative, e.g. 'Add structured data markup')",
  "description": "1-2 sentences explaining what to do and why it matters for AI visibility",
  "priority": "high" | "medium" | "low",
  "agreedByCount": number (how many of the 8 models flagged this as important),
  "models": ["model_key1", "model_key2"]
}

Rules:
- Only include items mentioned by 2+ models (the red thread across models)
- High priority = 5+ models agree. Medium = 3-4. Low = 2.
- Maximum 10 items, sorted by agreedByCount descending
- Be specific and actionable, not generic advice
- Do not use em-dashes. Use commas or periods instead.
- Return ONLY the JSON array, no other text.`,
    },
    {
      role: "user",
      content: `Here are the signal priorities and suggestability reports from 8 AI models for ${websiteUrl}. Find the common threads and produce prioritized action items.\n\n${truncated}`,
    },
  ], 3000);

  if (!response) return [];

  try {
    const match = response.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const items = JSON.parse(match[0]) as ActionItem[];
    if (!Array.isArray(items)) return [];
    // Validate and clean
    return items
      .filter((item) => item.title && item.description && item.priority && item.agreedByCount >= 2)
      .slice(0, 10)
      .map((item) => ({
        title: item.title,
        description: item.description,
        priority: ["high", "medium", "low"].includes(item.priority) ? item.priority : "medium",
        agreedByCount: Math.min(8, Math.max(2, item.agreedByCount)),
        models: Array.isArray(item.models) ? item.models : [],
      }));
  } catch { /* parse error */ }

  return [];
}

// ── Model summaries (one-liners) ──────────────────────────

async function generateModelSummaries(
  impactAnalysis: ImpactAnalysis[],
  modelReports: ModelReport[],
): Promise<ModelSummaries> {
  const impactBlock = impactAnalysis
    .map((ia) => `[${ia.model}]:\n${ia.signals.slice(0, 800)}`)
    .join("\n\n");

  const reportBlock = modelReports
    .map((mr) => `[${mr.model}]:\n${mr.report.slice(0, 800)}`)
    .join("\n\n");

  const response = await queryModel(MODELS.gpt.id, [
    {
      role: "system",
      content: `You summarize AI research findings into one-sentence takeaways per model.

Return ONLY a JSON object with this shape:
{
  "impactSummaries": { "model_key": "one sentence", ... },
  "reportSummaries": { "model_key": "one sentence", ... }
}

Rules:
- Each summary must be exactly one sentence, max 120 characters.
- Be specific and concrete, not generic. Mention the actual signal or recommendation.
- Do not use em-dashes. Use commas or periods instead.
- Return ONLY the JSON, no other text.`,
    },
    {
      role: "user",
      content: `Summarize these into one-sentence takeaways per model.

IMPACT ANALYSES (what each AI prioritizes):
${impactBlock}

SUGGESTABILITY REPORTS (how to improve):
${reportBlock}`,
    },
  ], 2000);

  if (!response) return { impactSummaries: {}, reportSummaries: {} };

  try {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) return { impactSummaries: {}, reportSummaries: {} };
    const parsed = JSON.parse(match[0]) as ModelSummaries;
    return {
      impactSummaries: parsed.impactSummaries || {},
      reportSummaries: parsed.reportSummaries || {},
    };
  } catch {
    return { impactSummaries: {}, reportSummaries: {} };
  }
}

// ── Main entry point ───────────────────────────────────────

export async function generateMcdaReport(submissionId: string, websiteUrl: string): Promise<void> {
  // Atomically claim processing status to prevent double-trigger
  const claimed = await prisma.submission.updateMany({
    where: { id: submissionId, mcdaStatus: null },
    data: { mcdaStatus: "processing" },
  });
  if (claimed.count === 0) return; // Another call already claimed it

  try {
    // Fetch page text for query generation
    const fetched = await fetchUrl(websiteUrl);
    const pageText = fetched.ok ? extractBodyText(fetched.text) : "";

    // Step 1: Generate 10 niche queries
    const queries = await generateNicheQueries(websiteUrl, pageText);
    if (queries.length === 0) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { mcdaStatus: "failed" },
      });
      return;
    }

    const targetDomain = extractDomain(websiteUrl);
    const modelKeys: ModelKey[] = ["gpt", "claude", "gemini", "grok", "perplexity", "copilot", "mistral", "llama"];

    // Step 2: Run citation queries across all 4 models in parallel
    const allQueryResults = await Promise.all(
      modelKeys.map(async (key) => ({
        model: key,
        results: await runCitationQueries(queries, key),
      })),
    );

    // Build citation entries (per query, across models)
    const citations: CitationEntry[] = queries.map((query, qi) => ({
      query,
      results: modelKeys.map((key) => {
        const modelResults = allQueryResults.find((r) => r.model === key)!;
        const response = modelResults.results[qi]?.response || "";
        const citedSites = extractCitedSites(response);
        return {
          model: key,
          cited: responseContainsDomain(response, targetDomain),
          citedSites,
          rawResponse: response,
        };
      }),
    }));

    // Step 3 + 4: Impact analysis + suggestability reports (parallel per model)
    const [impactResults, reportResults] = await Promise.all([
      Promise.all(
        modelKeys.map(async (key) => {
          const modelQR = allQueryResults.find((r) => r.model === key)!;
          return {
            model: key,
            signals: await getImpactAnalysis(key, modelQR.results),
          };
        }),
      ),
      Promise.all(
        modelKeys.map(async (key) => {
          const modelQR = allQueryResults.find((r) => r.model === key)!;
          return {
            model: key,
            report: await getSuggestabilityReport(key, websiteUrl, modelQR.results),
          };
        }),
      ),
    ]);

    // Step 5: Cross-model comparison
    const summary = buildSummary(citations, targetDomain, modelKeys);

    // Step 6: Verdict + consensus action items + model summaries (parallel)
    const [verdict, actionItems, modelSummaries] = await Promise.all([
      generateVerdict(websiteUrl, summary, impactResults),
      generateActionItems(websiteUrl, impactResults, reportResults),
      generateModelSummaries(impactResults, reportResults),
    ]);
    summary.verdict = verdict;

    // Strip rawResponse before storing (too large for DB)
    const storedCitations: CitationEntry[] = citations.map((c) => ({
      query: c.query,
      results: c.results.map((r) => ({
        model: r.model,
        cited: r.cited,
        citedSites: r.citedSites,
        rawResponse: "", // don't store full responses
      })),
    }));

    const report: McdaReport = {
      queries,
      models: modelKeys.map((k) => ({ id: k, label: MODELS[k].label })),
      citations: storedCitations,
      impactAnalysis: impactResults,
      modelReports: reportResults,
      actionItems,
      impactSummaries: modelSummaries.impactSummaries,
      reportSummaries: modelSummaries.reportSummaries,
      summary,
      generatedAt: new Date().toISOString(),
    };

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        mcdaReport: JSON.parse(JSON.stringify(report)),
        mcdaStatus: "completed",
      },
    });
  } catch (err) {
    console.error(`MCDA generation failed for ${submissionId}:`, err);
    await prisma.submission.update({
      where: { id: submissionId },
      data: { mcdaStatus: "failed" },
    });
  }
}
