import type { Metadata } from "next";
import Link from "next/link";
import { allChecks, categoryOrder, getChecksByCategory } from "@/content/checks";

export const metadata: Metadata = {
  title: "Knowledge Base — OkforAI",
  description:
    "A complete reference for the 49 signals AI agents use to decide whether to cite your website. Covers agent readiness, content, structure, trust, and more.",
};

export default function ChecksIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-4xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">AI ✓</span>
          </Link>
          <Link href="/#audit" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Run free check
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-sm font-mono text-primary mb-4 tracking-wide uppercase">Knowledge base</p>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">All checks</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
          {allChecks.length} signals AI agents use to decide whether to cite your website. Each one has a dedicated page explaining what it is, why it matters,
          and how to fix it.
        </p>

        <div className="space-y-12">
          {categoryOrder.map((category) => {
            const checks = getChecksByCategory(category.code);
            if (checks.length === 0) return null;
            return (
              <section key={category.code}>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">{category.code}</span>
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                  <span className="text-sm text-muted-foreground">({checks.length})</span>
                </div>
                <ul className="divide-y divide-border/40 border border-border/40 rounded-lg overflow-hidden">
                  {checks.map((check) => (
                    <li key={check.slug}>
                      <Link
                        href={`/checks/${check.slug}`}
                        className="block px-5 py-4 hover:bg-secondary/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {check.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{check.summary}</p>
                          </div>
                          <span
                            className={`text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-1 ${
                              check.checkType === "AUTO"
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {check.checkType}
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </article>

      <footer className="border-t border-border/40 py-10 px-6 mt-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="flex items-center gap-1.5 mb-2">
                <span className="font-bold text-foreground">OKFOR</span>
                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-md">AI ✓</span>
              </span>
              <p className="text-sm text-muted-foreground">Make your website part of the AI conversation.</p>
            </div>
            <Link href="/#audit" className="text-sm text-primary hover:underline font-medium">
              Run a free check →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
