import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import { SUPABASE_URL, SUPABASE_KEY } from '@env';
import { keychainAdapter } from '@/utils/keychainAdapter';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: keychainAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const checkConnection = async () => {
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.log('Supabase connection error: ', error.message);
      return false;
    } else {
      console.log('Supabase connected successfully');
      return true;
    }
  } catch (error) {
    console.log('Supabase connection exception: ', error);
    return false;
  }
};
