import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import DiscoverStack from '@/navigation/stacks/DiscoverStack';
import MealPlanScreen from '../screens/MealPlanScreen';
import CommunityStack from './stacks/CommunityStack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ShoppingListTabs from './tabs/ShoppingListTabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileStack from './stacks/ProfileStack';
import {
  Search,
  CalendarFold,
  Users,
  ShoppingCart,
  User,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#E16235',
        tabBarInactiveTintColor: '#999999',
        tabBarIcon: ({ color, size }) => {
          if (Platform.OS === 'ios') {
            let iconName = 'home';
            if (route.name === 'Discover') <Search color={color} size={size} />;
            if (route.name === 'Meal Plan') iconName = 'calendar';
            if (route.name === 'Community') iconName = 'account-group-outline';
            if (route.name === 'Shopping List') iconName = 'cart-outline';
            if (route.name === 'Profile') iconName = 'account-outline';
            return <Icon name={iconName} size={size} color={color} />;
          } else {
            if (route.name === 'Discover')
              return <Search color={color} size={size} />;
            if (route.name === 'Meal Plan')
              return <CalendarFold color={color} size={size} />;
            if (route.name === 'Community')
              return <Users color={color} size={size} />;
            if (route.name === 'Shopping List')
              return <ShoppingCart color={color} size={size} />;
            if (route.name === 'Profile')
              return <User color={color} size={size} />;
            return null;
          }
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Meal Plan" component={MealPlanScreen} />
      <Tab.Screen
        name="Shopping List"
        children={() => (
          <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <ShoppingListTabs />
          </SafeAreaView>
        )}
      />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
