import { communityService } from '@/services/communityService';
import { communityApi } from '@/api/communityApi';
import { Profile } from '@/types/auth';
import { RecipeLike } from '@/types/recipe';

describe('communityService + communityApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getAuthor calls communityApi.fetchAuthor and returns profile', async () => {
    const profile: Profile = {
      id: '1',
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
      .spyOn(communityApi, 'fetchAuthor')
      .mockResolvedValue(profile);

    const result = await communityService.getAuthor('1');
    expect(spy).toHaveBeenCalledWith('1');
    expect(result).toEqual(profile);
  });

  it('getRecipeLikes calls communityApi.fetchRecipeLikes and returns likes', async () => {
    const likes: RecipeLike[] = [
      { id: 'like1', user_id: '1', recipe_id: 'r1', created_at: '' },
    ];
    const spy = jest
      .spyOn(communityApi, 'fetchRecipeLikes')
      .mockResolvedValue(likes);

    const result = await communityService.getRecipeLikes('r1');
    expect(spy).toHaveBeenCalledWith('r1');
    expect(result).toEqual(likes);
  });

  it('likeRecipe calls communityApi.likeRecipe with correct args', async () => {
    const spy = jest
      .spyOn(communityApi, 'likeRecipe')
      .mockResolvedValue(undefined);

    await communityService.likeRecipe('1', 'r1');
    expect(spy).toHaveBeenCalledWith('1', 'r1');
  });

  it('unlikeRecipe calls communityApi.unlikeRecipe with correct args', async () => {
    const spy = jest
      .spyOn(communityApi, 'unlikeRecipe')
      .mockResolvedValue(undefined);

    await communityService.unlikeRecipe('1', 'r1');
    expect(spy).toHaveBeenCalledWith('1', 'r1');
  });
});
