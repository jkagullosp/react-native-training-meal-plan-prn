import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import CommunityRecipesScreen from "../screens/CommunityRecipeScreen";
import CommunityRecipeDetailScreen from "../screens/CommunityRecipeDetailScreen";
import CreateRecipeScreen from "../screens/CreateRecipeScreen";
import RecipeFavoriteButton from "../../profile/components/RecipeFavoriteButton";

export type CommunityStackParamList = {
  CommunityRecipes: undefined;
  CommunityRecipeDetail: { title: string; recipeId: string };
  CommunityProfile: undefined;
  CreateRecipe: undefined;
};
const Stack = createStackNavigator<CommunityStackParamList>();

export default function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: "#2a2a2aff",
        headerBackTitleStyle: {
          fontSize: 15,
        },
        headerTitleStyle: {
          fontSize: 15,
        },
      }}
    >
      <Stack.Screen
        name="CommunityRecipes"
        component={CommunityRecipesScreen}
      />
      <Stack.Screen
        name="CommunityRecipeDetail"
        component={CommunityRecipeDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || "Recipe Detail",
          headerRight: () => (
            <RecipeFavoriteButton recipeId={route.params?.recipeId} />
          ),
        })}
      />
      <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
    </Stack.Navigator>
  );
}
