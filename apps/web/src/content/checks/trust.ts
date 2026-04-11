import type { CheckEntry } from "./types";

const CATEGORY = "E";
const CATEGORY_NAME = "Trust & Authority";

export const trustChecks: CheckEntry[] = [
  {
    slug: "https",
    checkId: "https",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "HTTPS enabled",
    summary: "Your site must be served over HTTPS with a valid TLS certificate.",
    sections: [
      {
        heading: "Why HTTPS is a minimum bar",
        blocks: [
          {
            type: "p",
            text: "Every major browser now marks HTTP sites as 'not secure'. Most AI crawlers follow the same convention and downgrade or skip content served over plain HTTP. In 2026, HTTPS is not a nice-to-have — it is a requirement for being taken seriously by any automated system.",
          },
          {
            type: "p",
            text: "Beyond the explicit downgrade, HTTPS is a trust signal. A site without a valid certificate is assumed to be abandoned, misconfigured, or untrustworthy. None of those get cited.",
          },
        ],
      },
      {
        heading: "How to get HTTPS",
        blocks: [
          {
            type: "list",
            items: [
              "Let's Encrypt gives you free, auto-renewing certificates. Most hosting platforms wire this up automatically.",
              "Cloudflare offers one-click HTTPS for any site pointed at their DNS.",
              "Set up a 301 redirect from http:// to https:// so every visitor lands on the secure version.",
              "Enable HSTS once you are confident HTTPS is working.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "privacy-policy",
    checkId: "privacy_policy",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Privacy policy present",
    summary: "A linked privacy policy is a baseline trust signal and legally required in most jurisdictions.",
    sections: [
      {
        heading: "Why this matters for AI readiness",
        blocks: [
          {
            type: "p",
            text: "A privacy policy is the lowest-effort trust signal you can publish. It costs nothing, it is legally required in most of the world, and its absence is an immediate red flag for any system evaluating your legitimacy.",
          },
          {
            type: "p",
            text: "AI crawlers use the presence of standard legal pages — privacy, terms, cookie notice — as a proxy for 'this is a real business, not a scam site'. Missing them does not guarantee you will be skipped, but it tips the balance against you.",
          },
        ],
      },
      {
        heading: "What to link and where",
        blocks: [
          {
            type: "list",
            items: [
              "Link the privacy policy from your footer on every page.",
              "Use obvious anchor text: 'Privacy Policy', not 'Legal' or 'Info'.",
              "Serve it at a stable URL like /privacy. Do not put it behind a modal.",
              "Keep a terms of service alongside it.",
              "If you serve EU users, you need a cookie notice too.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "eeat-signals",
    checkId: "eeat_signals",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "E-E-A-T signals present",
    summary: "Experience, Expertise, Authoritativeness and Trustworthiness signals measurably boost AI citations.",
    sections: [
      {
        heading: "What is E-E-A-T?",
        blocks: [
          {
            type: "p",
            text: "E-E-A-T stands for Experience, Expertise, Authoritativeness, and Trustworthiness. It started as a Google search quality concept but AI crawlers adopted it wholesale because it turns out to be a great proxy for 'should I cite this source'.",
          },
          {
            type: "p",
            text: "The research here is striking: a page with strong E-E-A-T signals at rank #6 gets cited 2.3x more often than a page with weak signals at rank #1. Authority beats position.",
          },
        ],
      },
      {
        heading: "What the signals actually look like",
        blocks: [
          {
            type: "list",
            items: [
              "Experience — specific anecdotes, first-person accounts, years in the field.",
              "Expertise — credentials, qualifications, domain knowledge demonstrated in the writing.",
              "Authoritativeness — references, citations, recognition from peers.",
              "Trustworthiness — contact info, author bylines, transparent ownership, privacy practices.",
            ],
          },
        ],
      },
      {
        heading: "Quick wins",
        blocks: [
          {
            type: "p",
            text: "Add author bylines with real photos. Link author names to bio pages. Put credentials in the byline ('MD', 'PhD', '10 years as a carpenter'). Reference external sources by name. These are small changes with an outsized impact.",
          },
        ],
      },
    ],
  },
  {
    slug: "external-links",
    checkId: "external_links",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "SEMI",
    title: "Outbound links to authoritative sources",
    summary: "Linking out to trusted external sources raises your own trustworthiness.",
    sections: [
      {
        heading: "Why linking out helps you",
        blocks: [
          {
            type: "p",
            text: "There is a persistent myth that outbound links leak authority. The opposite is true. A page that cites credible external sources signals that its author did the research. A page with no outbound links looks like it was written in a vacuum — or made up.",
          },
          {
            type: "p",
            text: "AI crawlers treat outbound links the way academic readers treat citations. More is better, as long as the sources are real and the context makes sense.",
          },
        ],
      },
      {
        heading: "What to link to",
        blocks: [
          {
            type: "list",
            items: [
              "Primary sources: original research papers, government reports, official documentation.",
              "Industry-standard references: RFCs, W3C specs, open standards bodies.",
              "Reputable news outlets when you cite news.",
              "Wikipedia sparingly, for well-established facts.",
              "Competitors and peers — yes, really. It signals confidence.",
            ],
          },
        ],
      },
    ],
  },
];
