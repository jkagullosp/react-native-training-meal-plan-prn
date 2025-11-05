import { useDiscoverStore } from './useDiscoverStore';
import { supabase } from '../../utils/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

beforeEach(() => {
  const initialState = {
    user: null,
    recipes: [],
    userRecipes: [],
    loading: false,
    availableTags: [],
    userFavorites: [],
    recipesError: null,
    tagsError: null,
    authors: {},
    fetchProfile: useDiscoverStore.getState().fetchProfile,
    fetchRecipes: useDiscoverStore.getState().fetchRecipes,
    fetchTags: useDiscoverStore.getState().fetchTags,
    fetchAuthor: useDiscoverStore.getState().fetchAuthor,
    fetchUserRecipes: useDiscoverStore.getState().fetchUserRecipes,
    fetchUserTotalLikes: useDiscoverStore.getState().fetchUserTotalLikes,
    fetchUserFavorites: useDiscoverStore.getState().fetchUserFavorites,
    fetchFavoriteRecipes: useDiscoverStore.getState().fetchFavoriteRecipes,
    addFavorite: useDiscoverStore.getState().addFavorite,
    removeFavorite: useDiscoverStore.getState().removeFavorite,
  };
  useDiscoverStore.setState(initialState, true);
});

describe('useDiscoverStore', () => {
  it('fetches profile successfully', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: { user: { id: 'u1' } } },
      error: null,
    });
    (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'u1', username: 'testuser' },
            error: null,
          }),
        }),
      }),
    });

    await useDiscoverStore.getState().fetchProfile();
    expect(useDiscoverStore.getState().user?.username).toBe('testuser');
    expect(useDiscoverStore.getState().loading).toBe(false);
  });

  it('handles missing session in fetchProfile', async () => {
    (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    });

    await useDiscoverStore.getState().fetchProfile();
    expect(useDiscoverStore.getState().user).toBeNull();
    expect(useDiscoverStore.getState().loading).toBe(false);
  });

  it('fetches recipes successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{
          id: 'r1',
          author_id: 'u1',
          title: 'Test Recipe',
          is_community: true,
          images: [],
          steps: [],
          ingredients: [],
          tags: [],
          ratings: [],
          likes: [],
          description: null,
          total_time: null,
          servings: null,
          meal_type: null,
          difficulty: null,
          calories: null,
          protein: null,
          carbs: null,
          fat: null,
          avg_rating: null,
          rating_count: null,
          created_at: '',
          updated_at: '',
        }],
        error: null,
      }),
    });

    await useDiscoverStore.getState().fetchRecipes();
    expect(useDiscoverStore.getState().recipes.length).toBe(1);
    expect(useDiscoverStore.getState().recipes[0].title).toBe('Test Recipe');
    expect(useDiscoverStore.getState().recipesError).toBeNull();
  });

  it('handles error in fetchRecipes', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Fetch error' },
      }),
    });

    await useDiscoverStore.getState().fetchRecipes();
    expect(useDiscoverStore.getState().recipes.length).toBe(0);
    expect(useDiscoverStore.getState().recipesError).toBe('Failed to fetch recipes');
  });

  it('fetches tags successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: [{ id: 't1', name: 'Vegan' }],
        error: null,
      }),
    });

    await useDiscoverStore.getState().fetchTags();
    expect(useDiscoverStore.getState().availableTags[0].name).toBe('Vegan');
    expect(useDiscoverStore.getState().tagsError).toBeNull();
  });

  it('handles error in fetchTags', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Tag error' },
      }),
    });

    await useDiscoverStore.getState().fetchTags();
    expect(useDiscoverStore.getState().availableTags.length).toBe(0);
    expect(useDiscoverStore.getState().tagsError).toBe('Tag error');
  });

  it('fetches author successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: 'author1', display_name: 'Author One', username: 'author1', email: 'a@a.com', profile_image: null, bio: null, created_at: '', updated_at: '' },
            error: null,
          }),
        }),
      }),
    });

    await useDiscoverStore.getState().fetchAuthor('author1');
    expect(useDiscoverStore.getState().authors.author1.display_name).toBe('Author One');
  });

  it('fetches user recipes successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{
            id: 'r2',
            author_id: 'u1',
            title: 'User Recipe',
            is_community: false,
            images: [],
            steps: [],
            ingredients: [],
            tags: [],
            ratings: [],
            likes: [],
            description: null,
            total_time: null,
            servings: null,
            meal_type: null,
            difficulty: null,
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            avg_rating: null,
            rating_count: null,
            created_at: '',
            updated_at: '',
          }],
          error: null,
        }),
      }),
    });

    await useDiscoverStore.getState().fetchUserRecipes('u1');
    expect(useDiscoverStore.getState().userRecipes.length).toBe(1);
    expect(useDiscoverStore.getState().userRecipes[0].title).toBe('User Recipe');
  });

  it('fetches user total likes successfully', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ id: 'r1' }, { id: 'r2' }],
            error: null,
          }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            count: 5,
            error: null,
          }),
        }),
      });

    const count = await useDiscoverStore.getState().fetchUserTotalLikes('u1');
    expect(count).toBe(5);
  });

  it('fetches user favorites successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ recipe_id: 'r1' }, { recipe_id: 'r2' }],
          error: null,
        }),
      }),
    });

    await useDiscoverStore.getState().fetchUserFavorites('u1');
    expect(useDiscoverStore.getState().userFavorites).toEqual(['r1', 'r2']);
  });

  it('fetches favorite recipes successfully', async () => {
    useDiscoverStore.setState({ userFavorites: ['r1', 'r2'] });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'r1', title: 'Fav Recipe 1' },
            { id: 'r2', title: 'Fav Recipe 2' },
          ],
          error: null,
        }),
      }),
    });

    const favs = await useDiscoverStore.getState().fetchFavoriteRecipes();
    expect(favs.length).toBe(2);
    expect(favs[0].title).toBe('Fav Recipe 1');
  });

  it('adds a favorite successfully', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ recipe_id: 'r1' }],
          error: null,
        }),
      }),
    });

    await useDiscoverStore.getState().addFavorite('u1', 'r1');
    // fetchUserFavorites should be called, so userFavorites should be updated
    expect(useDiscoverStore.getState().userFavorites).toContain('r1');
  });

  it('removes a favorite successfully', async () => {
    useDiscoverStore.setState({ userFavorites: ['r1', 'r2'] });
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ error: null }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ recipe_id: 'r2' }],
          error: null,
        }),
      }),
    });

    await useDiscoverStore.getState().removeFavorite('u1', 'r1');
    expect(useDiscoverStore.getState().userFavorites).toEqual(['r2']);
  });

});