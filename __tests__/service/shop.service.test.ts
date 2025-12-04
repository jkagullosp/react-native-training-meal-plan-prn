import * as shopService from '@/services/shopService';
import {
  ShoppingListItem,
  MealPlan,
  // Recipe,
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
// const mockRecipe: Recipe = { id: 'r1', title: 'Recipe' };
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
    fetchMealPlans: jest.fn(),
    fetchShoppingListFilter: jest.fn(),
    fetchRecipesByIds: jest.fn(),
    fetchPantry: jest.fn(),
    fetchIngredients: jest.fn(),
    fetchIngredientForDeduct: jest.fn(),
    fetchPantryForDeduct: jest.fn(),
    updatePantryQuantity: jest.fn(),
    removeFromPantry: jest.fn(),
    fetchShoppingList: jest.fn(),
    addToShoppingList: jest.fn(),
    removeOutdatedItems: jest.fn(),
    updateShoppingListChecked: jest.fn(),
    getPantryItem: jest.fn(),
    insertPantryItem: jest.fn(),
    updatePantryItemQuantity: jest.fn(),
    deleteShoppingListItem: jest.fn(),
    removeShoppingListByMealPlan: jest.fn(),
  },
}));

jest.mock('@/api/mealApi', () => ({
  mealApi: {
    fetchMealHistory: jest.fn(),
    removeMealplan: jest.fn(),
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

  it('adds missing ingredients', async () => {
    // Pantry only has 1 Egg, but meal plan needs 2 Eggs
    shopApi.fetchPantry.mockResolvedValue([{ ...mockPantryItem, quantity: 1 }]);
    shopApi.fetchMealPlans.mockResolvedValue([mockMealPlan]);
    mealApi.fetchMealHistory.mockResolvedValue([]); // No meals done
    shopApi.fetchIngredients.mockResolvedValue([
      { ...mockIngredient, quantity: 2 },
    ]);
    // Shopping list is empty, so everything is missing
    shopApi.fetchShoppingList.mockResolvedValue([
      { ...mockShoppingListItem, meal_plan_id: 'outdated' }, // One outdated item
    ]);

    await shopService.addMissingIngredients('user1');

    expect(shopApi.addToShoppingList).toHaveBeenCalled();
    expect(shopApi.removeOutdatedItems).toHaveBeenCalled();
    expect(shopApi.fetchShoppingList).toHaveBeenCalled();
  });

  it('deducts ingredients for recipe and updates pantry', async () => {
    // Pantry has 5 Eggs, recipe needs 2 Eggs, so newQty = 3 (> 0)
    shopApi.fetchIngredientForDeduct.mockResolvedValue([
      { ...mockIngredient, quantity: 2 },
    ]);
    shopApi.fetchPantryForDeduct.mockResolvedValue([
      { ...mockPantryItem, quantity: 5 },
    ]);
    shopApi.updatePantryQuantity.mockResolvedValue();
    shopApi.fetchPantry.mockResolvedValue([mockPantryItem]);

    await shopService.deductIngredientsForRecipe('user1', 'r1');

    expect(shopApi.fetchIngredientForDeduct).toHaveBeenCalledWith('r1');
    expect(shopApi.fetchPantryForDeduct).toHaveBeenCalledWith('user1', {
      ...mockIngredient,
      quantity: 2,
    });
    expect(shopApi.updatePantryQuantity).toHaveBeenCalled();
    expect(shopApi.fetchPantry).toHaveBeenCalledWith('user1');
  });

  it('deducts ingredients for recipe and removes from pantry if newQty <= 0', async () => {
    shopApi.fetchIngredientForDeduct.mockResolvedValue([
      { ...mockIngredient, quantity: 2 },
    ]);
    shopApi.fetchPantryForDeduct.mockResolvedValue([
      { ...mockPantryItem, quantity: 1 },
    ]);
    shopApi.removeFromPantry.mockResolvedValue();
    shopApi.fetchPantry.mockResolvedValue([mockPantryItem]);

    await shopService.deductIngredientsForRecipe('user1', 'r1');

    expect(shopApi.removeFromPantry).toHaveBeenCalled();
  });

  // Additional tests for other scenarios...
});
