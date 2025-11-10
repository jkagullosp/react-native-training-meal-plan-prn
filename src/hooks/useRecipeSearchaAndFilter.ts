import { useState, useMemo } from 'react';
import { FullRecipe, Tag } from '@/types/recipe';

export function useRecipeSearchAndFilter(recipes: FullRecipe[] = [], _tags: Tag[] = []) {
  const [search, setSearch] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [servings, setServings] = useState<number | null>(null);
  const [cookTime, setCookTime] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        recipe.tags.some(tagObj =>
          tagObj.tag.name.toLowerCase().includes(search.toLowerCase()),
        );

      const matchesTags =
        selectedTagIds.length === 0 ||
        recipe.tags.some(tagObj => selectedTagIds.includes(tagObj.tag.id));

      const matchesServings = servings === null || recipe.servings === servings;

      const matchesCookTime =
        !cookTime ||
        (cookTime === 'under30' && recipe.total_time && recipe.total_time < 30) ||
        (cookTime === '30to60' &&
          recipe.total_time &&
          recipe.total_time >= 30 &&
          recipe.total_time <= 60) ||
        (cookTime === 'over60' && recipe.total_time && recipe.total_time > 60);

      const matchesRating =
        minRating === null ||
        (recipe.avg_rating !== null && recipe.avg_rating >= minRating);

      return (
        matchesSearch &&
        matchesTags &&
        matchesServings &&
        matchesCookTime &&
        matchesRating
      );
    });
  }, [recipes, search, selectedTagIds, servings, cookTime, minRating]);

  function clearFilters() {
    setSelectedTagIds([]);
    setServings(null);
    setCookTime(null);
    setMinRating(null);
  }

  return {
    search,
    setSearch,
    selectedTagIds,
    setSelectedTagIds,
    servings,
    setServings,
    cookTime,
    setCookTime,
    minRating,
    setMinRating,
    filteredRecipes,
    clearFilters,
  };
}