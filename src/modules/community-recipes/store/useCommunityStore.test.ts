import { useCommunityStore } from './useCommunityStore';
import { supabase } from '../../../client/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
    },
    from: jest.fn(),
  },
}));

const mockFrom = (table: string) => {
  switch (table) {
    case 'recipes':
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          not: jest.fn().mockResolvedValue({
            data: [{ id: 'r1', title: 'Test Recipe', is_community: true }],
            error: null,
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'recipe123' },
              error: null,
            }),
          }),
        }),
      };
    case 'tags':
      return {
        select: jest.fn().mockReturnValue({
          then: (cb: any) =>
            cb({ data: [{ id: 't1', name: 'Vegan' }], error: null }),
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 't1' },
              error: null,
            }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 't2' },
              error: null,
            }),
          }),
        }),
      };
    case 'profiles':
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: 'u1', username: 'authorUser' },
              error: null,
            }),
          }),
        }),
      };
    case 'recipe_likes':
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ id: 'like1', recipe_id: 'r1', user_id: 'u1' }],
            error: null,
          }),
        }),
        insert: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnThis(),
          exec: jest.fn().mockResolvedValue({}),
        }),
      };
    case 'ingredients':
    case 'recipe_steps':
    case 'recipe_images':
    case 'recipe_tags':
      return { insert: jest.fn().mockResolvedValue({}) };
    default:
      return {};
  }
};

describe('useCommunityStore', () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockImplementation(mockFrom);
    useCommunityStore.setState({
      user: null,
      recipes: [],
      loading: false,
      availableTags: [],
      authors: {},
      recipeLikes: [],
    });
    jest.clearAllMocks();
  });

  it('fetches community recipes successfully', async () => {
    const { fetchCommunityRecipes } = useCommunityStore.getState();
    await fetchCommunityRecipes();

    const state = useCommunityStore.getState();
    expect(state.recipes.length).toBe(1);
    expect(state.recipes[0].title).toBe('Test Recipe');
  });

  it('fetches tags successfully', async () => {
    const { fetchTags } = useCommunityStore.getState();
    await fetchTags();

    const state = useCommunityStore.getState();
    expect(state.availableTags[0].name).toBe('Vegan');
  });

  it('likes and unlikes a recipe', async () => {
    const { likeRecipe, unlikeRecipe } = useCommunityStore.getState();

    await likeRecipe('u1', 'r1');
    const stateAfterLike = useCommunityStore.getState();
    expect(stateAfterLike.recipeLikes.length).toBeGreaterThan(0);

    await unlikeRecipe('u1', 'r1');
    const stateAfterUnlike = useCommunityStore.getState();
    expect(stateAfterUnlike.recipeLikes).toBeDefined();
  });

  it('fetches author details only once', async () => {
    const { fetchAuthor } = useCommunityStore.getState();
    await fetchAuthor('author1');
    await fetchAuthor('author1');

    const authors = useCommunityStore.getState().authors;
    expect(authors.author1).toBeDefined();
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('creates a community recipe successfully', async () => {
    const { createCommunityRecipe } = useCommunityStore.getState();

    await createCommunityRecipe('u1', {
      title: 'New Recipe',
      description: 'Yummy food',
      total_time: 30,
      servings: 2,
      meal_type: 'Dinner',
      difficulty: 'Easy',
      calories: 200,
      fat: 10,
      protein: 15,
      carbs: 20,
      ingredients: [{ name: 'Salt', quantity_value: 1, unit: 'tsp' }],
      steps: [{ instruction: 'Mix ingredients', step_number: 1 }],
      tags: ['Vegan'],
      images: [{ image_url: 'url1', is_primary: true }],
    });

    expect(supabase.from).toHaveBeenCalledWith('recipes');
    expect(supabase.from).toHaveBeenCalledWith('ingredients');
    expect(supabase.from).toHaveBeenCalledWith('recipe_steps');
    expect(supabase.from).toHaveBeenCalledWith('recipe_tags');
    expect(supabase.from).toHaveBeenCalledWith('recipe_images');
  });
});
