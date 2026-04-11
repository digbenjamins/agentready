import type { CheckEntry } from "./types";

const CATEGORY = "G";
const CATEGORY_NAME = "Crawl Permissions";

export const crawlPermissionsChecks: CheckEntry[] = [
  {
    slug: "gptbot-allowed",
    checkId: "gptbot_allowed",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "GPTBot not blocked in robots.txt",
    summary: "OpenAI's crawler must be allowed to access your site if you want to appear in ChatGPT answers.",
    sections: [
      {
        heading: "What is GPTBot?",
        blocks: [
          {
            type: "p",
            text: "GPTBot is OpenAI's web crawler, introduced in 2023. It is the bot that fetches pages to build the knowledge base ChatGPT uses when answering questions with web browsing enabled. If GPTBot cannot reach your site, you cannot be cited by ChatGPT.",
          },
          {
            type: "p",
            text: "Many sites accidentally blocked GPTBot during the 2023 panic about AI training. Some of those blocks are still in place years later, quietly cutting those sites out of ChatGPT results.",
          },
        ],
      },
      {
        heading: "How to allow GPTBot",
        blocks: [
          {
            type: "p",
            text: "Check your robots.txt for any entry that disallows GPTBot. If you find one, remove it or explicitly allow the bot.",
          },
          {
            type: "code",
            lang: "text",
            code: `User-agent: GPTBot
Allow: /`,
          },
          {
            type: "p",
            text: "If you do want to keep GPTBot out of certain areas — for example, a login-walled app — you can allow the marketing site and disallow /app:",
          },
          {
            type: "code",
            lang: "text",
            code: `User-agent: GPTBot
Allow: /
Disallow: /app/`,
          },
        ],
      },
    ],
    furtherReading: [{ label: "OpenAI GPTBot documentation", url: "https://platform.openai.com/docs/gptbot" }],
  },
  {
    slug: "claudebot-allowed",
    checkId: "claudebot_allowed",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "ClaudeBot not blocked",
    summary: "Anthropic's ClaudeBot must be allowed to access your site to appear in Claude's answers.",
    sections: [
      {
        heading: "Anthropic's crawlers",
        blocks: [
          {
            type: "p",
            text: "Anthropic uses two bots: ClaudeBot for general web fetching and Claude-Web for the browsing-enabled features inside Claude.ai. You want both allowed if you want to be cited by Claude in any context.",
          },
          {
            type: "p",
            text: "Unlike GPTBot, Anthropic's crawlers are more recent and less likely to be blocked by legacy rules. But they are also less well known, so many robots.txt files do not explicitly allow them either — and some WAF rules block unfamiliar user agents by default.",
          },
        ],
      },
      {
        heading: "How to allow ClaudeBot",
        blocks: [
          {
            type: "code",
            lang: "text",
            code: `User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /`,
          },
          {
            type: "p",
            text: "Also check your Cloudflare, Vercel, or Fastly rules for any bot-blocking that might catch unknown user agents. Whitelist ClaudeBot by user agent or IP.",
          },
        ],
      },
    ],
    furtherReading: [{ label: "Anthropic crawler docs", url: "https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler" }],
  },
  {
    slug: "perplexitybot-allowed",
    checkId: "perplexitybot_allowed",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "PerplexityBot not blocked",
    summary: "Perplexity's crawler must be allowed if you want to appear in Perplexity search results.",
    sections: [
      {
        heading: "Why Perplexity is worth allowing",
        blocks: [
          {
            type: "p",
            text: "Perplexity is the most citation-forward of the major AI search engines — every answer comes with source links, and the clickthrough rate from those links is higher than from any other AI product. Being cited by Perplexity drives real traffic.",
          },
          {
            type: "p",
            text: "PerplexityBot is their fetcher. It is well-behaved, respects robots.txt, and identifies itself clearly. There is rarely a good reason to block it.",
          },
        ],
      },
      {
        heading: "How to allow PerplexityBot",
        blocks: [
          {
            type: "code",
            lang: "text",
            code: `User-agent: PerplexityBot
Allow: /`,
          },
        ],
      },
    ],
    furtherReading: [{ label: "Perplexity crawler docs", url: "https://docs.perplexity.ai/guides/bots" }],
  },
];
