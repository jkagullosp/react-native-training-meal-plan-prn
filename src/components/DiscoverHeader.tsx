import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuthStore } from '@/stores/auth.store';
import { discover_texts, community_recipes_texts } from '@/constants/constants';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Plus } from 'lucide-react-native';

type DiscoverHeaderProps = {
  navigation: any;
  variant?: 'discover' | 'community';
};

export default function DiscoverHeader({
  navigation,
  variant = 'discover',
}: DiscoverHeaderProps) {
  const { user, loading } = useAuthStore();

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      : '';
  };

  const headerText =
    variant === 'community'
      ? community_recipes_texts.header.screenName || 'Community Recipes'
      : discover_texts.header.screenName;
  const subTitleText =
    variant === 'community'
      ? community_recipes_texts.header.subTitle ||
        'Browse and share community recipes'
      : discover_texts.header.subTitle;

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingViewStyle}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.titleColumn}>
            <Text style={styles.headerText}>{headerText}</Text>
            <Text style={styles.subTitleText}>{subTitleText}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {variant === 'community' && (
              <TouchableOpacity
                onPress={() => navigation.navigate('CreateRecipe')}
                style={
                  Platform.OS === 'ios' ? styles.shopIcon : styles.iconView
                }
              >
                {Platform.OS === 'ios' ? (
                  <Icon name="plus" size={22} color="#fff" />
                ) : (
                  <Plus size={22} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            {variant !== 'community' &&
              (loading ? (
                <ActivityIndicator size="small" color="#9f9f9fff" />
              ) : user ? (
                user.profile_image ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Image
                      source={{ uri: user.profile_image }}
                      style={styles.avatar}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>
                      {getInitials(user.display_name || 'U')}
                    </Text>
                  </View>
                )
              ) : null)}
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
    backgroundColor: '#F7F7F7',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleColumn: {
    flexDirection: 'column',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subTitleText: {
    fontSize: 12,
    color: '#878787',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
  },
  initialsAvatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#E16235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E16235',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 16,
  },

  shopIcon: {
    backgroundColor: '#E16235',
    padding: 10,
    borderRadius: 50,
  },
  iconView: {
    padding: 10,
    backgroundColor: '#E16235',
    borderRadius: 8,
  },
});
