import { pantryApi } from '@/api/pantryApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data: any; error: any };

function createChain(
  thenResp: ChainResp = { data: null, error: null },
  singleResp: ChainResp = { data: null, error: null },
) {
  const c: any = {};
  const methods = [
    'select',
    'eq',
    'order',
    'insert',
    'update',
    'delete',
    'in',
    'limit',
    'gte',
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

describe('PantryApi', () => {
  let supabase: any;
  let chainMap: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    chainMap = {
      shopping_list: createChain({
        data: [
          { id: 's1', user_id: 'u1', ingredient_name: 'rice', quantity: 3 },
        ],
        error: null,
      }),
      user_pantry: createChain({
        data: [
          { id: 'p1', user_id: 'u1', ingredient_name: 'rice', quantity: 5 },
        ],
        error: null,
      }),
      default: createChain({ data: null, error: null }),
    };

    supabase.from = jest.fn(
      (table: string) => chainMap[table] || chainMap.default,
    );
  });

  it('fetchShoppingListItems queries shopping_list and returns data', async () => {
    const res = await pantryApi.fetchShoppingListItems('u1', 'rice');
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    const chain = chainMap.shopping_list;
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chain.eq).toHaveBeenCalledWith('ingredient_name', 'rice');
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(res).toEqual([
      { id: 's1', user_id: 'u1', ingredient_name: 'rice', quantity: 3 },
    ]);
  });

  it('fetchShoppingListItems throws ApiError when db returns error', async () => {
    chainMap.shopping_list._thenResp = { data: null, error: new Error('db') };
    await expect(
      pantryApi.fetchShoppingListItems('u1', 'rice'),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('removeFromShoppingList calls delete with eq id and resolves', async () => {
    chainMap.shopping_list._thenResp = { data: null, error: null };
    const item = { id: 's1' };
    await expect(
      pantryApi.removeFromShoppingList(item),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    expect(chainMap.shopping_list.delete).toHaveBeenCalled();
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith('id', 's1');
  });

  it('removeFromShoppingList throws ApiError on db error', async () => {
    chainMap.shopping_list._thenResp = {
      data: null,
      error: new Error('delete-fail'),
    };
    await expect(
      pantryApi.removeFromShoppingList({ id: 'x' }),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('deductQuantityToShoppingList updates quantity and resolves', async () => {
    chainMap.shopping_list._thenResp = { data: null, error: null };
    const item = { id: 's1' };
    await expect(
      pantryApi.deductQuantityToShoppingList(item, 10, 4),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    expect(chainMap.shopping_list.update).toHaveBeenCalledWith({ quantity: 6 });
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith('id', 's1');
  });

  it('deductQuantityToShoppingList throws ApiError on update error', async () => {
    chainMap.shopping_list._thenResp = {
      data: null,
      error: new Error('update-fail'),
    };
    await expect(
      pantryApi.deductQuantityToShoppingList({ id: 'sX' }, 2, 1),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('addQuantityToShoppingList updates user_pantry and resolves', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: null };
    const exists = { id: 'p1', quantity: 2 };
    await expect(
      pantryApi.addQuantityToShoppingList(2, exists as any, 3, 'g', {
        name: 'rice',
        quantity: '3',
        unit: 'g',
      } as any),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(chainMap.user_pantry.update).toHaveBeenCalledWith(
      expect.objectContaining({ quantity: 5 }),
    );
    expect(chainMap.user_pantry.eq).toHaveBeenCalledWith('id', 'p1');
  });

  it('addQuantityToShoppingList throws ApiError on update error', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: new Error('upd') };
    const exists = { id: 'p1', quantity: 2 };
    await expect(
      pantryApi.addQuantityToShoppingList(2, exists as any, 3, 'g', {
        name: 'rice',
        quantity: '3',
        unit: 'g',
      } as any),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('insertToShoppingList inserts row and resolves', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: null };
    const user = { id: 'u1' } as any;
    await expect(
      pantryApi.insertToShoppingList(user, 2, 'g', 2, {
        name: 'rice',
        quantity: '2',
        unit: 'g',
      } as any),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(chainMap.user_pantry.insert).toHaveBeenCalledWith(expect.any(Array));
  });

  it('insertToShoppingList throws ApiError on insert error', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: new Error('ins') };
    const user = { id: 'u1' } as any;
    await expect(
      pantryApi.insertToShoppingList(user, 2, 'g', 2, {
        name: 'rice',
        quantity: '2',
        unit: 'g',
      } as any),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('deletePantryItem calls delete and resolves', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: null };
    await expect(pantryApi.deletePantryItem('p1')).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(chainMap.user_pantry.delete).toHaveBeenCalled();
    expect(chainMap.user_pantry.eq).toHaveBeenCalledWith('id', 'p1');
  });

  it('updatePantryItemQuantity updates and resolves', async () => {
    chainMap.user_pantry._thenResp = { data: null, error: null };
    await expect(
      pantryApi.updatePantryItemQuantity('p1', 9, 'g'),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
    expect(chainMap.user_pantry.update).toHaveBeenCalledWith({
      quantity: 9,
      unit: 'g',
    });
    expect(chainMap.user_pantry.eq).toHaveBeenCalledWith('id', 'p1');
  });

  it('insertPantryItem throws ApiError when userId missing and when insert fails', async () => {
    // missing userId -> underlying function throws; pantryApi should wrap and throw ApiError
    await expect(
      pantryApi.insertPantryItem('', { name: 'x', quantity: '1', unit: '' }, 1),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();

    // insert error
    chainMap.user_pantry._thenResp = {
      data: null,
      error: new Error('ins-fail'),
    };
    await expect(
      pantryApi.insertPantryItem(
        'u1',
        { name: 'x', quantity: '1', unit: '' },
        1,
      ),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
