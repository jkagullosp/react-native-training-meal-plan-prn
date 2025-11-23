import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => profileService.fetchUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUserTotalLikes(userId: string) {
  return useQuery({
    queryKey: ['userTotalLikes', userId],
    queryFn: () => profileService.fetchUserTotalLikes(userId),
    enabled: !!userId,
  });
}

export function useUserFavoriteIds(userId: string) {
  return useQuery({
    queryKey: ['userFavoriteIds', userId],
    queryFn: () => profileService.fetchUserFavoriteIds(userId),
    enabled: !!userId,
  });
}

export function useFavoriteRecipes(recipeIds: string[]) {
  return useQuery({
    queryKey: ['favoriteRecipes', recipeIds],
    queryFn: () => profileService.fetchFavoriteRecipes(recipeIds),
    enabled: !!recipeIds.length,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, recipeId }: { userId: string; recipeId: string }) =>
      profileService.addFavorite(userId, recipeId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userFavoriteIds', userId] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, recipeId }: { userId: string; recipeId: string }) =>
      profileService.removeFavorite(userId, recipeId),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['userFavoriteIds', userId] });
    },
  });
}
