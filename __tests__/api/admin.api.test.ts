import { adminApi } from '@/api/adminApi';
import { CreateRecipeInput } from '@/types/recipe';

type ChainResp = { data: any; error: any };

function createChain(
  thenResp: ChainResp = { data: [{ id: 'x' }], error: null },
  singleResp: ChainResp = { data: { id: 'r1' }, error: null },
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
  c.then = jest.fn().mockImplementation(async (onFulfilled: any) => {
    onFulfilled(thenResp);
    return Promise.resolve(thenResp);
  });
  return c;
}

describe('AdminApi', () => {
  let fromMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    fromMock = require('@/client/supabase').supabase.from;
    // default chain for simple queries
    const defaultChain = createChain({ data: [{ id: 'user1' }], error: null });
    fromMock.mockImplementation(() => defaultChain);
  });

  it('getAllUsers calls supabase with correct query', async () => {
    // arrange: defaultChain returns [{id: 'user1'}]
    const result = await adminApi.getAllUsers();
    expect(require('@/client/supabase').supabase.from).toHaveBeenCalledWith(
      'profiles',
    );

    // verify shapes called as in code
    const profilesChain =
      require('@/client/supabase').supabase.from('profiles');
    expect(profilesChain.select).toHaveBeenCalledWith('*');
    expect(profilesChain.eq).toHaveBeenCalledWith('is_admin', false);
    expect(profilesChain.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });

    expect(result).toEqual([{ id: 'user1' }]);
  });

  it('banUser / suspendUser / deleteUser call appropriate methods', async () => {
    const profilesChain = createChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) =>
      table === 'profiles' ? profilesChain : createChain(),
    );

    await adminApi.banUser('user1');
    expect(profilesChain.update).toHaveBeenCalledWith({ status: 'banned' });
    expect(profilesChain.eq).toHaveBeenCalledWith('id', 'user1');

    await adminApi.suspendUser('user1', 1000);
    expect(profilesChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'suspended',
        suspended_until: expect.any(String),
      }),
    );

    await adminApi.deleteUser('user1');
    expect(profilesChain.delete).toHaveBeenCalled();
    expect(profilesChain.eq).toHaveBeenCalledWith('id', 'user1');
  });

  it('fetchRecipesNotPending / fetchPendingRecipes call recipes chain and eq', async () => {
    const recipesChain = createChain({ data: [{ id: 'r1' }], error: null });
    fromMock.mockImplementation((table: string) =>
      table === 'recipes' ? recipesChain : createChain(),
    );

    await adminApi.fetchRecipesNotPending();
    expect(recipesChain.select).toHaveBeenCalled();
    expect(recipesChain.eq).toHaveBeenCalledWith('approved', true);

    await adminApi.fetchPendingRecipes();
    expect(recipesChain.eq).toHaveBeenCalledWith('approved', false);
  });

  it('approveRecipe and disapproveRecipe call update/delete with eq', async () => {
    const recipesChain = createChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) =>
      table === 'recipes' ? recipesChain : createChain(),
    );

    await adminApi.approveRecipe('r1');
    expect(recipesChain.update).toHaveBeenCalledWith({ approved: true });
    expect(recipesChain.eq).toHaveBeenCalledWith('id', 'r1');

    await adminApi.disapproveRecipe('r1');
    expect(recipesChain.delete).toHaveBeenCalled();
    expect(recipesChain.eq).toHaveBeenCalledWith('id', 'r1');
  });

  it('fetchMostFavoritedRecipe returns null when no favorites and returns recipe when present', async () => {
    // case: no favorites -> first call returns empty array
    const favChainEmpty = createChain({ data: [], error: null });
    const recipesChain = createChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'recipe_favorites') return favChainEmpty;
      if (table === 'recipes') return recipesChain;
      return createChain();
    });

    const res1 = await adminApi.fetchMostFavoritedRecipe();
    expect(res1).toBeNull();

    // case: favorites exist -> return recipe
    const favChain = createChain({
      data: [{ recipe_id: 'r10' }, { recipe_id: 'r10' }],
      error: null,
    });
    const topRecipe = { id: 'r10', title: 'Top' };
    const recipesChainWithTop = createChain({ data: [topRecipe], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'recipe_favorites') return favChain;
      if (table === 'recipes') return recipesChainWithTop;
      return createChain();
    });

    const res2 = await adminApi.fetchMostFavoritedRecipe();
    expect(res2).toEqual(topRecipe);
  });

  it('fetchMostLikedRecipe returns null when no likes and returns recipe when present', async () => {
    const likesEmpty = createChain({ data: [], error: null });
    const recipesChain = createChain({ data: [], error: null });
    fromMock.mockImplementation((table: string) => {
      if (table === 'recipe_likes') return likesEmpty;
      if (table === 'recipes') return recipesChain;
      return createChain();
    });

    const r1 = await adminApi.fetchMostLikedRecipe();
    expect(r1).toBeNull();

    const likes = createChain({ data: [{ recipe_id: 'r20' }], error: null });
    const recipeSingle = createChain(
      { data: [{ id: 'r20' }], error: null },
      { data: { id: 'r20' }, error: null },
    );
    fromMock.mockImplementation((table: string) => {
      if (table === 'recipe_likes') return likes;
      if (table === 'recipes') return recipeSingle;
      return createChain();
    });

    const r2 = await adminApi.fetchMostLikedRecipe();
    expect(r2).toEqual({ id: 'r20' });
  });

  it('getRecipesApprovedLast30Days calls gte and order', async () => {
    const recipesChain = createChain({ data: [{ id: 'r30' }], error: null });
    fromMock.mockImplementation((table: string) =>
      table === 'recipes' ? recipesChain : createChain(),
    );

    const res = await adminApi.getRecipesApprovedLast30Days();
    expect(recipesChain.eq).toHaveBeenCalledWith('approved', true);
    expect(recipesChain.gte).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
    );
    expect(res).toEqual([{ id: 'r30' }]);
  });

  it('submitAdminRecipe inserts recipe and related entities (tags/steps/images/ingredients) when provided', async () => {
    const recipesChain = createChain(
      { data: [], error: null },
      { data: { id: 'recipe-1' }, error: null },
    );
    const ingredientsChain = createChain({ data: [], error: null });
    const stepsChain = createChain({ data: [], error: null });
    const tagsChain = createChain(
      { data: [{ id: 'tag-1' }], error: null },
      { data: { id: 'tag-1' }, error: null },
    );
    const recipeTagsChain = createChain({ data: [], error: null });
    const imagesChain = createChain({ data: [], error: null });

    fromMock.mockImplementation((table: string) => {
      switch (table) {
        case 'recipes':
          return recipesChain;
        case 'ingredients':
          return ingredientsChain;
        case 'recipe_steps':
          return stepsChain;
        case 'tags':
          return tagsChain;
        case 'recipe_tags':
          return recipeTagsChain;
        case 'recipe_images':
          return imagesChain;
        default:
          return createChain();
      }
    });

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
      ingredients: [{ name: 'Egg', quantity_value: 2, unit: 'pcs' }],
      steps: [{ instruction: 'Mix', step_number: 1 }],
      tags: ['t1'],
      images: [{ image_url: 'http://img', is_primary: true }],
    };

    await adminApi.submitAdminRecipe('user1', input);

    expect(recipesChain.insert).toHaveBeenCalled();
    expect(ingredientsChain.insert).toHaveBeenCalled();
    expect(stepsChain.insert).toHaveBeenCalled();
    expect(tagsChain.select).toHaveBeenCalled();
    expect(recipeTagsChain.insert).toHaveBeenCalled();
    expect(imagesChain.insert).toHaveBeenCalled();
  });
});
