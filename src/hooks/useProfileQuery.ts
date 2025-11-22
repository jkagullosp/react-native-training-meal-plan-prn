import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => profileService.fetchUserProfile(userId),
    enabled: !!userId,
  });
}

export function useUserTotalLikes(userId: string) {
  return useQuery({
    queryKey: ['userTotalLikes', userId],
    queryFn: () => profileService.fetchUserTotalLikes(userId),
    enabled: !!userId,
  });
}
