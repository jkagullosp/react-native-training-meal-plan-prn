import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  usePendingRecipes,
  useApproveRecipe,
  useDisapproveRecipe,
} from '@/hooks/useAdminQuery';

function PendingRecipeCard({ recipe, onApprove, onDisapprove }: any) {
  return (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.recipeMeta}>
        Submitted by: {recipe.author_id ?? 'Unknown'}
      </Text>
      <Text style={styles.recipeMeta}>
        Created: {new Date(recipe.created_at).toLocaleString()}
      </Text>
      <Text style={styles.recipeDesc}>{recipe.description}</Text>
      <View style={styles.recipeActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: '#e0f7e9',
              borderColor: '#388e3c',
              borderWidth: 1,
            },
          ]}
          onPress={onApprove}
        >
          <Text style={[styles.actionText, { color: '#388e3c' }]}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: '#ffeaea',
              borderColor: '#d32f2f',
              borderWidth: 1,
            },
          ]}
          onPress={onDisapprove}
        >
          <Text style={[styles.actionText, { color: '#d32f2f' }]}>
            Disapprove
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminContentScreen() {
  const {
    data: pendingRecipes,
    isLoading: pendingRecipesLoading,
    refetch: refetchPendingRecipes,
  } = usePendingRecipes();

  const { mutate: approveRecipe } = useApproveRecipe();
  const { mutate: disapproveRecipe } = useDisapproveRecipe();

  const [refreshing, setRefreshing] = useState(false);

  const pendingRecipeCount = pendingRecipes?.length ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPendingRecipes();
    setRefreshing(false);
  };

  if (pendingRecipesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E16235" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Recipe Approvals</Text>
          <View style={styles.countBadge}>
            <Text style={styles.titleCount}>{pendingRecipeCount}</Text>
          </View>
        </View>
        <View style={styles.cardsContainer}>
          {pendingRecipes?.length === 0 ? (
            <Text style={styles.noPendingText}>No pending recipes.</Text>
          ) : (
            pendingRecipes?.map(recipe => (
              <PendingRecipeCard
                key={recipe.id}
                recipe={recipe}
                onApprove={() =>
                  approveRecipe(recipe.id, {
                    onSuccess: () => {
                      Toast.show({
                        type: 'success',
                        text1: 'Recipe approved!',
                      });
                    },
                    onError: () => {
                      Toast.show({
                        type: 'error',
                        text1: 'Failed to approve recipe',
                      });
                    },
                  })
                }
                onDisapprove={() =>
                  disapproveRecipe(recipe.id, {
                    onSuccess: () => {
                      Toast.show({
                        type: 'success',
                        text1: 'Recipe disapproved!',
                      });
                    },
                    onError: () => {
                      Toast.show({
                        type: 'error',
                        text1: 'Failed to disapprove recipe',
                      });
                    },
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 0,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    margin: 16,
    marginBottom: 0,
    paddingVertical: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
  },
  countBadge: {
    backgroundColor: '#e16235',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  noPendingText: {
    marginTop: 32,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E16235',
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 13,
    color: '#888',
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: 14,
    color: '#444',
    marginTop: 8,
    marginBottom: 8,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionBtn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});
