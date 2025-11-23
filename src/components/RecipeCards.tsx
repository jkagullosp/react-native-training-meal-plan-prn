import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { format } from 'date-fns';
import { FullRecipe, RecipeTag, RecipeLike } from '@/types/recipe';
import { Timer, Users, Star, Heart } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAuthor,
  useRecipeLikes,
  useLikeRecipe,
  useUnlikeRecipe,
} from '@/hooks/useCommunityQuery';

type RecipeCardProps = {
  recipe: FullRecipe;
  onPress: () => void;
  variant?: 'discover' | 'community';
};

const getPrimaryImage = (recipe: FullRecipe) => {
  const images = recipe.images;
  const primary = images?.find(img => img.is_primary) || images?.[0];
  return primary?.image_url;
};

export default function RecipeCard({
  recipe,
  onPress,
  variant = 'discover',
}: RecipeCardProps) {
  const { user } = useAuthStore();
  const authorId = recipe.author_id;
  const [imageLoading, setImageLoading] = useState(true);

  const { data: author } = useAuthor(
    variant === 'community' ? authorId : undefined,
  );
  const { data: recipeLikes = [] } = useRecipeLikes(
    variant === 'community' ? recipe.id : undefined,
  );

  const likeMutation = useLikeRecipe(recipe.id, user?.id ?? '');
  const unlikeMutation = useUnlikeRecipe(recipe.id, user?.id ?? '');

  const isLiked =
    variant === 'community'
      ? recipeLikes.some(
          (like: RecipeLike) =>
            like.user_id === user?.id && like.recipe_id === recipe.id,
        )
      : false;

  const likeCount =
    variant === 'community'
      ? recipeLikes.filter((like: RecipeLike) => like.recipe_id === recipe.id)
          .length
      : 0;

  function getDifficultyColor(difficulty?: string | null) {
    if (difficulty === 'easy') return '#4CAF50';
    if (difficulty === 'medium') return '#d88262ff';
    if (difficulty === 'hard') return '#f9622bff';
    return '#888';
  }

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      : '';
  };

  const imageSource = getPrimaryImage(recipe)
    ? { uri: getPrimaryImage(recipe) }
    : require('@assets/images/placeholder.png');

  const ratings = recipe.ratings || [];
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  return (
    <TouchableOpacity
      style={[
        styles.recipeCard,
        variant === 'community' && styles.communityCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative', width: '100%', height: 160 }}>
        <Image
          source={imageSource}
          style={styles.recipeImage}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color="#9f9f9fff" />
          </View>
        )}
      </View>
      <View style={styles.recipeDetails}>
        {variant === 'community' && (
          <View style={styles.authorRow}>
            <View>
              {author?.profile_image ? (
                <Image
                  source={{ uri: author?.profile_image }}
                  style={styles.image}
                />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>
                    {getInitials(author?.display_name || 'U')}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text style={styles.authorText}>{author?.display_name}</Text>
              <Text style={styles.createdAt}>
                {recipe.created_at
                  ? format(new Date(recipe.created_at), 'MM-dd-yyyy')
                  : ''}
              </Text>
            </View>
          </View>
        )}
        <View style={styles.recipeTitle}>
          <Text
            style={[
              styles.recipeTitleText,
              variant === 'community' && styles.communityTitleText,
            ]}
          >
            {recipe.title}
          </Text>
        </View>
        <Text
          style={styles.recipeSubtitleText}
          numberOfLines={variant === 'community' ? 2 : 3}
          ellipsizeMode="tail"
        >
          {recipe.description}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.timeAndServingsRow}>
            <View style={styles.timeRow}>
              <Timer size={14} color={'#777777'} />
              <Text style={styles.text}>{recipe.total_time}mins</Text>
            </View>
            <View style={styles.servingsRow}>
              <Users size={14} color={'#777777'} />
              <Text style={styles.text}>
                {recipe.servings}
                {variant === 'community' ? ' servings' : ''}
              </Text>
            </View>
          </View>
          {variant === 'community' ? (
            <View style={styles.ratingRow}>
              <Text
                style={[
                  styles.value,
                  { color: getDifficultyColor(recipe.difficulty) },
                ]}
              >
                {recipe.difficulty ?? '-'}
              </Text>
            </View>
          ) : (
            <View style={styles.ratingRow}>
              <Star size={14} color={'#FFD700'} />
              <Text style={styles.text}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.text}>({ratingCount})</Text>
            </View>
          )}
        </View>
        <View style={styles.tagsRow}>
          {recipe.tags && recipe.tags.length > 0 ? (
            recipe.tags.map((recipeTag: RecipeTag, index: number) => (
              <View style={styles.tagsView} key={index}>
                <Text style={styles.tagText}>
                  {recipeTag.tag?.name}
                  {index < recipe.tags.length - 1 ? '' : ''}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tagsView}>
              <Text style={styles.tagText}>no tags</Text>
            </View>
          )}
        </View>
        {variant === 'community' && (
          <View style={styles.likesRow}>
            <TouchableOpacity
              onPress={() => {
                if (!user?.id) return;
                if (isLiked) {
                  unlikeMutation.mutate();
                } else {
                  likeMutation.mutate();
                }
              }}
            >
              {Platform.OS === 'ios' ? (
                <Icon
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={18}
                  style={[styles.icon, isLiked && { color: '#E16235' }]}
                  color={isLiked ? '#E16235' : '#777777'}
                />
              ) : (
                <Heart
                  size={18}
                  color={'#e16235'}
                  fill={isLiked ? '#E16235' : 'none'}
                />
              )}
            </TouchableOpacity>
            <Text
              style={[
                styles.likes,
                isLiked && { color: '#E16235', fontWeight: 'bold' },
              ]}
            >
              {likeCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  communityCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  recipeTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  communityTitleText: {
    color: '#000',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  recipeDetails: {
    padding: 14,
    flexDirection: 'column',
    gap: 10,
  },
  recipeTitle: {
    flexDirection: 'row',
  },
  recipeSubtitleText: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeAndServingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    color: '#777777',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    color: '#777777',
  },
  text: {
    color: '#777777',
    fontSize: 12,
  },
  starIcon: {
    color: '#FFD700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#777777',
    padding: 0,
    borderRadius: 8,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    opacity: 0.7,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tagsView: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#eeeeeeff',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#E16235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createdAt: {
    color: '#777777',
    fontSize: 12,
  },
  authorText: {
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    fontWeight: 'normal',
    padding: 4,
    backgroundColor: '#f1f1f1ff',
    borderRadius: 8,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likes: {
    color: '#777777',
  },
});
