import type { CheckEntry } from "./types";

const CATEGORY = "I";
const CATEGORY_NAME = "Authority Signals";

export const authorityChecks: CheckEntry[] = [
  {
    slug: "brand-mentions",
    checkId: "brand_mentions",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Brand name consistent and prominent",
    summary: "Brand authority is the single strongest predictor of AI citations, with a 0.334 correlation.",
    sections: [
      {
        heading: "The single biggest finding",
        blocks: [
          {
            type: "p",
            text: "Across all the factors measured in the GEO research, brand authority has the strongest correlation with AI citation frequency — 0.334. That is larger than content length, larger than backlinks, larger than schema markup. Brand wins.",
          },
          {
            type: "p",
            text: "The mechanism is straightforward: language models were trained on text where brand names appeared consistently. A site where the brand is present and consistent matches that pattern. A site where the brand is absent, inconsistent, or hidden behind a logo does not.",
          },
        ],
      },
      {
        heading: "How to be brand-prominent without being obnoxious",
        blocks: [
          {
            type: "list",
            items: [
              "Use the brand name in the first paragraph of every key page.",
              "Repeat it naturally every few paragraphs instead of using 'we' exclusively.",
              "Keep the spelling and capitalisation consistent everywhere.",
              "Put the brand name in page titles, meta descriptions, and OG tags.",
              "Never hide it behind a logo-only header. The text has to exist.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "author-credentials",
    checkId: "author_credentials",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Author bios with credentials",
    summary: "Named authors with visible credentials are a major authority signal.",
    sections: [
      {
        heading: "Why author info matters",
        blocks: [
          {
            type: "p",
            text: "AI assistants are wary of unsigned content. An article with no byline could have been written by anyone — or by a content farm. An article by a named author with a credential is anchored to a real person, which makes it safer to cite.",
          },
          {
            type: "p",
            text: "This is especially strong in the E-E-A-T categories: health, finance, legal. In those spaces, an unsigned article rarely gets cited at all.",
          },
        ],
      },
      {
        heading: "What to include in a byline",
        blocks: [
          {
            type: "list",
            items: [
              "The author's real name.",
              "Their role or title at your organization.",
              "A one-sentence credential that makes their expertise obvious.",
              "A link to a bio page with more detail.",
              "A photo, if possible. Visual verification matters.",
            ],
          },
          {
            type: "code",
            lang: "html",
            code: `<div class="byline">
  <img src="/authors/sarah-kim.jpg" alt="Sarah Kim">
  <div>
    <p>By <a href="/team/sarah-kim">Sarah Kim</a>, Head of Sales at Acme CRM</p>
    <p>Sarah has 12 years of experience building sales teams at B2B SaaS companies.</p>
  </div>
</div>`,
          },
        ],
      },
    ],
  },
  {
    slug: "testimonials",
    checkId: "testimonials",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Social proof and testimonials",
    summary: "Customer testimonials, case studies, and reviews establish you as a real, used product.",
    sections: [
      {
        heading: "Why social proof works for AI",
        blocks: [
          {
            type: "p",
            text: "Testimonials and case studies prove that real customers exist. Without them, a model evaluating your site sees a company making claims about itself. With them, the same model sees a company that customers speak for.",
          },
          {
            type: "p",
            text: "The difference is measurable. Pages with attributed testimonials and case studies get cited more often than identical pages without — even when the rest of the content is the same.",
          },
        ],
      },
      {
        heading: "What counts",
        blocks: [
          {
            type: "list",
            items: [
              "Named customer testimonials with a company, role, and real photo.",
              "Written case studies with numbers and specifics.",
              "Embedded reviews from G2, Capterra, Trustpilot.",
              "A customer logo wall — but only if you can credit them.",
              "Press mentions with a link to the original article.",
            ],
          },
        ],
      },
      {
        heading: "What does not count",
        blocks: [
          {
            type: "p",
            text: "Generic testimonials without attribution ('Great product! — Happy Customer') are worse than nothing. Models recognise them as placeholder content and discount your credibility accordingly. If you cannot get a real name and role, do not publish the quote.",
          },
        ],
      },
    ],
  },
  {
    slug: "certifications",
    checkId: "certifications",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Certifications and awards",
    summary: "Industry certifications, awards, and partnerships are durable authority markers.",
    sections: [
      {
        heading: "Why certifications carry weight",
        blocks: [
          {
            type: "p",
            text: "Certifications and awards are issued by third parties, which means the site cannot make them up. That externality is why they function as strong trust signals — both for humans and for the models trained on human-evaluated content.",
          },
          {
            type: "p",
            text: "The specific certifications that matter depend on your industry. SOC 2 and ISO 27001 for B2B SaaS. HIPAA for health. GDPR compliance statements for anything with EU users. Professional body memberships for consultants and service businesses.",
          },
        ],
      },
      {
        heading: "How to display them",
        blocks: [
          {
            type: "list",
            items: [
              "Mention them in text, not just as badges. A model cannot read a badge image.",
              "Link to the certifying body when possible.",
              "Put them on your About or Trust page in a dedicated section.",
              "Do not conflate real certifications with your own self-declared badges.",
              "Include the year of certification if it is recent.",
            ],
          },
        ],
      },
    ],
  },
];
