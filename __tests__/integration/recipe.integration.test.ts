import * as recipeService from '@/services/recipeService';
import { recipeApi } from '@/api/recipeApi';
import { FullRecipe, Tag, CreateRecipeInput } from '@/types/recipe';
import { Profile } from '@/types/auth';

describe('recipeService + recipeApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchRecipes calls recipeApi.fetchRecipes and returns recipes', async () => {
    const recipes: FullRecipe[] = [
      {
        id: 'r1',
        author_id: 'user1',
        title: 'Recipe 1',
        description: 'desc',
        total_time: 10,
        servings: 2,
        meal_type: 'breakfast',
        difficulty: 'easy',
        is_community: false,
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
      },
    ];
    const spy = jest
      .spyOn(recipeApi, 'fetchRecipes')
      .mockResolvedValue(recipes);

    const result = await recipeService.fetchRecipes();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipes);
  });

  it('fetchRecipesPaginated calls recipeApi.fetchRecipesPaginated', async () => {
    const recipes: FullRecipe[] = [];
    const spy = jest
      .spyOn(recipeApi, 'fetchRecipesPaginated')
      .mockResolvedValue(recipes);

    const result = await recipeService.fetchRecipesPaginated(1, 10);
    expect(spy).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(recipes);
  });

  it('fetchTags calls recipeApi.fetchTags', async () => {
    const tags: Tag[] = [{ id: 't1', name: 'Vegan' }];
    const spy = jest.spyOn(recipeApi, 'fetchTags').mockResolvedValue(tags);

    const result = await recipeService.fetchTags();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(tags);
  });

  it('fetchRecipeAuthor calls recipeApi.fetchRecipeAuthor', async () => {
    const profile: Profile = {
      id: 'user1',
      display_name: 'Author',
      username: 'authoruser',
      email: 'author@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };
    const spy = jest
      .spyOn(recipeApi, 'fetchRecipeAuthor')
      .mockResolvedValue(profile);

    const result = await recipeService.fetchRecipeAuthor('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(profile);
  });

  it('fetchUserPendingRecipe calls recipeApi.fetchPendingUserRecipes', async () => {
    const recipes: FullRecipe[] = [];
    const spy = jest
      .spyOn(recipeApi, 'fetchPendingUserRecipes')
      .mockResolvedValue(recipes);

    const result = await recipeService.fetchUserPendingRecipe('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(recipes);
  });

  it('submitRating calls recipeApi.submitRating', async () => {
    const ratingResult = { avg: 4.5, count: 10 };
    const spy = jest
      .spyOn(recipeApi, 'submitRating')
      .mockResolvedValue(ratingResult);

    const result = await recipeService.submitRating({
      userId: 'user1',
      recipeId: 'r1',
      rating: 5,
    });
    expect(spy).toHaveBeenCalledWith('user1', 'r1', 5);
    expect(result).toEqual(ratingResult);
  });

  it('submitRecipe calls recipeApi.submitRecipe', async () => {
    const input: CreateRecipeInput = {
      title: 'New Recipe',
      description: 'desc',
      total_time: 10,
      servings: 2,
      meal_type: 'breakfast',
      difficulty: 'easy',
      calories: 100,
      fat: 5,
      carbs: 20,
      protein: 10,
      ingredients: [],
      steps: [],
      tags: [],
      images: [],
    };
    const spy = jest
      .spyOn(recipeApi, 'submitRecipe')
      .mockResolvedValue(undefined);

    await recipeService.submitRecipe('user1', input);
    expect(spy).toHaveBeenCalledWith('user1', input);
  });

  it('fetchUserRecipes calls recipeApi.fetchUserRecipes', async () => {
    const recipes: FullRecipe[] = [];
    const spy = jest
      .spyOn(recipeApi, 'fetchUserRecipes')
      .mockResolvedValue(recipes);

    const result = await recipeService.fetchUserRecipes('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(recipes);
  });

  it('fetchApprovedUserRecipes calls recipeApi.fetchApprovedUserRecipes', async () => {
    const recipes: FullRecipe[] = [];
    const spy = jest
      .spyOn(recipeApi, 'fetchApprovedUserRecipes')
      .mockResolvedValue(recipes);

    const result = await recipeService.fetchApprovedUserRecipes('user1');
    expect(spy).toHaveBeenCalledWith('user1');
    expect(result).toEqual(recipes);
  });
});
