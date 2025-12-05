import { mealApi } from '@/api/mealApi';
import { ApiError } from '@/api/apiHelpers';
import { FullMealPlan, MealHistory } from '@/types/meal';

type ChainResp = { data: any; error: any };

function createChain(
  thenResp: ChainResp = { data: [], error: null },
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

describe('MealApi', () => {
  let supabase: any;
  let chainMap: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    chainMap = {
      meal_plans: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      meal_history: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      shopping_list: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      default: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
    };

    supabase.from = jest.fn(
      (table: string) => chainMap[table] || chainMap.default,
    );
  });

  it('fetchMealPlans queries meal_plans with correct params and returns data', async () => {
    const mockPlans: FullMealPlan[] = [
      {
        id: 'plan1',
        user_id: 'u1',
        recipe_id: 'r1',
        meal_date: '2025-11-25',
        meal_type: 'breakfast',
        created_at: '',
        recipe: {
          id: 'r1',
          author_id: 'a',
          title: 't',
          description: null,
          total_time: null,
          servings: null,
          meal_type: null,
          difficulty: null,
          is_community: true,
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          avg_rating: null,
          rating_count: null,
          created_at: '',
          updated_at: '',
          images: [],
          steps: [],
          ingredients: [],
          tags: [],
          ratings: [],
          likes: [],
        },
      },
    ];
    chainMap.meal_plans._thenResp = { data: mockPlans, error: null };

    const res = await mealApi.fetchMealPlans('u1');
    expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    expect(chainMap.meal_plans.select).toHaveBeenCalled();
    expect(chainMap.meal_plans.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chainMap.meal_plans.order).toHaveBeenCalledWith('meal_date', {
      ascending: true,
    });
    expect(res).toEqual(mockPlans);
  });

  it('addMealPlan inserts and returns the inserted plan', async () => {
    const inserted: FullMealPlan = {
      id: 'plan2',
      user_id: 'u1',
      recipe_id: 'r2',
      meal_date: '2025-11-26',
      meal_type: 'dinner',
      created_at: '',
      recipe: {
        id: 'r2',
        author_id: 'a',
        title: 't',
        description: null,
        total_time: null,
        servings: null,
        meal_type: null,
        difficulty: null,
        is_community: true,
        calories: null,
        protein: null,
        carbs: null,
        fat: null,
        avg_rating: null,
        rating_count: null,
        created_at: '',
        updated_at: '',
        images: [],
        steps: [],
        ingredients: [],
        tags: [],
        ratings: [],
        likes: [],
      },
    };
    // .single() resolves with { data }
    chainMap.meal_plans.single.mockResolvedValue({
      data: inserted,
      error: null,
    });

    const res = await mealApi.addMealPlan('u1', 'r2', '2025-11-26', 'dinner');
    expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    expect(chainMap.meal_plans.insert).toHaveBeenCalled();
    expect(chainMap.meal_plans.select).toHaveBeenCalled();
    expect(chainMap.meal_plans.single).toHaveBeenCalled();
    expect(res).toEqual(inserted);
  });

  it('removeMealplan calls delete and handles success', async () => {
    chainMap.meal_plans._thenResp = { data: null, error: null };
    await expect(mealApi.removeMealplan('plan1')).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('meal_plans');
    expect(chainMap.meal_plans.delete).toHaveBeenCalled();
    expect(chainMap.meal_plans.eq).toHaveBeenCalledWith('id', 'plan1');
  });

  it('fetchMealHistory returns history list', async () => {
    const history: MealHistory[] = [
      {
        id: 'h1',
        user_id: 'u1',
        recipe_id: 'r1',
        meal_date: '2025-11-24',
        meal_type: 'lunch',
        marked_at: '',
        recipe: {
          id: 'r1',
          author_id: 'a',
          title: 't',
          description: null,
          total_time: null,
          servings: null,
          meal_type: null,
          difficulty: null,
          is_community: true,
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          avg_rating: null,
          rating_count: null,
          created_at: '',
          updated_at: '',
          images: [],
          steps: [],
          ingredients: [],
          tags: [],
          ratings: [],
          likes: [],
        },
      },
    ];
    chainMap.meal_history._thenResp = { data: history, error: null };

    const res = await mealApi.fetchMealHistory('u1');
    expect(supabase.from).toHaveBeenCalledWith('meal_history');
    expect(chainMap.meal_history.select).toHaveBeenCalled();
    expect(chainMap.meal_history.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chainMap.meal_history.order).toHaveBeenCalledWith('meal_date', {
      ascending: false,
    });
    expect(res).toEqual(history);
  });

  it('markMealDone inserts into meal_history and resolves on success', async () => {
    chainMap.meal_history._thenResp = { data: null, error: null };
    await expect(
      mealApi.markMealDone('u1', 'r1', '2025-11-24', 'lunch'),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('meal_history');
    expect(chainMap.meal_history.insert).toHaveBeenCalledWith(
      expect.any(Array),
    );
  });

  it('removeIngredientsForRecipe deletes shopping_list rows with correct eq calls', async () => {
    chainMap.shopping_list._thenResp = { data: null, error: null };
    await expect(
      mealApi.removeIngredientsForRecipe('u1', 'r1', '2025-11-24', 'lunch'),
    ).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
    expect(chainMap.shopping_list.delete).toHaveBeenCalled();
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith('recipe_id', 'r1');
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith(
      'meal_date',
      '2025-11-24',
    );
    expect(chainMap.shopping_list.eq).toHaveBeenCalledWith(
      'meal_type',
      'lunch',
    );
  });

  // Error paths
  it('throws ApiError and shows toast when supabase returns error for fetchMealPlans', async () => {
    chainMap.meal_plans._thenResp = { data: null, error: new Error('db') };
    await expect(mealApi.fetchMealPlans('u1')).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('throws ApiError for addMealPlan when single returns error', async () => {
    chainMap.meal_plans.single.mockResolvedValue({
      data: null,
      error: new Error('insert-fail'),
    });
    await expect(
      mealApi.addMealPlan('u1', 'r2', '2025-11-26', 'dinner'),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
