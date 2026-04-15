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

  const filter = req.nextUrl.searchParams.get("filter");

  if (filter === "paid") {
    const paid = await prisma.submission.findMany({
      where: { pro: true },
      select: {
        id: true,
        email: true,
        website: true,
        score: true,
        paidAt: true,
        mcdaStatus: true,
        createdAt: true,
      },
      orderBy: { paidAt: "desc" },
      take: 200,
    });
    return NextResponse.json(paid);
  }

  const submissions = await prisma.submission.findMany({
    select: {
      id: true,
      email: true,
      website: true,
      score: true,
      pro: true,
      emailVerified: true,
      status: true,
      stripeSessionId: true,
      paidAt: true,
      mcdaStatus: true,
      createdAt: true,
      updatedAt: true,
      checks: true,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(submissions);
}
