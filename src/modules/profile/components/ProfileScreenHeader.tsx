import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  PermissionsAndroid,
  TouchableOpacity,
} from 'react-native';
import { useDiscoverStore } from '../../discover/store/useDiscoverStore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';
import { useProfileStore } from '../store/useProfileStore';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth.store';
import { Settings, Bell } from 'lucide-react-native';
import { useUserPendingRecipes } from '@/hooks/useRecipesQuery';
import PendingRecipesModal from '@/components/PendingRecipesModal';

export default function ProfileScreenHeader({ navigation }: any) {
  const { fetchUserRecipes, userRecipes, fetchUserTotalLikes } = useDiscoverStore();
  const { user, loading, fetchProfile } = useProfileStore();
  const [location, setLocation] = useState<string | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0);

  const [pendingModalVisible, setPendingModalVisible] = useState(false);
  const authUser = useAuthStore(state => state.user);
  const { data: pendingRecipes, isLoading: pendingLoading } =
    useUserPendingRecipes(authUser?.id ?? '');

  useFocusEffect(
    useCallback(() => {
      if (authUser?.id) {
        fetchProfile(authUser.id);
      }
    }, [authUser?.id, fetchProfile]),
  );

  useEffect(() => {
    if (user?.id) {
      fetchUserRecipes(user.id);
      fetchUserTotalLikes(user.id).then(setTotalLikes);
    }
  }, [user, fetchUserRecipes, fetchUserTotalLikes]);

  useEffect(() => {
    const getLocation = async () => {
      let hasPermission = false;
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need your location to show it on your profile.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        hasPermission = auth === 'granted';
      }

      if (!hasPermission) {
        setLocation('Permission denied');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await response.json();
            if (data && data.address) {
              const { city, town, village, state, country } = data.address;
              setLocation(
                [city || town || village, state, country]
                  .filter(Boolean)
                  .join(', '),
              );
            } else {
              setLocation('Unknown location');
            }
          } catch {
            setLocation('Unknown location');
          }
        },
        error => {
          console.error(error);
          setLocation('Could not fetch location');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    };

    getLocation();
  }, []);

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
        {loading ? (
          <ActivityIndicator size="small" color="#9f9f9fff" />
        ) : user ? (
          user.profile_image ? (
            <Image source={{ uri: user.profile_image }} style={styles.avatar} />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>
                {getInitials(user.display_name || user.display_name || 'U')}
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
        {/* <Text style={styles.locationText}>
          {location ? `📍 ${location}` : "Fetching location..."}
        </Text> */}
      </View>
      <View style={styles.divider} />
      <View style={styles.detailsRow}>
        <View style={styles.details}>
          <Text style={styles.count}>{userRecipes.length}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
    padding: 16,
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