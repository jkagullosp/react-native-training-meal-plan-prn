import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { Tag } from "../../discover/types/recipeTypes";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { CircleX, Star } from "lucide-react-native";

type FilterModalProps = {
  visible: boolean;
  onClose: () => void;
  availableTags: Tag[];
  selectedTagIds: string[];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<string[]>>;
  servings: number | null;
  setServings: React.Dispatch<React.SetStateAction<number | null>>;
  cookTime: string | null;
  setCookTime: React.Dispatch<React.SetStateAction<string | null>>;
  minRating: number | null;
  setMinRating: React.Dispatch<React.SetStateAction<number | null>>;
  onClear: () => void;
};

export default function CommunityFilterModal({
  visible,
  onClose,
  availableTags,
  selectedTagIds,
  setSelectedTagIds,
  servings,
  setServings,
  cookTime,
  setCookTime,
  minRating,
  setMinRating,
  onClear,
}: FilterModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Recipes</Text>
          <TouchableOpacity style={styles.exitButton} onPress={onClose}>
            {Platform.OS === "ios" ? (
              <Icon name="close" size={20} color={"#E16235"} />
            ) : (
              <CircleX size={20} color={"#E16235"} />
            )}
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Tags:</Text>
          <View style={styles.tagsContainer}>
            {availableTags.slice(0, 5).map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagButton,
                  selectedTagIds.includes(tag.id) && styles.tagButtonSelected,
                ]}
                onPress={() => {
                  setSelectedTagIds((prev) =>
                    prev.includes(tag.id)
                      ? prev.filter((id) => id !== tag.id)
                      : [...prev, tag.id]
                  );
                }}
              >
                <Text
                  style={[
                    styles.tagButtonText,
                    selectedTagIds.includes(tag.id) &&
                      styles.tagButtonTextSelected,
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Servings:</Text>
          <View style={styles.servingsContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.servingButton,
                  servings === num && styles.servingButtonSelected,
                ]}
                onPress={() => setServings(servings === num ? null : num)}
              >
                <Text
                  style={[
                    styles.servingButtonText,
                    servings === num && styles.servingButtonTextSelected,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Cook Time:</Text>
          <View style={styles.cookTimeContainer}>
            {[
              { label: "Under 30 mins", value: "under30" },
              { label: "30-60 mins", value: "30to60" },
              { label: "Over 60 mins", value: "over60" },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.cookTimeButton,
                  cookTime === option.value && styles.cookTimeButtonSelected,
                ]}
                onPress={() =>
                  setCookTime(cookTime === option.value ? null : option.value)
                }
              >
                <Text
                  style={[
                    styles.cookTimeButtonText,
                    cookTime === option.value &&
                      styles.cookTimeButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Minimum Rating:</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.ratingButton,
                  minRating === num && styles.ratingButtonSelected,
                ]}
                onPress={() => setMinRating(minRating === num ? null : num)}
              >
                <View style={styles.ratingButtonContent}>
                  <Text
                    style={[
                      styles.ratingButtonText,
                      minRating === num && styles.ratingButtonTextSelected,
                    ]}
                  >
                    {num}
                  </Text>
                  {Platform.OS === "ios" ? (
                    <Icon
                      name="star"
                      size={16}
                      color="#FFD700"
                      style={styles.ratingStarIcon}
                    />
                  ) : (
                    <Star
                      size={16}
                      color="#FFD700"
                      style={styles.ratingStarIcon}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Apply Filters</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.closeButton, styles.clearButton]}
            onPress={onClear}
          >
            <Text style={styles.closeButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    position: "relative",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
  },
  exitButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    alignSelf: "flex-start",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  tagButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagButtonSelected: {
    backgroundColor: "#E16235",
  },
  tagButtonText: {
    color: "#333",
  },
  tagButtonTextSelected: {
    color: "#fff",
  },
  servingsContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  servingButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  servingButtonSelected: {
    backgroundColor: "#E16235",
  },
  servingButtonText: {
    color: "#333",
  },
  servingButtonTextSelected: {
    color: "#fff",
  },
  cookTimeContainer: {
    flexDirection: "column",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  cookTimeButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  cookTimeButtonSelected: {
    backgroundColor: "#E16235",
  },
  cookTimeButtonText: {
    color: "#333",
  },
  cookTimeButtonTextSelected: {
    color: "#fff",
  },
  ratingContainer: {
    flexDirection: "row",
    marginBottom: 8,
    alignSelf: "flex-start",
    flexWrap: "wrap",
  },
  ratingButton: {
    backgroundColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  ratingButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  ratingStarIcon: {
    marginLeft: 2,
  },
  ratingButtonSelected: {
    backgroundColor: "#E16235",
  },
  ratingButtonText: {
    color: "#333",
  },
  ratingButtonTextSelected: {
    color: "#fff",
  },
  closeButton: {
    backgroundColor: "#E16235",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: "#888",
    marginTop: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
