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
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from '@tanstack/react-query';
import AdminNavigator from '@/navigation/AdminNavigator';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import NetInfo from '@react-native-community/netinfo';
import { setupQueryPersistence } from '@/utils/offlinePersistor';
import {
  startMutationQueue,
  registerMutationHandler,
} from '@/hooks/mutationQueue';
import { adminService } from '@/services/adminService';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (failureCount: number) => {
        const base = 1000;
        const capped = Math.min(base * 2 ** (failureCount - 1), 30_000);
        const jitter = Math.floor(Math.random() * 300);
        return capped + jitter;
      },
      staleTime: 1000 * 60,
    },
    mutations: {
      retry: 2,
      retryDelay: (failureCount: number) => {
        const base = 1000;
        return Math.min(base * 2 ** (failureCount - 1), 30_000);
      },
    },
  },
});

setupQueryPersistence(queryClient);

registerMutationHandler('approveRecipe', async ({ recipeId }) =>
  adminService.approveRecipe(recipeId),
);
startMutationQueue(queryClient);

export default function App() {
  const hasOnboarded = useOnboardingStore(state => state.hasOnboarded);
  const setHasOnboarded = useOnboardingStore(state => state.setHasOnboarded);
  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const { initialized, initializeAuth, isAuthenticated, user } = useAuthStore();

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

  // NetInfo -> react-query onlineManager integration for offline support / refetch-on-reconnect
  useEffect(() => {
    // set initial online state
    NetInfo.fetch().then(state =>
      onlineManager.setOnline(
        Boolean(state.isConnected && state.isInternetReachable),
      ),
    );

    // subscribe to connectivity changes
    const unsubscribe = NetInfo.addEventListener(state => {
      onlineManager.setOnline(
        Boolean(state.isConnected && state.isInternetReachable),
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

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
          <ErrorBoundary>
            <NavigationContainer>
              {content}
              <Toast />
            </NavigationContainer>
          </ErrorBoundary>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
