import { create } from 'zustand';
import { supabase } from '../../../client/supabase';
import { Profile } from '../../../types/auth';

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
    password: string,
    display_name: string,
    username: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  fetchProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: string | null }>;
  resetPassword: (newPassword: string) => Promise<{ error: string | null }>;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profileError && profile) {
        set({ user: profile, isAuthenticated: true, loading: false });
        return { error: null };
      }
      set({ user: null, isAuthenticated: false, loading: false });
      return { error: profileError?.message || 'Profile not found' };
    }
    set({ user: null, isAuthenticated: false, loading: false });
    return { error: error?.message || 'Sign In Failed' };
  },

  signUp: async (
    email: string,
    password: string,
    display_name: string,
    username: string,
  ) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name,
          username,
        },
      },
    });
    set({ loading: false });

    if (!error && data.user) {
      console.log(`User ${data.user.id}, ${username} signed up successfully`);
      return { error: null };
    }

    return { error: error?.message || 'Sign Up Failed' };
  },

  signOut: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, loading: false });
    return { error: error?.message || null };
  },

  fetchProfile: async () => {
    set({ loading: true });

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.log('No Supabase session found');
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      });
      return;
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      console.log('No authenticated user found');
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .maybeSingle();

    if (!profileError && profile) {
      set({
        user: profile,
        isAuthenticated: true,
        loading: false,
        initialized: true,
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        initialized: true,
      });
    }
  },
  forgotPassword: async (email: string) => {
    set({ loading: true });

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'kernel://reset-password',
    });

    set({ loading: false });

    if (!error && data) {
      console.log(`Password reset email sent to ${email}`);
      return { error: null };
    }

    return { error: error?.message || 'Password reset failed' };
  },

  resetPassword: async (newPassword: string) => {
    set({ loading: true });

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    set({ loading: false });

    if (error) {
      return { error: error?.message || 'Password reset failed' };
    }

    return { error: null };
  },
}));
