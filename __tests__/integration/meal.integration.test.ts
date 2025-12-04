import * as mealService from '@/services/mealService';
import { mealApi } from '@/api/mealApi';
import { FullMealPlan, MealHistory } from '@/types/meal';
import { FullRecipe } from '@/types/recipe';

const mockRecipe: FullRecipe = {
  id: 'r1',
  author_id: 'user1',
  title: 'Recipe',
  description: 'desc',
  total_time: 10,
  servings: 2,
  meal_type: 'breakfast',
  difficulty: 'easy',
  is_community: true,
  calories: 100,
  protein: 10,
  carbs: 20,
  fat: 5,
  avg_rating: 4.5,
  rating_count: 2,
  created_at: '',
  updated_at: '',
  images: [],
  steps: [],
  ingredients: [],
  tags: [],
  ratings: [],
  likes: [],
};

const mockMealPlan: FullMealPlan = {
  id: 'plan1',
  user_id: 'user1',
  recipe_id: 'r1',
  meal_date: '2025-11-25',
  meal_type: 'breakfast',
  created_at: '2025-11-25T08:00:00Z',
  recipe: mockRecipe,
};

const mockMealPlans: FullMealPlan[] = [mockMealPlan];

const mockMealHistory: MealHistory[] = [
  {
    id: 'history1',
    user_id: 'user1',
    recipe_id: 'r1',
    meal_date: '2025-11-24',
    meal_type: 'lunch',
    marked_at: '2025-11-24T12:00:00Z',
    recipe: mockRecipe,
  },
];

describe('mealService + mealApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchMealPlans calls mealApi.fetchMealPlans and returns plans', async () => {
    const spy = jest
      .spyOn(mealApi, 'fetchMealPlans')
      .mockResolvedValue(mockMealPlans);
    const result = await mealService.fetchMealPlans('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockMealPlans);
  });

  it('addMealPlan calls mealApi.addMealPlan and returns new plan', async () => {
    const spy = jest
      .spyOn(mealApi, 'addMealPlan')
      .mockResolvedValue(mockMealPlan);
    const result = await mealService.addMealPlan({
      userId: 'user1',
      recipeId: 'r1',
      mealDate: '2025-11-25',
      mealType: 'breakfast',
    });
    expect(spy).toHaveBeenCalledWith('user1', 'r1', '2025-11-25', 'breakfast');
    expect(result).toEqual(mockMealPlan);
  });

  it('removeMealPlan calls mealApi.removeMealplan', async () => {
    const spy = jest
      .spyOn(mealApi, 'removeMealplan')
      .mockResolvedValue(undefined);
    await expect(mealService.removeMealPlan('plan1')).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith('plan1');
  });

  it('fetchMealHistory calls mealApi.fetchMealHistory and returns history', async () => {
    const spy = jest
      .spyOn(mealApi, 'fetchMealHistory')
      .mockResolvedValue(mockMealHistory);
    const result = await mealService.fetchMealHistory('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockMealHistory);
  });

  it('markMealDone calls mealApi.markMealDone', async () => {
    const spy = jest
      .spyOn(mealApi, 'markMealDone')
      .mockResolvedValue(undefined);
    await expect(
      mealService.markMealDone({
        userId: 'user1',
        recipeId: 'r1',
        mealDate: '2025-11-25',
        mealType: 'breakfast',
      }),
    ).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith('user1', 'r1', '2025-11-25', 'breakfast');
  });

  it('removeIngredientsForRecipe calls mealApi.removeIngredientsForRecipe', async () => {
    const spy = jest
      .spyOn(mealApi, 'removeIngredientsForRecipe')
      .mockResolvedValue(undefined);
    await expect(
      mealService.removeIngredientsForRecipe({
        userId: 'user1',
        recipeId: 'r1',
        mealDate: '2025-11-25',
        mealType: 'breakfast',
      }),
    ).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledWith('user1', 'r1', '2025-11-25', 'breakfast');
  });
});
