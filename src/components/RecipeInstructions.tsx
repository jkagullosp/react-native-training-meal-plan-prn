import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { useDiscoverStore } from "@/modules/discover/store/useDiscoverStore";

export default function Instructions({ route }: any) {
  const { recipeId } = route.params;
  const { recipes, loading } = useDiscoverStore();

  const recipe = recipes.find((r) => r.id === recipeId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading instructions...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Instructions not available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.instructionsWrapper}>
      {recipe.steps && recipe.steps.length > 0 ? (
        recipe.steps
          .sort((a, b) => a.step_number - b.step_number)
          .map((instruction, idx) => (
            <View key={idx} style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <Text style={styles.stepNumber}>{idx + 1}</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepText}>{instruction.instruction}</Text>
              </View>
            </View>
          ))
      ) : (
        <Text style={styles.noInstructions}>No instructions listed.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  instructionsWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderColor: "#D3D3D3",
    borderWidth: 1,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepHeader: {
    width: 28,
    height: 28,
    backgroundColor: "#E16235",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  stepNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepTextContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  noInstructions: {
    textAlign: "center",
    padding: 16,
    color: "#888",
    fontStyle: "italic",
  },
});
