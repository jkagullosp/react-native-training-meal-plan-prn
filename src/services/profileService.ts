import { profileApi } from '@/api/profileApi';

export const profileService = {
  fetchUserProfile: (userId: string) => profileApi.fetchUserProfile(userId),
  fetchUserTotalLikes: (userId: string) =>
    profileApi.fetchUserTotalLikes(userId),
};
