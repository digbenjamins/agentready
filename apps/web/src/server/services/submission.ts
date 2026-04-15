import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { CheckResult } from "@/server/checks/types";

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function verifyUnlockCode(storedHash: string | null, code: string): boolean {
  if (!storedHash) return false;
  const candidate = hashToken(code);
  if (storedHash.length !== candidate.length) return false;
  return crypto.timingSafeEqual(Buffer.from(storedHash), Buffer.from(candidate));
}

/**
 * Generates an unlock code for a paid submission.
 * Stores the hash, returns the raw token for the email link.
 */
export async function generateUnlockCode(submissionId: string): Promise<string> {
  const token = generateToken();
  await prisma.submission.update({
    where: { id: submissionId },
    data: { passcode: hashToken(token) },
  });
  return token;
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
