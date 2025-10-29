import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  RefreshControl,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import CommunityHeader from "../components/CommunityHeader";
import { useCommunityStore } from "../store/useCommunityStore";
import CommunityRecipeCards from "../components/CommunityRecipeCards";
import CommunitySearchAndFilter from "../components/CommunitySearchAndFilter";
import { FullRecipe } from "../../discover/types/recipeTypes";
import CommunityFilterModal from "../components/CommunityFilterModal";

export default function CommunityRecipesScreen({ navigation }: any) {
  const { recipes, loading, fetchCommunityRecipes, fetchTags, availableTags } =
    useCommunityStore();

  const [search, setSearch] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [servings, setServings] = useState<number | null>(null);
  const [cookTime, setCookTime] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCommunityRecipes();
    fetchTags();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityRecipes();
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
      <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.container}>
            <CommunityHeader navigation={navigation}/>
            <CommunitySearchAndFilter
              search={search}
              setSearch={setSearch}
              onOpenFilter={() => setFilterModalVisible(true)}
            />
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#9f9f9fff" />
                <Text style={styles.emptyText}>Loading recipes...</Text>
              </View>
            ) : filteredRecipes.length > 0 ? (
              <View style={styles.cardScrollView}>
                {filteredRecipes.map((recipe: FullRecipe) => (
                  <CommunityRecipeCards
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() =>
                      navigation.navigate("CommunityRecipeDetail", {
                        recipeId: recipe.id,
                        title: recipe.title,
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

            <CommunityFilterModal
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    gap: 12,
  },
  keyboardAvoidingViewStyle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    flexDirection: "column",
    gap: 12,
    backgroundColor: "#F7F7F7",
    padding: 16,
  },
  headerContainer: {
    backgroundColor: "#F7F7F7",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
  cardScrollView: {
    backgroundColor: "#F7F7F7",
  },
});
