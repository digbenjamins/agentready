import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { CheckResult } from "@/server/checks/types";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyUnlockCode(stored: string | null, code: string): boolean {
  if (!stored) return false;
  // Try hash comparison first (code is hashed after MCDA completes)
  const candidate = hashToken(code);
  if (stored.length === candidate.length) {
    if (crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(candidate))) {
      return true;
    }
  }
  // Try direct comparison (code is stored raw before MCDA completes)
  if (stored.length === code.length) {
    return crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(code));
  }
  return false;
}

/**
 * Generates an unlock code for a paid submission.
 * Stores the raw token so it can be read later for emails.
 * Call hashUnlockCode() after the final email is sent.
 */
export async function generateUnlockCode(submissionId: string): Promise<string> {
  const token = generateToken();
  await prisma.submission.update({
    where: { id: submissionId },
    data: { passcode: token },
  });
  return token;
}

/**
 * Hashes the stored raw code in place for long-term security.
 * Call this after the final email has been sent.
 */
export async function hashUnlockCode(submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { passcode: true },
  });
  if (!submission?.passcode) return;
  // Don't double-hash: if it's already hashed, skip
  const hashed = hashToken(submission.passcode);
  if (submission.passcode === hashed) return;
  await prisma.submission.update({
    where: { id: submissionId },
    data: { passcode: hashed },
  });
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

export async function addEmailToSubmission(submissionId: string, email: string) {
  await prisma.submission.update({
    where: { id: submissionId, email: null },
    data: { email },
  });
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
