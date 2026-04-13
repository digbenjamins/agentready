import dns from "dns/promises";

/**
 * Private / reserved IP ranges that must never be fetched server-side.
 * Covers IPv4 private, loopback, link-local, and IPv6 equivalents.
 */
const BLOCKED_IPV4_RANGES = [
  { prefix: "127.", label: "loopback" },
  { prefix: "10.", label: "private" },
  { prefix: "0.", label: "unspecified" },
  { prefix: "169.254.", label: "link-local" },
  { prefix: "192.168.", label: "private" },
] as const;

function isBlockedIPv4(ip: string): boolean {
  if (BLOCKED_IPV4_RANGES.some((r) => ip.startsWith(r.prefix))) return true;
  // 172.16.0.0 - 172.31.255.255
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

const BLOCKED_IPV6 = ["::1", "::ffff:127.0.0.1", "fe80:", "fc00:", "fd00:"];

function isBlockedIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  return BLOCKED_IPV6.some((prefix) => lower.startsWith(prefix));
}

/**
 * Resolves hostname and checks that none of its IPs are private/internal.
 * Throws if the host resolves to a blocked range.
 */
export async function assertPublicHost(hostname: string): Promise<void> {
  let addresses: string[] = [];

  // Resolve IPv4
  let v4Failed = false;
  try {
    const results = await dns.resolve(hostname);
    addresses = results;
  } catch {
    v4Failed = true;
  }

  // Resolve IPv6
  let v6Failed = false;
  try {
    const v6 = await dns.resolve6(hostname);
    addresses = addresses.concat(v6);
  } catch {
    v6Failed = true;
  }

  // Fail closed: if DNS resolution fails entirely, block the request
  if (v4Failed && v6Failed) {
    throw new Error(`Blocked: unable to resolve ${hostname}`);
  }

  for (const ip of addresses) {
    if (isBlockedIPv4(ip) || isBlockedIPv6(ip)) {
      throw new Error(`Blocked: ${hostname} resolves to private IP`);
    }
  }
}

/**
 * Validates that a URL string is a proper public HTTP(S) URL.
 * Returns the validated URL or throws.
 */
export function validateWebsiteUrl(input: string): string {
  let url: URL;
  try {
    let raw = input.trim();
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      raw = "https://" + raw;
    }
    url = new URL(raw);
  } catch {
    throw new Error("Invalid URL format");
  }

  // Only allow http and https
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  // Block IP-literal hostnames (e.g. http://192.168.1.1)
  const hostname = url.hostname;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    throw new Error("IP addresses are not allowed, use a domain name");
  }
  if (hostname.startsWith("[")) {
    throw new Error("IPv6 addresses are not allowed, use a domain name");
  }

  // Must have a dot in hostname (no localhost, no single-label)
  if (!hostname.includes(".")) {
    throw new Error("Invalid hostname");
  }

  // Block common internal hostnames and DNS rebinding services
  const lower = hostname.toLowerCase();
  const blockedSuffixes = [".local", ".internal", ".nip.io", ".sslip.io", ".xip.io", ".traefik.me", ".localtest.me"];
  if (
    lower === "localhost" ||
    blockedSuffixes.some((suffix) => lower.endsWith(suffix))
  ) {
    throw new Error("This hostname is not allowed");
  }

  return url.toString().replace(/\/$/, "");
}

/**
 * Basic email format validation. Not exhaustive, but catches junk input.
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== "string" || email.length > 254) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ── Rate limiter ─────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Simple in-memory sliding-window rate limiter.
 * Returns { allowed: true } or { allowed: false, retryAfter: seconds }.
 */
export function checkRateLimit(
  bucketName: string,
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: true } | { allowed: false; retryAfter: number } {
  if (!buckets.has(bucketName)) {
    buckets.set(bucketName, new Map());
  }
  const bucket = buckets.get(bucketName)!;
  const now = Date.now();

  const entry = bucket.get(key);
  if (!entry || now > entry.resetAt) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Extract the real client IP. On Vercel, x-real-ip is set by the platform
 * and cannot be spoofed by the client. We do NOT fall back to
 * x-forwarded-for because that header is trivially spoofable when there
 * is no trusted reverse proxy in front of the app.
 *
 * If x-real-ip is absent (local dev without proxy), all requests share the
 * "unknown" bucket, which is the safe default (fail-closed rate limiting).
 */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get("x-real-ip") || "unknown";
}

// ── Global concurrency limiter ───────────────────────────

let activeScans = 0;
const MAX_CONCURRENT_SCANS = parseInt(process.env.MAX_CONCURRENT_SCANS || "20", 10);

export function acquireScanSlot(): boolean {
  if (activeScans >= MAX_CONCURRENT_SCANS) return false;
  activeScans++;
  return true;
}

export function releaseScanSlot(): void {
  activeScans = Math.max(0, activeScans - 1);
}

// ── Request body size check ─────────────────────────────

const MAX_BODY_BYTES = 16_384; // 16 KB - plenty for a JSON URL/email payload

export async function parseJsonBody<T>(req: { text(): Promise<string> }): Promise<T> {
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    throw new Error("Request body too large");
  }
  return JSON.parse(raw) as T;
}

// Periodically clean expired entries (every 60s)
setInterval(() => {
  const now = Date.now();
  for (const [, bucket] of buckets) {
    for (const [key, entry] of bucket) {
      if (now > entry.resetAt) bucket.delete(key);
    }
  }
}, 60_000).unref();

