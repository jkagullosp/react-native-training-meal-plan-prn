import { RecipeIngredient, RecipeStep } from '../../../types/recipe';

export type CreateRecipeInput = {
  title: string;
  description: string;
  total_time?: number;
  servings?: number;
  meal_type?: string;
  difficulty?: string;
  calories?: number;
  fat?: number;
  carbs?: number;
  protein?: number;
  ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id' | 'created_at'>[];
  steps: Omit<RecipeStep, 'id' | 'recipe_id' | 'created_at' | 'updated_at'>[];
  tags: string[];
  images: { image_url: string; is_primary?: boolean; position?: number }[];
};
