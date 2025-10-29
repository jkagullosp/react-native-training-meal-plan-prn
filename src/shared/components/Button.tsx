import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function Button({ title, onPress, loading, disabled, style, textStyle }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled ? styles.buttonDisabled : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#9f9f9fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#E16235",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});