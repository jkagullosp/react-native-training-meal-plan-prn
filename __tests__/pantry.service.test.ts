import { Profile } from '@/types/auth';
import { PantryItem } from '@/types/shop';
import { newIngredient } from '@/types/pantry';
import * as pantryService from '@/services/pantryService';

const userProfile: Profile = {
  id: 'user1',
  username: 'admin',
  display_name: 'Admin',
  profile_image: null,
  bio: null,
  created_at: '',
  updated_at: '',
  is_admin: true,
  status: 'active',
  suspended_until: '',
  email: '',
};

const pantryItem: PantryItem = {
  id: 'item1',
  user_id: 'user1',
  ingredient_name: 'rice',
  quantity: 2,
  unit: 'g',
  created_at: '',
};

const ingredientData: newIngredient = {
  name: 'rice',
  quantity: '5',
  unit: 'g',
};

jest.mock('@/api/pantryApi', () => ({
  pantryApi: {
    fetchShoppingListItems: jest.fn(async (_userId, _ingredientName) => [
      {
        id: 'item1',
        user_id: 'user1',
        ingredient_name: 'rice',
        quantity: 2,
        unit: 'g',
      },
    ]),
    removeFromShoppingList: jest.fn(async _item => {}),
    deductQuantityToShoppingList: jest.fn(
      async (_item, _itemQty, _remaining) => {},
    ),
    addQuantityToShoppingList: jest.fn(
      async (_quantity, _exists, _addQty, _unit, _ingredientData) => {},
    ),
    insertToShoppingList: jest.fn(
      async (_user, _quantity, _unit, _addQty, _ingredientData) => {},
    ),
    deletePantryItem: jest.fn(async _itemId => {}),
    updatePantryItemQuantity: jest.fn(async (_itemId, _newQty, _unit) => {}),
    insertPantryItem: jest.fn(async (_userId, _ingredient, _addQty) => {}),
  },
}));

describe('pantryService', () => {
  const { pantryApi } = require('@/api/pantryApi');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds a new ingredient to pantry (calls insertPantryItem and deductFromShoppingList)', async () => {
    const pantry: PantryItem[] = [];
    await pantryService.addToPantry(userProfile.id, ingredientData, pantry);
    expect(pantryApi.insertPantryItem).toHaveBeenCalledWith(
      userProfile.id,
      ingredientData,
      Number(ingredientData.quantity),
    );
    expect(pantryApi.fetchShoppingListItems).toHaveBeenCalledWith(
      userProfile.id,
      ingredientData.name.trim(),
    );
    expect(pantryApi.removeFromShoppingList).toHaveBeenCalled();
  });

  it('updates an existing pantry item (calls updatePantryItemQuantity and deductFromShoppingList)', async () => {
    const pantry: PantryItem[] = [pantryItem];
    await pantryService.addToPantry(userProfile.id, ingredientData, pantry);
    expect(pantryApi.updatePantryItemQuantity).toHaveBeenCalledWith(
      pantryItem.id,
      pantryItem.quantity + Number(ingredientData.quantity),
      ingredientData.unit || pantryItem.unit || '',
    );
    expect(pantryApi.fetchShoppingListItems).toHaveBeenCalledWith(
      userProfile.id,
      ingredientData.name.trim(),
    );
    expect(pantryApi.removeFromShoppingList).toHaveBeenCalled();
  });

  it('deducts from shopping list (calls fetchShoppingListItems, removeFromShoppingList, deductQuantityToShoppingList)', async () => {
    // Simulate a shopping list with enough quantity to require deduction
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: 10 },
    ]);
    await pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g');
    expect(pantryApi.fetchShoppingListItems).toHaveBeenCalledWith(
      userProfile.id,
      'rice',
    );
    expect(pantryApi.deductQuantityToShoppingList).toHaveBeenCalledWith(
      expect.objectContaining({ id: pantryItem.id }),
      10,
      5,
    );
  });

  it('handles error from pantryApi in addToPantry', async () => {
    pantryApi.insertPantryItem.mockRejectedValueOnce(new Error('fail'));
    const pantry: PantryItem[] = [];
    await expect(
      pantryService.addToPantry(userProfile.id, ingredientData, pantry),
    ).rejects.toThrow('fail');
  });

  it('handles error from pantryApi in deductFromShoppingList', async () => {
    pantryApi.fetchShoppingListItems.mockRejectedValueOnce(new Error('fail'));
    await expect(
      pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g'),
    ).rejects.toThrow('fail');
  });

  it('does nothing if userId is missing in addToPantry', async () => {
    const pantry: PantryItem[] = [];
    await pantryService.addToPantry('', ingredientData, pantry);
    expect(pantryApi.insertPantryItem).not.toHaveBeenCalled();
    expect(pantryApi.updatePantryItemQuantity).not.toHaveBeenCalled();
    expect(pantryApi.fetchShoppingListItems).not.toHaveBeenCalled();
  });

  it('does nothing if ingredient name is missing in addToPantry', async () => {
    const pantry: PantryItem[] = [];
    const badIngredient = { ...ingredientData, name: '' };
    await pantryService.addToPantry(userProfile.id, badIngredient, pantry);
    expect(pantryApi.insertPantryItem).not.toHaveBeenCalled();
    expect(pantryApi.updatePantryItemQuantity).not.toHaveBeenCalled();
    expect(pantryApi.fetchShoppingListItems).not.toHaveBeenCalled();
  });

  it('handles pantry item with no unit', async () => {
    const pantry: PantryItem[] = [{ ...pantryItem, unit: '' }];
    await pantryService.addToPantry(userProfile.id, ingredientData, pantry);
    expect(pantryApi.updatePantryItemQuantity).toHaveBeenCalledWith(
      pantryItem.id,
      pantryItem.quantity + Number(ingredientData.quantity),
      ingredientData.unit || '',
    );
  });

  it('deductFromShoppingList does nothing if userId is missing', async () => {
    await pantryService.deductFromShoppingList('', 'rice', 5, 'g');
    expect(pantryApi.fetchShoppingListItems).not.toHaveBeenCalled();
    expect(pantryApi.removeFromShoppingList).not.toHaveBeenCalled();
    expect(pantryApi.deductQuantityToShoppingList).not.toHaveBeenCalled();
  });

  it('deductFromShoppingList removes item if itemQty <= remaining', async () => {
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: 2 },
    ]);
    await pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g');
    expect(pantryApi.removeFromShoppingList).toHaveBeenCalledWith(
      expect.objectContaining({ id: pantryItem.id }),
    );
    expect(pantryApi.deductQuantityToShoppingList).not.toHaveBeenCalled();
  });

  it('deductFromShoppingList does nothing if shoppingItems is empty', async () => {
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([]);
    await pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g');
    expect(pantryApi.removeFromShoppingList).not.toHaveBeenCalled();
    expect(pantryApi.deductQuantityToShoppingList).not.toHaveBeenCalled();
  });

  it('addToPantry uses default quantity if not provided', async () => {
    const pantry: PantryItem[] = [];
    const noQtyIngredient = { ...ingredientData, quantity: '' };
    await pantryService.addToPantry(userProfile.id, noQtyIngredient, pantry);
    expect(pantryApi.insertPantryItem).toHaveBeenCalledWith(
      userProfile.id,
      noQtyIngredient,
      1,
    );
  });

  it('deductFromShoppingList breaks early when remaining <= 0', async () => {
    // Simulate two items, first will consume all remaining
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: 5 },
      { ...pantryItem, id: 'item2', quantity: 2 },
    ]);
    await pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g');
    expect(pantryApi.removeFromShoppingList).toHaveBeenCalledWith(
      expect.objectContaining({ id: pantryItem.id }),
    );
    // Second item should not be touched
    expect(pantryApi.removeFromShoppingList).not.toHaveBeenCalledWith(
      expect.objectContaining({ id: 'item2' }),
    );
  });

  it('deductFromShoppingList uses default itemQty if not a number', async () => {
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: undefined },
    ]);
    await pantryService.deductFromShoppingList(userProfile.id, 'rice', 1, 'g');
    expect(pantryApi.removeFromShoppingList).toHaveBeenCalledWith(
      expect.objectContaining({ id: pantryItem.id }),
    );
  });

  it('handles error from pantryApi.deductQuantityToShoppingList', async () => {
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: 10 },
    ]);
    pantryApi.deductQuantityToShoppingList.mockRejectedValueOnce(
      new Error('deduct error'),
    );
    await expect(
      pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g'),
    ).rejects.toThrow('deduct error');
  });

  it('handles error from pantryApi.removeFromShoppingList', async () => {
    pantryApi.fetchShoppingListItems.mockResolvedValueOnce([
      { ...pantryItem, quantity: 2 },
    ]);
    pantryApi.removeFromShoppingList.mockRejectedValueOnce(
      new Error('remove error'),
    );
    await expect(
      pantryService.deductFromShoppingList(userProfile.id, 'rice', 5, 'g'),
    ).rejects.toThrow('remove error');
  });

  it('handles error from pantryApi.updatePantryItemQuantity in addToPantry', async () => {
    pantryApi.updatePantryItemQuantity.mockRejectedValueOnce(
      new Error('update error'),
    );
    const pantry: PantryItem[] = [pantryItem];
    await expect(
      pantryService.addToPantry(userProfile.id, ingredientData, pantry),
    ).rejects.toThrow('update error');
  });
});
