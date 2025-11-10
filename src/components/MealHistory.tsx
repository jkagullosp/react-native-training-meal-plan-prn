import React from 'react';
import { View, Text } from 'react-native';
import { MealHistory as MealHistoryType } from '@/types/meal';

type MealHistoryProps = {
  history: MealHistoryType[];
  styles: any;
};

export default function MealHistory({ history, styles }: MealHistoryProps) {
  return (
    <View style={styles.mealHistoryContainer}>
      {history.length === 0 ? (
        <View style={styles.noMealHistory}>
          <Text style={styles.emptyHistory}>No meal history available</Text>
        </View>
      ) : (
        history.map(h => (
          <View key={h.id} style={styles.mealHistoryItem}>
            <Text style={styles.mealHistoryRecipe}>
              {h.recipe?.title} ({h.meal_type})
            </Text>
            <Text style={styles.mealHistoryMeta}>
              {h.meal_date} • Marked at{' '}
              {new Date(h.marked_at).toLocaleTimeString()}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}