import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/auth.store';
import Toast from 'react-native-toast-message';
import { auth_texts } from '../../../constants/constants';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { authService } from '../../../services/authService';

export default function SignUpScreen({ navigation }: any) {
  const { signUp, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isFormValid =
    authService.isValidEmail(email) &&
    authService.isValidPassword(password) &&
    displayName.trim().length >= 4 &&
    authService.isValidUsername(username);

  const handleSignUp = async () => {
    setError(null);

    const { error: signUpError } = await signUp(
      email,
      password,
      displayName,
      username,
    );

    if (signUpError) {
      setError(signUpError);
      Toast.show({
        type: 'error',
        text1: 'Sign Up Error',
        text2: signUpError,
      });
    } else {
      Toast.show({
        type: 'success',
        text1: 'Sign Up Successful!',
        text2: 'Please sign in to continue.',
      });
      navigation.navigate('SignIn');
    }
  };

  useEffect(() => {
    setError(null);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoidStyle}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@assets/logos/myIcon.png')}
              style={{ width: 150, height: 150 }}
            />
          </View>
          <View style={styles.panel}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{auth_texts.signUp.title}</Text>
                <Text style={styles.appName}>{auth_texts.signUp.appName}</Text>
              </View>
              <Text style={styles.subtitle}>{auth_texts.signUp.subtitle}</Text>
            </View>
            <View style={styles.input}>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                label="Email"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                label="Password"
                secureTextEntry
              />
              <Input
                placeholder="Enter your display name"
                value={displayName}
                onChangeText={setDisplayName}
                label="Display Name"
              />
              <Input
                placeholder="@"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                label="Username"
              />
            </View>
            {error && (
              <Text
                style={{
                  color: '#E16235',
                  fontSize: 13,
                  marginVertical: 4,
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            )}
            <Button
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              disabled={!isFormValid || loading}
            />
            <View style={styles.toSignIn}>
              <Text style={styles.toSignInText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signUpText}>Sign In.</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  keyboardAvoidStyle: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#E16235',
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
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
  titleContainer: {
    gap: 5,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    fontSize: 26,
    color: '#000000',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E16235',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
  },
  input: {
    margin: 0,
  },
  forgot: {
    textAlign: 'right',
    fontSize: 12,
    color: '#E16235',
    fontWeight: 'normal',
  },
  toSignIn: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  toSignInText: {
    fontSize: 12,
    color: '#000',
  },
  signUpText: {
    fontSize: 12,
    color: '#E16235',
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  usernamePrefix: {
    fontSize: 16,
    color: '#888',
    marginRight: 4,
    marginTop: 22,
  },
});
