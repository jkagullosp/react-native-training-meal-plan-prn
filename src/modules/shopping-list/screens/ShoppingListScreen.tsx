import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { ShoppingListItem } from '../types/shoppingListTypes';
import Toast from 'react-native-toast-message';
import {
  useShoppingListQuery,
  useMealPlansAndRecipesQuery,
  useMarkAsCheckedMutation,
  useAddMissingIngredientsMutation,
} from '@/hooks/useShopQuery';

interface GroupedRecipe {
  recipeId: string;
  mealType: string;
  items: ShoppingListItem[];
}

export default function ShoppingListScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: shoppingList = [],
    refetch: refetchShoppingList,
    isLoading: loading,
  } = useShoppingListQuery(user?.id ?? '');
  const { data: mealPlansAndRecipes } = useMealPlansAndRecipesQuery(
    user?.id ?? '',
  );

  const mealPlanMap = mealPlansAndRecipes?.mealPlanMap ?? {};
  const recipeMap = mealPlansAndRecipes?.recipeMap ?? {};

  // NEW: Use the mutations
  const addMissingIngredientsMutation = useAddMissingIngredientsMutation(
    user?.id ?? '',
  );
  const markAsCheckedMutation = useMarkAsCheckedMutation(user?.id ?? '');

  useEffect(() => {
    const loadAll = async () => {
      if (user?.id) {
        addMissingIngredientsMutation.mutate();
        await refetchShoppingList();
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const onRefresh = async () => {
    if (!user?.id) return;
    setRefreshing(true);
    // refetch shopping list here
    await refetchShoppingList();
    setRefreshing(false);
  };

  const grouped = (shoppingList ?? []).reduce<Record<string, GroupedRecipe>>(
    (acc, item) => {
      const mealPlan = mealPlanMap[item.meal_plan_id];
      // Use meal_plan_id as the key!
      const key = item.meal_plan_id;
      acc[key] = acc[key] || {
        recipeId: item.recipe_id,
        mealType: mealPlan?.meal_type ?? '',
        mealDate: mealPlan?.meal_date ?? '',
        items: [],
      };
      acc[key].items.push(item);
      return acc;
    },
    {},
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
        {!loading && shoppingList?.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your shopping list is empty!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Meal Plan')}
            >
              <Text style={{ color: '#fff' }}>Add to Meal Plan</Text>
            </TouchableOpacity>
          </View>
        )}
        {Object.values(grouped).map(({ recipeId, mealType, items }) => (
          <View key={`${recipeId}_${mealType}`} style={styles.recipeGroup}>
            <Text style={styles.groupHeader}>
              {recipeMap[recipeId]?.title || 'Recipe'} ({mealType})
            </Text>
            {items.map(item => {
              const mealPlan = mealPlanMap[item.meal_plan_id];
              return (
                <View key={item.id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.is_checked && styles.checkboxChecked,
                    ]}
                    onPress={async () => {
                      markAsCheckedMutation.mutate({
                        item,
                        checked: !item.is_checked,
                      });
                      Toast.show({
                        type: 'success',
                        text1: `Marked "${item.ingredient_name}" as ${
                          item.is_checked ? 'unchecked' : 'checked ✅'
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
                        ? ` (${item.quantity}${
                            item.unit ? ` ${item.unit}` : ''
                          })`
                        : ''}
                    </Text>
                    <Text style={styles.metaText}>
                      {mealPlan
                        ? `${mealPlan.meal_type ?? ''} • ${
                            mealPlan.meal_date ?? ''
                          }`
                        : ''}
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
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  groupHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
  },
  recipeGroup: {
    marginBottom: 18,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E16235',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#E16235',
  },
  checkmark: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ingredientText: {
    fontSize: 16,
    color: '#e16235',
  },
  ingredientChecked: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  metaText: {
    fontSize: 13,
    color: '#888',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 100,
    gap: 12,
  },
  button: {
    fontSize: 12,
    padding: 12,
    backgroundColor: '#E16235',
    borderRadius: 8,
    color: '#fff',
  },
});
