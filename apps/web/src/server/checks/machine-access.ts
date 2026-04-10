import type { CheckResult, SiteData } from "./types";
import { countWords, extractBodyText } from "./utils";

/** 01 — Homepage returns HTTP 200 */
function checkHttpStatus(site: SiteData): CheckResult {
  const pass = site.statusCode === 200;
  return {
    check_id: "http_status",
    category: "A",
    name: "Homepage returns HTTP 200",
    pass,
    score: pass ? 100 : 0,
    details: { status: site.statusCode },
    penalty: pass ? 0 : -15,
    fix: pass
      ? "Homepage is accessible."
      : "Your homepage returned a non-200 status. Check server logs, fix redirect loops, and canonicalize www vs non-www.",
    type: "AUTO",
  };
}

/** 02 — Core content visible without JavaScript */
function checkSsrContent(site: SiteData): CheckResult {
  const bodyText = extractBodyText(site.html);
  const wordCount = countWords(bodyText);
  const pass = wordCount > 100;
  return {
    check_id: "ssr_content",
    category: "A",
    name: "Core content visible without JavaScript",
    pass,
    score: pass ? 100 : Math.min(Math.round((wordCount / 100) * 100), 99),
    details: { word_count: wordCount },
    penalty: pass ? 0 : -10,
    fix: pass
      ? `Found ${wordCount} words in raw HTML without JS rendering.`
      : `Only ${wordCount} words found without JS. AI crawlers don't render JS — use SSR or static HTML for core content.`,
    type: "AUTO",
  };
}

/** 03 — robots.txt doesn't block key pages */
function checkRobotsTxt(site: SiteData): CheckResult {
  if (!site.robotsTxt) {
    return {
      check_id: "robots_txt",
      category: "A",
      name: "robots.txt doesn't block key pages",
      pass: true,
      score: 80,
      details: { exists: false, blocked_paths: [] },
      penalty: 0,
      fix: "No robots.txt found — nothing is blocked, but consider adding one to explicitly allow AI crawlers.",
      type: "AUTO",
    };
  }

  const lines = site.robotsTxt.split("\n");
  const blockedPaths: string[] = [];
  const keyPaths = ["/", "/about", "/diensten", "/services", "/contact", "/products", "/pricing"];
  let currentAgent = "";

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith("user-agent:")) {
      currentAgent = trimmed.replace("user-agent:", "").trim();
    }
    if (trimmed.startsWith("disallow:")) {
      const path = trimmed.replace("disallow:", "").trim();
      if (path && (currentAgent === "*" || currentAgent === "gptbot" || currentAgent === "claudebot" || currentAgent === "chatgpt-user")) {
        for (const key of keyPaths) {
          if (key.startsWith(path) || path === "/") {
            blockedPaths.push(`${path} (agent: ${currentAgent})`);
          }
        }
      }
    }
  }

  const pass = blockedPaths.length === 0;
  return {
    check_id: "robots_txt",
    category: "A",
    name: "robots.txt doesn't block key pages",
    pass,
    score: pass ? 100 : 0,
    details: { exists: true, blocked_paths: blockedPaths },
    penalty: pass ? 0 : -10,
    fix: pass
      ? "robots.txt exists and doesn't block key pages."
      : `robots.txt blocks: ${blockedPaths.join(", ")}. Remove unnecessary Disallow rules for AI crawlers.`,
    type: "AUTO",
  };
}

/** 04 — llms.txt file present */
function checkLlmsTxt(site: SiteData): CheckResult {
  const exists = site.llmsTxt !== null && site.llmsTxt.trim().length > 0;
  let pagesListed = 0;

  if (exists && site.llmsTxt) {
    const urlMatches = site.llmsTxt.match(/https?:\/\/[^\s)]+/g);
    const mdLinkMatches = site.llmsTxt.match(/\[.*?\]\(.*?\)/g);
    pagesListed = (urlMatches?.length || 0) + (mdLinkMatches?.length || 0);
  }

  return {
    check_id: "llms_txt",
    category: "A",
    name: "llms.txt file present",
    pass: exists,
    score: exists ? 100 : 0,
    details: { exists, pages_listed: pagesListed },
    penalty: 0,
    fix: exists
      ? `Found llms.txt with ${pagesListed} pages listed.`
      : "No llms.txt found. Create /llms.txt listing your 5-10 most important pages in markdown format.",
    type: "AUTO",
  };
}

/** 05 — Sitemap present and reachable */
function checkSitemap(site: SiteData): CheckResult {
  const exists = site.sitemapXml !== null;
  let urlCount = 0;

  if (exists && site.sitemapXml) {
    const locMatches = site.sitemapXml.match(/<loc>/gi);
    urlCount = locMatches?.length || 0;
  }

  const pass = exists && urlCount > 0;
  return {
    check_id: "sitemap",
    category: "A",
    name: "Sitemap present and reachable",
    pass,
    score: pass ? 100 : 0,
    details: { exists, url_count: urlCount },
    penalty: 0,
    fix: pass
      ? `Sitemap found with ${urlCount} URLs.`
      : "No valid sitemap found. Add /sitemap.xml — most CMS platforms (WordPress, Next.js) can generate this automatically.",
    type: "AUTO",
  };
}

export function runMachineAccessChecks(site: SiteData): CheckResult[] {
  return [
    checkHttpStatus(site),
    checkSsrContent(site),
    checkRobotsTxt(site),
    checkLlmsTxt(site),
    checkSitemap(site),
  ];
}
