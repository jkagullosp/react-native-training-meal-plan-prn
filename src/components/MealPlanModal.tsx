import React, { memo, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { FullRecipe } from '@/types/recipe';
import { FullMealPlan } from '@/types/meal';
import { scheduleHybridMealNotification } from '@/utils/notificationChannel';

type MealPlanModalProps = {
  visible: boolean;
  onClose: () => void;
  recipes: FullRecipe[];
  meals: FullMealPlan[];
  selectedDate: string;
  selectedMealType: string;
  user: { id: string } | null;
  addMealPlanMutation: any;
  addMissingIngredients: () => Promise<void>;
  refetchMeals: () => Promise<any>;
  refetchRecipes: () => Promise<any>;
  styles: any;
  setModalVisible: (visible: boolean) => void;
};

const RecipeRow = memo(
  ({
    recipe,
    meals,
    selectedDate,
    selectedMealType,
    onSelect,
    styles,
  }: {
    recipe: FullRecipe;
    meals: FullMealPlan[];
    selectedDate: string;
    selectedMealType: string;
    user: { id: string } | null;
    onSelect: (recipe: FullRecipe) => void;
    styles: any;
  }) => {
    const primaryImage = useMemo(() => {
      return (
        recipe.images?.find(img => img.is_primary)?.image_url ||
        recipe.images?.[0]?.image_url ||
        require('../../assets/images/placeholder.png')
      );
    }, [recipe.images]);

    const alreadyExists = useMemo(() => {
      return meals?.some(
        plan =>
          plan.recipe_id === recipe.id &&
          plan.meal_date === selectedDate &&
          plan.meal_type === selectedMealType,
      );
    }, [meals, selectedDate, selectedMealType, recipe.id]);

    return (
      <Pressable
        key={recipe.id}
        style={styles.pressable}
        onPress={() => onSelect(recipe)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Image
            source={
              typeof primaryImage === 'string'
                ? { uri: primaryImage }
                : primaryImage
            }
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              backgroundColor: '#eee',
            }}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '500', fontSize: 16 }}>
              {recipe.title}
            </Text>

            {alreadyExists ? (
              <Text style={{ color: '#E16235', fontSize: 13 }}>
                Already in meal plan
              </Text>
            ) : (
              <Text style={{ color: '#888', fontSize: 13 }}>
                {recipe.servings} servings • {recipe.calories} cal •{' '}
                {recipe.total_time}m
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.recipe.id === next.recipe.id &&
    prev.meals === next.meals &&
    prev.selectedDate === next.selectedDate &&
    prev.selectedMealType === next.selectedMealType &&
    prev.user?.id === next.user?.id,
);

function MealPlanModal({
  visible,
  onClose,
  recipes,
  meals,
  selectedDate,
  selectedMealType,
  user,
  addMealPlanMutation,
  addMissingIngredients,
  refetchMeals,
  refetchRecipes,
  styles,
  setModalVisible,
}: MealPlanModalProps) {
  const handleSelectRecipe = useCallback(
    async (recipe: FullRecipe) => {
      if (!(user && selectedDate && selectedMealType)) return;

      const alreadyExists = meals?.some(
        plan =>
          plan.recipe_id === recipe.id &&
          plan.meal_date === selectedDate &&
          plan.meal_type === selectedMealType,
      );

      if (alreadyExists) {
        Toast.show({
          type: 'info',
          text1: 'Already added',
          text2: 'This recipe is already in your meal plan.',
        });
        return;
      }

      addMealPlanMutation(
        {
          userId: user.id,
          recipeId: recipe.id,
          mealDate: selectedDate,
          mealType: selectedMealType,
        },
        {
          onSuccess: async (newMealPlan: FullMealPlan) => {
            if (newMealPlan?.id) {
              await scheduleHybridMealNotification({
                userId: user.id,
                mealPlanId: newMealPlan.id,
                mealDate: selectedDate,
                mealType: selectedMealType,
                recipeTitle: recipe.title,
                notificationHoursBefore: 2,
              });
            }

            await addMissingIngredients();
            await refetchMeals();
            await refetchRecipes();
            setModalVisible(false);
          },
          onError: (error: Error) => {
            console.error('Failed to add meal plan:', error.message);
          },
        },
      );
    },
    [
      user,
      selectedDate,
      selectedMealType,
      meals,
      addMealPlanMutation,
      addMissingIngredients,
      refetchMeals,
      refetchRecipes,
      setModalVisible,
    ],
  );

  const memoizedRecipeList = useMemo(() => {
    return recipes?.map(recipe => (
      <RecipeRow
        key={recipe.id}
        recipe={recipe}
        meals={meals}
        selectedDate={selectedDate}
        selectedMealType={selectedMealType}
        user={user}
        onSelect={handleSelectRecipe}
        styles={styles}
      />
    ));
  }, [
    recipes,
    meals,
    selectedDate,
    selectedMealType,
    user,
    handleSelectRecipe,
    styles,
  ]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalView}>
        <View style={styles.innerModalView}>
          <Text style={styles.modalTitle}>Select a Recipe</Text>

          <ScrollView>{memoizedRecipeList}</ScrollView>

          <TouchableOpacity
            style={{ marginTop: 16, alignSelf: 'center' }}
            onPress={onClose}
          >
            <Text
              style={{
                color: '#E16235',
                fontWeight: 'bold',
                marginBottom: 18,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default memo(MealPlanModal, (prev, next) => {
  return (
    prev.visible === next.visible &&
    prev.recipes === next.recipes &&
    prev.meals === next.meals &&
    prev.selectedDate === next.selectedDate &&
    prev.selectedMealType === next.selectedMealType &&
    prev.user?.id === next.user?.id
  );
});
