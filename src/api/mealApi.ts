import { FullMealPlan, MealHistory } from '@/types/meal';
import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { withExponentialBackoff } from './exponentialBackoff';

class MealAPi {
  async fetchMealPlans(userId: string): Promise<FullMealPlan[]> {
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase
          .from('meal_plans')
          .select(
            `
        *,
        recipe:recipes(
          *,
          images:recipe_images(*)
        )
      `,
          )
          .eq('user_id', userId)
          .order('meal_date', { ascending: true });

        if (error || !data) throw error;
        return data as FullMealPlan[];
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch meal plans.');
    }
  }

  async addMealPlan(
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ): Promise<FullMealPlan> {
    // <-- change return type
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase
          .from('meal_plans')
          .insert([
            {
              user_id: userId,
              recipe_id: recipeId,
              meal_date: mealDate,
              meal_type: mealType,
            },
          ])
          .select(
            `
          *,
          recipe:recipes(
            *,
            images:recipe_images(*)
          )
        `,
          )
          .single(); // <-- get the inserted row

        if (error || !data) throw error;
        return data as FullMealPlan;
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to add meal plan');
    }
  }

  async removeMealplan(mealPlanId: string): Promise<void> {
    try {
      return await withExponentialBackoff(async () => {
        const { error } = await supabase
          .from('meal_plans')
          .delete()
          .eq('id', mealPlanId);

        if (error) throw error;
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to remove meal plan');
    }
  }

  async fetchMealHistory(userId: string): Promise<MealHistory[]> {
    try {
      return await withExponentialBackoff(async () => {
        const { data, error } = await supabase
          .from('meal_history')
          .select(
            `
        *,
        recipe:recipes(
          *,
          images:recipe_images(*)
        )
      `,
          )
          .eq('user_id', userId)
          .order('meal_date', { ascending: false });

        if (error || !data) throw error;
        return data as MealHistory[];
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch meal history');
    }
  }

  async markMealDone(
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ): Promise<void> {
    try {
      return await withExponentialBackoff(async () => {
        const { error } = await supabase.from('meal_history').insert([
          {
            user_id: userId,
            recipe_id: recipeId,
            meal_date: mealDate,
            meal_type: mealType,
          },
        ]);

        if (error) throw error;
      });
    } catch (error) {
      throw handleApiError(error, 'Failed to mark meal as done');
    }
  }

  async removeIngredientsForRecipe(
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ): Promise<void> {
    try {
      return await withExponentialBackoff(async () => {
        const { error } = await supabase
          .from('shopping_list')
          .delete()
          .eq('user_id', userId)
          .eq('recipe_id', recipeId)
          .eq('meal_date', mealDate)
          .eq('meal_type', mealType);
        if (error) throw error;
      });
    } catch (error) {
      throw handleApiError(error, 'Cannot remove ingredients for recipe');
    }
  }
}

export const mealApi = new MealAPi();
