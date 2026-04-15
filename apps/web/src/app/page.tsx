"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, CheckCircle2, XCircle, Loader2, Bot, Globe, AlertCircle } from "lucide-react";
import { categoryOrder, getChecksByCategory } from "@/content/checks";

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const vendors = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Grok", color: "#f5f5f5" },
  { name: "Claude", color: "#d4a27f" },
  { name: "Gemini", color: "#8b6cf0" },
  { name: "Perplexity", color: "#20b8cd" },
  { name: "Copilot", color: "#0078d4" },
];

function HowItWorksAnimation() {
  const [stage, setStage] = useState(0);
  const [typedUrl, setTypedUrl] = useState("");
  const [autoCheckedCount, setAutoCheckedCount] = useState(0);
  const [llmCheckedCount, setLlmCheckedCount] = useState(0);
  const [visibilityScore, setVisibilityScore] = useState(0);
  const [discoverabilityScore, setDiscoverabilityScore] = useState(0);

  const url = "yourwebsite.com";

  const autoChecks = [
    "Crawl permissions",
    "Site structure",
    "Schema markup",
    "Trust signals",
    "Page performance",
  ];

  const llmChecks = [
    "Content clarity",
    "Conversational fit",
    "Entity recognition",
    "Authority signals",
    "Citation readiness",
  ];

  useEffect(() => {
    const stageDurations = [3500, 5500, 6500];
    const timer = setTimeout(() => {
      setStage((s) => (s + 1) % 3);
    }, stageDurations[stage]);
    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage !== 0) {
      setTypedUrl("");
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedUrl(url.slice(0, i));
      if (i >= url.length) clearInterval(interval);
    }, 110);
    return () => clearInterval(interval);
  }, [stage]);

  // Automated checks
  useEffect(() => {
    if (stage !== 1) {
      setAutoCheckedCount(0);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setAutoCheckedCount(i);
      if (i >= autoChecks.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [stage]);

  // LLM checks run in parallel, slightly slower pace
  useEffect(() => {
    if (stage !== 1) {
      setLlmCheckedCount(0);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLlmCheckedCount(i);
      if (i >= llmChecks.length) clearInterval(interval);
    }, 750);
    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (stage !== 2) {
      setVisibilityScore(0);
      setDiscoverabilityScore(0);
      return;
    }
    const duration = 1400;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setVisibilityScore(Math.round(47 * eased));
      setDiscoverabilityScore(Math.round(31 * eased));
      if (t >= 1) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [stage]);

  const steps = [
    { num: "1", label: "Paste your URL" },
    { num: "2", label: "We audit your site" },
    { num: "3", label: "You get your scores" },
  ];

  return (
    <div className="relative rounded-2xl border border-border/60 bg-secondary/20 p-6 md:p-10 overflow-hidden">
      <div className="flex items-center justify-center gap-2 md:gap-3 mb-6">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2.5">
              <motion.div
                className="flex items-center justify-center h-8 w-8 rounded-full font-semibold text-sm tabular-nums"
                animate={{
                  backgroundColor:
                    stage === i
                      ? "color-mix(in oklch, var(--color-primary) 100%, transparent)"
                      : stage > i
                        ? "color-mix(in oklch, var(--color-primary) 20%, transparent)"
                        : "color-mix(in oklch, var(--color-secondary) 60%, transparent)",
                  color:
                    stage === i
                      ? "var(--color-primary-foreground)"
                      : stage > i
                        ? "var(--color-primary)"
                        : "var(--color-muted-foreground)",
                }}
                transition={{ duration: 0.3 }}
              >
                {stage > i ? <CheckCircle2 className="h-4 w-4" /> : s.num}
              </motion.div>
              <span
                className={`hidden md:inline text-sm font-medium transition-colors ${
                  stage === i ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 md:w-10 h-px bg-border/60" />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[260px] flex items-start justify-center">
        <AnimatePresence mode="wait">
          {stage === 0 && (
            <motion.div
              key="stage-0"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-lg self-center"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 h-12 rounded-md border border-border/80 bg-background/60 flex items-center px-4 text-base font-mono text-foreground">
                  {typedUrl}
                  <motion.span
                    className="inline-block w-[2px] h-5 bg-primary ml-0.5"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  />
                </div>
                <div className="h-12 px-5 rounded-md bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 justify-center">
                  Scan my site
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                No signup. No credit card. Just your website address.
              </p>
            </motion.div>
          )}

          {stage === 1 && (
            <motion.div
              key="stage-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* LLM checks column — left */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      AI analysis
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {llmChecks.map((check, i) => {
                      const isDone = llmCheckedCount > i;
                      const isActive = llmCheckedCount === i;
                      return (
                        <motion.div
                          key={check}
                          className="flex items-center gap-2.5 py-1"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <div className="h-4 w-4 flex items-center justify-center shrink-0">
                            {isDone ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </motion.div>
                            ) : isActive ? (
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-border" />
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${
                              isDone || isActive
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            }`}
                          >
                            {check}
                          </span>
                        </motion.div>
                      );
                    })}
                    {/* Thinking indicator while LLM checks are running */}
                    <AnimatePresence>
                      {llmCheckedCount > 0 &&
                        llmCheckedCount < llmChecks.length && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 pt-1.5 text-[11px] text-muted-foreground"
                          >
                            <motion.div
                              className="flex gap-0.5"
                              animate={{ opacity: [0.4, 1, 0.4] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <span>AI is reading your content</span>
                              <span>...</span>
                            </motion.div>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Automated checks column — right */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      Automated checks
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {autoChecks.map((check, i) => {
                      const isDone = autoCheckedCount > i;
                      const isActive = autoCheckedCount === i;
                      return (
                        <motion.div
                          key={check}
                          className="flex items-center gap-2.5 py-1"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                        >
                          <div className="h-4 w-4 flex items-center justify-center shrink-0">
                            {isDone ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 300 }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              </motion.div>
                            ) : isActive ? (
                              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                            ) : (
                              <div className="h-1.5 w-1.5 rounded-full bg-border" />
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${
                              isDone || isActive ? "text-foreground" : "text-muted-foreground/50"
                            }`}
                          >
                            {check}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {stage === 2 && (
            <motion.div
              key="stage-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-xl space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    AI Visibility
                  </span>
                  <span className="text-2xl font-bold text-destructive/70 tabular-nums leading-none">
                    {visibilityScore}
                    <span className="text-xs text-muted-foreground ml-0.5">/100</span>
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    AI Discoverability
                  </span>
                  <span className="text-2xl font-bold text-destructive/70 tabular-nums leading-none">
                    {discoverabilityScore}
                    <span className="text-xs text-muted-foreground ml-0.5">/100</span>
                  </span>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2.5">
                  Top blockers
                </p>
                <div className="space-y-2">
                  {[
                    {
                      title: "AI doesn't know what your business does",
                      sub: "Homepage missing clear value prop, audience, and location",
                    },
                    {
                      title: "No structured data found",
                      sub: "Add Organization schema, ready-to-paste code in Pro",
                    },
                    {
                      title: "Content doesn't match AI questions",
                      sub: "No FAQ, no problem-solution structure",
                    },
                  ].map((b, i) => (
                    <motion.div
                      key={b.title}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.1 }}
                      className="flex gap-2.5 items-start"
                    >
                      <XCircle className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-[3px]" />
                      <div className="min-w-0 leading-tight">
                        <p className="text-[13px] font-medium text-foreground">
                          {b.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {b.sub}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between pt-2 text-xs"
              >
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">45</span> more checks available
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  Unlock full audit
                  <ArrowRight className="h-3 w-3" />
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GlowOrb({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[120px] opacity-20 pointer-events-none ${className}`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function CyclingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <motion.span
      className="block relative overflow-hidden h-[1.2em]"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={index}
          className="text-muted-foreground inline-flex items-center absolute left-0"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <span className="relative">
            {words[index]}
            {/* Strikethrough sweeps across before word exits */}
            <motion.span
              className="absolute left-0 right-0 top-[53%] h-[3px] bg-muted-foreground/60 origin-left rounded-full"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX: [0, 0, 1],
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.75, 1],
                ease: "easeInOut",
              }}
            />
          </span>
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

function CyclingVendor() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % vendors.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const longest = vendors.reduce((a, b) => (a.name.length >= b.name.length ? a : b)).name;

  return (
    <span className="relative inline-block align-baseline">
      <span className="invisible" aria-hidden>
        {longest}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={index}
          className="absolute left-0 top-0 whitespace-nowrap"
          style={{ color: vendors[index].color }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          {vendors[index].name}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function Home() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        // Honeypot check
        const form = e.target as HTMLFormElement;
        const hp = (form.querySelector('[name="company"]') as HTMLInputElement)?.value;
        if (hp) return;

        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ website }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Something went wrong");
        }

        const data = await res.json();
        router.push(`/results/${data.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    },
    [website, router],
  );

  return (
    <main className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Background orbs */}
      <GlowOrb className="w-[500px] h-[500px] bg-primary -top-48 -left-48" />
      <GlowOrb className="w-[400px] h-[400px] bg-primary/60 top-[60%] -right-32" />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-1.5 group">
            <span className="text-lg font-bold tracking-tight text-foreground">OKFOR</span>
            <motion.span
              className="bg-primary text-white text-sm font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              AI
              <motion.svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.path
                  d="M5 12l5 5L20 7"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                />
              </motion.svg>
            </motion.span>
          </a>
          <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
            Why it matters
          </a>
        </div>
      </motion.nav>

      {/* Hero — full-width copy, terminal below */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 bg-[url('/website-ready-for-ai.jpg')] bg-cover bg-center"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/55 to-background"
        />
        <div className="mx-auto max-w-6xl relative">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm font-mono text-primary mb-6 tracking-wide"
          >
            FOR BUSINESSES THAT WANT TO BE FOUND BY AI, NOT JUST GOOGLE
          </motion.p>

          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              Your next customer is asking <CyclingVendor />
            </motion.span>
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
            >
              Are you the answer?
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-3xl"
          >
            Get an AI visibility report in 30 seconds. See whether ChatGPT and other AI tools can read,
            understand and recommend your website.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 w-full"
          >
            <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
              <input type="text" name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none" />
              <div className="flex flex-col sm:flex-row gap-3 lg:w-1/2">
                <Input
                  type="text"
                  placeholder="yourwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  required
                  className="h-14 text-lg flex-1 bg-secondary/50 border-border/60 focus-visible:ring-primary/30"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-14 px-8 text-base font-semibold whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Scanning…
                    </>
                  ) : (
                    <>
                      Scan my site
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>

              <div className="flex-1 flex items-center justify-between gap-4 h-14 px-6 rounded-md border border-border/60 bg-secondary/30 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary shadow-[0_0_0_3px] shadow-primary/20" />
                  <span className="text-foreground font-medium">Free</span>
                  <span className="text-muted-foreground hidden md:inline">· No signup required</span>
                </div>
                <Separator orientation="vertical" className="self-stretch h-auto" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-semibold text-foreground tabular-nums">1,200+</span>
                  <span className="text-xs text-muted-foreground">sites scanned</span>
                </div>
                <Separator orientation="vertical" className="self-stretch h-auto hidden md:block" />
                <div className="hidden md:flex items-baseline gap-1.5">
                  <span className="text-base font-semibold text-foreground tabular-nums">30s</span>
                  <span className="text-xs text-muted-foreground">to results</span>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </motion.form>
        </div>
      </section>

      {/* Why it matters */}
      <section id="why" className="py-20 px-6 border-t border-border/40">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "ChatGPT is replacing Google",
                body: "Sites like ChatGPT, Perplexity, and Claude don't show ten blue links. They recommend one or two. If you're not one of them, you don't get the click.",
              },
              {
                title: "AI needs structure, not only content",
                body: "AI agents look for machine-readable files like /skill.md and agent.json to figure out what your site does and whether it's worth recommending.",
              },
              {
                title: "Your competitors aren't ready",
                body: "Almost no one has set up their site for AI agents. Do it now and you're ahead of 99% of your industry before this becomes table stakes.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative rounded-xl border border-border/60 bg-secondary/20 px-6 py-5 hover:border-primary/40 hover:bg-secondary/30 transition-colors"
              >
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1 leading-snug flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-24 px-6 border-t border-border/40 bg-secondary/20">
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="text-xs font-mono font-bold text-foreground uppercase tracking-widest mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            The problem
          </motion.p>
          <div className="grid md:grid-cols-[auto_1fr] gap-x-10 gap-y-6 items-start">
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span className="text-7xl md:text-8xl font-bold text-destructive/50 tabular-nums leading-none tracking-tight">
                89%
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest mt-3">
                Below 60 on first audit
              </span>
            </motion.div>
            <motion.div
              className="space-y-5 self-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-2xl md:text-3xl font-semibold text-foreground leading-snug tracking-tight">
                Of websites score below 60 on their first AI audit.
                Most owners have no idea.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                AI doesn&apos;t rank your site. It either understands you, or it doesn&apos;t. Most sites fall into a
                gap no one told them about. Yours might too. If your site isn&apos;t set up for AI agents,
                you won&apos;t show up.
              </p>
              <motion.div
                className="flex flex-wrap items-center gap-2.5 pt-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                {vendors.map((v, i) => (
                  <motion.span
                    key={v.name}
                    className="px-3.5 py-1.5 rounded-full border text-sm font-medium"
                    style={{
                      color: v.color,
                      borderColor: `${v.color}33`,
                      backgroundColor: `${v.color}0d`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.4 + i * 0.06,
                      type: "spring",
                      stiffness: 180,
                    }}
                    whileHover={{
                      scale: 1.06,
                      borderColor: `${v.color}80`,
                      backgroundColor: `${v.color}1a`,
                      transition: { duration: 0.2 },
                    }}
                  >
                    {v.name}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why AI ignores most sites */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="text-xs font-mono font-bold text-foreground uppercase tracking-widest mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Why AI ignores most sites
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-4 max-w-3xl"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            There are two reasons AI skips your site. Most tools only check one.
          </motion.h2>
          <motion.p
            className="text-base text-muted-foreground leading-relaxed max-w-3xl mb-12"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Can AI read your site is different from will AI recommend you. They&apos;re separate problems
            with different timelines, and fixing the wrong one first wastes months.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                label: "AI Visibility Score",
                score: 47,
                question: "Can AI agents access, read, and parse your content?",
                problem: "Problem 1 · fix in days",
              },
              {
                label: "AI Discoverability Score",
                score: 31,
                question: "Will AI actually recommend you when someone asks?",
                problem: "Problem 2 · fix in weeks",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                className="relative rounded-xl border border-border/60 bg-secondary/20 p-8 hover:border-primary/40 transition-colors"
              >
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                  {item.label}
                </p>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-6xl font-bold text-destructive/60 tabular-nums leading-none tracking-tight">
                    {item.score}
                  </span>
                  <span className="text-xl font-semibold text-muted-foreground tabular-nums">
                    /100
                  </span>
                </div>
                <p className="text-base text-foreground leading-snug mb-4">
                  {item.question}
                </p>
                <p className="text-xs font-mono text-primary uppercase tracking-widest">
                  {item.problem}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-base text-muted-foreground leading-relaxed max-w-3xl mt-10"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            The gap between these two scores tells you which problem you actually have, and what to fix
            first. <span className="text-foreground font-medium">Okfor.ai gives you both.</span>
          </motion.p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-border/40">
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="text-xs font-mono font-bold text-foreground uppercase tracking-widest mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How it works
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight mb-12"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Three steps. Thirty seconds.
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HowItWorksAnimation />
          </motion.div>
        </div>
      </section>

      {/* Why we built this */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            Why we built this
          </motion.p>
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Built by agency owners, for business owners.
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Vincent",
                role: "Web agency owner",
                image: "/vincent.png",
                xUrl: null as string | null,
                quote: "I build websites for small businesses. When AI took off, I started noticing my clients weren't showing up in ChatGPT, even when they ranked well on Google. No tool could tell me why in plain language. So we built one.",
              },
              {
                name: "Benjamin",
                role: "Developer & co-founder",
                image: "/benjamin.png",
                xUrl: "https://x.com/digbenjamins",
                quote: "Every check in this audit is something we wished we had two years ago. We got tired of guessing what AI engines want and started reverse-engineering it. Okfor.ai is the result.",
              },
            ].map((person, i) => (
              <motion.div
                key={person.name}
                className="rounded-xl border border-border/60 bg-card p-6 flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="text-[15px] leading-relaxed text-foreground/90 flex-1">
                  <span className="text-primary/30 font-serif text-xl leading-none mr-1">&ldquo;</span>
                  {person.quote}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden bg-secondary shrink-0">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerHTML = `<span class="flex items-center justify-center h-full w-full text-primary font-bold text-sm">${person.name[0]}</span>`;
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground">{person.name}</p>
                      {person.xUrl && (
                        <a href={person.xUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{person.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="mx-auto max-w-5xl">
          <motion.p
            className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            What you get
          </motion.p>
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Here&apos;s what your results look like
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-10 max-w-xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            No fluff. Your scores, your blockers, and what to do next.
          </motion.p>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Results mock — takes 3 cols */}
            <div className="lg:col-span-3 rounded-xl border border-border/60 bg-card overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/40 bg-secondary/30">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                  <div className="h-2.5 w-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="text-[11px] text-muted-foreground font-mono bg-secondary/60 rounded px-3 py-0.5">
                    okfor.ai/results
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border/40 p-4">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                      AI Visibility
                    </p>
                    <p className="text-3xl font-bold text-destructive/70 tabular-nums">
                      47<span className="text-sm text-muted-foreground font-normal ml-1">/100</span>
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/40 p-4">
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                      AI Discoverability
                    </p>
                    <p className="text-3xl font-bold text-destructive/70 tabular-nums">
                      31<span className="text-sm text-muted-foreground font-normal ml-1">/100</span>
                    </p>
                  </div>
                </div>

                {/* Blockers */}
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">
                    Top blockers
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Missing skill.md file",
                        sub: "Quick fix. Tells AI agents what your business does, 5 min setup",
                        pass: "quick-fix" as const,
                      },
                      {
                        title: "AI doesn't know what your business does",
                        sub: "Homepage missing clear value prop, audience, and location",
                        pass: false,
                      },
                      {
                        title: "No structured data found",
                        sub: "Add Organization schema, ready-to-paste code in Pro",
                        pass: false,
                      },
                      {
                        title: "Content doesn't match AI questions",
                        sub: "No FAQ, no problem-solution structure",
                        pass: false,
                      },
                    ].map((b) => (
                      <div key={b.title} className="flex gap-2.5 items-start">
                        {b.pass === "quick-fix" ? (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-[3px]" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-destructive/70 shrink-0 mt-[3px]" />
                        )}
                        <div className="min-w-0 leading-tight">
                          <p className="text-[13px] font-medium text-foreground">{b.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{b.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* More issues teaser */}
                <div className="flex items-center justify-between pt-1 border-t border-border/30 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-semibold text-foreground tabular-nums">45</span> more checks available
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-primary">
                    Unlock full audit
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* CTA card — takes 2 cols */}
            <div className="lg:col-span-2 rounded-xl border border-primary/20 bg-card p-6 sm:p-8 flex flex-col gap-5">
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest font-bold mb-3">
                  Pro audit
                </p>
                <h3 className="text-xl font-bold tracking-tight mb-2">
                  Get the full picture.
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your free scan shows the scores and top blockers. Unlock Pro for the complete audit with every check,
                  detailed fixes, and ready-to-paste code snippets.
                </p>
              </div>

              <ul className="space-y-2 text-sm text-foreground/90">
                {[
                  "All 47 checks across 10 categories",
                  "Step-by-step fix for every issue",
                  "Copy-paste code for schema, robots.txt, skill.md",
                  "Priority-ranked action plan",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2">
                <a
                  href="#audit"
                  className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  Unlock full audit for &euro;19
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="text-[11px] text-muted-foreground text-center mt-2.5">
                  One-time payment. No subscription.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t border-border/40">
        <div className="mx-auto max-w-3xl">
          <motion.p
            className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            FAQ
          </motion.p>
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {[
              {
                q: "Do I need technical skills to use this?",
                a: "No. Every issue is written in plain language and comes with a concrete fix, no coding required.",
              },
              {
                q: "What do I get with the free scan?",
                a: "Both your AI Visibility Score and AI Discoverability Score, your top 3 blockers, and 3 quick wins you can act on today. No signup required.",
              },
              {
                q: "What's included in the Pro audit?",
                a: "All 47 checks with explanation and fix for each, AI-rewritten homepage copy, FAQ suggestions, schema.org code ready to paste, and a downloadable PDF report. One-time payment of \u20ac19, no subscription.",
              },
              {
                q: "Does this work with my website platform?",
                a: "Yes. Okfor.ai works on any website with a URL \u2014 WordPress, Squarespace, Webflow, Shopify, or any custom build.",
              },
              {
                q: "How is this different from SEO tools?",
                a: "SEO tools check if Google can rank you. Okfor.ai checks if AI can understand and recommend you. Different signals, different fixes. Most sites that rank well on Google still score poorly on AI readiness.",
              },
            ].map((item, i) => (
              <motion.details
                key={i}
                className="group rounded-lg border border-border/60 bg-card"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-[15px] font-medium text-foreground hover:text-primary transition-colors [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA scan section */}
      <section id="audit" className="py-24 px-6 border-t border-border/40 bg-secondary/20">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            Find out if AI can find you.
            <br />
            In 30 seconds.
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-10 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Free. No signup. If you score below 85, you&apos;ll want to see the full report.
          </motion.p>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
          >
            <input type="text" name="company" autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden pointer-events-none" />
            <Input
              type="text"
              placeholder="yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              required
              className="h-12 flex-1 bg-background/60 text-base transition-shadow focus-visible:shadow-[0_0_0_3px_oklch(0.7_0.15_160_/_0.15)]"
            />
            <Button type="submit" className="h-12 px-6 text-base font-semibold shrink-0" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <span className="flex items-center gap-2">
                  Scan my site
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </motion.form>
          {error && (
            <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive mt-3">
              {error}
            </motion.p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            Free · Takes 30 seconds · No credit card
          </p>
        </div>
      </section>

      {/* Footer */}
      <motion.footer
        className="border-t border-border/40 py-12 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-16 mb-12">
            <div className="lg:w-64 shrink-0">
              <span className="flex items-center gap-1.5 mb-3">
                <span className="font-bold text-foreground">OKFOR</span>
                <span className="bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-md">AI ✓</span>
              </span>
              <p className="text-sm text-muted-foreground mb-6">Make your website part of the AI conversation.</p>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono mb-3">Resources</p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="/checks" className="text-muted-foreground hover:text-foreground transition-colors">
                      Knowledge base
                    </a>
                  </li>
                  <li>
                    <a href="#why" className="text-muted-foreground hover:text-foreground transition-colors">
                      Why it matters
                    </a>
                  </li>
                  <li>
                    <a href="#audit" className="text-muted-foreground hover:text-foreground transition-colors">
                      Free audit
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-baseline justify-between mb-5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Knowledge base</p>
                <a href="/checks" className="text-xs text-primary hover:underline font-medium">
                  View all →
                </a>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
                {categoryOrder.map((category) => {
                  const checks = getChecksByCategory(category.code);
                  if (checks.length === 0) return null;
                  return (
                    <div key={category.code}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {category.code}
                        </span>
                        <p className="text-xs font-semibold text-foreground">{category.name}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {checks.map((check) => (
                          <li key={check.slug}>
                            <a
                              href={`/checks/${check.slug}`}
                              className="text-xs text-muted-foreground hover:text-foreground transition-colors leading-snug block"
                            >
                              {check.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/30 space-y-4">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
              <a href="/terms" className="hover:text-muted-foreground transition-colors">Terms of Service</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-muted-foreground transition-colors">Privacy Policy</a>
            </div>
            <p className="text-[10px] text-muted-foreground/40 text-center max-w-lg mx-auto leading-relaxed">
              Parts of our reports are generated by AI models and are provided for informational purposes only. Results may vary between scans due to the non-deterministic nature of AI. We do not guarantee the accuracy or completeness of AI-generated findings.
            </p>
            <p className="text-xs text-muted-foreground/60 text-center">
              OkforAI — Helping websites get discovered by AI agents.
            </p>
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
