export interface CheckResult {
  check_id: string;
  category: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";
  name: string;
  pass: boolean;
  score: number; // 0-100
  details: Record<string, unknown>;
  penalty: number; // 0 or negative
  fix: string;
  type: "AUTO" | "SEMI";
}

export interface SiteData {
  url: string;
  html: string;
  headers: Record<string, string>;
  statusCode: number;
  responseTime: number;
  robotsTxt: string | null;
  sitemapXml: string | null;
  llmsTxt: string | null;
}
