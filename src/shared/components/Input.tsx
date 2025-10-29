import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from "react-native";

type SharedInputProps = TextInputProps & {
  label: string | null;
  error?: string;
};

export default function Input({
  label,
  error,
  style,
  ...props
}: SharedInputProps) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#C4C4C4"
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
    color: "#333",
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#c4c4c4",
    borderRadius: 8,
    padding: 14,
    fontSize: 12,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#E16235",
  },
  errorText: {
    marginTop: 2,
    fontSize: 12,
    color: "#E16235",
  },
});
