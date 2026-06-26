import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CrisisCard } from "../src/components/CrisisCard";
import { UniversityCard } from "../src/components/UniversityCard";
import { getUniversity } from "../src/services/storage";

export default function SupportScreen() {
  const university = getUniversity();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.kicker}>SUPPORT</Text>
            <Text style={styles.h1}>You can reach{"\n"}out any time</Text>
          </View>
          <View style={styles.heroIcon}>
            <Ionicons name="heart" size={28} color="#2f6f5e" />
          </View>
        </View>
        <Text style={styles.sub}>
          These lines are always here — you never need a reason{" "}
          <Text style={styles.subEmphasis}>&ldquo;serious enough&rdquo;</Text>{" "}
          to use them.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CRISIS LINES</Text>
          <CrisisCard prominent />
        </View>

        {university ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>UNIVERSITY SUPPORT</Text>
            <UniversityCard university={university} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7faf9" },
  screen: { flex: 1, backgroundColor: "#f7faf9" },
  content: { padding: 20, paddingBottom: 48 },

  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#eef5f2",
    borderWidth: 1,
    borderColor: "#d4e5de",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  kicker: {
    color: "#2f6f5e",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  h1: { fontSize: 28, fontWeight: "800", color: "#1d2b27", lineHeight: 34 },
  sub: { fontSize: 15, color: "#52605b", lineHeight: 22, marginBottom: 6 },
  subEmphasis: { fontStyle: "italic", color: "#2f6f5e" },

  section: { marginTop: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9aa5a1",
    letterSpacing: 1,
    marginBottom: 10,
  },
});
