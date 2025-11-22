import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuthStore } from '@/stores/auth.store';
import { Settings, Bell } from 'lucide-react-native';
import { useUserPendingRecipes } from '@/hooks/useRecipesQuery';
import PendingRecipesModal from '@/components/PendingRecipesModal';
import { useUserRecipe } from '@/hooks/useRecipesQuery';
import { useUserTotalLikes } from '@/hooks/useProfileQuery';

export default function ProfileScreenHeader({ navigation }: any) {
  const { user } = useAuthStore();
  const { data: totalLikes } = useUserTotalLikes(user?.id ?? '');

  const {
    data: userRecipes,
    isLoading,
    refetch: refetchUserRecipes,
  } = useUserRecipe(user?.id ?? '');

  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const authUser = useAuthStore(state => state.user);
  const {
    data: pendingRecipes,
    isLoading: pendingLoading,
    refetch: refetchPendingRecipes,
  } = useUserPendingRecipes(authUser?.id ?? '');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchPendingRecipes();
    await refetchUserRecipes();
    setRefreshing(false);
  };

  useEffect(() => {});

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
      : '';
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>Profile</Text>
          <View style={styles.iconsRow}>
            <TouchableOpacity onPress={() => setPendingModalVisible(true)}>
              {Platform.OS === 'ios' ? (
                <Icon name="bell" size={24} color={'#adadadff'} />
              ) : (
                <Bell size={24} color={'#adadadff'} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
              {Platform.OS === 'ios' ? (
                <Icon name="cog" size={24} color={'#adadadff'} />
              ) : (
                <Settings size={24} color={'#adadadff'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.imageContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#9f9f9fff" />
          ) : user ? (
            user.profile_image ? (
              <Image
                source={{ uri: user.profile_image }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                  {getInitials(user.display_name || 'U')}
                </Text>
              </View>
            )
          ) : null}
        </View>
        <View style={styles.info}>
          <Text style={styles.displayName}>{user?.display_name}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
        </View>
        <View style={styles.bioContainer}>
          <Text style={styles.bio}>{user?.bio}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailsRow}>
          <View style={styles.details}>
            <Text style={styles.count}>{userRecipes?.length ?? 0}</Text>
            <Text style={styles.desc}>Recipes</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.count}>{totalLikes}</Text>
            <Text style={styles.desc}>Total Likes</Text>
          </View>
        </View>
        <PendingRecipesModal
          visible={pendingModalVisible}
          onClose={() => setPendingModalVisible(false)}
          pendingRecipes={pendingRecipes || []}
          loading={pendingLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
    padding: 16,
    borderColor: 'black',
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 50,
  },
  initialsAvatar: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: '#E16235',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 20,
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    color: '#909090ff',
  },
  bioContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    
  },
  bio: {
    fontSize: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    alignSelf: 'stretch',
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  details: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  count: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 12,
    color: '#888',
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
});
