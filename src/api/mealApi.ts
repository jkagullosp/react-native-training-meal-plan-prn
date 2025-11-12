import { FullMealPlan, MealHistory } from '@/types/meal';
import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';

class MealAPi {
  async fetchMealPlans(userId: string): Promise<FullMealPlan[]> {
    try {
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
      console.log('Fetched meal plans: ', JSON.stringify(data, null, 2));
      return data as FullMealPlan[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch meal plans.');
    }
  }

  async addMealPlan(
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ): Promise<void> {
    try {
      const { error } = await supabase.from('meal_plans').insert([
        {
          user_id: userId,
          recipe_id: recipeId,
          meal_date: mealDate,
          meal_type: mealType,
        },
      ]);

      if (error) throw error;
      console.log('Meal plan inserted successfully');
    } catch (error) {
      throw handleApiError(error, 'Failed to add meal plan');
    }
  }

  async removeMealplan(mealPlanId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('meal_plans')
        .delete()
        .eq('id', mealPlanId);

      if (error) throw error;
      console.log('Meal plan removed: ', mealPlanId);
    } catch (error) {
      throw handleApiError(error, 'Failed to remove meal plan');
    }
  }

  async fetchMealHistory(userId: string): Promise<MealHistory[]> {
    try {
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
      console.log('Fetched meal history: ', JSON.stringify(data, null, 2));
      return data as MealHistory[];
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
      const { error } = await supabase.from('meal_history').insert([
        {
          user_id: userId,
          recipe_id: recipeId,
          meal_date: mealDate,
          meal_type: mealType,
        },
      ]);

      if (error) throw error;
      console.log('Marked meal done: ', recipeId);
    } catch (error) {
      throw handleApiError(error, 'Failed to mark meal as done');
    }
  }

  async removeIngredientsForRecipe(
    userId: string,
    recipeId: string,
  ): Promise<void> {
    try {
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('ingredients')
        .select('name')
        .eq('recipe_id', recipeId);

      if (ingredientsError || !ingredients) throw ingredientsError;

      for (const ingredient of ingredients) {
        const { data: shop, error: shopError } = await supabase
          .from('shopping_list')
          .delete()
          .eq('user_id', userId)
          .eq('ingredient_name', ingredient.name);

        if (shopError || !shop) throw shopError;
      }
    } catch (error) {
      throw handleApiError(error, 'Cannot remove ingredients for recipe');
    }
  }
}

export const mealApi = new MealAPi();
