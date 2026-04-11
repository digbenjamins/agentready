"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { categoryOrder, getChecksByCategory } from "@/content/checks";

interface CheckResult {
  name: string;
  description: string;
  passed: boolean;
  details: string | null;
}

interface Report {
  id: string;
  website: string;
  score: number;
  checks: CheckResult[];
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

const vendors = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Grok", color: "#f5f5f5" },
  { name: "Claude", color: "#d4a27f" },
  { name: "Gemini", color: "#8b6cf0" },
  { name: "Perplexity", color: "#20b8cd" },
  { name: "Copilot", color: "#0078d4" },
];

interface Conversation {
  vendor: string;
  question: string;
  url: string;
  snippet: string;
}

const terminalConvos: Conversation[] = [
  {
    vendor: "ChatGPT",
    question: "What's the best CRM for small teams?",
    url: "pipedrive.com",
    snippet: "I'd recommend Pipedrive — it's built for small sales teams with a clean pipeline view.",
  },
  {
    vendor: "Perplexity",
    question: "Top project management tools for startups",
    url: "linear.app",
    snippet: "Linear is widely recommended for fast-moving startup teams. Keyboard-first design.",
  },
  {
    vendor: "Claude",
    question: "Best website builder for restaurants?",
    url: "squarespace.com",
    snippet: "Squarespace stands out with beautiful templates and built-in reservation features.",
  },
  {
    vendor: "Gemini",
    question: "Email platform for newsletters?",
    url: "beehiiv.com",
    snippet: "Beehiiv has become the go-to for newsletter creators. Built-in monetization tools.",
  },
  {
    vendor: "Grok",
    question: "Recommend a landing page builder",
    url: "framer.com",
    snippet: "Framer is excellent — design-forward with great performance out of the box.",
  },
  {
    vendor: "Copilot",
    question: "Best analytics besides Google Analytics?",
    url: "plausible.io",
    snippet: "Plausible is privacy-friendly and gives you the essentials without the bloat.",
  },
  {
    vendor: "ChatGPT",
    question: "Good scheduling tool for freelancers?",
    url: "cal.com",
    snippet: "Cal.com is open source and flexible. Handles timezone detection and multiple calendars.",
  },
  {
    vendor: "Perplexity",
    question: "What's the best invoicing software?",
    url: "invoice-ninja.com",
    snippet: "Invoice Ninja is powerful — open source, supports recurring invoices and auto-reminders.",
  },
  {
    vendor: "Gemini",
    question: "Good customer support platform for SaaS?",
    url: "intercom.com",
    snippet: "Intercom is a top choice for SaaS. It combines live chat, bots, and a help center.",
  },
  {
    vendor: "Claude",
    question: "Best tool for automated social media posting?",
    url: "buffer.com",
    snippet: "Buffer keeps things simple — schedule posts across platforms with a clean UI.",
  },
  {
    vendor: "Grok",
    question: "Best no-code database tool?",
    url: "airtable.com",
    snippet: "Airtable bridges spreadsheets and databases beautifully. Great for non-technical teams.",
  },
  {
    vendor: "Copilot",
    question: "Recommend a monitoring tool for web apps",
    url: "sentry.io",
    snippet: "Sentry is the standard for error tracking and performance monitoring across stacks.",
  },
  {
    vendor: "ChatGPT",
    question: "Best tool for user onboarding?",
    url: "userpilot.com",
    snippet: "Userpilot lets you build in-app onboarding flows without code. Great for SaaS.",
  },
  {
    vendor: "Perplexity",
    question: "Top headless CMS for developers?",
    url: "sanity.io",
    snippet: "Sanity offers a flexible, real-time content platform that developers love.",
  },
  {
    vendor: "Gemini",
    question: "What's a good alternative to Jira?",
    url: "shortcut.com",
    snippet: "Shortcut strikes a nice balance between power and usability for engineering teams.",
  },
  {
    vendor: "Grok",
    question: "Best platform for creating online courses?",
    url: "teachable.com",
    snippet: "Teachable makes it easy to package and sell courses. Handles payments and hosting.",
  },
  {
    vendor: "Claude",
    question: "What's the best design collaboration tool?",
    url: "figma.com",
    snippet: "Figma remains the industry standard for design collaboration with real-time editing.",
  },
  {
    vendor: "Copilot",
    question: "Recommend a team communication tool",
    url: "slack.com",
    snippet: "Slack remains dominant for team messaging with its channel system and integrations.",
  },
];

function getVendor(name: string) {
  return vendors.find((v) => v.name === name) ?? vendors[0];
}

// Typing into an input field hook
function useInputTyping(text: string, speed: number, enabled: boolean): string {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!enabled) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return displayed;
}

// Typing for the AI response
function useResponseTyping(text: string, speed: number, enabled: boolean): string {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!enabled) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return displayed;
}

// Phases: type in input → click send → bubble appears → AI types response → show url → hold → fade → next
type TerminalPhase = "typing-input" | "send-click" | "show-bubble" | "typing-response" | "show-url" | "hold" | "fade";

function TypingTerminal({ convos }: { convos: Conversation[] }) {
  const delay = 600;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TerminalPhase>("typing-input");
  const [started, setStarted] = useState(false);
  const [sendPressed, setSendPressed] = useState(false);

  const convo = convos[index];
  const vendor = getVendor(convo.vendor);

  // Initial stagger delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const typedInput = useInputTyping(convo.question, 38, started && phase === "typing-input");
  const typedResponse = useResponseTyping(convo.snippet, 16, phase === "typing-response");

  // Phase machine
  useEffect(() => {
    if (!started) return;

    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing-input") {
      timer = setTimeout(() => setPhase("send-click"), convo.question.length * 38 + 300);
    } else if (phase === "send-click") {
      setSendPressed(true);
      timer = setTimeout(() => {
        setSendPressed(false);
        setPhase("show-bubble");
      }, 250);
    } else if (phase === "show-bubble") {
      timer = setTimeout(() => setPhase("typing-response"), 400);
    } else if (phase === "typing-response") {
      timer = setTimeout(() => setPhase("show-url"), convo.snippet.length * 16 + 200);
    } else if (phase === "show-url") {
      timer = setTimeout(() => setPhase("hold"), 800);
    } else if (phase === "hold") {
      timer = setTimeout(() => setPhase("fade"), 2200);
    } else if (phase === "fade") {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % convos.length);
        setPhase("typing-input");
      }, 500);
    }

    return () => clearTimeout(timer);
  }, [phase, started, convo, convos.length]);

  const showBubble = phase === "show-bubble" || phase === "typing-response" || phase === "show-url" || phase === "hold";
  const showResponse = phase === "typing-response" || phase === "show-url" || phase === "hold";
  const showUrl = phase === "show-url" || phase === "hold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="rounded-lg border border-border/40 bg-card/90 backdrop-blur-sm overflow-hidden flex flex-col h-[320px]"
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-secondary/30">
        <span className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`${index}-${convo.vendor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs font-medium ml-1"
            style={{ color: vendor.color }}
          >
            {vendor.name}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Chat area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "fade" ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
            {/* User bubble — appears after send */}
            {showBubble && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex justify-end"
              >
                <div className="bg-primary/10 border border-primary/20 rounded-xl rounded-br-sm px-3 py-1.5 max-w-[88%]">
                  <p className="text-[13px] text-foreground/90">{convo.question}</p>
                </div>
              </motion.div>
            )}

            {/* AI response */}
            {showResponse && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-start">
                <div className="bg-secondary/50 rounded-xl rounded-bl-sm px-3 py-1.5 max-w-[92%]">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {phase === "typing-response" ? typedResponse : convo.snippet}
                    {phase === "typing-response" && <span className="inline-block w-[2px] h-3 bg-muted-foreground/60 ml-0.5 align-middle animate-pulse" />}
                  </p>
                  {showUrl && (
                    <span className="relative inline-flex items-center gap-2 mt-1.5">
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="inline-block text-xs font-medium px-2 py-0.5 rounded-md"
                        style={{
                          color: vendor.color,
                          backgroundColor: `${vendor.color}15`,
                          borderWidth: 1,
                          borderColor: `${vendor.color}30`,
                        }}
                      >
                        ↗ {convo.url}
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
                        className="text-[10px] text-primary font-medium whitespace-nowrap flex items-center gap-0.5"
                      >
                        <span>←</span>
                        <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                          this could be you
                        </motion.span>
                      </motion.span>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input bar at the bottom */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/30 px-3 py-2">
              <p className="flex-1 text-[13px] text-foreground/70 truncate min-h-[20px]">
                {phase === "typing-input" && (
                  <>
                    {typedInput}
                    <span className="inline-block w-[2px] h-3.5 bg-foreground/50 ml-0.5 align-middle animate-pulse" />
                  </>
                )}
                {phase === "send-click" && <span className="text-foreground/50">{convo.question}</span>}
                {!["typing-input", "send-click"].includes(phase) && <span className="text-muted-foreground/30">Ask anything...</span>}
              </p>
              <motion.div
                animate={{
                  scale: sendPressed ? 0.85 : 1,
                  backgroundColor: sendPressed ? vendor.color : phase === "typing-input" && typedInput.length > 0 ? `${vendor.color}cc` : `${vendor.color}33`,
                }}
                transition={{ duration: 0.1 }}
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-foreground/80"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

function AnimatedScore({ score }: { score: number }) {
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20 });
  const display = useTransform(springVal, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    motionVal.set(score);
  }, [score, motionVal]);

  return <motion.span>{display}</motion.span>;
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

export default function Home() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const reportRef = useRef<HTMLDivElement>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setReport(null);

      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, website }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Something went wrong");
        }

        const data = await res.json();
        setReport(data);
        setTimeout(() => {
          reportRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [email, website],
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

      {/* Hero — two columns: copy left, terminals right */}
      <section className="pt-28 pb-12 px-6 relative">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm font-mono text-primary mb-6 tracking-wide"
            >
              YOUR WEBSITE HAS A VISIBILITY PROBLEM
            </motion.p>

            <motion.h1
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.15] mb-6"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}>
                People stopped
              </motion.span>
              <CyclingWord words={["googling.", "searching.", "browsing."]} />
              <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}>
                They started <span className="text-primary">asking.</span>
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Get an AI visibility report in 30 seconds. See whether ChatGPT and other AI tools can read, understand and recommend your website.
            </motion.p>
          </div>

          {/* Right: typing terminal */}
          <div>
            <TypingTerminal convos={terminalConvos} />
          </div>
        </div>
      </section>

      {/* Optimise for */}
      <section className="py-16 px-6 border-t border-border/40">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            className="text-lg text-foreground font-medium mb-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            If your site isn&apos;t set up for AI agents, you won&apos;t show up.
          </motion.p>
          <motion.p
            className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-6"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Optimise for the new search
          </motion.p>
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            {vendors.map((v, i) => (
              <motion.span
                key={v.name}
                className="px-5 py-2.5 rounded-full border text-base font-medium"
                style={{
                  color: v.color,
                  borderColor: `${v.color}33`,
                  backgroundColor: `${v.color}0d`,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.2 + i * 0.08,
                  type: "spring",
                  stiffness: 180,
                }}
                whileHover={{
                  scale: 1.08,
                  borderColor: `${v.color}80`,
                  backgroundColor: `${v.color}1a`,
                  transition: { duration: 0.2 },
                }}
              >
                {v.name}
              </motion.span>
            ))}
          </motion.div>

          {/* Audit now CTA */}
          <motion.a
            href="#audit"
            className="inline-flex items-center gap-2 mt-10 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center gap-2"
            >
              Audit your site now
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </motion.a>
        </div>
      </section>

      {/* Form section */}
      <section id="audit" className="py-16 px-6 relative">
        <div className="mx-auto max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.25, 0.4, 0.25, 1] as const,
            }}
            className="relative"
          >
            {/* Glow behind the card */}
            <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-sm pointer-events-none" />
            <Card className="border-border/50 bg-card relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">How visible is your site to AI?</CardTitle>
                <CardDescription className="text-base">
                  Drop your URL below. We check the three things AI agents look for and send you a report.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="text"
                      placeholder="yoursite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                      className="h-12 bg-secondary/50 text-base transition-shadow focus-visible:shadow-[0_0_0_3px_oklch(0.7_0.15_160_/_0.15)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email for your report</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 bg-secondary/50 text-base transition-shadow focus-visible:shadow-[0_0_0_3px_oklch(0.7_0.15_160_/_0.15)]"
                    />
                  </div>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive">
                      {error}
                    </motion.p>
                  )}
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                    <Button type="submit" className="w-full h-12 text-base font-semibold relative overflow-hidden" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Scanning your site...
                        </>
                      ) : (
                        <span className="flex items-center justify-center">
                          Run Free Check
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </motion.div>
                  <p className="text-xs text-muted-foreground text-center pt-1">Takes about 30 seconds. No account needed.</p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Report */}
      <AnimatePresence>
        {report && (
          <motion.section
            ref={reportRef}
            className="pb-20 px-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }}
          >
            <div className="mx-auto max-w-2xl space-y-6">
              <Card className="border-border/50 bg-card overflow-hidden">
                <motion.div
                  className={`h-1.5 origin-left ${report.score >= 66 ? "bg-green-500" : report.score >= 33 ? "bg-yellow-500" : "bg-red-500"}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Your Score</span>
                    <span
                      className={`text-4xl font-bold tabular-nums ${
                        report.score >= 66 ? "text-green-400" : report.score >= 33 ? "text-yellow-400" : "text-red-400"
                      }`}
                    >
                      <AnimatedScore score={report.score} />
                    </span>
                  </CardTitle>
                  <CardDescription className="text-base">{report.website}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary rounded-full h-2 mb-8">
                    <motion.div
                      className={`h-2 rounded-full ${report.score >= 66 ? "bg-green-500" : report.score >= 33 ? "bg-yellow-500" : "bg-red-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${report.score}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.4,
                        ease: "easeOut",
                      }}
                    />
                  </div>

                  <motion.div className="space-y-3" initial="hidden" animate="visible" variants={staggerContainer}>
                    {report.checks.map((check, i) => (
                      <motion.div key={i} variants={scaleIn} className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-secondary/30">
                        {check.passed ? (
                          <motion.div
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{
                              delay: 0.6 + i * 0.15,
                              type: "spring",
                            }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 shrink-0" />
                          </motion.div>
                        ) : (
                          <motion.div
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{
                              delay: 0.6 + i * 0.15,
                              type: "spring",
                            }}
                          >
                            <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                          </motion.div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{check.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{check.description}</p>
                          {check.details && <p className="text-sm mt-1.5 text-muted-foreground/80">{check.details}</p>}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Why it matters */}
      <section id="why" className="py-20 px-6 border-t border-border/40 relative">
        <div className="mx-auto max-w-3xl">
          <motion.h2
            className="text-3xl font-bold tracking-tight mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
          >
            Why this matters right now
          </motion.h2>

          <div className="space-y-8 text-muted-foreground">
            {[
              {
                title: "AI answers are replacing search results",
                body: "Someone asks ChatGPT \"best project management tool for startups\" and it doesn't show ten blue links. It recommends one or two. If you're not one of them, you don't get the click.",
              },
              {
                title: "Agents need structure, not just content",
                body: null,
              },
              {
                title: "Most of your competitors haven't done this yet",
                body: "Almost no one has set up their site for AI agents. Do it now and you're ahead of 99% of your space before this becomes table stakes.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-5"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <motion.span
                  className="text-2xl font-bold text-primary shrink-0 w-8"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.15 + i * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                >
                  {i + 1}
                </motion.span>
                <div>
                  <p className="text-foreground font-medium text-lg mb-1">{item.title}</p>
                  {item.body ? (
                    <p className="leading-relaxed">{item.body}</p>
                  ) : (
                    <p className="leading-relaxed">
                      Good writing alone won&apos;t cut it. AI agents look for machine-readable files like{" "}
                      <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">/skill.md</code> and{" "}
                      <code className="text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded text-sm">agent.json</code> to figure out what your site does and
                      whether it&apos;s worth recommending.
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
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
          <div className="mt-10 pt-6 border-t border-border/30 text-xs text-muted-foreground/60 text-center">
            OkforAI — Helping websites get discovered by AI agents.
          </div>
        </div>
      </motion.footer>
    </main>
  );
}
