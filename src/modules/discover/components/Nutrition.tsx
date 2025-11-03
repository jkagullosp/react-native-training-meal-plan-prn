import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useDiscoverStore } from "../store/useDiscoverStore";

export default function Nutrition({ route }: any) {
  const { recipeId } = route.params;
  const { recipes, loading } = useDiscoverStore();

  const recipe = recipes.find((r) => r.id === recipeId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading nutrition...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Nutrition not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.type}>{recipe.calories}Cal</Text>
        <Text style={styles.value}>Calories</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{recipe.protein}g</Text>
        <Text style={styles.value}>Protein</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{recipe.carbs}g</Text>
        <Text style={styles.value}>Carbs</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{recipe.fat}g</Text>
        <Text style={styles.value}>Fats</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#EDEDED",
    padding: 12,
    borderRadius: 16,
    justifyContent: "space-around",
  },
  stat: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  type: {
    fontSize: 16,
    color: "#E16235",
    fontWeight: "bold",
  },
  value: {
    fontSize: 14,
    color: "#5f5f5fff",
  },
});
