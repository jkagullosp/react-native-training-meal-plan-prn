import React from 'react';
import { View, Text } from 'react-native';
import { MealHistory as MealHistoryType } from '@/types/meal';

type MealHistoryProps = {
  history: MealHistoryType[];
  styles: any;
};

export default function MealHistory({ history, styles }: MealHistoryProps) {
  return (
    <View>
      <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>
        Meal History
      </Text>
      {history.length === 0 ? (
        <View style={styles.noMealHistory}>
          <Text style={styles.emptyHistory}>No meal history available</Text>
        </View>
      ) : (
        history.map(h => (
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
  );
}