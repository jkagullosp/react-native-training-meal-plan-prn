import React from 'react';
import { Modal, View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function PendingRecipesModal({
  visible,
  onClose,
  pendingRecipes,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  pendingRecipes: any[];
  loading: boolean;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.modal}>
          <Text style={modalStyles.title}>Your Pending Recipes</Text>
          {loading ? (
            <Text>Loading...</Text>
          ) : pendingRecipes?.length ? (
            <FlatList
              data={pendingRecipes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={modalStyles.recipeItem}>
                  <Text style={modalStyles.recipeTitle}>{item.title}</Text>
                  <Text style={modalStyles.recipeDate}>
                    Submitted: {new Date(item.created_at).toLocaleString()}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={modalStyles.emptyText}>No pending recipes.</Text>
          )}
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <Text style={modalStyles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  recipeItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeDate: {
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginVertical: 24,
  },
  closeBtn: {
    marginTop: 18,
    alignSelf: 'center',
    backgroundColor: '#E16235',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});