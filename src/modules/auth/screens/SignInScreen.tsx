import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Image,
} from "react-native";
import Input from "../../../shared/components/Input";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/useAuthStore";
import Toast from "react-native-toast-message";
import { auth_texts } from "../../../constants/constants";
import Button from "../../../shared/components/Button";

export default function SignInScreen({ navigation }: any) {
  // Proper Zustand usage: use selectors for each field
  const signIn = useAuthStore((state) => state.signIn);
  const loading = useAuthStore((state) => state.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Centralized validation
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSignIn = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      Toast.show({
        type: "error",
        text1: "Invalid Email",
        text2: "Please enter a valid email address.",
      });
      return;
    }
    if (!password) {
      setError("Password is required.");
      Toast.show({
        type: "error",
        text1: "Missing Password",
        text2: "Please enter your password.",
      });
      return;
    }
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      Toast.show({ type: "error", text1: "Sign In Error", text2: signInError });
    } else {
      setError(null);
      Toast.show({ type: "success", text1: "Welcome back!" });
    }
  };

  useEffect(() => {
    // Clear error on navigation
    setError(null);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.keyboardAvoidStyle}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../../assets/logos/myIcon.png")}
              style={{ width: 150, height: 150 }}
            />
          </View>
          <View style={styles.panel}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{auth_texts.signIn.title}</Text>
                <Text style={styles.appName}>{auth_texts.signIn.appName}</Text>
              </View>
              <Text style={styles.subtitle}>{auth_texts.signIn.subtitle}</Text>
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
            </View>
            {error && (
              <Text
                style={{
                  color: "#E16235",
                  fontSize: 13,
                  marginVertical: 4,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
            <Button
              title="Sign In"
              onPress={handleSignIn}
              loading={loading}
              disabled={!password || !isValidEmail(email) || loading}
            />
            <View style={styles.toSignIn}>
              <Text style={styles.toSignInText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
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
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  keyboardAvoidStyle: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#E16235",
    position: "relative",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  panel: {
    backgroundColor: "#F7F7F7",
    position: "absolute",
    top: "30%",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 25,
    width: "100%",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
  },
  titleContainer: {
    gap: 5,
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    gap: 6,
  },
  title: {
    fontSize: 26,
    color: "#000000",
    fontWeight: "bold",
  },
  appName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#E16235",
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
  },
  input: {
    margin: 0,
  },
  forgot: {
    textAlign: "right",
    fontSize: 12,
    color: "#E16235",
    fontWeight: "normal",
  },
  toSignIn: {
    marginTop: 5,
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
  },
  toSignInText: {
    fontSize: 12,
    color: "#000",
  },
  signUpText: {
    fontSize: 12,
    color: "#E16235",
  },
});
