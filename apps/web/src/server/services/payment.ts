import { after } from "next/server";
import { stripe } from "@/server/stripe";
import { prisma } from "@/lib/prisma";
import { generateMcdaReport } from "@/server/services/mcda";
import { generateUnlockCode } from "@/server/services/submission";
import { sendProReportEmail } from "@/server/email";

/**
 * Verifies a Stripe Checkout session server-side.
 * Only unlocks if the session is paid and matches this submission.
 * This is the return-URL fallback — the webhook is the primary unlock path.
 * Returns the unlock code if valid, null otherwise.
 */
export async function verifyStripePayment(
  submissionId: string,
  sessionId: string,
): Promise<string | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to this submission and payment is complete
    if (
      session.metadata?.submissionId !== submissionId ||
      session.payment_status !== "paid"
    ) {
      return null;
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: { pro: true, email: true, passcode: true, mcdaStatus: true, website: true },
    });

    if (!submission) return null;

    // If webhook already processed and code exists, don't rotate
    if (submission.pro && submission.passcode) {
      return null;
    }

    const customerEmail = session.customer_details?.email ?? null;

    // If webhook hasn't processed yet, do the unlock here
    if (!submission.pro) {
      const emailData = customerEmail && !submission.email
        ? { email: customerEmail, emailVerified: true }
        : {};

      await prisma.submission.update({
        where: { id: submissionId },
        data: { pro: true, paidAt: new Date(), stripeSessionId: sessionId, ...emailData },
      });

      if (!submission.mcdaStatus) {
        after(() => generateMcdaReport(submissionId, submission.website).catch(console.error));
      }
    }

    // Generate code only on first unlock (passcode is null)
    const code = await generateUnlockCode(submissionId);
    if (customerEmail) {
      after(() => sendProReportEmail(customerEmail, submissionId, code).catch(console.error));
    }

    return code;
  } catch (err) {
    console.error("Stripe payment verification failed:", err);
    return null;
  }
}
