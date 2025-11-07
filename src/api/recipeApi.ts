import { FullRecipe } from '../types/recipe';
import { handleApiError } from '../api/apiHelpers';
import { supabase } from '../client/supabase';

class RecipeApi {
  async fetchRecipes(): Promise<FullRecipe[]> {
    try {
      const { data, error } = await supabase.from('recipes').select(
        `*,
        images:recipe_images(*),
        steps:recipe_steps(*),
        ingredients(*),
        tags:recipe_tags(
          tag: tags(*)
        ),
        ratings:recipe_ratings(*)
      `,
      );
      if (error || !data) throw error;
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Recipe fetch failed.');
    }
  }
}

export const recipeApi = new RecipeApi();
