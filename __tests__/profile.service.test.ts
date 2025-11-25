import { profileService } from '@/services/profileService';
import { Profile } from '@/types/auth';
import { FullRecipe } from '@/types/recipe';

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

const mockRecipeIds: string[] = ['r1', 'r2'];
const mockRecipes: FullRecipe[] = [
  { id: 'r1' } as FullRecipe,
  { id: 'r2' } as FullRecipe,
];

jest.mock('@/api/profileApi', () => ({
  profileApi: {
    fetchUserProfile: jest.fn(
      async (userId: string): Promise<Profile> => ({
        ...mockProfile,
        id: userId,
      }),
    ),
    fetchUserTotalLikes: jest.fn(async (_userId: string): Promise<number> => 5),
    fetchUserFavoriteIds: jest.fn(
      async (_userId: string): Promise<string[]> => mockRecipeIds,
    ),
    fetchFavoriteRecipes: jest.fn(
      async (_ids: string[]): Promise<FullRecipe[]> => mockRecipes,
    ),
    addFavorite: jest.fn(async (_userId: string, _recipeId: string) => {}),
    removeFavorite: jest.fn(async (_userId: string, _recipeId: string) => {}),
    updateProfileImage: jest.fn(
      async (_userId: string, _imageUrl: string) => {},
    ),
    updateDisplayName: jest.fn(
      async (_userId: string, _displayName: string) => {},
    ),
    updateUsername: jest.fn(async (_userId: string, _username: string) => {}),
    updateBio: jest.fn(async (_userId: string, _bio: string) => {}),
    changePassword: jest.fn(async (_email: string, _password: string) => {}),
  },
}));

describe('profileService', () => {
  // @ts-ignore
  const { profileApi } = require('@/api/profileApi');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user profile', async () => {
    const result = await profileService.fetchUserProfile('user1');
    expect(profileApi.fetchUserProfile).toHaveBeenCalledWith('user1');
    expect(result.id).toBe('user1');
  });

  it('fetches user total likes', async () => {
    const result = await profileService.fetchUserTotalLikes('user1');
    expect(profileApi.fetchUserTotalLikes).toHaveBeenCalledWith('user1');
    expect(result).toBe(5);
  });

  it('fetches user favorite ids', async () => {
    const result = await profileService.fetchUserFavoriteIds('user1');
    expect(profileApi.fetchUserFavoriteIds).toHaveBeenCalledWith('user1');
    expect(result).toEqual(mockRecipeIds);
  });

  it('fetches favorite recipes', async () => {
    const result = await profileService.fetchFavoriteRecipes(mockRecipeIds);
    expect(profileApi.fetchFavoriteRecipes).toHaveBeenCalledWith(mockRecipeIds);
    expect(result).toEqual(mockRecipes);
  });

  it('adds a favorite', async () => {
    await profileService.addFavorite('user1', 'r1');
    expect(profileApi.addFavorite).toHaveBeenCalledWith('user1', 'r1');
  });

  it('removes a favorite', async () => {
    await profileService.removeFavorite('user1', 'r1');
    expect(profileApi.removeFavorite).toHaveBeenCalledWith('user1', 'r1');
  });

  it('updates profile image', async () => {
    await profileService.updateProfileImage('user1', 'img.png');
    expect(profileApi.updateProfileImage).toHaveBeenCalledWith(
      'user1',
      'img.png',
    );
  });

  it('updates display name', async () => {
    await profileService.updateDisplayName('user1', 'New Name');
    expect(profileApi.updateDisplayName).toHaveBeenCalledWith(
      'user1',
      'New Name',
    );
  });

  it('updates username', async () => {
    await profileService.updateUsername('user1', 'newuser');
    expect(profileApi.updateUsername).toHaveBeenCalledWith('user1', 'newuser');
  });

  it('updates bio', async () => {
    await profileService.updateBio('user1', 'new bio');
    expect(profileApi.updateBio).toHaveBeenCalledWith('user1', 'new bio');
  });

  it('changes password', async () => {
    await profileService.changePassword('admin@email.com', 'newpass');
    expect(profileApi.changePassword).toHaveBeenCalledWith(
      'admin@email.com',
      'newpass',
    );
  });

  // Error branches
  it('handles error in fetchUserProfile', async () => {
    profileApi.fetchUserProfile.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.fetchUserProfile('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchUserTotalLikes', async () => {
    profileApi.fetchUserTotalLikes.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.fetchUserTotalLikes('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchUserFavoriteIds', async () => {
    profileApi.fetchUserFavoriteIds.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.fetchUserFavoriteIds('user1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in fetchFavoriteRecipes', async () => {
    profileApi.fetchFavoriteRecipes.mockRejectedValueOnce(new Error('fail'));
    await expect(
      profileService.fetchFavoriteRecipes(mockRecipeIds),
    ).rejects.toThrow('fail');
  });

  it('handles error in addFavorite', async () => {
    profileApi.addFavorite.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.addFavorite('user1', 'r1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in removeFavorite', async () => {
    profileApi.removeFavorite.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.removeFavorite('user1', 'r1')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in updateProfileImage', async () => {
    profileApi.updateProfileImage.mockRejectedValueOnce(new Error('fail'));
    await expect(
      profileService.updateProfileImage('user1', 'img.png'),
    ).rejects.toThrow('fail');
  });

  it('handles error in updateDisplayName', async () => {
    profileApi.updateDisplayName.mockRejectedValueOnce(new Error('fail'));
    await expect(
      profileService.updateDisplayName('user1', 'New Name'),
    ).rejects.toThrow('fail');
  });

  it('handles error in updateUsername', async () => {
    profileApi.updateUsername.mockRejectedValueOnce(new Error('fail'));
    await expect(
      profileService.updateUsername('user1', 'newuser'),
    ).rejects.toThrow('fail');
  });

  it('handles error in updateBio', async () => {
    profileApi.updateBio.mockRejectedValueOnce(new Error('fail'));
    await expect(profileService.updateBio('user1', 'new bio')).rejects.toThrow(
      'fail',
    );
  });

  it('handles error in changePassword', async () => {
    profileApi.changePassword.mockRejectedValueOnce(new Error('fail'));
    await expect(
      profileService.changePassword('admin@email.com', 'newpass'),
    ).rejects.toThrow('fail');
  });
});
