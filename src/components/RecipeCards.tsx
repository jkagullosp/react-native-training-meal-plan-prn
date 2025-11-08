import React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FullRecipe } from '@/types/recipe';
import { RecipeTag } from '@/types/recipe';
import { Star } from 'lucide-react-native';
import { Timer, Users } from 'lucide-react-native';

type RecipeCardProps = {
  recipe: FullRecipe;
  onPress: () => void;
};

const getPrimaryImage = (recipe: FullRecipe) => {
  const images = recipe.images;
  const primary = images?.find(img => img.is_primary) || images?.[0];
  return primary?.image_url;
};

export default function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const imageSource = getPrimaryImage(recipe)
    ? { uri: getPrimaryImage(recipe) }
    : require('@assets/images/placeholder.png');

  const ratings = recipe.ratings || [];
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  return (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative', width: '100%', height: 160 }}>
        <Image
          source={imageSource}
          style={styles.recipeImage}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="small" color="#9f9f9fff" />
          </View>
        )}
      </View>
      <View style={styles.recipeDetails}>
        <View style={styles.recipeTitle}>
          <Text style={styles.recipeTitleText}>{recipe.title}</Text>
        </View>
        <Text
          style={styles.recipeSubtitleText}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {recipe.description}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.timeAndServingsRow}>
            <View style={styles.timeRow}>
              <Timer size={14} color={'#777777'} />
              <Text style={styles.text}>{recipe.total_time}mins</Text>
            </View>
            <View style={styles.servingsRow}>
              <Users size={14} color={'#777777'} />
              <Text style={styles.text}>{recipe.servings}</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Star size={14} color={'#FFD700'} />
            <Text style={styles.text}>{avgRating.toFixed(1)}</Text>
            <Text style={styles.text}>({ratingCount})</Text>
          </View>
        </View>
        <View style={styles.tagsRow}>
          {recipe.tags && recipe.tags.length > 0 ? (
            recipe.tags.map((recipeTag: RecipeTag, index: number) => (
              <View style={styles.tagsView} key={index}>
                <Text style={styles.tagText}>
                  {recipeTag.tag?.name}
                  {index < recipe.tags.length - 1 ? '' : ''}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tagsView}>
              <Text style={styles.tagText}>no tags</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    resizeMode: 'cover',
  },
  recipeDetails: {
    padding: 14,
    flexDirection: 'column',
    gap: 10,
  },
  recipeTitle: {
    flexDirection: 'row',
  },
  recipeTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipeSubtitleText: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeAndServingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    color: '#777777',
  },
  servingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    color: '#777777',
  },
  text: {
    color: '#777777',
    fontSize: 12,
  },
  starIcon: {
    color: '#FFD700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#777777',
    padding: 0,
    borderRadius: 8,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    opacity: 0.7,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tagsView: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#eeeeeeff',
  },
});
