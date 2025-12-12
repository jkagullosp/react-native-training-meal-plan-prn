import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';

type ButtonProps = {
  title: string;
  onPress: (e?: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
};

export default function Button({
  title,
  onPress,
  loading,
  disabled,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      style={[styles.button, disabled ? styles.buttonDisabled : null, style]}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator accessibilityLabel="Loading" color="#9f9f9fff" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E16235',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
