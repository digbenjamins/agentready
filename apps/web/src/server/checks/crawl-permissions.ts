import type { CheckResult, SiteData } from "./types";

function isAgentBlocked(robotsTxt: string, agentName: string): boolean {
  const lines = robotsTxt.split("\n");
  let inAgentBlock = false;
  let inWildcardBlock = false;
  let agentAllowed = true;
  let wildcardAllowed = true;

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith("user-agent:")) {
      const agent = trimmed.replace("user-agent:", "").trim();
      inAgentBlock = agent === agentName.toLowerCase();
      inWildcardBlock = agent === "*";
    } else if (trimmed.startsWith("disallow:")) {
      const path = trimmed.replace("disallow:", "").trim();
      if (path === "/" || path === "/*") {
        if (inAgentBlock) agentAllowed = false;
        if (inWildcardBlock) wildcardAllowed = false;
      }
    } else if (trimmed.startsWith("allow:")) {
      const path = trimmed.replace("allow:", "").trim();
      if (path === "/" || path === "/*") {
        if (inAgentBlock) agentAllowed = true;
        if (inWildcardBlock) wildcardAllowed = true;
      }
    }
  }

  // Specific agent block takes priority, otherwise fall back to wildcard
  if (!agentAllowed) return true;
  if (!wildcardAllowed) return true;
  return false;
}

/** 31 — GPTBot not blocked */
function checkGptbotAllowed(site: SiteData): CheckResult {
  if (!site.robotsTxt) {
    return {
      check_id: "gptbot_allowed",
      category: "G",
      name: "GPTBot not blocked in robots.txt",
      pass: true,
      score: 100,
      details: { robots_txt_exists: false },
      penalty: 0,
      fix: "No robots.txt — GPTBot is not blocked.",
      type: "AUTO",
    };
  }

  const blocked = isAgentBlocked(site.robotsTxt, "GPTBot");
  return {
    check_id: "gptbot_allowed",
    category: "G",
    name: "GPTBot not blocked in robots.txt",
    pass: !blocked,
    score: blocked ? 0 : 100,
    details: { blocked },
    penalty: blocked ? -10 : 0,
    fix: blocked
      ? "GPTBot is blocked in robots.txt. Remove the Disallow rule for GPTBot to allow ChatGPT to index your site."
      : "GPTBot is allowed — ChatGPT can crawl your site.",
    type: "AUTO",
  };
}

/** 32 — ClaudeBot not blocked */
function checkClaudebotAllowed(site: SiteData): CheckResult {
  if (!site.robotsTxt) {
    return {
      check_id: "claudebot_allowed",
      category: "G",
      name: "ClaudeBot/Brave not blocked",
      pass: true,
      score: 100,
      details: { robots_txt_exists: false },
      penalty: 0,
      fix: "No robots.txt — ClaudeBot is not blocked.",
      type: "AUTO",
    };
  }

  const claudeBlocked = isAgentBlocked(site.robotsTxt, "ClaudeBot");
  const anthropicBlocked = isAgentBlocked(site.robotsTxt, "anthropic-ai");
  const blocked = claudeBlocked || anthropicBlocked;

  return {
    check_id: "claudebot_allowed",
    category: "G",
    name: "ClaudeBot/Brave not blocked",
    pass: !blocked,
    score: blocked ? 0 : 100,
    details: { claude_blocked: claudeBlocked, anthropic_blocked: anthropicBlocked },
    penalty: blocked ? -10 : 0,
    fix: blocked
      ? "ClaudeBot or anthropic-ai is blocked in robots.txt. Remove the block to allow Claude to reference your site."
      : "ClaudeBot is allowed — Claude can find your content.",
    type: "AUTO",
  };
}

/** 33 — PerplexityBot not blocked */
function checkPerplexitybotAllowed(site: SiteData): CheckResult {
  if (!site.robotsTxt) {
    return {
      check_id: "perplexitybot_allowed",
      category: "G",
      name: "PerplexityBot not blocked",
      pass: true,
      score: 100,
      details: { robots_txt_exists: false },
      penalty: 0,
      fix: "No robots.txt — PerplexityBot is not blocked.",
      type: "AUTO",
    };
  }

  const blocked = isAgentBlocked(site.robotsTxt, "PerplexityBot");

  return {
    check_id: "perplexitybot_allowed",
    category: "G",
    name: "PerplexityBot not blocked",
    pass: !blocked,
    score: blocked ? 0 : 100,
    details: { blocked },
    penalty: blocked ? -5 : 0,
    fix: blocked
      ? "PerplexityBot is blocked in robots.txt. Remove the block to appear in Perplexity answers."
      : "PerplexityBot is allowed — Perplexity can index your site.",
    type: "AUTO",
  };
}

/** 34 — llms.txt lists key pages with descriptions */
function checkLlmsTxtQuality(site: SiteData): CheckResult {
  if (!site.llmsTxt) {
    return {
      check_id: "llms_txt_quality",
      category: "G",
      name: "llms.txt lists key pages with descriptions",
      pass: false,
      score: 0,
      details: { exists: false },
      penalty: 0,
      fix: "No llms.txt found. Create one at /llms.txt with your key pages and descriptions in markdown format.",
      type: "AUTO",
    };
  }

  const lines = site.llmsTxt.split("\n").filter((l) => l.trim().length > 0);
  const hasTitle = /^#\s+/.test(site.llmsTxt);
  const hasLinks = /\[.*?\]\(.*?\)/g.test(site.llmsTxt) || /https?:\/\//g.test(site.llmsTxt);
  const hasDescriptions = lines.length > 3;

  const pass = hasTitle && hasLinks && hasDescriptions;

  return {
    check_id: "llms_txt_quality",
    category: "G",
    name: "llms.txt lists key pages with descriptions",
    pass,
    score: pass ? 100 : 40,
    details: { has_title: hasTitle, has_links: hasLinks, has_descriptions: hasDescriptions, line_count: lines.length },
    penalty: 0,
    fix: pass
      ? "llms.txt is well-structured with title, links, and descriptions."
      : "llms.txt exists but could be improved. Add a title (# heading), link your key pages, and describe each one.",
    type: "AUTO",
  };
}

export function runCrawlPermissionChecks(site: SiteData): CheckResult[] {
  return [
    checkGptbotAllowed(site),
    checkClaudebotAllowed(site),
    checkPerplexitybotAllowed(site),
    checkLlmsTxtQuality(site),
  ];
}
