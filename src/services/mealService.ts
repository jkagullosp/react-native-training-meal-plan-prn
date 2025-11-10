import { mealApi } from '@/api/mealApi';

export async function fetchMealPlans(userId: string) {
  return await mealApi.fetchMealPlans(userId);
}

export async function fetchMealHistory(userId: string) {
  return await mealApi.fetchMealHistory(userId);
}

export async function removeMealPlan(mealPlanId: string) {
  return await mealApi.removeMealplan(mealPlanId);
}

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
