import type { Entry, RiskLevel } from "./types";

/**
 * Pure terrain math for the Timeline "weather map" (see WeatherBand). Each
 * entry is a control-point at its real date position; both colour AND height
 * are blended between points, so calm reads as a low green ridge and rough
 * patches swell into taller amber / clay-red peaks. A box-blur pass melts the
 * stepped samples into smooth wave slopes.
 *
 * Everything here is deterministic and free of React/native imports, so it can
 * be unit-tested on its own.
 */

const RISK_COLOR: Record<RiskLevel, string> = {
  none: "#7fae9f",
  elevated: "#e0a13c",
  crisis: "#c25b4e",
};

// How much vertical "weight" each risk level carries. Calm still has presence
// so the ridge never collapses to nothing; rough patches rise above it.
const RISK_HEIGHT: Record<RiskLevel, number> = {
  none: 0.34,
  elevated: 0.72,
  crisis: 1,
};

// More columns = finer silhouette. High count + a blur pass turns the stepped
// terrain into smooth wave slopes.
const COLUMNS = 140;
// Blur window (in columns) applied to height + colour. Wider = gentler waves.
const SMOOTH_RADIUS = 12;
const SMOOTH_PASSES = 2;

// How far each column's crest line is lightened towards white.
const CREST_LIGHTEN = 0.45;

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type RGB = { r: number; g: number; b: number };

const WHITE: RGB = { r: 255, g: 255, b: 255 };

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbStr({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function mix(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(lerp(a.r, b.r, t)),
    g: Math.round(lerp(a.g, b.g, t)),
    b: Math.round(lerp(a.b, b.b, t)),
  };
}

// Parse an ISO date (YYYY-MM-DD) as UTC midnight so day boundaries don't drift
// with the device timezone.
function parseDate(d: string): number {
  return Date.parse(`${d}T00:00:00Z`);
}

function fmt(ms: number): string {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

type Point = { t: number; rgb: RGB; h: number };
type Sample = { rgb: RGB; h: number };

/** Colour + height at normalised position p (0..1) along the timeline. */
function sampleAt(p: number, points: Point[]): Sample {
  const first = points[0];
  const last = points[points.length - 1];
  if (points.length === 1 || p <= first.t)
    return { rgb: first.rgb, h: first.h };
  if (p >= last.t) return { rgb: last.rgb, h: last.h };
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (p >= a.t && p <= b.t) {
      const span = b.t - a.t;
      const local = span === 0 ? 0 : (p - a.t) / span;
      return { rgb: mix(a.rgb, b.rgb, local), h: lerp(a.h, b.h, local) };
    }
  }
  return { rgb: last.rgb, h: last.h };
}

/** Box blur with clamped edges. Repeated passes approximate a gaussian. */
function smooth(values: number[], radius: number, passes: number): number[] {
  let out = values;
  for (let pass = 0; pass < passes; pass++) {
    const src = out;
    const n = src.length;
    const next = new Array<number>(n);
    for (let i = 0; i < n; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i - radius; j <= i + radius; j++) {
        const k = j < 0 ? 0 : j >= n ? n - 1 : j;
        sum += src[k];
        count++;
      }
      next[i] = sum / count;
    }
    out = next;
  }
  return out;
}

/** One renderable terrain column: height fraction + ready-to-use colours. */
export interface TerrainColumn {
  /** 0..1 fraction of the plot height. */
  h: number;
  /** CSS rgb() fill for the column. */
  color: string;
  /** Lighter crest-line colour traced along the wave surface. */
  crest: string;
}

export interface Terrain {
  columns: TerrainColumn[];
  /** Formatted range ends, e.g. "15 May". */
  startLabel: string;
  endLabel: string;
  /** Four evenly-spaced date labels for the x-axis. */
  axisLabels: string[];
}

/**
 * Build the smoothed terrain from journal entries, or null when there are
 * fewer than two distinct dated entries (not enough to draw a shape).
 */
export function buildTerrain(entries: Entry[]): Terrain | null {
  const days = entries
    .map((e) => ({ ms: parseDate(e.date), risk: e.riskLevel ?? "none" }))
    .filter((e) => !Number.isNaN(e.ms))
    .sort((a, b) => a.ms - b.ms);

  if (days.length < 2) return null;

  const startMs = days[0].ms;
  const endMs = days[days.length - 1].ms;
  const range = endMs - startMs;

  const points: Point[] = days.map((d) => ({
    t: range === 0 ? 0.5 : (d.ms - startMs) / range,
    rgb: hexToRgb(RISK_COLOR[d.risk]),
    h: RISK_HEIGHT[d.risk],
  }));

  const raw = Array.from({ length: COLUMNS }, (_, i) =>
    sampleAt(i / (COLUMNS - 1), points),
  );

  // Smooth height + each colour channel independently so the stepped terrain
  // melts into continuous wave slopes.
  const sm = (pick: (s: Sample) => number) =>
    smooth(raw.map(pick), SMOOTH_RADIUS, SMOOTH_PASSES);
  const heights = sm((s) => s.h);
  const reds = sm((s) => s.rgb.r);
  const greens = sm((s) => s.rgb.g);
  const blues = sm((s) => s.rgb.b);

  const columns = raw.map((_, i) => {
    const rgb: RGB = {
      r: Math.round(reds[i]),
      g: Math.round(greens[i]),
      b: Math.round(blues[i]),
    };
    return {
      h: heights[i],
      color: rgbStr(rgb),
      crest: rgbStr(mix(rgb, WHITE, CREST_LIGHTEN)),
    };
  });

  return {
    columns,
    startLabel: fmt(startMs),
    endLabel: fmt(endMs),
    axisLabels: [0, 1 / 3, 2 / 3, 1].map((f) => fmt(startMs + range * f)),
  };
}
