import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { CreateRecipeInput } from '@/types/recipe';

export function useAllUsers() {
  return useQuery({
    queryKey: ['allUsers'],
    queryFn: adminService.getAllUsers,
  });
}

export function useFetchAllRecipesNotPending() {
  return useQuery({
    queryKey: ['recipesNotPending'],
    queryFn: adminService.fetchRecipesNotPending,
  });
}

export function useMostFavoritedRecipe() {
  return useQuery({
    queryKey: ['mostFavoritedRecipe'],
    queryFn: adminService.fetchMostFavoritedRecipe,
  });
}

export function useMostLikedRecipe() {
  return useQuery({
    queryKey: ['mostLikedRecipe'],
    queryFn: adminService.fetchMostLikedRecipe,
  });
}

export function useRecipesApprovedLast30Days() {
  return useQuery({
    queryKey: ['recipesApprovedLast30Days'],
    queryFn: adminService.getRecipesApprovedLast30Days,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      durationMs,
    }: {
      userId: string;
      durationMs: number;
    }) => adminService.suspendUser(userId, durationMs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function usePendingRecipes() {
  return useQuery({
    queryKey: ['pendingRecipes'],
    queryFn: adminService.fetchPendingRecipes,
  });
}

export function useApproveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => adminService.approveRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRecipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipesNotPending'] });
    },
  });
}

export function useDisapproveRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => adminService.disapproveRecipe(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRecipes'] });
    },
  });
}

export function useAdminSubmitRecipe(userId: string) {
  return useMutation({
    mutationKey: ['adminSubmitRecipe'],
    mutationFn: (data: CreateRecipeInput) =>
      adminService.submitAdminRecipe(userId, data),
  });
}
