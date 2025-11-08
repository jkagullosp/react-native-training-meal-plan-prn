import { useAuthStore } from './useAuthStore';
import { supabase } from '../../../client/supabase';

jest.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: { id: '123' } } },
        error: null,
      }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: '123' } },
        error: null,
      }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({
        data: {},
        error: null,
      }),
      updateUser: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: { id: '123', username: 'testuser' },
            error: null,
          }),
        })),
      })),
    })),
  },
}));

describe('authentication test', () => {
  beforeEach(() => {
    // Reset Zustand store before each test
    useAuthStore.setState(
      {
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: false,
        signIn: useAuthStore.getState().signIn,
        signUp: useAuthStore.getState().signUp,
        signOut: useAuthStore.getState().signOut,
        fetchProfile: useAuthStore.getState().fetchProfile,
        forgotPassword: useAuthStore.getState().forgotPassword,
        resetPassword: useAuthStore.getState().resetPassword,
      },
      true,
    );
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('signs in a user successfully', async () => {
      const { signIn } = useAuthStore.getState();
      const result = await signIn('test@example.com', 'password');

      expect(result.error).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.username).toBe('testuser');
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });

    it('handles sign-in errors', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      const { signIn } = useAuthStore.getState();
      const result = await signIn('bad@example.com', 'wrong');

      expect(result.error).toBeTruthy();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('signUp', () => {
    it('signs up a user successfully', async () => {
      const { signUp } = useAuthStore.getState();
      const result = await signUp(
        'new@example.com',
        'testing12345',
        '@testing12345',
        'password',
      );

      expect(result.error).toBeNull();
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'testing12345',
        options: {
          data: {
            display_name: '@testing12345',
            username: 'password',
          },
        },
      });
    });

    it('handles sign-up errors', async () => {
      const { signUp } = useAuthStore.getState();
      const result = await signUp(
        'new@example.com',
        'testing12345',
        '@testing12345',
        'wrongpassword',
      );

      expect(result.error).toBeFalsy();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('signOut', () => {
    it('signs out the user and clears state', async () => {
      useAuthStore.setState({ isAuthenticated: true });
      const { signOut } = useAuthStore.getState();

      await signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  describe('fetchProfile', () => {
    it('fetches profile and sets user when session and user exist', async () => {
      // Mock session and user
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: '123', username: 'testuser' },
              error: null,
            }),
          }),
        }),
      });

      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      expect(useAuthStore.getState().user?.username).toBe('testuser');
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().initialized).toBe(true);
    });

    it('handles missing session', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().initialized).toBe(true);
    });

    it('handles missing user', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().initialized).toBe(true);
    });

    it('handles profile fetch error', async () => {
      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: { user: { id: '123' } } },
        error: null,
      });
      (supabase.auth.getUser as jest.Mock).mockResolvedValueOnce({
        data: { user: { id: '123' } },
        error: null,
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Profile error' },
            }),
          }),
        }),
      });

      const { fetchProfile } = useAuthStore.getState();
      await fetchProfile();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().initialized).toBe(true);
    });
  });
});
