import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { Profile } from '@/types/auth';
import { FullRecipe } from '@/types/recipe';

const recipeSelect = `
  *,
  images:recipe_images(*),
  steps:recipe_steps(*),
  ingredients(*),
  tags:recipe_tags(
    tag:tags(*)
  ),
  ratings:recipe_ratings(*)
`;

class AdminApi {
  async getAllUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false });

      if (error || !data) throw error;
      console.log('Admin: Fetched Users: ', JSON.stringify(data, null, 2));
      return data as Profile[];
    } catch (error) {
      throw handleApiError(error, 'Admin: Failed to fetch users');
    }
  }

  async banUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('id', userId);

      if (error) throw error;
      console.log('Admin: Banned user - ', userId);
    } catch (error) {
      throw handleApiError(error, 'Admin: Faile to ban user');
    }
  }

  async suspendUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended' })
        .eq('id', userId);

      if (error) throw error;
      console.log('Admin: Suspended user - ', userId);
    } catch (error) {
      throw handleApiError(error, 'Failed to suspend user');
    }
  }

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      console.log('Admin: Deleted user - ', userId);
    } catch (error) {
      throw handleApiError(error, 'Failed to delete user');
    }
  }

  async fetchRecipesNotPending(): Promise<FullRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error || !data) throw error;
      console.log(
        'Admin: Recipes not pending: ',
        JSON.stringify(data, null, 2),
      );
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(
        error,
        'Admin: Failed top fetch recipes not pending',
      );
    }
  }

  async fetchPendingRecipes(): Promise<FullRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error || !data) throw error;
      console.log(
        'Admin: Fetched pending recipes: ',
        JSON.stringify(data, null, 2),
      );
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Admin: Failed to fetch pending recipes');
    }
  }

  async fetchMostFavoritedRecipe() {
    try {
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id');

      if (error || !data || data.length === 0) return null;

      const counts: Record<string, number> = {};
      data.forEach(({ recipe_id }) => {
        counts[recipe_id] = (counts[recipe_id] || 0) + 1;
      });
      const mostFavoritedId = Object.entries(counts).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];
      if (!mostFavoritedId) return null;

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .eq('id', mostFavoritedId)
        .maybeSingle();

      if (recipeError) throw recipeError;
      return recipe;
    } catch (error) {
      throw handleApiError(
        error,
        'Admin: Failed to fetch most favorite recipe',
      );
    }
  }

  async fetchMostLikedRecipe() {
    try {
      const { data, error } = await supabase
        .from('recipe_likes')
        .select('recipe_id');

      if (error || !data || data.length === 0) return null;

      // Count occurrences in JS
      const counts: Record<string, number> = {};
      data.forEach(({ recipe_id }) => {
        counts[recipe_id] = (counts[recipe_id] || 0) + 1;
      });
      const mostLikedId = Object.entries(counts).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];
      if (!mostLikedId) return null;

      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .eq('id', mostLikedId)
        .maybeSingle();

      if (recipeError) throw recipeError;
      return recipe;
    } catch (error) {
      throw handleApiError(error, 'Admin: failed to fetch most liked recipe');
    }
  }

  async getRecipesApprovedLast30Days() {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .eq('approved', true)
        .gte('updated_at', since.toISOString())
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Admin: failed to fetch recipes approved');
    }
  }
}

export const adminApi = new AdminApi();
