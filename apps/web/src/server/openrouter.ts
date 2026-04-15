const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";
const MAX_CONCURRENCY = 10;

/** Run async tasks with a concurrency limit */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit = MAX_CONCURRENCY,
  label = "task",
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let idx = 0;
  const total = tasks.length;
  const startTime = Date.now();

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      const callNum = i + 1;
      console.log(`[MCDA] ${label} ${callNum}/${total} starting...`);
      const t0 = Date.now();
      results[i] = await tasks[i]();
      console.log(`[MCDA] ${label} ${callNum}/${total} done (${Date.now() - t0}ms)`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, () => worker()));
  console.log(`[MCDA] ${label} all ${total} completed in ${Date.now() - startTime}ms`);
  return results;
}

export const MODELS = {
  gpt: { id: "openai/gpt-5.3-chat", label: "ChatGPT" },
  claude: { id: "anthropic/claude-sonnet-4.6", label: "Claude" },
  gemini: { id: "google/gemini-3-flash-preview", label: "Gemini" },
  grok: { id: "x-ai/grok-4.20", label: "Grok" },
  perplexity: { id: "perplexity/sonar", label: "Perplexity" },
  mistral: { id: "mistralai/mistral-small-3.2-24b-instruct", label: "Mistral" },
  llama: { id: "meta-llama/llama-4-scout", label: "Meta Llama" },
} as const;

/** High-quality model for synthesis tasks (verdict, action items, summaries) */
export const SYNTHESIS_MODEL = "anthropic/claude-opus-4-5";

/** Fast model for analysis steps (impact + suggestability) where Claude Sonnet is too slow */
export const ANALYSIS_MODEL = "anthropic/claude-haiku-4.5";

export type ModelKey = keyof typeof MODELS;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** Fallback per-call timeout when no deadline is set */
const FALLBACK_TIMEOUT_MS = 30_000;
/** Hard ceiling — no single call ever gets more than this */
const MAX_CALL_TIMEOUT_MS = 90_000;
/** Minimum timeout — never go below this even when running late */
const MIN_CALL_TIMEOUT_MS = 5_000;

/** Per-request deadline. Create one per MCDA run, pass it to queryModel. */
export function createDeadline(budgetMs: number) {
  const deadlineMs = Date.now() + budgetMs;
  console.log(`[MCDA] Deadline set: ${budgetMs}ms from now`);
  return deadlineMs;
}

/**
 * Send a chat completion request to a model via OpenRouter.
 * Returns the text response, or null on failure / timeout.
 * Timeout is dynamic: uses remaining time until deadline, clamped to a minimum.
 */
export async function queryModel(
  model: string,
  messages: ChatMessage[],
  maxTokens = 2048,
  deadlineMs = 0,
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null;

  // Dynamic timeout: scale with remaining budget, clamp between 5s and 45s
  let timeoutMs = FALLBACK_TIMEOUT_MS;
  if (deadlineMs > 0) {
    const remaining = deadlineMs - Date.now();
    if (remaining <= 0) {
      console.warn(`[MCDA] SKIPPED (past deadline) — model: ${model}`);
      return null;
    }
    // Calls run in parallel batches, so each call can use most of the remaining time
    // Reserve 30s for DB writes + email after all calls finish
    timeoutMs = Math.max(MIN_CALL_TIMEOUT_MS, Math.min(remaining - 30_000, MAX_CALL_TIMEOUT_MS));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "https://okfor.ai",
        "X-Title": "OkforAI",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.warn(`[MCDA] TIMEOUT after ${timeoutMs}ms (dynamic cap) — model: ${model}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}
