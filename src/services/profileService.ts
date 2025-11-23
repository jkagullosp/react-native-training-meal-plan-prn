import { profileApi } from '@/api/profileApi';

export const profileService = {
  fetchUserProfile: (userId: string) => profileApi.fetchUserProfile(userId),
  fetchUserTotalLikes: (userId: string) =>
    profileApi.fetchUserTotalLikes(userId),
  fetchUserFavoriteIds: (userId: string) =>
    profileApi.fetchUserFavoriteIds(userId),
  fetchFavoriteRecipes: (recipeIds: string[]) =>
    profileApi.fetchFavoriteRecipes(recipeIds),
  addFavorite: (userId: string, recipeId: string) =>
    profileApi.addFavorite(userId, recipeId),
  removeFavorite: (userId: string, recipeId: string) =>
    profileApi.removeFavorite(userId, recipeId),
  updateProfileImage: (userId: string, imageUrl: string) =>
    profileApi.updateProfileImage(userId, imageUrl),
  updateDisplayName: (userId: string, displayName: string) =>
    profileApi.updateDisplayName(userId, displayName),
  updateUsername: (userId: string, username: string) =>
    profileApi.updateUsername(userId, username),
  updateBio: (userId: string, bio: string) => profileApi.updateBio(userId, bio),
  changePassword: (email: string, password: string) =>
    profileApi.changePassword(email, password),
};
