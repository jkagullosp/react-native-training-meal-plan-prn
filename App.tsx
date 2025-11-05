import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import OnboardingNavigation from './src/modules/onboarding/navigation/OnboardingNavigation';
import AuthNavigator from './src/modules/auth/navigation/AuthNavigation';
import AppNavigator from './src/shared/AppNavigator';
import { checkConnection } from './src/modules/utils/supabase';
import {
  useOnboardingStore,
  loadOnboardingState,
} from './src/modules/onboarding/store/useOnboardingStore';
import { useAuthStore } from './src/modules/auth/store/useAuthStore';
import Toast from 'react-native-toast-message';
import { testFirebaseInit } from './src/utils/firebaseHelper';
import {
  initNotificationChannel,
  requestAndSaveFcmToken,
  requestNotificationPermission,
  registerForegroundMessageHandler
} from './src/utils/notificationChannel';
import messaging from '@react-native-firebase/messaging';

export default function App() {
  const hasOnboarded = useOnboardingStore(state => state.hasOnboarded);
  const setHasOnboarded = useOnboardingStore(state => state.setHasOnboarded);

  const [onboardingLoaded, setOnboardingLoaded] = useState(false);

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const initialized = useAuthStore(state => state.initialized);
  const fetchProfile = useAuthStore(state => state.fetchProfile);

  const user = useAuthStore(s => s.user);

  const [supabaseConnected, setSupabaseConnected] = React.useState<
    boolean | null
  >(null);

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

    // 🆕 Register foreground message handler
    registerForegroundMessageHandler();

    // 🆕 Handle background/quit state notifications
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('📬 Background message:', remoteMessage);
      // Notification is automatically displayed by FCM
    });

    // 🆕 Handle notification when app is opened from quit state
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
      // request permission, get token and save to Supabase for this user
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
        <NavigationContainer>
          {content}
          <Toast />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
