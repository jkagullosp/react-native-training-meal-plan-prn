import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { Profile } from '@/types/auth';

class ProfileApi {
  async fetchUserProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) throw error;
      console.log('Fetched user profile', JSON.stringify(data, null, 2));
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
}

export const profileApi = new ProfileApi();
