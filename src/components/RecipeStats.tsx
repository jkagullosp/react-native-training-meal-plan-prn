import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useDiscoverStore } from '../modules/discover/store/useDiscoverStore';
import { Timer, Users, ChefHat } from 'lucide-react-native';

export default function Stats({ route }: any) {
  const { recipeId } = route.params;
  const { recipes, loading } = useDiscoverStore();

  const recipe = recipes.find(r => r.id === recipeId);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading stats...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Stats not available.</Text>
      </View>
    );
  }

  function getDifficultyColor(difficulty?: string | null) {
    if (difficulty === 'easy') return '#4CAF50';
    if (difficulty === 'medium') return '#d88262ff';
    if (difficulty === 'hard') return '#f9622bff';
    return '#888';
  }

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Timer size={25} color="#E16235" />
        <Text style={styles.type}>Total Time</Text>
        <Text style={styles.value}>{recipe.total_time}m</Text>
      </View>
      <View style={styles.stat}>
        <Users size={25} color="#E16235" />
        <Text style={styles.type}>Servings</Text>
        <Text style={styles.value}>{recipe.servings ?? '-'}</Text>
      </View>
      <View style={styles.stat}>
        <ChefHat size={25} color="#E16235" />
        <Text style={styles.type}>Difficulty</Text>
        <Text
          style={[
            styles.value,
            { color: getDifficultyColor(recipe.difficulty) },
          ]}
        >
          {recipe.difficulty ?? '-'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#EDEDED',
    padding: 12,
    borderRadius: 16,
    justifyContent: 'space-around',
  },
  stat: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: 14,
    color: '#5f5f5fff',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
