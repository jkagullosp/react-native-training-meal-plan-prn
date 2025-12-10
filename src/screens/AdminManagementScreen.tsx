import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
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

const getStatusBadgeStyle = (status: string) => ({
  backgroundColor:
    status === 'active'
      ? '#e0f7e9'
      : status === 'banned'
      ? '#ffeaea'
      : '#fff6e0',
  borderRadius: 8,
  paddingHorizontal: 10,
  paddingVertical: 4,
  alignSelf: 'flex-start' as 'flex-start',
  marginLeft: 8,
});

const PIcon = ({
  ios,
  android,
  color,
  size,
}: {
  ios: string;
  android: React.ReactNode;
  size: number;
  color: string;
}) =>
  Platform.OS === 'ios' ? (
    <Icon name={ios} size={size} color={color} />
  ) : (
    android
  );

// approximate fixed height used for getItemLayout to improve FlatList perf
const USER_CARD_HEIGHT = 160;

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

  const { mutate: suspendUserMutation } = useSuspendUser();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAllUsers(), refetchRecipesNotPending()]);
    setRefreshing(false);
  }, [refetchAllUsers, refetchRecipesNotPending]);

  const confirm = useCallback(
    ({
      title,
      message,
      actionText,
      destructive,
      onConfirm,
    }: {
      title: string;
      message: string;
      actionText: string;
      destructive?: boolean;
      onConfirm: () => void;
    }) => {
      Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionText,
          style: destructive ? 'destructive' : 'default',
          onPress: onConfirm,
        },
      ]);
    },
    [],
  );

  const handleSuspend = useCallback(
    (userId: string) => {
      Alert.alert(
        'Suspend User',
        'Select suspension duration:',
        [
          ...SUSPEND_OPTIONS.map(opt => ({
            text: opt.label,
            onPress: () => {
              suspendUserMutation(
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
    },
    [suspendUserMutation, refetchAllUsers],
  );

  const handleBan = useCallback(
    (userId: string) =>
      confirm({
        title: 'Ban User',
        message: 'Are you sure you want to ban this user?',
        actionText: 'Ban',
        destructive: true,
        onConfirm: async () => {
          try {
            await adminService.banUser(userId);
            refetchAllUsers();
            Toast.show({ type: 'success', text1: 'User banned!' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to ban user' });
          }
        },
      }),
    [confirm, refetchAllUsers],
  );

  const handleDelete = useCallback(
    (userId: string) =>
      confirm({
        title: 'Delete User',
        message:
          'Are you sure you want to delete this user? This action cannot be undone.',
        actionText: 'Delete',
        destructive: true,
        onConfirm: async () => {
          try {
            await adminService.deleteUser(userId);
            refetchAllUsers();
            Toast.show({ type: 'success', text1: 'User deleted!' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to delete user' });
          }
        },
      }),
    [confirm, refetchAllUsers],
  );

  const handleUnsuspend = useCallback(
    (userId: string) =>
      confirm({
        title: 'Unsuspend User',
        message: 'Are you sure you want to unsuspend this user?',
        actionText: 'Unsuspend',
        onConfirm: async () => {
          try {
            await adminService.unSuspendUser(userId);
            refetchAllUsers();
            Toast.show({ type: 'success', text1: 'User unsuspended!' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to unsuspend user' });
          }
        },
      }),
    [confirm, refetchAllUsers],
  );

  const handleUnban = useCallback(
    (userId: string) =>
      confirm({
        title: 'Unban User',
        message: 'Are you sure you want to unban this user?',
        actionText: 'Unban',
        onConfirm: async () => {
          try {
            await adminService.unBanUser(userId);
            refetchAllUsers();
            Toast.show({ type: 'success', text1: 'User unbanned!' });
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to unban user' });
          }
        },
      }),
    [confirm, refetchAllUsers],
  );

  const renderUser = useCallback(
    ({ item: u }: { item: any }) => {
      const isSuspended =
        u.status === 'suspended' &&
        u.suspended_until &&
        isAfter(parseISO(u.suspended_until), new Date());

      return (
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            <PIcon
              ios="account-circle"
              android={<User size={32} color="#e16235" />}
              size={32}
              color="#e16235"
            />

            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.displayName}>{u.display_name}</Text>
              <Text style={styles.username}>@{u.username}</Text>
            </View>

            <View style={getStatusBadgeStyle(u.status)}>
              <Text style={styles.statusText}>
                {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            {u.status === 'suspended' ? (
              <>
                {isSuspended && (
                  <Text style={styles.suspendTimer}>
                    Suspended for{' '}
                    {formatDistanceToNowStrict(parseISO(u.suspended_until), {
                      addSuffix: true,
                    })}
                  </Text>
                )}

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleUnsuspend(u.id)}
                >
                  <PIcon
                    ios="play-circle"
                    android={<PlayCircle size={22} color="#4caf50" />}
                    size={22}
                    color="#4caf50"
                  />
                  <Text style={[styles.actionText, { color: '#4caf50' }]}>
                    Unsuspend
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleSuspend(u.id)}
              >
                <PIcon
                  ios="pause-circle"
                  android={<PauseCircle size={22} color="#e1a135" />}
                  size={22}
                  color="#e1a135"
                />
                <Text style={styles.actionText}>Suspend</Text>
              </TouchableOpacity>
            )}

            {u.status === 'banned' ? (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleUnban(u.id)}
              >
                <PIcon
                  ios="account-check"
                  android={<UserCheck size={22} color="#4caf50" />}
                  size={22}
                  color="#4caf50"
                />
                <Text style={[styles.actionText, { color: '#4caf50' }]}>
                  Unban
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleBan(u.id)}
              >
                <PIcon
                  ios="block-helper"
                  android={<Ban size={22} color="#e16235" />}
                  size={22}
                  color="#e16235"
                />
                <Text style={styles.actionText}>Ban</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleDelete(u.id)}
            >
              <PIcon
                ios="account-remove"
                android={<UserX size={22} color="#d32f2f" />}
                size={22}
                color="#d32f2f"
              />
              <Text style={styles.actionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [handleSuspend, handleUnsuspend, handleBan, handleUnban, handleDelete],
  );

  if (usersLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E16235" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={allUsers ?? []}
        renderItem={renderUser}
        keyExtractor={(u: any) => u.id}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        // performance tuning
        removeClippedSubviews={true}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={11}
        updateCellsBatchingPeriod={50}
        // getItemLayout assumes fixed user card height to speed scrollToIndex / initial render
        getItemLayout={(_, index) => ({
          length: USER_CARD_HEIGHT,
          offset: USER_CARD_HEIGHT * index,
          index,
        })}
        ListHeaderComponent={
          <>
            <View style={styles.headerContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>
                  Kernel Admin{'\n'}Dashboard
                </Text>

                <TouchableOpacity
                  onPress={signOut}
                  style={styles.logoutButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <PIcon
                    ios="logout"
                    android={<LogOut size={28} color="#E16235" />}
                    size={28}
                    color="#E16235"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.admin}>Admin: {user?.display_name}</Text>

            {/* Stats Grid */}
            <View style={styles.grid}>
              <View style={styles.card}>
                <PIcon
                  ios="account"
                  android={<User size={32} color="#e16235" />}
                  size={32}
                  color="#e16235"
                />
                <Text style={styles.cardNumber}>{allUsers?.length ?? 0}</Text>
                <Text style={styles.cardLabel}>Users</Text>
              </View>

              <View style={styles.card}>
                <PIcon
                  ios="chef-hat"
                  android={<CookingPot size={32} color="#e16235" />}
                  size={32}
                  color="#e16235"
                />
                <Text style={styles.cardNumber}>
                  {recipesNotPending?.length ?? 0}
                </Text>
                <Text style={styles.cardLabel}>Recipes</Text>
              </View>

              <View style={styles.card}>
                <Icon name="star" size={32} color="#e16235" />
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {mostFavoritedRecipe?.title ?? '-'}
                </Text>
                <Text style={styles.cardLabel}>Most Favorited</Text>
              </View>

              <View style={styles.card}>
                <Icon name="heart" size={32} color="#e16235" />
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {mostLikedRecipe?.title ?? '-'}
                </Text>
                <Text style={styles.cardLabel}>Most Liked</Text>
              </View>

              <View style={styles.cardWide}>
                <Icon name="calendar-check" size={32} color="#e16235" />
                <Text style={styles.cardNumber}>
                  {recipesApprovedLast30Days?.length ?? 0}
                </Text>
                <Text style={styles.cardLabel}>Approved (30d)</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Users</Text>
          </>
        }
      />
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
