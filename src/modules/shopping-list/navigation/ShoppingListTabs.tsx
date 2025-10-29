import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ShoppingListScreen from "../screens/ShoppingListScreen";
import PantryScreen from "../screens/PantryScreen";

const Tab = createMaterialTopTabNavigator();

export default function ShoppingListTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#E16235",
        tabBarIndicatorStyle: { backgroundColor: "#E16235" },
        tabBarLabelStyle: { fontWeight: "bold" },
        tabBarStyle: { backgroundColor: "#F7F7F7" },
      }}
    >
      <Tab.Screen name="Shopping List" component={ShoppingListScreen} />
      <Tab.Screen name="Pantry" component={PantryScreen} />
    </Tab.Navigator>
  );
}