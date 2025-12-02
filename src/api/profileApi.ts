import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { Profile } from '@/types/auth';
import { FullRecipe } from '@/types/recipe';

class ProfileApi {
  async fetchUserProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) throw error;
      return data as Profile;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user profile');
    }
  }

  async fetchUserTotalLikes(userId: string) {
    try {
      const { data: recipes, error: recipesError } = await supabase
        .from('recipes')
        .select('id')
        .eq('author_id', userId);

      if (recipesError) throw recipesError;
      if (!recipes || recipes.length === 0) return 0;

      const recipeIds = recipes.map(r => r.id);

      const { count, error: likesError } = await supabase
        .from('recipe_likes')
        .select('id', { count: 'exact', head: true })
        .in('recipe_id', recipeIds);

      if (likesError) return 0;
      return count || 0;
    } catch (error) {
      throw handleApiError(error, 'Cannot fetch user likes');
    }
  }

  async fetchUserFavoriteIds(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data ? data.map(fav => fav.recipe_id) : [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch favorite IDs');
    }
  }

  async fetchFavoriteRecipes(recipeIds: string[]): Promise<FullRecipe[]> {
    if (!recipeIds.length) return [];
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(
          `*,
          images:recipe_images(*),
          steps:recipe_steps(*),
          ingredients(*),
          tags:recipe_tags(tag:tags(*)),
          ratings:recipe_ratings(*)`,
        )
        .in('id', recipeIds);
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch favorite recipes');
    }
  }

  async addFavorite(userId: string, recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipe_favorites')
        .insert([{ user_id: userId, recipe_id: recipeId }]);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to add favorite');
    }
  }

  async removeFavorite(userId: string, recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipe_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to remove favorite');
    }
  }

  async updateProfileImage(userId: string, imageUrl: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_image: imageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to update profile image.');
    }
  }

  async updateDisplayName(userId: string, displayName: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to update display name');
    }
  }

  async updateUsername(userId: string, username: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Failed to update username');
    }
  }

  async updateBio(userId: string, bio: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ bio, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Failed to update bio');
    }
  }

  async changePassword(email: string, newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        email,
        password: newPassword,
      });

      if (error) throw error;
    } catch (error) {
      handleApiError(error, 'Failed to change password!');
    }
  }
}

export const profileApi = new ProfileApi();
