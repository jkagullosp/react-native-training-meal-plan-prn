import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DiscoverScreen from '@/screens/DiscoverScreen';
import CreateRecipeScreen from '@/screens/CreateRecipeScreen';
import RecipeFavoriteButton from '@/modules/profile/components/RecipeFavoriteButton';
import RecipeDetailScreen from '@/screens/RecipeDetailScreen';

export type CommunityStackParamList = {
  Community: undefined;
  CommunityRecipeDetail: { title: string; recipeId: string };
  RecipeDetail: {
    title: string;
    recipeId: string;
    recipe?: any;
    mode?: 'discover' | 'community';
  };
  CommunityProfile: undefined;
  CreateRecipe: undefined;
};
const Stack = createStackNavigator<CommunityStackParamList>();

export default function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerTintColor: '#2a2a2aff',
        headerBackTitleStyle: {
          fontSize: 15,
        },
        headerTitleStyle: {
          fontSize: 15,
        },
      }}
    >
      <Stack.Screen
        name="Community"
        children={props => <DiscoverScreen {...props} mode="community" />}
      />

      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || 'Recipe Detail',
          headerRight: () => (
            <RecipeFavoriteButton recipeId={route.params?.recipeId} />
          ),
        })}
      />
      <Stack.Screen name="CreateRecipe" component={CreateRecipeScreen} />
    </Stack.Navigator>
  );
}
