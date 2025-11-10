import { FullRecipe } from '@/types/recipe';

export type MealPlan = {
  id: string;
  user_id: string;
  recipe_id: string;
  meal_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
};

export type FullMealPlan = MealPlan & {
  recipe: FullRecipe;
};

export type MealHistory = {
  id: string;
  user_id: string;
  recipe_id: string;
  meal_date: string;
  meal_type: string;
  marked_at: string;
  recipe?: FullRecipe;
};

