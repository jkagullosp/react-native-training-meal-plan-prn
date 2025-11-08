import { recipeApi } from "../api/recipeApi";

export async function fetchRecipes() {
  return await recipeApi.fetchRecipes();
}