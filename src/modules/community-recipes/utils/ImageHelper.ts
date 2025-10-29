import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import { Platform, PermissionsAndroid, Alert } from "react-native";
import { supabase } from "../../utils/supabase";
import { decode } from "base64-arraybuffer";

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
    const result = await launchImageLibrary({ mediaType: "photo", includeBase64: true });
    return result.assets?.[0] || null;
  }
}

export async function uploadImageToSupabase(userId: string, asset: { base64: string, fileName?: string }) {
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