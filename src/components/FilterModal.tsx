import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { Tag } from '@/types/recipe';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CircleX, Star } from 'lucide-react-native';

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
  variant?: 'discover' | 'community';
};

export default function FilterModal({
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
  variant = 'discover',
}: FilterModalProps) {
  // use React.ElementRef<typeof TouchableOpacity> so TS knows the ref element type
  const exitRef = useRef<React.ElementRef<typeof TouchableOpacity> | null>(
    null,
  );

  useEffect(() => {
    if (visible && exitRef.current) {
      const node = findNodeHandle(exitRef.current);
      if (node) {
        AccessibilityInfo.setAccessibilityFocus(node);
        AccessibilityInfo.announceForAccessibility('Filter dialog opened');
      }
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View
        style={styles.modalOverlay}
        accessible
        accessibilityLabel="Filter dialog"
      >
        <View
          style={[
            styles.modalContent,
            variant === 'community' && styles.communityModalContent,
          ]}
          accessible
          accessibilityLabel={
            variant === 'community'
              ? 'Filter community recipes'
              : 'Filter recipes'
          }
        >
          <Text
            style={[
              styles.modalTitle,
              variant === 'community' && styles.communityModalTitle,
            ]}
            accessibilityRole="header"
          >
            {variant === 'community'
              ? 'Filter Community Recipes'
              : 'Filter Recipes'}
          </Text>

          <TouchableOpacity
            ref={exitRef}
            style={styles.exitButton}
            onPress={onClose}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close filters"
            accessibilityHint="Closes the filter dialog"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            {Platform.OS === 'ios' ? (
              <Icon name="close" size={20} color={'#E16235'} />
            ) : (
              <CircleX size={20} color={'#E16235'} />
            )}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Tags:</Text>
          <View style={styles.tagsContainer}>
            {availableTags.slice(0, 5).map(tag => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagButton,
                  selectedTagIds.includes(tag.id) && styles.tagButtonSelected,
                ]}
                onPress={() => {
                  setSelectedTagIds(prev =>
                    prev.includes(tag.id)
                      ? prev.filter(id => id !== tag.id)
                      : [...prev, tag.id],
                  );
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`Tag ${tag.name}`}
                accessibilityHint={`Adds or removes the ${tag.name} tag from filters`}
                accessibilityState={{
                  selected: selectedTagIds.includes(tag.id),
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.servingButton,
                  servings === num && styles.servingButtonSelected,
                ]}
                onPress={() => setServings(servings === num ? null : num)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${num} servings`}
                accessibilityHint={`Filter recipes for ${num} servings`}
                accessibilityState={{ selected: servings === num }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
              { label: 'Under 30 mins', value: 'under30' },
              { label: '30-60 mins', value: '30to60' },
              { label: 'Over 60 mins', value: 'over60' },
            ].map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.cookTimeButton,
                  cookTime === option.value && styles.cookTimeButtonSelected,
                ]}
                onPress={() =>
                  setCookTime(cookTime === option.value ? null : option.value)
                }
                accessible
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityHint={`Filter recipes with cook time ${option.label}`}
                accessibilityState={{ selected: cookTime === option.value }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.ratingButton,
                  minRating === num && styles.ratingButtonSelected,
                ]}
                onPress={() => setMinRating(minRating === num ? null : num)}
                accessible
                accessibilityRole="button"
                accessibilityLabel={`${num} stars or higher`}
                accessibilityHint={`Filter recipes rated ${num} stars or higher`}
                accessibilityState={{ selected: minRating === num }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                  {Platform.OS === 'ios' ? (
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

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Apply filters"
            accessibilityHint="Apply the selected filters and close dialog"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.closeButtonText}>Apply Filters</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.closeButton, styles.clearButton]}
            onPress={onClear}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Clear filters"
            accessibilityHint="Clear all selected filters"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    alignItems: 'center',
    position: 'relative',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  exitButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tagButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  tagButtonSelected: {
    backgroundColor: '#E16235',
  },
  tagButtonText: {
    color: '#333',
  },
  tagButtonTextSelected: {
    color: '#fff',
  },
  servingsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  servingButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  servingButtonSelected: {
    backgroundColor: '#E16235',
  },
  servingButtonText: {
    color: '#333',
  },
  servingButtonTextSelected: {
    color: '#fff',
  },
  cookTimeContainer: {
    flexDirection: 'column',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  cookTimeButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  cookTimeButtonSelected: {
    backgroundColor: '#E16235',
  },
  cookTimeButtonText: {
    color: '#333',
  },
  cookTimeButtonTextSelected: {
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  ratingButton: {
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
  },
  ratingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingStarIcon: {
    marginLeft: 2,
  },
  ratingButtonSelected: {
    backgroundColor: '#E16235',
  },
  ratingButtonText: {
    color: '#333',
  },
  ratingButtonTextSelected: {
    color: '#fff',
  },
  closeButton: {
    backgroundColor: '#E16235',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  clearButton: {
    backgroundColor: '#888',
    marginTop: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  communityModalContent: {
    backgroundColor: '#F3E8FF',
    borderColor: '#A78BFA',
    borderWidth: 1,
  },
  communityModalTitle: {
    color: '#6D28D9',
  },
});
