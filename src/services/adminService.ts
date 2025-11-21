import { adminApi } from '@/api/adminApi';

export const adminService = {
  getAllUsers: () => adminApi.getAllUsers(),
  fetchRecipesNotPending: () => adminApi.fetchRecipesNotPending(),
  fetchMostFavoritedRecipe: () => adminApi.fetchMostFavoritedRecipe(),
  fetchMostLikedRecipe: () => adminApi.fetchMostLikedRecipe(),
  fetchPendingRecipes: () => adminApi.fetchPendingRecipes(),
  getRecipesApprovedLast30Days: () => adminApi.getRecipesApprovedLast30Days(),
  suspendUser: (userId: string, durationMs: number) =>
    adminApi.suspendUser(userId, durationMs),
  banUser: (userId: string) => adminApi.banUser(userId),
  deleteUser: (userId: string) => adminApi.deleteUser(userId),
  unSuspendUser: (userId: string) => adminApi.unSuspendUser(userId),
  unBanUser: (userId: string) => adminApi.unbanUser(userId),
  approveRecipe: (recipeId: string) => adminApi.approveRecipe(recipeId),
  disapproveRecipe: (recipeId: string) => adminApi.disapproveRecipe(recipeId),
};
