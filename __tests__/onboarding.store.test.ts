import { useOnboardingStore } from '@/stores/onboarding.store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadOnboardingState } from '@/stores/onboarding.store';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Onboarding Store', () => {
  beforeEach(() => {
    useOnboardingStore.setState({ hasOnboarded: false });
    jest.clearAllMocks();
  });

  it('should set onboarding state and save to AsyncStorage', async () => {
    await useOnboardingStore.getState().setHasOnboarded(true);
    expect(useOnboardingStore.getState().hasOnboarded).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasOnboarded', 'true');
  });

  it('should load onboarding state as true', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');
    const result = await loadOnboardingState();
    expect(result).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasOnboarded');
  });

  it('should load onboarding state as false', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('false');
    const result = await loadOnboardingState();
    expect(result).toBe(false);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasOnboarded');
  });

  it('should handle AsyncStorage getItem error', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const result = await loadOnboardingState();
    expect(result).toBeUndefined();
  });

  it('should handle AsyncStorage setItem error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    await useOnboardingStore.getState().setHasOnboarded(false);
    expect(useOnboardingStore.getState().hasOnboarded).toBe(false);
  });
});
