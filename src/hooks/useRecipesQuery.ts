import { useQuery } from '@tanstack/react-query';
import { fetchRecipes } from '../services/recipeService';

export function useRecipesQuery() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });
}
