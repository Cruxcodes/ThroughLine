/**
 * Static content for the Today check-in flow: the mood scale, the emotion
 * grid, and the journal prompt chips. Pure data — no component logic.
 */

export interface Mood {
  label: string;
  emoji: string;
  color: string;
  /** Rough moods route through the breathing exercise before writing. */
  grounding: boolean;
}

export const MOODS: readonly Mood[] = [
  { label: "Terrible", emoji: "😞", color: "#b4453a", grounding: true },
  { label: "Bad", emoji: "😕", color: "#e0a13c", grounding: true },
  { label: "Okay", emoji: "😐", color: "#b6c766", grounding: false },
  { label: "Good", emoji: "🙂", color: "#7fae9f", grounding: false },
  { label: "Awesome", emoji: "😄", color: "#2f6f5e", grounding: false },
] as const;

export interface Emotion {
  label: string;
  emoji: string;
}

export const EMOTIONS: readonly Emotion[] = [
  { label: "Tired", emoji: "😴" },
  { label: "Content", emoji: "😌" },
  { label: "Grateful", emoji: "🥹" },
  { label: "Not sure", emoji: "😶" },
  { label: "Motivated", emoji: "💪" },
  { label: "Anxious", emoji: "😰" },
  { label: "Relaxed", emoji: "😮‍💨" },
  { label: "Stressed", emoji: "😤" },
  { label: "Lonely", emoji: "🫂" },
  { label: "Sad", emoji: "😢" },
  { label: "Hopeful", emoji: "🌱" },
  { label: "Overwhelmed", emoji: "🌊" },
];

export const JOURNAL_PROMPTS = [
  "What happened today?",
  "What's worrying me?",
  "Grateful for…",
];
