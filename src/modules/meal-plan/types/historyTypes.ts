import { FullRecipe } from "../../discover/types/recipeTypes";

export type MealHistory = {
    id: string;
    user_id: string;
    recipe_id: string;
    meal_date: string;
    meal_type: string;
    marked_at: string;
    recipe?: FullRecipe;
}