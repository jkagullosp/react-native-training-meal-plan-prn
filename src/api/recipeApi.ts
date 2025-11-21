import { FullRecipe, Tag } from '../types/recipe';
import { Profile } from '../types/auth';
import { handleApiError } from '../api/apiHelpers';
import { supabase } from '../client/supabase';

class RecipeApi {
  async fetchRecipes(): Promise<FullRecipe[]> {
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
        .eq('approved', true);

      if (error || !data) throw error;
      console.log('(API Layer) Recipes: ', JSON.stringify(data, null, 2));
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Recipe fetch failed.');
    }
  }
  async fetchTags(): Promise<Tag[]> {
    try {
      const { data, error } = await supabase.from('tags').select('*');

      if (error || !data) throw error;
      console.log('(API Layer) Tags: ', JSON.stringify(data, null, 2));
      return data as Tag[];
    } catch (error) {
      throw handleApiError(error, 'Tags fetch failed.');
    }
  }
  async fetchRecipeAuthor(authorId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authorId)
        .maybeSingle();

      if (error || !data) throw error;
      console.log(
        '(Api Layer) Fetched Author: ',
        JSON.stringify(data, null, 2),
      );
      return data as Profile;
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch recipe authors.');
    }
  }

  async fetchuserRecipes(userId: string): Promise<FullRecipe[]> {
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
      console.log(
        '(Api Layer) Fetched user recipes: ',
        JSON.stringify(data, null, 2),
      );
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user recipes');
    }
  }

  async submitRating(
    userId: string,
    recipeId: string,
    rating: number,
  ): Promise<{ avg: number; count: number }> {
    const { error: upsertError } = await supabase
      .from('recipe_ratings')
      .upsert([
        {
          user_id: userId,
          recipe_id: recipeId,
          rating,
        },
      ]);
    if (upsertError) throw upsertError;

    const { data: ratings, error: ratingsError } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipeId);

    if (ratingsError) throw ratingsError;

    const count = ratings.length;
    const avg =
      count > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    const { error: updateError } = await supabase
      .from('recipes')
      .update({
        avg_rating: Math.round(avg * 10) / 10,
        rating_count: count,
      })
      .eq('id', recipeId);

    if (updateError) throw updateError;

    console.log('Submitted rating: ', avg, count);
    return { avg, count };
  }

  async fetchPendingUserRecipes(userId: string): Promise<FullRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('author_id', userId)
        .eq('approved', false)
        .order('created_at', { ascending: false });

      if (error || !data) throw error;
      return data as FullRecipe[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch pending user recipes.');
    }
  }
}

export const recipeApi = new RecipeApi();
