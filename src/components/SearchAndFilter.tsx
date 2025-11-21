import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { searchTypes } from '@/types/search';
import { Funnel } from 'lucide-react-native';
//import Icon from "@react-native-vector-icons/material-design-icons";

type SearchAndFilterProps = searchTypes & {
  variant?: 'discover' | 'community';
};

export default function SearchAndFilter({
  search,
  setSearch,
  onOpenFilter,
  variant = 'discover',
}: SearchAndFilterProps) {
  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.input}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                variant === 'community'
                  ? 'Search community recipes...'
                  : 'Search by title or tag'
              }
              style={[
                styles.textInput,
                variant === 'community' && styles.communityTextInput,
              ]}
              placeholderTextColor={'#969696'}
            />
          </View>
          <View>
            <TouchableOpacity
              onPress={onOpenFilter}
              style={styles.filterButton}
            >
              {Platform.OS === 'ios' ? (
                <Funnel size={20} color={'#E16235'} />
              ) : (
                <Funnel size={20} color={'#E16235'} />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#E7E7E7',
    paddingVertical: 13,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginLeft: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#E7E7E7',
    borderRadius: 8,
    padding: 16,
    fontSize: 12,
  },
  icon: {
    tintColor: '#fff',
  },
  communityTextInput: {
    backgroundColor: '#F3E8FF', // example: different bg for community
    color: '#6D28D9',
  },
});
