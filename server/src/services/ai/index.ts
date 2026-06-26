import {
  BRIEF_SYSTEM,
  DOMAIN_SYSTEM,
  ENTRY_SYSTEM,
  ROUTE_SYSTEM,
} from "../../lib/prompts";
import type {
  BriefDestination,
  Domain,
  Entry,
  EntryAnalysis,
  ExtractedStressor,
  RiskLevel,
  RouteSuggestion,
} from "../../lib/types";
import { claudeChat } from "./client";
import { safeParseAnalysis, stripFences, VALID_DOMAIN } from "./parse";

/**
 * The four model calls behind the API. Transports live in `./client`
 * (Claude active; GLM kept as the restore path — the original glmChat calls
 * are commented out above each Claude call, import it from "./client" to
 * swap back). Output sanitising lives in `./parse`.
 */

/**
 * Quick, single-purpose domain triage. A lightweight LLM check that decides which
 * domain a fresh entry fits into, BEFORE the entry is stored. Fails safe to
 * "general" on any transport or parse error, so the caller always gets a domain.
 */
export async function classifyDomain(text: string): Promise<Domain> {
  let raw: string;
  try {
    // raw = await glmChat(DOMAIN_SYSTEM, text);
    raw = await claudeChat(DOMAIN_SYSTEM, text);
  } catch {
    return "general";
  }
  const cleaned = stripFences(raw);
  // Prefer the JSON shape, but tolerate a bare domain word if the model drifts.
  try {
    const parsed = JSON.parse(cleaned) as { domain?: unknown };
    if (VALID_DOMAIN.includes(parsed.domain as Domain)) {
      return parsed.domain as Domain;
    }
  } catch {
    const word = cleaned.replace(/["'.\s]/g, "") as Domain;
    if (VALID_DOMAIN.includes(word)) return word;
  }
  return "general";
}

export async function processEntry(
  recent: Entry[],
  today: string,
  existingStressors: ExtractedStressor[] = [],
): Promise<EntryAnalysis> {
  const ctx = recent.map((e) => `[${e.date}] ${e.text}`).join("\n\n");
  const stressorContext = existingStressors.length
    ? `\n\nExisting stressors (reuse a label verbatim if today's entry is about it):\n` +
      existingStressors.map((s) => `- ${s.label} [${s.domain}]`).join("\n")
    : "";
  let raw: string;
  try {
    // raw = await glmChat(
    //   ENTRY_SYSTEM,
    //   `Recent entries:\n${ctx}\n\nToday's entry:\n${today}${stressorContext}`
    // );
    raw = await claudeChat(
      ENTRY_SYSTEM,
      `Recent entries:\n${ctx}\n\nToday's entry:\n${today}${stressorContext}`,
    );
  } catch {
    // Even on transport failure we fail safe rather than throw.
    return safeParseAnalysis("", existingStressors);
  }
  return safeParseAnalysis(raw, existingStressors);
}

export async function routeBrief(
  themes: string[],
  riskLevel: RiskLevel,
  concern?: string,
): Promise<RouteSuggestion> {
  const user = [
    `Recent themes: ${themes.length ? themes.join(", ") : "(none yet)"}`,
    `Latest risk_level: ${riskLevel}`,
    concern ? `Self-described concern: ${concern}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  // const raw = await glmChat(ROUTE_SYSTEM, user);
  const raw = await claudeChat(ROUTE_SYSTEM, user);
  return JSON.parse(stripFences(raw)) as RouteSuggestion;
}

export async function generateBrief(
  entries: Entry[],
  opts: { destination?: BriefDestination; generatedDate?: string } = {},
): Promise<string> {
  const destination = opts.destination ?? "gp_or_talking_therapies";
  const generatedDate =
    opts.generatedDate ?? new Date().toISOString().slice(0, 10);
  const system = BRIEF_SYSTEM.replace(
    /\{\{destination\}\}/g,
    destination,
  ).replace(/\{\{generated_date\}\}/g, generatedDate);
  const body = entries.map((e) => `[${e.date}] ${e.text}`).join("\n\n");
  // Brief generation uses Claude Sonnet; GLM is disabled here until the Z.ai balance is restored.
  // return glmChat(system, `Here are the student's journal entries:\n\n${body}`);
  return claudeChat(
    system,
    `Here are the student's journal entries:\n\n${body}`,
  );
}
