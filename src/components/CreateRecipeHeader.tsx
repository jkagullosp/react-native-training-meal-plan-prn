import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { community_create_texts } from "@/constants/constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { MoveLeft } from 'lucide-react-native';

export default function CreateRecipeHeader({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <TouchableOpacity
          style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          onPress={() => navigation.goBack()}
        >
          {Platform.OS === "ios" ? (
            <Icon name="keyboard-backspace" size={16} color="#E16235" />
          ) : (
              <MoveLeft size={16} color="#E16235" />
          )}
          <Text>Go back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>
          {community_create_texts.header.screenName}
        </Text>
        <Text style={styles.subTitle}>
          {community_create_texts.header.subTitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 10,
  },
  titleColumn: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 12,
    color: "#878787",
  },
  backRow: {
    flexDirection: "row",
    gap: 6,
  },
});
