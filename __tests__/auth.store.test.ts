import { useAuthStore } from '@/stores/auth.store';

jest.mock('@/services/authService', () => ({
  authService: {
    signIn: jest.fn(async (email, password) => {
      if (email === 'test@example.com' && password === 'password') {
        return {
          profile: {
            id: '123',
            username: 'testuser',
            status: 'active',
          },
        };
      }
      return { error: 'Invalid credentials' };
    }),
    signUp: jest.fn(async () => ({ userId: '123' })),
    signOut: jest.fn(async () => ({ error: null })),
    restoreSession: jest.fn(async () => ({
      id: '123',
      username: 'testuser',
      status: 'active',
    })),
  },
}));

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      initialized: false,
    });
    jest.clearAllMocks();
  });

  it('should sign in and set user', async () => {
    const result = await useAuthStore
      .getState()
      .signIn('test@example.com', 'password');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(result.error).toBeNull();
  });

  it('should handle sign in error', async () => {
    const result = await useAuthStore
      .getState()
      .signIn('bad@example.com', 'wrong');
    expect(result.error).toBe('Invalid credentials');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should sign out and clear user', async () => {
    await useAuthStore.getState().signOut();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should sign up a user', async () => {
    const result = await useAuthStore
      .getState()
      .signUp('new@example.com', 'password', 'newuser', 'New User');
    expect(result.error).toBeNull();
  });

  it('should restore session', async () => {
    await useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState().user?.username).toBe('testuser');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().initialized).toBe(true);
  });

  it('should handle non-active user status on signIn', async () => {
    // Mock signIn to return a banned user
    const { signIn } = useAuthStore.getState();
    jest
      .spyOn(require('@/services/authService').authService, 'signIn')
      .mockResolvedValueOnce({
        profile: { id: '123', username: 'testuser', status: 'banned' },
      });

    const result = await signIn('test@example.com', 'password');
    expect(result.error).toBe('banned');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('should handle missing session in initializeAuth', async () => {
    jest
      .spyOn(require('@/services/authService').authService, 'restoreSession')
      .mockResolvedValueOnce(null);

    await useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().initialized).toBe(true);
  });
});
