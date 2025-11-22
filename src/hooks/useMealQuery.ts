import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  fetchMealHistory,
  fetchMealPlans,
  addMealPlan,
  removeMealPlan,
  markMealDone,
  removeIngredientsForRecipe,
} from '@/services/mealService';

export function useMealQuery(userId: string) {
  return useQuery({
    queryKey: ['meals'],
    queryFn: () => fetchMealPlans(userId),
    enabled: !!userId,
  });
}

export function useAddMealPlan() {
  return useMutation({
    mutationFn: addMealPlan,
  });
}

export function useRemoveMealPlan() {
  return useMutation({
    mutationFn: removeMealPlan,
  });
}

export function useMealHistory(userId: string) {
  return useQuery({
    queryKey: ['history'],
    queryFn: () => fetchMealHistory(userId),
    enabled: !!userId,
  });
}

export function useMarkMealPLan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMealDone,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['history', variables.userId] });
    },
  });
}

export function useRemoveIngredientsForRecipe(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      recipeId,
      mealDate,
      mealType,
    }: { recipeId: string; mealDate: string; mealType: string }) =>
      removeIngredientsForRecipe({ userId, recipeId, mealDate, mealType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
    },
  });
}
