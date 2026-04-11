import type { CheckEntry } from "./types";
import { agentReadinessChecks } from "./agent-readiness";
import { machineAccessChecks } from "./machine-access";
import { contentChecks } from "./content";
import { structureChecks } from "./structure";
import { entitiesChecks } from "./entities";
import { trustChecks } from "./trust";
import { conversationalChecks } from "./conversational";
import { crawlPermissionsChecks } from "./crawl-permissions";
import { extractabilityChecks } from "./extractability";
import { authorityChecks } from "./authority";
import { technicalChecks } from "./technical";

export type { CheckEntry } from "./types";

export const allChecks: CheckEntry[] = [
  ...agentReadinessChecks,
  ...machineAccessChecks,
  ...contentChecks,
  ...structureChecks,
  ...entitiesChecks,
  ...trustChecks,
  ...conversationalChecks,
  ...crawlPermissionsChecks,
  ...extractabilityChecks,
  ...authorityChecks,
  ...technicalChecks,
];

export const categoryOrder: { code: string; name: string }[] = [
  { code: "K", name: "Agent Readiness" },
  { code: "A", name: "Machine Access" },
  { code: "B", name: "Content" },
  { code: "C", name: "Structure & Architecture" },
  { code: "D", name: "Entities & Semantics" },
  { code: "E", name: "Trust & Authority" },
  { code: "F", name: "Conversational Readiness" },
  { code: "G", name: "Crawl Permissions" },
  { code: "H", name: "Extractability" },
  { code: "I", name: "Authority Signals" },
  { code: "J", name: "Technical Performance" },
];

export function getCheckBySlug(slug: string): CheckEntry | undefined {
  return allChecks.find((c) => c.slug === slug);
}

export function getChecksByCategory(code: string): CheckEntry[] {
  return allChecks.filter((c) => c.category === code);
}

export function getAllSlugs(): string[] {
  return allChecks.map((c) => c.slug);
}
