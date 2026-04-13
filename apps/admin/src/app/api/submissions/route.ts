import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

declare global {
  // eslint-disable-next-line no-var
  var __adminSessions: Set<string> | undefined;
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  const validSessions = globalThis.__adminSessions;
  if (!session || !validSessions?.has(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submissions = await prisma.submission.findMany({
    include: { checks: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(submissions);
}
