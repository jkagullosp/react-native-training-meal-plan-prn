import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { useUserFavoriteIds, useFavoriteRecipes } from '@/hooks/useProfileQuery';

export default function MyFavoritesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { data: userFavorites = [], isLoading: loadingIds } = useUserFavoriteIds(user?.id ?? '');
  const { data: favoriteRecipes = [], isLoading: loadingRecipes } = useFavoriteRecipes(userFavorites);

  if (loadingIds || loadingRecipes) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!favoriteRecipes.length) {
    return (
      <View style={styles.centered}>
        <Text>No favorites yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      {favoriteRecipes.map(recipe => (
        <TouchableOpacity
          key={recipe.id}
          style={styles.recipeCard}
          onPress={() =>
            navigation.navigate('Discover', {
              screen: 'RecipeDetail',
              params: {
                recipeId: recipe.id,
                title: recipe.title,
              },
            })
          }
        >
          <Image
            source={
              recipe.images && recipe.images.length > 0
                ? { uri: recipe.images[0].image_url }
                : require('@assets/images/placeholder.png')
            }
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDesc} numberOfLines={2}>
              {recipe.description}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
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