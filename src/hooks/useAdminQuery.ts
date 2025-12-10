import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';
import { CreateRecipeInput } from '@/types/recipe';
import NetInfo from '@react-native-community/netinfo';
import { enqueueMutation } from '@/hooks/mutationQueue';
import Toast from 'react-native-toast-message';

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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => adminService.approveRecipe(recipeId),
    onMutate: async (recipeId: string) => {
      await qc.cancelQueries({ queryKey: ['pendingRecipes'] });
      const previous = qc.getQueryData<unknown[]>(['pendingRecipes']);
      qc.setQueryData(['pendingRecipes'], (old: any[] | undefined) =>
        (old ?? []).filter(r => r.id !== recipeId),
      );
      return { previous };
    },
    onError: async (_err, recipeId, context: any) => {
      try {
        const net = await NetInfo.fetch();
        if (!net.isConnected) {
          await enqueueMutation('approveRecipe', { recipeId });
          Toast.show({
            type: 'info',
            text1: 'Queued',
            text2: 'Approve will sync when online',
          });
          return;
        }
      } catch (error) {
        console.log('Error', error);
      }

      if (context?.previous) {
        qc.setQueryData(['pendingRecipes'], context.previous);
      }
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: 'Failed to approve recipe',
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pendingRecipes'] });
      qc.invalidateQueries({ queryKey: ['recipes'] });
    },
  });
}

export function useDisapproveRecipe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recipeId: string) => adminService.disapproveRecipe(recipeId),
    onMutate: async (recipeId: string) => {
      await qc.cancelQueries({ queryKey: ['pendingRecipes'] });
      const previous = qc.getQueryData<unknown[]>(['pendingRecipes']);
      qc.setQueryData(['pendingRecipes'], (old: any[] | undefined) =>
        (old ?? []).filter(r => r.id !== recipeId),
      );
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        qc.setQueryData(['pendingRecipes'], context.previous);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['pendingRecipes'] });
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
