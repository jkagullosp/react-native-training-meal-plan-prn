import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OnboardingNavigation from '@/navigation/OnboardingNavigation';
import AuthNavigator from '@/navigation/stacks/AuthStack';
import AppNavigator from '@/navigation/AppNavigator';
import {
  useOnboardingStore,
  loadOnboardingState,
} from '@/stores/onboarding.store';
import Toast from 'react-native-toast-message';
import {
  initNotificationChannel,
  requestAndSaveFcmToken,
  requestNotificationPermission,
  registerForegroundMessageHandler,
} from '@/utils/notificationChannel';
import { useAuthStore } from '@/stores/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminNavigator from '@/navigation/AdminNavigator';

export default function App() {
  const hasOnboarded = useOnboardingStore(state => state.hasOnboarded);
  const setHasOnboarded = useOnboardingStore(state => state.setHasOnboarded);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const { initialized, initializeAuth, isAuthenticated, user } = useAuthStore();
  const queryClient = new QueryClient();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const load = async () => {
      const onboarded = await loadOnboardingState();
      setHasOnboarded(onboarded ?? false);
      setOnboardingLoaded(true);
    };
    load();
  }, [setHasOnboarded]);

  useEffect(() => {
    initNotificationChannel().catch(e =>
      console.error('Notification channel init error: ', e),
    );

    registerForegroundMessageHandler();
  }, []);

  useEffect(() => {
    if (user?.id) {
      requestAndSaveFcmToken(user.id).catch(e =>
        console.error('save token err:', e),
      );
      (async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
          await requestAndSaveFcmToken(user.id).catch(e =>
            console.error('save token err:', e),
          );
        }
      })();
    }
  }, [user?.id]);

  if (!onboardingLoaded || !initialized) {
    return <ActivityIndicator />;
  }

  let content;
  if (!hasOnboarded) {
    content = <OnboardingNavigation onFinish={() => setHasOnboarded(true)} />;
  } else if (!isAuthenticated) {
    content = <AuthNavigator />;
  } else if (user?.is_admin) {
    content = <AdminNavigator />;
  } else {
    content = <AppNavigator />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NavigationContainer>
            {content}
            <Toast />
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
