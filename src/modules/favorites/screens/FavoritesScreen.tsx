import React from "react";
import {
  Text,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen({ }: any) {
  return (
    <SafeAreaView>
      <KeyboardAvoidingView>
        <ScrollView>
          <Text>Favorites Screen</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
