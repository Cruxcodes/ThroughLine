import { StyleSheet } from "react-native";

/** Styles shared by more than one Today-flow stage (headings, hints, CTA). */
export const sharedStyles = StyleSheet.create({
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1d2b27",
    marginBottom: 16,
  },
  h1: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1d2b27",
    lineHeight: 34,
    marginBottom: 8,
  },
  hint: { fontSize: 14, color: "#52605b", lineHeight: 20, marginBottom: 16 },

  cta: {
    backgroundColor: "#2f6f5e",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  ctaDisabled: { backgroundColor: "#dbe5e1" },
  ctaPressed: { backgroundColor: "#255647" },
  ctaText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
