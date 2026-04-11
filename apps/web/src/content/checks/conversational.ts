import type { CheckEntry } from "./types";

const CATEGORY = "F";
const CATEGORY_NAME = "Conversational Readiness";

export const conversationalChecks: CheckEntry[] = [
  {
    slug: "faq-section",
    checkId: "faq_section",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "FAQ section or Q&A structured data",
    summary: "An FAQ section answers the questions users actually ask — exactly what AI assistants are looking for.",
    sections: [
      {
        heading: "Why FAQs are the single highest-leverage content format",
        blocks: [
          {
            type: "p",
            text: "AI assistants answer questions. FAQs are literally a list of questions and answers. The match is so direct that a well-written FAQ section often becomes the single most-cited part of your entire site.",
          },
          {
            type: "p",
            text: "The mechanism is simple: when a user asks an AI 'does Acme CRM integrate with Gmail?', the model's first move is to look for a page where someone has already asked exactly that question. If that page is yours, you get cited.",
          },
        ],
      },
      {
        heading: "How to build a good FAQ",
        blocks: [
          {
            type: "list",
            items: [
              "Write real questions that real prospects ask. Not marketing questions.",
              "Answer in two or three sentences. Short is better than thorough.",
              "Cover objections directly. 'Why is it more expensive than X?' is a great FAQ entry.",
              "Use FAQPage schema.org markup — it signals the structure explicitly to crawlers.",
              "Keep the FAQ section on a page that has other substantive content too.",
            ],
          },
        ],
      },
      {
        heading: "Schema markup example",
        blocks: [
          {
            type: "code",
            lang: "html",
            code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Does Acme CRM integrate with Gmail?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes. Acme CRM connects to Gmail via OAuth and syncs contacts, emails, and calendar events automatically."
    }
  }]
}
</script>`,
          },
        ],
      },
    ],
  },
  {
    slug: "contact-options",
    checkId: "contact_options",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Clear contact and call-to-action options",
    summary: "A visible way to contact you or take the next step, linked from the homepage.",
    sections: [
      {
        heading: "Why contact options matter for AI",
        blocks: [
          {
            type: "p",
            text: "When an AI assistant recommends a product, it often wants to tell the user how to act on the recommendation. If your homepage has a visible 'Contact us', 'Book a demo', or 'Sign up free' button, the assistant can quote the exact next step. Without it, the user is stuck Googling.",
          },
          {
            type: "p",
            text: "This is also a ranking factor. Crawlers treat the presence of clear calls-to-action as a signal that the site is an active, maintained business. Abandoned sites rarely have working contact forms.",
          },
        ],
      },
      {
        heading: "What to include",
        blocks: [
          {
            type: "list",
            items: [
              "At least one primary CTA visible without scrolling — sign up, book, try, buy.",
              "An email address or contact form linked from the footer of every page.",
              "A phone number if you take phone calls.",
              "A physical address if you have a physical location.",
              "Social links as a fallback route, but never as the only option.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "service-descriptions",
    checkId: "service_descriptions",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Clear service or product descriptions",
    summary: "An AI should be able to answer 'what does this business offer?' from your homepage text alone.",
    sections: [
      {
        heading: "The test",
        blocks: [
          {
            type: "p",
            text: "Imagine an AI assistant is asked 'what does Acme CRM do?'. Can it answer from the first 500 words of your homepage? If yes, you pass. If the answer is buried on a third-level page or phrased in abstract marketing language, you fail.",
          },
          {
            type: "p",
            text: "The most common failure mode is a homepage that describes the benefits of the product ('move faster', 'grow your business') without ever saying what the product actually is ('a CRM', 'a scheduling tool', 'a payment processor'). Benefits without the concrete noun are useless to a model.",
          },
        ],
      },
      {
        heading: "How to fix it",
        blocks: [
          {
            type: "list",
            items: [
              "Start with a one-sentence explanation that names the category. 'Acme is a CRM for small sales teams.'",
              "Follow with a paragraph listing the three or four core features in plain language.",
              "Describe who the product is for, specifically.",
              "Save the benefits and the vision for after you have said what the thing is.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "unique-value-prop",
    checkId: "unique_value_prop",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Unique value proposition identifiable",
    summary: "An AI should be able to answer 'why choose this over competitors?' from your content.",
    sections: [
      {
        heading: "Why this is a separate check",
        blocks: [
          {
            type: "p",
            text: "Describing your product is one thing; describing what makes it different is another. AI assistants are often asked comparative questions — 'best CRM for small teams in Belgium' — and they need a reason to pick you over the other ten options.",
          },
          {
            type: "p",
            text: "The reason has to be on your site, stated explicitly. Models do not infer differentiation from vague claims. 'The best CRM' is not a value proposition. 'The only CRM that syncs with Belgian invoicing software' is.",
          },
        ],
      },
      {
        heading: "How to write a UVP that works",
        blocks: [
          {
            type: "list",
            items: [
              "Be specific about the trade-off. What do you do that your competitors do not?",
              "Name your target audience. 'For small sales teams' beats 'for everyone'.",
              "Back it up with proof: a feature, a statistic, a testimonial.",
              "Put it in the first 200 words of your homepage, not on a buried About page.",
              "Re-read competitors' UVPs. If yours is identical, rewrite it.",
            ],
          },
        ],
      },
    ],
  },
];
