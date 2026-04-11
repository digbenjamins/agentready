import type { CheckEntry } from "./types";

const CATEGORY = "J";
const CATEGORY_NAME = "Technical Performance";

export const technicalChecks: CheckEntry[] = [
  {
    slug: "response-time",
    checkId: "response_time",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Server response time under 500ms",
    summary: "Your server should return the first byte within 500 milliseconds of the request.",
    sections: [
      {
        heading: "Why time-to-first-byte matters",
        blocks: [
          {
            type: "p",
            text: "Time to first byte (TTFB) is how long the crawler waits between sending a request and getting anything back. It is distinct from total page load time — it measures your server, not your assets.",
          },
          {
            type: "p",
            text: "Crawlers allocate a small TTFB budget per request — typically 1 to 2 seconds max, with 500ms as the 'good' threshold. A server that takes 3 seconds to respond is at the edge of the crawler's patience, and one that takes 5 is already being dropped.",
          },
        ],
      },
      {
        heading: "How to improve TTFB",
        blocks: [
          {
            type: "list",
            items: [
              "Serve the HTML from a CDN edge rather than a single origin.",
              "Cache rendered pages. If the page does not change per user, it should not be regenerated per request.",
              "Use a keepalive connection and HTTP/2 or HTTP/3.",
              "Host close to your audience. EU audience, EU hosting.",
              "Fix slow database queries in your homepage render path.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "html-valid",
    checkId: "html_valid",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Clean HTML without critical errors",
    summary: "Your HTML should parse cleanly without unclosed tags, duplicate IDs, or structural errors.",
    sections: [
      {
        heading: "Why HTML hygiene matters",
        blocks: [
          {
            type: "p",
            text: "Modern browsers are forgiving — they fix broken HTML on the fly. AI crawlers are less forgiving. They use simpler parsers that can choke on unclosed tags, mismatched elements, or duplicate IDs. When the parser chokes, it either skips content or misinterprets structure.",
          },
          {
            type: "p",
            text: "The most expensive failure is not a total parse error; it is subtle structural confusion that makes the crawler think one section is nested inside another. Your navigation becomes part of your article. Your footer becomes part of your main content.",
          },
        ],
      },
      {
        heading: "Common critical errors",
        blocks: [
          {
            type: "list",
            items: [
              "Unclosed div or section tags.",
              "Duplicate id attributes.",
              "Mismatched nesting (p inside p, ul inside a).",
              "Missing required attributes on form elements.",
              "Mixed content (http images on an https page).",
            ],
          },
        ],
      },
      {
        heading: "How to check",
        blocks: [
          {
            type: "p",
            text: "Run the W3C HTML validator against your homepage and any pages where structure matters. Fix everything it flags as Error. Warnings are usually safe to ignore.",
          },
        ],
      },
    ],
    furtherReading: [{ label: "W3C HTML Validator", url: "https://validator.w3.org/" }],
  },
  {
    slug: "text-to-html-ratio",
    checkId: "text_to_html_ratio",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "Good text-to-HTML ratio",
    summary: "At least 25% of your page's raw size should be actual content text, not markup.",
    sections: [
      {
        heading: "What the ratio measures",
        blocks: [
          {
            type: "p",
            text: "The text-to-HTML ratio is the proportion of your page that is actual readable text versus HTML markup, inline CSS, and inline JavaScript. A ratio below 25% means the page is mostly scaffolding with a little content stuck on top.",
          },
          {
            type: "p",
            text: "Content-dense pages score above 30%. Text-heavy blog posts can hit 40% or more. Single-page React apps often score below 5% because all the content is in JavaScript rather than HTML.",
          },
        ],
      },
      {
        heading: "How to improve the ratio",
        blocks: [
          {
            type: "list",
            items: [
              "Move inline styles to external CSS files.",
              "Move inline scripts to external JavaScript files.",
              "Render content server-side so it appears in the HTML.",
              "Remove unused CSS and JS from the critical path.",
              "Replace div soup with semantic HTML elements.",
            ],
          },
        ],
      },
    ],
  },
];
