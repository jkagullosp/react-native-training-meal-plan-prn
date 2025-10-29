import React from "react";
import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { useDiscoverStore } from "../store/useDiscoverStore";

export default function Ingredients({ navigation, route }: any) {
  const { recipeId } = route.params;
  const { recipes, loading } = useDiscoverStore();

  const recipe = recipes.find((r) => r.id === recipeId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading ingredients...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Ingredients not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.orderedListContainer}>
      {recipe.ingredients && recipe.ingredients.length > 0 ? (
        recipe.ingredients.map((ingredient, idx) => (
          <View key={ingredient.id} style={styles.ingredientRow}>
            <Text style={styles.ingredientIndex}>•</Text>
            <Text style={styles.ingredientName}>{ingredient.name}</Text>
            <Text style={styles.ingredientQuantity}>
              ({ingredient.quantity_value})
            </Text>
            <Text style={styles.ingredientQuantity}>
              {ingredient.unit}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noIngredients}>No ingredients listed.</Text>
      )}
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
    fontSize: 14,
    color: "#E16235",
    fontWeight: "bold",
  },
  value: {
    fontSize: 14,
    color: "#5f5f5fff",
  },
  orderedListContainer: {
  },
  listTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#E16235",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ingredientIndex: {
    fontWeight: "bold",
    color: "#E16235",
    marginRight: 8,
    fontSize: 16,
  },
  ingredientName: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  ingredientQuantity: {
    fontSize: 16,
    color: "#888",
  },
  noIngredients: {
    color: "#888",
    fontStyle: "italic",
  },
});
