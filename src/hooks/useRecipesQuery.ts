import { useQuery } from '@tanstack/react-query';
import {
  fetchRecipes,
  fetchTags,
  fetchRecipeAuthor,
} from '../services/recipeService';

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
  });
}

export function useAuthorQuery(authorId: string) {
  return useQuery({
    queryKey: ['author'],
    queryFn: () => fetchRecipeAuthor(authorId),
    enabled: !!authorId,
  });
}
