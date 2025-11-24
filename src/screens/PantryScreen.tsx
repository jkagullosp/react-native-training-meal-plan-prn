import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import Toast from 'react-native-toast-message';
import { useFetchPantryQuery } from '@/hooks/usePantryQuery';
import {
  useAddToPantryMutation,
  useDeletePantryItemMutation,
} from '@/hooks/usePantryQuery';

export default function PantryScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: pantry = [],
    isLoading: loading,
    refetch: refetchPantry,
  } = useFetchPantryQuery(user?.id ?? '');
  const addToPantryMutation = useAddToPantryMutation(user?.id ?? '', pantry);
  const deletePantryItemMutation = useDeletePantryItemMutation(user?.id ?? '');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: '',
  });

  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    itemId?: string;
  }>({
    show: false,
    itemId: undefined,
  });

  useEffect(() => {
    if (user?.id) {
      refetchPantry();
    }
  }, [user?.id, refetchPantry]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await refetchPantry();
    }
    setRefreshing(false);
  };

  const handleAddPantry = async () => {
    if (!user?.id || !newIngredient.name) return;
    addToPantryMutation.mutate(newIngredient, {
      onSuccess: () => {
        setShowAddModal(false);
        Toast.show({
          type: 'success',
          text1: 'Added to Pantry',
          text2: `${newIngredient.name.trim()} was added into pantry`,
        });
        setNewIngredient({ name: '', quantity: '', unit: '' });
      },
    });
  };

  const handleDeletePantry = async (itemId: string) => {
    if (!user?.id) return;
    deletePantryItemMutation.mutate(itemId, {
      onSuccess: () => {
        setDeleteModal({ show: false, itemId: undefined });
      },
    });
  };

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        {loading && <ActivityIndicator size="small" color="#9f9f9fff" />}
        {!loading && pantry.length > 0 && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>
              Add Ingredient
            </Text>
          </TouchableOpacity>
        )}
        {!loading && pantry.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your pantry list is empty!</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={{ color: '#fff' }}>Add items to pantry</Text>
            </TouchableOpacity>
          </View>
        )}
        {pantry.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ingredientText}>
                {item.ingredient_name}
                {item.quantity
                  ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ''})`
                  : ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setDeleteModal({ show: true, itemId: item.id })}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Pantry Ingredient</Text>
              <TextInput
                placeholder="Ingredient Name"
                value={newIngredient.name}
                onChangeText={text =>
                  setNewIngredient(prev => ({ ...prev, name: text }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Quantity"
                value={newIngredient.quantity}
                onChangeText={text =>
                  setNewIngredient(prev => ({
                    ...prev,
                    quantity: text.replace(/[^0-9.]/g, ''),
                  }))
                }
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Unit"
                value={newIngredient.unit}
                onChangeText={text =>
                  setNewIngredient(prev => ({ ...prev, unit: text }))
                }
                style={styles.input}
              />
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={handleAddPantry}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: '#888' }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={deleteModal.show}
          animationType="fade"
          transparent
          onRequestClose={() =>
            setDeleteModal({ show: false, itemId: undefined })
          }
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Delete Ingredient</Text>
              <Text style={{ marginBottom: 16 }}>
                Are you sure you want to delete this ingredient from your
                pantry?
              </Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { flex: 1, backgroundColor: '#E16235' },
                  ]}
                  onPress={() => {
                    if (deleteModal.itemId)
                      handleDeletePantry(deleteModal.itemId);
                  }}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Delete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: '#888' }]}
                  onPress={() =>
                    setDeleteModal({ show: false, itemId: undefined })
                  }
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  container: {
    flex: 1,
    flexDirection: 'column',
    gap: 16,
    padding: 16,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ingredientText: {
    fontSize: 16,
    color: '#222',
  },
  deleteButton: {
    backgroundColor: '#E16235',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 100,
    gap: 12,
  },
  button: {
    fontSize: 12,
    padding: 12,
    backgroundColor: '#E16235',
    borderRadius: 8,
    color: '#fff',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
});
