# OkforAI (agentready)

**Is your website visible to AI assistants?**

OkforAI checks whether ChatGPT, Claude, Gemini, Grok, Perplexity and other AI assistants can find, read and recommend a website. It gives a free readiness score straight away. A paid in-depth report then asks seven real AI models about the site's niche and shows who they recommend, and why.

---

## What it does

### 1. Free readiness scan (seconds)

Enter a URL. OkforAI fetches the site and runs **34 automated checks** in 11 categories:

| Category | Examples |
|---|---|
| Agent Readiness | `/.well-known/agent.json`, `/skill.md`, `/skill` endpoint |
| Machine Access | `llms.txt` and its quality, sitemap, server-side rendered content |
| Crawl Permissions | `robots.txt` rules for GPTBot, ClaudeBot, PerplexityBot |
| Structure & Architecture | Heading hierarchy, canonical URL, internal links, URL structure |
| Entities & Semantics | schema.org markup, Open Graph |
| Trust & Authority | HTTPS, About page, privacy policy, contact options |
| Technical Performance | Response time, page speed, HTML validity, text-to-HTML ratio |
| Content, Conversational, Extractability, Authority | FAQ sections, content length and freshness, markdown-friendliness |

On top of those, **15 LLM-as-judge criteria** in 7 batched calls (Claude Haiku) score what a parser can't measure: plain language, keyword stuffing, statistics and quotations, business info and NAP consistency, trust signals, conversational fit, extractability and authority. Each check uses a written rubric (score 0–100 plus a pass threshold) and returns JSON with a one-sentence reason. If the LLM is unavailable, the scan still finishes and those checks are marked as not analysed.

The headline score comes from the deterministic checks. LLM findings add penalties (for example for keyword stuffing) and concrete fixes.

### 2. Multi-model citation report (paid)

After a Stripe payment, a background job builds the full report:

1. **Query generation.** An LLM reads the site and writes 10 realistic questions a customer would ask an AI assistant in that niche.
2. **70 probes.** Each question goes to **7 models** through OpenRouter: GPT, Claude, Gemini, Grok, Perplexity, Mistral and Llama. Each model is asked to recommend sites and explain why.
3. **Citation matrix.** For every model and question: was the site cited, which competitors were cited, and the model's reasoning.
4. **Consensus.** Sites cited by 3 or more models, the top competitors, and gaps that are specific to one model.
5. **Per-model analysis.** For each model, which signals it seems to value, and a competitor/gap report.
6. **Synthesis.** A stronger model writes the verdict and turns all the analyses into action items. **An item is only kept if 2 or more models agree on it.** Priority goes up with agreement (5+ models = high).

The report is emailed (Resend) and can be unlocked with a passcode.

---

## Engineering notes

- **Model tiering.** A fast model (Claude Haiku) does the per-model analysis, and a stronger model (Claude Opus) does the final synthesis.
- **Deadline budget.** The whole paid pipeline must finish inside Vercel's 300 s function limit. It runs on a 270 s budget, with a concurrency pool of 10 parallel LLM calls. Each call's timeout depends on the time left (AbortController, clamped between 5 and 90 s). The historically slowest model runs last, and a failed call returns `null` so the report still completes with partial data.
- **Idempotent jobs.** An atomic `updateMany` claims the report before it runs, so a repeated Stripe webhook can't start it twice. The work runs after the response through Next.js `after()`.
- **SSRF protection.** URLs users submit are validated: http(s) only, no IP literals, no localhost, `.local` or DNS-rebinding domains. The hostname is resolved and blocked if it points to a private, loopback or link-local range. If DNS fails, the request is blocked.
- **Safe storage of LLM output.** Control characters are stripped from model responses before they go into PostgreSQL JSON columns.
- **Payments.** Stripe Checkout with promotion codes. Webhook signatures are verified.
- **Admin app.** A separate Next.js app to review submissions and paid reports. The password is compared in constant time, login attempts are rate-limited, and sessions use random httpOnly/strict cookies.
- **Agent-facing.** OkforAI follows its own advice: it publishes `/.well-known/agent.json`, `/skill.md` and a `/skill` endpoint, so AI agents can call the scanner directly.

---

## Stack

| Layer | Tech |
|---|---|
| Monorepo | Turborepo, npm workspaces |
| Web + API | Next.js 16 (App Router), React 19, TypeScript, Tailwind, shadcn/ui |
| Admin | Next.js 16 |
| Database | PostgreSQL (Supabase) + Prisma 7 |
| LLMs | Anthropic SDK (Claude Haiku checks), OpenRouter (7-model probes, synthesis) |
| Payments / email | Stripe, Resend |
| Hosting | Vercel |

## Project structure

```
apps/
├── web/                     Public site, scanner API, reports
│   ├── public/              agent.json, skill.md
│   └── src/
│       ├── app/             Pages + API routes (check, checkout, webhooks/stripe, submission)
│       ├── content/checks/  Check descriptions per category
│       └── server/
│           ├── checks/      auto.ts (34 deterministic checks), llm.ts (LLM-as-judge)
│           ├── services/    mcda.ts (multi-model report), payment, submission
│           ├── openrouter.ts  Model list, concurrency pool, deadline-aware calls
│           └── security.ts    SSRF guard + input validation
└── admin/                   Internal dashboard (submissions, paid reports)
```

## Running locally

Requirements: Node.js and a PostgreSQL database.

```bash
npm install
# create apps/web/.env with the variables below
npm run db:generate
npm run db:push
npm run dev
```

Environment variables:

| Variable | Used for |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL (pooled + direct) |
| `ANTHROPIC_API_KEY` | LLM-as-judge checks |
| `OPENROUTER_API_KEY` | Multi-model report |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID` | Paid report |
| `RESEND_API_KEY`, `FROM_EMAIL` | Report emails |
| `NEXT_PUBLIC_BASE_URL` | Links in emails and API headers |
| `MAX_CONCURRENT_SCANS` | Max scans running at once (default 20) |
| `ADMIN_PASSWORD` | Admin app login |

Without `ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY` the scanner still runs. The LLM checks and the paid report are then skipped.

## License

MIT, see [LICENSE](LICENSE).
