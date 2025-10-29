import React from "react";
import OnboardingScreen from "../screens/OnboardingScreen";

export default function OnboardingNavigation({ onFinish }: { onFinish: () => void }) {
  return <OnboardingScreen onFinish={onFinish} />;
}