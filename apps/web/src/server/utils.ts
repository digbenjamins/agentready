import type { SiteData } from "./checks/types";
import { assertPublicHost } from "./security";

// ── Fetching ─────────────────────────────────────────────

export function normalizeUrl(website: string): string {
  let url = website.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  return url;
}

const MAX_REDIRECTS = 5;
const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

export async function fetchUrl(url: string): Promise<{ ok: boolean; status: number; text: string; headers: Record<string, string>; responseTime: number }> {
  const start = Date.now();
  try {
    let currentUrl = url;

    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      // SSRF protection: validate every URL we fetch (initial + redirects)
      const hostname = new URL(currentUrl).hostname;
      await assertPublicHost(hostname);

      const res = await fetch(currentUrl, {
        method: "GET",
        signal: AbortSignal.timeout(8000),
        redirect: "manual",
        headers: {
          "User-Agent": "OkforAI/1.0 (AI Readiness Checker)",
        },
      });

      if (REDIRECT_CODES.has(res.status)) {
        const location = res.headers.get("location");
        if (!location) break;
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      const text = await res.text();
      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return { ok: res.ok, status: res.status, text, headers, responseTime: Date.now() - start };
    }

    return { ok: false, status: 0, text: "", headers: {}, responseTime: Date.now() - start };
  } catch {
    return { ok: false, status: 0, text: "", headers: {}, responseTime: Date.now() - start };
  }
}

export async function fetchHead(url: string): Promise<{ ok: boolean; status: number; headers: Record<string, string>; responseTime: number }> {
  const start = Date.now();
  try {
    let currentUrl = url;

    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      // SSRF protection: validate every URL we fetch (initial + redirects)
      const hostname = new URL(currentUrl).hostname;
      await assertPublicHost(hostname);

      const res = await fetch(currentUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(8000),
        redirect: "manual",
        headers: {
          "User-Agent": "OkforAI/1.0 (AI Readiness Checker)",
        },
      });

      if (REDIRECT_CODES.has(res.status)) {
        const location = res.headers.get("location");
        if (!location) break;
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      const headers: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return { ok: res.ok, status: res.status, headers, responseTime: Date.now() - start };
    }

    return { ok: false, status: 0, headers: {}, responseTime: Date.now() - start };
  } catch {
    return { ok: false, status: 0, headers: {}, responseTime: Date.now() - start };
  }
}

export async function gatherSiteData(baseUrl: string): Promise<SiteData> {
  const homepage = await fetchUrl(baseUrl);

  const [robotsRes, sitemapRes, llmsRes] = await Promise.all([
    fetchUrl(`${baseUrl}/robots.txt`),
    fetchUrl(`${baseUrl}/sitemap.xml`).then(async (res) => {
      if (!res.ok) return fetchUrl(`${baseUrl}/sitemap_index.xml`);
      return res;
    }),
    fetchUrl(`${baseUrl}/llms.txt`),
  ]);

  return {
    url: baseUrl,
    html: homepage.text,
    headers: homepage.headers,
    statusCode: homepage.status,
    responseTime: homepage.responseTime,
    robotsTxt: robotsRes.ok ? robotsRes.text : null,
    sitemapXml: sitemapRes.ok ? sitemapRes.text : null,
    llmsTxt: llmsRes.ok ? llmsRes.text : null,
  };
}

// ── HTML parsing ─────────────────────────────────────────

export function countWords(text: string): number {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter((w) => w.length > 0).length;
}

export function extractBodyText(html: string): string {
  let body = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) body = bodyMatch[1];

  // Remove script, style, nav, footer tags
  body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
  body = body.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
  // Remove hidden elements (display:none, visibility:hidden, aria-hidden, font-size:0)
  body = body.replace(/<[^>]+(?:display\s*:\s*none|visibility\s*:\s*hidden|aria-hidden\s*=\s*["']true["']|font-size\s*:\s*0)[^>]*>[\s\S]*?<\/[^>]+>/gi, "");
  // Remove HTML comments
  body = body.replace(/<!--[\s\S]*?-->/g, "");
  // Remove all tags
  body = body.replace(/<[^>]*>/g, " ");
  // Collapse whitespace
  body = body.replace(/\s+/g, " ").trim();
  return body;
}

export function extractMetaTag(html: string, name: string): string | null {
  // Match name="..." or property="..."
  const regex = new RegExp(
    `<meta\\s+(?:[^>]*?(?:name|property)\\s*=\\s*["']${name}["'][^>]*?content\\s*=\\s*["']([^"']*)["']|[^>]*?content\\s*=\\s*["']([^"']*)["'][^>]*?(?:name|property)\\s*=\\s*["']${name}["'])`,
    "i",
  );
  const match = html.match(regex);
  if (match) return match[1] || match[2] || null;
  return null;
}

export function extractHeadings(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = [];
  const regex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    if (text) {
      headings.push({ level: parseInt(match[1]), text });
    }
  }
  return headings;
}
