// ...existing code...
import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';
import { supabase } from '../client/supabase'; // <--- use this path to your supabase client

export async function initNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'default',
      name: 'Default',
      importance: 4,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ requires runtime POST_NOTIFICATIONS
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notifications permission',
            message: 'Allow the app to send you meal reminder notifications.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
      // older Android: permission granted implicitly
      return true;
    } else {
      // iOS: Firebase/messaging permission request (keeps existing flow)
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      return enabled;
    }
  } catch (err) {
    console.error('requestNotificationPermission error:', err);
    return false;
  }
}

// Request permission, get FCM token and upsert into Supabase push_tokens
export async function requestAndSaveFcmToken(userId?: string | null) {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      return null;
    }

    const token = await messaging().getToken();

    if (token && userId) {
      // upsert token into push_tokens table
      await supabase.from('push_tokens').upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
        },
        { onConflict: 'token' },
      );
    }

    messaging().onTokenRefresh(async newToken => {
      if (newToken && userId) {
        await supabase
          .from('push_tokens')
          .upsert(
            { user_id: userId, token: newToken, platform: Platform.OS },
            { onConflict: 'token' },
          );
      }
    });

    return token;
  } catch (err) {
    console.error('requestAndSaveFcmToken error:', err);
    return null;
  }
}

// src/utils/notificationChannel.ts
// ... (keep all your existing code above) ...

// ============ NEW: HYBRID NOTIFICATION SCHEDULING ============

interface ScheduleNotificationParams {
  userId: string;
  mealPlanId: string; // This will be the meal_plans.id
  mealDate: string; // ISO date string
  mealType: string; // breakfast, lunch, dinner, snack
  recipeTitle: string;
  notificationHoursBefore?: number; // Default 2 hours before meal
}

/**
 * Hybrid notification scheduler:
 * 1. Schedules local notification (fallback)
 * 2. Stores in database for backend FCM delivery
 */
export async function scheduleHybridMealNotification({
  userId,
  mealPlanId,
  mealDate,
  mealType,
  recipeTitle,
  notificationHoursBefore = 2,
}: ScheduleNotificationParams) {
  try {
    const mealDateTime = new Date(mealDate);

    // Calculate notification time
    // For breakfast: notify at 10PM the day before
    // For lunch/dinner: notify 2 hours before
    let notificationTime = new Date(mealDateTime);

    if (mealType === 'breakfast') {
      // Notify at 10PM the day before
      notificationTime.setDate(notificationTime.getDate() - 1);
      notificationTime.setHours(22, 0, 0, 0);
    } else {
      // Notify X hours before the meal
      notificationTime.setHours(
        notificationTime.getHours() - notificationHoursBefore,
      );
    }

    // Skip if notification time is in the past
    if (notificationTime.getTime() < Date.now()) {
      return { success: false, reason: 'past_time' };
    }

    // 1. FALLBACK: Schedule local notification with Notifee
    const localNotificationId = await scheduleLocalNotification({
      mealPlanId,
      notificationTime,
      mealType,
      recipeTitle,
    });

    // 2. BACKEND: Store in database for FCM delivery
    const { data, error } = await supabase
      .from('scheduled_meal_notifications')
      .insert({
        user_id: userId,
        meal_schedule_id: mealPlanId,
        notification_time: notificationTime.toISOString(),
        meal_date: mealDate,
        meal_type: mealType,
        recipe_title: recipeTitle,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store notification in DB:', error);
      // Local notification still works as fallback
    }

    return {
      success: true,
      localNotificationId,
      dbRecordId: data?.id,
      scheduledFor: notificationTime.toISOString(),
    };
  } catch (err) {
    console.error('scheduleHybridMealNotification error:', err);
    return { success: false, error: err };
  }
}

/**
 * Schedule local notification using Notifee
 */
async function scheduleLocalNotification({
  mealPlanId,
  notificationTime,
  mealType,
  recipeTitle,
}: {
  mealPlanId: string;
  notificationTime: Date;
  mealType: string;
  recipeTitle: string;
}) {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: notificationTime.getTime(),
  };

  const mealEmoji =
    {
      breakfast: '🌅',
      lunch: '🌞',
      dinner: '🌙',
      snack: '🍪',
    }[mealType] || '🍽️';

  const notificationId = await notifee.createTriggerNotification(
    {
      id: `meal-${mealPlanId}`,
      title: `${mealEmoji} Upcoming ${
        mealType.charAt(0).toUpperCase() + mealType.slice(1)
      }`,
      body: `Don't forget: ${recipeTitle}`,
      android: {
        channelId: 'default',
        smallIcon: 'ic_notification',
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
      data: {
        mealPlanId,
        mealType,
        type: 'meal_reminder',
      },
    },
    trigger,
  );
  return notificationId;
}

/**
 * Cancel both local and backend notifications
 */
export async function cancelHybridNotification(
  mealPlanId: string,
  userId: string,
) {
  try {
    // 1. Cancel local notification
    await notifee.cancelNotification(`meal-${mealPlanId}`);

    // 2. Mark as sent in database (so backend won't send it)
    await supabase
      .from('scheduled_meal_notifications')
      .update({ sent: true })
      .eq('meal_schedule_id', mealPlanId)
      .eq('user_id', userId)
      .eq('sent', false); // Only update unsent ones

    return { success: true };
  } catch (err) {
    console.error('cancelHybridNotification error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get all scheduled local notifications (for debugging)
 */
export async function getScheduledNotifications() {
  const notifications = await notifee.getTriggerNotifications();
  return notifications;
}

export function registerForegroundMessageHandler() {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    try {
      const notification = {
        title: remoteMessage.notification?.title ?? 'Meal Reminder',
        body: remoteMessage.notification?.body ?? '',
        android: {
          channelId: 'default',
          //smallIcon: 'ic_notification',
          pressAction: { id: 'default' },
        },
        ios: {
          sound: 'default',
        },
        data: remoteMessage.data,
      };

      await notifee.displayNotification(notification);
    } catch (error) {
      console.error('❌ Notifee display error:', error);
    }
  });

  return unsubscribe;
}
