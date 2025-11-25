import * as mealService from '@/services/mealService';

jest.mock('@/api/mealApi', () => ({
  mealApi: {
    fetchMealPlans: jest.fn(async (userId: string) => [
      {
        id: 'plan1',
        user_id: userId,
        recipe_id: 'recipe1',
        meal_date: '2025-11-25',
        meal_type: 'breakfast',
        created_at: '2025-11-25T08:00:00Z',
        recipe: { id: 'recipe1', title: 'Test Recipe' },
      },
    ]),
    addMealPlan: jest.fn(async (userId, recipeId, mealDate, mealType) => ({
      id: 'plan2',
      user_id: userId,
      recipe_id: recipeId,
      meal_date: mealDate,
      meal_type: mealType,
      created_at: '2025-11-25T08:00:00Z',
      recipe: { id: recipeId, title: 'New Recipe' },
    })),
    removeMealplan: jest.fn(async (_mealPlanId: string) => {}),
    fetchMealHistory: jest.fn(async (userId: string) => [
      {
        id: 'history1',
        user_id: userId,
        recipe_id: 'recipe1',
        meal_date: '2025-11-24',
        meal_type: 'lunch',
        marked_at: '2025-11-24T12:00:00Z',
        recipe: { id: 'recipe1', title: 'Test Recipe' },
      },
    ]),
    markMealDone: jest.fn(
      async (_userId, _recipeId, _mealDate, _mealType) => {},
    ),
    removeIngredientsForRecipe: jest.fn(
      async (_userId, _recipeId, _mealDate, _mealType) => {},
    ),
  },
}));

describe('mealService', () => {
  it('fetches meal plans', async () => {
    const plans = await mealService.fetchMealPlans('user1');
    expect(Array.isArray(plans)).toBe(true);
    expect(plans[0].user_id).toBe('user1');
    expect(plans[0].recipe.title).toBe('Test Recipe');
  });

  it('adds a meal plan', async () => {
    const plan = await mealService.addMealPlan({
      userId: 'user1',
      recipeId: 'recipe2',
      mealDate: '2025-11-26',
      mealType: 'dinner',
    });
    expect(plan.user_id).toBe('user1');
    expect(plan.recipe_id).toBe('recipe2');
    expect(plan.meal_type).toBe('dinner');
    expect(plan.recipe.title).toBe('New Recipe');
  });

  it('removes a meal plan', async () => {
    await expect(mealService.removeMealPlan('plan1')).resolves.toBeUndefined();
  });

  it('fetches meal history', async () => {
    const history = await mealService.fetchMealHistory('user1');
    expect(Array.isArray(history)).toBe(true);
    expect(history[0].meal_type).toBe('lunch');
    expect(history[0].recipe?.title).toBe('Test Recipe');
  });

  it('marks meal as done', async () => {
    await mealService.markMealDone({
      userId: 'user1',
      recipeId: 'recipe1',
      mealDate: '2025-11-24',
      mealType: 'lunch',
    });
  });

  it('removes ingredients for recipe', async () => {
    await mealService.removeIngredientsForRecipe({
      userId: 'user1',
      recipeId: 'recipe1',
      mealDate: '2025-11-24',
      mealType: 'lunch',
    });
  });

  it('handles fetchMealPlans error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.fetchMealPlans.mockRejectedValueOnce(new Error('fail'));
    await expect(mealService.fetchMealPlans('baduser')).rejects.toThrow('fail');
  });

  it('handles addMealPlan error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.addMealPlan.mockRejectedValueOnce(new Error('fail'));
    await expect(
      mealService.addMealPlan({
        userId: 'user1',
        recipeId: 'recipe2',
        mealDate: '2025-11-26',
        mealType: 'dinner',
      }),
    ).rejects.toThrow('fail');
  });

  it('handles removeMealPlan error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.removeMealplan.mockRejectedValueOnce(new Error('fail'));
    await expect(mealService.removeMealPlan('plan1')).rejects.toThrow('fail');
  });

  it('handles fetchMealHistory error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.fetchMealHistory.mockRejectedValueOnce(new Error('fail'));
    await expect(mealService.fetchMealHistory('baduser')).rejects.toThrow(
      'fail',
    );
  });

  it('handles markMealDone error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.markMealDone.mockRejectedValueOnce(new Error('fail'));
    await expect(
      mealService.markMealDone({
        userId: 'user1',
        recipeId: 'recipe1',
        mealDate: '2025-11-24',
        mealType: 'lunch',
      }),
    ).rejects.toThrow('fail');
  });

  it('handles removeIngredientsForRecipe error', async () => {
    const { mealApi } = require('@/api/mealApi');
    mealApi.removeIngredientsForRecipe.mockRejectedValueOnce(new Error('fail'));
    await expect(
      mealService.removeIngredientsForRecipe({
        userId: 'user1',
        recipeId: 'recipe1',
        mealDate: '2025-11-24',
        mealType: 'lunch',
      }),
    ).rejects.toThrow('fail');
  });
});
