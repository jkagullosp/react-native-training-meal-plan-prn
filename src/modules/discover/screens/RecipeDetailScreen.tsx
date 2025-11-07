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
import { useDiscoverStore } from '../store/useDiscoverStore';
import Stats from '../components/Stats';
import Nutrition from '../components/Nutrition';
import Instructions from '../components/Instructions';
import Author from '../components/Author';
import AddMealModal from '../../meal-plan/components/AddMealModal';
import { useMealPlanStore } from '../../meal-plan/store/useMealPlanStore';
import { useShoppingListStore } from '../../shopping-list/store/useShoppingListStore';
import { supabase } from '../../../client/supabase';
import Toast from 'react-native-toast-message';
import { FullRecipe } from '../types/recipeTypes';

export default function RecipeDetailScreen({ navigation, route }: any) {
  const { loading, user, fetchRecipes } = useDiscoverStore();
  const [modalVisible, setModalVisible] = useState(false);
  const { addMealPlan } = useMealPlanStore();
  const { addMissingIngredients } = useShoppingListStore();
  const { fetchMealPlans } = useMealPlanStore();

  const recipe: FullRecipe = route.params.recipe;

  const isAuthor = user?.id === recipe?.author_id;

  const userRating = recipe?.ratings?.find(r => r.user_id === user?.id);
  const [rating, setRating] = useState<number>(userRating?.rating || 0);
  const [submitting, setSubmitting] = useState(false);

  const [addingMeal, setAddingMeal] = useState(false);

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    navigation.setOptions({
      title: recipe.title || 'Recipe Detail',
    });
  }, [navigation, recipe.title]);

  useEffect(() => {
    const loadRecipe = async () => {
      await fetchRecipes();
    };
    loadRecipe();
  }, [fetchRecipes]);

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

  const handleSubmitRating = async () => {
    if (!user?.id || !recipe?.id || rating < 1 || rating > 5) return;
    setSubmitting(true);

    try {
      const { error: upsertError } = await supabase
        .from('recipe_ratings')
        .upsert([
          {
            user_id: user.id,
            recipe_id: recipe.id,
            rating,
          },
        ]);

      if (upsertError) throw upsertError;

      const { data: ratings, error: ratingsError } = await supabase
        .from('recipe_ratings')
        .select('rating')
        .eq('recipe_id', recipe.id);

      if (ratingsError) throw ratingsError;

      const count = ratings.length;
      const avg =
        count > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / count : 0;

      const { error: updateError } = await supabase
        .from('recipes')
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          rating_count: count,
        })
        .eq('id', recipe.id);

      if (updateError) throw updateError;

      await fetchRecipes();
    } catch (err) {
      console.error('Error handling rating:', err);
    } finally {
      setSubmitting(false);
    }
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
                source={require('../../../../assets/images/onboardImage1.jpg')}
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
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, idx) => (
                <View
                  key={ingredient.id || idx}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#E16235',
                      marginRight: 8,
                    }}
                  >
                    •
                  </Text>
                  <Text style={{ fontSize: 16, color: '#222' }}>
                    {ingredient.name}
                    {ingredient.quantity_value
                      ? ` (${ingredient.quantity_value}${
                          ingredient.unit ? ` ${ingredient.unit}` : ''
                        })`
                      : ''}
                  </Text>
                </View>
              ))
            ) : (
              <Text
                style={{
                  color: '#888',
                  fontSize: 15,
                  marginTop: 8,
                }}
              >
                No ingredients listed.
              </Text>
            )}
          </View>
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
        onAdd={async (date, mealType) => {
          setAddingMeal(true);
          if (user && recipe) {
            await addMealPlan(user.id, recipe.id, date, mealType);
            await addMissingIngredients(user.id);
            await fetchMealPlans(user.id);
            await fetchRecipes();
          }
          setAddingMeal(false);
          setModalVisible(false);
          Toast.show({
            type: 'success',
            text1: 'Meal Plan Added',
            text2: 'Check your meal plans for details',
          });
        }}
      />
      {addingMeal && (
        <Modal transparent visible>
          <View style={styles.blurOverlay}>
            <ActivityIndicator size="small" color="#E16235" />
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
