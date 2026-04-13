import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { CheckResult } from "@/server/checks/types";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createSubmission(website: string, email?: string) {
  return prisma.submission.create({
    data: {
      website,
      email: email || null,
      status: "checking",
    },
  });
}

export async function saveChecks(submissionId: string, checks: CheckResult[]) {
  await prisma.check.createMany({
    data: checks.map((c) => ({
      submissionId,
      name: c.name,
      description: `[${c.check_id}] Category ${c.category} — ${c.type}`,
      passed: c.pass,
      details: c.fix,
    })),
  });
}

export async function completeSubmission(submissionId: string, score?: number) {
  return prisma.submission.update({
    where: { id: submissionId },
    data: { status: "completed", score: score ?? null },
  });
}

/**
 * Sets email + generates an unlock token. Returns the raw token for the email link.
 * Only the hash is stored in the database (in the passcode field).
 */
export async function addEmailToSubmission(submissionId: string, email: string) {
  const token = generateToken();
  await prisma.submission.update({
    where: { id: submissionId, email: null },
    data: { email, passcode: hashToken(token) },
  });
  return { token };
}

/**
 * Checks the unlock token against the stored hash.
 * On first valid access, marks emailVerified = true (confirms the email was real).
 */
export function verifyUnlockToken(storedHash: string | null, token: string): boolean {
  if (!storedHash) return false;
  return storedHash === hashToken(token);
}

export async function markEmailVerified(submissionId: string) {
  await prisma.submission.update({
    where: { id: submissionId },
    data: { emailVerified: true, pro: true },
  });
}

/**
 * Resend: finds a submission by email + website, generates a new token.
 * Returns null if no match (caller should still return 200 to avoid leaking info).
 */
export async function resendTokenByEmailAndWebsite(email: string, website: string) {
  let normalized = website.trim().toLowerCase();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  normalized = normalized.replace(/\/$/, "");

  const submission = await prisma.submission.findFirst({
    where: {
      email,
      website: { startsWith: normalized },
      status: "completed",
    },
    select: { id: true, email: true },
    orderBy: { createdAt: "desc" },
  });
  if (!submission?.email) return null;

  const token = generateToken();
  await prisma.submission.update({
    where: { id: submission.id },
    data: { passcode: hashToken(token) },
  });
  return { token, email: submission.email, submissionId: submission.id };
}

export async function getSubmissionWithChecks(submissionId: string) {
  return prisma.submission.findUnique({
    where: { id: submissionId },
    include: { checks: true },
  });
}

export async function getSubmissionsByEmail(email: string) {
  return prisma.submission.findMany({
    where: { email },
    include: { checks: true },
    orderBy: { createdAt: "desc" },
  });
}
