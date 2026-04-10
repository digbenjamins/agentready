import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: ".well-known/agent.json Check — AgentReady",
  description:
    "Learn what agent.json is, why it's the emerging standard for AI agent discovery, and how to implement it so AI assistants like ChatGPT and Claude can find and recommend your website.",
};

export default function AgentJsonPage() {
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
          Check 3 of 3
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          .well-known/agent.json
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">
          The emerging standard for AI agent discovery. A JSON file in the{" "}
          <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
            .well-known
          </code>{" "}
          directory that follows web conventions to help AI agents find and
          understand your site.
        </p>

        <div className="prose-custom space-y-10">
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What is agent.json?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                /.well-known/agent.json
              </code>{" "}
              is a discovery file that follows the{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc8615"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                RFC 8615
              </a>{" "}
              well-known URI standard — the same convention used by{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                robots.txt
              </code>
              ,{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                security.txt
              </code>
              , and SSL certificate validation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              It tells AI agents: &quot;Here&apos;s what this website is, what it
              can do, and how to interact with it.&quot; Because it lives in the
              well-known directory, agents know exactly where to find it without
              guessing — just like browsers know to look for{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                favicon.ico
              </code>{" "}
              at the root.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Why does it matter?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                .well-known
              </code>{" "}
              directory is already a trusted standard across the web. By placing
              your agent discovery file there, you&apos;re following an
              established convention that AI platforms are increasingly adopting.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This is particularly important because it creates a predictable,
              standardized location for AI agent metadata. As the ecosystem
              matures, this will likely become the primary way AI agents discover
              and interact with websites — similar to how{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                robots.txt
              </code>{" "}
              became the standard for search engine crawlers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Early adopters have a significant advantage. Setting this up now
              means your site is already discoverable as AI platforms roll out
              support for this standard.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              What should it include?
            </h2>
            <div className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto">
              <pre>{`// /.well-known/agent.json

{
  "schema_version": "1.0",
  "name": "Acme CRM",
  "description": "Lightweight CRM built for small sales teams",
  "url": "https://acmecrm.com",
  "logo": "https://acmecrm.com/logo.png",
  "capabilities": {
    "skill_file": "/skill.md",
    "skill_endpoint": "/skill",
    "api_docs": "https://docs.acmecrm.com/api"
  },
  "contact": {
    "email": "hello@acmecrm.com",
    "support": "https://acmecrm.com/support"
  },
  "categories": ["CRM", "Sales", "Productivity"],
  "authentication": {
    "type": "none",
    "discovery_requires_auth": false
  }
}`}</pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Key fields</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm shrink-0 h-fit">
                  schema_version
                </code>
                <span>
                  Version of the agent.json schema you&apos;re using. Start with
                  &quot;1.0&quot;.
                </span>
              </li>
              <li className="flex gap-3">
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm shrink-0 h-fit">
                  capabilities
                </code>
                <span>
                  Links to your other agent-readable resources like skill.md and
                  the /skill endpoint. This ties everything together.
                </span>
              </li>
              <li className="flex gap-3">
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm shrink-0 h-fit">
                  authentication
                </code>
                <span>
                  Tells agents whether they need auth to access your discovery
                  files. For public discovery, set to &quot;none&quot;.
                </span>
              </li>
              <li className="flex gap-3">
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm shrink-0 h-fit">
                  categories
                </code>
                <span>
                  Helps agents classify your site correctly. Use common industry
                  terms.
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">How to implement</h2>
            <ol className="space-y-3 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">1.</span>
                <span>
                  Create a{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    .well-known
                  </code>{" "}
                  directory in your site&apos;s public/static files root.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">2.</span>
                <span>
                  Create an{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    agent.json
                  </code>{" "}
                  file inside it with your site&apos;s metadata.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">3.</span>
                <span>
                  Make sure your server or hosting platform serves files from the{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    .well-known
                  </code>{" "}
                  directory. Some platforms require explicit configuration for
                  dot-prefixed directories.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">4.</span>
                <span>
                  Verify it returns valid JSON at{" "}
                  <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                    yourdomain.com/.well-known/agent.json
                  </code>
                  .
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold shrink-0">5.</span>
                <span>
                  Run the{" "}
                  <Link href="/#audit" className="text-primary hover:underline">
                    AgentReady check
                  </Link>{" "}
                  to confirm everything is working.
                </span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Common hosting notes
            </h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Next.js / Vercel</strong> —
                Place it in the{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  public/.well-known/
                </code>{" "}
                directory. Vercel serves it automatically.
              </li>
              <li>
                <strong className="text-foreground">Nginx</strong> — Ensure your
                config doesn&apos;t block dot-prefixed directories. Add:{" "}
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  location /.well-known/ {"{ }"}
                </code>
              </li>
              <li>
                <strong className="text-foreground">Netlify</strong> — Works out
                of the box from the publish directory.
              </li>
              <li>
                <strong className="text-foreground">Apache</strong> — You may
                need to allow access to dot-prefixed directories in your
                .htaccess.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">
              The .well-known standard
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                .well-known
              </code>{" "}
              URI pattern is defined by{" "}
              <a
                href="https://www.rfc-editor.org/rfc/rfc8615"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                RFC 8615
              </a>{" "}
              and is maintained by IANA. Well-known examples include:
            </p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  /.well-known/security.txt
                </code>{" "}
                — Security vulnerability disclosure
              </li>
              <li>
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  /.well-known/openid-configuration
                </code>{" "}
                — OpenID Connect discovery
              </li>
              <li>
                <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                  /.well-known/apple-app-site-association
                </code>{" "}
                — iOS universal links
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Adding{" "}
              <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">
                agent.json
              </code>{" "}
              to this directory follows a proven web convention. It&apos;s not a
              hack or a workaround — it&apos;s the right place for discovery
              metadata.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Further reading</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a
                  href="https://www.rfc-editor.org/rfc/rfc8615"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  RFC 8615 — Well-Known URIs ↗
                </a>
              </li>
              <li>
                <a
                  href="https://www.iana.org/assignments/well-known-uris/well-known-uris.xhtml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  IANA Well-Known URI Registry ↗
                </a>
              </li>
              <li>
                <a
                  href="https://modelcontextprotocol.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Model Context Protocol (MCP) ↗
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 flex items-center justify-between">
          <Link
            href="/checks/skill-endpoint"
            className="text-sm text-primary hover:underline font-medium"
          >
            ← /skill endpoint
          </Link>
          <Link
            href="/#audit"
            className="text-sm text-primary hover:underline font-medium"
          >
            Run your check →
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
