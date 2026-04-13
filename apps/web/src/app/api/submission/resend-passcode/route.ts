import { NextRequest, NextResponse } from "next/server";
import { resendTokenByEmailAndWebsite } from "@/server/services/submission";
import { sendPasscodeEmail } from "@/server/email";
import { checkRateLimit, getClientIp, parseJsonBody } from "@/server/security";

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

  // Honeypot: bots fill this hidden field, real users never do
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

  const result = await resendTokenByEmailAndWebsite(email, website);

  // Always return success to avoid leaking whether a report exists
  if (result) {
    try {
      await sendPasscodeEmail(result.email, result.token, result.submissionId);
    } catch (err) {
      console.error("Failed to resend email:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
