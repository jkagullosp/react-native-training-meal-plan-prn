import { FullRecipe, Tag } from '../types/recipe';
import { Profile } from '../types/auth';
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
      console.log('(API Layer) Recipes:', JSON.stringify(data, null, 2));
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Recipe fetch failed.');
    }
  }
  async fetchTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase
      .from("tags")
      .select("*");

      if (error || !data) throw error;
      console.log('(API Layer) Tags:', JSON.stringify(data, null, 2));
      return data as Tag[];
    } catch (error) {
      throw handleApiError(error, 'Tags fetch failed.')
    }
  }
  async fetchRecipeAuthor(authorId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authorId)
      .maybeSingle();

      if(error || !data) throw error;
      console.log('(Api Layer) Fetched Author:', JSON.stringify(data, null, 2));
      return data as Profile;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch recipe authors.')
    }
  }
  async fetchuserRecipes(userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
      .from('recipes')
      .select(
        `*,
        images:recipe_images(*),
        steps:recipe_steps(*),
        ingredients(*),
        tags:recipe_tags(
          tag: tags(*)
        ),
        ratings:recipe_ratings(*)
      `,
      )
      .eq('author_id', userId);

      if (error || !data) throw error;
      console.log('(Api Layer) Fetched user recipes', JSON.stringify(data, null, 2));
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user recipes')
    }
  }
}

export const recipeApi = new RecipeApi();
