import { NextRequest, NextResponse, after } from "next/server";
import { stripe } from "@/server/stripe";
import { prisma } from "@/lib/prisma";
import { generateMcdaReport } from "@/server/services/mcda";

const MAX_WEBHOOK_BODY = 64 * 1024; // 64KB, Stripe payloads are typically <10KB

export async function POST(req: NextRequest) {
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > MAX_WEBHOOK_BODY) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const body = await req.text();
  if (body.length > MAX_WEBHOOK_BODY) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const submissionId = session.metadata?.submissionId;

    if (submissionId) {
      const existing = await prisma.submission.findUnique({
        where: { id: submissionId },
        select: { pro: true, email: true, mcdaStatus: true, website: true },
      });

      if (!existing) {
        return NextResponse.json({ received: true });
      }

      // Mark as pro if the return URL hasn't done it yet
      if (!existing.pro) {
        const customerEmail = session.customer_details?.email ?? null;
        const emailData = customerEmail && !existing.email
          ? { email: customerEmail, emailVerified: true }
          : {};

        await prisma.submission.update({
          where: { id: submissionId },
          data: { pro: true, paidAt: new Date(), ...emailData },
        });
      }

      // Kick off MCDA report generation (runs after response is sent)
      if (!existing.mcdaStatus) {
        after(() => generateMcdaReport(submissionId, existing.website).catch(console.error));
      }
    }
  }

  return NextResponse.json({ received: true });
}
