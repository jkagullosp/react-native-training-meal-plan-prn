import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communityService } from '@/services/communityService';

export function useAuthor(authorId?: string) {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: () => communityService.getAuthor(authorId!),
    enabled: !!authorId,
  });
}

export function useRecipeLikes(recipeId?: string) {
  return useQuery({
    queryKey: ['recipeLikes', recipeId],
    queryFn: () => communityService.getRecipeLikes(recipeId!),
    enabled: !!recipeId,
  });
}

export function useLikeRecipe(recipeId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => communityService.likeRecipe(userId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeLikes', recipeId] });
    },
  });
}

export function useUnlikeRecipe(recipeId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => communityService.unlikeRecipe(userId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipeLikes', recipeId] });
    },
  });
}