import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { JOURNAL_PROMPTS } from "../../lib/checkin";
import { color, font } from "../../lib/theme";
import { sharedStyles } from "./sharedStyles";

/**
 * Check-in step two: the journal editor. Prompt chips append starter text,
 * the mic button toggles voice dictation, and "Save entry" submits. The
 * dictation session itself (start/stop/merge) is owned by the parent screen.
 */
export function WriteStage({
  text,
  onChangeText,
  recognizing,
  voiceError,
  onToggleDictation,
  onSubmit,
}: {
  text: string;
  onChangeText: (text: string) => void;
  recognizing: boolean;
  voiceError: string | null;
  onToggleDictation: () => void;
  onSubmit: () => void;
}) {
  const canSubmit = text.trim().length > 0 && !recognizing;

  return (
    <>
      <Text style={sharedStyles.h1}>
        Now, let&apos;s journal{"\n"}these thoughts.
      </Text>
      <Text style={sharedStyles.hint}>
        What&apos;s on your mind? Write or speak as little or as much as you
        like.
      </Text>

      <View style={styles.promptChips}>
        {JOURNAL_PROMPTS.map((p) => (
          <Pressable
            key={p}
            onPress={() => onChangeText(text ? `${text} ${p}` : p)}
            style={styles.promptChip}
          >
            <Text style={styles.promptChipText}>{p}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={onChangeText}
          multiline
          autoFocus
          placeholder="Today I…"
          placeholderTextColor="#9aa5a1"
          textAlignVertical="top"
        />
        <Pressable
          onPress={onToggleDictation}
          accessibilityRole="button"
          accessibilityLabel={
            recognizing ? "Stop voice dictation" : "Dictate with your voice"
          }
          style={({ pressed }) => [
            styles.micBtn,
            recognizing && styles.micBtnActive,
            pressed && styles.micPressed,
          ]}
        >
          <Text style={[styles.micIcon, recognizing && styles.micIconActive]}>
            {recognizing ? "■" : "🎤"}
          </Text>
        </Pressable>
      </View>

      {recognizing ? (
        <View style={styles.listeningRow}>
          <ActivityIndicator size="small" color="#2f6f5e" />
          <Text style={styles.listeningText}>
            Listening… tap the square to stop.
          </Text>
        </View>
      ) : (
        <Text style={styles.micHint}>Tap the mic to dictate your entry.</Text>
      )}
      {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}

      <Pressable
        disabled={!canSubmit}
        onPress={onSubmit}
        style={({ pressed }) => [
          sharedStyles.cta,
          !canSubmit && sharedStyles.ctaDisabled,
          pressed && canSubmit && sharedStyles.ctaPressed,
        ]}
      >
        <Text style={sharedStyles.ctaText}>
          {recognizing ? "Listening…" : "Save entry"}
        </Text>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  promptChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  promptChip: {
    backgroundColor: "#eef5f2",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#d4e5de",
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  promptChipText: {
    fontFamily: font.monoRegular,
    fontSize: 11,
    color: color.primary,
  },

  inputWrap: { position: "relative", marginBottom: 8 },
  // The editor is set in the same serif as the brief — your words already
  // look like the document they'll become.
  input: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e7e5",
    minHeight: 180,
    padding: 16,
    paddingBottom: 56,
    fontFamily: font.displayLight,
    fontSize: 17,
    lineHeight: 26,
    color: "#1d2b27",
  },
  micBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eef5f2",
    borderWidth: 1,
    borderColor: "#cfe4dc",
    alignItems: "center",
    justifyContent: "center",
  },
  micBtnActive: { backgroundColor: "#2f6f5e", borderColor: "#2f6f5e" },
  micPressed: { opacity: 0.7 },
  micIcon: { fontSize: 20 },
  micIconActive: { color: "#fff", fontSize: 16, fontWeight: "800" },
  micHint: { fontSize: 13, color: "#7a857f", marginBottom: 8 },
  listeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  listeningText: { fontSize: 13, color: "#2f6f5e", fontWeight: "600" },
  voiceError: { fontSize: 13, color: "#b3261e", marginBottom: 8 },
});
