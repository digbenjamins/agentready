import type { CheckResult, SiteData } from "./types";

/** 23 — HTTPS enabled */
function checkHttps(site: SiteData): CheckResult {
  const pass = site.url.startsWith("https://");

  return {
    check_id: "https",
    category: "E",
    name: "HTTPS enabled",
    pass,
    score: pass ? 100 : 0,
    details: { url: site.url, is_https: pass },
    penalty: pass ? 0 : -15,
    fix: pass
      ? "Site uses HTTPS — secure connection confirmed."
      : "Site is not using HTTPS. Install an SSL certificate — most hosting providers offer free ones via Let's Encrypt.",
    type: "AUTO",
  };
}

/** 24 — E-E-A-T signals present (SEMI) */
function checkEeatSignals(): CheckResult {
  return {
    check_id: "eeat_signals",
    category: "E",
    name: "E-E-A-T signals present (author, expertise)",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate Experience, Expertise, Authoritativeness, and Trustworthiness signals.",
    type: "SEMI",
  };
}

/** 25 — Privacy policy / legal pages present */
function checkPrivacyPolicy(site: SiteData): CheckResult {
  const legalLinkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*(?:privacy|privacybeleid|gdpr|cookie|terms|voorwaarden|disclaimer|legal|juridisch)[^"']*)["']/gi;
  const found: string[] = [];
  let match;
  while ((match = legalLinkRegex.exec(site.html)) !== null) {
    found.push(match[1]);
  }
  const uniqueFound = [...new Set(found)];
  const pass = uniqueFound.length > 0;

  return {
    check_id: "privacy_policy",
    category: "E",
    name: "Privacy policy / legal pages present",
    pass,
    score: pass ? 100 : 0,
    details: { legal_links: uniqueFound.slice(0, 5) },
    penalty: 0,
    fix: pass
      ? `Legal pages found: ${uniqueFound.slice(0, 3).join(", ")}`
      : "No privacy policy or legal page links found. Add a privacy/cookie policy — it signals trustworthiness to AI.",
    type: "AUTO",
  };
}

/** 26 — Outbound links to authoritative sources (SEMI) */
function checkExternalLinks(): CheckResult {
  return {
    check_id: "external_links",
    category: "E",
    name: "Outbound links to authoritative sources",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate if outbound links point to authoritative, relevant sources.",
    type: "SEMI",
  };
}

export function runTrustChecks(site: SiteData): CheckResult[] {
  return [
    checkHttps(site),
    checkEeatSignals(),
    checkPrivacyPolicy(site),
    checkExternalLinks(),
  ];
}
