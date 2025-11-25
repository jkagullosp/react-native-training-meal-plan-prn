import * as shopService from '@/services/shopService';
import {
  ShoppingListItem,
  MealPlan,
  Recipe,
  PantryItem,
  Ingredient,
} from '@/types/shop';

const mockMealPlan: MealPlan = {
  id: 'mp1',
  user_id: 'user1',
  recipe_id: 'r1',
  meal_date: '2025-11-25',
  meal_type: 'breakfast',
};
const mockRecipe: Recipe = { id: 'r1', title: 'Recipe' };
const mockShoppingListItem: ShoppingListItem = {
  meal_plan_id: 'mp1',
  id: 'sl1',
  user_id: 'user1',
  recipe_id: 'r1',
  ingredient_name: 'Egg',
  is_checked: false,
  created_at: '',
  quantity: 2,
  unit: 'pcs',
  meal_date: '2025-11-25',
  meal_type: 'breakfast',
};
const mockPantryItem: PantryItem = {
  id: 'p1',
  user_id: 'user1',
  ingredient_name: 'Egg',
  quantity: 1,
  unit: 'pcs',
  created_at: '',
};
const mockIngredient: Ingredient = {
  id: 'i1',
  name: 'Egg',
  quantity: 2,
  recipe_id: 'r1',
  quantity_value: 2,
  unit: 'pcs',
  created_at: '',
};

jest.mock('@/api/shopApi', () => ({
  shopApi: {
    fetchMealPlans: jest.fn(async (_userId, _weekDates) => [mockMealPlan]),
    fetchShoppingListFilter: jest.fn(async (_userId, _recipeIds) => [
      mockShoppingListItem,
    ]),
    fetchRecipesByIds: jest.fn(async _recipeIds => [mockRecipe]),
    fetchPantry: jest.fn(async _userId => [mockPantryItem]),
    fetchIngredients: jest.fn(async _recipeIds => [mockIngredient]),
    fetchIngredientForDeduct: jest.fn(async _recipeId => [mockIngredient]),
    fetchPantryForDeduct: jest.fn(async (_userId, _ingredient) => [
      mockPantryItem,
    ]),
    updatePantryQuantity: jest.fn(async (_newQty, _pantryItem) => {}),
    removeFromPantry: jest.fn(async _pantryItem => {}),
    fetchShoppingList: jest.fn(async _userId => [mockShoppingListItem]),
    addToShoppingList: jest.fn(async _newIngredients => {}),
    removeOutdatedItems: jest.fn(async _outdatedItems => {}),
    updateShoppingListChecked: jest.fn(async (_id, _checked) => {}),
    getPantryItem: jest.fn(async (_userId, _ingredientName) => mockPantryItem),
    insertPantryItem: jest.fn(
      async (_userId, _ingredientName, _quantity) => {},
    ),
    updatePantryItemQuantity: jest.fn(async (_id, _quantity) => {}),
    deleteShoppingListItem: jest.fn(async _id => {}),
    removeShoppingListByMealPlan: jest.fn(async _mealPlanId => {}),
  },
}));

jest.mock('@/api/mealApi', () => ({
  mealApi: {
    fetchMealHistory: jest.fn(async _userId => []),
    removeMealplan: jest.fn(async _mealPlanId => {}),
  },
}));

describe('shopService', () => {
  // @ts-ignore
  const { shopApi } = require('@/api/shopApi');
  // @ts-ignore
  const { mealApi } = require('@/api/mealApi');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches shopping list filter', async () => {
    const result = await shopService.fetchShoppingListFilter('user1');
    expect(shopApi.fetchMealPlans).toHaveBeenCalled();
    expect(shopApi.fetchShoppingListFilter).toHaveBeenCalled();
    expect(result).toEqual([mockShoppingListItem]);
  });

  it('fetches meal plans and recipes', async () => {
    const result = await shopService.fetchMealPlansAndRecipes('user1');
    expect(shopApi.fetchMealPlans).toHaveBeenCalled();
    expect(shopApi.fetchRecipesByIds).toHaveBeenCalled();
    expect(result.mealPlanMap).toHaveProperty('mp1');
    expect(result.recipeMap).toHaveProperty('r1');
  });

  it('adds missing ingredients', async () => {
    await shopService.addMissingIngredients('user1');
    expect(shopApi.addToShoppingList).toHaveBeenCalled();
    expect(shopApi.removeOutdatedItems).toHaveBeenCalled();
    expect(shopApi.fetchShoppingList).toHaveBeenCalled();
  });

  it('marks item as checked and updates pantry', async () => {
    await shopService.markAsChecked(mockShoppingListItem, true);
    expect(shopApi.updateShoppingListChecked).toHaveBeenCalledWith('sl1', true);
    expect(shopApi.getPantryItem).toHaveBeenCalledWith('user1', 'Egg');
    expect(shopApi.updatePantryItemQuantity).toHaveBeenCalledWith('p1', 3);
    expect(shopApi.deleteShoppingListItem).toHaveBeenCalledWith('sl1');
  });

  it('marks item as checked and inserts pantry if not exists', async () => {
    shopApi.getPantryItem.mockResolvedValueOnce(null);
    await shopService.markAsChecked(mockShoppingListItem, true);
    expect(shopApi.insertPantryItem).toHaveBeenCalledWith('user1', 'Egg', 2);
    expect(shopApi.deleteShoppingListItem).toHaveBeenCalledWith('sl1');
  });

  it('deducts ingredients for recipe and updates pantry', async () => {
    await shopService.deductIngredientsForRecipe('user1', 'r1');
    expect(shopApi.fetchIngredientForDeduct).toHaveBeenCalledWith('r1');
    expect(shopApi.fetchPantryForDeduct).toHaveBeenCalledWith(
      'user1',
      mockIngredient,
    );
    expect(shopApi.updatePantryQuantity).toHaveBeenCalled();
    expect(shopApi.fetchPantry).toHaveBeenCalledWith('user1');
  });

  it('deducts ingredients for recipe and removes from pantry if newQty <= 0', async () => {
    shopApi.fetchPantryForDeduct.mockResolvedValueOnce([
      { ...mockPantryItem, quantity: 1 },
    ]);
    shopApi.fetchIngredientForDeduct.mockResolvedValueOnce([
      { ...mockIngredient, quantity: 2 },
    ]);
    await shopService.deductIngredientsForRecipe('user1', 'r1');
    expect(shopApi.removeFromPantry).toHaveBeenCalled();
  });

  it('removes meal plan and shopping list', async () => {
    await shopService.removeMealPlanAndShoppingList('mp1');
    expect(mealApi.removeMealplan).toHaveBeenCalledWith('mp1');
    expect(shopApi.removeShoppingListByMealPlan).toHaveBeenCalledWith('mp1');
  });

  it('fetches pantry', async () => {
    const result = await shopService.fetchPantry('user1');
    expect(shopApi.fetchPantry).toHaveBeenCalledWith('user1');
    expect(result).toEqual([mockPantryItem]);
  });

  it('fetches meal plans', async () => {
    const result = await shopService.fetchMealPlans('user1', ['2025-11-25']);
    expect(shopApi.fetchMealPlans).toHaveBeenCalledWith('user1', [
      '2025-11-25',
    ]);
    expect(result).toEqual([mockMealPlan]);
  });

  it('fetches ingredients', async () => {
    const result = await shopService.fetchIngredients(['r1']);
    expect(shopApi.fetchIngredients).toHaveBeenCalledWith(['r1']);
    expect(result).toEqual([mockIngredient]);
  });

  it('fetches shopping list', async () => {
    const result = await shopService.fetchShoppingList('user1');
    expect(shopApi.fetchShoppingList).toHaveBeenCalledWith('user1');
    expect(result).toEqual([mockShoppingListItem]);
  });

  it('adds to shopping list', async () => {
    await shopService.addToShoppingList([mockShoppingListItem]);
    expect(shopApi.addToShoppingList).toHaveBeenCalledWith([
      mockShoppingListItem,
    ]);
  });

  it('removes outdated items', async () => {
    await shopService.removeOutdatedItems(['sl1']);
    expect(shopApi.removeOutdatedItems).toHaveBeenCalledWith(['sl1']);
  });

  // Error branches
  it('handles error in fetchShoppingListFilter', async () => {
    shopApi.fetchMealPlans.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.fetchShoppingListFilter('user1')).rejects.toThrow(
      'fail',
    );
  });

  // Branch coverage edge cases
  it('fetchShoppingListFilter returns [] if mealPlans is falsy', async () => {
    shopApi.fetchMealPlans.mockResolvedValueOnce(null);
    const result = await shopService.fetchShoppingListFilter('user1');
    expect(result).toEqual([]);
  });

  it('fetchShoppingListFilter returns [] if recipeIds is empty', async () => {
    shopApi.fetchMealPlans.mockResolvedValueOnce([
      { ...mockMealPlan, recipe_id: '' },
    ]);
    const result = await shopService.fetchShoppingListFilter('user1');
    expect(result).toEqual([]);
  });

  it('fetchMealPlansAndRecipes returns empty maps if mealPlans is falsy', async () => {
    shopApi.fetchMealPlans.mockResolvedValueOnce(null);
    const result = await shopService.fetchMealPlansAndRecipes('user1');
    expect(result).toEqual({ mealPlanMap: {}, recipeMap: {} });
  });

  it('fetchMealPlansAndRecipes returns empty recipeMap if recipeIds.size is 0', async () => {
    shopApi.fetchMealPlans.mockResolvedValueOnce([
      { ...mockMealPlan, recipe_id: '' },
    ]);
    const result = await shopService.fetchMealPlansAndRecipes('user1');
    expect(result.recipeMap).toEqual({});
  });

  it('addMissingIngredients returns if pantry is falsy', async () => {
    shopApi.fetchPantry.mockResolvedValueOnce(null);
    await expect(
      shopService.addMissingIngredients('user1'),
    ).resolves.toBeUndefined();
  });

  it('addMissingIngredients returns if mealPlans is falsy', async () => {
    shopApi.fetchPantry.mockResolvedValueOnce([mockPantryItem]);
    shopApi.fetchMealPlans.mockResolvedValueOnce(null);
    await expect(
      shopService.addMissingIngredients('user1'),
    ).resolves.toBeUndefined();
  });

  it('addMissingIngredients returns if recipeIds is empty', async () => {
    shopApi.fetchPantry.mockResolvedValueOnce([mockPantryItem]);
    shopApi.fetchMealPlans.mockResolvedValueOnce([
      { ...mockMealPlan, recipe_id: '' },
    ]);
    await expect(
      shopService.addMissingIngredients('user1'),
    ).resolves.toBeUndefined();
  });

  it('addMissingIngredients does not call addToShoppingList if newIngredients.length is 0', async () => {
    shopApi.fetchPantry.mockResolvedValueOnce([mockPantryItem]);
    shopApi.fetchMealPlans.mockResolvedValueOnce([mockMealPlan]);
    shopApi.fetchIngredients.mockResolvedValueOnce([]);
    shopApi.fetchShoppingList.mockResolvedValueOnce([]);
    await shopService.addMissingIngredients('user1');
    expect(shopApi.addToShoppingList).not.toHaveBeenCalled();
  });

  it('addMissingIngredients does not call removeOutdatedItems if outdatedItems.length is 0', async () => {
    shopApi.fetchPantry.mockResolvedValueOnce([mockPantryItem]);
    shopApi.fetchMealPlans.mockResolvedValueOnce([mockMealPlan]);
    shopApi.fetchIngredients.mockResolvedValueOnce([mockIngredient]);
    shopApi.fetchShoppingList.mockResolvedValueOnce([]);
    await shopService.addMissingIngredients('user1');
    expect(shopApi.removeOutdatedItems).not.toHaveBeenCalled();
  });

  it('markAsChecked only calls updateShoppingListChecked if checked is false', async () => {
    await shopService.markAsChecked(mockShoppingListItem, false);
    expect(shopApi.updateShoppingListChecked).toHaveBeenCalledWith(
      'sl1',
      false,
    );
    expect(shopApi.getPantryItem).not.toHaveBeenCalled();
    expect(shopApi.insertPantryItem).not.toHaveBeenCalled();
    expect(shopApi.updatePantryItemQuantity).not.toHaveBeenCalled();
    expect(shopApi.deleteShoppingListItem).not.toHaveBeenCalled();
  });

  it('deductIngredientsForRecipe returns if ingredients is falsy', async () => {
    shopApi.fetchIngredientForDeduct.mockResolvedValueOnce(null);
    await expect(
      shopService.deductIngredientsForRecipe('user1', 'r1'),
    ).resolves.toBeUndefined();
  });

  it('deductIngredientsForRecipe skips if pantryItem is empty', async () => {
    shopApi.fetchIngredientForDeduct.mockResolvedValueOnce([mockIngredient]);
    shopApi.fetchPantryForDeduct.mockResolvedValueOnce([]);
    await shopService.deductIngredientsForRecipe('user1', 'r1');
    expect(shopApi.updatePantryQuantity).not.toHaveBeenCalled();
    expect(shopApi.removeFromPantry).not.toHaveBeenCalled();
  });

  it('handles error in fetchMealPlansAndRecipes', async () => {
    shopApi.fetchMealPlans.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.fetchMealPlansAndRecipes('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in addMissingIngredients', async () => {
    shopApi.fetchPantry.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.addMissingIngredients('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in markAsChecked', async () => {
    shopApi.updateShoppingListChecked.mockRejectedValueOnce(new Error('fail'));
    await expect(
      shopService.markAsChecked(mockShoppingListItem, true),
    ).rejects.toThrow('fail');
  });

  it('handles error in deductIngredientsForRecipe', async () => {
    shopApi.fetchIngredientForDeduct.mockRejectedValueOnce(new Error('fail'));
    await expect(
      shopService.deductIngredientsForRecipe('user1', 'r1'),
    ).rejects.toThrow('fail');
  });

  it('handles error in removeMealPlanAndShoppingList', async () => {
    mealApi.removeMealplan.mockRejectedValueOnce(new Error('fail'));
    await expect(
      shopService.removeMealPlanAndShoppingList('mp1'),
    ).rejects.toThrow('fail');
  });

  it('handles error in fetchPantry', async () => {
    shopApi.fetchPantry.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.fetchPantry('user1')).rejects.toThrow('fail');
  });

  it('handles error in fetchMealPlans', async () => {
    shopApi.fetchMealPlans.mockRejectedValueOnce(new Error('fail'));
    await expect(
      shopService.fetchMealPlans('user1', ['2025-11-25']),
    ).rejects.toThrow('fail');
  });

  it('handles error in fetchIngredients', async () => {
    shopApi.fetchIngredients.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.fetchIngredients(['r1'])).rejects.toThrow('fail');
  });

  it('handles error in fetchShoppingList', async () => {
    shopApi.fetchShoppingList.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.fetchShoppingList('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in addToShoppingList', async () => {
    shopApi.addToShoppingList.mockRejectedValueOnce(new Error('fail'));
    await expect(
      shopService.addToShoppingList([mockShoppingListItem]),
    ).rejects.toThrow('fail');
  });

  it('handles error in removeOutdatedItems', async () => {
    shopApi.removeOutdatedItems.mockRejectedValueOnce(new Error('fail'));
    await expect(shopService.removeOutdatedItems(['sl1'])).rejects.toThrow(
      'fail',
    );
  });
});
