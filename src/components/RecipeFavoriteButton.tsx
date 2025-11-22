import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDiscoverStore } from '../modules/discover/store/useDiscoverStore';
import { Heart } from 'lucide-react-native';

export default function RecipeFavoriteButton({
  recipeId,
}: {
  recipeId: string;
}) {
  const { user, userFavorites, addFavorite, removeFavorite } =
    useDiscoverStore();
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
      await removeFavorite(user.id, recipeId);
    } else {
      setOptimisticFavorite(true);
      await addFavorite(user.id, recipeId);
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
