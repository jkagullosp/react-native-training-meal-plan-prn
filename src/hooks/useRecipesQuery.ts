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
      return lastPage.length === pageSize ? allPages.length + 1 : undefined;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecipesQuery() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
    staleTime: 1000 * 60 * 2,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitRating,
    onMutate: async (vars: {
      userId: string;
      recipeId: string;
      rating: number;
    }) => {
      const { recipeId, rating } = vars;
      await queryClient.cancelQueries({ queryKey: ['recipes'] });

      const previous = queryClient.getQueryData<FullRecipe[] | undefined>([
        'recipes',
      ]);

      if (previous) {
        queryClient.setQueryData<FullRecipe[]>(
          ['recipes'],
          previous.map(r => {
            if (r.id !== recipeId) return r;
            const count = r.rating_count ?? 0;
            const avg = r.avg_rating ?? 0;
            const newCount = count + 1;
            const newAvg =
              Math.round(((avg * count + rating) / newCount) * 10) / 10;
            return { ...r, rating_count: newCount, avg_rating: newAvg };
          }),
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['recipes'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipesInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['userRecipes'] });
    },
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
    staleTime: 1000 * 60 * 2,
  });
}
