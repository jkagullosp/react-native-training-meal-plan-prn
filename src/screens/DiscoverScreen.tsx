import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import DiscoverHeader from '@/components/DiscoverHeader';
import { useInfiniteRecipes, useFetchTagsQuery } from '@/hooks/useRecipesQuery';
import SearchAndFilter from '@/components/SearchAndFilter';
import RecipeCard from '@/components/RecipeCards';
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
  const PAGE_SIZE = 10;

  const { data: tags, refetch: refetchTags } = useFetchTagsQuery();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useInfiniteRecipes(PAGE_SIZE);

  const recipes = data?.pages.flat() ?? [];

  // Search + filter logic
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
  } = useRecipeSearchAndFilter(recipes, tags ?? []);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchTags();
    setRefreshing(false);
  };

  // Mode filter (discover vs community)
  const displayRecipes =
    mode === 'community'
      ? filteredRecipes.filter(r => r.is_community)
      : filteredRecipes.filter(r => !r.is_community);

  // Render header above list
  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <DiscoverHeader navigation={navigation} variant={mode} />
      <SearchAndFilter
        search={search}
        setSearch={setSearch}
        onOpenFilter={() => setFilterModalVisible(true)}
        variant={mode}
      />
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>
            {typeof error === 'string'
              ? error
              : error.message || 'Failed to load recipes.'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9f9f9fff" />
          <Text style={styles.emptyText}>Loading recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={displayRecipes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              navigation.navigate('RecipeDetail', {
                recipeId: item.id,
                recipe: item,
                mode,
              })
            }
            variant={mode}
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#9f9f9fff" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No recipes found.</Text>
          </View>
        }
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  headerWrapper: {
    paddingTop: 6,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    flexDirection: 'column',
    gap: 16,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },

  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
});
