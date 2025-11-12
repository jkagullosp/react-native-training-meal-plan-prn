import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MealPlanHeader from '../components/MealPlanHeader';
import { format, addDays } from 'date-fns';
import DailyNutrition from '../components/DailyNutrition';
import {
  useMealQuery,
  useMealHistory,
  useAddMealPlan,
  useMarkMealPLan,
  useRemoveIngredientsForRecipe,
} from '@/hooks/useMealQuery';
import { useRecipesQuery } from '@/hooks/useRecipesQuery';
import { useAuthStore } from '@/stores/auth.store';
import WeekDateSelector from '@/utils/weekDateSelector';
import MealTypeSection from '@/components/MealTypeSection';
import MealHistory from '@/components/MealHistory';
import MealPlanModal from '@/components/MealPlanModal';
import { useAddMissingIngredientsMutation } from '@/hooks/useShopQuery';
import { useRemoveMealPlanAndShoppingListMutation } from '@/hooks/useShopQuery';

export default function MealPlanScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { mutate: removeMealPlanMutation } =
    useRemoveMealPlanAndShoppingListMutation(user?.id ?? '');
  const { mutate: markMealDoneMutation } = useMarkMealPLan();
  const { mutate: removeIngredientsForRecipeMutation } =
    useRemoveIngredientsForRecipe(user?.id ?? '');
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
  const addMissingIngredientsMutation = useAddMissingIngredientsMutation(
    user?.id ?? '',
  );
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

  // function uuidv4() {
  //   // simple RFC4122 v4 UUID generator
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  //     const r = (Math.random() * 16) | 0;
  //     const v = c === 'x' ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }

  // useEffect(() => {
  //   const testNotification = async () => {
  //     if (!user?.id) return;

  //     // Check if we already have a pending test notification
  //     const { data: existing } = await supabase
  //       .from('scheduled_meal_notifications')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .eq('sent', false)
  //       .gte('notification_time', new Date().toISOString());

  //     if (existing && existing.length > 0) {
  //       console.log('⏳ Already have pending notification, skipping');
  //       console.log(
  //         '   Scheduled for:',
  //         new Date(existing[0].notification_time).toLocaleTimeString(),
  //       );
  //       return;
  //     }

  //     // Schedule for EXACTLY 2 minutes from now (gives more time to see it)
  //     const testDate = new Date(Date.now() + 2 * 60 * 1000);

  //     console.log('🧪 Creating test notification');
  //     console.log('   Current time:', new Date().toLocaleTimeString());
  //     console.log('   Notification time:', testDate.toLocaleTimeString());

  //     const result = await scheduleHybridMealNotification({
  //       userId: user.id,
  //       mealPlanId: uuidv4(),
  //       mealDate: testDate.toISOString(),
  //       mealType: 'lunch',
  //       recipeTitle: 'Test Chicken Adobo 🍗',
  //       notificationHoursBefore: 0,
  //     });

  //     console.log('✅ Result:', result);

  //     // Verify it was created
  //     const { data } = await supabase
  //       .from('scheduled_meal_notifications')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .order('created_at', { ascending: false })
  //       .limit(1);

  //     console.log('📋 Created in DB:', data?.[0]);
  //   };

  //   // Run the test
  //   testNotification();
  // }, [user]);

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
            <WeekDateSelector
              weekDates={weekDates}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              meals={meals ?? []}
              styles={styles}
            />
          </View>
          <View style={styles.mealPlanContainer}>
            {mealsLoading && <Text>Loading meal plans...</Text>}
            {mealTypes.map(type => {
              const plansForType = plansForSelectedDate?.filter(
                p => p.meal_type === type.value,
              );
              return (
                <MealTypeSection
                  key={type.value}
                  type={type}
                  plansForType={plansForType}
                  history={history ?? []}
                  navigation={navigation}
                  setSelectedMealType={setSelectedMealType}
                  setModalVisible={setModalVisible}
                  markMealDoneMutation={markMealDoneMutation}
                  removeMealPlanMutation={removeMealPlanMutation}
                  removeIngredientsForRecipeMutation={
                    removeIngredientsForRecipeMutation
                  }
                  user={user}
                  refetchHistory={refetchHistory}
                  refetchMeals={refetchMeals}
                  styles={styles}
                />
              );
            })}
          </View>
          <View>
            <Text style={styles.nutrition}>Daily Nutrition Summary</Text>
          </View>
          <DailyNutrition mealPlans={plansForSelectedDate ?? []} />
          <View>
            <Text style={styles.nutrition}>Meal History</Text>
            <MealHistory history={history ?? []} styles={styles} />
          </View>
        </View>
        <MealPlanModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          recipes={recipes ?? []}
          meals={meals ?? []}
          selectedDate={selectedDate}
          selectedMealType={selectedMealType ?? ''}
          user={user}
          addMealPlanMutation={addMealPlanMutation}
          addMissingIngredients={addMissingIngredientsMutation.mutateAsync}
          refetchMeals={refetchMeals}
          refetchRecipes={refetchRecipes}
          styles={styles}
          setModalVisible={setModalVisible}
        />
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

  mealHistoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 8,
  },
  mealHistoryTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#222',
  },
  mealHistoryItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F7F7F7',
  },
  mealHistoryRecipe: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  mealHistoryMeta: {
    color: '#888',
    fontSize: 13,
  },
});
