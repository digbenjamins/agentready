import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/server/stripe";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, parseJsonBody } from "@/server/security";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = checkRateLimit("checkout", ip, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests, try again later" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  try {
    const body = await parseJsonBody<{ submissionId?: string; company?: string }>(req);

    // Honeypot
    if (body.company) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { submissionId } = body;

    if (!submissionId || typeof submissionId !== "string") {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { id: true, pro: true, stripeSessionId: true, website: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.pro) {
      return NextResponse.json({ error: "Already unlocked" }, { status: 400 });
    }

    // Reuse existing unexpired session if one exists
    if (submission.stripeSessionId) {
      try {
        const existing = await stripe.checkout.sessions.retrieve(submission.stripeSessionId);
        if (existing.status === "open" && existing.url) {
          return NextResponse.json({ url: existing.url });
        }
      } catch {
        // Session expired or invalid, create a new one
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      metadata: { submissionId: submission.id },
      success_url: `${baseUrl}/results/${submission.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/results/${submission.id}`,
    });

    await prisma.submission.update({
      where: { id: submission.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
