import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@okfor.ai";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://okfor.ai";

export async function sendPasscodeEmail(to: string, token: string, submissionId: string) {
  const unlockLink = `${BASE_URL}/results/${submissionId}?code=${token}`;

  await resend.emails.send({
    from: `OkforAI <${FROM_EMAIL}>`,
    to,
    subject: "Your AI readiness report is ready",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Your AI readiness report is ready</h2>
        <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Click the button below to view your full report with all checks and detailed fixes.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${unlockLink}" style="display: inline-block; background: #18181b; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View full report</a>
        </div>
        <p style="color: #999; font-size: 12px; margin: 0 0 16px; text-align: center;">Or paste this link in your browser:<br/><a href="${unlockLink}" style="color: #666; word-break: break-all;">${unlockLink}</a></p>
        <p style="color: #999; font-size: 11px; margin: 0; text-align: center;">Lost this email? You can request a new link at <a href="${BASE_URL}/resend" style="color: #666;">${BASE_URL}/resend</a></p>
      </div>
    `,
  });
}

export async function sendProReportEmail(to: string, submissionId: string, code: string) {
  const reportLink = `${BASE_URL}/results/${submissionId}?code=${code}`;

  await resend.emails.send({
    from: `OkforAI <${FROM_EMAIL}>`,
    to,
    subject: "Your Pro AI audit is unlocked",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">Thank you for your purchase</h2>
        <p style="color: #666; font-size: 14px; margin: 0 0 8px;">Your full AI readiness audit is now unlocked. Bookmark the link below to access your report anytime.</p>
        <p style="color: #666; font-size: 14px; margin: 0 0 24px;">Your multi-AI citation report across 8 models is being generated and will be ready within a few minutes.</p>
        <div style="text-align: center; margin: 0 0 24px;">
          <a href="${reportLink}" style="display: inline-block; background: #00B583; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 32px; border-radius: 8px; text-decoration: none;">View your Pro report</a>
        </div>
        <p style="color: #999; font-size: 12px; margin: 0 0 16px; text-align: center;">Or paste this link in your browser:<br/><a href="${reportLink}" style="color: #666; word-break: break-all;">${reportLink}</a></p>
      </div>
    `,
  });
}
