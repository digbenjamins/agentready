const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

export const MODELS = {
  gpt: { id: "openai/gpt-4.1-mini", label: "GPT-4.1" },
  claude: { id: "anthropic/claude-haiku-4.5", label: "Claude" },
  gemini: { id: "google/gemini-2.0-flash-001", label: "Gemini" },
  grok: { id: "x-ai/grok-3-mini", label: "Grok" },
  perplexity: { id: "perplexity/sonar", label: "Perplexity" },
  copilot: { id: "microsoft/mai-ds-r1", label: "Copilot" },
  mistral: { id: "mistralai/mistral-small-3.1-24b-instruct", label: "Mistral" },
  llama: { id: "meta-llama/llama-4-scout", label: "Meta Llama" },
} as const;

export type ModelKey = keyof typeof MODELS;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Send a chat completion request to a model via OpenRouter.
 * Returns the text response, or null on failure.
 */
export async function queryModel(
  model: string,
  messages: ChatMessage[],
  maxTokens = 2048,
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null;

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
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
  } catch {
    return null;
  }
}
