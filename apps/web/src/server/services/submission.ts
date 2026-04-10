import { prisma } from "@/lib/prisma";
import type { CheckResult } from "@/server/checks/types";

export async function createSubmission(email: string, website: string) {
  return prisma.submission.create({
    data: {
      email,
      website,
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

export async function completeSubmission(submissionId: string) {
  return prisma.submission.update({
    where: { id: submissionId },
    data: { status: "completed" },
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
