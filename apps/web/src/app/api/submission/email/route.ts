import { NextRequest, NextResponse } from "next/server";
import { addEmailToSubmission } from "@/server/services/submission";

export async function POST(req: NextRequest) {
  const { submissionId, email } = await req.json();

  if (!submissionId || !email) {
    return NextResponse.json({ error: "submissionId and email are required" }, { status: 400 });
  }

  await addEmailToSubmission(submissionId, email);

  return NextResponse.json({ ok: true });
}
