import { create } from 'zustand';
import { supabase } from '../../../client/supabase';
import { Profile } from '../../../types/auth';
import { FullRecipe, Tag } from '../types/recipeTypes';

type DiscoverState = {
  user: Profile | null;
  recipes: FullRecipe[];
  userRecipes: FullRecipe[];
  loading: boolean;
  availableTags: Tag[];
  userFavorites: string[];
  recipesError: string | null;
  tagsError: string | null;
  authors: { [id: string]: Profile };
  fetchProfile: () => Promise<void>;
  fetchRecipes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchAuthor: (authorId: string) => Promise<void>;
  fetchUserRecipes: (userId: string) => Promise<void>;
  fetchUserTotalLikes: (userId: string) => Promise<number>;
  fetchUserFavorites: (userId: string) => Promise<void>;
  fetchFavoriteRecipes: () => Promise<FullRecipe[]>;
  addFavorite: (userId: string, recipeId: string) => Promise<void>;
  removeFavorite: (userId: string, recipeId: string) => Promise<void>;
};
export const useDiscoverStore = create<DiscoverState>((set, get) => ({
  user: null,
  recipes: [],
  loading: false,
  recipesError: null,
  tagsError: null,
  availableTags: [],
  authors: {},
  userRecipes: [],
  userFavorites: [],

  fetchProfile: async () => {
    set({ loading: true });

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.log('No Supabase session found');
      set({
        user: null,
        loading: false,
      });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.log('No authenticated user found');
      set({
        user: null,
        loading: false,
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (!profileError && profile) {
      set({
        user: profile,
        loading: false,
      });
    } else {
      set({
        user: null,
        loading: false,
      });
    }
  },

  fetchRecipes: async () => {
    set({ loading: true });

    const { data: recipes, error } = await supabase.from('recipes').select(
      `*,
        images:recipe_images(*),
        steps:recipe_steps(*),
        ingredients(*),
        tags:recipe_tags(
          tag: tags(*)
        ),
        ratings:recipe_ratings(*)
      `,
    );

    console.log(
      '(Discover) Fetched recipes: ',
      JSON.stringify(recipes, null, 2),
      error,
    );

    if (!error && recipes) {
      set({
        recipes: recipes as FullRecipe[],
        loading: false,
        recipesError: null,
      });
    } else {
      console.log('(Discover) Error fetching recipes: ', error);
      set({
        recipes: [],
        loading: false,
        recipesError: 'Failed to fetch recipes',
      });
    }
  },

  fetchTags: async () => {
    set({ loading: true, tagsError: null });
    const { data, error } = await supabase.from('tags').select('*');
    if (!error && data) {
      set({ availableTags: data as Tag[], tagsError: null, loading: false });
    } else {
      set({
        availableTags: [],
        tagsError: error?.message || 'Failed to fetch tags',
        loading: false,
      });
    }
  },

  fetchAuthor: async (authorId: string) => {
    if (get().authors[authorId]) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authorId)
      .maybeSingle();
    if (!error && data) {
      set(state => ({
        authors: { ...state.authors, [authorId]: data as Profile },
      }));
    }
  },

  fetchUserRecipes: async (userId: string) => {
    set({ loading: true });

    const { data: recipes, error } = await supabase
      .from('recipes')
      .select(
        `*,
        images:recipe_images(*),
        steps:recipe_steps(*),
        ingredients(*),
        tags:recipe_tags(
          tag: tags(*)
        ),
        ratings:recipe_ratings(*)
      `,
      )
      .eq('author_id', userId);

    if (!error && recipes) {
      set({ userRecipes: recipes as FullRecipe[], loading: false });
    } else {
      set({ userRecipes: [], loading: false });
      console.log('(Discover) Error fetching user recipes: ', error);
    }
  },

  fetchUserTotalLikes: async (userId: string) => {
    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id')
      .eq('author_id', userId);

    if (recipesError || !recipes || recipes.length === 0) return 0;

    const recipeIds = recipes.map(r => r.id);

    const { count, error: likesError } = await supabase
      .from('recipe_likes')
      .select('id', { count: 'exact', head: true })
      .in('recipe_id', recipeIds);

    if (likesError) return 0;
    return count || 0;
  },

  fetchUserFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from('recipe_favorites')
      .select('recipe_id')
      .eq('user_id', userId);

    if (!error && data) {
      set({ userFavorites: data.map(fav => fav.recipe_id) });
    } else {
      set({ userFavorites: [] });
    }
  },

  fetchFavoriteRecipes: async () => {
    const recipeIds = get().userFavorites;
    if (!recipeIds.length) return [];
    const { data, error } = await supabase
      .from('recipes')
      .select(
        `*,
        images:recipe_images(*),
        steps:recipe_steps(*),
        ingredients(*),
        tags:recipe_tags(tag:tags(*)),
        ratings:recipe_ratings(*)`,
      )
      .in('id', recipeIds);

    return data || [];
  },

  addFavorite: async (userId: string, recipeId: string) => {
    const { error } = await supabase
      .from('recipe_favorites')
      .insert([{ user_id: userId, recipe_id: recipeId }]);
    if (!error) {
      get().fetchUserFavorites(userId);
    }
  },

  removeFavorite: async (userId: string, recipeId: string) => {
    const { error } = await supabase
      .from('recipe_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);
    if (!error) {
      get().fetchUserFavorites(userId);
    }
  },
}));
