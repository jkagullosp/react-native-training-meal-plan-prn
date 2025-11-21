import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MyRecipesScreen from '@/modules/profile/screens/MyRecipesScreen';
import MyFavoritesScreen from '@/modules/profile/screens/MyFavoritesScreen';

const Tab = createMaterialTopTabNavigator();

export default function ProfileTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#E16235',
        tabBarIndicatorStyle: { backgroundColor: '#E16235' },
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarStyle: { backgroundColor: '#F7F7F7' },
      }}
    >
      <Tab.Screen name="My Recipes" component={MyRecipesScreen} />
      <Tab.Screen name="My Favorites" component={MyFavoritesScreen} />
    </Tab.Navigator>
  );
}
