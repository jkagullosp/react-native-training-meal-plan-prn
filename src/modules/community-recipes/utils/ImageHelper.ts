import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { supabase } from "../../utils/supabase";
import { decode } from "base64-arraybuffer";

/**
 * Requests camera permission on Android.
 */
async function requestCameraPermission() {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: "Camera Permission",
        message: "App needs camera permission to take photos.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
}

/**
 * Requests photo library permission on Android.
 */
async function requestLibraryPermission() {
  if (Platform.OS === "android") {
    if (Platform.Version >= 33) {
      // Android 13+ (API 33)
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: "Images Permission",
          message: "App needs permission to access your images.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android <13
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs permission to access your photos.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }
  return true;
}

/**
 * Picks an image from device camera or library.
 * Requests necessary permissions before accessing.
 */
export async function pickImageFromDevice(fromCamera = false) {
  if (fromCamera) {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert("Camera permission denied");
      return null;
    }
    const result = await launchCamera({ mediaType: "photo", includeBase64: true });
    return result.assets?.[0] || null;
  } else {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) {
      Alert.alert("Storage permission denied");
      return null;
    }
    const result = await launchImageLibrary({ mediaType: "photo", includeBase64: true });
    return result.assets?.[0] || null;
  }
}

/**
 * Uploads a base64 image asset to Supabase storage.
 * Returns the public URL or null if upload fails.
 */
export async function uploadImageToSupabase(
  userId: string,
  asset: { base64: string; fileName?: string }
) {
  const fileName = `${userId}_${Date.now()}.jpg`;
  const { data, error } = await supabase.storage
    .from("recipe-images")
    .upload(fileName, decode(asset.base64), {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) {
    Alert.alert("Upload failed!");
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("recipe-images")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
}