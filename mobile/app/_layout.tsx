import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { useState } from "react";
import { StyleSheet, type ColorValue } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { font } from "../src/lib/theme";
import { Onboarding } from "../src/components/Onboarding";
import { UniversityPicker } from "../src/components/UniversityPicker";
import {
  hasCompletedOnboarding,
  hasSelectedUniversity,
  markOnboardingComplete,
} from "../src/services/storage";

const ACTIVE = "#2f6f5e";
const INACTIVE = "#9aa5a1";

// Each tab's icon maps to its meaning: Today = the day's entry, Timeline = time,
// Brief = a document, Support = a warm, reassuring heart. Outline when inactive,
// filled when focused, tinted by the active/inactive colors.
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];
const TAB_ICON: Record<string, { active: IoniconName; inactive: IoniconName }> =
  {
    index: { active: "today", inactive: "today-outline" },
    timeline: { active: "time", inactive: "time-outline" },
    brief: { active: "document-text", inactive: "document-text-outline" },
    support: { active: "heart", inactive: "heart-outline" },
  };

function tabIcon(name: keyof typeof TAB_ICON) {
  return ({
    color,
    size,
    focused,
  }: {
    color: ColorValue;
    size: number;
    focused: boolean;
  }) => (
    <Ionicons
      name={focused ? TAB_ICON[name].active : TAB_ICON[name].inactive}
      size={size}
      color={color}
    />
  );
}

export default function RootLayout() {
  // Fonts are bundled locally, so this resolves in a frame — no splash needed.
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppGate />
    </SafeAreaProvider>
  );
}

// First-run flow: onboarding → pick university → tabs. Each step shows once and
// never again once its flag is set. Early returns keep the gating flat.
function AppGate() {
  // Storage is synchronous (expo-sqlite), so flags are known on first render —
  // no loading flash.
  // TODO: re-enable onboarding persistence. While disabled, onboarding shows on
  // every launch (handy during dev). To restore "show once", swap the line below
  // back to `useState(hasCompletedOnboarding)` and uncomment markOnboardingComplete().
  // const [onboarded, setOnboarded] = useState(hasCompletedOnboarding);
  const [onboarded, setOnboarded] = useState(false);
  const [pickedUniversity, setPickedUniversity] = useState(
    hasSelectedUniversity,
  );

  function finishOnboarding() {
    // TODO: re-enable to lock in onboarding so it never shows again.
    // markOnboardingComplete();
    setOnboarded(true);
  }

  if (!onboarded) {
    return <Onboarding onDone={finishOnboarding} />;
  }

  if (!pickedUniversity) {
    return <UniversityPicker onDone={() => setPickedUniversity(true)} />;
  }

  return <MainTabs />;
}

function MainTabs() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: ACTIVE,
          tabBarInactiveTintColor: INACTIVE,
          // White bar with a hairline top border (DESIGN.md §4) — flat, calm,
          // depth from the hairline rather than a shadow.
          tabBarStyle: {
            backgroundColor: "#ffffff",
            borderTopColor: "#eceeed",
            borderTopWidth: StyleSheet.hairlineWidth,
            elevation: 0,
          },
          // The record voice carries into the tab bar — mono, tracked out.
          tabBarLabelStyle: {
            fontFamily: font.mono,
            fontSize: 10,
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Today", tabBarIcon: tabIcon("index") }}
        />
        <Tabs.Screen
          name="timeline"
          options={{ title: "Timeline", tabBarIcon: tabIcon("timeline") }}
        />
        <Tabs.Screen
          name="brief"
          options={{ title: "Brief", tabBarIcon: tabIcon("brief") }}
        />
        <Tabs.Screen
          name="support"
          options={{ title: "Support", tabBarIcon: tabIcon("support") }}
        />
      </Tabs>
      <Toast />
    </>
  );
}
