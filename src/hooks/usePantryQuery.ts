import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPantry } from '@/services/shopService';
import { PantryItem } from '@/types/shop';
import { addToPantry } from '@/services/pantryService';
import { pantryApi } from '@/api/pantryApi';

export function useFetchPantryQuery(userId: string) {
  return useQuery<PantryItem[]>({
    queryKey: ['pantry'],
    queryFn: () => fetchPantry(userId),
  });
}

export function useAddToPantryMutation(userId: string, pantry: any[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newIngredient: any) => addToPantry(userId, newIngredient, pantry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
    },
  });
}

export function useDeletePantryItemMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => pantryApi.deletePantryItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry'] });
      queryClient.invalidateQueries({ queryKey: ['shoppingList', userId] });
    },
  });
}