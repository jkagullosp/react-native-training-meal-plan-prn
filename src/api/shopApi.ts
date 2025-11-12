import { supabase } from '@/client/supabase';
import {
  ShoppingListItem,
  PantryItem,
  MealPlan,
  Recipe,
  Ingredient,
} from '@/types/shop';
import { handleApiError } from './apiHelpers';

class ShopApi {
  async fetchMealPlans(
    userId: string,
    weekDates: string[],
  ): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('id, recipe_id, meal_date, meal_type')
        .eq('user_id', userId)
        .in('meal_date', weekDates);

      if (error) throw error;
      console.log('Feteched meal plans: ', JSON.stringify(data, null, 2));
      return data as MealPlan[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch meal plans');
    }
  }

  async fetchShoppingListFilter(
    userId: string,
    recipeIds: string[],
  ): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId)
        .in('recipe_id', recipeIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log(
        'Fetched shopping List Filter: ',
        JSON.stringify(data, null, 2),
      );
      return data as ShoppingListItem[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch shopping list');
    }
  }

  async fetchRecipesByIds(recipeIds: string[]): Promise<Recipe[]> {
    try {
      if (!recipeIds.length) return [];
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title')
        .in('id', recipeIds);

      if (error) throw error;
      console.log('Fetched recipe by Ids', JSON.stringify(data, null, 2));
      return (data as Recipe[]) || [];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch recipe by ids');
    }
  }

  async fetchPantry(userId: string): Promise<PantryItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_pantry')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) throw error;
      console.log('Fetched user pantry: ', JSON.stringify(data, null, 2));
      return data as PantryItem[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch user pantry');
    }
  }

  async fetchIngredients(recipeIds: string[]): Promise<Ingredient[]> {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .in('recipe_id', recipeIds);

      if (error || !data) throw error;
      console.log('Fetched ingredients: ', JSON.stringify(data, null, 2));
      return data as Ingredient[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch ingredients');
    }
  }

  async fetchIngredientForDeduct(recipeId: string): Promise<Ingredient[]> {
    try {
      const { data, error } = await supabase
        .from('ingredients')
        .select('name, quantity')
        .eq('recipe_id', recipeId);

      if (error || !data) throw error;
      console.log('Fetched ingredient: ', JSON.stringify(data, null, 2));
      return data as Ingredient[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch ingredients');
    }
  }

  async fetchPantryForDeduct(
    userId: string,
    ingredient: Ingredient,
  ): Promise<PantryItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_pantry')
        .select('*')
        .eq('user_id', userId)
        .eq('ingredient_name', ingredient.name);

      if (error || !data) throw error;
      console.log('Fetched pantry for deduct: ', JSON.stringify(data, null, 2));
      return data as PantryItem[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch pantry for deduct');
    }
  }

  async updatePantryQuantity(newQty: number, pantryItem: PantryItem[]) {
    try {
      const { error } = await supabase
        .from('user_pantry')
        .update({ quantity: newQty })
        .eq('id', pantryItem[0].id);

      if (error) throw error;
      console.log('Updated pantry quantity');
    } catch (error) {
      throw handleApiError(error, 'Failed to update pantry quantity');
    }
  }

  async removeFromPantry(pantryItem: PantryItem[]) {
    try {
      const { error } = await supabase
        .from('user_pantry')
        .delete()
        .eq('id', pantryItem[0].id);

      if (error) throw error;
      console.log('Removed from pantry');
    } catch (error) {
      throw handleApiError(error, 'Failed to remove from pantry');
    }
  }

  async fetchShoppingList(userId: string): Promise<ShoppingListItem[]> {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId);

      if (error || !data) throw error;
      console.log('Fetched shopping list', JSON.stringify(data, null, 2));
      return data as ShoppingListItem[];
    } catch (error) {
      throw handleApiError(error, 'Failed to fetch shopping list');
    }
  }

  async addToShoppingList(newIngredients: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .insert(newIngredients);

      if (error) throw error;
      console.log('Added to shopping list', newIngredients);
    } catch (error) {
      throw handleApiError(error, 'Failed to add to shopping list');
    }
  }

  async removeOutdatedItems(outdatedItems: any): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .delete()
        .in('id', outdatedItems);

      if (error || !data) throw error;
      console.log('Removed outdated items: ', JSON.stringify(data, null, 2));
    } catch (error) {
      throw handleApiError(error, 'Failed to remove outdated items');
    }
  }

  async updateShoppingListChecked(id: string, checked: boolean) {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ is_checked: checked })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed update shopping list checked');
    }
  }

  async getPantryItem(userId: string, ingredientName: string) {
    const { data, error } = await supabase
      .from('user_pantry')
      .select('*')
      .eq('user_id', userId)
      .eq('ingredient_name', ingredientName);

    if (error || !data) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async insertPantryItem(
    userId: string,
    ingredientName: string,
    quantity: number,
  ) {
    const { error } = await supabase
      .from('user_pantry')
      .insert([{ user_id: userId, ingredient_name: ingredientName, quantity }]);

    if (error) throw error;
  }

  async updatePantryItemQuantity(id: string, quantity: number) {
    const { error } = await supabase
      .from('user_pantry')
      .update({ quantity })
      .eq('id', id);
    if (error) throw error;
  }

  async deleteShoppingListItem(id: string) {
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async removeShoppingListByMealPlan(mealPlanId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('meal_plan_id', mealPlanId);
      if (error) throw error;
      console.log('Removede shoppinglist by meal plan: ', mealPlanId);
    } catch (error) {
      throw handleApiError(
        error,
        'Failed to remove into shoppinglist by meal plan',
      );
    }
  }
}

export const shopApi = new ShopApi();
