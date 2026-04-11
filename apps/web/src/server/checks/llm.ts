import Anthropic from "@anthropic-ai/sdk";
import type { CheckResult, SiteData } from "./types";
import { extractBodyText } from "../utils";

// ── LLM client ───────────────────────────────────────────

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TEXT_CHARS = 6000;

interface LlmCheckResult {
  pass: boolean;
  score: number;
  reason: string;
}

async function askHaiku(
  system: string,
  userContent: string,
): Promise<Record<string, LlmCheckResult> | null> {
  if (!anthropic) return null;

  try {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: userContent }],
    });

    const text = res.content[0].type === "text" ? res.content[0].text : "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

function truncateText(site: SiteData): string {
  const text = extractBodyText(site.html);
  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) + "…" : text;
}

function fallback(check_id: string, category: CheckResult["category"], name: string, fix: string): CheckResult {
  return {
    check_id,
    category,
    name,
    pass: false,
    score: 0,
    details: { llm_error: true },
    penalty: 0,
    fix,
    type: "SEMI",
  };
}

// ── Batch 1: Content quality (language clarity + keyword stuffing) ──

async function batchContentQuality(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "language_clarity": Is the language clear and plain? Score 0-100 (100 = very clear, simple language; 0 = jargon-heavy, confusing).
- "keyword_stuffing": Is there keyword stuffing? Score 0-100 (100 = natural writing, no stuffing; 0 = heavy repetition of the same phrases).
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 60. Return ONLY valid JSON, no other text.`,
    text,
  );

  const clarity = result?.language_clarity;
  const stuffing = result?.keyword_stuffing;

  return [
    clarity
      ? {
          check_id: "language_clarity",
          category: "B",
          name: "Clear, plain language (readability)",
          pass: clarity.pass,
          score: clarity.score,
          details: { reason: clarity.reason },
          penalty: 0,
          fix: clarity.pass
            ? `Language is clear and readable. ${clarity.reason}`
            : `Language could be clearer. ${clarity.reason}`,
          type: "SEMI",
        }
      : fallback("language_clarity", "B", "Clear, plain language (readability)", "Could not analyze language clarity — LLM unavailable."),
    stuffing
      ? {
          check_id: "keyword_stuffing",
          category: "B",
          name: "No keyword stuffing",
          pass: stuffing.pass,
          score: stuffing.score,
          details: { reason: stuffing.reason },
          penalty: stuffing.pass ? 0 : -5,
          fix: stuffing.pass
            ? `No keyword stuffing detected. ${stuffing.reason}`
            : `Keyword stuffing detected — this reduces AI visibility by ~30%. ${stuffing.reason}`,
          type: "SEMI",
        }
      : fallback("keyword_stuffing", "B", "No keyword stuffing", "Could not analyze keyword density — LLM unavailable."),
  ];
}

// ── Batch 2: Content evidence (statistics + quotations) ──

async function batchContentEvidence(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "statistics_present": Does the content include specific statistics, numbers, data points, or percentages that support claims? Score 0-100 (100 = rich with data; 0 = no data at all).
- "quotations_present": Does the content include quotations, testimonials, or cited expert opinions? Score 0-100 (100 = multiple quotes; 0 = none).
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 40 (even one statistic or quote counts). Return ONLY valid JSON.`,
    text,
  );

  const stats = result?.statistics_present;
  const quotes = result?.quotations_present;

  return [
    stats
      ? {
          check_id: "statistics_present",
          category: "B",
          name: "Content includes statistics/data",
          pass: stats.pass,
          score: stats.score,
          details: { reason: stats.reason },
          penalty: 0,
          fix: stats.pass
            ? `Content includes statistics. ${stats.reason}`
            : `No statistics found — adding data boosts AI visibility by +37%. ${stats.reason}`,
          type: "SEMI",
        }
      : fallback("statistics_present", "B", "Content includes statistics/data", "Could not analyze statistics presence — LLM unavailable."),
    quotes
      ? {
          check_id: "quotations_present",
          category: "B",
          name: "Content includes quotations",
          pass: quotes.pass,
          score: quotes.score,
          details: { reason: quotes.reason },
          penalty: 0,
          fix: quotes.pass
            ? `Content includes quotations. ${quotes.reason}`
            : `No quotations found — adding quotes boosts AI visibility by +40%. ${quotes.reason}`,
          type: "SEMI",
        }
      : fallback("quotations_present", "B", "Content includes quotations", "Could not analyze quotations — LLM unavailable."),
  ];
}

// ── Batch 3: Entities (business info + NAP consistency) ──

async function batchEntities(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "business_info": Can you clearly identify the business name, what they do, and how to contact them (address, phone, or email)? Score 0-100 (100 = all info clear; 0 = nothing identifiable).
- "consistent_nap": Is the Name, Address, and Phone (NAP) information presented consistently (not contradictory)? Score 0-100 (100 = consistent or single mention; 0 = contradictory info). If NAP info is missing entirely, score 30.
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 50. Return ONLY valid JSON.`,
    text,
  );

  const info = result?.business_info;
  const nap = result?.consistent_nap;

  return [
    info
      ? {
          check_id: "business_info",
          category: "D",
          name: "Business name, address, contact findable",
          pass: info.pass,
          score: info.score,
          details: { reason: info.reason },
          penalty: 0,
          fix: info.pass
            ? `Business information is identifiable. ${info.reason}`
            : `Business info is hard to find. ${info.reason} Make your name, location, and contact details clearly visible.`,
          type: "SEMI",
        }
      : fallback("business_info", "D", "Business name, address, contact findable", "Could not analyze business info — LLM unavailable."),
    nap
      ? {
          check_id: "consistent_nap",
          category: "D",
          name: "Consistent NAP (Name, Address, Phone)",
          pass: nap.pass,
          score: nap.score,
          details: { reason: nap.reason },
          penalty: 0,
          fix: nap.pass
            ? `NAP information is consistent. ${nap.reason}`
            : `NAP inconsistencies found. ${nap.reason} Ensure name, address, and phone are identical everywhere.`,
          type: "SEMI",
        }
      : fallback("consistent_nap", "D", "Consistent NAP (Name, Address, Phone)", "Could not analyze NAP consistency — LLM unavailable."),
  ];
}

// ── Batch 4: Trust (E-E-A-T + external links) ───────────

async function batchTrust(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "eeat_signals": Does the page show E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)? Look for: author names/bios, credentials, years of experience, industry expertise, professional affiliations. Score 0-100.
- "external_links": Does the content reference or link to authoritative external sources (studies, official sites, industry standards)? Score 0-100 (100 = multiple authoritative refs; 0 = none).
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 40. Return ONLY valid JSON.`,
    text,
  );

  const eeat = result?.eeat_signals;
  const links = result?.external_links;

  return [
    eeat
      ? {
          check_id: "eeat_signals",
          category: "E",
          name: "E-E-A-T signals present (author, expertise)",
          pass: eeat.pass,
          score: eeat.score,
          details: { reason: eeat.reason },
          penalty: 0,
          fix: eeat.pass
            ? `E-E-A-T signals detected. ${eeat.reason}`
            : `Weak E-E-A-T signals — pages with strong E-E-A-T get cited 2.3x more by AI. ${eeat.reason}`,
          type: "SEMI",
        }
      : fallback("eeat_signals", "E", "E-E-A-T signals present (author, expertise)", "Could not analyze E-E-A-T signals — LLM unavailable."),
    links
      ? {
          check_id: "external_links",
          category: "E",
          name: "Outbound links to authoritative sources",
          pass: links.pass,
          score: links.score,
          details: { reason: links.reason },
          penalty: 0,
          fix: links.pass
            ? `Authoritative external references found. ${links.reason}`
            : `No authoritative external references. ${links.reason} Link to reputable sources to boost trust signals.`,
          type: "SEMI",
        }
      : fallback("external_links", "E", "Outbound links to authoritative sources", "Could not analyze external links — LLM unavailable."),
  ];
}

// ── Batch 5: Conversational (service descriptions + value prop) ──

async function batchConversational(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "service_descriptions": Are the services or products clearly described? Could an AI answer "What does this business offer?" from this text? Score 0-100.
- "unique_value_prop": Is there a clear unique value proposition? Could an AI answer "Why choose this business over competitors?" Score 0-100.
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 50. Return ONLY valid JSON.`,
    text,
  );

  const services = result?.service_descriptions;
  const uvp = result?.unique_value_prop;

  return [
    services
      ? {
          check_id: "service_descriptions",
          category: "F",
          name: "Clear service/product descriptions",
          pass: services.pass,
          score: services.score,
          details: { reason: services.reason },
          penalty: 0,
          fix: services.pass
            ? `Services are clearly described. ${services.reason}`
            : `Services are unclear. ${services.reason} Describe what you offer in plain language.`,
          type: "SEMI",
        }
      : fallback("service_descriptions", "F", "Clear service/product descriptions", "Could not analyze service descriptions — LLM unavailable."),
    uvp
      ? {
          check_id: "unique_value_prop",
          category: "F",
          name: "Unique value proposition identifiable",
          pass: uvp.pass,
          score: uvp.score,
          details: { reason: uvp.reason },
          penalty: 0,
          fix: uvp.pass
            ? `Value proposition is clear. ${uvp.reason}`
            : `No clear value proposition. ${uvp.reason} State what makes you different in the first few paragraphs.`,
          type: "SEMI",
        }
      : fallback("unique_value_prop", "F", "Unique value proposition identifiable", "Could not analyze value proposition — LLM unavailable."),
  ];
}

// ── Batch 6: Extractability (quotable snippets) ─────────

async function batchExtractability(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly this key:
- "snippet_ready": Are there self-contained paragraphs that an AI could quote directly as a useful answer? Good snippets are 1-3 sentences, factual, and don't require surrounding context. Score 0-100 (100 = multiple quotable passages; 0 = no standalone snippets).
The value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 50. Return ONLY valid JSON.`,
    text,
  );

  const snippet = result?.snippet_ready;

  return [
    snippet
      ? {
          check_id: "snippet_ready",
          category: "H",
          name: "Key paragraphs are self-contained and quotable",
          pass: snippet.pass,
          score: snippet.score,
          details: { reason: snippet.reason },
          penalty: 0,
          fix: snippet.pass
            ? `Content has quotable snippets. ${snippet.reason}`
            : `Content lacks standalone, quotable paragraphs. ${snippet.reason} Write key facts as self-contained sentences.`,
          type: "SEMI",
        }
      : fallback("snippet_ready", "H", "Key paragraphs are self-contained and quotable", "Could not analyze snippet readiness — LLM unavailable."),
  ];
}

// ── Batch 7: Authority (brand, author, social proof, certs) ──

async function batchAuthority(site: SiteData): Promise<CheckResult[]> {
  const text = truncateText(site);
  const result = await askHaiku(
    `You are a website content auditor. Analyze the page text and return JSON with exactly these keys:
- "brand_mentions": Is the brand/company name used consistently and prominently throughout the text? Score 0-100 (100 = brand is clear and repeated naturally; 0 = brand is absent or inconsistent).
- "author_credentials": Are there author bios, team pages, or professional credentials mentioned? Score 0-100.
- "testimonials": Is there social proof — customer testimonials, reviews, case studies, or client logos? Score 0-100.
- "certifications": Are industry certifications, awards, partnerships, or accreditations mentioned? Score 0-100.
Each value must be: { "pass": boolean, "score": number, "reason": "one sentence" }
A check passes if score >= 40. Return ONLY valid JSON.`,
    text,
  );

  const brand = result?.brand_mentions;
  const author = result?.author_credentials;
  const testimonials = result?.testimonials;
  const certs = result?.certifications;

  return [
    brand
      ? {
          check_id: "brand_mentions",
          category: "I",
          name: "Brand name consistent and prominent",
          pass: brand.pass,
          score: brand.score,
          details: { reason: brand.reason },
          penalty: 0,
          fix: brand.pass
            ? `Brand is prominent and consistent. ${brand.reason}`
            : `Brand presence is weak — brand authority is the #1 AI citation predictor. ${brand.reason}`,
          type: "SEMI",
        }
      : fallback("brand_mentions", "I", "Brand name consistent and prominent", "Could not analyze brand presence — LLM unavailable."),
    author
      ? {
          check_id: "author_credentials",
          category: "I",
          name: "Author bios with credentials present",
          pass: author.pass,
          score: author.score,
          details: { reason: author.reason },
          penalty: 0,
          fix: author.pass
            ? `Author credentials found. ${author.reason}`
            : `No author credentials found. ${author.reason} Add team bios with qualifications.`,
          type: "SEMI",
        }
      : fallback("author_credentials", "I", "Author bios with credentials present", "Could not analyze author credentials — LLM unavailable."),
    testimonials
      ? {
          check_id: "testimonials",
          category: "I",
          name: "Social proof / testimonials present",
          pass: testimonials.pass,
          score: testimonials.score,
          details: { reason: testimonials.reason },
          penalty: 0,
          fix: testimonials.pass
            ? `Social proof detected. ${testimonials.reason}`
            : `No social proof found. ${testimonials.reason} Add customer testimonials or case studies.`,
          type: "SEMI",
        }
      : fallback("testimonials", "I", "Social proof / testimonials present", "Could not analyze social proof — LLM unavailable."),
    certs
      ? {
          check_id: "certifications",
          category: "I",
          name: "Industry certifications / awards mentioned",
          pass: certs.pass,
          score: certs.score,
          details: { reason: certs.reason },
          penalty: 0,
          fix: certs.pass
            ? `Certifications or awards mentioned. ${certs.reason}`
            : `No certifications or awards found. ${certs.reason} Mention any industry recognition you have.`,
          type: "SEMI",
        }
      : fallback("certifications", "I", "Industry certifications / awards mentioned", "Could not analyze certifications — LLM unavailable."),
  ];
}

// ── Export ────────────────────────────────────────────────

export async function runLlmChecks(site: SiteData): Promise<CheckResult[]> {
  const [
    contentQuality,
    contentEvidence,
    entities,
    trust,
    conversational,
    extractability,
    authority,
  ] = await Promise.all([
    batchContentQuality(site),
    batchContentEvidence(site),
    batchEntities(site),
    batchTrust(site),
    batchConversational(site),
    batchExtractability(site),
    batchAuthority(site),
  ]);

  return [
    ...contentQuality,
    ...contentEvidence,
    ...entities,
    ...trust,
    ...conversational,
    ...extractability,
    ...authority,
  ];
}
