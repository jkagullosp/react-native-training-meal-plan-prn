import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { Profile } from '@/types/auth';
import { FullRecipe, CreateRecipeInput } from '@/types/recipe';

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

  async suspendUser(userId: string, durationMs: number) {
    try {
      const until = new Date(Date.now() + durationMs).toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'suspended', suspended_until: until })
        .eq('id', userId);

      if (error) throw error;
      console.log('Admin: Suspended user - ', userId, 'until', until);
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
      // Get all favorites
      const { data, error } = await supabase
        .from('recipe_favorites')
        .select('recipe_id');

      if (error || !data || data.length === 0) return null;

      // Count favorites per recipe
      const counts: Record<string, number> = {};
      data.forEach(({ recipe_id }) => {
        counts[recipe_id] = (counts[recipe_id] || 0) + 1;
      });

      // Find recipe(s) with max count
      const maxCount = Math.max(...Object.values(counts));
      const mostFavoritedIds = Object.entries(counts)
        .filter(([_, count]) => count === maxCount)
        .map(([id]) => id);

      console.log('Most favorited recipe IDs:', mostFavoritedIds);

      // Fetch the first most favorited recipe (remove .eq('approved', true) if present)
      const { data: recipes, error: recipeError } = await supabase
        .from('recipes')
        .select(recipeSelect)
        .in('id', mostFavoritedIds)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('Most favorited recipe data:', recipes);

      if (recipeError || !recipes || recipes.length === 0) return null;
      return recipes[0];
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

  async unSuspendUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) throw error;
      console.log('Admin: unsuspended user: ', userId);
    } catch (error) {
      throw handleApiError(error, 'Failed to unsuspend user');
    }
  }

  async unbanUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);
      if (error) throw error;
      console.log('Admin: unbanned user - ', userId);
    } catch (error) {
      throw handleApiError(error, 'Failed to unban user');
    }
  }

  async approveRecipe(recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipes')
        .update({ approved: true })
        .eq('id', recipeId);

      if (error) throw error;
      console.log('Admin: approved recipe', recipeId);
    } catch (error) {
      throw handleApiError(error, 'Failed to approve recipe');
    }
  }

  async disapproveRecipe(recipeId: string) {
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
      console.log('Admin: disapproved recipe: ', recipeId);
    } catch (error) {
      throw handleApiError(error, 'Failed to disapprove recipe');
    }
  }

  async submitAdminRecipe(userId: string, data: CreateRecipeInput) {
    try {
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert([
          {
            author_id: null,
            title: data.title,
            description: data.description,
            total_time: data.total_time,
            servings: data.servings,
            meal_type: data.meal_type,
            difficulty: data.difficulty,
            is_community: false,
            calories: data.calories,
            fat: data.fat,
            protein: data.protein,
            carbs: data.carbs,
            approved: true,
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
    } catch (error) {
      throw handleApiError(error, 'Failed to submit recipe');
    }
  }
}

export const adminApi = new AdminApi();
