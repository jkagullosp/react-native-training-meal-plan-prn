/* global jest */

// ---- Mock Keychain ----
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() =>
    Promise.resolve({ username: 'test', password: 'test' }),
  ),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// ---- Mock Toast ----
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

// ---- IMPORTANT: Mock exponential backoff (fixes hanging tests) ----
jest.mock('@/api/exponentialBackoff', () => ({
  withExponentialBackoff: fn => fn(), // run immediately, no retry, no timers
}));

// ---- IMPORTANT: Mock Supabase completely ----
jest.mock('@/client/supabase', () => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),

    // return promises
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
  };

  return {
    supabase: {
      from: jest.fn(() => chain),
    },
  };
});
