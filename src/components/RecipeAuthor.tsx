import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Star, BadgeCheck } from 'lucide-react-native';
import { useAuthorQuery } from '@/hooks/useRecipesQuery';
import { FullRecipe } from '@/types/recipe';

type Props =
  | { route: { params: { recipe: FullRecipe } } }
  | { recipe: FullRecipe };

/**
 * RecipeAuthor
 * Renders the recipe author avatar, display name and rating summary.
 *
 * Accepts either a `route` with params.recipe (for screen usage) or a direct `recipe` prop.
 */
function RecipeAuthor(props: Props) {
  const recipe: FullRecipe =
    'route' in props ? props.route.params.recipe : (props as any).recipe;

  const {
    data: authorProfile,
    isLoading,
    error,
  } = useAuthorQuery(recipe?.author_id);

  const ratings = useMemo(() => recipe?.ratings ?? [], [recipe?.ratings]);
  const ratingCount = ratings.length;
  const avgRating = useMemo(
    () =>
      ratingCount > 0
        ? ratings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingCount
        : 0,
    [ratings, ratingCount],
  );

  const getInitials = useCallback((name?: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  }, []);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Author not available.</Text>
      </View>
    );
  }

  // Kernel / fallback when no author_id
  if (!recipe.author_id) {
    return (
      <View style={styles.container}>
        <Image
          source={require('@assets/logos/logoIcon.png')}
          style={styles.image}
        />
        <View style={styles.reviewsContainer}>
          <View style={styles.kernelRow}>
            <Text style={styles.authorText}>
              Recipe by <Text style={styles.kernelText}>Kernel</Text>
            </Text>
            <BadgeCheck size={14} color="#1877F2" />
          </View>
          <View style={styles.ratingRow}>
            <Star size={16} color={'#e3c100ff'} />
            <Text style={styles.averageRating}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({ratingCount} ratings)</Text>
          </View>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading author...</Text>
      </View>
    );
  }

  if (error || !authorProfile) {
    return (
      <View style={styles.container}>
        <Text>Author not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {authorProfile?.profile_image ? (
        <Image
          source={{ uri: authorProfile.profile_image }}
          style={styles.image}
        />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(authorProfile?.display_name ?? 'U')}
          </Text>
        </View>
      )}
      <View style={styles.reviewsContainer}>
        <View>
          <Text style={styles.authorText}>
            Recipe by {authorProfile?.display_name ?? 'Unknown'}
          </Text>
        </View>
        <View style={styles.ratingRow}>
          <Star size={16} color={'#e3c100ff'} />
          <Text style={styles.averageRating}>{avgRating.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>({ratingCount} ratings)</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Small Avatar subcomponent (exposed for compound usage)
 */
function AuthorAvatar({
  profileImage,
  displayName,
}: {
  profileImage?: string;
  displayName?: string;
}) {
  if (profileImage) {
    return <Image source={{ uri: profileImage }} style={styles.image} />;
  }
  return (
    <View style={styles.initialsAvatar}>
      <Text style={styles.initialsText}>
        {(displayName || 'U').slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );
}

const MemoizedRecipeAuthor = React.memo(RecipeAuthor) as typeof RecipeAuthor & {
  Avatar?: typeof AuthorAvatar;
};

MemoizedRecipeAuthor.Avatar = AuthorAvatar;

export default MemoizedRecipeAuthor;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    padding: 12,
    borderRadius: 16,
    gap: 16,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E16235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  reviewsContainer: {
    flexDirection: 'column',
    gap: 4,
  },
  starIcon: {
    color: '#e3c100ff',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  averageRating: {
    color: '#e3c100ff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  ratingCount: {
    color: '#5f5f5fff',
    fontWeight: '400',
    marginLeft: 6,
  },
  authorText: {
    fontWeight: '600',
  },
  kernelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  kernelText: {
    color: '#E16235',
    fontWeight: 'bold',
  },
});
