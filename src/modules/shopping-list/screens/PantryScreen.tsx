import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useShoppingListStore } from "../store/useShoppingListStore";
import { supabase } from "../../utils/supabase";
import Toast from "react-native-toast-message";

export default function PantryScreen() {
  const { user } = useAuthStore();
  const {
    pantry,
    loading,
    fetchPantry,
    fetchShoppingList,
    addMissingIngredients,
  } = useShoppingListStore();
  const [refreshing, setRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    quantity: "",
    unit: "",
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
      fetchPantry(user.id);
    }
  }, [user?.id, fetchPantry]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchPantry(user.id);
    }
    setRefreshing(false);
  };

  const deductFromShoppingList = useCallback(async (
    ingredientName: string,
    addQty: number,
    _unit: string
  ) => {
    if (!user?.id) return;
    const { data: shoppingItems } = await supabase
      .from("shopping_list")
      .select("*")
      .eq("user_id", user.id)
      .eq("ingredient_name", ingredientName)
      .order("created_at", { ascending: true });

    let remaining = addQty;
    for (const item of shoppingItems || []) {
      if (remaining <= 0) break;
      const itemQty = Number(item.quantity) || 1;
      if (itemQty <= remaining) {
        await supabase.from("shopping_list").delete().eq("id", item.id);
        remaining -= itemQty;
      } else {
        await supabase
          .from("shopping_list")
          .update({ quantity: itemQty - remaining })
          .eq("id", item.id);
        remaining = 0;
      }
    }
    await fetchShoppingList(user.id);
  }, [user?.id, fetchShoppingList]);

  const handleAddPantry = async () => {
    if (!user?.id || !newIngredient.name) return;
    await fetchPantry(user.id);
    const exists = pantry.find(
      (item) =>
        item.ingredient_name.toLowerCase() ===
        newIngredient.name.trim().toLowerCase()
    );
    const addQty = Number(newIngredient.quantity) || 1;
    if (exists) {
      await supabase
        .from("user_pantry")
        .update({
          quantity: exists.quantity + addQty,
          unit: newIngredient.unit || exists.unit,
        })
        .eq("id", exists.id);
    } else {
      await supabase.from("user_pantry").insert([
        {
          user_id: user.id,
          ingredient_name: newIngredient.name.trim(),
          quantity: addQty,
          unit: newIngredient.unit || "",
        },
      ]);
    }
    await deductFromShoppingList(
      newIngredient.name.trim(),
      addQty,
      newIngredient.unit || ""
    );
    setShowAddModal(false);
    Toast.show({
      type: "success",
      text1: "Added to Pantry",
      text2: `${newIngredient.name.trim()} was added into pantry`,
    });
    setNewIngredient({ name: "", quantity: "", unit: "" });
    await fetchPantry(user.id);
  };

  const handleDeletePantry = async (itemId: string) => {
    if (!user?.id) return;
    const item = pantry.find((i) => i.id === itemId);
    if (!item) return;
    await supabase.from("user_pantry").delete().eq("id", itemId);
    await fetchPantry(user.id);
    await addMissingIngredients(user.id);
    setDeleteModal({ show: false, itemId: undefined });
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
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
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
              <Text style={{ color: "#fff" }}>Add items to pantry</Text>
            </TouchableOpacity>
          </View>
        )}
        {pantry.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ingredientText}>
                {item.ingredient_name}
                {item.quantity
                  ? ` (${item.quantity}${item.unit ? ` ${item.unit}` : ""})`
                  : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => setDeleteModal({ show: true, itemId: item.id })}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Add Ingredient Modal */}
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
                onChangeText={(text) =>
                  setNewIngredient((prev) => ({ ...prev, name: text }))
                }
                style={styles.input}
              />
              <TextInput
                placeholder="Quantity"
                value={newIngredient.quantity}
                onChangeText={(text) =>
                  setNewIngredient((prev) => ({
                    ...prev,
                    quantity: text.replace(/[^0-9.]/g, ""),
                  }))
                }
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                placeholder="Unit"
                value={newIngredient.unit}
                onChangeText={(text) =>
                  setNewIngredient((prev) => ({ ...prev, unit: text }))
                }
                style={styles.input}
              />
              <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={handleAddPantry}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Save
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: "#888" }]}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Confirmation Modal */}
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
              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { flex: 1, backgroundColor: "#E16235" },
                  ]}
                  onPress={() => {
                    if (deleteModal.itemId)
                      handleDeletePantry(deleteModal.itemId);
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    Delete
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1, backgroundColor: "#888" }]}
                  onPress={() =>
                    setDeleteModal({ show: false, itemId: undefined })
                  }
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
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
    flexDirection: "column",
    gap: 16,
    padding: 16,
  },
  header: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  ingredientText: {
    fontSize: 16,
    color: "#222",
  },
  deleteButton: {
    backgroundColor: "#E16235",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  emptyContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 100,
    gap: 12,
  },
  button: {
    fontSize: 12,
    padding: 12,
    backgroundColor: "#E16235",
    borderRadius: 8,
    color: "#fff",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
});