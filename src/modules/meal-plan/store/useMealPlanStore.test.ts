import { useMealPlanStore } from './useMealPlanStore';
import { supabase } from '../../utils/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('../../../utils/notificationChannel', () => ({
  scheduleHybridMealNotification: jest.fn().mockResolvedValue({ success: true, scheduledFor: '2025-11-05T08:00:00Z' }),
  cancelHybridNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../shopping-list/store/useShoppingListStore', () => ({
  useShoppingListStore: {
    getState: () => ({
      deductIngredientsForRecipe: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

beforeEach(() => {
  useMealPlanStore.setState({
    mealPlans: [],
    loading: false,
    mealHistory: [],
    fetchMealPlans: useMealPlanStore.getState().fetchMealPlans,
    addMealPlan: useMealPlanStore.getState().addMealPlan,
    removeMealPlan: useMealPlanStore.getState().removeMealPlan,
    fetchMealHistory: useMealPlanStore.getState().fetchMealHistory,
    markMealDone: useMealPlanStore.getState().markMealDone,
    removeIngredientsForRecipe: useMealPlanStore.getState().removeIngredientsForRecipe,
  }, true);
});

describe('useMealPlanStore', () => {
  it('fetches meal plans successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [{
              id: 'mp1',
              user_id: 'u1',
              recipe_id: 'r1',
              meal_date: '2025-11-05',
              meal_type: 'breakfast',
              created_at: '',
              recipe: { id: 'r1', title: 'Test Recipe' },
            }],
            error: null,
          }),
        }),
      }),
    });

    await useMealPlanStore.getState().fetchMealPlans('u1');
    expect(useMealPlanStore.getState().mealPlans.length).toBe(1);
    expect(useMealPlanStore.getState().mealPlans[0].recipe.title).toBe('Test Recipe');
    expect(useMealPlanStore.getState().loading).toBe(false);
  });

  it('handles error in fetchMealPlans', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Fetch error' },
          }),
        }),
      }),
    });

    await useMealPlanStore.getState().fetchMealPlans('u1');
    expect(useMealPlanStore.getState().mealPlans.length).toBe(0);
    expect(useMealPlanStore.getState().loading).toBe(false);
  });

  it('adds a meal plan successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'mp2',
              recipe: { title: 'Inserted Recipe' },
            },
            error: null,
          }),
        }),
      }),
    });

    const { addMealPlan } = useMealPlanStore.getState();
    await addMealPlan('u1', 'r1', '2025-11-05', 'lunch');
    // You can check if notification was scheduled
    const { scheduleHybridMealNotification } = require('../../../utils/notificationChannel');
    expect(scheduleHybridMealNotification).toHaveBeenCalled();
  });

  it('handles error when adding a meal plan', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Insert error' },
          }),
        }),
      }),
    });

    const { addMealPlan } = useMealPlanStore.getState();
    await addMealPlan('u1', 'r1', '2025-11-05', 'dinner');
    // Should not throw, just log error
  });

  it('removes a meal plan successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({}),
      }),
    });

    const { removeMealPlan } = useMealPlanStore.getState();
    await removeMealPlan('mp1', 'u1');
    const { cancelHybridNotification } = require('../../../utils/notificationChannel');
    expect(cancelHybridNotification).toHaveBeenCalledWith('mp1', 'u1');
  });

  it('fetches meal history successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [{
              id: 'mh1',
              user_id: 'u1',
              recipe_id: 'r1',
              meal_date: '2025-11-05',
              meal_type: 'lunch',
              marked_at: '2025-11-05T12:00:00Z',
              recipe: { id: 'r1', title: 'History Recipe' },
            }],
            error: null,
          }),
        }),
      }),
    });

    await useMealPlanStore.getState().fetchMealHistory('u1');
    expect(useMealPlanStore.getState().mealHistory.length).toBe(1);
    expect(useMealPlanStore.getState().mealHistory[0].recipe?.title).toBe('History Recipe');
  });

  it('handles error in fetchMealHistory', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'History error' },
          }),
        }),
      }),
    });

    await useMealPlanStore.getState().fetchMealHistory('u1');
    expect(useMealPlanStore.getState().mealHistory.length).toBe(0);
  });

  it('removes ingredients for recipe', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ name: 'Eggs' }, { name: 'Milk' }],
            error: null,
          }),
        }),
      })
      .mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
        }),
      });

    const { removeIngredientsForRecipe } = useMealPlanStore.getState();
    await removeIngredientsForRecipe('u1', 'r1');
    // Should attempt to delete both ingredients
    expect(supabase.from).toHaveBeenCalledWith('shopping_list');
  });
});