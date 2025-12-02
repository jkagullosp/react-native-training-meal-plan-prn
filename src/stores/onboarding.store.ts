import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingState } from '@/types/onboarding';

export const useOnboardingStore = create<OnboardingState>(set => ({
  hasOnboarded: false,
  setHasOnboarded: async (value: boolean) => {
    set({ hasOnboarded: value });
    try {
      await AsyncStorage.setItem('hasOnboarded', value ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to save onboarding status: ', error);
    }
  },
}));

export const loadOnboardingState = async () => {
  try {
    const value = await AsyncStorage.getItem('hasOnboarded');
    return value === 'true';
  } catch (error) {
    console.error('Failed to load onboarding status: ', error);
  }
};
