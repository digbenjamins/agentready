import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

declare global {
  // eslint-disable-next-line no-var
  var __adminSessions: Set<string> | undefined;
}

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-real-ip") || "unknown";
  const now = Date.now();

  // Rate limit: 5 login attempts per 15 minutes per IP
  const entry = loginAttempts.get(ip);
  if (entry && now < entry.resetAt && entry.count >= 5) {
    return NextResponse.json({ error: "Too many login attempts, try again later" }, { status: 429 });
  }
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60_000 });
  } else {
    entry.count++;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is not set");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > 1024) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const { password } = await req.json();
  if (!password || typeof password !== "string" || password.length > 256) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Timing-safe comparison to prevent timing attacks
  const passwordBuffer = Buffer.from(password);
  const adminBuffer = Buffer.from(adminPassword);
  const valid = passwordBuffer.length === adminBuffer.length &&
    crypto.timingSafeEqual(passwordBuffer, adminBuffer);

  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // Generate a random session token instead of a static string
  const sessionToken = crypto.randomBytes(32).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  // Store the valid session token (in production, use Redis or DB)
  globalThis.__adminSessions = globalThis.__adminSessions || new Set();
  (globalThis.__adminSessions as Set<string>).add(sessionToken);

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");

  if (session && globalThis.__adminSessions) {
    (globalThis.__adminSessions as Set<string>).delete(session.value);
  }

  cookieStore.delete("admin_session");
  return NextResponse.json({ success: true });
}
