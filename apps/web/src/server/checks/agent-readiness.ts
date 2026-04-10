import type { CheckResult, SiteData } from "./types";
import { fetchUrl } from "./utils";

/** 45 — skill.md file present */
async function checkSkillMd(site: SiteData): Promise<CheckResult> {
  const res = await fetchUrl(`${site.url}/skill.md`);

  return {
    check_id: "skill_md",
    category: "K",
    name: "skill.md file present",
    pass: res.ok,
    score: res.ok ? 100 : 0,
    details: { status: res.status, content_length: res.text.length },
    penalty: res.ok ? 0 : -5,
    fix: res.ok
      ? "Found skill.md — AI agents can discover this site's capabilities."
      : `skill.md not found (HTTP ${res.status || "unreachable"}). Create a /skill.md file describing your product for AI agents.`,
    type: "AUTO",
  };
}

/** 46 — /skill JSON endpoint */
async function checkSkillEndpoint(site: SiteData): Promise<CheckResult> {
  const res = await fetchUrl(`${site.url}/skill`);
  let isJson = false;

  if (res.ok) {
    try {
      JSON.parse(res.text);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  const pass = res.ok && isJson;

  return {
    check_id: "skill_endpoint",
    category: "K",
    name: "/skill JSON endpoint",
    pass,
    score: pass ? 100 : res.ok ? 50 : 0,
    details: { status: res.status, is_json: isJson },
    penalty: pass ? 0 : -5,
    fix: pass
      ? "Found /skill endpoint returning valid JSON — agents can query capabilities."
      : res.ok
        ? "/skill endpoint exists but doesn't return valid JSON. Return a JSON object with name, description, and capabilities."
        : `/skill endpoint not found (HTTP ${res.status || "unreachable"}). Create a JSON API at /skill.`,
    type: "AUTO",
  };
}

/** 47 — /.well-known/agent.json */
async function checkAgentJson(site: SiteData): Promise<CheckResult> {
  const res = await fetchUrl(`${site.url}/.well-known/agent.json`);
  let isJson = false;

  if (res.ok) {
    try {
      JSON.parse(res.text);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  const pass = res.ok && isJson;

  return {
    check_id: "agent_json",
    category: "K",
    name: ".well-known/agent.json",
    pass,
    score: pass ? 100 : res.ok ? 50 : 0,
    details: { status: res.status, is_json: isJson },
    penalty: pass ? 0 : -5,
    fix: pass
      ? "Found agent.json — standard agent discovery is supported."
      : res.ok
        ? "agent.json exists but doesn't return valid JSON. Ensure it's a valid JSON file."
        : `agent.json not found (HTTP ${res.status || "unreachable"}). Create /.well-known/agent.json for AI agent discovery.`,
    type: "AUTO",
  };
}

export async function runAgentReadinessChecks(site: SiteData): Promise<CheckResult[]> {
  const [skillMd, skillEndpoint, agentJson] = await Promise.all([
    checkSkillMd(site),
    checkSkillEndpoint(site),
    checkAgentJson(site),
  ]);
  return [skillMd, skillEndpoint, agentJson];
}
