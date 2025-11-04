// ...existing code...
import { Platform, PermissionsAndroid } from "react-native";
import messaging from "@react-native-firebase/messaging";
import notifee, { TimestampTrigger, TriggerType } from "@notifee/react-native";
import { supabase } from "../modules/utils/supabase"; // <--- use this path to your supabase client

export async function initNotificationChannel() {
  if (Platform.OS === "android") {
    await notifee.createChannel({
      id: "default",
      name: "Default",
      importance: 4,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      // Android 13+ requires runtime POST_NOTIFICATIONS
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: "Notifications permission",
            message: "Allow the app to send you meal reminder notifications.",
            buttonPositive: "Allow",
            buttonNegative: "Deny",
          }
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
    console.error("requestNotificationPermission error:", err);
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
      console.log("FCM permission not granted");
      return null;
    }

    const token = await messaging().getToken();
    console.log("FCM token:", token);

    if (token && userId) {
      // upsert token into push_tokens table
      await supabase.from("push_tokens").upsert(
        {
          user_id: userId,
          token,
          platform: Platform.OS,
        },
        { onConflict: "token" }
      );
      console.log("Saved token to Supabase");
    }

    messaging().onTokenRefresh(async (newToken) => {
      console.log("FCM token refreshed:", newToken);
      if (newToken && userId) {
        await supabase.from("push_tokens").upsert(
          { user_id: userId, token: newToken, platform: Platform.OS },
          { onConflict: "token" }
        );
      }
    });

    return token;
  } catch (err) {
    console.error("requestAndSaveFcmToken error:", err);
    return null;
  }
}

// scheduleMealReminder / cancelScheduledNotification remain unchanged
export async function scheduleMealReminder(scheduleId: string, mealDate: string, mealType: string, recipeTitle: string) {
  // ...existing code...
}
export async function cancelScheduledNotification(scheduleId: string) {
  // ...existing code...
}
// ...existing code...