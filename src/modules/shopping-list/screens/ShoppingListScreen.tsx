import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useShoppingListStore } from "../store/useShoppingListStore";
import { ShoppingListItem } from "../types/shoppingListTypes";
import Toast from "react-native-toast-message";

interface GroupedRecipe {
  recipeId: string;
  mealType: string;
  items: ShoppingListItem[];
}

export default function ShoppingListScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const {
    shoppingList,
    loading,
    mealPlanMap,
    recipeMap,
    fetchShoppingList,
    markAsChecked,
    addMissingIngredients,
  } = useShoppingListStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      if (user?.id) {
        await addMissingIngredients(user.id);
        await fetchShoppingList(user.id);
      }
    };
    loadAll();
  }, [user?.id, addMissingIngredients, fetchShoppingList]);

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await fetchShoppingList(user.id);
    setRefreshing(false);
  };

  const grouped = shoppingList.reduce<Record<string, GroupedRecipe>>(
    (acc, item) => {
      const mealPlan = mealPlanMap[item.meal_plan_id];
      const key = `${item.recipe_id}_${mealPlan?.meal_type ?? ""}`;
      acc[key] = acc[key] || {
        recipeId: item.recipe_id,
        mealType: mealPlan?.meal_type ?? "",
        items: [],
      };
      acc[key].items.push(item);
      return acc;
    },
    {}
  );

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        {loading && <ActivityIndicator size="small" color="#9f9f9fff" />}
        {!loading && shoppingList.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your shopping list is empty!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("Meal Plan")}
            >
              <Text style={{ color: "#fff" }}>Add to Meal Plan</Text>
            </TouchableOpacity>
          </View>
        )}
        {Object.values(grouped).map(({ recipeId, mealType, items }) => (
          <View key={`${recipeId}_${mealType}`} style={styles.recipeGroup}>
            <Text style={styles.groupHeader}>
              {recipeMap[recipeId]?.title || "Recipe"} ({mealType})
            </Text>
            {items.map((item) => {
              const mealPlan = mealPlanMap[item.meal_plan_id];
              return (
                <View key={item.id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.is_checked && styles.checkboxChecked,
                    ]}
                    onPress={async () => {
                      await markAsChecked(item, !item.is_checked);
                      Toast.show({
                        type: "success",
                        text1: `Marked "${item.ingredient_name}" as ${
                          item.is_checked ? "unchecked" : "checked ✅"
                        }`,
                      });
                    }}
                  >
                    {item.is_checked && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <View>
                    <Text
                      style={[
                        styles.ingredientText,
                        item.is_checked && styles.ingredientChecked,
                      ]}
                    >
                      {item.ingredient_name}
                      {item.quantity
                        ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})`
                        : ""}
                    </Text>
                    <Text style={styles.metaText}>
                      {mealPlan
                        ? `${mealPlan.meal_type ?? ""} • ${mealPlan.meal_date ?? ""}`
                        : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: {
    flex: 1,
    flexDirection: "column",
    gap: 16,
    padding: 16,
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  groupHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#000",
  },
  recipeGroup: {
    marginBottom: 18,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E16235",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#E16235",
  },
  checkmark: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  ingredientText: {
    fontSize: 16,
    color: "#e16235",
  },
  ingredientChecked: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  metaText: {
    fontSize: 13,
    color: "#888",
  },
  emptyContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 100,
    gap: 12,
  },
  button: {
    fontSize: 12,
    padding: 12,
    backgroundColor: "#E16235",
    borderRadius: 8,
    color: "#fff",
  },
});