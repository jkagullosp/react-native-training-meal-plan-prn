import { create } from "zustand";
import { Profile } from "../../auth/types/authTypes";
import { supabase } from "../../utils/supabase";

type ProfileSettingsState = {
  user: Profile | null;
  loading: boolean;
  error: string | null;

  fetchProfile: (userId: string) => Promise<void>;
  updateProfileImage: (userId: string, imageUrl: string) => Promise<boolean>;
  updateDisplayName: (userId: string, displayName: string) => Promise<boolean>;
  updateUsername: (userId: string, username: string) => Promise<boolean>;
  updateBio: (userId: string, bio: string) => Promise<boolean>;
  changePassword: (email: string, newPassword: string) => Promise<boolean>;
};

export const useProfileStore = create<ProfileSettingsState>((set) => ({
  user: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) {
      set({ user: data as Profile, loading: false });
    } else {
      set({
        error: error?.message || "Failed to fetch profile",
        loading: false,
      });
    }
  },

  updateProfileImage: async (userId: string, imageUrl: string) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from("profiles")
      .update({ profile_image: imageUrl, updated_at: new Date().toISOString() })
      .eq("id", userId);
    set({ loading: false });
    if (error) set({ error: error.message });
    return !error;
  },

  updateDisplayName: async (userId: string, displayName: string) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    set({ loading: false });
    if (error) set({ error: error.message });
    return !error;
  },

  updateUsername: async (userId: string, username: string) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from("profiles")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("id", userId);
    set({ loading: false });
    if (error) set({ error: error.message });
    return !error;
  },

  updateBio: async (userId: string, bio: string) => {
    set({ loading: true, error: null });
    const { error } = await supabase
      .from("profiles")
      .update({ bio, updated_at: new Date().toISOString() })
      .eq("id", userId);
    set({ loading: false });
    if (error) set({ error: error.message });
    return !error;
  },

  changePassword: async (email: string, newPassword: string) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.updateUser({
      email,
      password: newPassword,
    });
    set({ loading: false });
    if (error) set({ error: error.message });
    return !error;
  },
}));
