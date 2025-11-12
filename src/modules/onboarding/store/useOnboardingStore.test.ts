import {
  useOnboardingStore,
  loadOnboardingState,
} from '../../../stores/useOnboardingStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

beforeEach(() => {
  useOnboardingStore.setState({ hasOnboarded: false });
  jest.clearAllMocks();
});

describe('useOnboardingStore', () => {
  it('sets onboarding state and saves to AsyncStorage', async () => {
    await useOnboardingStore.getState().setHasOnboarded(true);
    expect(useOnboardingStore.getState().hasOnboarded).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('hasOnboarded', 'true');
  });

  it('handles AsyncStorage error when saving onboarding state', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    await useOnboardingStore.getState().setHasOnboarded(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to save onboarding status: ',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore();
  });
});

describe('loadOnboardingState', () => {
  it('loads onboarding state as true', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');
    const result = await loadOnboardingState();
    expect(result).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('hasOnboarded');
  });

  it('loads onboarding state as false', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('false');
    const result = await loadOnboardingState();
    expect(result).toBe(false);
  });

  it('handles AsyncStorage error when loading onboarding state', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
      new Error('fail'),
    );
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const result = await loadOnboardingState();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load onboarding status: ',
      expect.any(Error),
    );
    expect(result).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });
});
