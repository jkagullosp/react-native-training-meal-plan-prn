import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DiscoverHeader from '@/components/DiscoverHeader';
import { useRecipesQuery, useFetchTagsQuery } from '@/hooks/useRecipesQuery';
import SearchAndFilter from '@/components/SearchAndFilter';
import RecipeCard from '@/components/RecipeCards';
import { FullRecipe } from '@/types/recipe';
import FilterModal from '@/components/FilterModal';
import { useRecipeSearchAndFilter } from '@/hooks/useRecipeSearchAndFilter';

type DiscoverScreenProps = {
  navigation: any;
  mode?: 'discover' | 'community';
};

export default function DiscoverScreen({
  navigation,
  mode = 'discover',
}: DiscoverScreenProps) {
  const { data: tags, refetch: refetchTags } = useFetchTagsQuery();
  const {
    data: recipes,
    isLoading: recipeLoading,
    error: recipeError,
    refetch: refecthRecipe,
  } = useRecipesQuery();
  const {
    search,
    setSearch,
    selectedTagIds,
    setSelectedTagIds,
    servings,
    setServings,
    cookTime,
    setCookTime,
    minRating,
    setMinRating,
    filteredRecipes,
    clearFilters,
  } = useRecipeSearchAndFilter(recipes ?? [], tags ?? []);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refecthRecipe();
    await refetchTags();
    setRefreshing(false);
  };

  const displayRecipes =
    mode === 'community'
      ? filteredRecipes.filter(r => r.is_community)
      : filteredRecipes.filter(r => !r.is_community);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <DiscoverHeader navigation={navigation} variant={mode} />
        </View>
        <View style={styles.headerContainerSearch}>
          <SearchAndFilter
            search={search}
            setSearch={setSearch}
            onOpenFilter={() => setFilterModalVisible(true)}
            variant={mode}
          />
        </View>
        {recipeError ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>
              {typeof recipeError === 'string'
                ? recipeError
                : recipeError.message || 'Failed to load recipes.'}
            </Text>
          </View>
        ) : recipeLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9f9f9fff" />
            <Text style={styles.emptyText}>Loading recipes...</Text>
          </View>
        ) : displayRecipes.length > 0 ? (
          <View style={styles.cardScrollView}>
            {displayRecipes.map((recipe: FullRecipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() =>
                  navigation.navigate('RecipeDetail', {
                    recipeId: recipe.id,
                    recipe,
                    mode,
                  })
                }
                variant={mode}
              />
            ))}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No recipes found.</Text>
          </View>
        )}

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          availableTags={tags ?? []}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
          servings={servings}
          setServings={setServings}
          cookTime={cookTime}
          setCookTime={setCookTime}
          minRating={minRating}
          setMinRating={setMinRating}
          onClear={clearFilters}
          variant={mode}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
  },
  headerContainerSearch: {
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    gap: 12,
    backgroundColor: '#F7F7F7',
  },
  cardScrollView: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#F7F7F7',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#E16235',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
