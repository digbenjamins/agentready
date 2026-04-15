import type { CheckEntry } from "./types";

const CATEGORY = "K";
const CATEGORY_NAME = "Agent Readiness";

export const agentReadinessChecks: CheckEntry[] = [
  {
    slug: "skill-md",
    checkId: "skill_md",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "skill.md file present",
    summary: "A markdown file at the root of your site that describes your product to AI agents in plain language.",
    sections: [
      {
        heading: "What is skill.md?",
        blocks: [
          {
            type: "p",
            text: "skill.md is a plain markdown file served from the root of your domain — for example, https://example.com/skill.md. It describes what your product does, who it is for, and how AI agents should talk about it. Think of it as a README for machines.",
          },
          {
            type: "p",
            text: "AI crawlers from ChatGPT, Claude, Perplexity and Gemini are starting to look for this file the same way search engines look for robots.txt. When they find one, they get a clean, authoritative summary of your product without having to infer it from marketing copy or navigation elements.",
          },
        ],
      },
      {
        heading: "Why does it matter?",
        blocks: [
          {
            type: "p",
            text: "Large language models build an internal representation of your business from whatever text they find. If that text is a homepage full of CSS and JavaScript, the model has to guess. If it is a focused markdown file, the model gets the exact positioning you wrote.",
          },
          {
            type: "p",
            text: "Sites with a well-structured skill.md are significantly more likely to be recommended when a user asks an AI assistant a question in your category. It also gives you direct control over how your product is described — something you do not have when the model paraphrases third-party reviews.",
          },
        ],
      },
      {
        heading: "How to implement",
        blocks: [
          {
            type: "p",
            text: "Create a file called skill.md in the public root of your site so it is accessible at /skill.md. Start with a short frontmatter block containing a name and description, then write a few short markdown sections covering what you do, who you are for, and how to use you.",
          },
          {
            type: "code",
            lang: "markdown",
            code: `---
name: acme-crm
description: Lightweight CRM for small sales teams.
---

# Acme CRM

Acme CRM is a simple sales pipeline tool built for teams of 2 to 20 people.

## What it does
- Contact and deal management
- Visual pipeline
- Email and calendar sync
- Reporting

## Who it is for
Small businesses, startups, and independent sales professionals who want a CRM that is fast to set up.

## How to try it
Visit https://acmecrm.com or email hello@acmecrm.com.`,
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Keep it short. A skill.md that fits on one screen is more useful than a long essay.",
              "Lead with the most important sentence. Models often quote from the first paragraph.",
              "Use plain English, not marketing language. Avoid superlatives and jargon.",
              "Include concrete information: features, audience, pricing, contact.",
              "Serve it as text/markdown or text/plain. Do not return HTML.",
            ],
          },
        ],
      },
    ],
    furtherReading: [
      { label: "Anthropic — Model Context Protocol", url: "https://modelcontextprotocol.io/" },
      { label: "OpenAI — GPTBot documentation", url: "https://platform.openai.com/docs/gptbot" },
    ],
  },
  {
    slug: "skill-md-name",
    checkId: "skill_md_name",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "skill.md provides a name",
    summary: "Your skill.md file should declare a product name in a YAML frontmatter block so agents can identify it unambiguously.",
    sections: [
      {
        heading: "Why a name field?",
        blocks: [
          {
            type: "p",
            text: "AI agents that consume skill.md files treat them as structured records, not just prose. A YAML frontmatter block at the top of the file gives the agent reliable fields it can extract without having to parse your headings.",
          },
          {
            type: "p",
            text: "The name field is the most important one. It is the canonical identifier the agent will use when referring to your product in conversation with a user. Without it, the agent has to guess from the first H1 or the URL, and it sometimes guesses wrong.",
          },
        ],
      },
      {
        heading: "How to add it",
        blocks: [
          {
            type: "p",
            text: "Add a YAML frontmatter block at the very top of your skill.md file, before any other content. The block is delimited by three dashes on their own line.",
          },
          {
            type: "code",
            lang: "markdown",
            code: `---
name: acme-crm
description: Lightweight CRM for small sales teams.
---

# Acme CRM

Rest of your skill.md content here...`,
          },
          {
            type: "p",
            text: "The name should be a stable, machine-friendly identifier — typically the same slug you would use for your product on npm, GitHub, or a package registry.",
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Use the same name everywhere: skill.md, agent.json, package.json, and your brand URL.",
              "Do not change it once published. Agents may cache it.",
              "Keep it lowercase and short. More on format in the next check.",
              "Match it to how users actually say your product name out loud.",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "skill-md-name-format",
    checkId: "skill_md_name_format",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "skill.md name format valid",
    summary: "The name field in your skill.md must contain only lowercase letters, numbers, and hyphens.",
    sections: [
      {
        heading: "What is the format rule?",
        blocks: [
          {
            type: "p",
            text: "Skill names follow the same convention as npm package names, Docker image tags, and Kubernetes resource names: lowercase letters, digits, and hyphens. No spaces, no uppercase, no underscores, no special characters.",
          },
          {
            type: "p",
            text: "The regular expression is simple: ^[a-z0-9-]+$. A valid name is something like acme-crm, openai-mcp, or sales-pipeline-2. An invalid name is Acme CRM, acme_crm, or Acme!.",
          },
        ],
      },
      {
        heading: "Why does the format matter?",
        blocks: [
          {
            type: "p",
            text: "Machine identifiers appear in URLs, filesystem paths, command-line tools, and registries. Every one of those contexts has edge cases with spaces, uppercase, or punctuation. Sticking to the lowercase-and-hyphens rule means your name works everywhere an agent might want to reference it.",
          },
          {
            type: "p",
            text: "It also keeps the identifier distinct from the display name of your brand. Acme CRM (the brand) and acme-crm (the identifier) can coexist — the first goes on your website, the second goes in skill.md.",
          },
        ],
      },
      {
        heading: "How to fix a bad name",
        blocks: [
          {
            type: "p",
            text: "Take your brand name, lowercase it, and replace any spaces or punctuation with hyphens. Drop anything that is not a letter, a digit, or a hyphen.",
          },
          {
            type: "code",
            lang: "text",
            code: `Brand name              Valid identifier
Acme CRM          →     acme-crm
OpenAI Plugin     →     openai-plugin
Sales Pipeline 2  →     sales-pipeline-2
My_Product!       →     my-product`,
          },
        ],
      },
    ],
  },
  {
    slug: "skill-endpoint",
    checkId: "skill_endpoint",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: "/skill JSON endpoint",
    summary: "A dynamic API endpoint that returns structured JSON about your product's capabilities, audience and pricing.",
    sections: [
      {
        heading: "What is the /skill endpoint?",
        blocks: [
          {
            type: "p",
            text: "While skill.md is a static file, the /skill endpoint is a live API route that returns structured JSON about your product. AI agents can query it programmatically to get up-to-date information without having to parse your HTML or markdown.",
          },
          {
            type: "p",
            text: "This is the dynamic counterpart to skill.md. It can return real-time data like current pricing, available features, API status, and supported integrations — things that change frequently and would be a hassle to keep updated in a static file.",
          },
        ],
      },
      {
        heading: "Why does it matter?",
        blocks: [
          {
            type: "p",
            text: "Modern agents from OpenAI, Anthropic, and Perplexity are designed to interact with structured APIs, not just scrape pages. When an agent can call your /skill endpoint, it gets precise, current data — not a stale cache of your marketing page.",
          },
          {
            type: "p",
            text: "When a user asks what is the best tool for X, the AI can pull live data from your endpoint to give an accurate, current recommendation rather than relying on what was in its training set six months ago.",
          },
        ],
      },
      {
        heading: "What should it return?",
        blocks: [
          {
            type: "p",
            text: "The endpoint should return a JSON response with a consistent structure describing your product. There is no official schema yet, but the de-facto convention looks like this:",
          },
          {
            type: "code",
            lang: "json",
            code: `{
  "name": "acme-crm",
  "description": "Lightweight CRM for small sales teams",
  "capabilities": [
    "Contact and deal management",
    "Pipeline visualization",
    "Email integration"
  ],
  "categories": ["CRM", "Sales", "Productivity"],
  "audience": ["Small businesses", "Startups"],
  "pricing": {
    "free_tier": true,
    "starting_price": "$12/user/month"
  },
  "urls": {
    "homepage": "https://acmecrm.com",
    "docs": "https://docs.acmecrm.com",
    "pricing": "https://acmecrm.com/pricing"
  }
}`,
          },
        ],
      },
      {
        heading: "How to implement",
        blocks: [
          { type: "h3", text: "Next.js" },
          {
            type: "code",
            lang: "typescript",
            code: `// app/skill/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "your-product",
    description: "What your product does",
    capabilities: ["Feature 1", "Feature 2"],
  });
}`,
          },
          { type: "h3", text: "Express" },
          {
            type: "code",
            lang: "javascript",
            code: `app.get("/skill", (req, res) => {
  res.json({
    name: "your-product",
    description: "What your product does",
    capabilities: ["Feature 1", "Feature 2"],
  });
});`,
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Return Content-Type: application/json.",
              "Keep response times under 500ms. Agents time out on slow endpoints.",
              "Use consistent field names: name, description, capabilities, urls.",
              "Support CORS so browser-based agents can query it.",
              "Do not require authentication. /skill must be public.",
            ],
          },
        ],
      },
    ],
    furtherReading: [
      { label: "OpenAI — Actions and plugins", url: "https://platform.openai.com/docs/actions" },
      { label: "Model Context Protocol", url: "https://modelcontextprotocol.io/" },
    ],
  },
  {
    slug: "agent-json",
    checkId: "agent_json",
    category: CATEGORY,
    categoryName: CATEGORY_NAME,
    checkType: "AUTO",
    title: ".well-known/agent.json",
    summary: "The standard agent discovery file, analogous to robots.txt but written specifically for AI agents.",
    sections: [
      {
        heading: "What is agent.json?",
        blocks: [
          {
            type: "p",
            text: "The agent.json file lives at /.well-known/agent.json on your domain. It is the closest thing the AI ecosystem has to a formal discovery standard, and it describes your product, its capabilities, and how agents should interact with it.",
          },
          {
            type: "p",
            text: "The .well-known path is defined by RFC 8615 — the same path used by security.txt, openid-configuration, and other machine-discoverable metadata. Putting your agent manifest there tells crawlers exactly where to look.",
          },
        ],
      },
      {
        heading: "Why does it matter?",
        blocks: [
          {
            type: "p",
            text: "Agent crawlers check a small number of well-known paths. If you do not have an agent.json, you are invisible to anything that treats it as the canonical entry point. And the cost of shipping one is trivial — a single static file.",
          },
          {
            type: "p",
            text: "It is also the primary place to advertise your /skill endpoint, your skill.md file, and any API capabilities. An agent that reads your agent.json gets a roadmap of everything else you have published for it.",
          },
        ],
      },
      {
        heading: "What should it contain?",
        blocks: [
          {
            type: "code",
            lang: "json",
            code: `{
  "name": "acme-crm",
  "description": "Lightweight CRM for small sales teams.",
  "url": "https://acmecrm.com",
  "capabilities": [
    {
      "name": "website-check",
      "endpoint": "/api/check",
      "method": "POST",
      "content_type": "application/json"
    }
  ],
  "skill_file": "/skill.md",
  "contact": "hello@acmecrm.com"
}`,
          },
        ],
      },
      {
        heading: "How to serve it",
        blocks: [
          {
            type: "p",
            text: "Place the file at public/.well-known/agent.json (or the equivalent path in your framework). Serve it with Content-Type: application/json. That is the entire implementation.",
          },
          {
            type: "p",
            text: "If you use Next.js, the file under public/.well-known/agent.json will be served automatically. For Express, you can use express.static. For static sites hosted on S3 or Cloudflare Pages, just drop the file in the right folder.",
          },
        ],
      },
      {
        heading: "Best practices",
        blocks: [
          {
            type: "list",
            items: [
              "Always return valid JSON. A broken file is worse than no file — it confuses parsers.",
              "Keep the name consistent with your skill.md name field.",
              "Include a contact field. Agents sometimes surface it when a user wants to follow up.",
              "Update the file when you change your API surface. Agents cache it, but not forever.",
            ],
          },
        ],
      },
    ],
    furtherReading: [
      { label: "RFC 8615 — Well-Known URIs", url: "https://www.rfc-editor.org/rfc/rfc8615" },
    ],
  },
];
