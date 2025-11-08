import { recipeApi } from "../api/recipeApi";

export async function fetchRecipes() {
  return await recipeApi.fetchRecipes();
}

export async function fetchTags() {
  return await recipeApi.fetchTags();
}