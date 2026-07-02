/**
 * Design tokens. Palette, radii, and flatness are locked by DESIGN.md §2
 * (research-validated) — do not restyle them. Personality lives in the type
 * system: two voices that encode what the product is.
 *
 *   serif (Fraunces)     — the human voice: titles, the journal editor,
 *                          reflective prompts, quoted entries. The user's words
 *                          look like the document they will become.
 *   mono  (IBM Plex Mono) — the record voice: kickers, dates, tags, metadata.
 *                          Dates are the product's evidence, so everything
 *                          evidentiary is set in the ledger face.
 *
 * Body copy stays the system font for legibility.
 */

export const color = {
  bg: "#f7faf9",
  surface: "#ffffff",
  primary: "#2f6f5e",
  primaryPressed: "#255647",
  tintSurface: "#eef5f2",
  tintBorder: "#d4e5de",
  textStrong: "#1d2b27",
  textBody: "#2b3733",
  textMuted: "#52605b",
  textFaint: "#7b8884",
  placeholder: "#9aa5a1",
  hairline: "#eceeed",
  riskNone: "#7fae9f",
  riskElevated: "#e0a13c",
  riskCrisis: "#b4453a",
} as const;

/**
 * RN ignores fontWeight for custom faces — weight is baked into the family
 * name. Never pair these with a fontWeight style.
 */
export const font = {
  display: "Fraunces_600SemiBold",
  displayLight: "Fraunces_400Regular",
  displayItalic: "Fraunces_400Regular_Italic",
  mono: "IBMPlexMono_500Medium",
  monoRegular: "IBMPlexMono_400Regular",
} as const;

/** The mono eyebrow above screen titles — one shared voice everywhere. */
export const kicker = {
  fontFamily: font.mono,
  fontSize: 11,
  letterSpacing: 1.6,
  color: color.primary,
  textTransform: "uppercase",
} as const;

/** Screen title — warm serif, no faux bolding. */
export const screenTitle = {
  fontFamily: font.display,
  fontSize: 30,
  lineHeight: 36,
  color: color.textStrong,
} as const;

/** Dates, timestamps, metadata — the ledger voice. */
export const recordMeta = {
  fontFamily: font.monoRegular,
  fontSize: 11,
  letterSpacing: 0.4,
  color: color.textFaint,
} as const;
