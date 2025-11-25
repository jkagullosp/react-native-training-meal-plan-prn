import { adminService } from '@/services/adminService';
import { CreateRecipeInput } from '@/types/recipe';

jest.mock('@/api/adminApi', () => ({
  adminApi: {
    getAllUsers: jest.fn().mockResolvedValue([{ id: '1', username: 'admin' }]),
    fetchRecipesNotPending: jest.fn().mockResolvedValue([{ id: 'r1', title: 'Recipe' }]),
    fetchMostFavoritedRecipe: jest.fn().mockResolvedValue({ id: 'r2', title: 'Most Favorited' }),
    fetchMostLikedRecipe: jest.fn().mockResolvedValue({ id: 'r3', title: 'Most Liked' }),
    fetchPendingRecipes: jest.fn().mockResolvedValue([{ id: 'r4', title: 'Pending' }]),
    getRecipesApprovedLast30Days: jest.fn().mockResolvedValue([{ id: 'r5', title: 'Recent' }]),
    suspendUser: jest.fn().mockResolvedValue(undefined),
    banUser: jest.fn().mockResolvedValue(undefined),
    deleteUser: jest.fn().mockResolvedValue(undefined),
    unSuspendUser: jest.fn().mockResolvedValue(undefined),
    unbanUser: jest.fn().mockResolvedValue(undefined),
    approveRecipe: jest.fn().mockResolvedValue(undefined),
    disapproveRecipe: jest.fn().mockResolvedValue(undefined),
    submitAdminRecipe: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('adminService', () => {
  it('gets all users', async () => {
    const users = await adminService.getAllUsers();
    expect(users).toEqual([{ id: '1', username: 'admin' }]);
  });

  it('fetches recipes not pending', async () => {
    const recipes = await adminService.fetchRecipesNotPending();
    expect(recipes).toEqual([{ id: 'r1', title: 'Recipe' }]);
  });

  it('fetches most favorited recipe', async () => {
    const recipe = await adminService.fetchMostFavoritedRecipe();
    expect(recipe).toEqual({ id: 'r2', title: 'Most Favorited' });
  });

  it('fetches most liked recipe', async () => {
    const recipe = await adminService.fetchMostLikedRecipe();
    expect(recipe).toEqual({ id: 'r3', title: 'Most Liked' });
  });

  it('fetches pending recipes', async () => {
    const recipes = await adminService.fetchPendingRecipes();
    expect(recipes).toEqual([{ id: 'r4', title: 'Pending' }]);
  });

  it('gets recipes approved last 30 days', async () => {
    const recipes = await adminService.getRecipesApprovedLast30Days();
    expect(recipes).toEqual([{ id: 'r5', title: 'Recent' }]);
  });

  it('suspends a user', async () => {
    await expect(adminService.suspendUser('1', 1000)).resolves.toBeUndefined();
  });

  it('bans a user', async () => {
    await expect(adminService.banUser('1')).resolves.toBeUndefined();
  });

  it('deletes a user', async () => {
    await expect(adminService.deleteUser('1')).resolves.toBeUndefined();
  });

  it('unsuspends a user', async () => {
    await expect(adminService.unSuspendUser('1')).resolves.toBeUndefined();
  });

  it('unbans a user', async () => {
    await expect(adminService.unBanUser('1')).resolves.toBeUndefined();
  });

  it('approves a recipe', async () => {
    await expect(adminService.approveRecipe('r1')).resolves.toBeUndefined();
  });

  it('disapproves a recipe', async () => {
    await expect(adminService.disapproveRecipe('r1')).resolves.toBeUndefined();
  });

  it('submits an admin recipe', async () => {
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
    await expect(adminService.submitAdminRecipe('1', input)).resolves.toBeUndefined();
  });
});