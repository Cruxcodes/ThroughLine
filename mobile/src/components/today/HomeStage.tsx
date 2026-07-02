import { Pressable, StyleSheet, Text, View } from "react-native";
import { getTodayParts, getWeekDates } from "../../lib/dates";
import { color, font } from "../../lib/theme";
import type { Entry } from "../../lib/types";

/**
 * The Today tab's landing view. The hero is typographic: today's date set
 * huge in serif on a deep-sage panel — the date is the product (contemporaneous,
 * dated evidence), so it gets the front page. Below it: the week strip, an
 * optional gentle reminder, and a preview of the most recent entry.
 */
export function HomeStage({
  showReminder,
  lastEntry,
  onStart,
}: {
  showReminder: boolean;
  lastEntry: Entry | null;
  onStart: () => void;
}) {
  const weekDates = getWeekDates();
  const today = getTodayParts();

  return (
    <>
      <View style={styles.calendarRow}>
        {weekDates.map((d, i) => (
          <View key={i} style={styles.calendarCell}>
            <Text
              style={[
                styles.calDayLabel,
                d.isToday && styles.calDayLabelActive,
              ]}
            >
              {d.label}
            </Text>
            <View
              style={[
                styles.calDateCircle,
                d.isToday && styles.calDateCircleActive,
              ]}
            >
              <Text
                style={[
                  styles.calDateText,
                  d.isToday && styles.calDateTextActive,
                ]}
              >
                {d.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {showReminder && (
        <View style={styles.reminderCard}>
          <View style={styles.reminderText}>
            <Text style={styles.reminderTitle}>You haven't written today</Text>
            <Text style={styles.reminderSub}>
              Taking a moment to check in can make a difference.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.heroPanel}>
        <Text style={styles.heroEyebrow}>{today.weekday} · today's page</Text>
        <Text style={styles.heroDate}>{today.dayMonth}</Text>
        <Text style={styles.heroSub}>
          Written today, in your words.{"\n"}It stays on your device.
        </Text>
        <Pressable
          onPress={onStart}
          accessibilityRole="button"
          accessibilityLabel="Start today's entry"
          style={({ pressed }) => [
            styles.startBtn,
            pressed && styles.startBtnPressed,
          ]}
        >
          <Text style={styles.startBtnText}>Start today's entry</Text>
        </Pressable>
      </View>

      {lastEntry && (
        <>
          <Text style={styles.sectionLabel}>LAST ENTRY</Text>
          <View style={styles.entryPreviewCard}>
            <View
              style={[
                styles.entryPreviewDot,
                {
                  backgroundColor:
                    lastEntry.riskLevel === "crisis"
                      ? color.riskCrisis
                      : lastEntry.riskLevel === "elevated"
                        ? color.riskElevated
                        : color.riskNone,
                },
              ]}
            />
            <View style={styles.entryPreviewBody}>
              <Text style={styles.entryPreviewMeta}>
                {lastEntry.date}
                {lastEntry.stressor ? `  ·  ${lastEntry.stressor}` : ""}
              </Text>
              <Text style={styles.entryPreviewText} numberOfLines={2}>
                {lastEntry.text}
              </Text>
            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 22,
  },
  calendarCell: { alignItems: "center", flex: 1 },
  calDayLabel: {
    fontFamily: font.monoRegular,
    fontSize: 10,
    color: color.placeholder,
    marginBottom: 6,
  },
  calDayLabelActive: { color: color.primary, fontFamily: font.mono },
  calDateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  calDateCircleActive: { backgroundColor: color.primary },
  calDateText: {
    fontFamily: font.monoRegular,
    fontSize: 13,
    color: color.textMuted,
  },
  calDateTextActive: { color: "#fff", fontFamily: font.mono },

  reminderCard: {
    backgroundColor: "#fffbf0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fdf2c2",
    padding: 16,
    marginBottom: 18,
  },
  reminderText: { flex: 1 },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: color.textStrong,
    marginBottom: 2,
  },
  reminderSub: { fontSize: 13, color: "#5c6b66", lineHeight: 18 },

  heroPanel: {
    backgroundColor: color.primary,
    borderRadius: 20,
    padding: 26,
    paddingTop: 30,
    marginBottom: 26,
  },
  heroEyebrow: {
    fontFamily: font.mono,
    fontSize: 11,
    letterSpacing: 1.6,
    color: "#bfe0d6",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heroDate: {
    fontFamily: font.display,
    fontSize: 52,
    lineHeight: 58,
    color: "#f7faf9",
    marginBottom: 12,
  },
  heroSub: {
    fontFamily: font.displayItalic,
    fontSize: 15,
    lineHeight: 22,
    color: "#d4e5de",
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: "#f7faf9",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  startBtnPressed: { backgroundColor: "#e0ece8" },
  startBtnText: { color: color.primaryPressed, fontWeight: "700", fontSize: 16 },

  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 10,
    color: color.placeholder,
    letterSpacing: 1.4,
    marginBottom: 10,
  },
  entryPreviewCard: {
    backgroundColor: color.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: color.hairline,
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
  },
  entryPreviewDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  entryPreviewBody: { flex: 1 },
  entryPreviewMeta: {
    fontFamily: font.monoRegular,
    fontSize: 11,
    color: color.placeholder,
    marginBottom: 4,
  },
  entryPreviewText: {
    fontFamily: font.displayLight,
    fontSize: 14,
    color: color.textStrong,
    lineHeight: 21,
  },
});
