import { authService } from '@/services/authService';
import { authApi } from '@/api/authApi';
import { useAuthStore } from '@/stores/auth.store';
import { Profile } from '@/types/auth';

// TODO: unit tests for api and hooks
describe('authService + authApi integration', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('signIn calls authApi.signIn and getProfile, returns profile', async () => {
    const user = { id: '1' } as any;
    const profile: Profile = {
      id: '1',
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };

    jest
      .spyOn(authApi, 'signIn')
      .mockResolvedValue({ user, session: {} as any });
    jest.spyOn(authApi, 'getProfile').mockResolvedValue(profile);

    const result = await authService.signIn('test@email.com', 'password');
    expect(authApi.signIn).toHaveBeenCalledWith('test@email.com', 'password');
    expect(authApi.getProfile).toHaveBeenCalledWith('1');
    expect(result).toEqual({ profile, error: null });
  });

  it('signUp calls authApi.signUp and returns userId', async () => {
    const user = { id: '2' } as any;
    jest.spyOn(authApi, 'signUp').mockResolvedValue(user);

    const result = await authService.signUp(
      'test@email.com',
      'password',
      'testuser',
      'Test User',
    );
    expect(authApi.signUp).toHaveBeenCalledWith({
      email: 'test@email.com',
      password: 'password',
      display_name: 'Test User',
      username: 'testuser',
    });
    expect(result).toEqual({ userId: '2', error: null });
  });

  it('signOut calls authApi.signOut', async () => {
    jest.spyOn(authApi, 'signOut').mockResolvedValue();
    const result = await authService.signOut();
    expect(authApi.signOut).toHaveBeenCalled();
    expect(result).toEqual({ error: null });
  });

  it('restoreSession calls authApi.getSession, getCurrentUser, getProfile', async () => {
    const session = {} as any;
    const user = { id: '3' } as any;
    const profile: Profile = {
      id: '3',
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };

    jest.spyOn(authApi, 'getSession').mockResolvedValue(session);
    jest.spyOn(authApi, 'getCurrentUser').mockResolvedValue(user);
    jest.spyOn(authApi, 'getProfile').mockResolvedValue(profile);

    const result = await authService.restoreSession();
    expect(authApi.getSession).toHaveBeenCalled();
    expect(authApi.getCurrentUser).toHaveBeenCalled();
    expect(authApi.getProfile).toHaveBeenCalledWith('3');
    expect(result).toEqual(profile);
  });
});

describe('authService + authStore integration', () => {
  afterEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      loading: false,
      initialized: false,
    });
    jest.restoreAllMocks();
  });

  it('signIn updates store with active user', async () => {
    const profile: Profile = {
      id: '1',
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };

    jest
      .spyOn(authService, 'signIn')
      .mockResolvedValue({ profile, error: null });

    const result = await useAuthStore
      .getState()
      .signIn('test@email.com', 'password');
    expect(result).toEqual({ error: null });
    expect(useAuthStore.getState().user).toEqual(profile);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('signOut resets store user and isAuthenticated', async () => {
    useAuthStore.setState({
      user: { id: '1' } as Profile,
      isAuthenticated: true,
      loading: false,
      initialized: true,
    });

    jest.spyOn(authService, 'signOut').mockResolvedValue({ error: null });

    const result = await useAuthStore.getState().signOut();
    expect(result).toEqual({ error: null });
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('initializeAuth sets store with restored profile', async () => {
    const profile: Profile = {
      id: '1',
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@email.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    };

    jest.spyOn(authService, 'restoreSession').mockResolvedValue(profile);

    await useAuthStore.getState().initializeAuth();
    expect(useAuthStore.getState().user).toEqual(profile);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().initialized).toBe(true);
  });
});
