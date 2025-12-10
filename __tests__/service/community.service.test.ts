import { communityService } from '@/services/communityService';

jest.mock('@/api/communityApi', () => ({
  communityApi: {
    fetchAuthor: jest.fn(async (authorId: string) => ({
      id: authorId,
      username: 'testuser',
      display_name: 'Test User',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: null,
    })),
    fetchRecipeLikes: jest.fn(async (recipeId: string) => [
      { user_id: '1', recipe_id: recipeId },
      { user_id: '2', recipe_id: recipeId },
    ]),
    likeRecipe: jest.fn(async (_userId: string, _recipeId: string) => {}),
    unlikeRecipe: jest.fn(async (_userId: string, _recipeId: string) => {}),
  },
}));

describe('communityService', () => {
  it('gets author profile', async () => {
    const profile = await communityService.getAuthor('author123');
    expect(profile.id).toBe('author123');
    expect(profile.username).toBe('testuser');
  });

  it('gets recipe likes', async () => {
    const likes = await communityService.getRecipeLikes('recipe456');
    expect(Array.isArray(likes)).toBe(true);
    expect(likes.length).toBe(2);
    expect(likes[0].recipe_id).toBe('recipe456');
  });

  it('likes a recipe', async () => {
    await expect(
      communityService.likeRecipe('user1', 'recipe456'),
    ).resolves.toBeUndefined();
  });

  it('unlikes a recipe', async () => {
    await expect(
      communityService.unlikeRecipe('user1', 'recipe456'),
    ).resolves.toBeUndefined();
  });

  it('handles fetchAuthor error', async () => {
    const { communityApi } = require('@/api/communityApi');
    communityApi.fetchAuthor.mockRejectedValueOnce(new Error('fail'));
    await expect(communityService.getAuthor('badid')).rejects.toThrow('fail');
  });

  it('handles fetchRecipeLikes error', async () => {
    const { communityApi } = require('@/api/communityApi');
    communityApi.fetchRecipeLikes.mockRejectedValueOnce(new Error('fail'));
    await expect(communityService.getRecipeLikes('badid')).rejects.toThrow(
      'fail',
    );
  });

  it('handles likeRecipe error', async () => {
    const { communityApi } = require('@/api/communityApi');
    communityApi.likeRecipe.mockRejectedValueOnce(new Error('fail'));
    await expect(communityService.likeRecipe('user1', 'badid')).rejects.toThrow(
      'fail',
    );
  });

  it('handles unlikeRecipe error', async () => {
    const { communityApi } = require('@/api/communityApi');
    communityApi.unlikeRecipe.mockRejectedValueOnce(new Error('fail'));
    await expect(
      communityService.unlikeRecipe('user1', 'badid'),
    ).rejects.toThrow('fail');
  });
});
