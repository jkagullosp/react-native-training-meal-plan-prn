import React from 'react';
import { FlatList, TouchableOpacity, Text, View } from 'react-native';
import { format } from 'date-fns';
import { FullMealPlan } from '@/types/meal';

export default function WeekDateSelector({
  weekDates,
  selectedDate,
  setSelectedDate,
  meals,
  styles,
}: {
  weekDates: Date[];
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  meals: FullMealPlan[];
  styles: any;
}) {
  return (
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
            style={[styles.dayCard, isSelected && styles.dayCardSelected]}
            onPress={() => setSelectedDate(dateStr)}
          >
            <Text style={[styles.dayOfWeek, isSelected && styles.dayOfWeekSelected]}>
              {format(item, 'EEE')}
            </Text>
            <Text style={[styles.dayOfMonth, isSelected && styles.dayOfMonthSelected]}>
              {format(item, 'd')}
            </Text>
            <Text style={[styles.monthText, isSelected && styles.monthTextSelected]}>
              {format(item, 'MMM')}
            </Text>
            {hasMeal && (
              <View style={[styles.dotIndicator, isSelected && styles.dotIndicatorSelected]} />
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}