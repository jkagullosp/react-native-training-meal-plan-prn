import { useShoppingListStore } from './useShoppingListStore';
import { supabase } from '../../utils/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

beforeEach(() => {
  useShoppingListStore.setState({
    shoppingList: [],
    loading: false,
    mealPlanMap: {},
    recipeMap: {},
    pantry: [],
    fetchShoppingList: useShoppingListStore.getState().fetchShoppingList,
    fetchMealPlansAndRecipes: useShoppingListStore.getState().fetchMealPlansAndRecipes,
    addMissingIngredients: useShoppingListStore.getState().addMissingIngredients,
    markAsChecked: useShoppingListStore.getState().markAsChecked,
    fetchPantry: useShoppingListStore.getState().fetchPantry,
    addToPantry: useShoppingListStore.getState().addToPantry,
    deductIngredientsForRecipe: useShoppingListStore.getState().deductIngredientsForRecipe,
  }, true);
  jest.clearAllMocks();
});

describe('useShoppingListStore', () => {
  it('fetches shopping list successfully', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: [
                  { id: 'sl1', user_id: 'u1', recipe_id: 'r1', meal_plan_id: 'mp1', ingredient_name: 'Eggs', is_checked: false, created_at: '2025-11-05' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { id: 'mp1', recipe_id: 'r1', meal_date: '2025-11-05' },
              ],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: [
              { id: 'r1', title: 'Test Recipe' },
            ],
            error: null,
          }),
        }),
      });

    await useShoppingListStore.getState().fetchShoppingList('u1');
    expect(useShoppingListStore.getState().shoppingList.length).toBe(1);
    expect(useShoppingListStore.getState().shoppingList[0].ingredient_name).toBe('Eggs');
    expect(useShoppingListStore.getState().loading).toBe(false);
  });

  it('handles error in fetchShoppingList', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Fetch error' },
          }),
        }),
      }),
    });

    await useShoppingListStore.getState().fetchShoppingList('u1');
    expect(useShoppingListStore.getState().shoppingList).toEqual([]);
    expect(useShoppingListStore.getState().loading).toBe(false);
  });

  it('marks item as checked and adds to pantry', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({}),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: jest.fn().mockResolvedValue({}),
      })
      .mockReturnValueOnce({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({}),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

    const item = {
      id: 'sl1',
      user_id: 'u1',
      recipe_id: 'r1',
      meal_plan_id: 'mp1',
      ingredient_name: 'Eggs',
      is_checked: false,
      created_at: '2025-11-05',
      quantity: 2,
    };
    await useShoppingListStore.getState().markAsChecked(item, true);
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
  });

  it('fetches pantry successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            { id: 'p1', user_id: 'u1', ingredient_name: 'Eggs', quantity: 5, created_at: '2025-11-05' },
          ],
          error: null,
        }),
      }),
    });

    await useShoppingListStore.getState().fetchPantry('u1');
    expect(useShoppingListStore.getState().pantry.length).toBe(1);
    expect(useShoppingListStore.getState().pantry[0].ingredient_name).toBe('Eggs');
    expect(useShoppingListStore.getState().loading).toBe(false);
  });

  it('deducts ingredients for recipe', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [
              { name: 'Eggs', quantity: 2 },
            ],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [
                { id: 'p1', user_id: 'u1', ingredient_name: 'Eggs', quantity: 5, created_at: '2025-11-05' },
              ],
              error: null,
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({}),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      });

    await useShoppingListStore.getState().deductIngredientsForRecipe('u1', 'r1');
    expect(supabase.from).toHaveBeenCalledWith('ingredients');
    expect(supabase.from).toHaveBeenCalledWith('user_pantry');
  });
});