import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { copyContact } from "../lib/clipboard";
import type { University } from "../lib/types";

/** One tappable contact row — tapping copies the value to the clipboard. */
function ContactLine({
  icon,
  label,
  value,
  copyValue,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
  copyValue: string;
}) {
  return (
    <Pressable
      onPress={() => copyContact(copyValue, `${label} copied`)}
      style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Copy ${label}: ${value}`}
    >
      <View style={styles.contactIconWrap}>
        <Ionicons name={icon} size={16} color="#2f6f5e" />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Ionicons name="copy-outline" size={16} color="#9aa5a1" />
    </Pressable>
  );
}

/**
 * The user's chosen university mental-health service: name, then a contact
 * line per available channel (phone/email when present, website always).
 */
export function UniversityCard({ university }: { university: University }) {
  return (
    <View style={styles.uniCard}>
      <View style={styles.uniHeader}>
        <View style={styles.uniIconWrap}>
          <Ionicons name="school-outline" size={18} color="#2f6f5e" />
        </View>
        <View style={styles.uniHeaderText}>
          <Text style={styles.uniTag}>YOUR UNIVERSITY</Text>
          <Text style={styles.uniName}>{university.name}</Text>
          <Text style={styles.uniService}>{university.serviceName}</Text>
        </View>
      </View>

      <View style={styles.contacts}>
        {university.phone ? (
          <ContactLine
            icon="call-outline"
            label="Phone"
            value={university.phone}
            copyValue={university.phone}
          />
        ) : null}
        {university.email ? (
          <ContactLine
            icon="mail-outline"
            label="Email"
            value={university.email}
            copyValue={university.email}
          />
        ) : null}
        <ContactLine
          icon="globe-outline"
          label="Website"
          value={university.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          copyValue={university.url}
        />
      </View>

      {university.notes ? (
        <Text style={styles.uniNotes}>{university.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  uniCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d4e5de",
    overflow: "hidden",
  },
  uniHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    padding: 18,
    paddingBottom: 14,
    backgroundColor: "#eef5f2",
  },
  uniIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#d4e8de",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  uniHeaderText: { flex: 1 },
  uniTag: {
    color: "#2f6f5e",
    fontWeight: "700",
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 2,
  },
  uniName: { fontSize: 17, fontWeight: "800", color: "#1d2b27" },
  uniService: { fontSize: 13, color: "#52605b", marginTop: 2 },

  contacts: {
    backgroundColor: "#ffffff",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#eceeed",
  },
  pressed: { backgroundColor: "#f4faf7" },
  contactIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#eef5f2",
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: { flex: 1 },
  contactLabel: {
    fontSize: 12,
    color: "#7b8884",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  contactValue: {
    fontSize: 15,
    color: "#1d2b27",
    fontWeight: "600",
    marginTop: 1,
  },
  uniNotes: {
    fontSize: 13,
    color: "#5c6b66",
    lineHeight: 19,
    padding: 16,
    paddingTop: 12,
  },
});
