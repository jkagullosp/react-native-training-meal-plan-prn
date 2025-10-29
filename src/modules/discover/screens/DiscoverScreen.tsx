import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DiscoverHeader from "../components/DiscoverHeader";
import { useDiscoverStore } from "../store/useDiscoverStore";
import SearchAndFilter from "../components/SearchAndFilter";
import RecipeCard from "../components/RecipeCards";
import { FullRecipe } from "../types/recipeTypes";
import FilterModal from "../components/FilterModal";

export default function DiscoverScreen({ navigation }: any) {
  const recipes = useDiscoverStore((s) => s.recipes);
  const loading = useDiscoverStore((s) => s.loading);
  const recipesError = useDiscoverStore((s) => s.recipesError);
  const availableTags = useDiscoverStore((s) => s.availableTags);
  const tagsError = useDiscoverStore((s) => s.tagsError);
  const fetchRecipes = useDiscoverStore((s) => s.fetchRecipes);
  const fetchTags = useDiscoverStore((s) => s.fetchTags);

  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [servings, setServings] = useState<number | null>(null);
  const [cookTime, setCookTime] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRecipes();
    fetchTags();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    await fetchTags();
    setRefreshing(false);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.tags.some((tagObj) =>
        tagObj.tag.name.toLowerCase().includes(search.toLowerCase())
      );

    const matchesTags =
      selectedTagIds.length === 0 ||
      recipe.tags.some((tagObj) => selectedTagIds.includes(tagObj.tag.id));

    const matchesServings = servings === null || recipe.servings === servings;

    const matchesCookTime =
      !cookTime ||
      (cookTime === "under30" && recipe.total_time && recipe.total_time < 30) ||
      (cookTime === "30to60" &&
        recipe.total_time &&
        recipe.total_time >= 30 &&
        recipe.total_time <= 60) ||
      (cookTime === "over60" && recipe.total_time && recipe.total_time > 60);

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

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <DiscoverHeader navigation={navigation} />
        </View>
        <View style={styles.headerContainerSearch}>
          <SearchAndFilter
            search={search}
            setSearch={setSearch}
            onOpenFilter={() => setFilterModalVisible(true)}
          />
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9f9f9fff" />
            <Text style={styles.emptyText}>Loading recipes...</Text>
          </View>
        ) : filteredRecipes.length > 0 ? (
          <View style={styles.cardScrollView}>
            {filteredRecipes.map((recipe: FullRecipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() =>
                  navigation.navigate("RecipeDetail", {
                    recipeId: recipe.id,
                    recipe,
                  })
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.emptyText}>No recipes found.</Text>
          </View>
        )}

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          availableTags={availableTags}
          selectedTagIds={selectedTagIds}
          setSelectedTagIds={setSelectedTagIds}
          servings={servings}
          setServings={setServings}
          cookTime={cookTime}
          setCookTime={setCookTime}
          minRating={minRating}
          setMinRating={setMinRating}
          onClear={() => {
            setSelectedTagIds([]);
            setServings(null);
            setCookTime(null);
            setMinRating(null);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
  },
  headerContainerSearch: {
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
    gap: 12,
    backgroundColor: "#F7F7F7",
  },
  cardScrollView: {
    paddingHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#F7F7F7",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: "#E16235",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
