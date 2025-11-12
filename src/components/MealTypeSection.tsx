import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Circle, CircleCheck, Trash2 } from 'lucide-react-native';
import { FullMealPlan, MealHistory } from '@/types/meal';

type MealType = {
  label: string;
  value: string;
  emoji: string;
};

type Props = {
  type: MealType;
  plansForType: FullMealPlan[];
  history: MealHistory[];
  navigation: any;
  setSelectedMealType: (type: string) => void;
  setModalVisible: (visible: boolean) => void;
  markMealDoneMutation: (vars: {
    userId: string;
    recipeId: string;
    mealDate: string;
    mealType: string;
  }) => void;
  removeMealPlanMutation: (mealPlanId: string) => void;
  removeIngredientsForRecipeMutation: (vars: { recipeId: string }) => void;
  user: { id: string } | null;
  refetchHistory: () => Promise<any>;
  refetchMeals: () => Promise<any>;
  styles: any;
};

export default function MealTypeSection({
  type,
  plansForType,
  history,
  navigation,
  setSelectedMealType,
  setModalVisible,
  markMealDoneMutation,
  removeMealPlanMutation,
  removeIngredientsForRecipeMutation,
  user,
  refetchHistory,
  refetchMeals,
  styles,
}: Props) {
  return (
    <View key={type.value} style={styles.mealTypeContainer}>
      <View style={styles.typeContainer}>
        <View style={styles.typeRow}>
          <Text style={styles.mealTypeTitle}>
            {type.emoji} {type.label}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedMealType(type.value);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        {plansForType.length > 0 ? (
          plansForType.map(plan => {
            const isDone = history?.some(
              h =>
                h.recipe_id === plan.recipe_id &&
                h.meal_date === plan.meal_date &&
                h.meal_type === plan.meal_type,
            );
            return (
              <View
                key={plan.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: isDone ? 0.5 : 1,
                  backgroundColor: isDone ? '#F0F0F0' : '#fff',
                  borderRadius: 12,
                  marginBottom: 4,
                  paddingHorizontal: 8,
                }}
              >
                <TouchableOpacity
                  style={{ marginRight: 8 }}
                  onPress={async () => {
                    if (!user?.id || isDone) return;
                    markMealDoneMutation({
                      userId: user.id,
                      recipeId: plan.recipe.id,
                      mealDate: plan.meal_date,
                      mealType: plan.meal_type,
                    });
                    await refetchHistory();
                    removeIngredientsForRecipeMutation({
                      recipeId: plan.recipe_id,
                    });
                  }}
                  disabled={isDone}
                >
                  {Platform.OS === 'ios' ? (
                    <Icon
                      name={
                        isDone ? 'checkbox-marked' : 'checkbox-blank-outline'
                      }
                      size={24}
                      color={isDone ? '#4CAF50' : '#888'}
                    />
                  ) : isDone ? (
                    <CircleCheck size={24} color="#4CAF50" />
                  ) : (
                    <Circle size={24} color="#888" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    navigation.navigate('Discover', {
                      screen: 'RecipeDetail',
                      params: {
                        recipeId: plan.recipe_id,
                        title: plan.recipe?.title,
                        recipe: plan.recipe,
                      },
                    })
                  }
                >
                  <View style={styles.mealCard}>
                    <Text style={styles.mealTitle}>{plan.recipe?.title}</Text>
                    <Text style={styles.mealMeta}>
                      {plan.recipe?.total_time}m • {plan.recipe?.servings}{' '}
                      servings • {plan.recipe?.calories} cal
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={async () => {
                    removeMealPlanMutation(plan.id);
                    if (user?.id) {
                      await refetchMeals();
                    }
                  }}
                  style={{ padding: 8 }}
                >
                  {Platform.OS === 'ios' ? (
                    <Icon name="trash-can-outline" size={18} color="#E16235" />
                  ) : (
                    <Trash2 size={18} color="#E16235" />
                  )}
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.noMealPlanned}>
            <Text style={styles.emptyText}>No meal planned</Text>
          </View>
        )}
      </View>
    </View>
  );
}
