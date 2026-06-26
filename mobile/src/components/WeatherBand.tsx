import { StyleSheet, Text, View } from "react-native";
import { buildTerrain } from "../lib/weatherTerrain";
import type { Entry } from "../lib/types";

/**
 * "Weather map" — a soft mood-terrain that shows the shape of someone's risk
 * level over time. The silhouette and colours are computed by the pure
 * `buildTerrain` helper (see `src/lib/weatherTerrain.ts`); this component only
 * renders the resulting columns.
 *
 * Purely data-driven: pass the same `entries` the timeline renders. No native
 * gradient/SVG dependency — the curve is built from thin interpolated columns
 * so it runs on the current dev client as-is.
 */

// A soft top-down light overlay: stacked translucent white strips that fade to
// nothing, giving the flat fill some vertical depth like watercolour.
const SHEEN = Array.from({ length: 14 }, (_, i) =>
  Math.max(0, 0.11 * (1 - i / 9)),
);

export function WeatherBand({ entries }: { entries: Entry[] }) {
  const terrain = buildTerrain(entries);

  // Need at least two days to draw a meaningful shape.
  if (!terrain) return null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>The past few weeks</Text>
        <Text style={styles.headerRange}>
          {terrain.startLabel} – {terrain.endLabel}
        </Text>
      </View>

      <View style={styles.plot}>
        {terrain.columns.map((col, i) => (
          <View key={i} style={styles.column}>
            <View
              style={[
                styles.fill,
                {
                  height: `${col.h * 100}%`,
                  backgroundColor: col.color,
                  borderTopColor: col.crest,
                },
              ]}
            />
          </View>
        ))}
        <View pointerEvents="none" style={styles.sheen}>
          {SHEEN.map((opacity, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: `rgba(255,255,255,${opacity})`,
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.labelRow}>
        {terrain.axisLabels.map((label, i) => (
          <Text key={i} style={styles.dateLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceeed",
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLabel: { color: "#52605b", fontSize: 13, fontWeight: "500" },
  headerRange: { color: "#7b8884", fontSize: 11 },
  // The trough the terrain sits in — a faint track so low ridges still read.
  plot: {
    height: 72,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f2f6f4",
    borderRadius: 12,
    overflow: "hidden",
  },
  column: { flex: 1, height: "100%", justifyContent: "flex-end" },
  // borderTop traces a lighter crest line along the wave surface.
  fill: { width: "100%", borderTopWidth: 1.5 },
  sheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "column",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  dateLabel: { color: "#7b8884", fontSize: 10 },
});
