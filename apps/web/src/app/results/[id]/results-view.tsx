"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, Lock, ArrowRight, Loader2, Sparkles, BarChart3, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MODEL_ICONS } from "@/components/model-icons";
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

interface McdaReport {
  queries: string[];
  models: { id: string; label: string }[];
  citations: {
    query: string;
    results: {
      model: string;
      cited: boolean;
      citedSites: { domain: string; parameters: string }[];
      rawResponse: string;
    }[];
  }[];
  impactAnalysis: { model: string; signals: string }[];
  modelReports: { model: string; report: string }[];
  impactSummaries?: Record<string, string>;
  reportSummaries?: Record<string, string>;
  actionItems: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    agreedByCount: number;
    models: string[];
  }[];
  summary: {
    citedByCount: number;
    queryHitCount: number;
    topCompetitors: { domain: string; count: number }[];
    consensusSites: string[];
    modelGaps: { model: string; uniqueCitations: string[] }[];
    verdict: string;
  };
  generatedAt: string;
}

interface Submission {
  id: string;
  website: string;
  score?: number | null;
  unlocked: boolean;
  mcdaReport?: McdaReport | null;
  mcdaStatus?: string | null;
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

// ── Checks by Category (accordion, grouped by composite) ───

const CATEGORY_LABELS: Record<string, string> = {
  A: "Machine access",
  B: "Content clarity",
  C: "Structure",
  D: "Entities & schema",
  E: "Trust signals",
  F: "Conversational fit",
  G: "Crawl permissions",
  H: "Extractability",
  I: "Authority signals",
  J: "Technical perf.",
  K: "Agent readiness",
};

function ChecksByCategory({
  checks,
  categoryScores,
}: {
  checks: Check[];
  categoryScores: Submission["stats"]["categoryScores"];
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const toggle = (cat: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  // Group checks by category
  const grouped = new Map<string, Check[]>();
  for (const check of checks) {
    const meta = parseCheckMeta(check.description);
    const cat = meta?.category || "?";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(check);
  }

  const visibilityCats = categoryScores.filter((c) => c.composite === "visibility").sort((a, b) => a.category.localeCompare(b.category));
  const discoverabilityCats = categoryScores.filter((c) => c.composite === "discoverability").sort((a, b) => a.category.localeCompare(b.category));

  function renderGroup(label: string, cats: typeof categoryScores) {
    return (
      <div className="mb-6">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
          {label}
        </p>
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          {cats.map((cat, idx) => {
            const catChecks = grouped.get(cat.category) || [];
            const passed = catChecks.filter((c) => c.passed).length;
            const total = catChecks.length;
            const pct = cat.maxPts > 0 ? (cat.earned / cat.maxPts) * 100 : 0;
            const isOpen = open.has(cat.category);

            return (
              <div key={cat.category} className={idx > 0 ? "border-t border-border/30" : ""}>
                <button
                  onClick={() => toggle(cat.category)}
                  className="flex items-center gap-3 w-full px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </p>
                      <span className="text-[9px] font-mono text-muted-foreground/50">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden max-w-[120px]">
                        <div
                          className={`h-full rounded-full ${
                            pct >= 80 ? "bg-primary" : pct >= 50 ? "bg-amber-500" : "bg-destructive/70"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {cat.earned}/{cat.maxPts} pts
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs tabular-nums ${passed === total ? "text-primary" : "text-muted-foreground"}`}>
                    {passed}/{total}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 space-y-2">
                    {catChecks.map((check) => (
                      <div
                        key={check.id}
                        className="flex gap-3 items-start rounded-lg bg-muted/20 px-4 py-2.5"
                      >
                        {check.passed ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground">{check.name}</p>
                          {check.details && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{check.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">
        All checks
      </p>
      {renderGroup("AI Visibility", visibilityCats)}
      {renderGroup("AI Discoverability", discoverabilityCats)}
    </motion.div>
  );
}

// ── MCDA Report Section ────────────────────────────────────

/** Platform labels for citation matrix columns */
const PLATFORM_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  gpt:        { label: "chatgpt.com",      bg: "bg-emerald-500/5", text: "text-emerald-400" },
  claude:     { label: "claude.ai",        bg: "bg-amber-500/5",   text: "text-amber-400" },
  gemini:     { label: "Google AI Search",  bg: "bg-blue-500/5",    text: "text-blue-400" },
  grok:       { label: "x.com",            bg: "bg-neutral-500/5", text: "text-neutral-400" },
  perplexity: { label: "perplexity.ai",    bg: "bg-cyan-500/5",    text: "text-cyan-400" },
};

/** Model label with icon */
function ModelLabel({ modelKey, label, className = "text-xs" }: { modelKey: string; label: string; className?: string }) {
  const Icon = MODEL_ICONS[modelKey];
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium text-foreground ${className}`}>
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
}

/** Reusable collapsible card for MCDA sections */
function CollapsibleCard({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-5 py-3.5 text-left hover:bg-muted/20 transition-colors"
      >
        <div>
          <p className="text-xs font-medium text-foreground">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-border/30">{children}</div>}
    </div>
  );
}

function McdaSection({ submission }: { submission: Submission }) {
  const [polling, setPolling] = useState(submission.mcdaStatus === "processing");
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["actions", "matrix"]));
  const report = submission.mcdaReport as McdaReport | null;

  const toggle = (key: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Poll for report completion
  useEffect(() => {
    if (!polling) return;
    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/submission/${submission.id}/mcda-status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === "completed" || data.status === "failed") {
          setPolling(false);
          if (data.status === "completed") window.location.reload();
        }
      } catch { /* ignore */ }
    }, 5000);
    const timeout = setTimeout(() => { if (!cancelled) setPolling(false); }, 120_000);
    return () => { cancelled = true; clearInterval(interval); clearTimeout(timeout); };
  }, [polling, submission.id]);

  // Processing state
  if (submission.mcdaStatus === "processing" || polling) {
    return (
      <motion.div
        className="mb-10 rounded-xl border border-primary/20 bg-gradient-to-b from-card to-primary/[0.03] p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center gap-3 mb-3">
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
          <p className="text-sm font-medium text-foreground">Your multi-AI citation report is being generated</p>
        </div>
        <p className="text-xs text-muted-foreground">
          We are querying 7 AI models (GPT, Claude, Gemini, Grok, Perplexity, Mistral, Llama) with 10 real prompts in your niche. You will receive an email with your full report access link once it is ready.
        </p>
      </motion.div>
    );
  }

  // No report yet (old submission or failed)
  if (!report) {
    if (submission.mcdaStatus === "failed") {
      return (
        <motion.div
          className="mb-10 rounded-xl border border-border/60 bg-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Multi-AI citation analysis</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Report generation failed. Try refreshing the page to restart.
          </p>
        </motion.div>
      );
    }
    return null;
  }

  const { summary, citations, impactAnalysis, modelReports, models, impactSummaries, reportSummaries } = report;
  const modelLabels: Record<string, string> = {};
  for (const m of models) modelLabels[m.id] = m.label;

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-4">
        Multi-AI citation analysis
      </p>

      {/* Verdict (always visible) */}
      <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-card to-primary/[0.03] p-6 mb-4">
        <div className="flex items-center gap-6 mb-4">
          <div className="text-center">
            <p className={`text-3xl font-bold tabular-nums ${summary.citedByCount >= 6 ? "text-primary" : summary.citedByCount >= 3 ? "text-amber-500" : "text-destructive/70"}`}>
              {summary.citedByCount}<span className="text-lg text-muted-foreground font-normal">/7</span>
            </p>
            <p className="text-[10px] text-muted-foreground">models cite you</p>
          </div>
          <div className="text-center">
            <p className={`text-3xl font-bold tabular-nums ${summary.queryHitCount >= 7 ? "text-primary" : summary.queryHitCount >= 3 ? "text-amber-500" : "text-destructive/70"}`}>
              {summary.queryHitCount}<span className="text-lg text-muted-foreground font-normal">/10</span>
            </p>
            <p className="text-[10px] text-muted-foreground">queries return you</p>
          </div>
        </div>
        {summary.verdict && (
          <p className="text-sm text-muted-foreground leading-relaxed">{summary.verdict}</p>
        )}
      </div>

      {/* Consensus action items */}
      {report.actionItems?.length > 0 && (
        <CollapsibleCard
          title="Action items"
          subtitle={`${report.actionItems?.length ?? 0} improvements identified across 7 AI models`}
          isOpen={openSections.has("actions")}
          onToggle={() => toggle("actions")}
        >
          <div className="divide-y divide-border/20">
            {report.actionItems.map((item, i) => {
              const priorityColor = item.priority === "high"
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : item.priority === "medium"
                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  : "bg-muted text-muted-foreground border-border/40";
              return (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 mt-0.5 text-[9px] font-mono font-medium px-1.5 py-0.5 rounded border ${priorityColor}`}>
                      {item.priority}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-mono text-muted-foreground/60">
                          {item.agreedByCount}/7 models agree
                        </span>
                        <div className="flex items-center gap-1">
                          {[...new Set(item.models)].map((m) => {
                            const Icon = MODEL_ICONS[m];
                            return Icon ? <Icon key={m} className="h-3 w-3" /> : null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleCard>
      )}

      {/* Citation matrix */}
      <CollapsibleCard
        title="Citation matrix"
        subtitle="Does each AI model recommend you for these niche queries?"
        isOpen={openSections.has("matrix")}
        onToggle={() => toggle("matrix")}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left px-5 py-2.5 font-medium text-muted-foreground w-[40%]">Query</th>
                {models.map((m) => {
                  const platform = PLATFORM_LABELS[m.id];
                  return (
                    <th key={m.id} className={`text-center px-3 py-2.5 font-medium text-muted-foreground ${platform ? `relative ${platform.bg}` : ""}`}>
                      <ModelLabel modelKey={m.id} label={m.label} className="text-[10px] justify-center" />
                      {platform && (
                        <span className={`block text-[8px] font-normal mt-0.5 ${platform.text}`}>{platform.label}</span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {citations.map((entry, i) => (
                <tr key={i} className="border-b border-border/20 last:border-b-0">
                  <td className="px-5 py-2.5 text-foreground leading-snug">{entry.query}</td>
                  {entry.results.map((r) => (
                    <td key={r.model} className={`text-center px-3 py-2.5 ${PLATFORM_LABELS[r.model]?.bg ?? ""}`}>
                      {r.cited ? (
                        <CheckCircle2 className="h-4 w-4 text-primary inline-block" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive/50 inline-block" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleCard>

      {/* Top competitors */}
      {summary.topCompetitors.length > 0 && (
        <CollapsibleCard
          title="Competitors that get cited instead"
          subtitle={`${summary.topCompetitors.length} competing domains found across all queries`}
          isOpen={openSections.has("competitors")}
          onToggle={() => toggle("competitors")}
        >
          <div className="divide-y divide-border/20">
            {summary.topCompetitors.slice(0, 8).map((comp) => (
              <div key={comp.domain} className="flex items-center justify-between px-5 py-2.5">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-foreground font-medium">{comp.domain}</p>
                  {summary.consensusSites.includes(comp.domain) && (
                    <span className="text-[9px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">consensus</span>
                  )}
                </div>
                <p className="text-xs tabular-nums text-muted-foreground">{comp.count}x cited</p>
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* AI priorities summary */}
      {impactAnalysis.length > 0 && (
        <CollapsibleCard
          title="What each AI prioritizes"
          subtitle="Top ranking signal per model. See full analysis in the in-depth section below."
          isOpen={openSections.has("impact-summary")}
          onToggle={() => toggle("impact-summary")}
        >
          <div className="divide-y divide-border/20">
            {impactAnalysis.map((ia) => {
              const oneLiner = impactSummaries?.[ia.model]
                || ia.signals?.split("\n").find((l: string) => l.trim())?.slice(0, 140) || "";
              return (
                <div key={ia.model} className="flex items-start gap-3 px-5 py-2.5">
                  <ModelLabel modelKey={ia.model} label={modelLabels[ia.model] || ia.model} className="shrink-0 w-28" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{oneLiner}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleCard>
      )}

      {/* Suggestability summary */}
      {modelReports.length > 0 && (
        <CollapsibleCard
          title="Suggestability overview"
          subtitle="Key takeaway per model. Full reports available in the in-depth section below."
          isOpen={openSections.has("reports-summary")}
          onToggle={() => toggle("reports-summary")}
        >
          <div className="divide-y divide-border/20">
            {modelReports.map((mr) => {
              const oneLiner = reportSummaries?.[mr.model]
                || mr.report?.split("\n").find((l: string) => l.trim())?.slice(0, 140) || "";
              return (
                <div key={mr.model} className="flex items-start gap-3 px-5 py-2.5">
                  <ModelLabel modelKey={mr.model} label={modelLabels[mr.model] || mr.model} className="shrink-0 w-28" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{oneLiner}</p>
                </div>
              );
            })}
          </div>
        </CollapsibleCard>
      )}

      {/* Model-specific citations */}
      {summary.modelGaps.some((g) => g.uniqueCitations.length > 0) && (
        <CollapsibleCard
          title="Model-specific citations"
          subtitle="Sites only one AI model recommends (the gap between models)"
          isOpen={openSections.has("gaps")}
          onToggle={() => toggle("gaps")}
        >
          <div className="divide-y divide-border/20">
            {summary.modelGaps
              .filter((g) => g.uniqueCitations.length > 0)
              .map((g) => (
                <div key={g.model}>
                  <button
                    onClick={() => toggle(`gap-${g.model}`)}
                    className="flex items-center justify-between w-full px-5 py-3 text-left hover:bg-muted/20 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <ModelLabel modelKey={g.model} label={modelLabels[g.model] || g.model} />
                      <span className="text-xs text-muted-foreground font-normal">only</span>
                    </span>
                    <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${openSections.has(`gap-${g.model}`) ? "rotate-180" : ""}`} />
                  </button>
                  {openSections.has(`gap-${g.model}`) && (
                    <div className="px-5 pb-4">
                      <p className="text-xs text-muted-foreground">
                        Only {modelLabels[g.model] || g.model} recommends: {g.uniqueCitations.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CollapsibleCard>
      )}

      {/* In-depth research divider */}
      {(impactAnalysis.length > 0 || modelReports.length > 0) && (
        <div className="flex items-center gap-3 mt-6 mb-2">
          <div className="flex-1 h-px bg-border/40" />
          <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest shrink-0">
            In-depth research
          </p>
          <div className="flex-1 h-px bg-border/40" />
        </div>
      )}

      {/* Full: What each AI prioritizes */}
      {impactAnalysis.length > 0 && (
        <CollapsibleCard
          title="What each AI prioritizes (full)"
          subtitle="Complete signal weights each model uses when recommending sites"
          isOpen={openSections.has("impact")}
          onToggle={() => toggle("impact")}
        >
          <div className="divide-y divide-border/20">
            {impactAnalysis.map((ia) => (
              <div key={ia.model}>
                <button
                  onClick={() => toggle(`impact-${ia.model}`)}
                  className="flex items-center justify-between w-full px-5 py-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <ModelLabel modelKey={ia.model} label={modelLabels[ia.model] || ia.model} />
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${openSections.has(`impact-${ia.model}`) ? "rotate-180" : ""}`} />
                </button>
                {openSections.has(`impact-${ia.model}`) && (
                  <div className="px-5 pb-4">
                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{ia.signals}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}

      {/* Full: Suggestability reports */}
      {modelReports.length > 0 && (
        <CollapsibleCard
          title="Suggestability reports (full)"
          subtitle="Complete analysis from each AI on how to improve your site"
          isOpen={openSections.has("reports")}
          onToggle={() => toggle("reports")}
        >
          <div className="divide-y divide-border/20">
            {modelReports.map((mr) => (
              <div key={mr.model}>
                <button
                  onClick={() => toggle(`report-${mr.model}`)}
                  className="flex items-center justify-between w-full px-5 py-3 text-left hover:bg-muted/20 transition-colors"
                >
                  <ModelLabel modelKey={mr.model} label={modelLabels[mr.model] || mr.model} />
                  <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${openSections.has(`report-${mr.model}`) ? "rotate-180" : ""}`} />
                </button>
                {openSections.has(`report-${mr.model}`) && (
                  <div className="px-5 pb-4">
                    <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{mr.report}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>
      )}
    </motion.div>
  );
}

export function ResultsView({ submission }: { submission: Submission }) {
  const { visibilityScore, discoverabilityScore, totalChecks, categoryScores } = submission.stats;

  // Server already gated: revealed checks have full data, others are stripped
  const revealed = submission.checks.filter((c) => c.revealed);
  const locked = submission.checks.filter((c) => !c.revealed);

  // For free tier, split revealed into blockers (first 3 failed) and quick fix (4th failed)
  const topBlockers = revealed.filter((c) => !c.passed).slice(0, 3);
  const quickFix = revealed.filter((c) => !c.passed).slice(3, 4);
  const totalFailed = submission.checks.filter((c) => !c.passed).length;


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
      {!submission.unlocked && topBlockers.length > 0 && (
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
      {!submission.unlocked && quickFix.length > 0 && (
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
      {!submission.unlocked && (
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
                  We query 7 AI models with real prompts in your niche. Multi-signal scoring reveals which AI recommends you, which skips you, and why.
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
                  { label: "Multi-AI citation report across 7 models", highlight: true },
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

            <Button
              className="w-full h-11 gap-2 text-sm font-medium cursor-pointer hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all"
              onClick={async () => {
                try {
                  const res = await fetch("/api/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ submissionId: submission.id }),
                  });
                  const data = await res.json();
                  if (data.url) {
                    window.location.href = data.url;
                  }
                } catch (err) {
                  console.error("Checkout failed:", err);
                }
              }}
            >
              Unlock full audit — <span className="line-through opacity-60">&euro;29</span> &euro;19
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-3 tracking-wide">
              One-time · No subscription · Instant access
            </p>
          </div>
        </motion.div>
      )}

      {/* Pro: all checks by category */}
      {submission.unlocked && <ChecksByCategory checks={submission.checks} categoryScores={submission.stats.categoryScores} />}

      {/* MCDA Report (Pro only) */}
      {submission.unlocked && <McdaSection submission={submission} />}


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

      {/* Footer disclaimer */}
      <div className="mt-10 pt-6 border-t border-border/30 space-y-3 pb-8">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
          <Link href="/terms" className="hover:text-muted-foreground transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</Link>
        </div>
        <p className="text-[10px] text-muted-foreground/40 text-center max-w-lg mx-auto leading-relaxed">
          Parts of this report are generated by AI models and are provided for informational purposes only. Results may vary between scans due to the non-deterministic nature of AI. We do not guarantee the accuracy or completeness of AI-generated findings.
        </p>
      </div>
    </div>
  );
}
