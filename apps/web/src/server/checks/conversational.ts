import type { CheckResult, SiteData } from "./types";

/** 27 — FAQ section or Q&A structured data */
function checkFaqSection(site: SiteData): CheckResult {
  // Check for FAQPage schema
  const hasFaqSchema = /FAQPage/i.test(site.html);

  // Check for FAQ-like content patterns
  const hasFaqHeading = /<h[1-6][^>]*>[^<]*(FAQ|Veelgestelde vragen|Frequently Asked|Vragen)[^<]*<\/h[1-6]>/i.test(site.html);

  // Check for Q&A patterns (details/summary or question-answer divs)
  const hasQaPattern = /<(details|summary|dt|dd)/i.test(site.html)
    || /class\s*=\s*["'][^"']*(?:faq|question|answer|accordion)[^"']*["']/i.test(site.html);

  const pass = hasFaqSchema || hasFaqHeading || hasQaPattern;

  return {
    check_id: "faq_section",
    category: "F",
    name: "FAQ section or Q&A structured data",
    pass,
    score: pass ? 100 : 0,
    details: { has_faq_schema: hasFaqSchema, has_faq_heading: hasFaqHeading, has_qa_pattern: hasQaPattern },
    penalty: 0,
    fix: pass
      ? "FAQ or Q&A content detected — great for AI to pull direct answers."
      : "No FAQ section found. Add a FAQ with common questions — AI loves structured Q&A for direct answers.",
    type: "AUTO",
  };
}

/** 28 — Clear contact/CTA options */
function checkContactOptions(site: SiteData): CheckResult {
  const signals = {
    email: /mailto:/i.test(site.html),
    phone: /tel:/i.test(site.html),
    contact_link: /<a\s+[^>]*href\s*=\s*["'][^"']*(?:contact|kontakt)[^"']*["']/i.test(site.html),
    form: /<form/i.test(site.html),
    cta_button: /class\s*=\s*["'][^"']*(?:cta|call-to-action|btn-primary)[^"']*["']/i.test(site.html),
  };

  const signalCount = Object.values(signals).filter(Boolean).length;
  const pass = signalCount >= 2;

  return {
    check_id: "contact_options",
    category: "F",
    name: "Clear contact/CTA options",
    pass,
    score: Math.min(Math.round((signalCount / 3) * 100), 100),
    details: signals,
    penalty: 0,
    fix: pass
      ? `Contact options found: ${Object.entries(signals).filter(([, v]) => v).map(([k]) => k).join(", ")}.`
      : "Few contact options detected. Add visible email, phone, or contact links so AI can direct users to you.",
    type: "AUTO",
  };
}

/** 29 — Clear service/product descriptions (SEMI) */
function checkServiceDescriptions(): CheckResult {
  return {
    check_id: "service_descriptions",
    category: "F",
    name: "Clear service/product descriptions",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate if services/products are clearly described.",
    type: "SEMI",
  };
}

/** 30 — Unique value proposition identifiable (SEMI) */
function checkUniqueValueProp(): CheckResult {
  return {
    check_id: "unique_value_prop",
    category: "F",
    name: "Unique value proposition identifiable",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate if a unique value proposition is clearly stated.",
    type: "SEMI",
  };
}

export function runConversationalChecks(site: SiteData): CheckResult[] {
  return [
    checkFaqSection(site),
    checkContactOptions(site),
    checkServiceDescriptions(),
    checkUniqueValueProp(),
  ];
}
