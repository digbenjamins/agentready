import type { CheckResult, SiteData } from "./types";

/** 18 — Schema.org structured data present */
function checkSchemaOrg(site: SiteData): CheckResult {
  // Check for JSON-LD
  const jsonLdMatches = site.html.match(/<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const hasJsonLd = jsonLdMatches !== null && jsonLdMatches.length > 0;

  // Check for microdata
  const hasMicrodata = /itemscope/i.test(site.html) && /itemtype\s*=\s*["']https?:\/\/schema\.org/i.test(site.html);

  const pass = hasJsonLd || hasMicrodata;
  const types: string[] = [];

  if (hasJsonLd && jsonLdMatches) {
    for (const block of jsonLdMatches) {
      const typeMatch = block.match(/"@type"\s*:\s*"([^"]+)"/);
      if (typeMatch) types.push(typeMatch[1]);
    }
  }

  return {
    check_id: "schema_org",
    category: "D",
    name: "Schema.org structured data present",
    pass,
    score: pass ? 100 : 0,
    details: { has_json_ld: hasJsonLd, has_microdata: hasMicrodata, types },
    penalty: pass ? 0 : -10,
    fix: pass
      ? `Schema.org data found: ${types.length > 0 ? types.join(", ") : "microdata detected"}.`
      : "No Schema.org structured data found. Add JSON-LD with your Organization, LocalBusiness, or Product type.",
    type: "AUTO",
  };
}

/** 19 — Open Graph tags present */
function checkOpenGraph(site: SiteData): CheckResult {
  const ogTags = ["og:title", "og:description", "og:image", "og:url", "og:type"];
  const found: string[] = [];
  const missing: string[] = [];

  for (const tag of ogTags) {
    const regex = new RegExp(`<meta\\s+[^>]*property\\s*=\\s*["']${tag}["'][^>]*>`, "i");
    if (regex.test(site.html)) {
      found.push(tag);
    } else {
      missing.push(tag);
    }
  }

  const pass = found.length >= 3;

  return {
    check_id: "open_graph",
    category: "D",
    name: "Open Graph tags present",
    pass,
    score: Math.round((found.length / ogTags.length) * 100),
    details: { found, missing },
    penalty: 0,
    fix: pass
      ? `Open Graph tags found: ${found.join(", ")}.`
      : `Missing OG tags: ${missing.join(", ")}. Add these to control how AI and social platforms display your site.`,
    type: "AUTO",
  };
}

/** 20 — Business name, address, contact findable (SEMI) */
function checkBusinessInfo(): CheckResult {
  return {
    check_id: "business_info",
    category: "D",
    name: "Business name, address, contact findable",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate if business info is clearly identifiable.",
    type: "SEMI",
  };
}

/** 21 — About page exists */
function checkAboutPage(site: SiteData): CheckResult {
  const aboutLinkRegex = /<a\s+[^>]*href\s*=\s*["']([^"']*(?:about|over-ons|over|wie-zijn-wij|about-us)[^"']*)["']/gi;
  const matches: string[] = [];
  let match;
  while ((match = aboutLinkRegex.exec(site.html)) !== null) {
    matches.push(match[1]);
  }

  const pass = matches.length > 0;

  return {
    check_id: "about_page",
    category: "D",
    name: "About page exists with entity info",
    pass,
    score: pass ? 100 : 0,
    details: { about_links: matches.slice(0, 5) },
    penalty: 0,
    fix: pass
      ? `About page link found: ${matches[0]}`
      : "No about page link found. Add an /about or /over-ons page so AI can identify your entity.",
    type: "AUTO",
  };
}

/** 22 — Consistent NAP (SEMI) */
function checkConsistentNap(): CheckResult {
  return {
    check_id: "consistent_nap",
    category: "D",
    name: "Consistent NAP (Name, Address, Phone)",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to verify Name, Address, Phone consistency across pages.",
    type: "SEMI",
  };
}

export function runEntityChecks(site: SiteData): CheckResult[] {
  return [
    checkSchemaOrg(site),
    checkOpenGraph(site),
    checkBusinessInfo(),
    checkAboutPage(site),
    checkConsistentNap(),
  ];
}
