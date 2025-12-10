import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useApprovedUserRecipes } from '@/hooks/useRecipesQuery';
import { FullRecipe } from '@/types/recipe';

const RECIPE_ROW_HEIGHT = 100; // keep in sync with styles.recipeCard height

type Props = { navigation: any };

function RecipeListItem({
  recipe,
  onPress,
}: {
  recipe: FullRecipe;
  onPress: () => void;
}) {
  // warm platform image cache (best-effort)
  const uri =
    recipe.images && recipe.images.length > 0
      ? recipe.images[0].image_url
      : null;
  React.useEffect(() => {
    let mounted = true;
    if (uri) {
      Image.prefetch(uri)
        .catch(() => {
          /* ignore */
        })
        .finally(() => {
          // no-op; we don't set state here to avoid re-render
          if (!mounted) return;
        });
    }
    return () => {
      mounted = false;
    };
  }, [uri]);

  return (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image
        source={
          uri
            ? ({ uri, cache: 'force-cache' } as any)
            : require('@assets/images/placeholder.png')
        }
        style={styles.recipeImage}
        resizeMode="cover"
      />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={1}>
          {recipe.title}
        </Text>
        <Text style={styles.recipeDesc} numberOfLines={2}>
          {recipe.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const MemoRecipeListItem = React.memo(RecipeListItem);

export default function MyRecipesScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const {
    data: userRecipes,
    isLoading: recipesLoading,
    refetch: refetchUserRecipes,
  } = useApprovedUserRecipes(user?.id ?? '');

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      refetchUserRecipes();
    }
  }, [user, refetchUserRecipes]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchUserRecipes();
    } finally {
      setRefreshing(false);
    }
  }, [refetchUserRecipes]);

  const renderItem = useCallback(
    ({ item }: { item: FullRecipe }) => (
      <MemoRecipeListItem
        recipe={item}
        onPress={() =>
          navigation.navigate('Discover', {
            screen: 'RecipeDetail',
            params: { recipeId: item.id, recipe: item },
          })
        }
      />
    ),
    [navigation],
  );

  const keyExtractor = useCallback((r: FullRecipe) => r.id, []);

  // stable list data reference
  const data = useMemo(() => userRecipes, [userRecipes]);

  if (recipesLoading && !userRecipes) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userRecipes || userRecipes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No recipes yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.scrollView}
      // pull to refresh
      refreshing={refreshing}
      onRefresh={onRefresh}
      // performance tuning
      removeClippedSubviews={true}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={11}
      updateCellsBatchingPeriod={50}
      // optimize layout if item height is fixed
      getItemLayout={(_, index) => ({
        length: RECIPE_ROW_HEIGHT,
        offset: RECIPE_ROW_HEIGHT * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    height: RECIPE_ROW_HEIGHT,
  },
  recipeImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  recipeInfo: {
    flex: 1,
    flexDirection: 'column',
  },
  recipeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  recipeDesc: {
    fontSize: 13,
    color: '#888',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
});
