import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "OkforAI",
    description: "Checks if a website is discoverable by AI agents like ChatGPT, Grok, Perplexity, Gemini, Claude, Mistral, and Llama.",
    url: "https://okfor.ai",
  });
}
