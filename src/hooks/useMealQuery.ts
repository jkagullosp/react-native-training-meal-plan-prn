import { useQuery, useMutation } from '@tanstack/react-query';
import {
  fetchMealHistory,
  fetchMealPlans,
  addMealPlan,
} from '@/services/mealService';

export function useMealQuery(userId: string) {
  return useQuery({
    queryKey: ['meals'],
    queryFn: () => fetchMealPlans(userId),
    enabled: !!userId,
  });
}

export function useMealHistory(userId: string) {
  return useQuery({
    queryKey: ['history'],
    queryFn: () => fetchMealHistory(userId),
    enabled: !!userId,
  });
}

export function useAddMealPlan() {
  return useMutation({
    mutationFn: addMealPlan,
  });
}
