import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
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

const PENDING_ITEM_HEIGHT = 220;

type PendingRecipe = {
  id: string;
  title: string;
  author_id?: string | null;
  created_at?: string | number;
  description?: string;
};

function PendingRecipeCard({
  recipe,
  onApprove,
  onDisapprove,
}: {
  recipe: PendingRecipe;
  onApprove: () => void;
  onDisapprove: () => void;
}) {
  return (
    <View style={styles.recipeCard}>
      <Text style={styles.recipeTitle}>{recipe.title}</Text>
      <Text style={styles.recipeMeta}>
        Submitted by: {recipe.author_id ?? 'Unknown'}
      </Text>
      <Text style={styles.recipeMeta}>
        Created:{' '}
        {recipe.created_at ? new Date(recipe.created_at).toLocaleString() : '-'}
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

const MemoPendingRecipeCard = React.memo(PendingRecipeCard);

export default function AdminContentScreen() {
  const {
    data: pendingRecipes,
    isLoading: pendingRecipesLoading,
    refetch: refetchPendingRecipes,
  } = usePendingRecipes();

  const approveMutation = useApproveRecipe();
  const disapproveMutation = useDisapproveRecipe();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPendingRecipes();
    setRefreshing(false);
  }, [refetchPendingRecipes]);

  const handleApprove = useCallback(
    (id: string) => {
      approveMutation.mutate(id, {
        onSuccess: () => {
          refetchPendingRecipes();
          Toast.show({ type: 'success', text1: 'Recipe approved!' });
        },
        onError: () => {
          Toast.show({ type: 'error', text1: 'Failed to approve recipe' });
        },
      });
    },
    [approveMutation, refetchPendingRecipes],
  );

  const handleDisapprove = useCallback(
    (id: string) => {
      disapproveMutation.mutate(id, {
        onSuccess: () => {
          refetchPendingRecipes();
          Toast.show({ type: 'success', text1: 'Recipe disapproved!' });
        },
        onError: () => {
          Toast.show({ type: 'error', text1: 'Failed to disapprove recipe' });
        },
      });
    },
    [disapproveMutation, refetchPendingRecipes],
  );

  const renderPending = useCallback(
    ({ item }: { item: PendingRecipe }) => (
      <MemoPendingRecipeCard
        recipe={item}
        onApprove={() => handleApprove(item.id)}
        onDisapprove={() => handleDisapprove(item.id)}
      />
    ),
    [handleApprove, handleDisapprove],
  );

  if (pendingRecipesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E16235" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList<PendingRecipe>
        data={(pendingRecipes ?? []).map(r => ({
          ...r,
          description: r.description ?? undefined,
        }))}
        renderItem={renderPending}
        keyExtractor={(p: PendingRecipe) => p.id}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={11}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => ({
          length: PENDING_ITEM_HEIGHT,
          offset: PENDING_ITEM_HEIGHT * index,
          index,
        })}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.noPendingText}>No pending recipes.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  noPendingText: {
    marginTop: 32,
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
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
