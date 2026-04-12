"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Lock, ArrowRight, Loader2, Mail, Sparkles, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface Check {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string | null;
  revealed: boolean;
}

/** Parse "[llms_txt] Category A — AUTO" into { id, category, type } */
function parseCheckMeta(description: string) {
  const match = description.match(/^\[(.+?)\]\s*Category\s+(\w+)\s*—\s*(\w+)$/);
  if (!match) return null;
  return { checkId: match[1], category: match[2], type: match[3] };
}

function CheckMeta({ description }: { description: string }) {
  const meta = parseCheckMeta(description);
  if (!meta) return null;
  return (
    <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-wider whitespace-nowrap">
      {meta.category} · {meta.type}
    </span>
  );
}

interface Submission {
  id: string;
  website: string;
  score?: number | null;
  pro?: boolean;
  email?: string | null;
  checks: Check[];
  stats: {
    totalChecks: number;
    totalPassed: number;
    visibilityScore: number;
    discoverabilityScore: number;
    categoryScores: {
      category: string;
      label: string;
      earned: number;
      maxPts: number;
      composite: "visibility" | "discoverability";
    }[];
  };
}

export function ResultsView({ submission }: { submission: Submission }) {
  const [emailInput, setEmailInput] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(!!submission.email);

  const isPro = submission.pro ?? false;
  const { visibilityScore, discoverabilityScore, totalChecks, categoryScores } = submission.stats;

  // Server already gated: revealed checks have full data, others are stripped
  const revealed = submission.checks.filter((c) => c.revealed);
  const locked = submission.checks.filter((c) => !c.revealed);

  // For free tier, split revealed into blockers (first 3 failed) and quick fix (4th failed)
  const topBlockers = revealed.filter((c) => !c.passed).slice(0, 3);
  const quickFix = revealed.filter((c) => !c.passed).slice(3, 4);
  const totalFailed = submission.checks.filter((c) => !c.passed).length;

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setEmailSaving(true);
    try {
      await fetch("/api/submission/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: submission.id, email: emailInput }),
      });
      setEmailSaved(true);
    } finally {
      setEmailSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Results for
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          {submission.website}
        </h1>
        <p className="text-muted-foreground">
          {totalChecks} checks completed
        </p>
      </motion.div>

      {/* Scores */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
            AI Visibility
          </p>
          <p className={`text-4xl font-bold tabular-nums ${visibilityScore >= 85 ? "text-primary" : visibilityScore >= 50 ? "text-amber-500" : "text-destructive/70"}`}>
            {visibilityScore}
            <span className="text-sm text-muted-foreground font-normal ml-1">/100</span>
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card p-6">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
            AI Discoverability
          </p>
          <p className={`text-4xl font-bold tabular-nums ${discoverabilityScore >= 85 ? "text-primary" : discoverabilityScore >= 50 ? "text-amber-500" : "text-destructive/70"}`}>
            {discoverabilityScore}
            <span className="text-sm text-muted-foreground font-normal ml-1">/100</span>
          </p>
        </div>
      </motion.div>

      {/* Category breakdown - split by composite score */}
      <motion.div
        className="grid grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        {(["visibility", "discoverability"] as const).map((composite) => (
          <div key={composite} className="rounded-xl border border-border/60 bg-card p-6">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-5">
              {composite === "visibility" ? "AI Visibility" : "AI Discoverability"}
            </p>
            <div className="space-y-4">
              {categoryScores
                .filter((cat) => cat.composite === composite)
                .map((cat) => {
                  const pct = cat.maxPts > 0 ? (cat.earned / cat.maxPts) * 100 : 0;
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-medium text-foreground">{cat.label}</p>
                        <p className="text-xs tabular-nums text-muted-foreground">
                          {cat.earned}/{cat.maxPts}
                        </p>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            pct >= 80 ? "bg-primary" : pct >= 50 ? "bg-amber-500" : "bg-destructive/70"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Top blockers (free + pro) */}
      {!isPro && topBlockers.length > 0 && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
            Top blockers
          </p>
          <div className="space-y-3">
            {topBlockers.map((check) => (
              <div
                key={check.id}
                className="flex gap-3 items-start rounded-lg border border-border/60 bg-card px-5 py-4"
              >
                <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{check.name}</p>
                    <CheckMeta description={check.description} />
                  </div>
                  {check.details && (
                    <p className="text-xs text-muted-foreground/70 mt-1">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick fix (free only) */}
      {!isPro && quickFix.length > 0 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mb-4 font-bold">
            Quick fix
          </p>
          {quickFix.map((check) => (
            <div
              key={check.id}
              className="flex gap-3 items-start rounded-lg border border-amber-500/30 bg-amber-500/5 px-5 py-4"
            >
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{check.name}</p>
                  <CheckMeta description={check.description} />
                </div>
                {check.details && (
                  <p className="text-xs text-muted-foreground/70 mt-1">{check.details}</p>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Locked section (free tier) */}
      {!isPro && (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Section header */}
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
            Full results
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {totalFailed} issue{totalFailed !== 1 ? "s" : ""} found — upgrade to see all with fixes
          </p>

          {/* Blurred locked checks list */}
          <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden mb-6">
            <div className="select-none pointer-events-none" aria-hidden>
              {locked.slice(0, 6).map((check, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-border/30 last:border-b-0">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 relative z-10" />
                  {check.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary/40 shrink-0 relative z-10" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5 text-amber-500/40 shrink-0 relative z-10" />
                  )}
                  <div className="flex-1 blur-[5px]">
                    <div className="h-3.5 bg-muted-foreground/15 rounded w-full mb-1" />
                    <div className="h-2.5 bg-muted-foreground/10 rounded w-3/4" />
                  </div>
                </div>
              ))}
              {locked.length > 6 && (
                <div className="px-5 py-2.5 text-center blur-[4px]">
                  <p className="text-xs text-muted-foreground/30">
                    +{locked.length - 6} more checks
                  </p>
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60">
              <Lock className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                {locked.length} checks locked
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Each with a detailed explanation and how to fix it
              </p>
            </div>
          </div>

          {/* Pro feature preview - blurred reports */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Multi-AI citation report (MCDA) */}
            <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-5 space-y-2.5 blur-[4px] select-none pointer-events-none" aria-hidden>
                <div className="h-3 bg-muted-foreground/12 rounded w-full" />
                <div className="h-3 bg-muted-foreground/10 rounded w-5/6" />
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-primary/8 rounded flex-1" />
                  <div className="h-6 bg-amber-500/8 rounded flex-1" />
                  <div className="h-6 bg-destructive/8 rounded flex-1" />
                  <div className="h-6 bg-primary/8 rounded flex-1" />
                </div>
                <div className="h-3 bg-muted-foreground/8 rounded w-3/4" />
                <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                <div className="h-10 bg-primary/10 rounded w-full mt-1" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/70 backdrop-blur-[1px] px-4 text-center">
                <BarChart3 className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Multi-AI citation analysis</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed max-w-[220px]">
                  We query GPT, Claude, Gemini &amp; Grok with real prompts in your niche. Multi-signal scoring reveals which AI recommends you, which skips you, and why.
                </p>
                <p className="text-[10px] text-primary font-medium mt-1.5">Pro only</p>
              </div>
            </div>

            {/* Competitive benchmark */}
            <div className="relative rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="px-5 py-5 space-y-2.5 blur-[4px] select-none pointer-events-none" aria-hidden>
                <div className="h-3 bg-muted-foreground/12 rounded w-full" />
                <div className="h-3 bg-muted-foreground/10 rounded w-4/5" />
                <div className="flex gap-2 mt-2">
                  <div className="h-4 bg-primary/10 rounded flex-1" />
                  <div className="h-4 bg-amber-500/10 rounded flex-1" />
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-destructive/10 rounded flex-1" />
                  <div className="h-4 bg-primary/10 rounded flex-1" />
                </div>
                <div className="h-3 bg-muted-foreground/8 rounded w-2/3" />
                <div className="h-10 bg-primary/10 rounded w-full mt-1" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/70 backdrop-blur-[1px] px-4 text-center">
                <Sparkles className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Competitive benchmark</p>
                <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed max-w-[220px]">
                  See which competitors get cited instead of you, what signals they have that you lack, and a prioritized fix roadmap with PDF export.
                </p>
                <p className="text-[10px] text-primary font-medium mt-1.5">Pro only</p>
              </div>
            </div>
          </div>

          {/* Unlock card */}
          <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-card to-primary/[0.03] p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">
                  Pro audit
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Unlock your full AI audit
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-md">
                  {totalFailed} issue{totalFailed !== 1 ? "s" : ""} found across {totalChecks} checks.
                  Get the full breakdown with fixes, AI citation analysis across 4 models, and a prioritized roadmap.
                </p>
              </div>
              <div className="text-right shrink-0 ml-6">
                <p className="text-sm text-muted-foreground/60 line-through tabular-nums">
                  &euro;29
                </p>
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  &euro;19
                </p>
                <p className="text-[10px] text-primary font-medium">temporary offer</p>
              </div>
            </div>

            <div className="border-t border-border/40 pt-5 mb-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                {[
                  { label: `All ${totalChecks} checks with detailed explanation`, highlight: false },
                  { label: "Fix instructions per failed check", highlight: false },
                  { label: "Multi-AI citation report (GPT, Claude, Gemini, Grok)", highlight: true },
                  { label: "Competitive benchmark vs. cited competitors", highlight: true },
                  { label: "Prioritized fix roadmap", highlight: false },
                  { label: "AI-rewritten homepage copy", highlight: false },
                  { label: "Schema.org code ready to paste", highlight: false },
                  { label: "PDF export of full report", highlight: false },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-start gap-2">
                    <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${feature.highlight ? "text-primary" : "text-muted-foreground/50"}`} />
                    <p className={`text-xs leading-snug ${feature.highlight ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {feature.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 mb-4 flex items-center justify-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-500">
                <span className="font-medium">Easter launch offer.</span>{" "}Get &euro;10 off your full audit, for a limited time only.
              </p>
            </div>

            <Button className="w-full h-11 gap-2 text-sm font-medium">
              Unlock full audit — <span className="line-through opacity-60">&euro;29</span> &euro;19
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3 tracking-wide">
              One-time · No subscription · Instant access
            </p>
          </div>
        </motion.div>
      )}

      {/* Pro: all checks */}
      {isPro && (
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
            All checks
          </p>
          <div className="space-y-2">
            {submission.checks.map((check) => (
              <div
                key={check.id}
                className="flex gap-3 items-start rounded-lg border border-border/60 bg-card px-5 py-3"
              >
                {check.passed ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive/70 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{check.name}</p>
                    <CheckMeta description={check.description} />
                  </div>
                  {check.details && (
                    <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Email capture */}
      {!submission.email && (
        <motion.div
          className="rounded-xl border border-border/60 bg-secondary/20 p-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          {emailSaved ? (
            <div className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-foreground">We&apos;ll send a summary to your email.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Get this report in your inbox
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                We&apos;ll send you a copy of your scores and top findings. No spam.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                  className="h-10 flex-1 bg-background/60"
                />
                <Button type="submit" size="sm" variant="outline" className="h-10 px-4 shrink-0" disabled={emailSaving}>
                  {emailSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      )}

      {/* Knowledge base link */}
      <motion.div
        className="text-center pt-6 border-t border-border/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <p className="text-sm text-muted-foreground mb-3">
          Want to understand what each check means and how to fix it?
        </p>
        <Link
          href="/checks"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Browse the knowledge base
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </div>
  );
}
