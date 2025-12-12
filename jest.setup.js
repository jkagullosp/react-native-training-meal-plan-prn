/* global jest */

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() =>
    Promise.resolve({ username: 'test', password: 'test' }),
  ),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
}));

jest.mock('@/api/exponentialBackoff', () => ({
  withExponentialBackoff: fn => fn(),
}));

jest.mock('@/client/supabase', () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),

    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    supabase: {
      from: jest.fn(() => chain),
    },
  };
});
