import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // You can log error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: 'red', fontSize: 18 },
});
