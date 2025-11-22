import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import {
  fetchRecipes,
  fetchTags,
  fetchRecipeAuthor,
  submitRating,
  fetchUserPendingRecipe,
  submitRecipe,
  fetchUserRecipes,
} from '../services/recipeService';
import { CreateRecipeInput } from '@/types/recipe';

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

export function useSubmitRecipeRating() {
  return useMutation({
    mutationFn: submitRating,
  });
}

export function useUserPendingRecipes(userId: string) {
  return useQuery({
    queryKey: ['userPendingRecipes'],
    queryFn: () => fetchUserPendingRecipe(userId),
    enabled: !!userId,
  });
}

export function useSubmitRecipe(userId: string) {
  return useMutation({
    mutationKey: ['submitRecipe'],
    mutationFn: (data: CreateRecipeInput) => submitRecipe(userId, data),
  });
}

export function useUserRecipe(userId: string) {
  return useQuery({
    queryKey: ['userRecipes'],
    queryFn: () => fetchUserRecipes(userId),
  });
}
