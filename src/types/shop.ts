export type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  recipe_id: string;
  quantity_value: number;
  unit?: string;
  created_at: string;
};

export type ShoppingListItem = {
  meal_plan_id: string;
  id: string;
  user_id: string;
  recipe_id: string;
  ingredient_name: string;
  is_checked: boolean;
  created_at: string;
  quantity?: number;
  unit?: string;
};

export type ShoppingListStore = {
  shoppingList: ShoppingListItem[];
};

export type PantryItem = {
  id: string;
  user_id: string | null;
  ingredient_name: string;
  quantity: number;
  unit?: string;
  created_at: string;
};

export type MealPlan = {
  id: string;
  user_id?: string;
  recipe_id: string;
  meal_date: string;
  meal_type: string;
};

export type Recipe = {
  id: string;
  title: string;
};