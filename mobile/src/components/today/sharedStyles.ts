import { StyleSheet } from "react-native";
import { color, font } from "../../lib/theme";

/** Styles shared by more than one Today-flow stage (headings, hints, CTA). */
export const sharedStyles = StyleSheet.create({
  pageTitle: {
    fontFamily: font.display,
    fontSize: 30,
    lineHeight: 36,
    color: color.textStrong,
    marginBottom: 16,
  },
  h1: {
    fontFamily: font.display,
    fontSize: 27,
    color: color.textStrong,
    lineHeight: 35,
    marginBottom: 8,
  },
  hint: { fontSize: 14, color: color.textMuted, lineHeight: 20, marginBottom: 16 },

  cta: {
    backgroundColor: color.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  ctaDisabled: { backgroundColor: "#dbe5e1" },
  ctaPressed: { backgroundColor: color.primaryPressed },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
