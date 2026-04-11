import type { CheckEntry } from "./types";

const CATEGORY = "C";
const CATEGORY_NAME = "Structure & Architecture";

export const structureChecks: CheckEntry[] = [
  {
    slug: "internal-links",
    checkId: "internal_links",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Healthy internal link structure",
    summary: "Your pages should link to each other with descriptive anchor text so crawlers can discover them.",
    sections: [
      {
        heading: "Why internal links matter",
        blocks: [
          {
            type: "p",
            text: "Internal links are how a crawler moves through your site. An AI crawler that lands on your homepage and finds no links to About, Pricing, or Blog will see only your homepage. Everything else is invisible.",
          },
          {
            type: "p",
            text: "Anchor text also gives the crawler context. A link that says 'learn more about our API' is more useful than a link that says 'click here' — the model can use the anchor text as a hint about what the destination page covers.",
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Every important page should be reachable from the homepage in at most 2 clicks.",
              "Use descriptive anchor text, not 'here' or 'read more'.",
              "Link related pages to each other contextually, not just through the nav.",
              "Avoid orphan pages — pages with no inbound internal links.",
              "Keep the total number of links on a page reasonable. Over 200 starts to look like spam.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "canonical-url",
    checkId: "canonical_url",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Canonical URL set correctly",
    summary: "Each page should declare a canonical URL so crawlers know which version to index.",
    sections: [
      {
        heading: "What is a canonical URL?",
        blocks: [
          {
            type: "p",
            text: "A canonical URL is a link tag in the HTML head that tells crawlers 'this is the authoritative URL for this content'. It resolves duplicate content issues caused by query strings, trailing slashes, and tracking parameters.",
          },
          {
            type: "code",
            lang: "html",
            code: `<link rel="canonical" href="https://yourdomain.com/pricing">`,
          },
        ],
      },
      {
        heading: "Why this matters for AI",
        blocks: [
          {
            type: "p",
            text: "Without canonicals, the same page can appear under several URLs — with utm parameters, with www or without, with or without trailing slash — and the crawler may treat them as separate pages. That splits your citation signal and hurts your authority.",
          },
        ],
      },
      {
        heading: "Rules",
        blocks: [
          {
            type: "list",
            items: [
              "Every indexable page needs a canonical.",
              "The canonical should be absolute, not relative.",
              "It should point to the HTTPS version of the URL.",
              "A page's canonical can point to itself — that is the most common case.",
              "Do not set contradictory canonicals on different pages pointing to each other.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "mobile-friendly",
    checkId: "mobile_friendly",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Mobile-friendly meta tag",
    summary: "Your pages should have a viewport meta tag and responsive layout.",
    sections: [
      {
        heading: "The viewport tag",
        blocks: [
          {
            type: "p",
            text: "The viewport meta tag is the single line that tells browsers to render your site at the device's actual width instead of pretending to be a 960px desktop. Without it, mobile renders a zoomed-out desktop page.",
          },
          {
            type: "code",
            lang: "html",
            code: `<meta name="viewport" content="width=device-width, initial-scale=1">`,
          },
        ],
      },
      {
        heading: "Why AI crawlers care",
        blocks: [
          {
            type: "p",
            text: "AI crawlers generally render at mobile widths, following the same mobile-first convention Google adopted years ago. A page that breaks on mobile breaks for the crawler too — important text may be hidden behind horizontal scroll and never extracted.",
          },
        ],
      },
    ],
  },
  {
    slug: "page-speed",
    checkId: "page_speed",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Page loads in acceptable time",
    summary: "Slow pages get skipped by AI crawlers. Target under 2 seconds to first content.",
    sections: [
      {
        heading: "Why speed matters more for AI than for humans",
        blocks: [
          {
            type: "p",
            text: "Human visitors wait. AI crawlers do not. Most crawlers set a hard timeout of a few seconds per page. If your homepage is not returning content by then, the crawler gives up and your page is treated as unreachable.",
          },
          {
            type: "p",
            text: "This is worse for you than an error page, because you never know it happened. The crawler just silently drops you from its index.",
          },
        ],
      },
      {
        heading: "Common speed killers",
        blocks: [
          {
            type: "list",
            items: [
              "Unoptimised hero images. A 4 MB hero kills everything.",
              "Third-party scripts (analytics, chat widgets, A/B testing) blocking render.",
              "Client-side rendering with a slow initial data fetch.",
              "Cold starts on serverless platforms.",
              "Hosting in the wrong region for your audience.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "url-structure",
    checkId: "url_structure",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Clean, descriptive URL slugs",
    summary: "URLs should be human-readable and reflect the page content.",
    sections: [
      {
        heading: "What a good URL looks like",
        blocks: [
          {
            type: "p",
            text: "A good URL describes the page in words, not in IDs. Compare /blog/how-to-onboard-new-customers with /blog?p=8174. The first tells a crawler (and a human) exactly what to expect. The second tells it nothing.",
          },
        ],
      },
      {
        heading: "Rules",
        blocks: [
          {
            type: "list",
            items: [
              "Lowercase, hyphens, no underscores.",
              "Keep it short — three to five words in the slug is plenty.",
              "Avoid dates in URLs unless the content is genuinely dated.",
              "Avoid filler words: /blog/the-way-to-do-x → /blog/do-x.",
              "Do not stuff keywords. One natural phrase is enough.",
            ],
          },
        ],
      },
    ],
  },
];
