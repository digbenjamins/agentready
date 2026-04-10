import type { CheckResult, SiteData } from "./types";

/** 13 — Healthy internal link structure */
function checkInternalLinks(site: SiteData): CheckResult {
  const linkRegex = /<a\s+[^>]*href\s*=\s*["']([^"'#]*?)["'][^>]*>/gi;
  const links: string[] = [];
  let match;
  const hostname = new URL(site.url).hostname;

  while ((match = linkRegex.exec(site.html)) !== null) {
    const href = match[1].trim();
    if (!href || href === "/") continue;
    try {
      const resolved = new URL(href, site.url);
      if (resolved.hostname === hostname) {
        links.push(resolved.pathname);
      }
    } catch {
      if (href.startsWith("/")) {
        links.push(href);
      }
    }
  }

  const uniqueLinks = [...new Set(links)];
  const pass = uniqueLinks.length >= 3;

  return {
    check_id: "internal_links",
    category: "C",
    name: "Healthy internal link structure",
    pass,
    score: pass ? 100 : Math.min(Math.round((uniqueLinks.length / 3) * 100), 99),
    details: { internal_link_count: uniqueLinks.length, sample: uniqueLinks.slice(0, 10) },
    penalty: 0,
    fix: pass
      ? `Found ${uniqueLinks.length} unique internal links — good for crawlability.`
      : `Only ${uniqueLinks.length} internal links found. Add links between key pages so crawlers can discover your content.`,
    type: "AUTO",
  };
}

/** 14 — Canonical URL set correctly */
function checkCanonicalUrl(site: SiteData): CheckResult {
  const canonicalMatch = site.html.match(/<link\s+[^>]*rel\s*=\s*["']canonical["'][^>]*href\s*=\s*["']([^"']*)["']/i)
    || site.html.match(/<link\s+[^>]*href\s*=\s*["']([^"']*)["'][^>]*rel\s*=\s*["']canonical["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;
  const pass = canonical !== null && canonical.trim().length > 0;

  return {
    check_id: "canonical_url",
    category: "C",
    name: "Canonical URL set correctly",
    pass,
    score: pass ? 100 : 0,
    details: { canonical },
    penalty: 0,
    fix: pass
      ? `Canonical URL set to: ${canonical}`
      : "No canonical URL found. Add <link rel=\"canonical\" href=\"...\"> to prevent duplicate content issues.",
    type: "AUTO",
  };
}

/** 15 — Mobile-friendly / responsive meta tag */
function checkMobileFriendly(site: SiteData): CheckResult {
  const viewportMatch = site.html.match(/<meta\s+[^>]*name\s*=\s*["']viewport["'][^>]*>/i);
  const pass = viewportMatch !== null;

  return {
    check_id: "mobile_friendly",
    category: "C",
    name: "Mobile-friendly / responsive meta tag",
    pass,
    score: pass ? 100 : 0,
    details: { has_viewport: pass },
    penalty: 0,
    fix: pass
      ? "Viewport meta tag found — site is mobile-responsive."
      : "No viewport meta tag. Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.",
    type: "AUTO",
  };
}

/** 16 — Page loads within acceptable time */
function checkPageSpeed(site: SiteData): CheckResult {
  const responseTime = site.responseTime;
  const pass = responseTime < 3000;
  const fast = responseTime < 1000;

  return {
    check_id: "page_speed",
    category: "C",
    name: "Page loads within acceptable time",
    pass,
    score: fast ? 100 : pass ? 70 : Math.max(0, 100 - Math.round(responseTime / 100)),
    details: { response_time_ms: responseTime },
    penalty: pass ? 0 : -5,
    fix: pass
      ? `Page loaded in ${responseTime}ms${fast ? " — fast!" : "."}`
      : `Page took ${responseTime}ms to load. Aim for under 3 seconds. Optimize images, enable caching, and use a CDN.`,
    type: "AUTO",
  };
}

/** 17 — Clean, descriptive URL slugs */
function checkUrlStructure(site: SiteData): CheckResult {
  const url = new URL(site.url);
  const path = url.pathname;

  const issues: string[] = [];
  if (/[A-Z]/.test(path)) issues.push("Contains uppercase letters");
  if (/_/.test(path)) issues.push("Contains underscores (use hyphens)");
  if (/\.(php|asp|aspx|jsp|cgi)$/i.test(path)) issues.push("Contains file extension in URL");
  if (/[?&]/.test(url.search) && url.search.length > 50) issues.push("Long query string parameters");

  const pass = issues.length === 0;

  return {
    check_id: "url_structure",
    category: "C",
    name: "Clean, descriptive URL slugs",
    pass,
    score: pass ? 100 : Math.max(0, 100 - issues.length * 25),
    details: { url: site.url, issues },
    penalty: 0,
    fix: pass
      ? "URL structure is clean and descriptive."
      : `URL issues: ${issues.join("; ")}. Use lowercase, hyphen-separated, human-readable URLs.`,
    type: "AUTO",
  };
}

export function runStructureChecks(site: SiteData): CheckResult[] {
  return [
    checkInternalLinks(site),
    checkCanonicalUrl(site),
    checkMobileFriendly(site),
    checkPageSpeed(site),
    checkUrlStructure(site),
  ];
}
