import { supabase } from '@/client/supabase';
import { handleApiError } from './apiHelpers';
import { newIngredient } from '@/types/pantry';
import { PantryItem } from '@/types/shop';
import { Profile } from '@/types/auth';

class PantryApi {
  async fetchShoppingListItems(userId: string, ingredientName: string) {
    try {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .eq('user_id', userId)
        .eq('ingredient_name', ingredientName)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw handleApiError(error, 'Failed to deduct from shopping list');
    }
  }

  async removeFromShoppingList(item: any) {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to remove from shopping list');
    }
  }

  async deductQuantityToShoppingList(
    item: any,
    itemQty: number,
    remaining: number,
  ) {
    try {
      const { error } = await supabase
        .from('shopping_list')
        .update({ quantity: itemQty - remaining })
        .eq('id', item.id);

      remaining = 0;
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to deduct quantity');
    }
  }

  async addQuantityToShoppingList(
    quantity: number,
    exists: PantryItem,
    addQty: number,
    unit: string,
    ingredientData: newIngredient,
  ) {
    try {
      const { error } = await supabase
        .from('user_pantry')
        .update({
          quantity: exists.quantity + addQty,
          unit: ingredientData.unit || exists.unit,
        })
        .eq('id', exists.id);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to add quantity to shopping list');
    }
  }

  async insertToShoppingList(
    user: Profile,
    quantity: number,
    unit: string,
    addQty: number,
    ingredientData: newIngredient,
  ) {
    try {
      const { error } = await supabase.from('user_pantry').insert([
        {
          user_id: user.id,
          ingredient_name: ingredientData.name.trim(),
          quantity: addQty,
          unit: ingredientData.unit || '',
        },
      ]);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to insert to shopping list.');
    }
  }

  async deletePantryItem(itemId: string) {
    try {
      const { error } = await supabase
        .from('user_pantry')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to delete from pantry');
    }
  }

  async updatePantryItemQuantity(itemId: string, newQty: number, unit: string) {
    try {
      const { error } = await supabase
        .from('user_pantry')
        .update({ quantity: newQty, unit })
        .eq('id', itemId);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to update pantry item');
    }
  }

  async insertPantryItem(
    userId: string,
    ingredient: newIngredient,
    addQty: number,
  ) {
    try {
      if (!userId) throw new Error('User ID is required to insert pantry item');
      const { error } = await supabase.from('user_pantry').insert([
        {
          user_id: userId,
          ingredient_name: ingredient.name.trim(),
          quantity: addQty,
          unit: ingredient.unit || '',
        },
      ]);
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Failed to insert pantry item');
    }
  }
}

export const pantryApi = new PantryApi();
