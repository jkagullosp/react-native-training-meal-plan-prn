import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/services/adminService';

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