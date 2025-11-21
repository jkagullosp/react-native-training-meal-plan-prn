import { adminApi } from '@/api/adminApi';

export const adminService = {
  getAllUsers: () => adminApi.getAllUsers(),
  fetchRecipesNotPending: () => adminApi.fetchRecipesNotPending(),
  fetchMostFavoritedRecipe: () => adminApi.fetchMostFavoritedRecipe(),
  fetchMostLikedRecipe: () => adminApi.fetchMostLikedRecipe(),
  getRecipesApprovedLast30Days: () => adminApi.getRecipesApprovedLast30Days(),
  suspendUser: (userId: string) => adminApi.suspendUser(userId),
  banUser: (userId: string) => adminApi.banUser(userId),
  deleteUser: (userId: string) => adminApi.deleteUser(userId),
};
