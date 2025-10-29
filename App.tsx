import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import OnboardingNavigation from "./src/modules/onboarding/navigation/OnboardingNavigation";
import AuthNavigator from "./src/modules/auth/navigation/AuthNavigation";
import AppNavigator from "./src/shared/AppNavigator";
import { checkConnection } from "./src/modules/utils/supabase";
import { useOnboardingStore, loadOnboardingState } from "./src/modules/onboarding/store/useOnboardingStore";
import { useAuthStore } from "./src/modules/auth/store/useAuthStore";
import Toast from "react-native-toast-message";

export default function App() {
  const hasOnboarded = useOnboardingStore((state) => state.hasOnboarded);
  const setHasOnboarded = useOnboardingStore((state) => state.setHasOnboarded);

  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialized = useAuthStore((state) => state.initialized);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  const [supabaseConnected, setSupabaseConnected] = React.useState<boolean | null>(null);

  useEffect(() => {
    const load = async () => {
      const onboarded = await loadOnboardingState();
      setHasOnboarded(onboarded ?? false);
      setOnboardingLoaded(true);
    };
    load();
  }, [setHasOnboarded]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!onboardingLoaded || !initialized) {
    return <ActivityIndicator />;
  }

  let content;
  if (!hasOnboarded) {
    content = <OnboardingNavigation onFinish={() => setHasOnboarded(true)} />;
  } else if (!isAuthenticated) {
    content = <AuthNavigator />;
  } else {
    content = <AppNavigator />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>{content}<Toast /></NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}