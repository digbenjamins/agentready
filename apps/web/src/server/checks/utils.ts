import type { SiteData } from "./types";

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

export async function fetchUrl(
  url: string
): Promise<{ ok: boolean; status: number; text: string; headers: Record<string, string>; responseTime: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
      headers: {
        "User-Agent": "AgentReady/1.0 (AI Readiness Checker)",
      },
    });
    const text = await res.text();
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { ok: res.ok, status: res.status, text, headers, responseTime: Date.now() - start };
  } catch {
    return { ok: false, status: 0, text: "", headers: {}, responseTime: Date.now() - start };
  }
}

export async function fetchHead(
  url: string
): Promise<{ ok: boolean; status: number; headers: Record<string, string>; responseTime: number }> {
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
      headers: {
        "User-Agent": "AgentReady/1.0 (AI Readiness Checker)",
      },
    });
    const headers: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { ok: res.ok, status: res.status, headers, responseTime: Date.now() - start };
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

  // Remove script and style tags
  body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "");
  body = body.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "");
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
    "i"
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
