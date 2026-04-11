import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "OkforAI",
    description: "Checks if a website is discoverable by AI agents like ChatGPT, Grok, Perplexity, Gemini, Claude, and Copilot.",
    capabilities: [
      {
        name: "website-check",
        description: "Scan a website for AI agent discoverability signals (skill.md, /skill endpoint, agent.json)",
        endpoint: "/api/check",
        method: "POST",
        parameters: {
          email: { type: "string", required: true, description: "Email to receive the report" },
          website: { type: "string", required: true, description: "URL of the website to check" },
        },
      },
    ],
  });
}
