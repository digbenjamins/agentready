import type { CheckEntry } from "./types";

const CATEGORY = "D";
const CATEGORY_NAME = "Entities & Semantics";

export const entitiesChecks: CheckEntry[] = [
  {
    slug: "schema-org",
    checkId: "schema_org",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Schema.org structured data",
    summary: "JSON-LD markup that tells crawlers exactly what kind of entity your page describes.",
    sections: [
      {
        heading: "What is schema.org?",
        blocks: [
          {
            type: "p",
            text: "Schema.org is a vocabulary for describing entities — organisations, products, people, events, articles, recipes — in structured data that search engines and AI crawlers can parse without guessing. It lives in a JSON-LD script tag in your page head.",
          },
          {
            type: "p",
            text: "For an AI crawler, schema.org is a direct line to the facts. No parsing, no inference. If your markup says this page is about an Organization named Acme CRM founded in 2024, the crawler records exactly that.",
          },
        ],
      },
      {
        heading: "Minimum useful markup",
        blocks: [
          {
            type: "code",
            lang: "html",
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Acme CRM",
  "url": "https://acmecrm.com",
  "logo": "https://acmecrm.com/logo.png",
  "description": "Lightweight CRM for small sales teams",
  "sameAs": [
    "https://twitter.com/acmecrm",
    "https://linkedin.com/company/acmecrm"
  ]
}
</script>`,
          },
        ],
      },
      {
        heading: "Which types to use",
        blocks: [
          {
            type: "list",
            items: [
              "Organization — your homepage.",
              "Product or SoftwareApplication — product pages.",
              "Article or BlogPosting — blog content.",
              "FAQPage — FAQ sections.",
              "Person — author pages.",
              "LocalBusiness — physical locations.",
            ],
          },
        ],
      },
    ],
    furtherReading: [{ label: "schema.org reference", url: "https://schema.org/" }],
  },
  {
    slug: "open-graph",
    checkId: "open_graph",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Open Graph tags present",
    summary: "og:title, og:description, and og:image meta tags so your pages preview well when shared.",
    sections: [
      {
        heading: "Why Open Graph matters for AI",
        blocks: [
          {
            type: "p",
            text: "Open Graph tags were invented by Facebook to control how links look when shared on social media. AI crawlers adopted them as a cheap shortcut to the page's essential metadata. og:title and og:description are treated as the canonical title and summary of the page.",
          },
          {
            type: "p",
            text: "If you only have one meta block for an AI crawler to read, it is probably og:description. It is short, specific, and written to stand alone — exactly what the crawler wants.",
          },
        ],
      },
      {
        heading: "The essentials",
        blocks: [
          {
            type: "code",
            lang: "html",
            code: `<meta property="og:title" content="Acme CRM — CRM for small teams">
<meta property="og:description" content="A lightweight sales pipeline tool built for teams of 2 to 20 people.">
<meta property="og:image" content="https://acmecrm.com/og.png">
<meta property="og:url" content="https://acmecrm.com">
<meta property="og:type" content="website">`,
          },
        ],
      },
    ],
  },
  {
    slug: "about-page",
    checkId: "about_page",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "About page with entity info",
    summary: "A dedicated About page that tells crawlers who you are, where you are, and why you exist.",
    sections: [
      {
        heading: "Why an About page matters",
        blocks: [
          {
            type: "p",
            text: "AI assistants routinely get asked questions like 'who is Acme CRM?' or 'where is Acme based?' or 'who founded Acme?'. The About page is where those answers live. Sites without an About page leave the assistant to guess from LinkedIn or old press releases.",
          },
          {
            type: "p",
            text: "The About page is also where entity linking happens. A crawler that can match your brand name to a founding date, a country, and a small set of people is much more confident citing you than one that cannot.",
          },
        ],
      },
      {
        heading: "What to include",
        blocks: [
          {
            type: "list",
            items: [
              "Company name (the full, registered one) and short description.",
              "Founding year and location.",
              "Founders or key team members, with roles.",
              "What you do and who you do it for, in two or three sentences.",
              "A way to contact you — email or form.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "business-info",
    checkId: "business_info",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Business info findable",
    summary: "An AI crawler should be able to identify your name, what you do, and how to contact you from your homepage alone.",
    sections: [
      {
        heading: "The three facts every homepage needs",
        blocks: [
          {
            type: "p",
            text: "When an AI assistant is asked about your business, it is trying to answer three questions at once: who are you, what do you do, and how does someone reach you. If your homepage text does not answer all three clearly, you will get paraphrased badly or skipped.",
          },
        ],
      },
      {
        heading: "How to pass this check",
        blocks: [
          {
            type: "list",
            items: [
              "Your name or brand is in the first 100 words, not hidden in the logo.",
              "Your one-line description of what you do appears before the fold.",
              "A contact email, phone number, or contact form is linked from the homepage.",
              "Physical location is mentioned if you are a local business.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "consistent-nap",
    checkId: "consistent_nap",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Consistent NAP (Name, Address, Phone)",
    summary: "Your Name, Address, and Phone must be identical everywhere they appear.",
    sections: [
      {
        heading: "What NAP consistency means",
        blocks: [
          {
            type: "p",
            text: "NAP stands for Name, Address, and Phone number. The rule is that these three pieces of information must match exactly across your website, your Google Business Profile, your LinkedIn page, and any directory you appear in. Not approximately — exactly.",
          },
          {
            type: "p",
            text: "Any inconsistency — a different phone format, a changed street abbreviation, an outdated suite number — is a signal to both search engines and AI crawlers that one of the two sources is wrong. They resolve the ambiguity by trusting neither.",
          },
        ],
      },
      {
        heading: "How to get this right",
        blocks: [
          {
            type: "list",
            items: [
              "Pick a canonical format and stick to it. Decide once: 'St.' or 'Street'; '+32' or '0032'.",
              "Keep your footer, contact page, and schema.org LocalBusiness markup in sync.",
              "Audit your external listings once a year — Google, Facebook, Yelp, trade directories.",
              "Never put NAP in an image. Use text so crawlers can read it.",
            ],
          },
        ],
      },
    ],
  },
];
