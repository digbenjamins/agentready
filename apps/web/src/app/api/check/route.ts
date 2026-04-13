import { NextRequest, NextResponse } from "next/server";
import { runAllChecks, calculateScore } from "@/server/checks";
import { createSubmission, saveChecks, completeSubmission } from "@/server/services/submission";
import { validateWebsiteUrl, checkRateLimit, getClientIp, acquireScanSlot, releaseScanSlot, parseJsonBody } from "@/server/security";

export async function POST(req: NextRequest) {
  // Rate limit: 2 scans per minute per IP
  const ip = getClientIp(req);
  const rl = checkRateLimit("check", ip, 2, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again later" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Global concurrency cap
  if (!acquireScanSlot()) {
    return NextResponse.json(
      { error: "Service is busy, please try again shortly" },
      { status: 503 },
    );
  }

  let body: { website?: string; company?: string };
  try {
    body = await parseJsonBody<{ website?: string; company?: string }>(req);
  } catch {
    releaseScanSlot();
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  // Honeypot: bots fill this hidden field, real users never do
  if (body.company) {
    releaseScanSlot();
    return NextResponse.json({ id: "00000000-0000-0000-0000-000000000000", website: body.website, score: 72, checks: [] });
  }

  const { website } = body;

  if (!website || typeof website !== "string") {
    releaseScanSlot();
    return NextResponse.json({ error: "Website is required" }, { status: 400 });
  }

  // Validate URL format and block private IPs / internal hosts
  let validatedUrl: string;
  try {
    validatedUrl = validateWebsiteUrl(website);
  } catch (err: unknown) {
    releaseScanSlot();
    const message = err instanceof Error ? err.message : "Invalid URL";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const submission = await createSubmission(validatedUrl);

    const { checks } = await runAllChecks(validatedUrl);
    const score = await calculateScore(checks);

    await saveChecks(submission.id, checks);
    await completeSubmission(submission.id, score);

    // Map to frontend-friendly format
    const formattedChecks = checks.map((c) => ({
      name: c.name,
      description: `[${c.category}] ${c.check_id}`,
      passed: c.pass,
      details: c.fix,
      score: c.score,
      type: c.type,
      category: c.category,
      check_id: c.check_id,
    }));

    return NextResponse.json({
      id: submission.id,
      website: validatedUrl,
      score,
      checks: formattedChecks,
    });
  } finally {
    releaseScanSlot();
  }
}
