import { profileService } from '@/services/profileService';
import { profileApi } from '@/api/profileApi';
import { Profile } from '@/types/auth';
import { FullRecipe } from '@/types/recipe';

describe('profileService + profileApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('fetchUserProfile calls profileApi.fetchUserProfile and returns profile', async () => {
    const profile: Profile = {
      id: '1',
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };
    const spy = jest
      .spyOn(profileApi, 'fetchUserProfile')
      .mockResolvedValue(profile);

    const result = await profileService.fetchUserProfile('1');
    expect(spy).toHaveBeenCalledWith('1');
    expect(result).toEqual(profile);
  });

  it('fetchUserTotalLikes calls profileApi.fetchUserTotalLikes and returns count', async () => {
    const spy = jest
      .spyOn(profileApi, 'fetchUserTotalLikes')
      .mockResolvedValue(5);

    const result = await profileService.fetchUserTotalLikes('1');
    expect(spy).toHaveBeenCalledWith('1');
    expect(result).toBe(5);
  });

  it('fetchUserFavoriteIds calls profileApi.fetchUserFavoriteIds and returns ids', async () => {
    const ids = ['r1', 'r2'];
    const spy = jest
      .spyOn(profileApi, 'fetchUserFavoriteIds')
      .mockResolvedValue(ids);

    const result = await profileService.fetchUserFavoriteIds('1');
    expect(spy).toHaveBeenCalledWith('1');
    expect(result).toEqual(ids);
  });

  it('fetchFavoriteRecipes calls profileApi.fetchFavoriteRecipes and returns recipes', async () => {
    const recipes: FullRecipe[] = [
      {
        id: 'r1',
        author_id: '1',
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
      .spyOn(profileApi, 'fetchFavoriteRecipes')
      .mockResolvedValue(recipes);

    const result = await profileService.fetchFavoriteRecipes(['r1']);
    expect(spy).toHaveBeenCalledWith(['r1']);
    expect(result).toEqual(recipes);
  });

  it('addFavorite calls profileApi.addFavorite', async () => {
    const spy = jest
      .spyOn(profileApi, 'addFavorite')
      .mockResolvedValue(undefined);

    await profileService.addFavorite('1', 'r1');
    expect(spy).toHaveBeenCalledWith('1', 'r1');
  });

  it('removeFavorite calls profileApi.removeFavorite', async () => {
    const spy = jest
      .spyOn(profileApi, 'removeFavorite')
      .mockResolvedValue(undefined);

    await profileService.removeFavorite('1', 'r1');
    expect(spy).toHaveBeenCalledWith('1', 'r1');
  });

  it('updateProfileImage calls profileApi.updateProfileImage', async () => {
    const spy = jest
      .spyOn(profileApi, 'updateProfileImage')
      .mockResolvedValue(undefined);

    await profileService.updateProfileImage('1', 'http://image.url');
    expect(spy).toHaveBeenCalledWith('1', 'http://image.url');
  });

  it('updateDisplayName calls profileApi.updateDisplayName', async () => {
    const spy = jest
      .spyOn(profileApi, 'updateDisplayName')
      .mockResolvedValue(undefined);

    await profileService.updateDisplayName('1', 'New Name');
    expect(spy).toHaveBeenCalledWith('1', 'New Name');
  });

  it('updateUsername calls profileApi.updateUsername', async () => {
    const spy = jest
      .spyOn(profileApi, 'updateUsername')
      .mockResolvedValue(undefined);

    await profileService.updateUsername('1', 'newusername');
    expect(spy).toHaveBeenCalledWith('1', 'newusername');
  });

  it('updateBio calls profileApi.updateBio', async () => {
    const spy = jest
      .spyOn(profileApi, 'updateBio')
      .mockResolvedValue(undefined);

    await profileService.updateBio('1', 'New bio');
    expect(spy).toHaveBeenCalledWith('1', 'New bio');
  });

  it('changePassword calls profileApi.changePassword', async () => {
    const spy = jest
      .spyOn(profileApi, 'changePassword')
      .mockResolvedValue(undefined);

    await profileService.changePassword('test@email.com', 'newpassword');
    expect(spy).toHaveBeenCalledWith('test@email.com', 'newpassword');
  });
});
