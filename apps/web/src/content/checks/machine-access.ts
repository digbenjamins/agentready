import type { CheckEntry } from "./types";

const CATEGORY = "A";
const CATEGORY_NAME = "Machine Access";

export const machineAccessChecks: CheckEntry[] = [
  {
    slug: "http-status",
    checkId: "http_status",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Homepage returns HTTP 200",
    summary: "Your homepage must respond with a 200 status code when an AI crawler fetches it.",
    sections: [
      {
        heading: "Why this matters",
        blocks: [
          {
            type: "p",
            text: "AI crawlers make one request to your homepage and make a snap decision. If that request returns anything other than 200 — a redirect chain, a 403 from an over-aggressive firewall, a 500 from a flaky deploy — the crawler often gives up and moves on.",
          },
          {
            type: "p",
            text: "Unlike search engines, which retry and re-crawl for weeks, AI agents work in the context of a live conversation. They will not wait for your server to come back. A failed fetch means you are invisible for that conversation.",
          },
        ],
      },
      {
        heading: "Common causes of non-200 responses",
        blocks: [
          {
            type: "list",
            items: [
              "Redirect chains from http to https to www to non-www. Flatten these into a single 301.",
              "Cloudflare or WAF rules blocking unfamiliar user agents. Whitelist GPTBot, ClaudeBot, and PerplexityBot.",
              "Geoblocking. If you only serve EU traffic, you are invisible to crawlers based elsewhere.",
              "Cold-start 500s on serverless deploys. Use a warming strategy or move to always-on hosting.",
              "Authentication walls in front of the homepage. Your public site must be public.",
            ],
          },
        ],
      },
      {
        heading: "How to check",
        blocks: [
          {
            type: "p",
            text: "Use curl with a realistic user agent and make sure the final response is 200.",
          },
          {
            type: "code",
            lang: "bash",
            code: `curl -I -A "GPTBot" https://yourdomain.com
# HTTP/2 200`,
          },
        ],
      },
    ],
  },
  {
    slug: "ssr-content",
    checkId: "ssr_content",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Core content visible without JavaScript",
    summary: "Your key content must be present in the initial HTML response. Most AI crawlers do not execute JavaScript.",
    sections: [
      {
        heading: "Why this matters",
        blocks: [
          {
            type: "p",
            text: "Search engines like Google run a headless browser that executes your JavaScript before indexing. Most AI crawlers do not. They download the HTML, parse it, and extract text. If your homepage is an empty div that gets filled in by React after a fetch call, the crawler sees nothing.",
          },
          {
            type: "p",
            text: "This is the single biggest reason modern SPAs underperform in AI search. A beautifully built client-rendered site can be completely invisible to ChatGPT or Perplexity even though it ranks on Google.",
          },
        ],
      },
      {
        heading: "How to fix it",
        blocks: [
          {
            type: "list",
            items: [
              "Use server-side rendering. Next.js, Nuxt, SvelteKit, Remix and Astro all do this by default.",
              "Or use static generation. Prerender pages at build time.",
              "Or use hybrid rendering: SSR the homepage and critical pages, hydrate the rest.",
              "If you are stuck on a client-rendered app, add a prerender service like Prerender.io as a fallback for bot user agents.",
            ],
          },
        ],
      },
      {
        heading: "How to test",
        blocks: [
          {
            type: "p",
            text: "The simplest test is curl. If curl shows your headings and main content, a crawler can see them. If it shows an empty body, you have a problem.",
          },
          {
            type: "code",
            lang: "bash",
            code: `curl -s https://yourdomain.com | grep -i "your main headline"`,
          },
        ],
      },
    ],
  },
  {
    slug: "robots-txt",
    checkId: "robots_txt",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "robots.txt does not block key pages",
    summary: "Your robots.txt must allow crawlers to reach your homepage and main content.",
    sections: [
      {
        heading: "Why this matters",
        blocks: [
          {
            type: "p",
            text: "robots.txt is the first file a crawler fetches. It tells the crawler which URLs it is allowed to touch. A single wrong line can lock out every AI agent in existence.",
          },
          {
            type: "p",
            text: "The most common failure is a development-era Disallow: / that never got removed before launch. The second most common is an overbroad rule that blocks /api or /blog and accidentally catches the main content.",
          },
        ],
      },
      {
        heading: "A good robots.txt for AI readiness",
        blocks: [
          {
            type: "code",
            lang: "text",
            code: `User-agent: *
Allow: /

# Optional: point agents at your sitemap
Sitemap: https://yourdomain.com/sitemap.xml`,
          },
          {
            type: "p",
            text: "If you want to explicitly welcome AI crawlers, add named entries for each bot. See the GPTBot, ClaudeBot, and PerplexityBot checks for specifics.",
          },
        ],
      },
      {
        heading: "Things to avoid",
        blocks: [
          {
            type: "list",
            items: [
              "Disallow: / — this blocks everything.",
              "Disallow: /* — same thing in a disguise.",
              "Per-bot blocks left over from a previous content strategy.",
              "Robots files that return 404 — some strict crawlers treat that as disallow-all.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "llms-txt",
    checkId: "llms_txt",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "llms.txt file present",
    summary: "A markdown file at /llms.txt that gives AI models a curated map of your most important content.",
    sections: [
      {
        heading: "What is llms.txt?",
        blocks: [
          {
            type: "p",
            text: "llms.txt is a proposed standard from Jeremy Howard (Answer.AI) for giving language models a hand-curated list of the most important pages on your site, in markdown, with short descriptions. Think of it as a smart table of contents designed for LLM consumption.",
          },
          {
            type: "p",
            text: "It is not a sitemap. A sitemap lists every URL. llms.txt lists only the pages that matter, grouped by topic, with context that helps the model decide which one to look at. That curation is the value.",
          },
        ],
      },
      {
        heading: "What it looks like",
        blocks: [
          {
            type: "code",
            lang: "markdown",
            code: `# Acme CRM

> Lightweight CRM for small sales teams. Built for teams of 2 to 20 people.

## Docs
- [Getting started](https://docs.acmecrm.com/start): Install and set up Acme CRM in under 5 minutes.
- [API reference](https://docs.acmecrm.com/api): Full REST API documentation.

## Product
- [Pricing](https://acmecrm.com/pricing): Plans and per-seat pricing.
- [Features](https://acmecrm.com/features): Pipeline, contacts, reporting.`,
          },
        ],
      },
      {
        heading: "Why it is worth doing",
        blocks: [
          {
            type: "p",
            text: "Language models have a limited attention budget when browsing. Giving them a curated entry point means they spend that budget on pages you chose — pages where your positioning is sharp and your information is current. Without an llms.txt, they wander through whatever Google ranks.",
          },
        ],
      },
    ],
    furtherReading: [{ label: "llms.txt proposal", url: "https://llmstxt.org/" }],
  },
  {
    slug: "sitemap",
    checkId: "sitemap",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Sitemap present and reachable",
    summary: "An XML sitemap at /sitemap.xml that lists all your indexable pages.",
    sections: [
      {
        heading: "Why sitemaps still matter",
        blocks: [
          {
            type: "p",
            text: "Sitemaps are old technology, but AI crawlers still use them. An XML sitemap at /sitemap.xml tells a crawler exactly which URLs exist and when they were last updated. That saves crawl budget and makes sure nothing is missed.",
          },
          {
            type: "p",
            text: "For AI agents specifically, sitemaps are most valuable on sites where the main content lives several clicks deep — blog archives, documentation, product catalogs. Without a sitemap, a crawler may only see what the homepage links to.",
          },
        ],
      },
      {
        heading: "Minimal sitemap example",
        blocks: [
          {
            type: "code",
            lang: "xml",
            code: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-04-01</lastmod>
  </url>
  <url>
    <loc>https://yourdomain.com/pricing</loc>
    <lastmod>2026-04-01</lastmod>
  </url>
</urlset>`,
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Reference the sitemap from robots.txt with a Sitemap: line.",
              "Include lastmod dates — they help crawlers prioritize.",
              "Keep each sitemap under 50,000 URLs and 50 MB.",
              "If you have more than that, use a sitemap index.",
              "Generate it automatically. Most frameworks have a plugin.",
            ],
          },
        ],
      },
    ],
  },
];
