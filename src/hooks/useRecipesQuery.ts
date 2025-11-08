import { useQuery } from '@tanstack/react-query';
import { fetchRecipes, fetchTags } from '../services/recipeService';

export function useRecipesQuery() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });
}

export function useFetchTagsQuery() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  })
}
