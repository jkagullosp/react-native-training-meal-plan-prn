import React from "react";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  Platform,
} from "react-native";
import Input from "../../../shared/components/Input";
import { useDiscoverStore } from "../store/useDiscoverStore";
import { discover_texts } from "../../../constants/constants";
import { searchTypes } from "../types/searchtypes";
import { Funnel } from "lucide-react-native";
import Icon from "@react-native-vector-icons/material-design-icons";

export default function SearchAndFilter({
  search,
  setSearch,
  onOpenFilter,
}: searchTypes) {
  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.input}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by title or tag"
              style={styles.textInput}
              placeholderTextColor={"#969696"}
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={onOpenFilter}
              style={styles.filterButton}
            >
              {Platform.OS === "ios" ? (
                <Icon name="filter-outline" size={20} color={"#E16235"} />
              ) : (
                <Funnel size={20} color={"#E16235"} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingViewStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    backgroundColor: "#E7E7E7",
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 8,
  },
  filterButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  input: {
    flex: 1,
  },
  textInput: {
    backgroundColor: "#E7E7E7",
    borderRadius: 8,
    padding: 16,
    fontSize: 12,
  },
  icon: {
    tintColor: "#fff",
  },
});
