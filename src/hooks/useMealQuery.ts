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
  return useMutation({
    mutationFn: markMealDone,
  });
}

export function useRemoveIngredientsForRecipe(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ recipeId }: { recipeId: string }) =>
      removeIngredientsForRecipe({ userId, recipeId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
    },
  });
}
