import { View, Text, StyleSheet } from "react-native";
import { FullMealPlan } from "../types/mealPlanTypes";
import { useDiscoverStore } from "../../discover/store/useDiscoverStore";

type Props = {
  mealPlans: FullMealPlan[];
};

export default function DailyNutrition({ mealPlans }: Props) {
  const { loading } = useDiscoverStore();

  const total = mealPlans.reduce(
    (acc, plan) => {
      acc.calories += plan.recipe?.calories || 0;
      acc.protein += plan.recipe?.protein || 0;
      acc.carbs += plan.recipe?.carbs || 0;
      acc.fat += plan.recipe?.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (loading) {
    return (
      <View>
        <Text>Loading nutrition...</Text>
      </View>
    );
  }

  if (!mealPlans || mealPlans.length === 0) {
    return (
      <View style={styles.noMealPlanned}>
        <Text style={styles.emptyText}>No meal plans available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Text style={styles.type}>{total.calories}Cal</Text>
        <Text style={styles.value}>Calories</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{total.protein}g</Text>
        <Text style={styles.value}>Protein</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{total.carbs}g</Text>
        <Text style={styles.value}>Carbs</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.type}>{total.fat}g</Text>
        <Text style={styles.value}>Fats</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  noMealPlanned: {
     alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 12,
  },
});
