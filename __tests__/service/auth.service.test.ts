import { authService } from '@/services/authService';

jest.mock('@/api/authApi', () => ({
  authApi: {
    signIn: jest.fn(async (_email, _password) => ({
      user: { id: '123' },
      session: { user: { id: '123' } },
    })),
    signUp: jest.fn(async ({ email, _password, display_name, username }) => ({
      id: '456',
      email,
      display_name,
      username,
    })),
    signOut: jest.fn(async () => {}),
    getSession: jest.fn(async () => ({ user: { id: '123' } })),
    getCurrentUser: jest.fn(async () => ({ id: '123' })),
    getProfile: jest.fn(async id => ({
      id,
      display_name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      profile_image: null,
      bio: null,
      created_at: '',
      updated_at: '',
      is_admin: false,
      status: 'active',
      suspended_until: '',
    })),
  },
}));

describe('authService', () => {
  it('validates email', () => {
    expect(authService.isValidEmail('test@example.com')).toBe(true);
    expect(authService.isValidEmail('bademail')).toBe(false);
  });

  it('validates password', () => {
    expect(authService.isValidPassword('123456')).toBe(true);
    expect(authService.isValidPassword('123')).toBe(false);
  });

  it('validates username', () => {
    expect(authService.isValidUsername('user_1')).toBe(true);
    expect(authService.isValidUsername('u')).toBe(false);
    expect(authService.isValidUsername('bad name')).toBe(false);
  });

  it('signs in successfully', async () => {
    const result = await authService.signIn('test@example.com', 'password');
    if ('profile' in result && result.profile) {
      expect(result.error).toBeNull();
      expect(result.profile.username).toBe('testuser');
    }
  });

  it('returns error for invalid email on signIn', async () => {
    const result = await authService.signIn('bademail', 'password');
    expect(result.error).toBe('Please enter valid email address');
  });

  it('returns error for invalid password on signIn', async () => {
    const result = await authService.signIn('test@example.com', '123');
    expect(result.error).toBe('Please enter a valid password');
  });

  it('returns error if profile not found on signIn', async () => {
    // Mock getProfile to return null
    const { authApi } = require('@/api/authApi');
    authApi.getProfile.mockResolvedValueOnce(null);
    const result = await authService.signIn('test@example.com', 'password');
    expect(result.error).toBe('Profile not found');
  });

  it('signs up successfully', async () => {
    const result = await authService.signUp(
      'new@example.com',
      'password123',
      'newuser',
      'New User',
    );
    expect(result.error).toBeNull();
    if ('userId' in result) {
      expect(result.userId).toBe('456');
    }
  });

  it('returns error for invalid email on signUp', async () => {
    const result = await authService.signUp(
      'bademail',
      'password123',
      'newuser',
      'New User',
    );
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('returns error for invalid password on signUp', async () => {
    const result = await authService.signUp(
      'new@example.com',
      '123',
      'newuser',
      'New User',
    );
    expect(result.error).toBe('Please enter a valid password');
  });

  it('returns error for missing display name on signUp', async () => {
    const result = await authService.signUp(
      'new@example.com',
      'password123',
      'newuser',
      '',
    );
    expect(result.error).toBe('Display name is required');
  });

  it('returns error for invalid username on signUp', async () => {
    const result = await authService.signUp(
      'new@example.com',
      'password123',
      'bad name',
      'New User',
    );
    expect(result.error).toBe('Please enter a valid username');
  });

  it('signs out successfully', async () => {
    const result = await authService.signOut();
    expect(result.error).toBeNull();
  });

  it('restores session successfully', async () => {
    const profile = await authService.restoreSession();
    expect(profile).not.toBeNull();
    if (profile) {
      expect(profile.username).toBe('testuser');
    }
  });

  it('returns null if session missing on restoreSession', async () => {
    const { authApi } = require('@/api/authApi');
    authApi.getSession.mockResolvedValueOnce(null);
    const profile = await authService.restoreSession();
    expect(profile).toBeNull();
  });

  it('returns null if user missing on restoreSession', async () => {
    const { authApi } = require('@/api/authApi');
    authApi.getCurrentUser.mockResolvedValueOnce(null);
    const profile = await authService.restoreSession();
    expect(profile).toBeNull();
  });

  it('returns null if profile missing on restoreSession', async () => {
    const { authApi } = require('@/api/authApi');
    authApi.getProfile.mockResolvedValueOnce(null);
    const profile = await authService.restoreSession();
    expect(profile).toBeNull();
  });

  it('returns error if authApi.signIn throws', async () => {
    const { authApi } = require('@/api/authApi');
    authApi.signIn.mockImplementationOnce(() => {
      throw new Error('API error');
    });
    const result = await authService.signIn('test@example.com', 'password');
    expect(result.error).toBe('API error');
  });
});
