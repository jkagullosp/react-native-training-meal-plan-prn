import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { meal_plan_texts } from "../../../constants/constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function MealPlanHeader() {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>{meal_plan_texts.header.screenName}</Text>
        <Text style={styles.subtitle}>{meal_plan_texts.header.subTitle}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity>
          <Icon name="package" size={22} color="#fff" style={styles.shopIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon
            name="cart-outline"
            size={22}
            color="#fff"
            style={styles.shopIcon}
          />
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
    borderRadius: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
});
