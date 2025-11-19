import { communityApi } from '@/api/communityApi';
import { Profile } from '@/types/auth';
import { RecipeLike } from '@/types/recipe';

export const communityService = {
  async getAuthor(authorId: string): Promise<Profile> {
    return await communityApi.fetchAuthor(authorId);
  },

  async getRecipeLikes(recipeId: string): Promise<RecipeLike[]> {
    return await communityApi.fetchRecipeLikes(recipeId);
  },

  async likeRecipe(userId: string, recipeId: string): Promise<void> {
    return await communityApi.likeRecipe(userId, recipeId);
  },

  async unlikeRecipe(userId: string, recipeId: string): Promise<void> {
    return await communityApi.unlikeRecipe(userId, recipeId);
  },
};
