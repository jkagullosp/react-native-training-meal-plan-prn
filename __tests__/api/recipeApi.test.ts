import { recipeApi } from '@/api/recipeApi';
import { ApiError } from '@/api/apiHelpers';

type ChainResp = { data?: any; error?: any; count?: number };

function createChain(
  thenResp: ChainResp = { data: null },
  singleResp: ChainResp = { data: null },
) {
  const c: any = {};
  const chainable = [
    'select',
    'eq',
    'order',
    'insert',
    'update',
    'delete',
    'in',
    'limit',
    'gte',
    'range',
  ];
  chainable.forEach(m => (c[m] = jest.fn().mockReturnValue(c)));

  // methods that are awaited directly (return Promise<{data,error}>)
  c.upsert = jest.fn().mockResolvedValue({ data: null, error: null });
  // .single/.maybeSingle used after .select().single()
  c.single = jest.fn().mockResolvedValue(singleResp);
  c.maybeSingle = jest.fn().mockResolvedValue(singleResp);

  // make awaited chain (e.g. await supabase.from(...).select(...)) resolve to thenResp
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

describe('recipeApi', () => {
  let supabase: any;
  let chains: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    supabase = require('@/client/supabase').supabase;

    chains = {
      recipes: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      tags: createChain({ data: [], error: null }, { data: null, error: null }),
      profiles: createChain(
        { data: null, error: null },
        { data: null, error: null },
      ),
      recipe_ratings: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      ingredients: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      recipe_steps: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      recipe_images: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      recipe_tags: createChain(
        { data: [], error: null },
        { data: null, error: null },
      ),
      default: createChain(
        { data: null, error: null },
        { data: null, error: null },
      ),
    };

    supabase.from = jest.fn((table: string) => chains[table] || chains.default);
    supabase.auth = supabase.auth || {};
  });

  it('fetchRecipes returns data and calls recipes table', async () => {
    const data = [{ id: 'r1', title: 't' }];
    chains.recipes._thenResp = { data, error: null };

    const res = await recipeApi.fetchRecipes();
    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(chains.recipes.select).toHaveBeenCalled();
    expect(chains.recipes.eq).toHaveBeenCalledWith('approved', true);
    expect(res).toEqual(data);
  });

  it('fetchRecipesPaginated calls range and returns page', async () => {
    const pageData = [{ id: 'r2' }];
    chains.recipes._thenResp = { data: pageData, error: null };

    const res = await recipeApi.fetchRecipesPaginated(2, 5); // from=5,to=9
    expect(chains.recipes.range).toHaveBeenCalledWith(5, 9);
    expect(res).toEqual(pageData);
  });

  it('fetchTags returns tags', async () => {
    const tags = [{ id: 't1', name: 'X' }];
    chains.tags._thenResp = { data: tags, error: null };

    const res = await recipeApi.fetchTags();
    expect(supabase.from).toHaveBeenCalledWith('tags');
    expect(chains.tags.select).toHaveBeenCalledWith('*');
    expect(res).toEqual(tags);
  });

  it('fetchRecipeAuthor returns profile via maybeSingle', async () => {
    const profile = { id: 'p1', display_name: 'A' };
    chains.profiles.maybeSingle.mockResolvedValue({
      data: profile,
      error: null,
    });

    const res = await recipeApi.fetchRecipeAuthor('p1');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(chains.profiles.select).toHaveBeenCalledWith('*');
    expect(chains.profiles.eq).toHaveBeenCalledWith('id', 'p1');
    expect(res).toEqual(profile);
  });

  it('fetchUserRecipes returns user recipes', async () => {
    const recs = [{ id: 'rU1' }];
    chains.recipes._thenResp = { data: recs, error: null };

    const res = await recipeApi.fetchUserRecipes('user1');
    expect(chains.recipes.eq).toHaveBeenCalledWith('author_id', 'user1');
    expect(res).toEqual(recs);
  });

  it('submitRating upserts, recalculates and updates recipe avg/count', async () => {
    // upsert -> resolve no error
    chains.recipe_ratings.upsert = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    // select ratings -> return rating objects
    chains.recipe_ratings._thenResp = {
      data: [{ rating: 4 }, { rating: 2 }],
      error: null,
    };
    // recipes.update should resolve (we mock update chainable)
    // select ratings -> include the newly submitted rating so avg/count are correct
    chains.recipe_ratings._thenResp = {
      data: [{ rating: 4 }, { rating: 2 }, { rating: 5 }],
      error: null,
    };

    const res = await recipeApi.submitRating('u1', 'r1', 5);
    expect(chains.recipe_ratings.upsert).toHaveBeenCalled();
    // avg = (4+2+5)/3 = 11/3 -> ~3.666..., code rounds to 1 decimal => 3.7
    expect(chains.recipes.update).toHaveBeenCalledWith(
      expect.objectContaining({
        avg_rating: expect.any(Number),
        rating_count: 3,
      }),
    );
    expect(res).toEqual({ avg: expect.any(Number), count: 3 });
  });

  it('fetchPendingUserRecipes returns pending recipes', async () => {
    const pending = [{ id: 'p1' }];
    chains.recipes._thenResp = { data: pending, error: null };
    const res = await recipeApi.fetchPendingUserRecipes('userX');
    expect(chains.recipes.eq).toHaveBeenCalledWith('author_id', 'userX');
    expect(res).toEqual(pending);
  });

  it('submitRecipe inserts recipe and related entities (ingredients/steps/tags/images)', async () => {
    // recipe insert -> .single() returns created recipe id
    chains.recipes.single.mockResolvedValue({
      data: { id: 'recipe-1' },
      error: null,
    });

    // tags: first select returns no tag -> single resolves null, next .single after insert returns new tag id
    chains.tags.single
      .mockResolvedValueOnce({ data: null, error: null }) // tag not found
      .mockResolvedValueOnce({ data: { id: 'tag-1' }, error: null }); // insert returns id

    // ensure other tables present
    chains.ingredients = createChain(
      { data: [], error: null },
      { data: null, error: null },
    );
    chains.recipe_steps = createChain(
      { data: [], error: null },
      { data: null, error: null },
    );
    chains.recipe_tags = createChain(
      { data: [], error: null },
      { data: null, error: null },
    );
    chains.recipe_images = createChain(
      { data: [], error: null },
      { data: null, error: null },
    );

    supabase.from = jest.fn(
      (table: string) => chains[table] || createChain({ data: null }),
    );

    const input = {
      title: 'T',
      description: 'D',
      total_time: 10,
      servings: 2,
      meal_type: 'breakfast',
      difficulty: 'easy',
      calories: 100,
      fat: 5,
      protein: 5,
      carbs: 10,
      ingredients: [{ name: 'Egg', quantity_value: 2, unit: 'pcs' }],
      steps: [{ instruction: 'Mix', step_number: 1 }],
      tags: ['t1'],
      images: [{ image_url: 'http://img', is_primary: true }],
    };

    await expect(
      recipeApi.submitRecipe('user1', input),
    ).resolves.toBeUndefined();

    // verify recipe inserted
    expect(chains.recipes.insert).toHaveBeenCalled();
    // verify ingredients/steps/tags/images inserted
    expect(chains.ingredients.insert).toHaveBeenCalled();
    expect(chains.recipe_steps.insert).toHaveBeenCalled();
    expect(chains.recipe_tags.insert).toHaveBeenCalled();
    expect(chains.recipe_images.insert).toHaveBeenCalled();
  });

  it('fetchApprovedUserRecipes returns approved recipes', async () => {
    const approved = [{ id: 'a1' }];
    chains.recipes._thenResp = { data: approved, error: null };
    const res = await recipeApi.fetchApprovedUserRecipes('u1');
    expect(chains.recipes.eq).toHaveBeenCalledWith('author_id', 'u1');
    expect(chains.recipes.eq).toHaveBeenCalledWith('approved', true);
    expect(res).toEqual(approved);
  });

  it('throws ApiError when underlying queries error', async () => {
    chains.recipes._thenResp = { data: null, error: new Error('db') };
    await expect(recipeApi.fetchRecipes()).rejects.toBeInstanceOf(ApiError);
    expect(require('react-native-toast-message').show).toHaveBeenCalled();
  });
});
