import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, parseJsonBody } from "@/server/security";
import { sendReportReadyEmail } from "@/server/email";
import { generateUnlockCode } from "@/server/services/submission";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit("resend-passcode", ip, 3, 5 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again later" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { email?: string; website?: string; company?: string };
  try {
    body = await parseJsonBody<{ email?: string; website?: string; company?: string }>(req);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const { email, website } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!website || typeof website !== "string") {
    return NextResponse.json({ error: "Website is required" }, { status: 400 });
  }

  // Normalize website for lookup
  let normalized = website.trim().toLowerCase();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  normalized = normalized.replace(/\/$/, "");

  const submission = await prisma.submission.findFirst({
    where: {
      email,
      website: normalized,
      pro: true,
    },
    select: { id: true },
    orderBy: { createdAt: "desc" },
  });

  // Always return success to avoid leaking whether a report exists
  if (submission) {
    generateUnlockCode(submission.id)
      .then((code) => sendReportReadyEmail(email, submission.id, code))
      .catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
