import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

type SharedInputProps = TextInputProps & {
  label: string | null;
  error?: string;
  inputAccessibilityLabel?: string;
  accessibilityHint?: string;
};

export default function Input({
  label,
  error,
  style,
  inputAccessibilityLabel,
  accessibilityHint,
  ...props
}: SharedInputProps) {
  const computedLabel =
    inputAccessibilityLabel ?? label ?? props.placeholder ?? '';

  return (
    <View style={styles.container} accessible accessibilityRole="none">
      {label ? (
        <Text style={styles.label} accessibilityRole="text">
          {label}
        </Text>
      ) : null}

      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#C4C4C4"
        accessible
        accessibilityLabel={computedLabel}
        accessibilityHint={accessibilityHint}
        importantForAccessibility="yes"
        {...props}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#c4c4c4',
    borderRadius: 8,
    padding: 14,
    fontSize: 12,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#E16235',
  },
  errorText: {
    marginTop: 2,
    fontSize: 12,
    color: '#E16235',
  },
});
