import { NextRequest, NextResponse } from "next/server";
import { addEmailToSubmission } from "@/server/services/submission";
import { generateMcdaReport } from "@/server/services/mcda";
import { sendPasscodeEmail } from "@/server/email";
import { validateEmail, checkRateLimit, getClientIp, parseJsonBody } from "@/server/security";
import { prisma } from "@/lib/prisma";

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

  // Honeypot: bots fill this hidden field, real users never do
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

  let token: string;
  try {
    const result = await addEmailToSubmission(submissionId, email);
    token = result.token;
  } catch {
    return NextResponse.json(
      { error: "An email is already registered for this report. Check your inbox or use the resend page." },
      { status: 409 },
    );
  }

  try {
    await sendPasscodeEmail(email, token, submissionId);
  } catch (err) {
    console.error("Failed to send email:", err);
    return NextResponse.json({ error: "Failed to send email, please try again" }, { status: 500 });
  }

  // Start MCDA generation in background so it's ready when they unlock
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { website: true, mcdaStatus: true },
  });
  if (submission && !submission.mcdaStatus) {
    generateMcdaReport(submissionId, submission.website).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
