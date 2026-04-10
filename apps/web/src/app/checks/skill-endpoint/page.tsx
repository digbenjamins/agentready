import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "/skill Endpoint Check — AgentReady",
  description:
    "Learn what a /skill API endpoint is, why AI agents use it to query your site's capabilities in real-time, and how to implement one to get recommended by AI assistants.",
};

export default function SkillEndpointPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">
              Agent
            </span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">
              Ready ✓
            </span>
          </Link>
          <Link
            href="/#audit"
            className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Run free check
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-mono text-primary mb-4 tracking-wide uppercase">
          Check 2 of 3
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          /skill endpoint
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          A dynamic API endpoint that lets AI agents query your site&apos;s
          capabilities programmatically, returning structured data about what
          your product or service can do.
        </p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What is the /skill endpoint?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While{" "}
              <Link
                href="/checks/skill-md"
                className="text-primary hover:underline"
              >
                skill.md
              </Link>{" "}
              is a static file, the{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                /skill
              </code>{" "}
              endpoint is a live API route that returns structured JSON data
              about your site&apos;s capabilities. AI agents can query it
              programmatically to get up-to-date information about your product.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This is the dynamic counterpart to your static skill.md file. It
              can return real-time information like current pricing, available
              features, API status, and supported integrations — things that
              might change frequently and would be hard to keep updated in a
              static file.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Why does it matter?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AI agents are evolving beyond simple web scraping. Modern agents
              from platforms like ChatGPT, Claude, and Perplexity are designed to
              interact with structured APIs. When an agent can call your /skill
              endpoint, it gets precise, current data — not a stale cache of your
              marketing page.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This means when someone asks &quot;what&apos;s the best tool for
              X?&quot;, the AI can pull live data from your endpoint to give an
              accurate, current recommendation rather than relying on
              potentially outdated training data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What should it return?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The endpoint should return a JSON response with a clear structure:
            </p>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto">
              <pre>{`GET /skill

{
  "name": "Acme CRM",
  "description": "Lightweight CRM built for small sales teams",
  "capabilities": [
    "Contact and deal management",
    "Pipeline visualization",
    "Email integration",
    "Reporting and forecasting"
  ],
  "categories": ["CRM", "Sales", "Productivity"],
  "audience": ["Small businesses", "Startups", "Freelancers"],
  "pricing": {
    "free_tier": true,
    "starting_price": "$12/user/month"
  },
  "urls": {
    "homepage": "https://acmecrm.com",
    "docs": "https://docs.acmecrm.com",
    "pricing": "https://acmecrm.com/pricing"
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to implement</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The implementation depends on your stack. Here are examples for
              common frameworks:
            </p>

            <h3 className="text-lg font-medium mb-3 mt-6">Next.js</h3>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto">
              <pre>{`// app/skill/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "Your Product",
    description: "What your product does",
    capabilities: ["Feature 1", "Feature 2"],
    categories: ["Category"],
    audience: ["Target audience"],
  });
}`}</pre>
            </div>

            <h3 className="text-lg font-medium mb-3 mt-6">Express.js</h3>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto">
              <pre>{`app.get("/skill", (req, res) => {
  res.json({
    name: "Your Product",
    description: "What your product does",
    capabilities: ["Feature 1", "Feature 2"],
  });
});`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Best practices</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                — Return{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  Content-Type: application/json
                </code>{" "}
                with a proper JSON response.
              </li>
              <li>
                — Keep response times fast (under 500ms). Agents may time out on
                slow endpoints.
              </li>
              <li>
                — Use consistent field names. Stick to common conventions like{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  name
                </code>
                ,{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  description
                </code>
                ,{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  capabilities
                </code>
                .
              </li>
              <li>
                — Include a{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  urls
                </code>{" "}
                object so agents can link users to the right pages.
              </li>
              <li>
                — Support CORS headers if you want third-party agents to access
                it from browsers.
              </li>
              <li>— Don&apos;t require authentication. This should be public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Difference from skill.md
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
                <p className="font-medium text-foreground mb-2">skill.md</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>— Static markdown file</li>
                  <li>— Human and machine readable</li>
                  <li>— Updated manually on deploy</li>
                  <li>— Good for stable information</li>
                </ul>
              </div>
              <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
                <p className="font-medium text-foreground mb-2">
                  /skill endpoint
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>— Dynamic JSON API</li>
                  <li>— Machine readable only</li>
                  <li>— Always returns live data</li>
                  <li>— Good for changing information</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Further reading</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://platform.openai.com/docs/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI — Actions and plugins for ChatGPT ↗
                </a>
              </li>
              <li>
                <a
                  href="https://modelcontextprotocol.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Model Context Protocol (MCP) specification ↗
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 flex items-center justify-between">
          <Link
            href="/checks/skill-md"
            className="text-sm text-primary hover:underline font-medium"
          >
            ← skill.md
          </Link>
          <Link
            href="/checks/agent-json"
            className="text-sm text-primary hover:underline font-medium"
          >
            .well-known/agent.json →
          </Link>
        </div>
      </article>

      <footer className="border-t border-border/40 py-10 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="flex items-center gap-1.5 mb-2">
                <span className="font-bold text-foreground">Agent</span>
                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
                  Ready ✓
                </span>
              </span>
              <p className="text-sm text-muted-foreground">
                Make your website part of the AI conversation.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-2">
                Checks
              </p>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href="/checks/skill-md"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    skill.md
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checks/skill-endpoint"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    /skill endpoint
                  </Link>
                </li>
                <li>
                  <Link
                    href="/checks/agent-json"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    .well-known/agent.json
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
