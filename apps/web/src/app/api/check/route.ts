import { NextRequest, NextResponse } from "next/server";
import { runAllChecks, calculateScore } from "@/server/checks";
import { createSubmission, saveChecks, completeSubmission } from "@/server/services/submission";

export async function POST(req: NextRequest) {
  const { website } = await req.json();

  if (!website) {
    return NextResponse.json({ error: "Website is required" }, { status: 400 });
  }

  const submission = await createSubmission(website);

  const { checks } = await runAllChecks(website);
  const score = await calculateScore(checks);

  await saveChecks(submission.id, checks);
  await completeSubmission(submission.id, score);

  // Map to frontend-friendly format
  const formattedChecks = checks.map((c) => ({
    name: c.name,
    description: `[${c.category}] ${c.check_id}`,
    passed: c.pass,
    details: c.fix,
    score: c.score,
    type: c.type,
    category: c.category,
    check_id: c.check_id,
  }));

  return NextResponse.json({
    id: submission.id,
    website,
    score,
    checks: formattedChecks,
  });
}
