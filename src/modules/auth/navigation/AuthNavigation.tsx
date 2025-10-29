import React from "react";
import { CardStyleInterpolators, createStackNavigator } from "@react-navigation/stack";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
    }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}