import { create } from 'zustand';
import { supabase } from '../../../client/supabase';
import { FullMealPlan } from '../types/mealPlanTypes';
import { MealHistory } from '../types/historyTypes';
import { useShoppingListStore } from '../../shopping-list/store/useShoppingListStore';
import {
  scheduleHybridMealNotification,
  cancelHybridNotification,
} from '../../../utils/notificationChannel';

type MealPlanState = {
  mealPlans: FullMealPlan[];
  mealHistory: MealHistory[];
  loading: boolean;
  fetchMealPlans: (userId: string) => Promise<void>;
  addMealPlan: (
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ) => Promise<void>;
  removeMealPlan: (mealPlanId: string, userId: string) => Promise<void>;
  fetchMealHistory: (userId: string) => Promise<void>;
  markMealDone: (
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ) => Promise<void>;
  removeIngredientsForRecipe: (
    userId: string,
    recipeId: string,
  ) => Promise<void>;
};

export const useMealPlanStore = create<MealPlanState>(set => ({
  mealPlans: [],
  loading: false,
  mealHistory: [],

  fetchMealPlans: async (userId: string) => {
    set({ loading: true });

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

    if (!error && data) {
      set({ mealPlans: data as FullMealPlan[], loading: false });
    } else {
      set({ mealPlans: [], loading: false });
    }
  },

  addMealPlan: async (
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ) => {
    // Insert the meal plan
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
        recipe:recipes(title)
      `,
      )
      .single();

    if (error) {
      console.error('Error adding meal plan:', error);
      return;
    }

    if (data) {
      // Schedule hybrid notification
      const result = await scheduleHybridMealNotification({
        userId,
        mealPlanId: data.id,
        mealDate,
        mealType,
        recipeTitle: data.recipe?.title || 'Your meal',
        notificationHoursBefore: 2, // Customize as needed
      });

      if (result.success) {
        console.log('✅ Notification scheduled:', result.scheduledFor);
      } else {
        console.log(
          '⚠️ Notification scheduling failed:',
          result.reason || result.error,
        );
      }
    }
  },

  removeMealPlan: async (mealPlanId: string, userId: string) => {
    // Cancel notifications before removing
    await cancelHybridNotification(mealPlanId, userId);

    // Remove the meal plan
    await supabase.from('meal_plans').delete().eq('id', mealPlanId);
  },

  fetchMealHistory: async (userId: string) => {
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

    if (!error && data) {
      set({ mealHistory: data as MealHistory[] });
    } else {
      set({ mealHistory: [] });
    }
  },

  markMealDone: async (
    userId: string,
    recipeId: string,
    mealDate: string,
    mealType: string,
  ) => {
    await supabase.from('meal_history').insert([
      {
        user_id: userId,
        recipe_id: recipeId,
        meal_date: mealDate,
        meal_type: mealType,
      },
    ]);
    await useShoppingListStore
      .getState()
      .deductIngredientsForRecipe(userId, recipeId);
  },

  removeIngredientsForRecipe: async (userId: string, recipeId: string) => {
    const { data: ingredients, error: ingError } = await supabase
      .from('ingredients')
      .select('name')
      .eq('recipe_id', recipeId);

    if (ingError || !ingredients) return;

    for (const ingredient of ingredients) {
      await supabase
        .from('shopping_list')
        .delete()
        .eq('user_id', userId)
        .eq('ingredient_name', ingredient.name);
    }
  },
}));
