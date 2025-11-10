import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import Input from '@/components/Input';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/modules/auth/store/useAuthStore';
import Toast from 'react-native-toast-message';
import { auth_texts } from '@/constants/constants';
import Button from '@/components/Button';
import { Linking } from 'react-native';
import { supabase } from '@/client/supabase';

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const forgotPassword = useAuthStore(state => state.forgotPassword);
  const loading = useAuthStore(state => state.loading);

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log('Received deep link:', url);

      try {
        // Parse URL manually for React Native compatibility
        const [baseUrl, queryAndHash] = url.split('?');

        if (!queryAndHash) return;

        // Separate query string and hash
        const [queryString, hashString] = queryAndHash.split('#');

        // Parse query parameters
        const queryParams: Record<string, string> = {};
        if (queryString) {
          queryString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
              queryParams[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
        }

        // Parse hash parameters
        const hashParams: Record<string, string> = {};
        if (hashString) {
          hashString.split('&').forEach(param => {
            const [key, value] = param.split('=');
            if (key && value) {
              hashParams[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
        }

        const accessToken =
          queryParams['access_token'] || hashParams['access_token'];
        const refreshToken =
          queryParams['refresh_token'] || hashParams['refresh_token'];
        const type = queryParams['type'] || hashParams['type'];

        console.log('Link type:', type);
        console.log('Has access token:', !!accessToken);

        if (accessToken && refreshToken && type === 'recovery') {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!error) {
            console.log('Session set successfully');
            navigation.replace('ResetPassword');
          } else {
            console.error('Session error:', error);
            Toast.show({
              type: 'error',
              text1: 'Authentication Failed',
              text2: 'Please try requesting a new reset link.',
            });
          }
        } else if (queryParams['code']) {
          const { error } = await supabase.auth.exchangeCodeForSession(
            queryParams['code'],
          );
          if (!error) {
            navigation.replace('ResetPassword');
          } else {
            console.error('Code exchange error:', error);
            Toast.show({
              type: 'error',
              text1: 'Authentication Failed',
              text2: 'Please try requesting a new reset link.',
            });
          }
        }
      } catch (err) {
        console.error('Deep link handling error:', err);
        Toast.show({
          type: 'error',
          text1: 'Link Error',
          text2: 'Failed to process the reset link.',
        });
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [navigation]);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Email Required',
        text2: 'Please enter your email address.',
      });
      return;
    }

    const { error } = await forgotPassword(email.trim());

    if (error) {
      Toast.show({
        type: 'error',
        text1: 'Cannot send reset link',
        text2: error,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Check your email',
        text2: 'We sent you a password reset link.',
        visibilityTime: 4000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image source={require('@assets/logos/AppLogo.png')} />
          </View>
          <View style={styles.panel}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>
                  {auth_texts.forgotPassword.title}
                </Text>
                <Text style={styles.appName}>
                  {auth_texts.forgotPassword.appName}
                </Text>
              </View>
              <Text style={styles.subtitle}>
                {auth_texts.forgotPassword.subtitle}
              </Text>
            </View>
            <View style={styles.input}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
            <Button
              title="Send Reset Link"
              onPress={handleForgotPassword}
              loading={loading}
              disabled={!email.trim() || loading}
            />
            <View style={styles.toSignIn}>
              <Text style={styles.toSignInText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  keyboardAvoidStyle: { flex: 1 },
  content: { flex: 1, backgroundColor: '#E16235', position: 'relative' },
  logoContainer: { alignItems: 'center', marginTop: 85 },
  panel: {
    backgroundColor: '#F7F7F7',
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 25,
    width: '100%',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
  },
  titleContainer: { gap: 5, marginBottom: 20 },
  titleRow: { flexDirection: 'row', gap: 6 },
  title: { fontSize: 26, color: '#000000', fontWeight: 'bold' },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#E16235' },
  subtitle: { fontSize: 14, color: '#777777' },
  input: { margin: 0, marginBottom: 16 },
  toSignIn: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  toSignInText: { fontSize: 12, color: '#000' },
  signUpText: { fontSize: 12, color: '#E16235' },
});
