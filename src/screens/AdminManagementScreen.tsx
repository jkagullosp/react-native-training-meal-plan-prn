import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  ViewStyle,
  Alert,
} from 'react-native';
import { formatDistanceToNowStrict, parseISO, isAfter } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth.store';
import {
  LogOut,
  User,
  CookingPot,
  Ban,
  UserX,
  PauseCircle,
  PlayCircle,
  UserCheck,
} from 'lucide-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  useAllUsers,
  useFetchAllRecipesNotPending,
  useMostFavoritedRecipe,
  useMostLikedRecipe,
  useRecipesApprovedLast30Days,
  useSuspendUser,
} from '@/hooks/useAdminQuery';
import { adminService } from '@/services/adminService';
import Toast from 'react-native-toast-message';

const CARD_GAP = 16;
const CARD_COLUMNS = 2;
const CARD_WIDTH =
  (Dimensions.get('window').width - 40 - CARD_GAP * (CARD_COLUMNS - 1)) /
  CARD_COLUMNS;

const SUSPEND_OPTIONS = [
  { label: '1 hour', ms: 1 * 60 * 60 * 1000 },
  { label: '12 hours', ms: 12 * 60 * 60 * 1000 },
  { label: '1 day', ms: 24 * 60 * 60 * 1000 },
];

const statusBadge = (status: string): ViewStyle => ({
  backgroundColor:
    status === 'active'
      ? '#e0f7e9'
      : status === 'banned'
      ? '#ffeaea'
      : '#fff6e0',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
  alignSelf: 'flex-start',
  marginLeft: 8,
});

export default function AdminManagementScreen() {
  const { user, signOut } = useAuthStore();
  const {
    data: allUsers,
    isLoading: usersLoading,
    refetch: refetchAllUsers,
  } = useAllUsers();

  const { data: recipesNotPending, refetch: refetchRecipesNotPending } =
    useFetchAllRecipesNotPending();
  const { data: mostFavoritedRecipe } = useMostFavoritedRecipe();
  const { data: mostLikedRecipe } = useMostLikedRecipe();
  const { data: recipesApprovedLast30Days } = useRecipesApprovedLast30Days();

  const { mutate: suspendUser } = useSuspendUser();

  const [refreshing, setRefreshing] = useState(false);

  const usersCount = allUsers?.length ?? 0;
  const recipeCount = recipesNotPending?.length ?? 0;
  const recipesApprovedCount = recipesApprovedLast30Days?.length ?? 0;

  const handleSignOut = async () => {
    await signOut();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAllUsers(), refetchRecipesNotPending()]);
    setRefreshing(false);
  };

  const handleSuspend = (userId: string) => {
    Alert.alert(
      'Suspend User',
      'Select suspension duration:',
      [
        ...SUSPEND_OPTIONS.map(opt => ({
          text: opt.label,
          onPress: () => {
            suspendUser(
              { userId, durationMs: opt.ms },
              {
                onSuccess: () => {
                  refetchAllUsers();
                  Toast.show({
                    type: 'success',
                    text1: 'User suspended!',
                    text2: `Suspended for ${opt.label}.`,
                  });
                },
                onError: () => {
                  Toast.show({
                    type: 'error',
                    text1: 'Failed to suspend user',
                  });
                },
              },
            );
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const handleBan = (userId: string) => {
    Alert.alert('Ban User', 'Are you sure you want to ban this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Ban',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.banUser(userId);
            refetchAllUsers();
            Toast.show({
              type: 'success',
              text1: 'User banned!',
            });
          } catch {
            Toast.show({
              type: 'error',
              text1: 'Failed to ban user',
            });
          }
        },
      },
    ]);
  };

  const handleDelete = (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(userId);
              refetchAllUsers();
              Toast.show({
                type: 'success',
                text1: 'User deleted!',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Failed to delete user',
              });
            }
          },
        },
      ],
    );
  };

  const handleUnsuspend = (userId: string) => {
    Alert.alert(
      'Unsuspend User',
      'Are you sure you want to unsuspend this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unsuspend',
          style: 'default',
          onPress: async () => {
            try {
              await adminService.unSuspendUser(userId);
              refetchAllUsers();
              Toast.show({
                type: 'success',
                text1: 'User unsuspended!',
              });
            } catch {
              Toast.show({
                type: 'error',
                text1: 'Failed to unsuspend user',
              });
            }
          },
        },
      ],
    );
  };

  const handleUnban = (userId: string) => {
    Alert.alert('Unban User', 'Are you sure you want to unban this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unban',
        style: 'default',
        onPress: async () => {
          try {
            await adminService.unBanUser(userId);
            refetchAllUsers();
            Toast.show({
              type: 'success',
              text1: 'User unbanned!',
            });
          } catch {
            Toast.show({
              type: 'error',
              text1: 'Failed to unban user',
            });
          }
        },
      },
    ]);
  };

  if (usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E16235" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Kernel Admin{'\n'}Dashboard</Text>
            {Platform.OS === 'ios' ? (
              <TouchableOpacity
                onPress={handleSignOut}
                style={styles.logoutButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="logout" size={28} color="#E16235" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSignOut}
                style={styles.logoutButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <LogOut size={28} color="#E16235" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <Text style={styles.admin}>Admin: {user?.display_name}</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            {Platform.OS === 'ios' ? (
              <Icon name="account" size={32} color="#e16235" />
            ) : (
              <User size={32} color="#e16235" />
            )}
            <Text style={styles.cardNumber}>{usersCount}</Text>
            <Text style={styles.cardLabel}>Users</Text>
          </View>
          <View style={styles.card}>
            {Platform.OS === 'ios' ? (
              <Icon name="chef-hat" size={32} color="#e16235" />
            ) : (
              <CookingPot size={32} color="#e16235" />
            )}
            <Text style={styles.cardNumber}>{recipeCount}</Text>
            <Text style={styles.cardLabel}>Recipes</Text>
          </View>
          <View style={styles.card}>
            <Icon name="star" size={32} color="#e16235" />
            <Text
              style={styles.cardTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {mostFavoritedRecipe?.title ?? '-'}
            </Text>
            <Text style={styles.cardLabel}>Most Favorited</Text>
          </View>
          <View style={styles.card}>
            <Icon name="heart" size={32} color="#e16235" />
            <Text
              style={styles.cardTitle}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {mostLikedRecipe?.title ?? '-'}
            </Text>
            <Text style={styles.cardLabel}>Most Liked</Text>
          </View>
          <View style={styles.cardWide}>
            <Icon name="calendar-check" size={32} color="#e16235" />
            <Text style={styles.cardNumber}>{recipesApprovedCount}</Text>
            <Text style={styles.cardLabel}>Approved (30d)</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Users</Text>
        <View style={styles.userGrid}>
          {allUsers?.map(users => (
            <View key={users.id} style={styles.userCard}>
              <View style={styles.userInfoRow}>
                {Platform.OS === 'ios' ? (
                  <Icon name="account-circle" size={32} color="#e16235" />
                ) : (
                  <View>
                    <User size={32} color="#e16235" />
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.displayName}>{users.display_name}</Text>
                  <Text style={styles.username}>@{users.username}</Text>
                </View>
                <View style={statusBadge(users.status)}>
                  <Text style={styles.statusText}>
                    {users.status.charAt(0).toUpperCase() +
                      users.status.slice(1)}
                  </Text>
                </View>
              </View>
              <View style={styles.actionRow}>
                {users.status === 'suspended' ? (
                  <>
                    {users.suspended_until &&
                      isAfter(parseISO(users.suspended_until), new Date()) && (
                        <Text style={styles.suspendTimer}>
                          Suspended for{' '}
                          {formatDistanceToNowStrict(
                            parseISO(users.suspended_until),
                            { addSuffix: true },
                          )}
                        </Text>
                      )}
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleUnsuspend(users.id)}
                    >
                      {Platform.OS === 'ios' ? (
                        <Icon name="play-circle" size={22} color="#4caf50" />
                      ) : (
                        <View>
                          <PlayCircle size={22} color="#4caf50" />
                        </View>
                      )}
                      <Text style={[styles.actionText, { color: '#4caf50' }]}>
                        Unsuspend
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleSuspend(users.id)}
                  >
                    {Platform.OS === 'ios' ? (
                      <Icon name="pause-circle" size={22} color="#e1a135" />
                    ) : (
                      <View>
                        <PauseCircle size={22} color="#e1a135" />
                      </View>
                    )}
                    <Text style={styles.actionText}>Suspend</Text>
                  </TouchableOpacity>
                )}
                {users.status === 'banned' ? (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleUnban(users.id)}
                  >
                    {Platform.OS === 'ios' ? (
                      <Icon name="account-check" size={22} color="#4caf50" />
                    ) : (
                      <View>
                        <UserCheck size={22} color="#4caf50" />
                      </View>
                    )}
                    <Text style={[styles.actionText, { color: '#4caf50' }]}>
                      Unban
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleBan(users.id)}
                  >
                    {Platform.OS === 'ios' ? (
                      <Icon name="block-helper" size={22} color="#e16235" />
                    ) : (
                      <View>
                        <Ban size={22} color="#e16235" />
                      </View>
                    )}
                    <Text style={styles.actionText}>Ban</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(users.id)}
                >
                  {Platform.OS === 'ios' ? (
                    <Icon name="account-remove" size={22} color="#d32f2f" />
                  ) : (
                    <View>
                      <UserX size={22} color="#d32f2f" />
                    </View>
                  )}
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#222',
    letterSpacing: 0.2,
    flex: 1,
    lineHeight: 34,
  },
  logoutButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  admin: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 24,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: CARD_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWide: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: 'center',
    marginBottom: CARD_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E16235',
    marginTop: 8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E16235',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
    maxWidth: '90%',
  },
  cardLabel: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 32,
    marginBottom: 12,
    color: '#222',
    marginLeft: 4,
  },
  userGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  displayName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  email: {
    fontSize: 13,
    color: '#888',
    marginLeft: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#444',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 4,
    marginTop: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    color: '#444',
  },
  suspendTimer: {
    fontSize: 13,
    color: '#e1a135',
    fontWeight: '600',
    marginRight: 8,
  },
});
