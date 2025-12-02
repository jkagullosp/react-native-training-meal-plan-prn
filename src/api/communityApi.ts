import { Profile } from '@/types/auth';
import { RecipeLike } from '@/types/recipe';
import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';

class CommunityApi {
  async fetchAuthor(authorId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authorId)
        .maybeSingle();
      if (error) throw error;
      return data as Profile;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch authors');
    }
  }

  async fetchRecipeLikes(recipeId: string) {
    try {
      const { data, error } = await supabase
        .from('recipe_likes')
        .select('*')
        .eq('recipe_id', recipeId);
      if (error) throw error;
      return data as RecipeLike[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch recipe likes');
    }
  }

  async likeRecipe(userId: string, recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipe_likes')
        .insert([{ user_id: userId, recipe_id: recipeId }]);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to like recipe');
    }
  }

  async unlikeRecipe(userId: string, recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to unlike recipe.');
    }
  }
}

export const communityApi = new CommunityApi();
