import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useDiscoverStore } from '../../discover/store/useDiscoverStore';
import Stats from '../../../components/RecipeStats';
import Nutrition from '@/components/RecipeNutrition';
import Ingredients from '@/components/RecipeIngredients';
import Instructions from '@/components/RecipeInstructions';
import Author from '@/components/RecipeAuthor';
import AddMealModal from '../../../components/AddMealModal';
import { useMealPlanStore } from '../../meal-plan/store/useMealPlanStore';
import { useShoppingListStore } from '../../shopping-list/store/useShoppingListStore';
import Toast from 'react-native-toast-message';

export default function CommunityRecipeDetailScreen({
  navigation,
  route,
}: any) {
  const { recipeId } = route.params;
  const { recipes, loading, user, fetchRecipes } = useDiscoverStore();
  const [modalVisible, setModalVisible] = useState(false);
  const { addMealPlan } = useMealPlanStore();
  const { addMissingIngredients } = useShoppingListStore();
  const { fetchMealPlans } = useMealPlanStore();
  const [addingMeal] = useState(false);

  const recipe = recipes.find(r => r.id === recipeId);

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
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: recipe.images[0]?.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
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
            <Text style={styles.nutrition}>Ingredients</Text>
          </View>
          <Ingredients route={route} />
          <View>
            <Text style={styles.nutrition}>Instructions</Text>
          </View>
          <Instructions route={route} />
          <Author route={route} />
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
          if (user && recipe) {
            await addMealPlan(user.id, recipe.id, date, mealType);
            await addMissingIngredients(user.id);
            await fetchMealPlans(user.id);
            await fetchRecipes();
          }
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
});
