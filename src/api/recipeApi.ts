import { FullRecipe, Tag, CreateRecipeInput } from '../types/recipe';
import { Profile } from '../types/auth';
import { handleApiError } from '../api/apiHelpers';
import { supabase } from '../client/supabase';
import { withExponentialBackoff } from './exponentialBackoff';

class RecipeApi {
  async fetchRecipes(): Promise<FullRecipe[]> {
    try {
      return await withExponentialBackoff(async () => {
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
        return data as FullRecipe[];
      });
    } catch (error) {
      throw handleApiError(error, 'Recipe fetch failed.');
    }
  }

  async fetchRecipesPaginated(
    page: number,
    pageSize: number,
  ): Promise<FullRecipe[]> {
    try {
      return withExponentialBackoff(async () => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
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
          .eq('approved', true)
          .range(from, to);

        if (error || !data) throw error;
        return data as FullRecipe[];
      });
    } catch (error) {
      handleApiError(error, 'Failed to fetch Recipe Paginated');
      return [];
    }
  }
  async fetchTags(): Promise<Tag[]> {
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase.from('tags').select('*');

        if (error || !data) throw error;
        return data as Tag[];
      });
    } catch (error) {
      throw handleApiError(error, 'Tags fetch failed.');
    }
  }
  async fetchRecipeAuthor(authorId: string): Promise<Profile> {
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authorId)
          .maybeSingle();

        if (error || !data) throw error;
        return data as Profile;
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch recipe authors.');
    }
  }

  async fetchUserRecipes(userId: string): Promise<FullRecipe[]> {
    try {
      return await withExponentialBackoff(async () => {
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
        return data as FullRecipe[];
      });
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

    return { avg, count };
  }

  async fetchPendingUserRecipes(userId: string): Promise<FullRecipe[]> {
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('author_id', userId)
          .eq('approved', false)
          .order('created_at', { ascending: false });

        if (error || !data) throw error;
        return data as FullRecipe[];
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch pending user recipes.');
    }
  }

  async submitRecipe(userId: string, data: CreateRecipeInput) {
    try {
      return await withExponentialBackoff(async () => {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .insert([
            {
              author_id: userId,
              title: data.title,
              description: data.description,
              total_time: data.total_time,
              servings: data.servings,
              meal_type: data.meal_type,
              difficulty: data.difficulty,
              is_community: true,
              calories: data.calories,
              fat: data.fat,
              protein: data.protein,
              carbs: data.carbs,
              approved: false,
            },
          ])
          .select()
          .single();

        if (recipeError || !recipeData) throw recipeError;

        const recipeId = recipeData.id;

        if (data.ingredients.length > 0) {
          await supabase.from('ingredients').insert(
            data.ingredients.map(ingredient => ({
              recipeId: recipeId,
              name: ingredient.name,
              quantity_value: ingredient.quantity_value,
              unit: ingredient.unit,
            })),
          );
        }

        if (data.steps.length > 0) {
          await supabase.from('recipe_steps').insert(
            data.steps.map((step, idx) => ({
              recipeId: recipeId,
              step_number: idx + 1,
              instruction: step.instruction,
            })),
          );
        }

        for (const tagName of data.tags) {
          let { data: tagData } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();

          let tagId: string | undefined = tagData?.id;

          if (!tagId) {
            const { data: newTag } = await supabase
              .from('tags')
              .insert([{ name: tagName }])
              .select('id')
              .single();

            if (newTag && newTag.id) {
              tagId = newTag.id;
            } else {
              const { data: existingTag } = await supabase
                .from('tags')
                .select('id')
                .eq('name', tagName)
                .single();
              tagId = existingTag?.id;
            }
          }

          if (tagId) {
            await supabase
              .from('recipe_tags')
              .insert([{ recipe_id: recipeId, tag_id: tagId }]);
          }
        }

        if (data.images.length > 0) {
          await supabase.from('recipe_images').insert(
            data.images.map((img, idx) => ({
              recipe_id: recipeId,
              image_url: img.image_url,
              is_primary: img.is_primary ?? idx === 0,
              position: img.position ?? idx + 1,
            })),
          );
        }
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to submit recipe');
    }
  }

  async fetchApprovedUserRecipes(userId: string): Promise<FullRecipe[]> {
    try {
      return await withExponentialBackoff(async () => {
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
          .eq('author_id', userId)
          .eq('approved', true);

        if (error || !data) throw error;
        return data as FullRecipe[];
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch approved user recipes');
    }
  }
}

export const recipeApi = new RecipeApi();
