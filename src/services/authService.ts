import { authApi } from '../api/authApi';
import { Profile } from '../types/auth';

interface SignInResult {
  profile: Profile;
  error: null;
}

interface SignUpResult {
  userId: string;
  error: null;
}

interface ErrorResult {
  error: string;
}

class AuthService {
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  isValidUsername(username: string): boolean {
    return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<SignInResult | ErrorResult> {
    try {
      if (!this.isValidEmail(email)) {
        return { error: 'Please enter valid email address' };
      }
      if (!this.isValidPassword(password)) {
        return { error: 'Please enter a valid password' };
      }

      const { user } = await authApi.signIn(email, password);

      const profile = await authApi.getProfile(user.id);
      if (!profile) {
        return { error: 'Profile not found' };
      }

      return { profile, error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async signUp(
    email: string,
    password: string,
    username: string,
    display_name: string,
  ): Promise<SignUpResult | ErrorResult> {
    try {
      if (!this.isValidEmail(email)) {
        return { error: 'Please enter a valid email address' };
      }
      if (!this.isValidPassword(password)) {
        return { error: 'Please enter a valid password' };
      }
      if (!display_name.trim()) {
        return { error: 'Display name is required' };
      }
      if (!this.isValidUsername(username)) {
        return { error: 'Please enter a valid username' };
      }

      const user = await authApi.signUp({
        email,
        password,
        display_name,
        username,
      });

      return { userId: user.id, error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign up failed',
      };
    }
  }

  async signOut(): Promise<ErrorResult | { error: null }> {
    try {
      await authApi.signOut();
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Sign out failed',
      };
    }
  }

  async restoreSession(): Promise<Profile | null> {
    try {
      const session = await authApi.getSession();
      if (!session) return null;

      const user = await authApi.getCurrentUser();
      if (!user) return null;

      const profile = await authApi.getProfile(user.id);
      return profile;
    } catch (error) {
      console.error('Failed to restore session:', error);
      return null;
    }
  }
}

export const authService = new AuthService();