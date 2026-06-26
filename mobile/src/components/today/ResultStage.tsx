import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ProcessEntryResult, SupportResult } from "../../lib/types";
import { CrisisCard } from "../CrisisCard";
import { GroundingTechniqueCard } from "../GroundingTechniqueCard";
import { TipCard } from "../TipCard";
import { sharedStyles } from "./sharedStyles";

/**
 * Shown after an entry is saved. Crisis entries get the crisis lines and
 * nothing else; otherwise we show the reflection prompt plus the server's
 * support bundle (a tip and an optional grounding technique).
 */
export function ResultStage({
  outcome,
  support,
  showGrounding,
  onToggleGrounding,
  onReset,
}: {
  outcome: ProcessEntryResult;
  support: SupportResult | null;
  showGrounding: boolean;
  onToggleGrounding: (show: boolean) => void;
  onReset: () => void;
}) {
  const isCrisis = outcome.analysis.risk_level === "crisis";

  return (
    <>
      {isCrisis ? (
        <View style={styles.crisisFull}>
          <CrisisCard prominent />
          <Text style={styles.crisisNote}>
            Your entry is saved. Please reach out to one of the lines above —
            they&apos;re there for exactly this.
          </Text>
        </View>
      ) : (
        <>
          <Text style={sharedStyles.h1}>Entry saved</Text>
          {outcome.analysis.next_prompt ? (
            <View style={styles.promptCard}>
              <Text style={styles.promptLabel}>SOMETHING TO SIT WITH</Text>
              <Text style={styles.promptText}>
                {outcome.analysis.next_prompt}
              </Text>
            </View>
          ) : null}
          {support?.tip ? (
            <TipCard tip={support.tip} domain={outcome.analysis.domain} />
          ) : support ? (
            <Text style={styles.supportNote}>
              Couldn&apos;t load a tip right now.
            </Text>
          ) : null}
          {support?.grounding ? (
            showGrounding ? (
              <GroundingTechniqueCard
                grounding={support.grounding}
                onDone={() => onToggleGrounding(false)}
              />
            ) : (
              <Pressable
                onPress={() => onToggleGrounding(true)}
                style={({ pressed }) => [
                  styles.groundingBtn,
                  pressed && styles.groundingBtnPressed,
                ]}
              >
                <Text style={styles.groundingBtnText}>
                  🌀 Want a grounding technique?
                </Text>
              </Pressable>
            )
          ) : null}
        </>
      )}
      <Pressable onPress={onReset} style={styles.secondary}>
        <Text style={styles.secondaryText}>New entry</Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  crisisFull: { gap: 14 },
  crisisNote: { color: "#52605b", fontSize: 14, lineHeight: 20 },

  promptCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceeed",
    padding: 18,
    marginTop: 16,
  },
  promptLabel: {
    color: "#2f6f5e",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  promptText: { fontSize: 17, color: "#1d2b27", lineHeight: 24 },

  supportNote: {
    color: "#7a857f",
    fontSize: 14,
    marginTop: 18,
    fontStyle: "italic",
  },
  groundingBtn: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#cfe4dc",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 16,
  },
  groundingBtnPressed: { backgroundColor: "#eef5f2" },
  groundingBtnText: { color: "#2f6f5e", fontWeight: "700", fontSize: 15 },

  secondary: { alignItems: "center", marginTop: 22, padding: 8 },
  secondaryText: { color: "#2f6f5e", fontWeight: "700", fontSize: 15 },
});
