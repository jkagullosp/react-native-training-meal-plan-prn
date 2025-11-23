import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileSettingsScreen from '../../screens/ProfileSettingsScreen';
import ProfileMainScreen from '../../screens/ProfileMainScreen';

const Stack = createStackNavigator();

export default function ProfileStack() {
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
      <Stack.Screen name="Profile" component={ProfileMainScreen} />
      <Stack.Screen name="Settings" component={ProfileSettingsScreen} />
    </Stack.Navigator>
  );
}
