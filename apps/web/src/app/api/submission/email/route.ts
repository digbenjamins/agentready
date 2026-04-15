import { NextRequest, NextResponse } from "next/server";
import { addEmailToSubmission } from "@/server/services/submission";
import { validateEmail, checkRateLimit, getClientIp, parseJsonBody } from "@/server/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit("email", ip, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again later" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  let body: { submissionId?: string; email?: string; company?: string };
  try {
    body = await parseJsonBody<{ submissionId?: string; email?: string; company?: string }>(req);
  } catch {
    return NextResponse.json({ error: "Invalid or oversized request body" }, { status: 400 });
  }

  // Honeypot
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const { submissionId, email } = body;

  if (!submissionId || typeof submissionId !== "string") {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  if (!email || typeof email !== "string" || !validateEmail(email)) {
    return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
  }

  try {
    await addEmailToSubmission(submissionId, email);
  } catch {
    return NextResponse.json(
      { error: "An email is already registered for this report." },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true });
}
