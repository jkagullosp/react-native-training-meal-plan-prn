import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import DiscoverScreen from '@/screens/DiscoverScreen';
import RecipeDetailScreen from '@/screens/RecipeDetailScreen';
import RecipeFavoriteButton from '@/components/RecipeFavoriteButton';

export type DiscoverStackParamList = {
  Discover: undefined;
  RecipeDetail: { title: string; recipeId: string };
};

const Stack = createStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
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
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen
        name="RecipeDetail"
        component={RecipeDetailScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || 'Recipe Detail',
          headerRight: () => (
            <RecipeFavoriteButton recipeId={route.params?.recipeId} recipeTitle={route.params?.title} />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
