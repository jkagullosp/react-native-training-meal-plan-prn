import { Profile } from '../types/auth';
import { Session, User } from '@supabase/supabase-js';
import { handleApiError } from '../api/apiHelpers';
import { supabase } from '../client/supabase';

interface SignUpData {
  email: string;
  password: string;
  display_name: string;
  username: string;
}

class AuthApi {
  async signIn(
    email: string,
    password: string,
  ): Promise<{ user: User; session: Session }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error || !data.user || !data.session) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      throw handleApiError(error, 'Sign in failed');
    }
  }

  async signUp(signUpData: SignUpData): Promise<User> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            display_name: signUpData.display_name,
            username: signUpData.username,
          },
        },
      });
      if (error || !data.user) throw error;
      return data.user;
    } catch (error) {
      throw handleApiError(error, 'Sign up failed.');
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw handleApiError(error, 'Sign out failed.');
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      throw handleApiError(error, 'Failed to get session');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      console.log('current user: ', data.user);
      return data.user;
    } catch (error) {
      throw handleApiError(error, 'Failed to get user');
    }
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    } catch (error) {
      throw handleApiError(error, 'Failed to get user profile');
    }
  }
}

export const authApi = new AuthApi();
