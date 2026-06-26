import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getWeekDates } from "../../lib/dates";
import type { Entry } from "../../lib/types";
import { sharedStyles } from "./sharedStyles";

/**
 * The Today tab's landing view: week calendar strip, the "Daily Thread" hero
 * card that starts a check-in, an optional gentle reminder banner, and a
 * preview of the most recent entry.
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

  return (
    <>
      <Text style={sharedStyles.pageTitle}>Today</Text>

      {showReminder && (
        <View style={styles.reminderCard}>
          <View style={styles.reminderIconWrap}>
            <Text style={styles.reminderIcon}>🕐</Text>
          </View>
          <View style={styles.reminderText}>
            <Text style={styles.reminderTitle}>You haven't written today</Text>
            <Text style={styles.reminderSub}>
              Taking a moment to check in can make a difference.
            </Text>
          </View>
        </View>
      )}

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

      <View style={styles.divider} />

      <ImageBackground
        source={require("../../../assets/home/daily-thread-bg.jpg")}
        style={styles.threadCard}
        imageStyle={styles.threadCardBg}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel="Daily Thread landscape illustration"
      >
        <View style={styles.threadCardOverlay} pointerEvents="none" />
        <View style={styles.threadCardContent}>
          <Text style={styles.threadTitle}>Daily Thread</Text>
          <Text style={styles.threadSub}>
            A space to reflect, grow and stay aligned.
          </Text>
          <Pressable
            onPress={onStart}
            style={({ pressed }) => [
              styles.startBtn,
              pressed && styles.startBtnPressed,
            ]}
          >
            <Text style={styles.startBtnText}>Start</Text>
          </Pressable>
        </View>
      </ImageBackground>

      {lastEntry && (
        <>
          <Text style={styles.sectionLabel}>RECENT ENTRIES</Text>
          <View style={styles.entryPreviewCard}>
            <View
              style={[
                styles.entryPreviewDot,
                {
                  backgroundColor:
                    lastEntry.riskLevel === "crisis"
                      ? "#b4453a"
                      : lastEntry.riskLevel === "elevated"
                        ? "#e0a13c"
                        : "#7fae9f",
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
  reminderCard: {
    backgroundColor: "#fffbf0",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#fdf2c2",
    padding: 16,
    marginTop: 12,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  reminderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  reminderIcon: { fontSize: 22 },
  reminderText: { flex: 1 },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1d2b27",
    marginBottom: 2,
  },
  reminderSub: { fontSize: 13, color: "#5c6b66", lineHeight: 18 },

  calendarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarCell: { alignItems: "center", flex: 1 },
  calDayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9aa5a1",
    marginBottom: 6,
  },
  calDayLabelActive: { color: "#2f6f5e" },
  calDateCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#eceeed",
    alignItems: "center",
    justifyContent: "center",
  },
  calDateCircleActive: { backgroundColor: "#2f6f5e" },
  calDateText: { fontSize: 13, fontWeight: "500", color: "#52605b" },
  calDateTextActive: { color: "#fff", fontWeight: "700" },

  divider: { height: 1, backgroundColor: "#eceeed", marginBottom: 20 },

  threadCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    minHeight: 360,
    justifyContent: "flex-end",
  },
  threadCardBg: { borderRadius: 20 },
  threadCardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "55%",
    backgroundColor: "rgba(247, 250, 249, 0.55)",
  },
  threadCardContent: {
    padding: 24,
    paddingTop: 160,
    alignItems: "center",
  },
  threadTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1d2b27",
    marginBottom: 6,
    textAlign: "center",
    textShadowColor: "rgba(247, 250, 249, 0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  threadSub: {
    fontSize: 13,
    color: "#52605b",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 260,
    textShadowColor: "rgba(247, 250, 249, 0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  startBtn: {
    backgroundColor: "#2f6f5e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
  },
  startBtnPressed: { backgroundColor: "#255647" },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  sectionLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#9aa5a1",
    letterSpacing: 1,
    marginBottom: 10,
  },
  entryPreviewCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eceeed",
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
  },
  entryPreviewDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  entryPreviewBody: { flex: 1 },
  entryPreviewMeta: { fontSize: 11, color: "#9aa5a1", marginBottom: 4 },
  entryPreviewText: { fontSize: 13, color: "#1d2b27", lineHeight: 18 },
});
