import { communityApi } from '@/api/communityApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data: any; error: any };

function createChain(
  thenResp: ChainResp = { data: [], error: null },
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

describe('CommunityApi', () => {
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
      recipe_likes: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      default: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
    };

    supabase.from = jest.fn(
      (table: string) => chainMap[table] || chainMap.default,
    );
  });

  it('fetchAuthor returns profile on success and calls the correct chain methods', async () => {
    const profile = {
      id: 'a1',
      display_name: 'Author',
      username: 'auth',
      email: 'a@test',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: profile,
      error: null,
    });

    const res = await communityApi.fetchAuthor('a1');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(chainMap.profiles.select).toHaveBeenCalledWith('*');
    expect(chainMap.profiles.eq).toHaveBeenCalledWith('id', 'a1');
    expect(res).toEqual(profile);
  });

  it('fetchAuthor throws ApiError and shows toast on db error', async () => {
    chainMap.profiles.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error('db'),
    });
    await expect(communityApi.fetchAuthor('bad')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('fetchRecipeLikes returns likes array and queries recipe_likes with recipe_id', async () => {
    const likes = [
      { id: 'l1', user_id: 'u1', recipe_id: 'r1', created_at: '' },
    ];
    chainMap.recipe_likes._thenResp = { data: likes, error: null };

    const res = await communityApi.fetchRecipeLikes('r1');
    expect(supabase.from).toHaveBeenCalledWith('recipe_likes');
    expect(chainMap.recipe_likes.select).toHaveBeenCalledWith('*');
    expect(chainMap.recipe_likes.eq).toHaveBeenCalledWith('recipe_id', 'r1');
    expect(res).toEqual(likes);
  });

  it('fetchRecipeLikes throws ApiError on db error', async () => {
    chainMap.recipe_likes._thenResp = { data: null, error: new Error('db') };
    await expect(communityApi.fetchRecipeLikes('rX')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('likeRecipe inserts a like and does not throw on success', async () => {
    // make insert result successful
    chainMap.recipe_likes._thenResp = { data: null, error: null };

    await expect(communityApi.likeRecipe('u1', 'r1')).resolves.toBeUndefined();
    expect(supabase.from).toHaveBeenCalledWith('recipe_likes');
    expect(chainMap.recipe_likes.insert).toHaveBeenCalledWith([
      { user_id: 'u1', recipe_id: 'r1' },
    ]);
  });

  it('likeRecipe throws ApiError on insert error', async () => {
    chainMap.recipe_likes._thenResp = {
      data: null,
      error: new Error('insert-fail'),
    };
    await expect(communityApi.likeRecipe('uX', 'rX')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });

  it('unlikeRecipe deletes likes with proper eq calls and resolves on success', async () => {
    chainMap.recipe_likes._thenResp = { data: null, error: null };
    await expect(
      communityApi.unlikeRecipe('u1', 'r1'),
    ).resolves.toBeUndefined();

    expect(supabase.from).toHaveBeenCalledWith('recipe_likes');
    expect(chainMap.recipe_likes.delete).toHaveBeenCalled();
    // ensure eq called for both user_id and recipe_id
    expect(chainMap.recipe_likes.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(chainMap.recipe_likes.eq).toHaveBeenCalledWith('recipe_id', 'r1');
  });

  it('unlikeRecipe throws ApiError on delete error', async () => {
    chainMap.recipe_likes._thenResp = {
      data: null,
      error: new Error('delete-fail'),
    };
    await expect(communityApi.unlikeRecipe('uX', 'rX')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
