import type { CheckResult } from "./types";

/** 38 — Brand name consistent and prominent (SEMI) */
function checkBrandMentions(): CheckResult {
  return {
    check_id: "brand_mentions",
    category: "I",
    name: "Brand name consistent and prominent",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate brand consistency. Brand authority is the strongest AI citation predictor (0.334 correlation).",
    type: "SEMI",
  };
}

/** 39 — Author bios with credentials present (SEMI) */
function checkAuthorCredentials(): CheckResult {
  return {
    check_id: "author_credentials",
    category: "I",
    name: "Author bios with credentials present",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate author bios and credentials.",
    type: "SEMI",
  };
}

/** 40 — Social proof / testimonials present (SEMI) */
function checkTestimonials(): CheckResult {
  return {
    check_id: "testimonials",
    category: "I",
    name: "Social proof / testimonials present",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate social proof and testimonials.",
    type: "SEMI",
  };
}

/** 41 — Industry certifications / awards mentioned (SEMI) */
function checkCertifications(): CheckResult {
  return {
    check_id: "certifications",
    category: "I",
    name: "Industry certifications / awards mentioned",
    pass: false,
    score: 0,
    details: { requires_llm: true },
    penalty: 0,
    fix: "SEMI check — requires LLM to evaluate certifications and awards.",
    type: "SEMI",
  };
}

export function runAuthorityChecks(): CheckResult[] {
  return [
    checkBrandMentions(),
    checkAuthorCredentials(),
    checkTestimonials(),
    checkCertifications(),
  ];
}
