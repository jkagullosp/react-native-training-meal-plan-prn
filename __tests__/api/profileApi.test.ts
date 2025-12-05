import { profileApi } from '@/api/profileApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data: any; error: any };

function createChain(
  thenResp: ChainResp = { data: null, error: null },
  singleResp: ChainResp = { data: null, error: null },
) {
  const c: any = {};
  const methods = [
    'select',
    'eq',
    'order',
    'insert',
    'update',
    'delete',
    'in',
    'limit',
    'gte',
  ];
  methods.forEach(m => (c[m] = jest.fn().mockReturnValue(c)));
  c.single = jest.fn().mockResolvedValue(singleResp);
  c.maybeSingle = jest.fn().mockResolvedValue(singleResp);
  c._thenResp = thenResp;
  c.then = jest.fn().mockImplementation(async (onFulfilled: any) => {
    try {
      onFulfilled(c._thenResp);
    } catch {
      /* noop */
    }
    return Promise.resolve(c._thenResp);
  });
  return c;
}

describe('ProfileApi', () => {
  let supabase: any;
  let chainMap: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    chainMap = {
      profiles: createChain(
        { data: null, error: null },
        { data: null, error: null },
      ),
      recipes: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      recipe_likes: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      recipe_favorites: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      default: createChain(
        { data: null, error: null },
        { data: null, error: null },
      ),
    };

    supabase.from = jest.fn(
      (table: string) => chainMap[table] || chainMap.default,
    );

    // auth methods used by changePassword
    supabase.auth = supabase.auth || {};
    supabase.auth.updateUser = jest.fn();
  });

  it('fetchUserProfile returns profile when maybeSingle returns data', async () => {
    const profile = { id: 'u1', display_name: 'n' };
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: profile,
      error: null,
    });

    const res = await profileApi.fetchUserProfile('u1');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(chainMap.profiles.select).toHaveBeenCalledWith('*');
    expect(chainMap.profiles.eq).toHaveBeenCalledWith('id', 'u1');
    expect(res).toEqual(profile);
  });

  it('fetchUserProfile throws ApiError when db error', async () => {
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error('db'),
    });
    await expect(profileApi.fetchUserProfile('x')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('fetchUserTotalLikes returns 0 when no recipes', async () => {
    chainMap.recipes._thenResp = { data: [], error: null };
    const res = await profileApi.fetchUserTotalLikes('u1');
    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(res).toBe(0);
  });

  it('fetchUserTotalLikes returns count when recipes exist and likes query succeeds', async () => {
    chainMap.recipes._thenResp = {
      data: [{ id: 'r1' }, { id: 'r2' }],
      error: null,
    };
    // recipe_likes select with head:true returns { count }
    chainMap.recipe_likes._thenResp = { data: null, error: null, count: 7 };
    // simulate select(..., { count: 'exact', head: true }) -> chain.then will provide object; profileApi reads count
    chainMap.recipe_likes._thenResp = { count: 7, error: null };
    const res = await profileApi.fetchUserTotalLikes('u1');
    expect(supabase.from).toHaveBeenCalledWith('recipe_likes');
    expect(res).toBe(7);
  });

  it('fetchUserFavoriteIds maps recipe_ids', async () => {
    chainMap.recipe_favorites._thenResp = {
      data: [{ recipe_id: 'r1' }, { recipe_id: 'r2' }],
      error: null,
    };
    const res = await profileApi.fetchUserFavoriteIds('u1');
    expect(supabase.from).toHaveBeenCalledWith('recipe_favorites');
    expect(chainMap.recipe_favorites.select).toHaveBeenCalledWith('recipe_id');
    expect(chainMap.recipe_favorites.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(res).toEqual(['r1', 'r2']);
  });

  it('fetchFavoriteRecipes returns [] when input empty and queries recipes with .in when non-empty', async () => {
    const empty = await profileApi.fetchFavoriteRecipes([]);
    expect(empty).toEqual([]);

    const recipeData = [{ id: 'r1' }, { id: 'r2' }];
    chainMap.recipes._thenResp = { data: recipeData, error: null };
    const res = await profileApi.fetchFavoriteRecipes(['r1', 'r2']);
    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(chainMap.recipes.in).toHaveBeenCalledWith('id', ['r1', 'r2']);
    expect(res).toEqual(recipeData);
  });

  it('addFavorite and removeFavorite call appropriate tables and throw on error', async () => {
    chainMap.recipe_favorites._thenResp = { data: null, error: null };
    await expect(profileApi.addFavorite('u1', 'r1')).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('recipe_favorites');
    expect(chainMap.recipe_favorites.insert).toHaveBeenCalledWith([
      { user_id: 'u1', recipe_id: 'r1' },
    ]);

    chainMap.recipe_favorites._thenResp = {
      data: null,
      error: new Error('ins'),
    };
    await expect(profileApi.addFavorite('u1', 'r1')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();

    // removeFavorite
    chainMap.recipe_favorites._thenResp = { data: null, error: null };
    await expect(
      profileApi.removeFavorite('u1', 'r1'),
    ).resolves.toBeUndefined();
    expect(chainMap.recipe_favorites.delete).toHaveBeenCalled();
    expect(chainMap.recipe_favorites.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chainMap.recipe_favorites.eq).toHaveBeenCalledWith(
      'recipe_id',
      'r1',
    );

    chainMap.recipe_favorites._thenResp = {
      data: null,
      error: new Error('del'),
    };
    await expect(profileApi.removeFavorite('u1', 'r1')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('updateProfileImage/updateDisplayName/updateUsername/updateBio call profiles.update and handle errors', async () => {
    chainMap.profiles._thenResp = { data: null, error: null };
    await expect(
      profileApi.updateProfileImage('u1', 'img'),
    ).resolves.toBeUndefined();
    expect(chainMap.profiles.update).toHaveBeenCalled();
    expect(chainMap.profiles.eq).toHaveBeenCalledWith('id', 'u1');

    await expect(
      profileApi.updateDisplayName('u1', 'New'),
    ).resolves.toBeUndefined();
    expect(chainMap.profiles.update).toHaveBeenCalled();

    await expect(
      profileApi.updateUsername('u1', 'user'),
    ).resolves.toBeUndefined();
    await expect(profileApi.updateBio('u1', 'bio')).resolves.toBeUndefined();

    chainMap.profiles._thenResp = { data: null, error: new Error('upd') };
    await expect(
      profileApi.updateProfileImage('u1', 'img'),
    ).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
