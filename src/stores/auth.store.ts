import { create } from 'zustand';
import { authService } from '../services/authService';
import { Profile } from '../types/auth';

type AuthState = {
  user: Profile | null;
  isAuthenticated: boolean;
  loading: boolean;
  initialized: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    username: string,
    display_name: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,

  signIn: async (email, password) => {
    set({ loading: true });

    const result = await authService.signIn(email, password);

    if ('profile' in result) {
      if (result.profile.status === 'active') {
        set({
          user: result.profile,
          isAuthenticated: true,
          loading: false,
        });
        return { error: null };
      } else {
        set({ loading: false });
        return { error: result.profile.status };
      }
    }

    set({ loading: false });
    return { error: result.error };
  },

  signUp: async (email, password, username, display_name) => {
    set({ loading: true });

    const result = await authService.signUp(
      email,
      password,
      display_name,
      username,
    );

    set({ loading: false });

    if ('userId' in result) {
      return { error: null };
    }

    return { error: result.error };
  },

  signOut: async () => {
    set({ loading: true });

    const result = await authService.signOut();

    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    return result;
  },

  initializeAuth: async () => {
    set({ loading: true });

    const profile = await authService.restoreSession();

    set({
      user: profile,
      isAuthenticated: !!profile,
      loading: false,
      initialized: true,
    });
  },
}));
