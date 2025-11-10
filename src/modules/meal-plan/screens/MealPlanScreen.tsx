import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Modal,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealPlanStore } from '../store/useMealPlanStore';
import MealPlanHeader from '../components/MealPlanHeader';
import { format, addDays } from 'date-fns';
import DailyNutrition from '../components/DailyNutrition';
import { useShoppingListStore } from '../../shopping-list/store/useShoppingListStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Circle, CircleCheck, Trash2 } from 'lucide-react-native';
import { scheduleHybridMealNotification } from '../../../utils/notificationChannel';
import { supabase } from '../../../client/supabase';
import {
  useMealQuery,
  useMealHistory,
  useAddMealPlan,
} from '@/hooks/useMealQuery';
import { useRecipesQuery } from '@/hooks/useRecipesQuery';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

export default function MealPlanScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { removeMealPlan, markMealDone, removeIngredientsForRecipe } =
    useMealPlanStore();
  const {
    data: meals,
    isLoading: mealsLoading,
    refetch: refetchMeals,
  } = useMealQuery(user?.id ?? '');
  const {
    data: history,
    isLoading: mealHistoryLoading, // implement history loading
    refetch: refetchHistory,
  } = useMealHistory(user?.id ?? '');
  const {
    data: recipes,
    isLoading: recipesLoading,
    refetch: refetchRecipes,
  } = useRecipesQuery(); //implement recipe loading
  const { mutate: addMealPlanMutation, isPending: addingMeal } =
    useAddMealPlan(); // implement adding meal

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const { addMissingIngredients } = useShoppingListStore();

  const weekDates = getWeekDates();
  const [selectedDate, setSelectedDate] = useState(
    format(weekDates[0], 'yyyy-MM-dd'),
  );

  const mealTypes = [
    { label: 'Breakfast', value: 'breakfast', emoji: '🌅' },
    { label: 'Lunch', value: 'lunch', emoji: '🌞' },
    { label: 'Dinner', value: 'dinner', emoji: '🌙' },
    { label: 'Snack', value: 'snack', emoji: '🍪' },
  ];

  function getWeekDates() {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => addDays(today, i));
  }

  function uuidv4() {
    // simple RFC4122 v4 UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  useEffect(() => {
    const testNotification = async () => {
      if (!user?.id) return;

      // Check if we already have a pending test notification
      const { data: existing } = await supabase
        .from('scheduled_meal_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('sent', false)
        .gte('notification_time', new Date().toISOString());

      if (existing && existing.length > 0) {
        console.log('⏳ Already have pending notification, skipping');
        console.log(
          '   Scheduled for:',
          new Date(existing[0].notification_time).toLocaleTimeString(),
        );
        return;
      }

      // Schedule for EXACTLY 2 minutes from now (gives more time to see it)
      const testDate = new Date(Date.now() + 2 * 60 * 1000);

      console.log('🧪 Creating test notification');
      console.log('   Current time:', new Date().toLocaleTimeString());
      console.log('   Notification time:', testDate.toLocaleTimeString());

      const result = await scheduleHybridMealNotification({
        userId: user.id,
        mealPlanId: uuidv4(),
        mealDate: testDate.toISOString(),
        mealType: 'lunch',
        recipeTitle: 'Test Chicken Adobo 🍗',
        notificationHoursBefore: 0,
      });

      console.log('✅ Result:', result);

      // Verify it was created
      const { data } = await supabase
        .from('scheduled_meal_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('📋 Created in DB:', data?.[0]);
    };

    // Run the test
    testNotification();
  }, [user]);

  const onRefresh = async () => {
    if (user?.id) {
      setRefreshing(true);
      await refetchMeals();
      await refetchRecipes();
      await refetchHistory();
      setRefreshing(false);
    }
  };

  const plansForSelectedDate =
    meals?.filter(plan => plan.meal_date === selectedDate) ?? [];

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <MealPlanHeader />
          </View>
          <View>
            <FlatList
              data={weekDates}
              keyExtractor={item => format(item, 'yyyy-MM-dd')}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.weekList}
              contentContainerStyle={{ paddingHorizontal: 6 }}
              renderItem={({ item }) => {
                const dateStr = format(item, 'yyyy-MM-dd');
                const isSelected = dateStr === selectedDate;
                const hasMeal = meals?.some(plan => plan.meal_date === dateStr);
                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={[
                      styles.dayCard,
                      isSelected && styles.dayCardSelected,
                    ]}
                    onPress={() => setSelectedDate(dateStr)}
                  >
                    <Text
                      style={[
                        styles.dayOfWeek,
                        isSelected && styles.dayOfWeekSelected,
                      ]}
                    >
                      {format(item, 'EEE')}
                    </Text>
                    <Text
                      style={[
                        styles.dayOfMonth,
                        isSelected && styles.dayOfMonthSelected,
                      ]}
                    >
                      {format(item, 'd')}
                    </Text>
                    <Text
                      style={[
                        styles.monthText,
                        isSelected && styles.monthTextSelected,
                      ]}
                    >
                      {format(item, 'MMM')}
                    </Text>
                    {hasMeal && (
                      <View
                        style={[
                          styles.dotIndicator,
                          isSelected && styles.dotIndicatorSelected,
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
          <View style={styles.mealPlanContainer}>
            {mealsLoading && <Text>Loading meal plans...</Text>}
            {mealTypes.map(type => {
              const plansForType = plansForSelectedDate?.filter(
                p => p.meal_type === type.value,
              );
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
                                await markMealDone(
                                  user.id,
                                  plan.recipe_id,
                                  plan.meal_date,
                                  plan.meal_type,
                                );
                                await refetchHistory();
                                await removeIngredientsForRecipe(
                                  user.id,
                                  plan.recipe_id,
                                );
                              }}
                              disabled={isDone}
                            >
                              {Platform.OS === 'ios' ? (
                                <Icon
                                  name={
                                    isDone
                                      ? 'checkbox-marked'
                                      : 'checkbox-blank-outline'
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
                                <Text style={styles.mealTitle}>
                                  {plan.recipe?.title}
                                </Text>
                                <Text style={styles.mealMeta}>
                                  {plan.recipe?.total_time}m •{' '}
                                  {plan.recipe?.servings} servings •{' '}
                                  {plan.recipe?.calories} cal
                                </Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={async () => {
                                await removeMealPlan(plan.id, user?.id || '');
                                if (user?.id) {
                                  await refetchMeals();
                                }
                              }}
                              style={{ padding: 8 }}
                            >
                              {Platform.OS === 'ios' ? (
                                <Icon
                                  name="trash-can-outline"
                                  size={18}
                                  color="#E16235"
                                />
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
            })}
          </View>
          <View>
            <Text style={styles.nutrition}>Daily Nutrition Summary</Text>
          </View>
          <DailyNutrition mealPlans={plansForSelectedDate ?? []} />
          <View>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
              Meal History
            </Text>
            {history?.length === 0 ? (
              <View style={styles.noMealHistory}>
                <Text style={styles.emptyHistory}>
                  No meal history available
                </Text>
              </View>
            ) : (
              history?.map(h => (
                <View key={h.id} style={{ marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold' }}>
                    {h.recipe?.title} ({h.meal_type})
                  </Text>
                  <Text style={{ color: '#888' }}>
                    {h.meal_date} • Marked at{' '}
                    {new Date(h.marked_at).toLocaleTimeString()}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <View style={styles.innerModalView}>
              <Text style={styles.modalTitle}>Select a Recipe</Text>
              <ScrollView>
                {recipes && recipes.length > 0 ? (
                  recipes.map(recipe => {
                    const primaryImage =
                      recipe.images?.find(img => img.is_primary)?.image_url ||
                      recipe.images?.[0]?.image_url ||
                      require('@assets/images/placeholder.png');
                    return (
                      <Pressable
                        key={recipe.id}
                        style={styles.pressable}
                        onPress={() => {
                          if (user && selectedDate && selectedMealType) {
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
                                text2:
                                  'This recipe is already in your meal plan for this meal.',
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
                                onSuccess: async () => {
                                  await addMissingIngredients(user.id);
                                  await refetchMeals();
                                  await refetchRecipes();
                                  queryClient.invalidateQueries({
                                    queryKey: ['meals'],
                                  });
                                  queryClient.invalidateQueries({
                                    queryKey: ['recipes'],
                                  });
                                  setModalVisible(false);
                                },
                                onError: error => {
                                  // Optionally show a toast or alert
                                  console.error(
                                    'Failed to add meal plan:',
                                    error,
                                  );
                                },
                              },
                            );
                          }
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                          }}
                        >
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
                            <Text
                              style={{ fontWeight: 'medium', fontSize: 16 }}
                            >
                              {recipe.title}
                            </Text>
                            <Text style={{ color: '#888', fontSize: 13 }}>
                              {recipe.servings} servings • {recipe.calories} cal
                              • {recipe.total_time}m
                            </Text>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                ) : (
                  <Text>No recipes found.</Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={{ marginTop: 16, alignSelf: 'center' }}
                onPress={() => setModalVisible(false)}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#F7F7F7',
    paddingTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    backgroundColor: '#F7F7F7',
  },
  weekList: {
    backgroundColor: '#F7F7F7',
    paddingVertical: 8,
  },
  dayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dayCardSelected: {
    backgroundColor: '#E16235',
  },
  dayOfWeek: {
    fontSize: 13,
    color: '#222',
    fontWeight: '600',
  },
  dayOfWeekSelected: {
    color: '#fff',
  },
  dayOfMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  dayOfMonthSelected: {
    color: '#fff',
  },
  monthText: {
    fontSize: 11,
    color: '#888',
  },
  monthTextSelected: {
    color: '#fff',
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#E16235',
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
  },
  dotIndicatorSelected: {
    backgroundColor: '#fff',
  },
  mealPlanContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 15,
    backgroundColor: '#F7F7F7',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  },
  mealTypeContainer: {},
  mealTypeTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  mealCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  mealTitle: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  mealMeta: {
    color: '#888',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: '#E16235',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#edededff',
    borderRadius: 6,
  },
  typeContainer: {
    flexDirection: 'column',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderRadius: 12,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noMealPlanned: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  nutrition: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  innerModalView: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  pressable: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  noMealHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
  },
});
