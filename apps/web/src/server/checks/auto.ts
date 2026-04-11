import type { CheckResult, SiteData } from "./types";
import { countWords, extractBodyText, extractHeadings, extractMetaTag, fetchUrl } from "../utils";

// ── A: Machine Access ────────────────────────────────────

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

// ── B: Content ───────────────────────────────────────────

function checkHeadingStructure(site: SiteData): CheckResult {
  const headings = extractHeadings(site.html);
  const h1Count = headings.filter((h) => h.level === 1).length;
  const hasH1 = h1Count >= 1;
  const singleH1 = h1Count === 1;

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

// ── C: Structure & Architecture ──────────────────────────

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

// ── D: Entities & Semantics ──────────────────────────────

function checkSchemaOrg(site: SiteData): CheckResult {
  const jsonLdMatches = site.html.match(/<script\s+type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  const hasJsonLd = jsonLdMatches !== null && jsonLdMatches.length > 0;
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

// ── E: Trust & Authority ─────────────────────────────────

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

// ── F: Conversational Readiness ──────────────────────────

function checkFaqSection(site: SiteData): CheckResult {
  const hasFaqSchema = /FAQPage/i.test(site.html);
  const hasFaqHeading = /<h[1-6][^>]*>[^<]*(FAQ|Veelgestelde vragen|Frequently Asked|Vragen)[^<]*<\/h[1-6]>/i.test(site.html);
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

// ── G: Crawl Permissions ─────────────────────────────────

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

  if (!agentAllowed) return true;
  if (!wildcardAllowed) return true;
  return false;
}

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

// ── H: Extractability ────────────────────────────────────

function checkContentFreshness(site: SiteData): CheckResult {
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

// ── J: Technical Performance ─────────────────────────────

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

function checkHtmlValid(site: SiteData): CheckResult {
  const issues: string[] = [];

  if (!/<!DOCTYPE\s+html/i.test(site.html)) issues.push("Missing <!DOCTYPE html>");
  if (!/<html[^>]*\slang\s*=/i.test(site.html)) issues.push("Missing lang attribute on <html>");
  if (!/<meta[^>]*charset/i.test(site.html) && !/charset\s*=/i.test(site.headers["content-type"] || "")) {
    issues.push("Missing charset declaration");
  }
  if (!/<title[^>]*>[^<]+<\/title>/i.test(site.html)) issues.push("Missing or empty <title> tag");

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

// ── K: Agent Readiness ───────────────────────────────────

async function checkSkillMdBoth(site: SiteData): Promise<CheckResult[]> {
  const res = await fetchUrl(`${site.url}/skill.md`);

  const present: CheckResult = {
    check_id: "skill_md",
    category: "K",
    name: "skill.md file present",
    pass: res.ok,
    score: res.ok ? 100 : 0,
    details: { status: res.status, content_length: res.text.length },
    penalty: res.ok ? 0 : -5,
    fix: res.ok
      ? "Found skill.md — AI agents can discover this site's capabilities."
      : `skill.md not found (HTTP ${res.status || "unreachable"}). Create a /skill.md file describing your product for AI agents.`,
    type: "AUTO",
  };

  // Parse YAML frontmatter for `name:` field
  let hasName = false;
  let nameValue: string | null = null;
  if (res.ok && res.text) {
    const fm = res.text.match(/^---\s*\n([\s\S]*?)\n---/);
    if (fm) {
      const nameLine = fm[1].match(/^name\s*:\s*(.+?)\s*$/m);
      if (nameLine && nameLine[1].trim().length > 0) {
        hasName = true;
        nameValue = nameLine[1].trim();
      }
    }
  }

  const nameCheck: CheckResult = {
    check_id: "skill_md_name",
    category: "K",
    name: "skill.md provides a name",
    pass: hasName,
    score: hasName ? 100 : 0,
    details: { has_frontmatter_name: hasName, name: nameValue },
    penalty: hasName ? 0 : -3,
    fix: hasName
      ? `skill.md declares name "${nameValue}".`
      : res.ok
        ? "skill.md exists but is missing a `name` field in YAML frontmatter. Add `---\\nname: your-product\\n---` at the top."
        : "Create skill.md with YAML frontmatter including a `name` field identifying your product.",
    type: "AUTO",
  };

  // Validate name format: lowercase letters, numbers, hyphens only
  const nameFormatValid = hasName && /^[a-z0-9-]+$/.test(nameValue!);
  const formatCheck: CheckResult = {
    check_id: "skill_md_name_format",
    category: "K",
    name: "skill.md name format valid",
    pass: nameFormatValid,
    score: nameFormatValid ? 100 : 0,
    details: { name: nameValue, valid: nameFormatValid },
    penalty: nameFormatValid ? 0 : -2,
    fix: nameFormatValid
      ? `Name "${nameValue}" follows the required format.`
      : hasName
        ? `Name "${nameValue}" is invalid. Skill names may only contain lowercase letters, numbers, and hyphens (e.g. "my-product").`
        : "Set a name in skill.md frontmatter using only lowercase letters, numbers, and hyphens.",
    type: "AUTO",
  };

  return [present, nameCheck, formatCheck];
}

async function checkSkillEndpoint(site: SiteData): Promise<CheckResult> {
  const res = await fetchUrl(`${site.url}/skill`);
  let isJson = false;

  if (res.ok) {
    try {
      JSON.parse(res.text);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  const pass = res.ok && isJson;

  return {
    check_id: "skill_endpoint",
    category: "K",
    name: "/skill JSON endpoint",
    pass,
    score: pass ? 100 : res.ok ? 50 : 0,
    details: { status: res.status, is_json: isJson },
    penalty: pass ? 0 : -5,
    fix: pass
      ? "Found /skill endpoint returning valid JSON — agents can query capabilities."
      : res.ok
        ? "/skill endpoint exists but doesn't return valid JSON. Return a JSON object with name, description, and capabilities."
        : `/skill endpoint not found (HTTP ${res.status || "unreachable"}). Create a JSON API at /skill.`,
    type: "AUTO",
  };
}

async function checkAgentJson(site: SiteData): Promise<CheckResult> {
  const res = await fetchUrl(`${site.url}/.well-known/agent.json`);
  let isJson = false;

  if (res.ok) {
    try {
      JSON.parse(res.text);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  const pass = res.ok && isJson;

  return {
    check_id: "agent_json",
    category: "K",
    name: ".well-known/agent.json",
    pass,
    score: pass ? 100 : res.ok ? 50 : 0,
    details: { status: res.status, is_json: isJson },
    penalty: pass ? 0 : -5,
    fix: pass
      ? "Found agent.json — standard agent discovery is supported."
      : res.ok
        ? "agent.json exists but doesn't return valid JSON. Ensure it's a valid JSON file."
        : `agent.json not found (HTTP ${res.status || "unreachable"}). Create /.well-known/agent.json for AI agent discovery.`,
    type: "AUTO",
  };
}

// ── Export ────────────────────────────────────────────────

export async function runAutoChecks(site: SiteData): Promise<CheckResult[]> {
  // K: Agent Readiness (async — extra fetches)
  const [skillMdBoth, skillEndpoint, agentJson] = await Promise.all([
    checkSkillMdBoth(site),
    checkSkillEndpoint(site),
    checkAgentJson(site),
  ]);
  const [skillMd, skillMdName, skillMdNameFormat] = skillMdBoth;

  return [
    // A: Machine Access
    checkHttpStatus(site),
    checkSsrContent(site),
    checkRobotsTxt(site),
    checkLlmsTxt(site),
    checkSitemap(site),
    // B: Content
    checkHeadingStructure(site),
    checkMetaDescription(site),
    checkContentLength(site),
    // C: Structure & Architecture
    checkInternalLinks(site),
    checkCanonicalUrl(site),
    checkMobileFriendly(site),
    checkPageSpeed(site),
    checkUrlStructure(site),
    // D: Entities & Semantics
    checkSchemaOrg(site),
    checkOpenGraph(site),
    checkAboutPage(site),
    // E: Trust & Authority
    checkHttps(site),
    checkPrivacyPolicy(site),
    // F: Conversational Readiness
    checkFaqSection(site),
    checkContactOptions(site),
    // G: Crawl Permissions
    checkGptbotAllowed(site),
    checkClaudebotAllowed(site),
    checkPerplexitybotAllowed(site),
    checkLlmsTxtQuality(site),
    // H: Extractability
    checkContentFreshness(site),
    checkMarkdownFriendly(site),
    // J: Technical Performance
    checkResponseTime(site),
    checkHtmlValid(site),
    checkTextToHtmlRatio(site),
    // K: Agent Readiness
    skillMd,
    skillMdName,
    skillMdNameFormat,
    skillEndpoint,
    agentJson,
  ];
}
