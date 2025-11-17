import { pantryApi } from '@/api/pantryApi';
import { newIngredient } from '@/types/pantry';
import { PantryItem } from '@/types/shop';

export async function deductFromShoppingList(
  userId: string,
  ingredientName: string,
  addQty: number,
  _unit: string,
) {
  if (!userId) return;

  // Fetch shopping list items for this ingredient (case-insensitive)
  const shoppingItems = await pantryApi.fetchShoppingListItems(
    userId,
    ingredientName.trim(),
  );

  let remaining = addQty;
  for (const item of shoppingItems || []) {
    if (remaining <= 0) break;
    const itemQty = Number(item.quantity) || 1;
    if (itemQty <= remaining) {
      await pantryApi.removeFromShoppingList(item); // Pass the full item
      remaining -= itemQty;
    } else {
      await pantryApi.deductQuantityToShoppingList(item, itemQty, remaining);
      remaining = 0;
    }
  }
}

export async function addToPantry(
  userId: string,
  newIngredient: newIngredient,
  pantry: PantryItem[],
) {
  if (!userId || !newIngredient.name) return;

  const exists = pantry?.find(
    item =>
      item.ingredient_name.toLowerCase() ===
      newIngredient.name.trim().toLowerCase(),
  );
  const addQty = Number(newIngredient.quantity) || 1;

  if (exists) {
    await pantryApi.updatePantryItemQuantity(
      exists.id,
      exists.quantity + addQty,
      newIngredient.unit || exists.unit || '',
    );
  } else {
    await pantryApi.insertPantryItem(userId, newIngredient, addQty);
  }

  await deductFromShoppingList(
    userId,
    newIngredient.name.trim(),
    addQty,
    newIngredient.unit || '',
  );
}
