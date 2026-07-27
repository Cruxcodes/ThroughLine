import {
  isDomain,
  type Domain,
  type EntryAnalysis,
  type ExtractedStressor,
  type RelatedStressor,
  type RiskLevel,
} from "../../lib/types";

/**
 * Sanitisers for model output. Everything that crosses the LLM boundary is
 * treated as untrusted: fences stripped, enums validated, shapes coerced, and
 * failures resolved to safe defaults.
 */

export function stripFences(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

const VALID_RISK: RiskLevel[] = ["none", "elevated", "crisis"];

/** Any domain outside the vocabulary becomes "general" rather than reaching the client. */
const safeDomain = (raw: unknown): Domain => (isDomain(raw) ? raw : "general");

/** Keep only well-formed stressors, cap at 3, and de-dupe by label (case-insensitive). */
function parseStressors(raw: unknown): ExtractedStressor[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: ExtractedStressor[] = [];
  for (const s of raw) {
    const label = typeof s?.label === "string" ? s.label.trim() : "";
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, domain: safeDomain(s?.domain) });
    if (out.length === 3) break;
  }
  return out;
}

/**
 * Resolve the single stressor an entry relates to. The model proposes a label;
 * the server decides `isNew` authoritatively by matching (case-insensitively)
 * against the user's existing stressors, so the flag can't drift from reality.
 */
function parseRelatedStressor(
  raw: unknown,
  existing: ExtractedStressor[],
): RelatedStressor | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as { label?: unknown; domain?: unknown };
  const label = typeof r.label === "string" ? r.label.trim() : "";
  if (!label) return null;
  const isNew = !existing.some(
    (s) => s.label.toLowerCase() === label.toLowerCase(),
  );
  return { label, domain: safeDomain(r.domain), isNew };
}

/**
 * Cross-cutting rule 7 (fail safe): if JSON fails to parse or risk_level is
 * missing/invalid, treat the entry as "elevated" and show support. Crisis
 * forces an empty next_prompt regardless of what the model returned.
 */
export function safeParseAnalysis(
  raw: string,
  existingStressors: ExtractedStressor[] = [],
): EntryAnalysis {
  const fallback: EntryAnalysis = {
    next_prompt: "",
    risk_level: "elevated",
    risk_rationale:
      "Analysis was unavailable, defaulting to a supportive stance.",
    themes: [],
    domain: "general",
    stressors: [],
    related_stressor: null,
  };
  let parsed: Partial<EntryAnalysis>;
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    return fallback;
  }
  if (!parsed || !VALID_RISK.includes(parsed.risk_level as RiskLevel)) {
    return fallback;
  }
  const analysis: EntryAnalysis = {
    next_prompt:
      typeof parsed.next_prompt === "string" ? parsed.next_prompt : "",
    risk_level: parsed.risk_level as RiskLevel,
    risk_rationale:
      typeof parsed.risk_rationale === "string" ? parsed.risk_rationale : "",
    themes: Array.isArray(parsed.themes) ? parsed.themes : [],
    domain: safeDomain(parsed.domain),
    stressors: parseStressors((parsed as { stressors?: unknown }).stressors),
    related_stressor: parseRelatedStressor(
      (parsed as { related_stressor?: unknown }).related_stressor,
      existingStressors,
    ),
  };
  if (analysis.risk_level === "crisis") analysis.next_prompt = "";
  return analysis;
}
