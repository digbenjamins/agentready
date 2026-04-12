"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { TypingTerminal, terminalConvos } from "@/components/typing-terminal";

export function TerminalHero({ checkCount }: { checkCount: number }) {
  return (
    <section className="border-b border-border/40 bg-secondary/10">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Copy */}
          <div>
            <p className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4">
              This is happening right now
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              People are asking AI about your industry.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Every day, potential customers ask ChatGPT, Perplexity, and Claude for recommendations.
              The sites that show up aren&apos;t random. They&apos;re optimized for AI readability.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Our knowledge base covers all {checkCount} checks we run, explains why each one matters,
              and shows you exactly how to fix it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/#audit"
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Run a free audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#checks"
                className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-md border border-border/60 text-sm font-medium text-foreground hover:bg-secondary/40 transition-colors"
              >
                Browse all checks
              </a>
            </div>
          </div>

          {/* Terminal */}
          <div>
            <TypingTerminal convos={terminalConvos} />
          </div>
        </div>
      </div>
    </section>
  );
}
