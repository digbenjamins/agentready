"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const vendors = [
  { name: "ChatGPT", color: "#10a37f" },
  { name: "Grok", color: "#f5f5f5" },
  { name: "Claude", color: "#d4a27f" },
  { name: "Gemini", color: "#8b6cf0" },
  { name: "Perplexity", color: "#20b8cd" },
  { name: "Mistral", color: "#ff7000" },
  { name: "Llama", color: "#6366f1" },
];

interface Conversation {
  vendor: string;
  question: string;
  url: string;
  snippet: string;
}

export const terminalConvos: Conversation[] = [
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
    vendor: "Mistral",
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
    vendor: "Llama",
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
    vendor: "Mistral",
    question: "Recommend a team communication tool",
    url: "slack.com",
    snippet: "Slack remains dominant for team messaging with its channel system and integrations.",
  },
];

function getVendor(name: string) {
  return vendors.find((v) => v.name === name) ?? vendors[0];
}

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

type TerminalPhase = "typing-input" | "send-click" | "show-bubble" | "typing-response" | "show-url" | "hold" | "fade";

export function TypingTerminal({ convos }: { convos: Conversation[] }) {
  const delay = 600;
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<TerminalPhase>("typing-input");
  const [started, setStarted] = useState(false);
  const [sendPressed, setSendPressed] = useState(false);

  const convo = convos[index];
  const vendor = getVendor(convo.vendor);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const typedInput = useInputTyping(convo.question, 38, started && phase === "typing-input");
  const typedResponse = useResponseTyping(convo.snippet, 16, phase === "typing-response");

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

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "fade" ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex-1 p-3 space-y-2 overflow-hidden">
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
