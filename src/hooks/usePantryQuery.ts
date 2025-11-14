import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchPantry } from '@/services/shopService';
import { PantryItem } from '@/types/shop';

export function useFetchPantryQuery(userId: string) {
  return useQuery<PantryItem[]>({
    queryKey: ['pantry'],
    queryFn: () => fetchPantry(userId),
  });
}
