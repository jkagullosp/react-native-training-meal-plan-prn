import { create } from 'zustand';
import { supabase } from '../../../client/supabase';
import { addDays, format } from 'date-fns';
import {
  ShoppingListItem,
  ShoppingListStore,
  PantryItem,
  MealPlan,
  Recipe,
} from '../types/shoppingListTypes';

interface Ingredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity: number;
  unit: string;
}

type MealPlanState = ShoppingListStore & {
  loading: boolean;
  mealPlanMap: Record<string, MealPlan>;
  recipeMap: Record<string, Recipe>;
  pantry: PantryItem[];
  fetchShoppingList: (userId: string) => Promise<void>;
  fetchMealPlansAndRecipes: (userId: string) => Promise<void>;
  addMissingIngredients: (userId: string) => Promise<void>;
  markAsChecked: (item: ShoppingListItem, checked: boolean) => Promise<void>;
  fetchPantry: (userId: string) => Promise<void>;
  addToPantry: (userId: string) => Promise<void>;
  deductIngredientsForRecipe: (
    userId: string,
    recipeId: string,
  ) => Promise<void>;
};

export const useShoppingListStore = create<MealPlanState>((set, get) => ({
  shoppingList: [],
  loading: false,
  mealPlanMap: {},
  recipeMap: {},
  pantry: [],

  fetchMealPlansAndRecipes: async (userId: string) => {
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), 'yyyy-MM-dd'),
    );

    const { data: mealPlans } = await supabase
      .from('meal_plans')
      .select('id, recipe_id, meal_date, meal_type')
      .eq('user_id', userId)
      .in('meal_date', weekDates);

    const mealPlanMap: Record<string, MealPlan> = {};
    const recipeIds = new Set<string>();
    (mealPlans || []).forEach(plan => {
      mealPlanMap[plan.id] = plan;
      if (plan.recipe_id) recipeIds.add(plan.recipe_id);
    });

    let recipeMap: Record<string, Recipe> = {};
    if (recipeIds.size > 0) {
      const { data: recipes } = await supabase
        .from('recipes')
        .select('id, title')
        .in('id', Array.from(recipeIds));
      (recipes || []).forEach(r => {
        recipeMap[r.id] = r;
      });
    }

    set({ mealPlanMap, recipeMap });
  },

  fetchShoppingList: async (userId: string) => {
    set({ loading: true });

    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), 'yyyy-MM-dd'),
    );

    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('meal_plans')
      .select('id, recipe_id, meal_date')
      .eq('user_id', userId)
      .in('meal_date', weekDates);

    if (mealPlansError || !mealPlans) {
      set({ shoppingList: [], loading: false });
      return;
    }

    const recipeIds = mealPlans.map(plan => plan.recipe_id).filter(Boolean);

    if (recipeIds.length === 0) {
      set({ shoppingList: [], loading: false });
      return;
    }

    const { data } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', userId)
      .in('recipe_id', recipeIds)
      .order('created_at', { ascending: false });

    set({ shoppingList: data as ShoppingListItem[], loading: false });
    await get().fetchMealPlansAndRecipes(userId);
  },

  addMissingIngredients: async (userId: string) => {
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) =>
      format(addDays(today, i), 'yyyy-MM-dd'),
    );

    await get().fetchPantry(userId);

    const { data: mealPlans } = await supabase
      .from('meal_plans')
      .select('id, recipe_id')
      .eq('user_id', userId)
      .in('meal_date', weekDates);

    if (!mealPlans) return;

    const recipeIds = mealPlans.map(plan => plan.recipe_id).filter(Boolean);
    if (recipeIds.length === 0) return;

    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('*')
      .in('recipe_id', recipeIds);

    const { data: shoppingList } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', userId);

    const ingredientTotals: { [key: string]: number } = {};
    mealPlans.forEach(plan => {
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

    const pantry = get().pantry ?? [];
    const pantryCount: { [key: string]: number } = {};
    pantry.forEach((p: PantryItem) => {
      const key = p.ingredient_name.toLowerCase();
      pantryCount[key] = p.quantity || 0;
    });

    const newIngredients: any[] = [];
    Object.entries(ingredientTotals).forEach(([key, neededQty]) => {
      const inPantry = pantryCount[key] || 0;
      const toBuy = Math.max(neededQty - inPantry, 0);

      const alreadyInShoppingList = (shoppingList ?? [])
        .filter(
          (item: ShoppingListItem) =>
            item.ingredient_name.toLowerCase() === key,
        )
        .map((item: ShoppingListItem) => item.meal_plan_id);

      let added = 0;
      for (const plan of mealPlans) {
        if (added < toBuy) {
          const ingredient = (ingredients ?? []).find(
            (ing: Ingredient) =>
              ing.recipe_id === plan.recipe_id &&
              ing.name.toLowerCase() === key,
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
      await supabase.from('shopping_list').insert(newIngredients);
    }

    const validMealPlanIds = new Set(mealPlans.map(plan => plan.id));
    const outdatedItems = (shoppingList ?? []).filter(
      (item: ShoppingListItem) => !validMealPlanIds.has(item.meal_plan_id),
    );

    if (outdatedItems.length > 0) {
      await supabase
        .from('shopping_list')
        .delete()
        .in(
          'id',
          outdatedItems.map((item: ShoppingListItem) => item.id),
        );
    }

    await get().fetchShoppingList(userId);
  },

  markAsChecked: async (item: ShoppingListItem, checked: boolean) => {
    await supabase
      .from('shopping_list')
      .update({ is_checked: checked })
      .eq('id', item.id);

    if (checked) {
      const { data: pantry } = await supabase
        .from('user_pantry')
        .select('*')
        .eq('user_id', item.user_id)
        .eq('ingredient_name', item.ingredient_name);

      const addQty = item.quantity ? Number(item.quantity) : 1;

      if (!pantry || pantry.length === 0) {
        await supabase.from('user_pantry').insert([
          {
            user_id: item.user_id,
            ingredient_name: item.ingredient_name,
            quantity: addQty,
          },
        ]);
      } else {
        await supabase
          .from('user_pantry')
          .update({ quantity: pantry[0].quantity + addQty })
          .eq('id', pantry[0].id);
      }
      await supabase.from('shopping_list').delete().eq('id', item.id);
      await get().fetchPantry(item.user_id);
    }

    await get().fetchShoppingList(item.user_id);
  },

  fetchPantry: async (userId: string) => {
    set({ loading: true });
    const { data } = await supabase
      .from('user_pantry')
      .select('*')
      .eq('user_id', userId);
    set({ pantry: data || [], loading: false });
  },

  deductIngredientsForRecipe: async (userId: string, recipeId: string) => {
    const { data: ingredients } = await supabase
      .from('ingredients')
      .select('name, quantity')
      .eq('recipe_id', recipeId);

    if (!ingredients) return;

    for (const ingredient of ingredients) {
      const { data: pantryItem } = await supabase
        .from('user_pantry')
        .select('*')
        .eq('user_id', userId)
        .eq('ingredient_name', ingredient.name);

      if (pantryItem && pantryItem.length > 0) {
        const deductQty = Number(ingredient.quantity) || 1;
        const newQty = pantryItem[0].quantity - deductQty;
        if (newQty > 0) {
          await supabase
            .from('user_pantry')
            .update({ quantity: newQty })
            .eq('id', pantryItem[0].id);
        } else {
          await supabase
            .from('user_pantry')
            .delete()
            .eq('id', pantryItem[0].id);
        }
      }
    }
    await get().fetchPantry(userId);
  },

  addToPantry: async (userId: string) => {
    console.log('user id', userId);
  },
}));
