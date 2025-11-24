import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export async function requestAppPermissions(): Promise<boolean> {
  let allGranted = true;

  // Notifications
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const notif = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      allGranted = allGranted && notif === PermissionsAndroid.RESULTS.GRANTED;
    }
  } else {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    allGranted = allGranted && enabled;
  }

  // Camera
  if (Platform.OS === 'android') {
    const camera = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    allGranted = allGranted && camera === PermissionsAndroid.RESULTS.GRANTED;
  }

  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const images = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      );
      allGranted = allGranted && images === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const storage = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      allGranted = allGranted && storage === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  return allGranted;
}
