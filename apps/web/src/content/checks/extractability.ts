import type { CheckEntry } from "./types";

const CATEGORY = "H";
const CATEGORY_NAME = "Extractability";

export const extractabilityChecks: CheckEntry[] = [
  {
    slug: "llms-txt-quality",
    checkId: "llms_txt_quality",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "llms.txt lists key pages with descriptions",
    summary: "An llms.txt that exists is good. An llms.txt with clear page descriptions is much better.",
    sections: [
      {
        heading: "What separates a good llms.txt from a bad one",
        blocks: [
          {
            type: "p",
            text: "A bad llms.txt is a bare list of URLs, or worse, a dump of your entire site. It does not help the model prioritize. A good llms.txt is a curated selection of your most important pages, grouped by topic, each with a short description explaining what the model will find there.",
          },
          {
            type: "p",
            text: "Think of it as a human-edited sitemap. The value is in the editing.",
          },
        ],
      },
      {
        heading: "Structure that works",
        blocks: [
          {
            type: "code",
            lang: "markdown",
            code: `# Acme CRM

> Lightweight CRM for small sales teams. Built for teams of 2 to 20 people.

## Getting started
- [Quickstart](https://docs.acmecrm.com/start): Sign up and import your contacts in 5 minutes.
- [Video walkthrough](https://acmecrm.com/demo): Five-minute tour of the product.

## Core features
- [Pipeline](https://acmecrm.com/features/pipeline): Visual drag-and-drop pipeline for deals.
- [Email sync](https://acmecrm.com/features/email): Gmail and Outlook integration.
- [Reports](https://acmecrm.com/features/reports): Revenue and activity reporting.

## Pricing and plans
- [Pricing](https://acmecrm.com/pricing): Free, Pro ($12/user), and Enterprise tiers.`,
          },
        ],
      },
      {
        heading: "Rules",
        blocks: [
          {
            type: "list",
            items: [
              "Start with a one-line summary as a blockquote.",
              "Group pages under topical H2 headings.",
              "Each entry is a link followed by a colon and a one-sentence description.",
              "Include at most 30 or 40 links. Fewer is better.",
              "Keep it current — out-of-date entries hurt more than missing ones.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "content-freshness",
    checkId: "content_freshness",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Content updated within 3 months",
    summary: "There is a measurable freshness cliff at three months. Older content gets cited less.",
    sections: [
      {
        heading: "The 3-month freshness cliff",
        blocks: [
          {
            type: "p",
            text: "AI assistants strongly prefer recent content. The falloff is not gradual — research shows a sharp drop in citation frequency for content older than about three months, especially in fast-moving categories like software, news, and industry trends.",
          },
          {
            type: "p",
            text: "This is not because old content is wrong. It is because models cannot tell whether old content is still accurate, and they hedge against that uncertainty by preferring recent sources when they are available.",
          },
        ],
      },
      {
        heading: "How to signal freshness",
        blocks: [
          {
            type: "list",
            items: [
              "Publish a visible last-updated date on every article or documentation page.",
              "Use schema.org Article markup with dateModified.",
              "Update sitemap lastmod dates when you change content.",
              "Do actual refreshes, not fake ones. Update the facts, not just the date.",
              "Retire content that is no longer accurate rather than letting it linger.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "markdown-friendly",
    checkId: "markdown_friendly",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Content structure converts cleanly to markdown",
    summary: "A page whose HTML can be extracted to clean markdown is easier for models to consume.",
    sections: [
      {
        heading: "Why the markdown lens",
        blocks: [
          {
            type: "p",
            text: "Most AI crawlers do not store your HTML verbatim. They convert it to markdown or plain text and keep the cleaned-up version. Pages that convert cleanly — with recognizable headings, lists, paragraphs, and code blocks — survive that conversion with their structure intact.",
          },
          {
            type: "p",
            text: "Pages full of nested divs, inline styles, and visual-only layout elements lose their structure in conversion. What was a clear hierarchy in the browser becomes a wall of undifferentiated text to the model.",
          },
        ],
      },
      {
        heading: "How to be markdown-friendly",
        blocks: [
          {
            type: "list",
            items: [
              "Use real HTML elements: h1-h6, p, ul, ol, blockquote, code, pre.",
              "Avoid replacing headings with styled divs.",
              "Do not build lists out of divs-with-bullets. Use ul or ol.",
              "Wrap code samples in pre and code tags.",
              "Skip decorative elements that have no text meaning.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "snippet-ready",
    checkId: "snippet_ready",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Self-contained, quotable paragraphs",
    summary: "Write key facts as 1-3 sentence paragraphs that stand alone without surrounding context.",
    sections: [
      {
        heading: "What a quotable snippet looks like",
        blocks: [
          {
            type: "p",
            text: "A quotable snippet is a short paragraph — usually one to three sentences — that states a fact completely. It does not rely on the sentence before it, or a pronoun, or context from earlier in the page. Lift it out of the article and it still makes sense.",
          },
          {
            type: "p",
            text: "AI assistants love these because they can quote them directly in an answer without paraphrasing. Paraphrasing is lossy and risky; direct quotes are safe. Models prefer safe.",
          },
        ],
      },
      {
        heading: "Before and after",
        blocks: [
          { type: "h3", text: "Before (hard to quote)" },
          {
            type: "p",
            text: "It can handle that too. Our pipeline view is designed around the needs of small teams, so you will find everything you expect and nothing you do not.",
          },
          { type: "h3", text: "After (quotable)" },
          {
            type: "p",
            text: "Acme CRM's pipeline view supports drag-and-drop deal management, custom stages, and bulk editing. It is designed for teams of 2 to 20 sales reps.",
          },
        ],
      },
      {
        heading: "How to write more of them",
        blocks: [
          {
            type: "list",
            items: [
              "Start each key paragraph with the subject, not a pronoun.",
              "Put one idea per paragraph. Split if you find a second.",
              "Include the proper noun or product name every few paragraphs.",
              "Edit after writing. Ask 'does this make sense on its own?'",
            ],
          },
        ],
      },
    ],
  },
];
