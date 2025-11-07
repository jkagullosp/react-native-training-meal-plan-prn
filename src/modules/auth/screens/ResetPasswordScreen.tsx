import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { supabase } from '../../../client/supabase';
import Toast from 'react-native-toast-message';

export default function ResetPasswordScreen({ navigation }: any) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const updatePassword = async () => {
    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password too short',
        text2: 'Password must be at least 6 characters.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: "Passwords don't match",
        text2: 'Please make sure both passwords are the same.',
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert(
        'Success',
        'Password updated! You can now sign in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => navigation.replace('SignIn'),
          },
        ],
      );
    }
  };

  const isFormValid =
    newPassword.trim().length >= 6 &&
    confirmPassword.trim().length >= 6 &&
    newPassword === confirmPassword;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>
        Enter your new password below. Make sure it's at least 6 characters
        long.
      </Text>

      <View style={styles.inputContainer}>
        <Input
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          label="New Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          label="Confirm Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Button
        title="Update Password"
        onPress={updatePassword}
        loading={loading}
        disabled={!isFormValid || loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F7F7F7',
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
    gap: 12,
  },
});
