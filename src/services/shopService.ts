import { shopApi } from '@/api/shopApi';
import { addDays, format } from 'date-fns';
import { Ingredient, Recipe, PantryItem, ShoppingListItem } from '@/types/shop';
import { MealPlan } from '@/types/shop';
import { mealApi } from '@/api/mealApi';

export async function fetchShoppingListFilter(
  userId: string,
): Promise<ShoppingListItem[]> {
  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  // Fetch meal plans and meal history for the week
  const mealPlans = await shopApi.fetchMealPlans(userId, weekDates);
  if (!mealPlans) return [];

  const mealHistory = await mealApi.fetchMealHistory(userId);
  // Build a set of done keys for quick lookup
  const doneKeys = new Set(
    (mealHistory ?? []).map(
      h => `${h.recipe_id}_${h.meal_date}_${h.meal_type}`,
    ),
  );

  // Filter out meal plans that are already marked as done
  const activeMealPlans = mealPlans.filter(
    plan =>
      !doneKeys.has(`${plan.recipe_id}_${plan.meal_date}_${plan.meal_type}`),
  );

  const recipeIds = activeMealPlans.map(plan => plan.recipe_id).filter(Boolean);
  if (recipeIds.length === 0) return [];

  return await shopApi.fetchShoppingListFilter(userId, recipeIds);
}

export async function fetchMealPlansAndRecipes(userId: string) {
  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  const mealPlans = await shopApi.fetchMealPlans(userId, weekDates);
  if (!mealPlans) return { mealPlanMap: {}, recipeMap: {} };

  const mealPlanMap: Record<string, MealPlan> = {};
  const recipeIds = new Set<string>();

  (mealPlans || []).forEach(plan => {
    mealPlanMap[plan.id] = plan;
    if (plan.recipe_id) recipeIds.add(plan.recipe_id);
  });

  let recipeMap: Record<string, Recipe> = {};
  if (recipeIds.size > 0) {
    const recipes = await shopApi.fetchRecipesByIds(Array.from(recipeIds));
    recipes.forEach(r => {
      recipeMap[r.id] = r;
    });
  }
  return { mealPlanMap, recipeMap };
}

export async function addMissingIngredients(userId: string) {
  const today = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(addDays(today, i), 'yyyy-MM-dd'),
  );

  const pantry = await fetchPantry(userId);
  if (!pantry) return;
  const mealPlans = await fetchMealPlans(userId, weekDates);
  if (!mealPlans) return;

  const mealHistory = await mealApi.fetchMealHistory(userId);
  const doneKeys = new Set(
    (mealHistory ?? []).map(
      h => `${h.recipe_id}_${h.meal_date}_${h.meal_type}`,
    ),
  );
  const activeMealPlans = mealPlans.filter(
    plan =>
      !doneKeys.has(`${plan.recipe_id}_${plan.meal_date}_${plan.meal_type}`),
  );

  const recipeIds = activeMealPlans.map(plan => plan.recipe_id).filter(Boolean);
  if (recipeIds.length === 0) return;

  const ingredients = await fetchIngredients(recipeIds);
  const shoppingList = await fetchShoppingList(userId);

  const ingredientTotals: { [key: string]: number } = {};
  activeMealPlans.forEach(plan => {
    (ingredients ?? [])
      .filter(
        (ingredient: Ingredient) => ingredient.recipe_id === plan.recipe_id,
      )
      .forEach((ingredient: Ingredient) => {
        const key = ingredient.name.toLowerCase();
        const qty = Number(ingredient.quantity) || 1;
        ingredientTotals[key] = (ingredientTotals[key] || 0) + qty;
      });
  });

  const newPantry = await fetchPantry(userId);
  const pantryCount: { [key: string]: number } = {};
  newPantry.forEach((p: PantryItem) => {
    const key = p.ingredient_name.toLowerCase();
    pantryCount[key] = p.quantity || 0;
  });

  const newIngredients: any[] = [];
  Object.entries(ingredientTotals).forEach(([key, neededQty]) => {
    const inPantry = pantryCount[key] || 0;
    const toBuy = Math.max(neededQty - inPantry, 0);

    const alreadyInShoppingList = (shoppingList ?? [])
      .filter(
        (item: ShoppingListItem) => item.ingredient_name.toLowerCase() === key,
      )
      .map((item: ShoppingListItem) => item.meal_plan_id);

    let added = 0;
    // FIX: Only consider activeMealPlans, not all mealPlans
    for (const plan of activeMealPlans) {
      if (added < toBuy) {
        const ingredient = (ingredients ?? []).find(
          (ing: Ingredient) =>
            ing.recipe_id === plan.recipe_id && ing.name.toLowerCase() === key,
        );
        if (ingredient && !alreadyInShoppingList.includes(plan.id)) {
          newIngredients.push({
            user_id: userId,
            recipe_id: plan.recipe_id,
            meal_plan_id: plan.id,
            ingredient_name: ingredient.name,
            is_checked: false,
            quantity: Number(ingredient.quantity) || 1,
            unit: ingredient.unit || '',
            meal_date: plan.meal_date,
            meal_type: plan.meal_type,
          });
          added += Number(ingredient.quantity) || 1;
        }
      }
    }
  });

  if (newIngredients.length > 0) {
    await addToShoppingList(newIngredients);
  }

  const validMealPlanIds = new Set(mealPlans.map(plan => plan.id));
  const outdatedItems = (shoppingList ?? []).filter(
    (item: ShoppingListItem) => !validMealPlanIds.has(item.meal_plan_id),
  );

  if (outdatedItems.length > 0) {
    await removeOutdatedItems(
      outdatedItems.map((item: ShoppingListItem) => item.id),
    );
  }

  await fetchShoppingList(userId);
}

export async function markAsChecked(item: ShoppingListItem, checked: boolean) {
  await shopApi.updateShoppingListChecked(item.id, checked);

  if (checked) {
    const pantryItem = await shopApi.getPantryItem(
      item.user_id,
      item.ingredient_name,
    );
    const addQty = item.quantity ? Number(item.quantity) : 1;

    if (!pantryItem) {
      await shopApi.insertPantryItem(
        item.user_id,
        item.ingredient_name,
        addQty,
      );
    } else {
      await shopApi.updatePantryItemQuantity(
        pantryItem.id,
        pantryItem.quantity + addQty,
      );
    }
    await shopApi.deleteShoppingListItem(item.id);
  }
}

export async function deductIngredientsForRecipe(
  userId: string,
  recipeId: string,
) {
  const ingredients = await shopApi.fetchIngredientForDeduct(recipeId);
  if (!ingredients) return;

  for (const ingredient of ingredients) {
    const pantryItem = await shopApi.fetchPantryForDeduct(userId, ingredient);

    if (pantryItem && pantryItem.length > 0) {
      const deductQty = Number(ingredient.quantity) || 1;
      const newQty = pantryItem[0].quantity - deductQty;
      if (newQty > 0) {
        await shopApi.updatePantryQuantity(newQty, pantryItem);
      } else {
        await shopApi.removeFromPantry(pantryItem);
      }
    }
  }
  await fetchPantry(userId);
}

export async function removeMealPlanAndShoppingList(mealPlanId: string) {
  await mealApi.removeMealplan(mealPlanId);
  await shopApi.removeShoppingListByMealPlan(mealPlanId);
}

export async function fetchPantry(userId: string) {
  return await shopApi.fetchPantry(userId);
}

export async function fetchMealPlans(userId: string, weekDates: string[]) {
  return await shopApi.fetchMealPlans(userId, weekDates);
}

export async function fetchIngredients(recipeIds: string[]) {
  return await shopApi.fetchIngredients(recipeIds);
}

export async function fetchShoppingList(userId: string) {
  return await shopApi.fetchShoppingList(userId);
}

export async function addToShoppingList(newIngredients: any) {
  return await shopApi.addToShoppingList(newIngredients);
}

export async function removeOutdatedItems(outdatedItems: any) {
  return await shopApi.removeOutdatedItems(outdatedItems);
}
