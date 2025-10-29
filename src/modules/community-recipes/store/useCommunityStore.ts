import { create } from "zustand";
import { supabase } from "../../utils/supabase";
import { Profile } from "../../auth/types/authTypes";
import { FullRecipe, Recipe, Tag } from "../../discover/types/recipeTypes";
import { RecipeLike } from "../../discover/types/recipeTypes";
import { CreateRecipeInput } from "../types/communityRecipeInputTypes";

type CommunityState = {
  user: Profile | null;
  recipes: FullRecipe[];
  loading: boolean;
  availableTags: Tag[];
  recipeLikes: RecipeLike[];
  authors: { [id: string]: Profile };
  fetchCommunityRecipes: () => Promise<void>;
  fetchTags: () => Promise<void>;
  fetchAuthor: (authorId: string) => Promise<void>;
  likeRecipe: (userId: string, recipeId: string) => Promise<void>;
  unlikeRecipe: (userId: string, recipeId: string) => Promise<void>;
  fetchRecipeLikes: (recipeId: string) => Promise<void>;
  createCommunityRecipe: (
    userId: string,
    data: CreateRecipeInput
  ) => Promise<void>;
};

export const useCommunityStore = create<CommunityState>((set, get) => ({
  user: null,
  recipes: [],
  loading: false,
  availableTags: [],
  authors: {},
  recipeLikes: [],

  fetchProfile: async () => {
    set({ loading: true });

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.log("No Supabase session found");
      set({
        user: null,
        loading: false,
      });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.log("No authenticated user found");
      set({
        user: null,
        loading: false,
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userData.user.id)
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

  fetchCommunityRecipes: async () => {
    set({ loading: true });

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select(
        `*,
      images:recipe_images(*),
      steps:recipe_steps(*),
      ingredients(*),
      tags:recipe_tags(
        tag: tags(*)
      ),
      ratings:recipe_ratings(*)
    `
      )
      .eq("is_community", true)
      .not("author_id", "is", null);

    console.log(
      "(Community) Fetched Community Recipes: ",
      JSON.stringify(recipes, null, 2),
      error
    );

    if (!error && recipes) {
      set({ recipes: recipes as FullRecipe[], loading: false });
    } else {
      set({ recipes: [], loading: false });
    }
  },

  fetchTags: async () => {
    const { data, error } = await supabase.from("tags").select("*");
    if (!error && data) set({ availableTags: data as Tag[] });
    else set({ availableTags: [] });
  },

  fetchAuthor: async (authorId: string) => {
    if (get().authors[authorId]) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authorId)
      .maybeSingle();
    if (!error && data) {
      set((state) => ({
        authors: { ...state.authors, [authorId]: data as Profile },
      }));
    }
  },

  likeRecipe: async (userId, recipeId) => {
    set((state) => ({
      recipeLikes: [
        ...state.recipeLikes,
        {
          id: "optimistic",
          user_id: userId,
          recipe_id: recipeId,
          created_at: new Date().toISOString(),
        },
      ],
    }));
    await supabase
      .from("recipe_likes")
      .insert([{ user_id: userId, recipe_id: recipeId }]);

    await get().fetchRecipeLikes(recipeId);
  },

  unlikeRecipe: async (userId, recipeId) => {
    set((state) => ({
      recipeLikes: state.recipeLikes.filter(
        (like) => !(like.user_id === userId && like.recipe_id === recipeId)
      ),
    }));
    await supabase
      .from("recipe_likes")
      .delete()
      .eq("user_id", userId)
      .eq("recipe_id", recipeId);
    await get().fetchRecipeLikes(recipeId);
  },

  fetchRecipeLikes: async (recipeId) => {
    const { data } = await supabase
      .from("recipe_likes")
      .select("*")
      .eq("recipe_id", recipeId);
    set({ recipeLikes: data || [] });
  },

  createCommunityRecipe: async (userId: string, data: CreateRecipeInput) => {
    set({ loading: true });

    const { data: recipeData, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          author_id: userId,
          title: data.title,
          description: data.description,
          total_time: data.total_time,
          servings: data.servings,
          meal_type: data.meal_type,
          difficulty: data.difficulty,
          is_community: true,
          calories: data.calories,
          fat: data.fat,
          protein: data.protein,
          carbs: data.carbs,
        },
      ])
      .select()
      .single();

    if (recipeError || !recipeData)
      throw recipeError || new Error("Recipe creation failed");

    const recipeId = recipeData.id;

    if (data.ingredients.length > 0) {
      await supabase.from("ingredients").insert(
        data.ingredients.map((ingredient) => ({
          recipe_id: recipeId,
          name: ingredient.name,
          quantity_value: ingredient.quantity_value,
          unit: ingredient.unit,
        }))
      );
    }

    if (data.steps.length > 0) {
      await supabase.from("recipe_steps").insert(
        data.steps.map((step, idx) => ({
          recipe_id: recipeId,
          step_number: idx + 1,
          instruction: step.instruction,
        }))
      );
    }

    for (const tagName of data.tags) {
      // Try to find the tag by name
      let { data: tagData } = await supabase
        .from("tags")
        .select("id")
        .eq("name", tagName)
        .single();

      let tagId: string | undefined = tagData?.id;

      // If not found, try to insert
      if (!tagId) {
        const { data: newTag, error: newTagError } = await supabase
          .from("tags")
          .insert([{ name: tagName }])
          .select("id")
          .single();

        if (newTag && newTag.id) {
          tagId = newTag.id;
        } else {
          // If insert failed (e.g. duplicate), fetch again
          const { data: existingTag } = await supabase
            .from("tags")
            .select("id")
            .eq("name", tagName)
            .single();
          tagId = existingTag?.id;
        }
      }

      // Only insert if we have a tagId
      if (tagId) {
        await supabase
          .from("recipe_tags")
          .insert([{ recipe_id: recipeId, tag_id: tagId }]);
      }
    }

    if (data.images.length > 0) {
      await supabase.from("recipe_images").insert(
        data.images.map((img, idx) => ({
          recipe_id: recipeId,
          image_url: img.image_url,
          is_primary: img.is_primary ?? idx === 0,
          position: img.position ?? idx + 1,
        }))
      );
    }

    await get().fetchCommunityRecipes();
    set({ loading: false });
  },
}));
