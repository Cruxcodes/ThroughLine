import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { GroundingActivity } from "../src/components/GroundingActivity";
import { HomeStage } from "../src/components/today/HomeStage";
import { MoodStage } from "../src/components/today/MoodStage";
import { ResultStage } from "../src/components/today/ResultStage";
import { WriteStage } from "../src/components/today/WriteStage";
import { sharedStyles } from "../src/components/today/sharedStyles";
import { useEntries } from "../src/hooks/useEntries";
import { useVoiceInput } from "../src/hooks/useVoiceInput";
import { MOODS } from "../src/lib/checkin";
import {
  classifyDomainApi,
  fetchSupportApi,
  processEntryApi,
} from "../src/services/api";
import {
  markMHSuggestionShown,
  markReminderShown,
  shouldShowMHSuggestion,
  shouldShowReminder,
} from "../src/services/storage";
import type {
  Entry,
  ProcessEntryResult,
  SupportResult,
} from "../src/lib/types";

/**
 * The Today tab walks one check-in at a time through these stages:
 * home → mood → (grounding, for rough moods) → write → submitting → result.
 * This screen owns the stage state and the submit pipeline; each stage's UI
 * lives in `src/components/today/`.
 */
type Stage = "home" | "mood" | "grounding" | "write" | "submitting" | "result";

const CRISIS_ENTRIES_BEFORE_SUGGESTION = 3;

export default function TodayScreen() {
  const { entries, add } = useEntries();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("home");
  const [selectedMoodIdx, setSelectedMoodIdx] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [outcome, setOutcome] = useState<ProcessEntryResult | null>(null);
  const [support, setSupport] = useState<SupportResult | null>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const dictationBaseRef = useRef("");
  const {
    recognizing,
    error: voiceError,
    start: startVoice,
    stop: stopVoice,
  } = useVoiceInput((transcript) => {
    const base = dictationBaseRef.current;
    setText(base ? `${base} ${transcript}` : transcript);
  });

  function toggleDictation() {
    if (recognizing) {
      stopVoice();
      return;
    }
    dictationBaseRef.current = text.trim();
    startVoice();
  }

  function toggleEmotion(label: string) {
    setSelectedEmotions((prev) =>
      prev.includes(label) ? prev.filter((e) => e !== label) : [...prev, label],
    );
  }

  function confirmMood() {
    if (selectedMoodIdx === null) return;
    setStage(MOODS[selectedMoodIdx].grounding ? "grounding" : "write");
  }

  // Step one stage back. Typed text is preserved; only reset() clears it.
  function goBack() {
    if (recognizing) stopVoice();
    if (stage === "mood") setStage("home");
    else if (stage === "grounding") setStage("mood");
    else if (stage === "write") {
      const cameFromGrounding =
        selectedMoodIdx !== null && MOODS[selectedMoodIdx].grounding;
      setStage(cameFromGrounding ? "grounding" : "mood");
    }
  }

  async function submit() {
    if (text.trim().length === 0) return;
    if (recognizing) stopVoice();
    setStage("submitting");

    // Classify + reflect in parallel, then store the tagged entry.
    const knownStressors = Array.from(
      new Set(
        entries
          .map((e) => e.stressor)
          .filter((s): s is string => !!s && s.trim().length > 0),
      ),
    ).map((label) => ({ label, domain: "general" as const }));
    const [domain, result] = await Promise.all([
      classifyDomainApi(text.trim()),
      processEntryApi(entries, text.trim(), knownStressors),
    ]);

    const now = Date.now();
    const entry: Entry = {
      id: String(now),
      date: new Date().toISOString().slice(0, 10),
      promptShown: "What's on your mind?",
      text: text.trim(),
      riskLevel: result.analysis.risk_level,
      themes: result.analysis.themes,
      domain,
      stressor: result.analysis.related_stressor?.label,
      createdAt: now,
    };
    add(entry);

    setOutcome(result);
    if (result.analysis.risk_level !== "crisis") {
      setSupport(await fetchSupportApi(domain, result.analysis.risk_level));
    }

    maybeSuggestMentalHealthSupport([...entries, entry]);
    setStage("result");
  }

  // After repeated crisis entries, gently point at the Support tab — once ever.
  function maybeSuggestMentalHealthSupport(allEntries: Entry[]) {
    const crisisCount = allEntries.filter(
      (e) => e.riskLevel === "crisis",
    ).length;
    if (
      crisisCount < CRISIS_ENTRIES_BEFORE_SUGGESTION ||
      !shouldShowMHSuggestion()
    )
      return;
    markMHSuggestionShown();
    setTimeout(() => {
      Toast.show({
        type: "info",
        text1: "You're not alone",
        text2: "Consider reaching out to your mental health support team.",
        position: "bottom",
        bottomOffset: 80,
        onPress: () => {
          router.push("/support");
          Toast.hide();
        },
      });
    }, 500);
  }

  function reset() {
    if (recognizing) stopVoice();
    setText("");
    setOutcome(null);
    setSupport(null);
    setShowGrounding(false);
    setSelectedMoodIdx(null);
    setSelectedEmotions([]);
    setStage("home");
  }

  // Check for in-app reminder each time the Today tab regains focus:
  // show a gentle banner if it's been >24h since the last entry AND >24h since
  // we last reminded them. Mark the reminder so we don't nag again today.
  useFocusEffect(
    useCallback(() => {
      if (shouldShowReminder()) {
        setShowReminder(true);
        markReminderShown();
      } else {
        setShowReminder(false);
      }
    }, []),
  );

  const lastEntry = entries[entries.length - 1] ?? null;
  const showBack =
    stage === "mood" || stage === "grounding" || stage === "write";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safe}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        {showBack && (
          <Pressable
            onPress={goBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backPressed,
            ]}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </Pressable>
        )}

        {stage === "home" && (
          <HomeStage
            showReminder={showReminder}
            lastEntry={lastEntry}
            onStart={() => setStage("mood")}
          />
        )}

        {stage === "mood" && (
          <MoodStage
            selectedMoodIdx={selectedMoodIdx}
            selectedEmotions={selectedEmotions}
            onSelectMood={setSelectedMoodIdx}
            onToggleEmotion={toggleEmotion}
            onContinue={confirmMood}
          />
        )}

        {stage === "grounding" && (
          <GroundingActivity
            onReady={() => setStage("write")}
            onSkip={() => setStage("write")}
          />
        )}

        {stage === "write" && (
          <WriteStage
            text={text}
            onChangeText={setText}
            recognizing={recognizing}
            voiceError={voiceError}
            onToggleDictation={toggleDictation}
            onSubmit={submit}
          />
        )}

        {stage === "submitting" && (
          <View style={styles.loading}>
            <ActivityIndicator color="#2f6f5e" />
            <Text style={sharedStyles.hint}>Saving and reflecting…</Text>
          </View>
        )}

        {stage === "result" && outcome && (
          <ResultStage
            outcome={outcome}
            support={support}
            showGrounding={showGrounding}
            onToggleGrounding={setShowGrounding}
            onReset={reset}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f7faf9" },
  screen: { flex: 1, backgroundColor: "#f7faf9" },
  content: { padding: 20, paddingBottom: 48 },
  loading: { alignItems: "center", marginTop: 40, gap: 12 },

  backBtn: { alignSelf: "flex-start", marginBottom: 10, paddingVertical: 2 },
  backPressed: { opacity: 0.6 },
  backText: { color: "#2f6f5e", fontWeight: "700", fontSize: 15 },
});
