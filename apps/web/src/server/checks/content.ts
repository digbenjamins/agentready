import type { CheckResult, SiteData } from "./types";
import { extractHeadings, extractBodyText, countWords, extractMetaTag } from "./utils";

/** 06 — Logical heading hierarchy */
function checkHeadingStructure(site: SiteData): CheckResult {
  const headings = extractHeadings(site.html);
  const h1Count = headings.filter((h) => h.level === 1).length;
  const hasH1 = h1Count >= 1;
  const singleH1 = h1Count === 1;

  // Check if hierarchy is logical (no skipping levels)
  let hierarchyValid = true;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      hierarchyValid = false;
      break;
    }
  }

  const pass = hasH1 && singleH1 && hierarchyValid;
  const issues: string[] = [];
  if (!hasH1) issues.push("No H1 found");
  if (h1Count > 1) issues.push(`${h1Count} H1 tags found (should be 1)`);
  if (!hierarchyValid) issues.push("Heading levels skip (e.g. H1 → H3)");

  return {
    check_id: "heading_structure",
    category: "B",
    name: "Logical heading hierarchy (H1 > H2 > H3)",
    pass,
    score: pass ? 100 : hasH1 ? 50 : 0,
    details: { h1_count: h1Count, heading_count: headings.length, hierarchy_valid: hierarchyValid, issues },
    penalty: pass ? 0 : -5,
    fix: pass
      ? `Heading structure is clean: 1 H1, ${headings.length} total headings.`
      : `Heading issues: ${issues.join("; ")}. Use exactly one H1, then H2 > H3 in order.`,
    type: "AUTO",
  };
}

/** 07 — Meta description present */
function checkMetaDescription(site: SiteData): CheckResult {
  const desc = extractMetaTag(site.html, "description");
  const exists = desc !== null && desc.trim().length > 0;
  const length = desc?.trim().length || 0;
  const goodLength = length >= 50 && length <= 160;
  const pass = exists && goodLength;

  return {
    check_id: "meta_description",
    category: "B",
    name: "Meta description present and adequate length",
    pass,
    score: pass ? 100 : exists ? 50 : 0,
    details: { exists, length, good_length: goodLength },
    penalty: pass ? 0 : -5,
    fix: pass
      ? `Meta description found (${length} chars).`
      : !exists
        ? "No meta description found. Add <meta name=\"description\" content=\"...\"> with 50-160 characters."
        : `Meta description is ${length} chars (ideal: 50-160). Adjust the length.`,
    type: "AUTO",
  };
}

/** 08 — Sufficient content length */
function checkContentLength(site: SiteData): CheckResult {
  const bodyText = extractBodyText(site.html);
  const wordCount = countWords(bodyText);
  const pass = wordCount >= 300;

  return {
    check_id: "content_length",
    category: "B",
    name: "Sufficient content length (>300 words)",
    pass,
    score: pass ? 100 : Math.min(Math.round((wordCount / 300) * 100), 99),
    details: { word_count: wordCount },
    penalty: 0,
    fix: pass
      ? `Page has ${wordCount} words — enough for AI to summarize.`
      : `Only ${wordCount} words found. AI needs 300+ words to understand and cite your content.`,
    type: "AUTO",
  };
}

/** 09 — Clear, plain language (SEMI — needs LLM) */
function checkLanguageClarity(): CheckResult {
  return {
    check_id: "language_clarity",
    category: "B",
    name: "Clear, plain language (readability)",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM analysis. Will be implemented in phase 2.",
    type: "SEMI",
  };
}

/** 10 — Content includes statistics */
function checkStatisticsPresent(): CheckResult {
  return {
    check_id: "statistics_present",
    category: "B",
    name: "Content includes statistics/data",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM analysis. Statistics boost AI visibility by +37%.",
    type: "SEMI",
  };
}

/** 11 — Content includes quotations */
function checkQuotationsPresent(): CheckResult {
  return {
    check_id: "quotations_present",
    category: "B",
    name: "Content includes quotations",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM analysis. Quotations boost AI visibility by +40%.",
    type: "SEMI",
  };
}

/** 12 — No keyword stuffing */
function checkKeywordStuffing(): CheckResult {
  return {
    check_id: "keyword_stuffing",
    category: "B",
    name: "No keyword stuffing",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM analysis. Keyword stuffing reduces AI visibility by -30.3%.",
    type: "SEMI",
  };
}

export function runContentChecks(site: SiteData): CheckResult[] {
  return [
    checkHeadingStructure(site),
    checkMetaDescription(site),
    checkContentLength(site),
    checkLanguageClarity(),
    checkStatisticsPresent(),
    checkQuotationsPresent(),
    checkKeywordStuffing(),
  ];
}
