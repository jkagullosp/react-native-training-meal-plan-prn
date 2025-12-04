import { adminService } from '@/services/adminService';
import { adminApi } from '@/api/adminApi';
import { CreateRecipeInput } from '@/types/recipe';
import { FullRecipe } from '@/types/recipe';

const fullRecipe: FullRecipe = {
  id: 'r1',
  author_id: 'admin',
  title: 'Recipe',
  description: 'desc',
  total_time: 10,
  servings: 2,
  meal_type: 'breakfast',
  difficulty: 'easy',
  is_community: false,
  calories: 100,
  protein: 5,
  carbs: 20,
  fat: 10,
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
};

describe('adminService + adminApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls adminApi.getAllUsers and returns users', async () => {
    const users = [
      {
        id: '1',
        display_name: 'Admin',
        username: 'admin',
        email: 'admin@email.com',
        profile_image: null,
        bio: null,
        created_at: '',
        updated_at: '',
        is_admin: false,
        status: 'active',
        suspended_until: '',
      },
    ];
    const spy = jest.spyOn(adminApi, 'getAllUsers').mockResolvedValue(users);
    const result = await adminService.getAllUsers();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('calls adminApi.fetchRecipesNotPending', async () => {
    const recipes: FullRecipe[] = [fullRecipe];
    const spy = jest
      .spyOn(adminApi, 'fetchRecipesNotPending')
      .mockResolvedValue(recipes);
    const result = await adminService.fetchRecipesNotPending();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipes);
  });

  it('calls adminApi.fetchMostFavoritedRecipe', async () => {
    const recipe = { id: 'r2', title: 'Most Favorited' };
    const spy = jest
      .spyOn(adminApi, 'fetchMostFavoritedRecipe')
      .mockResolvedValue(recipe);
    const result = await adminService.fetchMostFavoritedRecipe();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipe);
  });

  it('calls adminApi.fetchMostLikedRecipe', async () => {
    const recipe = { id: 'r3', title: 'Most Liked' };
    const spy = jest
      .spyOn(adminApi, 'fetchMostLikedRecipe')
      .mockResolvedValue(recipe);
    const result = await adminService.fetchMostLikedRecipe();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipe);
  });

  it('calls adminApi.fetchPendingRecipes', async () => {
    const recipes: FullRecipe[] = [fullRecipe];
    const spy = jest
      .spyOn(adminApi, 'fetchPendingRecipes')
      .mockResolvedValue(recipes);
    const result = await adminService.fetchPendingRecipes();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipes);
  });

  it('calls adminApi.getRecipesApprovedLast30Days', async () => {
    const recipes: FullRecipe[] = [fullRecipe];
    const spy = jest
      .spyOn(adminApi, 'getRecipesApprovedLast30Days')
      .mockResolvedValue(recipes);
    const result = await adminService.getRecipesApprovedLast30Days();
    expect(spy).toHaveBeenCalled();
    expect(result).toEqual(recipes);
  });

  it('calls adminApi.suspendUser with correct args', async () => {
    const spy = jest
      .spyOn(adminApi, 'suspendUser')
      .mockResolvedValue(undefined);
    await adminService.suspendUser('1', 1000);
    expect(spy).toHaveBeenCalledWith('1', 1000);
  });

  it('calls adminApi.banUser with correct args', async () => {
    const spy = jest.spyOn(adminApi, 'banUser').mockResolvedValue(undefined);
    await adminService.banUser('1');
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('calls adminApi.deleteUser with correct args', async () => {
    const spy = jest.spyOn(adminApi, 'deleteUser').mockResolvedValue(undefined);
    await adminService.deleteUser('1');
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('calls adminApi.unSuspendUser with correct args', async () => {
    const spy = jest
      .spyOn(adminApi, 'unSuspendUser')
      .mockResolvedValue(undefined);
    await adminService.unSuspendUser('1');
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('calls adminApi.unbanUser with correct args', async () => {
    const spy = jest.spyOn(adminApi, 'unbanUser').mockResolvedValue(undefined);
    await adminService.unBanUser('1');
    expect(spy).toHaveBeenCalledWith('1');
  });

  it('calls adminApi.approveRecipe with correct args', async () => {
    const spy = jest
      .spyOn(adminApi, 'approveRecipe')
      .mockResolvedValue(undefined);
    await adminService.approveRecipe('r1');
    expect(spy).toHaveBeenCalledWith('r1');
  });

  it('calls adminApi.disapproveRecipe with correct args', async () => {
    const spy = jest
      .spyOn(adminApi, 'disapproveRecipe')
      .mockResolvedValue(undefined);
    await adminService.disapproveRecipe('r1');
    expect(spy).toHaveBeenCalledWith('r1');
  });

  it('calls adminApi.submitAdminRecipe and passes correct arguments', async () => {
    const input: CreateRecipeInput = {
      title: 'Test',
      description: 'desc',
      total_time: 10,
      servings: 2,
      meal_type: 'breakfast',
      difficulty: 'easy',
      calories: 100,
      fat: 10,
      protein: 5,
      carbs: 20,
      ingredients: [],
      steps: [],
      tags: [],
      images: [],
    };
    const spy = jest
      .spyOn(adminApi, 'submitAdminRecipe')
      .mockResolvedValue(undefined);
    await adminService.submitAdminRecipe('user1', input);
    expect(spy).toHaveBeenCalledWith('user1', input);
  });
});
