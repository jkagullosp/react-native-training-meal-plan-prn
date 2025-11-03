import React, { useEffect } from "react";
import { View, StyleSheet, Text, Image } from "react-native";
import { useDiscoverStore } from "../store/useDiscoverStore";
import { Star, BadgeCheck } from "lucide-react-native";

export default function Author({ route }: any) {
  const { recipeId } = route.params;
  const { recipes, loading, authors, fetchAuthor } = useDiscoverStore();

  const recipe = recipes.find((r) => r.id === recipeId);

  useEffect(() => {
    if (recipe && recipe.author_id) {
      fetchAuthor(recipe.author_id);
    }
  }, [recipe, fetchAuthor]);

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "";
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading author...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Author not available.</Text>
      </View>
    );
  }

  if (!recipe.author_id) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../../../assets/logos/logoIcon.png")}
          style={styles.image}
        />
        <View style={styles.reviewsContainer}>
          <View style={styles.kernelRow}>
            <Text style={styles.authorText}>
              Recipe by <Text style={styles.kernelText}>Kernel</Text>
            </Text>
            <BadgeCheck size={14} color="#1877F2" />
          </View>
          <View style={styles.ratingRow}>
            <Star size={16} color={"#e3c100ff"} />
            <Text style={styles.averageRating}>{recipe.avg_rating}</Text>
            <Text style={styles.ratingCount}>
              ({recipe.rating_count} reviews)
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const authorProfile = authors[recipe.author_id];

  const ratings = recipe.ratings || [];
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
      : 0;

  return (
    <View style={styles.container}>
      {authorProfile?.profile_image ? (
        <Image
          source={{ uri: authorProfile.profile_image }}
          style={styles.image}
        />
      ) : (
        <View style={styles.initialsAvatar}>
          <Text style={styles.initialsText}>
            {getInitials(authorProfile?.display_name || "U")}
          </Text>
        </View>
      )}
      <View style={styles.reviewsContainer}>
        <View>
          <Text style={styles.authorText}>
            Recipe by {authorProfile?.display_name || "Unknown"}
          </Text>
        </View>
        <View style={styles.ratingRow}>
          <Star size={16} color={"#e3c100ff"} />
          <Text style={styles.averageRating}>{avgRating?.toFixed(1)}</Text>
          <Text style={styles.ratingCount}>
            ({ratingCount} ratings)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#EDEDED",
    padding: 12,
    borderRadius: 16,
    gap: 16,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E16235",
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  reviewsContainer: {
    flexDirection: "column",
    gap: 4,
  },
  starIcon: {
    color: "#e3c100ff",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  averageRating: {
    color: "#e3c100ff",
    fontWeight: "bold",
  },
  ratingCount: {
    color: "#5f5f5fff",
    fontWeight: "400",
  },
  authorText: {
    fontWeight: "600",
  },
  kernelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  kernelText: {
    color: "#E16235",
    fontWeight: "bold",
  },
});
