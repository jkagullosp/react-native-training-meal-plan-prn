import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

const mealTypes = [
  { label: "Breakfast", value: "breakfast" },
  { label: "Lunch", value: "lunch" },
  { label: "Dinner", value: "dinner" },
  { label: "Snack", value: "snack" },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (date: string, mealType: string) => void;
};

export default function AddMealModal({ visible, onClose, onAdd }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);

  const handleAdd = () => {
    if (selectedMealType) {
      onAdd(format(selectedDate, "yyyy-MM-dd"), selectedMealType);
      setSelectedMealType(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Add to Meal Plan</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{selectedDate.toDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeContainer}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type.value && styles.mealTypeButtonSelected,
                ]}
                onPress={() => setSelectedMealType(type.value)}
              >
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type.value && styles.mealTypeButtonTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[
              styles.addButton,
              !selectedMealType && { backgroundColor: "#ccc" },
            ]}
            onPress={handleAdd}
            disabled={!selectedMealType}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", alignItems: "center" },
  content: { backgroundColor: "#fff", padding: 24, borderRadius: 16, width: "80%", alignItems: "center" },
  title: { fontWeight: "bold", fontSize: 18, marginBottom: 16 },
  dateButton: { backgroundColor: "#eee", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 16 },
  dateButtonText: { color: "#333", fontWeight: "bold" },
  sectionTitle: { fontWeight: "bold", marginBottom: 8, alignSelf: "flex-start" },
  mealTypeContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16, alignSelf: "flex-start" },
  mealTypeButton: { backgroundColor: "#eee", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, margin: 4 },
  mealTypeButtonSelected: { backgroundColor: "#E16235" },
  mealTypeButtonText: { color: "#333" },
  mealTypeButtonTextSelected: { color: "#fff" },
  addButton: { backgroundColor: "#E16235", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginTop: 8, width: "100%", alignItems: "center" },
  addButtonText: { color: "#fff", fontWeight: "bold" },
  cancelButton: { backgroundColor: "#888", paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8, marginTop: 8, width: "100%", alignItems: "center" },
  cancelButtonText: { color: "#fff", fontWeight: "bold" },
});