import type { CheckEntry } from "./types";

const CATEGORY = "B";
const CATEGORY_NAME = "Content";

export const contentChecks: CheckEntry[] = [
  {
    slug: "heading-structure",
    checkId: "heading_structure",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Logical heading hierarchy",
    summary: "Your page should have exactly one H1 and a nested H2/H3 structure that reflects the content outline.",
    sections: [
      {
        heading: "Why heading structure matters",
        blocks: [
          {
            type: "p",
            text: "AI crawlers use headings to build a mental outline of your page. A clean hierarchy tells the model which topic is primary, which are secondary, and where the subsections start. Without it, everything looks equally important — which means nothing does.",
          },
          {
            type: "p",
            text: "Models that extract snippets for answers almost always grab the text right under the most specific matching heading. If your headings are vague or out of order, your content gets skipped in favor of a competitor whose structure is clearer.",
          },
        ],
      },
      {
        heading: "Rules to follow",
        blocks: [
          {
            type: "list",
            items: [
              "Exactly one H1 per page. It is the title of the page.",
              "H2s for main sections. Never skip from H1 to H3.",
              "H3s only inside H2s.",
              "Do not use headings for visual styling. If it is not a section, it should not be a heading.",
              "Write headings as short, literal descriptions, not puns.",
            ],
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            type: "p",
            text: "The most frequent mistake is multiple H1s per page — often from a marketing component that uses H1 for every card in a grid. The second most frequent is using headings for buttons or call-outs. Both confuse the outline.",
          },
        ],
      },
    ],
  },
  {
    slug: "meta-description",
    checkId: "meta_description",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Meta description present",
    summary: "A meta description tag between 50 and 160 characters that summarizes the page.",
    sections: [
      {
        heading: "Why meta descriptions still matter",
        blocks: [
          {
            type: "p",
            text: "Google stopped using meta descriptions as a ranking signal years ago. AI crawlers did not get the memo. Language models treat the meta description as a concise summary of the page and sometimes quote it directly when answering questions.",
          },
          {
            type: "p",
            text: "Pages without a meta description force the model to write its own summary from whatever text it finds first — often a cookie banner or a nav menu. That is almost always worse than the description you could have written yourself.",
          },
        ],
      },
      {
        heading: "How to write a good one",
        blocks: [
          {
            type: "list",
            items: [
              "Keep it between 50 and 160 characters.",
              "Lead with what the page is about, not marketing language.",
              "Use natural sentence structure. Avoid keyword lists.",
              "Make each page's description unique. Do not copy-paste.",
              "Include the product or brand name once.",
            ],
          },
          {
            type: "code",
            lang: "html",
            code: `<meta name="description" content="Acme CRM is a lightweight sales pipeline tool for small teams. Try it free for 14 days.">`,
          },
        ],
      },
    ],
  },
  {
    slug: "content-length",
    checkId: "content_length",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Sufficient content length",
    summary: "Pages should have at least 300 words of substantive content. Thin pages rarely get cited.",
    sections: [
      {
        heading: "Why 300 words?",
        blocks: [
          {
            type: "p",
            text: "Three hundred words is the rough threshold below which a page has little chance of being cited by an AI assistant. Not because of a hard algorithmic cutoff, but because below 300 words you usually have not said anything substantive enough for a model to quote.",
          },
          {
            type: "p",
            text: "The research backing this shows a clear relationship between depth of content and citation frequency. Thin product pages — a hero, a CTA, three bullet points — get ignored in favor of pages with genuine explanation.",
          },
        ],
      },
      {
        heading: "What counts as content",
        blocks: [
          {
            type: "p",
            text: "Word count only includes body text. Navigation, footer, cookie banners, and image alt text do not count. A homepage with 400 words of marketing slogans and no real information will still fail the underlying goal even if it passes the count.",
          },
          {
            type: "p",
            text: "If your homepage is intentionally minimalist, that is fine — but make sure at least one linked page (About, Features, or a landing page) has the substance. The model will find it.",
          },
        ],
      },
      {
        heading: "How to add depth without padding",
        blocks: [
          {
            type: "list",
            items: [
              "Explain what problem you solve, for whom, in one paragraph.",
              "Show concrete use cases with specific examples.",
              "Add a short FAQ answering the five questions prospects actually ask.",
              "Include pricing, even if the answer is 'contact us'.",
              "Name the people or team behind the product.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "language-clarity",
    checkId: "language_clarity",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Clear, plain language",
    summary: "Your content should be readable by a general audience without industry jargon.",
    sections: [
      {
        heading: "Why clarity wins with AI",
        blocks: [
          {
            type: "p",
            text: "Language models extract facts from text. The clearer the sentence, the higher the confidence the model has in the extracted fact. Jargon-heavy copy lowers that confidence and makes the model hedge — or skip your content entirely.",
          },
          {
            type: "p",
            text: "There is also a direct user-facing effect. When an AI assistant answers a question, it tends to use the clearest available source. If your site says 'enterprise-grade omnichannel solutions' and a competitor says 'we help shops sell online', the competitor wins.",
          },
        ],
      },
      {
        heading: "How to write more clearly",
        blocks: [
          {
            type: "list",
            items: [
              "Prefer short sentences. If a sentence is longer than 20 words, break it.",
              "Use concrete nouns. Replace 'solution' with what it actually is.",
              "Cut adverbs and superlatives: 'truly', 'extremely', 'best-in-class'.",
              "Write like you would explain it to a smart friend who is not in your industry.",
              "Read it out loud. If you stumble, simplify.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "keyword-stuffing",
    checkId: "keyword_stuffing",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "No keyword stuffing",
    summary: "Avoid repetitive keyword-heavy phrases. Keyword stuffing reduces AI visibility by around 30%.",
    sections: [
      {
        heading: "Why keyword stuffing is worse for AI than for SEO",
        blocks: [
          {
            type: "p",
            text: "Old-school SEO rewarded keyword density. AI search punishes it. Research from the GEO paper at Princeton and Georgia Tech shows keyword-stuffed content gets 30% fewer AI citations than naturally written content on the same topic.",
          },
          {
            type: "p",
            text: "The reason is simple: keyword stuffing looks like spam to a language model the same way it looks like spam to a human reader. The model learned to distrust it from the same training data humans use.",
          },
        ],
      },
      {
        heading: "What keyword stuffing looks like today",
        blocks: [
          {
            type: "p",
            text: "It is rarely the obvious 1990s style anymore. Modern keyword stuffing looks like a page that mentions the target phrase fifteen times in variations — 'Belgian CRM for SMEs', 'CRM Belgium SME', 'SME CRM Belgian' — because a content brief said so. The language model catches it every time.",
          },
        ],
      },
      {
        heading: "How to fix it",
        blocks: [
          {
            type: "list",
            items: [
              "Write for a human. Use the target phrase once or twice where it is natural.",
              "Replace synonyms-for-density with actual information.",
              "Read the page top to bottom. If it sounds awkward, rewrite it.",
              "If you have a content brief forcing a keyword count, push back.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "statistics-present",
    checkId: "statistics_present",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Content includes statistics",
    summary: "Adding specific statistics to your content boosts AI visibility by around 37%.",
    sections: [
      {
        heading: "Why statistics boost AI citations",
        blocks: [
          {
            type: "p",
            text: "The GEO research paper found that adding specific numbers, percentages, and data points to a page increased its AI citation rate by 37% — the single largest effect size in the study, after brand authority itself.",
          },
          {
            type: "p",
            text: "The reason is that language models are trained to prefer quantitative claims over vague ones. A sentence like '90% of our customers renew in the first year' is more likely to be quoted than 'our customers love us'. The number gives the model something concrete to latch onto.",
          },
        ],
      },
      {
        heading: "Where to get statistics",
        blocks: [
          {
            type: "list",
            items: [
              "Your own product analytics: retention, adoption, time-to-value.",
              "Customer surveys you have actually run.",
              "Industry reports from Gartner, Forrester, McKinsey, or trade associations.",
              "Government statistics for your market (Statbel in Belgium, Eurostat for EU).",
              "Published academic research in your field.",
            ],
          },
        ],
      },
      {
        heading: "How to cite them",
        blocks: [
          {
            type: "p",
            text: "Always attribute the source. An unattributed statistic gets treated as a claim; an attributed one gets treated as evidence. Even a simple link to the report is enough.",
          },
        ],
      },
    ],
  },
  {
    slug: "quotations-present",
    checkId: "quotations_present",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Content includes quotations",
    summary: "Including customer quotes or expert testimonials boosts AI visibility by around 40%.",
    sections: [
      {
        heading: "Why quotes work",
        blocks: [
          {
            type: "p",
            text: "Quotations are the highest-impact content type identified in the GEO paper, with a 40% lift in AI citation frequency. They work for the same reason statistics do: they give the model concrete, attributable evidence rather than vague marketing claims.",
          },
          {
            type: "p",
            text: "A quoted sentence is also easy for a model to extract and re-use in an answer without rewriting. That makes your content mechanically quotable, not just theoretically authoritative.",
          },
        ],
      },
      {
        heading: "Where to get quotes",
        blocks: [
          {
            type: "list",
            items: [
              "Real customer testimonials — with a name, a role, and a company.",
              "Conversations with prospects that you transcribed (with permission).",
              "Case study interviews. Pull the best sentence verbatim.",
              "Expert opinions from people in your space — ask them for a comment.",
              "Reviews from G2, Capterra, Trustpilot. Attribute the reviewer.",
            ],
          },
        ],
      },
      {
        heading: "How to format them",
        blocks: [
          {
            type: "p",
            text: "Use a real blockquote element (or Q or cite) so the HTML is semantically a quote. Models key off the markup. Include the attribution inline with the quote, not in a sidebar image.",
          },
          {
            type: "code",
            lang: "html",
            code: `<blockquote>
  <p>Acme CRM replaced three different tools and saved us four hours a week.</p>
  <footer>— Sarah Kim, Head of Sales at Globex</footer>
</blockquote>`,
          },
        ],
      },
    ],
  },
];
