import type { CheckResult, SiteData } from "./types";

/** 42 — Server response time < 500ms */
function checkResponseTime(site: SiteData): CheckResult {
  const pass = site.responseTime < 500;
  const acceptable = site.responseTime < 1000;

  return {
    check_id: "response_time",
    category: "J",
    name: "Server response time < 500ms",
    pass,
    score: pass ? 100 : acceptable ? 60 : Math.max(0, 100 - Math.round(site.responseTime / 50)),
    details: { response_time_ms: site.responseTime },
    penalty: pass ? 0 : -5,
    fix: pass
      ? `Server responded in ${site.responseTime}ms — fast enough for AI crawlers.`
      : `Server took ${site.responseTime}ms to respond. AI crawlers may skip slow sites. Optimize server performance.`,
    type: "AUTO",
  };
}

/** 43 — Clean HTML without critical errors */
function checkHtmlValid(site: SiteData): CheckResult {
  const issues: string[] = [];

  // Check for DOCTYPE
  if (!/<!DOCTYPE\s+html/i.test(site.html)) issues.push("Missing <!DOCTYPE html>");

  // Check for html lang attribute
  if (!/<html[^>]*\slang\s*=/i.test(site.html)) issues.push("Missing lang attribute on <html>");

  // Check for charset
  if (!/<meta[^>]*charset/i.test(site.html) && !/charset\s*=/i.test(site.headers["content-type"] || "")) {
    issues.push("Missing charset declaration");
  }

  // Check for title
  if (!/<title[^>]*>[^<]+<\/title>/i.test(site.html)) issues.push("Missing or empty <title> tag");

  // Check for unclosed obvious tags (rough heuristic)
  const openBody = (site.html.match(/<body/gi) || []).length;
  const closeBody = (site.html.match(/<\/body>/gi) || []).length;
  if (openBody > 0 && closeBody === 0) issues.push("Unclosed <body> tag");

  const pass = issues.length === 0;

  return {
    check_id: "html_valid",
    category: "J",
    name: "Clean HTML without critical errors",
    pass,
    score: Math.max(0, 100 - issues.length * 20),
    details: { issues },
    penalty: 0,
    fix: pass
      ? "HTML is clean with all essential elements present."
      : `HTML issues found: ${issues.join("; ")}. Fix these for better AI parsing.`,
    type: "AUTO",
  };
}

/** 44 — Good text-to-HTML ratio (>25%) */
function checkTextToHtmlRatio(site: SiteData): CheckResult {
  const htmlLength = site.html.length;
  if (htmlLength === 0) {
    return {
      check_id: "text_to_html_ratio",
      category: "J",
      name: "Good text-to-HTML ratio (>25%)",
      pass: false,
      score: 0,
      details: { ratio: 0, html_size: 0, text_size: 0 },
      penalty: 0,
      fix: "No HTML content received.",
      type: "AUTO",
    };
  }

  const textOnly = site.html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const textLength = textOnly.length;
  const ratio = Math.round((textLength / htmlLength) * 100);
  const pass = ratio >= 25;

  return {
    check_id: "text_to_html_ratio",
    category: "J",
    name: "Good text-to-HTML ratio (>25%)",
    pass,
    score: pass ? 100 : Math.min(Math.round((ratio / 25) * 100), 99),
    details: { ratio, html_size: htmlLength, text_size: textLength },
    penalty: 0,
    fix: pass
      ? `Text-to-HTML ratio is ${ratio}% — content-rich page.`
      : `Text-to-HTML ratio is only ${ratio}%. Reduce inline CSS/JS and boilerplate. AI crawlers prefer content-dense pages.`,
    type: "AUTO",
  };
}

export function runTechnicalChecks(site: SiteData): CheckResult[] {
  return [
    checkResponseTime(site),
    checkHtmlValid(site),
    checkTextToHtmlRatio(site),
  ];
}
