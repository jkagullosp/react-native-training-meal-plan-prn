// ...existing code...
import { shopApi } from '@/api/shopApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data?: any; error?: any; count?: number };

function createChain(
  thenResp: ChainResp = { data: null, error: null },
  singleResp: ChainResp = { data: null, error: null },
) {
  const c: any = {};
  const methods = [
    'select',
    'eq',
    'in',
    'order',
    'insert',
    'update',
    'delete',
    'range',
  ];
  methods.forEach(m => (c[m] = jest.fn().mockReturnValue(c)));
  c.single = jest.fn().mockResolvedValue(singleResp);
  c.maybeSingle = jest.fn().mockResolvedValue(singleResp);
  c._thenResp = thenResp;
  c.then = jest.fn().mockImplementation(async (onFulfilled: any) => {
    try {
      onFulfilled(c._thenResp);
    } catch {
      /* noop */
    }
    return Promise.resolve(c._thenResp);
  });
  return c;
}

describe('ShopApi', () => {
  let supabase: any;
  let chains: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    chains = {
      meal_plans: createChain({
        data: [
          {
            id: 'mp1',
            recipe_id: 'r1',
            meal_date: '2025-11-25',
            meal_type: 'breakfast',
          },
        ],
        error: null,
      }),
      shopping_list: createChain({
        data: [
          {
            id: 'sl1',
            user_id: 'u1',
            ingredient_name: 'Egg',
            meal_plan_id: 'mp1',
          },
        ],
        error: null,
      }),
      recipes: createChain({
        data: [{ id: 'r1', title: 'Recipe 1' }],
        error: null,
      }),
      user_pantry: createChain({
        data: [
          { id: 'p1', user_id: 'u1', ingredient_name: 'Egg', quantity: 2 },
        ],
        error: null,
      }),
      ingredients: createChain({
        data: [{ id: 'ing1', name: 'Egg', quantity: 2, recipe_id: 'r1' }],
        error: null,
      }),
      default: createChain({ data: null, error: null }),
    };

    supabase.from = jest.fn((table: string) => chains[table] || chains.default);
  });

  it('fetchMealPlans queries meal_plans with userId and weekDates', async () => {
    const res = await shopApi.fetchMealPlans('u1', ['2025-11-25']);
    expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    expect(chains.meal_plans.select).toHaveBeenCalledWith(
      'id, recipe_id, meal_date, meal_type',
    );
    expect(chains.meal_plans.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chains.meal_plans.in).toHaveBeenCalledWith('meal_date', [
      '2025-11-25',
    ]);
    expect(res).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'mp1' })]),
    );
  });

  it('fetchShoppingListFilter returns shopping list filtered by recipeIds', async () => {
    const res = await shopApi.fetchShoppingListFilter('u1', ['r1']);
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    expect(chains.shopping_list.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chains.shopping_list.in).toHaveBeenCalledWith('recipe_id', ['r1']);
    expect(res).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'sl1' })]),
    );
  });

  it('fetchRecipesByIds returns [] for empty input and returns recipes when present', async () => {
    const empty = await shopApi.fetchRecipesByIds([]);
    expect(empty).toEqual([]);

    chains.recipes._thenResp = {
      data: [{ id: 'r2', title: 'R2' }],
      error: null,
    };
    const res = await shopApi.fetchRecipesByIds(['r2']);
    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(chains.recipes.in).toHaveBeenCalledWith('id', ['r2']);
    expect(res).toEqual([{ id: 'r2', title: 'R2' }]);
  });

  it('fetchPantry returns pantry items and throws ApiError on error', async () => {
    chains.user_pantry._thenResp = { data: [{ id: 'p1' }], error: null };
    const res = await shopApi.fetchPantry('u1');
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(res).toEqual([{ id: 'p1' }]);

    chains.user_pantry._thenResp = { data: null, error: new Error('db') };
    await expect(shopApi.fetchPantry('u1')).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('fetchIngredients and fetchIngredientForDeduct return ingredients', async () => {
    chains.ingredients._thenResp = {
      data: [{ id: 'ing1', name: 'Egg', quantity: 2, recipe_id: 'r1' }],
      error: null,
    };
    const res = await shopApi.fetchIngredients(['r1']);
    expect(supabase.from).toHaveBeenCalledWith('ingredients');
    expect(chains.ingredients.in).toHaveBeenCalledWith('recipe_id', ['r1']);
    expect(res).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Egg' })]),
    );

    chains.ingredients._thenResp = {
      data: [{ name: 'Egg', quantity: 2 }],
      error: null,
    };
    const ded = await shopApi.fetchIngredientForDeduct('r1');
    expect(chains.ingredients.eq).toHaveBeenCalledWith('recipe_id', 'r1');
    // changed to allow extra fields returned by the mock (quantity)
    expect(ded).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'Egg' })]),
    );
  });

  it('fetchPantryForDeduct returns pantry rows matching ingredient name', async () => {
    chains.user_pantry._thenResp = {
      data: [{ id: 'p1', ingredient_name: 'Egg' }],
      error: null,
    };
    const res = await shopApi.fetchPantryForDeduct('u1', {
      id: 'ing1',
      name: 'Egg',
      quantity: 2,
      recipe_id: 'r1',
      quantity_value: 2,
      created_at: '',
    } as any);
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(chains.user_pantry.eq).toHaveBeenCalledWith(
      'ingredient_name',
      'Egg',
    );
    expect(res).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'p1' })]),
    );
  });

  it('updatePantryQuantity and removeFromPantry call update/delete and handle errors', async () => {
    chains.user_pantry._thenResp = { data: null, error: null };
    await expect(
      shopApi.updatePantryQuantity(1, [
        {
          id: 'p1',
          quantity: 2,
          user_id: 'u1',
          ingredient_name: 'Egg',
          created_at: '',
        },
      ]),
    ).resolves.toBeUndefined();
    expect(chains.user_pantry.update).toHaveBeenCalled();
    expect(chains.user_pantry.eq).toHaveBeenCalledWith('id', 'p1');

    chains.user_pantry._thenResp = { data: null, error: null };
    await expect(
      shopApi.removeFromPantry([
        {
          id: 'p1',
          user_id: 'u1',
          ingredient_name: 'Egg',
          quantity: 2,
          created_at: '',
        },
      ]),
    ).resolves.toBeUndefined();
    expect(chains.user_pantry.delete).toHaveBeenCalled();
  });

  it('fetchShoppingList and addToShoppingList work and removeOutdatedItems uses .in', async () => {
    chains.shopping_list._thenResp = { data: [{ id: 'sl1' }], error: null };
    const list = await shopApi.fetchShoppingList('u1');
    expect(list).toEqual([{ id: 'sl1' }]);

    chains.shopping_list._thenResp = { data: null, error: null };
    await expect(
      shopApi.addToShoppingList([{ id: 'new' }]),
    ).resolves.toBeUndefined();
    expect(chains.shopping_list.insert).toHaveBeenCalledWith([{ id: 'new' }]);

    chains.shopping_list._thenResp = { data: null, error: null };
    await expect(
      shopApi.removeOutdatedItems(['x', 'y']),
    ).resolves.toBeUndefined();
    expect(chains.shopping_list.in).toHaveBeenCalledWith('id', ['x', 'y']);
  });

  it('updateShoppingListChecked updates is_checked', async () => {
    chains.shopping_list._thenResp = { data: null, error: null };
    await expect(
      shopApi.updateShoppingListChecked('sl1', true),
    ).resolves.toBeUndefined();
    expect(chains.shopping_list.update).toHaveBeenCalledWith({
      is_checked: true,
    });
    expect(chains.shopping_list.eq).toHaveBeenCalledWith('id', 'sl1');
  });

  it('getPantryItem returns first item or null', async () => {
    chains.user_pantry._thenResp = { data: [{ id: 'p1' }], error: null };
    const got = await shopApi.getPantryItem('u1', 'Egg');
    expect(got).toEqual({ id: 'p1' });

    chains.user_pantry._thenResp = { data: [], error: null };
    const none = await shopApi.getPantryItem('u1', 'Rice');
    expect(none).toBeNull();
  });

  it('insertPantryItem, updatePantryItemQuantity and deleteShoppingListItem throw on error', async () => {
    chains.user_pantry._thenResp = { data: null, error: new Error('ins') };
    await expect(
      shopApi.insertPantryItem('u1', 'Egg', 2),
    ).rejects.toBeInstanceOf(Error);

    chains.user_pantry._thenResp = { data: null, error: new Error('upd') };
    await expect(
      shopApi.updatePantryItemQuantity('p1', 3),
    ).rejects.toBeInstanceOf(Error);

    chains.shopping_list._thenResp = { data: null, error: new Error('del') };
    await expect(shopApi.deleteShoppingListItem('sl1')).rejects.toBeInstanceOf(
      Error,
    );
  });
});
