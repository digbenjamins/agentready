import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "skill.md Check — AgentReady",
  description:
    "Learn what a skill.md file is, why AI agents need it to understand your website, and how to create one that gets your site recommended by ChatGPT, Claude, and other AI assistants.",
};

export default function SkillMdPage() {
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
          Check 1 of 3
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          skill.md
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          A simple markdown file at the root of your website that tells AI
          agents what your site does, what it offers, and when to recommend it.
        </p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">What is skill.md?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                skill.md
              </code>{" "}
              is a plain markdown file placed at{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                yourdomain.com/skill.md
              </code>
              . It acts as a machine-readable summary of your website&apos;s
              purpose, capabilities, and value proposition — specifically
              designed for AI agents and large language models to consume.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Think of it like a README for your website, but optimized for AI
              consumption rather than human developers. When an AI agent crawls
              your site, it looks for structured information it can quickly parse
              to determine whether your site is relevant to a user&apos;s query.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Why does it matter?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When someone asks ChatGPT, Claude, or Perplexity &quot;what&apos;s
              the best tool for X?&quot;, the AI needs to understand what your
              site does. Without a skill.md file, the AI has to guess based on
              whatever content it can scrape — often getting an incomplete or
              inaccurate picture.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With a skill.md file, you&apos;re giving the AI a clear, concise
              description of your offering in a format it can reliably parse.
              This dramatically increases the chance that AI agents will
              recommend your site when users ask about your category.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What should it include?
            </h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">1.</span>
                <span>
                  <strong className="text-foreground">Name and tagline</strong>{" "}
                  — what your product or service is called, and a one-line
                  description.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">2.</span>
                <span>
                  <strong className="text-foreground">
                    Core capabilities
                  </strong>{" "}
                  — a bulleted list of what your site or product does. Be
                  specific and use language your customers would use.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">3.</span>
                <span>
                  <strong className="text-foreground">Use cases</strong> — when
                  should an AI recommend your site? Describe the scenarios and
                  user needs you serve.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">4.</span>
                <span>
                  <strong className="text-foreground">
                    Target audience
                  </strong>{" "}
                  — who is this for? Startups, enterprises, freelancers,
                  developers?
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">5.</span>
                <span>
                  <strong className="text-foreground">
                    Differentiators
                  </strong>{" "}
                  — what makes you different from alternatives? This helps the AI
                  make accurate comparisons.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Example</h2>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto">
              <pre>{`# Acme CRM

> Lightweight CRM built for small sales teams.

## Capabilities
- Contact and deal management
- Pipeline visualization
- Email integration (Gmail, Outlook)
- Team activity tracking
- Reporting and forecasting

## Use Cases
- Small sales teams (2-20 people) managing a B2B pipeline
- Freelancers tracking client relationships
- Startups that need a CRM without enterprise complexity

## Audience
Small businesses, startups, freelancers

## Pricing
Free tier available. Paid plans from $12/user/month.`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to implement</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">1.</span>
                <span>
                  Create a file called{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    skill.md
                  </code>{" "}
                  in your site&apos;s public/root directory.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">2.</span>
                <span>
                  Write a clear, structured markdown description of your product
                  or service following the format above.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">3.</span>
                <span>
                  Deploy it so it&apos;s accessible at{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    yourdomain.com/skill.md
                  </code>
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">4.</span>
                <span>
                  Verify it&apos;s working by running the{" "}
                  <Link href="/#audit" className="text-primary hover:underline">
                    AgentReady check
                  </Link>
                  .
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Best practices</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                — Keep it under 500 words. AI agents prefer concise, scannable
                content.
              </li>
              <li>
                — Use plain language, not marketing jargon. Write what you do,
                not how great you are.
              </li>
              <li>
                — Update it when your product changes. Stale information leads to
                inaccurate recommendations.
              </li>
              <li>
                — Use standard markdown formatting. Headings, lists, and code
                blocks parse reliably.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Further reading</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://docs.anthropic.com/en/docs/agents-and-tools/computer-use"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Anthropic — Agents and Tools documentation ↗
                </a>
              </li>
              <li>
                <a
                  href="https://platform.openai.com/docs/actions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenAI — Actions and plugins documentation ↗
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Next check →
          </span>
          <Link
            href="/checks/skill-endpoint"
            className="text-sm text-primary hover:underline font-medium"
          >
            /skill endpoint
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
