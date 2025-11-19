import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OnboardingNavigation from './src/navigation/OnboardingNavigation';
import AuthNavigator from './src/navigation/stacks/AuthStack';
import AppNavigator from './src/navigation/AppNavigator';
import {
  useOnboardingStore,
  loadOnboardingState,
} from './src/stores/useOnboardingStore';
//import { useAuthStore } from './src/modules/auth/store/useAuthStore';
import Toast from 'react-native-toast-message';
import { testFirebaseInit } from './src/utils/firebaseHelper';
import {
  initNotificationChannel,
  requestAndSaveFcmToken,
  requestNotificationPermission,
  registerForegroundMessageHandler,
} from './src/utils/notificationChannel';
import messaging from '@react-native-firebase/messaging';
import { useAuthStore } from './src/stores/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminNavigator from '@/navigation/AdminNavigator';

export default function App() {
  const hasOnboarded = useOnboardingStore(state => state.hasOnboarded);
  const setHasOnboarded = useOnboardingStore(state => state.setHasOnboarded);

  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  // const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  // const initialized = useAuthStore(state => state.initialized);
  //const fetchProfile = useAuthStore(state => state.fetchProfile);

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
    if (__DEV__) {
      testFirebaseInit().catch(e => console.error('Firebase init error:', e));
    }
    initNotificationChannel().catch(e =>
      console.error('Notification channel init error: ', e),
    );

    registerForegroundMessageHandler();

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📬 Background message:', remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('📬 Notification caused app to open:', remoteMessage);
        }
      });
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
        } else {
          console.log('Notification permission denied');
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
