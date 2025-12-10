import * as pantryService from '@/services/pantryService';
import { pantryApi } from '@/api/pantryApi';
import { newIngredient } from '@/types/pantry';
import { PantryItem } from '@/types/shop';

describe('pantryService + pantryApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('addToPantry calls pantryApi.insertPantryItem if ingredient does not exist', async () => {
    const userId = 'user1';
    const ingredient: newIngredient = {
      name: 'Apple',
      quantity: '2',
      unit: 'pcs',
    };
    const pantry: PantryItem[] = [];

    const insertSpy = jest
      .spyOn(pantryApi, 'insertPantryItem')
      .mockResolvedValue(undefined);
    const updateSpy = jest
      .spyOn(pantryApi, 'updatePantryItemQuantity')
      .mockResolvedValue(undefined);

    await pantryService.addToPantry(userId, ingredient, pantry);

    expect(insertSpy).toHaveBeenCalledWith(userId, ingredient, 2);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('addToPantry calls pantryApi.updatePantryItemQuantity if ingredient exists', async () => {
    const userId = 'user1';
    const ingredient: newIngredient = {
      name: 'Banana',
      quantity: '3',
      unit: 'pcs',
    };
    const pantry: PantryItem[] = [
      {
        id: 'item1',
        ingredient_name: 'Banana',
        quantity: 5,
        unit: 'pcs',
        user_id: userId,
        created_at: '',
      },
    ];

    const insertSpy = jest
      .spyOn(pantryApi, 'insertPantryItem')
      .mockResolvedValue(undefined);
    const updateSpy = jest
      .spyOn(pantryApi, 'updatePantryItemQuantity')
      .mockResolvedValue(undefined);

    await pantryService.addToPantry(userId, ingredient, pantry);

    expect(updateSpy).toHaveBeenCalledWith('item1', 8, 'pcs');
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it('deductFromShoppingList calls pantryApi.fetchShoppingListItems and removes/deducts items', async () => {
    const userId = 'user1';
    const ingredientName = 'Orange';
    const addQty = 4;
    const unit = 'pcs';

    const shoppingItems = [
      { id: 'shop1', ingredient_name: 'Orange', quantity: 2 },
      { id: 'shop2', ingredient_name: 'Orange', quantity: 3 },
    ];

    const fetchSpy = jest
      .spyOn(pantryApi, 'fetchShoppingListItems')
      .mockResolvedValue(shoppingItems);
    const removeSpy = jest
      .spyOn(pantryApi, 'removeFromShoppingList')
      .mockResolvedValue(undefined);
    const deductSpy = jest
      .spyOn(pantryApi, 'deductQuantityToShoppingList')
      .mockResolvedValue(undefined);

    await pantryService.deductFromShoppingList(
      userId,
      ingredientName,
      addQty,
      unit,
    );

    expect(fetchSpy).toHaveBeenCalledWith(userId, ingredientName);
    expect(removeSpy).toHaveBeenCalledWith(shoppingItems[0]);
    expect(deductSpy).toHaveBeenCalledWith(shoppingItems[1], 3, 2);
  });
});
