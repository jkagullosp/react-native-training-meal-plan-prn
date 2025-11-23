import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import Stats from '../components/RecipeStats';
import Nutrition from '@/components/RecipeNutrition';
import Instructions from '@/components/RecipeInstructions';
import Author from '@/components/RecipeAuthor';
import Ingredients from '@/components/RecipeIngredients';
import AddMealModal from '../components/AddMealModal';
import Toast from 'react-native-toast-message';
import { FullRecipe } from '../types/recipe';
import {
  useRecipesQuery,
  useSubmitRecipeRating,
} from '../hooks/useRecipesQuery';
import { useAuthStore } from '@/stores/auth.store';
import { useAddMealPlan, useMealQuery } from '@/hooks/useMealQuery';
import { useQueryClient } from '@tanstack/react-query';
import { useAddMissingIngredientsMutation } from '@/hooks/useShopQuery';

export default function RecipeDetailScreen({ navigation, route }: any) {
  const queryClient = useQueryClient();
  const { loading, user } = useAuthStore();
  const { mutate: addMealPlanMutation } = useAddMealPlan();
  const { refetch: refetchMeal } = useMealQuery(user?.id ?? '');
  const addMissingIngredients = useAddMissingIngredientsMutation(
    user?.id ?? '',
  );

  const { refetch: refetchRecipes } = useRecipesQuery();
  const { mutate: submitRecipeRating, isPending: submitting } =
    useSubmitRecipeRating();

  const [addingMeal, setAddingMeal] = useState(false);

  const recipe: FullRecipe = route.params.recipe;
  const isAuthor = user?.id === recipe?.author_id;

  const [userRating, setUserRating] = useState(
    recipe?.ratings?.find(r => r.user_id === user?.id),
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState<number>(userRating?.rating || 0);
  const [currentImage, setCurrentImage] = useState(0);

  //const mode = route.params?.mode ?? 'discover';

  useEffect(() => {
    navigation.setOptions({
      title: recipe.title || 'Recipe Detail',
    });
  }, [navigation, recipe.title]);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    setCurrentImage(Math.round(offsetX / screenWidth));
  };

  const sortedImages =
    recipe.images?.length > 0
      ? [
          ...recipe.images.filter(img => img.is_primary),
          ...recipe.images
            .filter(img => !img.is_primary)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
        ]
      : [];

  const screenWidth = Dimensions.get('window').width;

  const handleSubmitRating = () => {
    if (!user?.id || !recipe?.id || rating < 1 || rating > 5) return;
    submitRecipeRating(
      { userId: user.id, recipeId: recipe.id, rating },
      {
        onSuccess: data => {
          refetchRecipes();
          setUserRating({
            user_id: user.id,
            rating,
            id: 'temp',
            recipe_id: recipe.id,
            created_at: new Date().toISOString(),
          });
          setRating(rating);

          Toast.show({
            type: 'success',
            text1: 'Thank you!',
            text2: `Your rating has been submitted. New average: ${data.avg.toFixed(
              1,
            )} (${data.count} ratings)`,
          });
        },
        onError: err => {
          console.error('Error handling rating:', err);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to submit rating.',
          });
        },
      },
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9f9f9fff" />
        <Text style={styles.emptyText}>Loading recipes...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.emptyText}>No recipes found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.emptyText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.pageContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 90 }}
      >
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ width: screenWidth, height: 200 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {sortedImages.length > 0 ? (
              sortedImages.map((img, idx) => (
                <Image
                  key={img.id || idx}
                  source={{ uri: img.image_url }}
                  style={[styles.image, { width: screenWidth, height: 200 }]}
                  resizeMode="cover"
                />
              ))
            ) : (
              <Image
                source={require('@assets/images/placeholder.png')}
                style={[styles.image, { width: screenWidth, height: 200 }]}
                resizeMode="cover"
              />
            )}
          </ScrollView>
          {sortedImages.length > 1 && (
            <View style={styles.sliderIndicatorContainer}>
              {sortedImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.sliderDot,
                    currentImage === idx && styles.sliderDotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
          <Stats route={route} />
          <View>
            <Text style={styles.nutrition}>Nutrition (Per serving)</Text>
          </View>
          <Nutrition route={route} />
          <View>
            <Text style={styles.ingredients}>Ingredients</Text>
          </View>
          <Ingredients route={route} />
          <View>
            <Text style={styles.nutrition}>Instructions</Text>
          </View>
          <Instructions route={route} />
          <Author route={route} />

          {!isAuthor && (
            <View style={styles.ratingSection}>
              <Text style={styles.nutrition}>Rate this Recipe!</Text>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    disabled={submitting || !!userRating}
                  >
                    <Text
                      style={{
                        fontSize: 32,
                        color: star <= rating ? '#E16235' : '#ccc',
                      }}
                    >
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {userRating ? (
                <Text style={{ color: '#888', marginTop: 4 }}>
                  You rated this recipe {userRating.rating} stars.
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={handleSubmitRating}
                  disabled={submitting || rating === 0}
                >
                  <Text style={styles.rateButtonText}>
                    {submitting ? 'Submitting...' : 'Submit Rating'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.bottomButtonText}>Add to Meal Plan</Text>
        </TouchableOpacity>
      </View>
      <AddMealModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={(date, mealType) => {
          if (user && recipe) {
            setAddingMeal(true); // Set loading state
            addMealPlanMutation(
              {
                userId: user.id,
                recipeId: recipe.id,
                mealDate: date,
                mealType: mealType,
              },
              {
                onSuccess: async () => {
                  try {
                    addMissingIngredients.mutate();
                    await refetchMeal();
                    await refetchRecipes();
                    queryClient.invalidateQueries({ queryKey: ['meals'] });
                    queryClient.invalidateQueries({ queryKey: ['recipes'] });
                    setModalVisible(false);
                    Toast.show({
                      type: 'success',
                      text1: 'Meal Plan Added',
                      text2: 'Check your meal plans for details',
                    });
                  } finally {
                    setAddingMeal(false);
                  }
                },
                onError: error => {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to add meal plan.',
                  });
                  console.error('Failed to add meal plan:', error);
                },
              },
            );
          }
        }}
      />
      {addingMeal && (
        <Modal
          transparent
          visible={addingMeal}
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.blurOverlay}>
            <ActivityIndicator size="small" />
            <Text style={styles.loadingText}>Adding meal to plan...</Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 16,
  },
  scrollView: {
    backgroundColor: '#F7F7F7',
    flex: 1,
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: 200,
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
  header: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  nutrition: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ingredients: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bottomButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  bottomButton: {
    backgroundColor: '#E16235',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  bottomButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ratingSection: {
    alignItems: 'center',
  },
  ratingStarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 8,
  },
  rateButton: {
    backgroundColor: '#E16235',
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  rateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  blurOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#E16235',
  },
  sliderIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  sliderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
    opacity: 0.7,
  },
  sliderDotActive: {
    backgroundColor: '#E16235',
    opacity: 1,
  },
});
