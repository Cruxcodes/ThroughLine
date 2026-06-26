import { Pressable, StyleSheet, Text, View } from "react-native";
import { EMOTIONS, MOODS } from "../../lib/checkin";
import { formatTodayLong } from "../../lib/dates";
import { sharedStyles } from "./sharedStyles";

/**
 * Check-in step one: pick a mood on the five-point scale and (optionally) any
 * number of emotions. "Continue" stays disabled until a mood is selected.
 */
export function MoodStage({
  selectedMoodIdx,
  selectedEmotions,
  onSelectMood,
  onToggleEmotion,
  onContinue,
}: {
  selectedMoodIdx: number | null;
  selectedEmotions: string[];
  onSelectMood: (index: number) => void;
  onToggleEmotion: (label: string) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <Text style={sharedStyles.pageTitle}>{formatTodayLong()}</Text>
      <Text style={styles.pageSubtitle}>How are you doing today?</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mood</Text>
        <Text style={styles.cardHint}>How are you feeling today?</Text>
        <View style={styles.moodRow}>
          {MOODS.map((mood, i) => (
            <Pressable
              key={mood.label}
              onPress={() => onSelectMood(i)}
              style={styles.moodItem}
            >
              <View
                style={[
                  styles.moodCircle,
                  { backgroundColor: mood.color },
                  selectedMoodIdx === i && styles.moodCircleSelected,
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              </View>
              <Text
                style={[
                  styles.moodLabel,
                  selectedMoodIdx === i && styles.moodLabelActive,
                ]}
              >
                {mood.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Emotions</Text>
        <Text style={styles.cardHint}>
          What are you feeling? Pick all that apply.
        </Text>
        <View style={styles.emotionGrid}>
          {EMOTIONS.map((em) => {
            const active = selectedEmotions.includes(em.label);
            return (
              <Pressable
                key={em.label}
                onPress={() => onToggleEmotion(em.label)}
                style={styles.emotionItem}
              >
                <View
                  style={[
                    styles.emotionCircle,
                    active && styles.emotionCircleActive,
                  ]}
                >
                  <Text style={styles.emotionEmoji}>{em.emoji}</Text>
                </View>
                <Text
                  style={[
                    styles.emotionLabel,
                    active && styles.emotionLabelActive,
                  ]}
                >
                  {em.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={onContinue}
        disabled={selectedMoodIdx === null}
        style={({ pressed }) => [
          sharedStyles.cta,
          selectedMoodIdx === null && sharedStyles.ctaDisabled,
          pressed && selectedMoodIdx !== null && sharedStyles.ctaPressed,
        ]}
      >
        <Text style={sharedStyles.ctaText}>Continue</Text>
      </Pressable>
      {selectedMoodIdx === null && (
        <Text style={sharedStyles.hint}>
          Select at least one mood to continue
        </Text>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pageSubtitle: { fontSize: 14, color: "#52605b", marginBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eceeed",
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1d2b27",
    marginBottom: 4,
  },
  cardHint: { fontSize: 12, color: "#9aa5a1", marginBottom: 16 },

  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodItem: { alignItems: "center", flex: 1 },
  moodCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  moodCircleSelected: { borderWidth: 3, borderColor: "#1d2b27" },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 10, color: "#9aa5a1", textAlign: "center" },
  moodLabelActive: { color: "#1d2b27", fontWeight: "600" },

  emotionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  emotionItem: { alignItems: "center", width: "22%" },
  emotionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#eef5f2",
    borderWidth: 1.5,
    borderColor: "#d4e5de",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  emotionCircleActive: { backgroundColor: "#2f6f5e", borderColor: "#2f6f5e" },
  emotionEmoji: { fontSize: 24 },
  emotionLabel: { fontSize: 10, color: "#9aa5a1", textAlign: "center" },
  emotionLabelActive: { color: "#2f6f5e", fontWeight: "600" },
});
