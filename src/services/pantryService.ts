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
  ingredientData: newIngredient,
  pantry: PantryItem[],
) {
  if (!userId || !ingredientData.name) return;

  const exists = pantry?.find(
    item =>
      item.ingredient_name.toLowerCase() ===
      ingredientData.name.trim().toLowerCase(),
  );
  const addQty = Number(ingredientData.quantity) || 1;

  if (exists) {
    await pantryApi.updatePantryItemQuantity(
      exists.id,
      exists.quantity + addQty,
      ingredientData.unit || exists.unit || '',
    );
  } else {
    await pantryApi.insertPantryItem(userId, ingredientData, addQty);
  }

  await deductFromShoppingList(
    userId,
    ingredientData.name.trim(),
    addQty,
    ingredientData.unit || '',
  );
}
