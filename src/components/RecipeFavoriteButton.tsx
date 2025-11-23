import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Heart } from 'lucide-react-native';
import { useAuthStore } from '@/stores/auth.store';
import {
  useUserFavoriteIds,
  useAddFavorite,
  useRemoveFavorite,
} from '@/hooks/useProfileQuery';
import Toast from 'react-native-toast-message';

export default function RecipeFavoriteButton({
  recipeId,
  recipeTitle,
}: {
  recipeId: string;
  recipeTitle?: string;
}) {
  const { user } = useAuthStore();
  const { data: userFavorites = [] } = useUserFavoriteIds(user?.id ?? '');
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();
  const [optimisticFavorite, setOptimisticFavorite] = useState<boolean | null>(
    null,
  );

  const isFavorite = userFavorites.includes(recipeId);

  useEffect(() => {
    setOptimisticFavorite(null);
  }, [userFavorites, recipeId]);

  const handleToggleFavorite = async () => {
    if (!user?.id) return;
    if (isFavorite || optimisticFavorite === true) {
      setOptimisticFavorite(false);
      await removeFavorite.mutateAsync({ userId: user.id, recipeId });
    } else {
      setOptimisticFavorite(true);
      await addFavorite.mutateAsync({ userId: user.id, recipeId });
      Toast.show({
        type: 'success',
        text1: `${recipeTitle || 'Recipe'} was added to favorites!`,
      });
    }
  };

  return Platform.OS === 'ios' ? (
    <TouchableOpacity
      onPress={handleToggleFavorite}
      style={{ marginRight: 16 }}
    >
      <Icon
        name={optimisticFavorite ?? isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color="#E16235"
      />
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      onPress={handleToggleFavorite}
      style={{ marginRight: 16 }}
      activeOpacity={0.7}
    >
      <Heart
        size={24}
        color="#E16235"
        fill={optimisticFavorite ?? isFavorite ? '#E16235' : 'none'}
      />
    </TouchableOpacity>
  );
}
