import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import React from "react";
import { meal_plan_texts } from "../../../constants/constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ShoppingCart } from "lucide-react-native";

type RootTabParamList = {
  Discover: undefined;
  "Meal Plan": undefined;
  "Shopping List": undefined;
  Pantry: undefined;
  Community: undefined;
  Profile: undefined;
};

export default function MealPlanHeader({ }: any) {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleColumn}>
        <Text style={styles.title}>{meal_plan_texts.header.screenName}</Text>
        <Text style={styles.subtitle}>{meal_plan_texts.header.subTitle}</Text>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={() => navigation.navigate("Shopping List")}>
          {Platform.OS === "ios" ? (
            <Icon
            name="cart-outline"
            size={22}
            color="#fff"
            style={styles.shopIcon}
          />
          ): (
            <View style={styles.iconView}>
              <ShoppingCart size={22} color="#fff" />
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
    borderRadius: 8,
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
