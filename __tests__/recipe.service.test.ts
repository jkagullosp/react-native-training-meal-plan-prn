import * as recipeService from '@/services/recipeService';
import { FullRecipe, Tag, CreateRecipeInput } from '@/types/recipe';
import { Profile } from '@/types/auth';

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

const mockRecipes: FullRecipe[] = [mockRecipe];
const mockTags: Tag[] = [{ id: 't1', name: 'tag1' }];
const mockProfile: Profile = {
  id: 'user1',
  username: 'admin',
  display_name: 'Admin',
  profile_image: 'img.png',
  bio: 'bio',
  created_at: '',
  updated_at: '',
  is_admin: true,
  status: 'active',
  suspended_until: '',
  email: 'admin@email.com',
};

const mockRatingResult = { avg: 4.5, count: 2 };

const mockRecipeInput: CreateRecipeInput = {
  title: 'Recipe',
  description: 'desc',
  ingredients: [],
  steps: [],
  tags: ['tag1'],
  images: [],
};

jest.mock('@/api/recipeApi', () => ({
  recipeApi: {
    fetchRecipes: jest.fn(async () => mockRecipes),
    fetchRecipesPaginated: jest.fn(async (_page, _pageSize) => mockRecipes),
    fetchTags: jest.fn(async () => mockTags),
    fetchRecipeAuthor: jest.fn(async _authorId => mockProfile),
    fetchUserRecipes: jest.fn(async _userId => mockRecipes),
    fetchPendingUserRecipes: jest.fn(async _userId => mockRecipes),
    fetchApprovedUserRecipes: jest.fn(async _userId => mockRecipes),
    submitRating: jest.fn(
      async (_userId, _recipeId, _rating) => mockRatingResult,
    ),
    submitRecipe: jest.fn(async (_userId, _data) => {}),
  },
}));

describe('recipeService', () => {
  // @ts-ignore
  const { recipeApi } = require('@/api/recipeApi');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches recipes', async () => {
    const result = await recipeService.fetchRecipes();
    expect(recipeApi.fetchRecipes).toHaveBeenCalled();
    expect(result).toEqual(mockRecipes);
  });

  it('fetches paginated recipes', async () => {
    const result = await recipeService.fetchRecipesPaginated(1, 10);
    expect(recipeApi.fetchRecipesPaginated).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(mockRecipes);
  });

  it('fetches tags', async () => {
    const result = await recipeService.fetchTags();
    expect(recipeApi.fetchTags).toHaveBeenCalled();
    expect(result).toEqual(mockTags);
  });

  it('fetches recipe author', async () => {
    const result = await recipeService.fetchRecipeAuthor('user1');
    expect(recipeApi.fetchRecipeAuthor).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockProfile);
  });

  it('fetches user recipes', async () => {
    const result = await recipeService.fetchUserRecipes('user1');
    expect(recipeApi.fetchUserRecipes).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockRecipes);
  });

  it('fetches pending user recipes', async () => {
    const result = await recipeService.fetchUserPendingRecipe('user1');
    expect(recipeApi.fetchPendingUserRecipes).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockRecipes);
  });

  it('fetches approved user recipes', async () => {
    const result = await recipeService.fetchApprovedUserRecipes('user1');
    expect(recipeApi.fetchApprovedUserRecipes).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockRecipes);
  });

  it('submits rating', async () => {
    const result = await recipeService.submitRating({
      userId: 'user1',
      recipeId: 'r1',
      rating: 5,
    });
    expect(recipeApi.submitRating).toHaveBeenCalledWith('user1', 'r1', 5);
    expect(result).toEqual(mockRatingResult);
  });

  it('submits recipe', async () => {
    await recipeService.submitRecipe('user1', mockRecipeInput);
    expect(recipeApi.submitRecipe).toHaveBeenCalledWith(
      'user1',
      mockRecipeInput,
    );
  });

  // Error branches
  it('handles error in fetchRecipes', async () => {
    recipeApi.fetchRecipes.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchRecipes()).rejects.toThrow('fail');
  });

  it('handles error in fetchRecipesPaginated', async () => {
    recipeApi.fetchRecipesPaginated.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchRecipesPaginated(1, 10)).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchTags', async () => {
    recipeApi.fetchTags.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchTags()).rejects.toThrow('fail');
  });

  it('handles error in fetchRecipeAuthor', async () => {
    recipeApi.fetchRecipeAuthor.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchRecipeAuthor('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchUserRecipes', async () => {
    recipeApi.fetchUserRecipes.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchUserRecipes('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchUserPendingRecipe', async () => {
    recipeApi.fetchPendingUserRecipes.mockRejectedValueOnce(new Error('fail'));
    await expect(recipeService.fetchUserPendingRecipe('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchApprovedUserRecipes', async () => {
    recipeApi.fetchApprovedUserRecipes.mockRejectedValueOnce(new Error('fail'));
    await expect(
      recipeService.fetchApprovedUserRecipes('user1'),
    ).rejects.toThrow('fail');
  });

  it('handles error in submitRating', async () => {
    recipeApi.submitRating.mockRejectedValueOnce(new Error('fail'));
    await expect(
      recipeService.submitRating({
        userId: 'user1',
        recipeId: 'r1',
        rating: 5,
      }),
    ).rejects.toThrow('fail');
  });

  it('handles error in submitRecipe', async () => {
    recipeApi.submitRecipe.mockRejectedValueOnce(new Error('fail'));
    await expect(
      recipeService.submitRecipe('user1', mockRecipeInput),
    ).rejects.toThrow('fail');
  });
});
