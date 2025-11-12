import { mealApi } from '@/api/mealApi';

export async function fetchMealPlans(userId: string) {
  return await mealApi.fetchMealPlans(userId);
}

export async function fetchMealHistory(userId: string) {
  return await mealApi.fetchMealHistory(userId);
}

// TODO: Cancel notification
export async function removeMealPlan(mealPlanId: string) {
  return await mealApi.removeMealplan(mealPlanId);
}

// TODO: Deduct ingredients from recipe
export async function markMealDone({
  userId,
  recipeId,
  mealDate,
  mealType,
}: {
  userId: string;
  recipeId: string;
  mealDate: string;
  mealType: string;
}): Promise<void> {
  return await mealApi.markMealDone(userId, recipeId, mealDate, mealType);
}

// TODO: Schedule notification
export async function addMealPlan({
  userId,
  recipeId,
  mealDate,
  mealType,
}: {
  userId: string;
  recipeId: string;
  mealDate: string;
  mealType: string;
}): Promise<void> {
  return await mealApi.addMealPlan(userId, recipeId, mealDate, mealType);
}

export async function removeIngredientsForRecipe({
  userId,
  recipeId,
}: {
  userId: string;
  recipeId: string;
}): Promise<void> {
  return await mealApi.removeIngredientsForRecipe(userId, recipeId);
}
