import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchShoppingListFilter,
  addMissingIngredients,
  fetchMealPlansAndRecipes,
  markAsChecked,
  removeMealPlanAndShoppingList
} from '@/services/shopService';
import { MealPlan, Recipe } from '@/types/shop';
import { ShoppingListItem } from '@/types/shop';

type MealPlansAndRecipesResult = {
  mealPlanMap: Record<string, MealPlan>;
  recipeMap: Record<string, Recipe>;
};

export function useShoppingListQuery(userId: string) {
  return useQuery<ShoppingListItem[]>({
    queryKey: ['shoppingList', userId],
    queryFn: () => fetchShoppingListFilter(userId),
    enabled: !!userId,
  });
}

export function useMealPlansAndRecipesQuery(userId: string) {
  return useQuery<MealPlansAndRecipesResult>({
    queryKey: ['mealPlansAndRecipes', userId],
    queryFn: () => fetchMealPlansAndRecipes(userId),
    enabled: !!userId,
  });
}

export function useAddMissingIngredientsMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => addMissingIngredients(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
      queryClient.invalidateQueries({
        queryKey: ['mealPlansAndRecipes', userId],
      });
    },
  });
}

export function useMarkAsCheckedMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      item,
      checked,
    }: {
      item: ShoppingListItem;
      checked: boolean;
    }) => markAsChecked(item, checked),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
      queryClient.invalidateQueries({
        queryKey: ['mealPlansAndRecipes', userId],
      });
    },
  });
}

export function useRemoveMealPlanAndShoppingListMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mealPlanId: string) => removeMealPlanAndShoppingList(mealPlanId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
      queryClient.invalidateQueries({ queryKey: ['mealPlansAndRecipes', userId] });
      queryClient.invalidateQueries({ queryKey: ['meals', userId] });
    },
  });
}