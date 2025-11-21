import { recipeApi } from '../api/recipeApi';

export async function fetchRecipes() {
  return await recipeApi.fetchRecipes();
}

export async function fetchTags() {
  return await recipeApi.fetchTags();
}

export async function fetchRecipeAuthor(authorId: string) {
  return await recipeApi.fetchRecipeAuthor(authorId);
}

export async function fetchUserPendingRecipe(userId: string) {
  return await recipeApi.fetchPendingUserRecipes(userId);
}

export async function submitRating({
  userId,
  recipeId,
  rating,
}: {
  userId: string;
  recipeId: string;
  rating: number;
}): Promise<{ avg: number; count: number }> {
  return await recipeApi.submitRating(userId, recipeId, rating);
}
