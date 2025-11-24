import {
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import {
  fetchRecipes,
  fetchTags,
  fetchRecipeAuthor,
  submitRating,
  fetchUserPendingRecipe,
  submitRecipe,
  fetchApprovedUserRecipes,
  fetchRecipesPaginated,
} from '../services/recipeService';
import { CreateRecipeInput } from '@/types/recipe';
import { FullRecipe } from '@/types/recipe';

export function useInfiniteRecipes(pageSize: number) {
  return useInfiniteQuery<FullRecipe[], Error>({
    queryKey: ['recipesInfinite', pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchRecipesPaginated(pageParam as number, pageSize),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // If lastPage has less than pageSize items, no more pages
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
  });
}

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
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['submitRecipe'],
    mutationFn: (data: CreateRecipeInput) => submitRecipe(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRecipes', userId] });
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useApprovedUserRecipes(userId: string) {
  return useQuery({
    queryKey: ['userRecipes', userId],
    queryFn: () => fetchApprovedUserRecipes(userId),
    enabled: !!userId,
  });
}
