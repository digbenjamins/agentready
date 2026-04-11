import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allChecks, getAllSlugs, getCheckBySlug, getChecksByCategory } from "@/content/checks";
import type { Block } from "@/content/checks/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const check = getCheckBySlug(slug);
  if (!check) return { title: "Check not found — OkforAI" };
  return {
    title: `${check.title} — OkforAI`,
    description: check.summary,
  };
}

function renderBlock(block: Block, idx: number) {
  switch (block.type) {
    case "p":
      return (
        <p key={idx} className="text-muted-foreground leading-relaxed mb-4">
          {block.text}
        </p>
      );
    case "code":
      return (
        <div
          key={idx}
          className="rounded-lg border border-border/50 bg-secondary/30 p-5 font-mono text-sm text-muted-foreground leading-relaxed overflow-x-auto mb-4"
        >
          <pre>{block.code}</pre>
        </div>
      );
    case "list":
      return (
        <ul key={idx} className="space-y-2 text-muted-foreground mb-4">
          {block.items.map((item, i) => (
            <li key={i}>— {item}</li>
          ))}
        </ul>
      );
    case "h3":
      return (
        <h3 key={idx} className="text-lg font-medium mb-3 mt-6">
          {block.text}
        </h3>
      );
  }
}

export default async function CheckPage({ params }: PageProps) {
  const { slug } = await params;
  const check = getCheckBySlug(slug);
  if (!check) notFound();

  const siblings = getChecksByCategory(check.category);
  const idx = siblings.findIndex((c) => c.slug === check.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto max-w-3xl flex items-center justify-between h-14 px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <span className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md">AI ✓</span>
          </Link>
          <Link href="/#audit" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
            Run free check
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <div className="flex items-center gap-3 text-sm mb-4">
          <Link href="/checks" className="text-primary hover:underline font-mono uppercase tracking-wide">
            Knowledge base
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-muted-foreground uppercase tracking-wide">{check.categoryName}</span>
          <span
            className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${
              check.checkType === "AUTO" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
            }`}
          >
            {check.checkType}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">{check.title}</h1>
        <p className="text-xl text-muted-foreground leading-relaxed mb-12">{check.summary}</p>

        <div className="prose-custom space-y-10">
          {check.sections.map((section, si) => (
            <section key={si}>
              <h2 className="text-2xl font-semibold mb-4">{section.heading}</h2>
              {section.blocks.map((block, bi) => renderBlock(block, bi))}
            </section>
          ))}

          {check.furtherReading && check.furtherReading.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">Further reading</h2>
              <ul className="space-y-2 text-muted-foreground">
                {check.furtherReading.map((ref, i) => (
                  <li key={i}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {ref.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-border/40 flex items-center justify-between gap-4">
          {prev ? (
            <Link href={`/checks/${prev.slug}`} className="text-sm text-primary hover:underline font-medium max-w-[45%]">
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/checks/${next.slug}`} className="text-sm text-primary hover:underline font-medium max-w-[45%] text-right">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>

      <footer className="border-t border-border/40 py-10 px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="flex items-center gap-1.5 mb-2">
                <span className="font-bold text-foreground">OKFOR</span>
                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-md">AI ✓</span>
              </span>
              <p className="text-sm text-muted-foreground">Make your website part of the AI conversation.</p>
            </div>
            <Link href="/checks" className="text-sm text-primary hover:underline font-medium">
              Back to knowledge base →
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
