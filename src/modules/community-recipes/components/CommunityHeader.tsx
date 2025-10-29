import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { community_recipes_texts } from "../../../constants/constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Plus } from "lucide-react-native";

export default function CommunityHeader({ navigation }: any) {

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>{community_recipes_texts.header.screenName}</Text>
        <Text style={styles.subtitle}>{community_recipes_texts.header.subTitle}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => {
          navigation.navigate("CreateRecipe");
        }}>
          {Platform.OS === "ios"? (
            <Icon
            name="plus"
            size={22}
            color="#fff"
            style={styles.shopIcon}
          />
          ): (
            <View style={styles.iconView}>
              <Plus size={22} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
  },
  titleColumn: {
    flexDirection: "column",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#878787",
  },
  shopIcon: {
    backgroundColor: "#E16235",
    padding: 10,
    borderRadius: 50,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  iconView: {
    padding: 10,
    backgroundColor: "#E16235",
    borderRadius: 8,
  },
});
