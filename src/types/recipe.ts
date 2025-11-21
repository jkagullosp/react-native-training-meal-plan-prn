export type Recipe = {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  total_time: number | null;
  servings: number | null;
  meal_type: string | null;
  difficulty: string | null;
  is_community: boolean;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  avg_rating: number | null;
  rating_count: number | null;
  created_at: string;
  updated_at: string;
};

export type CreateRecipeInput = {
  title: string;
  description: string;
  total_time?: number;
  servings?: number;
  meal_type?: string;
  difficulty?: string;
  calories?: number;
  fat?: number;
  carbs?: number;
  protein?: number;
  ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id' | 'created_at'>[];
  steps: Omit<RecipeStep, 'id' | 'recipe_id' | 'created_at' | 'updated_at'>[];
  tags: string[];
  images: { image_url: string; is_primary?: boolean; position?: number }[];
};

export type RecipeStep = {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  created_at: string;
  updated_at: string;
};

export type RecipeIngredient = {
  id: string;
  recipe_id: string;
  name: string;
  quantity_value: number;
  unit?: string;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type RecipeTag = {
  recipe_id: string;
  tag_id: string;
  tag: Tag;
};

export type RecipeImage = {
  id: string;
  recipe_id: string;
  image_url: string;
  is_primary: boolean;
  position: number;
  created_at: string;
};

export type RecipeRating = {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number;
  created_at: string;
};

export type FullRecipe = Recipe & {
  images: RecipeImage[];
  steps: RecipeStep[];
  ingredients: RecipeIngredient[];
  tags: RecipeTag[];
  ratings: RecipeRating[];
  likes: RecipeLike[];
};

export type RecipeLike = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};

export type RecipeFavorite = {
  id: string;
  user_id: string;
  recipe_id: string;
  created_at: string;
};
