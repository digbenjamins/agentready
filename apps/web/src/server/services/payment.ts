import { stripe } from "@/server/stripe";
import { prisma } from "@/lib/prisma";

/**
 * Verifies a Stripe Checkout session server-side.
 * This is the return-URL fallback — sets pro:true if the webhook hasn't yet.
 * Does NOT generate codes or trigger MCDA — the webhook handles that.
 * Returns true if payment is valid, false otherwise.
 */
export async function verifyStripePayment(
  submissionId: string,
  sessionId: string,
): Promise<boolean> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.metadata?.submissionId !== submissionId ||
      session.payment_status !== "paid"
    ) {
      return false;
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { pro: true, email: true },
    });

    if (!submission) return false;

    // Already processed by webhook
    if (submission.pro) return true;

    const customerEmail = session.customer_details?.email ?? null;
    const emailData = customerEmail && !submission.email
      ? { email: customerEmail, emailVerified: true }
      : {};

    await prisma.submission.update({
      where: { id: submissionId },
      data: { pro: true, paidAt: new Date(), stripeSessionId: sessionId, ...emailData },
    });

    return true;
  } catch (err) {
    console.error("Stripe payment verification failed:", err);
    return false;
  }
}
