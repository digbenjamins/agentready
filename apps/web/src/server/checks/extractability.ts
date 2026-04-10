import type { CheckResult, SiteData } from "./types";
import { extractMetaTag } from "./utils";

/** 35 — Content updated within 3 months */
function checkContentFreshness(site: SiteData): CheckResult {
  // Check for date signals in meta tags and HTML
  const lastModified = site.headers["last-modified"];
  const articleModified = extractMetaTag(site.html, "article:modified_time");
  const articlePublished = extractMetaTag(site.html, "article:published_time");
  const dateString = lastModified || articleModified || articlePublished;

  let pass = false;
  let daysSince: number | null = null;

  if (dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      pass = daysSince <= 90;
    }
  }

  return {
    check_id: "content_freshness",
    category: "H",
    name: "Content updated within 3 months",
    pass,
    score: pass ? 100 : dateString ? 30 : 50,
    details: { last_date: dateString || null, days_since: daysSince },
    penalty: 0,
    fix: pass
      ? `Content was updated ${daysSince} days ago — within the 3-month freshness window.`
      : dateString
        ? `Content appears to be ${daysSince} days old — beyond the 3-month freshness cliff. Update your key pages regularly.`
        : "No date signals found (Last-Modified header or article:modified_time). Add date metadata so AI can assess freshness.",
    type: "AUTO",
  };
}

/** 36 — Content structure converts cleanly to markdown */
function checkMarkdownFriendly(site: SiteData): CheckResult {
  const signals = {
    has_headings: /<h[1-6]/i.test(site.html),
    has_paragraphs: /<p[>\s]/i.test(site.html),
    has_lists: /<(ul|ol)[>\s]/i.test(site.html),
    no_table_layout: !/<table[^>]*(?:role\s*=\s*["']presentation["']|class\s*=\s*["'][^"']*layout[^"']*["'])/i.test(site.html),
    semantic_html: /<(article|section|main|header|nav|aside)[>\s]/i.test(site.html),
  };

  const signalCount = Object.values(signals).filter(Boolean).length;
  const pass = signalCount >= 3;

  return {
    check_id: "markdown_friendly",
    category: "H",
    name: "Content structure converts cleanly to markdown",
    pass,
    score: Math.round((signalCount / 5) * 100),
    details: signals,
    penalty: 0,
    fix: pass
      ? "Content uses semantic HTML that converts well to markdown."
      : "Content structure could be more markdown-friendly. Use semantic HTML: headings, paragraphs, lists, and section tags.",
    type: "AUTO",
  };
}

/** 37 — Key paragraphs are self-contained, quotable (SEMI) */
function checkSnippetReady(): CheckResult {
  return {
    check_id: "snippet_ready",
    category: "H",
    name: "Key paragraphs are self-contained and quotable",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate if key paragraphs can stand alone as quotable snippets.",
    type: "SEMI",
  };
}

export function runExtractabilityChecks(site: SiteData): CheckResult[] {
  return [
    checkContentFreshness(site),
    checkMarkdownFriendly(site),
    checkSnippetReady(),
  ];
}
